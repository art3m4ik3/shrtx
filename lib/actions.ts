"use server";

import { connectToDatabase } from "./mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { generateUrlToken, verifyUrlToken } from "./jwt";

function generateShortCode(length: number) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

interface CreateShortUrlParams {
    targetUrl: string;
    customAlias?: string;
    urlLength?: number;
    expiry?: {
        type: "date" | "clicks";
        value: string | number;
    } | null;
}

export async function createShortUrl({
    targetUrl,
    customAlias = "",
    urlLength = 6,
    expiry = null,
}: CreateShortUrlParams) {
    if (!targetUrl) {
        throw new Error("Target URL is required");
    }

    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        targetUrl = "https://" + targetUrl;
    }

    try {
        const { db } = await connectToDatabase();
        const collection = db.collection("urls");

        let shortCode = customAlias;

        if (!shortCode) {
            shortCode = generateShortCode(urlLength);

            let isUnique = false;
            let attempts = 0;

            while (!isUnique && attempts < 5) {
                const existing = await collection.findOne({ shortCode });
                if (!existing) {
                    isUnique = true;
                } else {
                    shortCode = generateShortCode(urlLength);
                    attempts++;
                }
            }

            if (!isUnique) {
                throw new Error(
                    "Could not generate a unique short code. Please try again."
                );
            }
        } else {
            const existing = await collection.findOne({ shortCode });
            if (existing) {
                throw new Error(
                    "This custom alias is already in use. Please choose another one."
                );
            }
        }

        const urlDoc = {
            shortCode,
            targetUrl,
            createdAt: new Date(),
            clicks: 0,
            expiry,
        };

        const result = await collection.insertOne(urlDoc);

        if (!result.acknowledged) {
            throw new Error("Failed to create shortened URL");
        }

        const urlId = result.insertedId.toString();
        const token = generateUrlToken(urlId);

        revalidatePath("/dashboard");

        return {
            shortCode,
            _id: urlId,
            token,
        };
    } catch (error) {
        throw error;
    }
}

export async function getUrls(token?: string) {
    try {
        if (!token) {
            return [];
        }

        const decoded = verifyUrlToken(token);
        if (!decoded) {
            return [];
        }

        const { db } = await connectToDatabase();
        const collection = db.collection("urls");

        const url = await collection.findOne({
            _id: new ObjectId(decoded.urlId),
        });

        if (!url) {
            return [];
        }

        return JSON.parse(JSON.stringify([url]));
    } catch {
        return [];
    }
}

export async function deleteUrl(id: string, token: string) {
    try {
        const decoded = verifyUrlToken(token);
        if (!decoded) {
            throw new Error("Unauthorized");
        }

        const urlIdToDelete = decoded.urlId;

        const { db } = await connectToDatabase();
        const urlCollection = db.collection("urls");
        const analyticsCollection = db.collection<AnalyticsEntry>("analytics");

        const result = await urlCollection.deleteOne({ _id: new ObjectId(urlIdToDelete) });

        if (result.deletedCount === 0) {
            throw new Error("URL not found or already deleted");
        }

        await analyticsCollection.deleteMany({ urlId: new ObjectId(urlIdToDelete) });

        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        throw error;
    }
}

interface AnalyticsEntry {
    urlId: ObjectId;
    timestamp: Date;
    referrer: string | null;
    browser: string;
}

export interface ChartDataPoint {
    date: string;
    count: number;
}

export interface ReferrerData {
    source: string;
    count: number;
}

export interface BrowserData {
    name: string;
    count: number;
}

export async function getUrlIdByCode(code: string) {
    try {
        const { db } = await connectToDatabase();
        const urlCollection = db.collection("urls");

        const url = await urlCollection.findOne({ shortCode: code });
        if (!url) {
            throw new Error("URL not found");
        }

        return { id: url._id.toString() };
    } catch (error) {
        throw error;
    }
}

export async function getUrlAnalytics(code: string, token?: string) {
    try {
        if (!token) {
            throw new Error("Unauthorized");
        }

        const decoded = verifyUrlToken(token);
        if (!decoded) {
            throw new Error("Unauthorized");
        }

        const { db } = await connectToDatabase();
        const urlCollection = db.collection("urls");

        const url = await urlCollection.findOne({ shortCode: code });
        if (!url) {
            throw new Error("URL not found");
        }

        if (decoded.urlId !== url._id.toString()) {
            throw new Error("Unauthorized");
        }

        if (url.expiry) {
            if (typeof url.expiry.type === 'string') {
                if (url.expiry.type !== "date" && url.expiry.type !== "clicks") {
                    url.expiry = null;
                }
            } else {
                url.expiry = null;
            }
        }

        const analyticsCollection = db.collection<AnalyticsEntry>("analytics");

        const analytics = await analyticsCollection
            .find({ urlId: new ObjectId(url._id) })
            .toArray();

        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

        const clicksByDay: Record<string, number> = {};
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split("T")[0];
            clicksByDay[dateString] = 0;
        }

        analytics.forEach((entry: AnalyticsEntry) => {
            const date = new Date(entry.timestamp);
            if (date >= thirtyDaysAgo) {
                const dateString = date.toISOString().split("T")[0];
                clicksByDay[dateString] = (clicksByDay[dateString] || 0) + 1;
            }
        });

        const clicksByDayArray = Object.entries(clicksByDay)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const referrerCounts: Record<string, number> = {};
        analytics.forEach((entry: AnalyticsEntry) => {
            const referrer = entry.referrer
                ? new URL(entry.referrer).hostname
                : "Direct";
            referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
        });

        const referrers = Object.entries(referrerCounts)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const browserCounts: Record<string, number> = {};
        analytics.forEach((entry: AnalyticsEntry) => {
            browserCounts[entry.browser] =
                (browserCounts[entry.browser] || 0) + 1;
        });

        const browsers = Object.entries(browserCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        return {
            url: JSON.parse(JSON.stringify(url)),
            clicksByDay: clicksByDayArray,
            referrers,
            browsers,
            countries: [],
        };
    } catch (error) {
        throw error;
    }
}
