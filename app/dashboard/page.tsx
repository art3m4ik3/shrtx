import type { Metadata } from "next";
import { UrlDashboard } from "@/components/url-dashboard";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Dashboard - Shrtx",
    description: "Manage your shortened URLs",
};

export default function DashboardPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container mx-auto max-w-7xl px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                    Your Shortened URLs
                                </h1>
                                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                                    Manage and track all your shortened links
                                </p>
                            </div>
                            <div className="w-full max-w-6xl mx-auto">
                                <UrlDashboard />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
