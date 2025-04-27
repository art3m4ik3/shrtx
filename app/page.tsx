import type { Metadata } from "next";
import { ShortenUrlForm } from "@/components/shorten-url-form";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
    title: "Shrtx - Modern URL Shortener",
    description: "A minimalist, modern URL shortening service",
};

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                    <section className="w-full py-12 md:py-24 lg:py-32">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                    Shorten Your URLs
                                </h1>
                                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                                    Create custom, trackable short links with
                                    expiration options
                                </p>
                            </div>
                            <div className="w-full max-w-lg space-y-2">
                                <ShortenUrlForm />
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
