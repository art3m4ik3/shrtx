"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { getUrlAnalytics, getUrlIdByCode } from "@/lib/actions";
import { BarChart } from "@/components/ui/chart";
import { useUrlTokens } from "@/hooks/use-url-tokens";

interface UrlAnalyticsProps {
    code: string;
}

interface AnalyticsData {
    url: {
        shortCode: string;
        targetUrl: string;
        createdAt: string;
        clicks: number;
        expiry: {
            type: "date" | "clicks";
            value: string | number;
        } | null;
    };
    clicksByDay: {
        date: string;
        count: number;
    }[];
    referrers: {
        source: string;
        count: number;
    }[];
    browsers: {
        name: string;
        count: number;
    }[];
    countries: {
        name: string;
        count: number;
    }[];
}

export function UrlAnalytics({ code }: UrlAnalyticsProps) {
    const { toast } = useToast();
    const { tokens } = useUrlTokens();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const { id: urlId } = await getUrlIdByCode(code);
                
                const urlToken = tokens[urlId];

                if (!urlToken) {
                    setError("Unauthorized");
                    setIsAuthorized(false);
                    return;
                }

                const data = await getUrlAnalytics(code, urlToken);
                setAnalytics(data);
                setError(null);
                setIsAuthorized(true);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Could not load analytics for this URL";
                setError(message);
                
                if (message === "Unauthorized") {
                    setIsAuthorized(false);
                }
                
                toast({
                    title: "Error",
                    description: message,
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchAnalytics();
    }, [code, toast, tokens]);

    if (error === "URL not found") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>URL Not Found</CardTitle>
                    <CardDescription>
                        The requested URL does not exist or has been deleted
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (error === "Unauthorized" || !isAuthorized) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>
                        You do not have permission to view analytics for this URL
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!analytics) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No data available</CardTitle>
                    <CardDescription>
                        We couldn&apos;t find any analytics data for this URL
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const clicksData = {
        labels: analytics.clicksByDay.map((item) =>
            format(new Date(item.date), "MMM d")
        ),
        datasets: [
            {
                label: "Clicks",
                data: analytics.clicksByDay.map((item) => item.count),
                backgroundColor: "rgba(99, 102, 241, 0.5)",
                borderColor: "rgb(99, 102, 241)",
                borderWidth: 1,
            },
        ],
    };

    const referrersData = {
        labels: analytics.referrers.map((item) => item.source || "Direct"),
        datasets: [
            {
                label: "Referrers",
                data: analytics.referrers.map((item) => item.count),
                backgroundColor: [
                    "rgba(255, 99, 132, 0.5)",
                    "rgba(54, 162, 235, 0.5)",
                    "rgba(255, 206, 86, 0.5)",
                    "rgba(75, 192, 192, 0.5)",
                    "rgba(153, 102, 255, 0.5)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    const browsersData = {
        labels: analytics.browsers.map((item) => item.name),
        datasets: [
            {
                label: "Browsers",
                data: analytics.browsers.map((item) => item.count),
                backgroundColor: [
                    "rgba(255, 159, 64, 0.5)",
                    "rgba(255, 99, 132, 0.5)",
                    "rgba(54, 162, 235, 0.5)",
                    "rgba(75, 192, 192, 0.5)",
                ],
                borderColor: [
                    "rgba(255, 159, 64, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(75, 192, 192, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    function getExpiryLabel(expiry: AnalyticsData["url"]["expiry"]) {
        if (!expiry) return "Never";
        
        if (expiry.type === "date" && typeof expiry.value === "string") {
            return `Expires on ${format(
                new Date(expiry.value),
                "PPP"
            )}`;
        }

        if (expiry.type === "clicks" && typeof expiry.value === "number") {
            return `Expires after ${expiry.value} clicks (${
                analytics!.url.clicks
            }/${expiry.value} used)`;
        }

        return "Never";
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Clicks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics.url.clicks}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Since{" "}
                            {format(
                                new Date(analytics.url.createdAt),
                                "MMM d, yyyy"
                            )}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Expiration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium">
                            {getExpiryLabel(analytics.url.expiry)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Top Referrer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics.referrers[0]?.source || "Direct"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.referrers[0]?.count || 0} clicks
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Top Browser
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics.browsers[0]?.name || "Unknown"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.browsers[0]?.count || 0} clicks
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="clicks">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="clicks">Clicks Over Time</TabsTrigger>
                    <TabsTrigger value="referrers">Top Referrers</TabsTrigger>
                    <TabsTrigger value="browsers">Browsers</TabsTrigger>
                </TabsList>
                <TabsContent value="clicks">
                    <Card>
                        <CardHeader>
                            <CardTitle>Clicks Over Time</CardTitle>
                            <CardDescription>
                                Number of clicks your link received over the
                                past 30 days
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px]">
                                <BarChart
                                    data={clicksData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    precision: 0,
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="referrers">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Referrers</CardTitle>
                            <CardDescription>
                                Websites that sent traffic to your shortened URL
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px]">
                                <BarChart
                                    data={referrersData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        indexAxis: "y",
                                        scales: {
                                            x: {
                                                beginAtZero: true,
                                                ticks: {
                                                    precision: 0,
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="browsers">
                    <Card>
                        <CardHeader>
                            <CardTitle>Browsers</CardTitle>
                            <CardDescription>
                                Browsers used to access your shortened URL
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px]">
                                <BarChart
                                    data={browsersData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        indexAxis: "y",
                                        scales: {
                                            x: {
                                                beginAtZero: true,
                                                ticks: {
                                                    precision: 0,
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
