import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Suspense } from "react";
import { Metrika } from "@/components/metrika";

export const metadata: Metadata = {
    title: "Shrtx - Link Shortener",
    description: "Shrtx - Modern Link Shortener",
    keywords: ["link", "shortener", "shrtx", "tinylink", "short", "links", "link shortener", "bit.ly", "adf.ly", "art3m4ik3", "modern", "minimal", "ll-u"],
    authors: [{ name: "art3m4ik3", url: "https://ll-u.pro" }],
    robots: { index: true, follow: true }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <GoogleAnalytics gaId="G-H93KMV215X" />
                    <Suspense>
                        <Metrika />
                    </Suspense>
                </ThemeProvider>
            </body>
        </html>
    );
}
