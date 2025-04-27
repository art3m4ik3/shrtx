import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export function generateUrlToken(urlId: string): string {
    return jwt.sign({ urlId }, JWT_SECRET, { expiresIn: "999d" });
}

export function verifyUrlToken(token: string): { urlId: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { urlId: string };
    } catch {
        return null;
    }
}
