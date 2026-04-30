/**
 * Pure helpers used by /api/admin/cleanup. Extracted for unit testing.
 */

export function clampInt(
    v: number | undefined,
    min: number,
    max: number,
    fallback: number,
): number {
    if (typeof v !== 'number' || !Number.isFinite(v)) return fallback
    return Math.max(min, Math.min(max, Math.trunc(v)))
}

export function pastDate(days: number): Date {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}
