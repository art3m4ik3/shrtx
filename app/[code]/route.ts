import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;

    try {
        const { db } = await connectToDatabase();
        const urlCollection = db.collection("urls");
        const analyticsCollection = db.collection("analytics");

        const url = await urlCollection.findOne({ shortCode: code });

        if (!url) {
            return new NextResponse("URL not found", { status: 404 });
        }

        if (url.expiry) {
            if (
                url.expiry.type === "date" &&
                new Date(url.expiry.value) < new Date()
            ) {
                return new NextResponse("URL has expired", { status: 410 });
            }

            if (
                url.expiry.type === "clicks" &&
                url.clicks >= url.expiry.value
            ) {
                return new NextResponse("URL has reached its click limit", {
                    status: 410,
                });
            }
        }

        const userAgent = request.headers.get("user-agent") || "";
        const referrer = request.headers.get("referer") || "";
        const ip = request.headers.get("x-forwarded-for") || "";

        let browser = "Unknown";
        if (userAgent.includes("Chrome")) browser = "Chrome";
        else if (userAgent.includes("Firefox")) browser = "Firefox";
        else if (userAgent.includes("Safari")) browser = "Safari";
        else if (userAgent.includes("Edge")) browser = "Edge";
        else if (userAgent.includes("MSIE") || userAgent.includes("Trident"))
            browser = "Internet Explorer";

        await urlCollection.updateOne(
            { _id: new ObjectId(url._id) },
            { $inc: { clicks: 1 } }
        );

        await analyticsCollection.insertOne({
            urlId: new ObjectId(url._id),
            timestamp: new Date(),
            referrer,
            userAgent,
            browser,
            ip,
        });

        return NextResponse.redirect(url.targetUrl);
    } catch {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
