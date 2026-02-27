import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
    const timestamp = new Date().toISOString()

    // Check required environment variables (boolean only — never expose values)
    const env = {
        DATABASE_URL: !!process.env.DATABASE_URL,
        ADMIN_API_KEY: !!process.env.ADMIN_API_KEY,
        AUTH_SECRET: !!process.env.AUTH_SECRET,
        NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
        NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    }

    // Test database connectivity
    let database: "connected" | "disconnected" = "disconnected"
    try {
        await prisma.$queryRaw`SELECT 1`
        database = "connected"
    } catch {
        database = "disconnected"
    }

    const status = database === "connected" ? "ok" : "degraded"

    return NextResponse.json(
        {
            status,
            timestamp,
            database,
            env,
        },
        { status: 200 }
    )
}
