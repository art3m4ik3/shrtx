"use client";

import { useState, useEffect } from "react";
import { BarChart3, ExternalLink, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getUrls, deleteUrl } from "@/lib/actions";
import { useUrlTokens } from "@/hooks/use-url-tokens";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ShortUrl {
    _id: string;
    shortCode: string;
    targetUrl: string;
    createdAt: string;
    clicks: number;
    expiry: {
        type: "date" | "clicks";
        value: string | number;
    } | null;
    token?: string;
}

export function UrlDashboard() {
    const { toast } = useToast();
    const [urls, setUrls] = useState<ShortUrl[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { tokens, saveToken } = useUrlTokens();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [urlToDelete, setUrlToDelete] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUrls() {
            try {
                const urlPromises = Object.values(tokens).map((token) =>
                    getUrls(token)
                );
                const urlArrays = await Promise.all(urlPromises);
                const allUrls = urlArrays.flat();
                setUrls(allUrls);
            } catch {
                toast({
                    title: "Error fetching URLs",
                    description: "Could not load your shortened URLs",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        }

        fetchUrls();
    }, [tokens, toast]);

    function confirmDelete(id: string) {
        setUrlToDelete(id);
        setDeleteDialogOpen(true);
    }

    async function handleDelete() {
        if (!urlToDelete) return;

        try {
            const token = tokens[urlToDelete];
            if (!token) {
                throw new Error("No access token found");
            }

            await deleteUrl(urlToDelete, token);
            
            const urlIdToRemove = urlToDelete;
            setUrls((prev) => prev.filter((url) => url._id !== urlIdToRemove));
            
            saveToken(urlToDelete, ""); 
            
            toast({
                title: "URL deleted",
                description: "The shortened URL has been deleted successfully",
            });
        } catch (error) {
            toast({
                title: "Error deleting URL",
                description: typeof error === 'object' && error !== null && 'message' in error
                    ? String(error.message)
                    : "Could not delete the shortened URL",
                variant: "destructive",
            });
        } finally {
            setUrlToDelete(null);
            setDeleteDialogOpen(false);
        }
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString();
    }

    function getExpiryLabel(expiry: ShortUrl["expiry"]) {
        if (!expiry) return "Never";

        if (expiry.type === "date" && typeof expiry.value === "string") {
            return `Expires on ${formatDate(expiry.value)}`;
        }

        if (expiry.type === "clicks" && typeof expiry.value === "number") {
            return `Expires after ${expiry.value} clicks`;
        }

        return "Never";
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (urls.length === 0) {
        return (
            <Card className="p-6 text-center">
                <h3 className="text-lg font-medium mb-2">No URLs found</h3>
                <p className="text-muted-foreground mb-4">
                    You haven&apos;t created any shortened URLs yet.
                </p>
                <Button asChild>
                    <Link href="/">Create your first short URL</Link>
                </Button>
            </Card>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Short URL</TableHead>
                                <TableHead>Original URL</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Clicks</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {urls.map((url) => (
                                <TableRow key={url._id}>
                                    <TableCell className="font-medium">
                                        <Link
                                            href={`/${url.shortCode}`}
                                            target="_blank"
                                            className="flex items-center hover:underline"
                                        >
                                            {url.shortCode}
                                            <ExternalLink className="ml-1 h-3 w-3" />
                                        </Link>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {url.targetUrl}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(url.createdAt)}
                                    </TableCell>
                                    <TableCell>{url.clicks}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {getExpiryLabel(url.expiry)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={`/analytics/${url.shortCode}`}
                                                >
                                                    <BarChart3 className="h-4 w-4" />
                                                    <span className="sr-only">
                                                        Analytics
                                                    </span>
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => confirmDelete(url._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">
                                                    Delete
                                                </span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            shortened URL and remove it from your dashboard.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
