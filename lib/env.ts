/**
 * Environment variable validation module.
 * Import this in app/layout.tsx or instrumentation.ts to get startup warnings
 * when critical environment variables are missing.
 *
 * This module uses console.warn (not throw) to avoid breaking builds —
 * it only alerts operators so they can fix configuration issues.
 */

const REQUIRED_VARS = [
    "DATABASE_URL",
    "AUTH_SECRET",
    "NEXTAUTH_URL",
] as const

const IMPORTANT_VARS = [
    "ADMIN_API_KEY",
    "NEXT_PUBLIC_SITE_URL",
] as const

export function validateEnv(): void {
    const missing: string[] = []
    const warnings: string[] = []

    for (const key of REQUIRED_VARS) {
        if (!process.env[key]) {
            missing.push(key)
        }
    }

    for (const key of IMPORTANT_VARS) {
        if (!process.env[key]) {
            warnings.push(key)
        }
    }

    if (missing.length > 0) {
        for (const key of missing) {
            console.warn(
                `⚠️  [ENV] CRITICAL: "${key}" is not defined. The application may not function correctly.`
            )
        }
    }

    if (warnings.length > 0) {
        for (const key of warnings) {
            if (key === "ADMIN_API_KEY") {
                console.warn(
                    `⚠️  [ENV] ADMIN_API_KEY is not defined. API Key authentication for /api/admin/* will not work.`
                )
            } else {
                console.warn(
                    `⚠️  [ENV] "${key}" is not defined. Some features may be unavailable.`
                )
            }
        }
    }

    if (missing.length === 0 && warnings.length === 0) {
        console.log("✅ [ENV] All required environment variables are configured.")
    }
}

// Auto-run validation on import (server-side only)
if (typeof window === "undefined") {
    validateEnv()
}
