"use client";

import Link from "next/link";

import type React from "react";

import { useState } from "react";
import { CalendarIcon, Copy, Loader2, Check } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { createShortUrl } from "@/lib/actions";
import { useToast } from "@/components/ui/use-toast";
import { useUrlTokens } from "@/hooks/use-url-tokens";

export function ShortenUrlForm() {
    const { toast } = useToast();
    const { saveToken } = useUrlTokens();
    const [isLoading, setIsLoading] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [shortUrl, setShortUrl] = useState("");
    const [expiryType, setExpiryType] = useState("none");
    const [date, setDate] = useState<Date>();
    const [clickLimit, setClickLimit] = useState("10");
    const [customAlias, setCustomAlias] = useState(false);
    const [urlLength, setUrlLength] = useState("6");
    const [isCopied, setIsCopied] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const targetUrl = formData.get("url") as string;
        const alias = customAlias ? (formData.get("alias") as string) : "";

        let expiry = null;
        if (expiryType === "date" && date) {
            expiry = { type: "date", value: date.toISOString() };
        } else if (expiryType === "clicks") {
            expiry = { type: "clicks", value: Number.parseInt(clickLimit) };
        }

        try {
            const result = await createShortUrl({
                targetUrl,
                customAlias: alias,
                urlLength: Number.parseInt(urlLength),
                // @ts-expect-error doesn't see the types
                expiry,
            });

            saveToken(result._id, result.token);

            setShortUrl(`${window.location.origin}/${result.shortCode}`);
            setShowResult(true);
            toast({
                title: "URL shortened successfully",
                description: "Your short URL is ready to use",
            });
        } catch (error) {
            let title = "Error shortening URL";
            let description = error instanceof Error ? error.message : "An unknown error occurred";

            if (error instanceof Error && error.message.includes("custom alias is already in use")) {
                title = "Custom alias is already in use";
                description = "This short URL is already in use. Please, select another one.";
            }

            toast({
                title: title,
                description: description,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(shortUrl);
        setIsCopied(true);
        toast({
            title: "Copied to clipboard",
            description: "The short URL has been copied to your clipboard",
        });

        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    }

    return (
        <>
            {!showResult ? (
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="url" className="flex justify-start">URL to shorten</Label>
                        <Input
                            id="url"
                            name="url"
                            placeholder="https://example.com/very-long-url"
                            required
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="custom-alias"
                            checked={customAlias}
                            onCheckedChange={setCustomAlias}
                        />
                        <Label htmlFor="custom-alias" className="flex justify-start">Use custom alias</Label>
                    </div>

                    {customAlias && (
                        <div className="space-y-2">
                            <Label htmlFor="alias" className="flex justify-start">Custom alias</Label>
                            <Input
                                id="alias"
                                name="alias"
                                placeholder="my-custom-link"
                                required={customAlias}
                            />
                        </div>
                    )}

                    {!customAlias && (
                        <div className="space-y-2">
                            <Label htmlFor="url-length" className="flex justify-start">Short URL length</Label>
                            <Select
                                value={urlLength}
                                onValueChange={setUrlLength}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select length" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="4">
                                        4 characters
                                    </SelectItem>
                                    <SelectItem value="6">
                                        6 characters
                                    </SelectItem>
                                    <SelectItem value="8">
                                        8 characters
                                    </SelectItem>
                                    <SelectItem value="10">
                                        10 characters
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="flex justify-start">Expiration</Label>
                        <RadioGroup
                            defaultValue="none"
                            value={expiryType}
                            onValueChange={setExpiryType}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="none" id="none" />
                                <Label htmlFor="none" className="flex justify-start">
                                    Never (permanent link)
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="date" id="date" />
                                <Label htmlFor="date" className="flex justify-start">Expiration date</Label>
                                {expiryType === "date" && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] justify-start text-left font-normal ml-2",
                                                    !date &&
                                                    "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? (
                                                    format(date, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="clicks" id="clicks" />
                                <Label htmlFor="clicks" className="flex justify-start">Click limit</Label>
                                {expiryType === "clicks" && (
                                    <Select
                                        value={clickLimit}
                                        onValueChange={setClickLimit}
                                    >
                                        <SelectTrigger className="w-[180px] ml-2">
                                            <SelectValue placeholder="Select limit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">
                                                1 click
                                            </SelectItem>
                                            <SelectItem value="5">
                                                5 clicks
                                            </SelectItem>
                                            <SelectItem value="10">
                                                10 clicks
                                            </SelectItem>
                                            <SelectItem value="25">
                                                25 clicks
                                            </SelectItem>
                                            <SelectItem value="50">
                                                50 clicks
                                            </SelectItem>
                                            <SelectItem value="100">
                                                100 clicks
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </RadioGroup>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Shortening...
                            </>
                        ) : (
                            "Shorten URL"
                        )}
                    </Button>
                </form>
            ) : (
                <Card className="p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium flex justify-start">
                                Your shortened URL
                            </h3>
                            <div className="flex relative">
                                <Input
                                    value={shortUrl}
                                    readOnly
                                    className="pr-20"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full rounded-l-none"
                                    onClick={copyToClipboard}
                                    disabled={isCopied}
                                >
                                    {isCopied ? (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setShowResult(false)}
                            >
                                Create another
                            </Button>
                            <Button asChild>
                                <Link href="/dashboard">View all links</Link>
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </>
    );
}
