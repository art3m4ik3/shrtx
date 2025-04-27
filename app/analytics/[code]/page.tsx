import type { Metadata } from "next";
import { UrlAnalytics } from "@/components/url-analytics";
import { notFound } from "next/navigation";
import { getUrlIdByCode } from "@/lib/actions";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Analytics - Shrtx",
    description: "View analytics for your shortened URL",
};

export default async function AnalyticsPage({
    params,
}: {
    params: { code: string };
}) {
    const { code } = await params;

    if (!code) {
        notFound();
    }

    try {
        await getUrlIdByCode(code);
    } catch (error) {
        if (error instanceof Error && error.message === "URL not found") {
            notFound();
        }
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <section className="w-full py-12 md:py-24 lg:py-32">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                    URL Analytics
                                </h1>
                                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                                    Detailed statistics for your shortened URL
                                </p>
                            </div>
                            <div className="w-full max-w-6xl mx-auto">
                                <UrlAnalytics code={code} />
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
