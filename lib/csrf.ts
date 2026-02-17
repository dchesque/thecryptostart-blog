import crypto from "crypto";

/**
 * Simplified CSRF protection.
 * In Next.js, many actions are already protected, but for custom API routes,
 * we can use a token-based approach.
 */
export async function generateCSRFToken() {
    const array = new Uint8Array(32);
    globalThis.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function validateCSRFToken(token: string, secret: string) {
    // Simple validation logic
    return token === secret;
}

/**
 * For standard NextAuth v5, CSRF is handled automatically for its own routes.
 * This utility is for our custom state-changing API routes.
 */
export const CSRF_CONFIG = {
    cookieName: "csrf_token",
    headerName: "x-csrf-token",
};
