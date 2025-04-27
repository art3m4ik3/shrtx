"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "url_tokens";

export function useUrlTokens() {
    const [tokens, setTokens] = useState<Record<string, string>>({});

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setTokens(JSON.parse(stored));
        }
    }, []);

    const saveToken = (urlId: string, token: string) => {
        setTokens((prev) => {
            const updated = { ...prev, [urlId]: token };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const getToken = (urlId: string) => tokens[urlId];

    return { tokens, saveToken, getToken };
}
