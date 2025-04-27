"use client";

import { LinkIcon } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
    return (
        <header className="px-4 lg:px-6 h-14 flex items-center">
            <Link className="flex items-center justify-center" href="/">
                <LinkIcon className="h-6 w-6 mr-2" />
                <span className="font-bold">Shrtx</span>
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
                <Link
                    className="text-sm font-medium hover:underline underline-offset-4"
                    href="/"
                >
                    Home
                </Link>
                <Link
                    className="text-sm font-medium hover:underline underline-offset-4"
                    href="/dashboard"
                >
                    Dashboard
                </Link>
                <ThemeToggle />
            </nav>
        </header>
    );
}