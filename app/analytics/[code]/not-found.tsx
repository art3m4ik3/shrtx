import Link from "next/link";
import { LinkIcon } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="px-4 lg:px-6 h-14 flex items-center">
                <Link className="flex items-center justify-center" href="/">
                    <LinkIcon className="h-6 w-6 mr-2" />
                    <span className="font-bold">Shrtx</span>
                </Link>
            </header>
            <main className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">URL Not Found</h2>
                    <p className="text-muted-foreground mb-4">
                        The URL you&apos;re looking for analytics doesn&apos;t exist or has been deleted.
                    </p>
                    <Link
                        href="/"
                        className="text-primary hover:underline"
                    >
                        Return to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}
