import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logRequest, logSuccess, logError } from "@/lib/logger"

export const dynamic = "force-dynamic"

const PATH = "/api/health"

export async function GET() {
    logRequest("GET", PATH)

    const timestamp = new Date().toISOString()

    const env = {
        DATABASE_URL: !!process.env.DATABASE_URL,
        ADMIN_API_KEY: !!process.env.ADMIN_API_KEY,
        AUTH_SECRET: !!process.env.AUTH_SECRET,
        NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
        NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    }

    let database: "connected" | "disconnected" = "disconnected"
    try {
        await prisma.$queryRaw`SELECT 1`
        database = "connected"
    } catch (error) {
        logError({ method: "GET", path: PATH, error, extra: { reason: "DB ping failed" } })
        database = "disconnected"
    }

    const status = database === "connected" ? "ok" : "degraded"

    logSuccess({ method: "GET", path: PATH, extra: { status, database, env } })

    return NextResponse.json({ status, timestamp, database, env }, { status: 200 })
}
