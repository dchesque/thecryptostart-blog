import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const { nextUrl, headers } = req
  const isLoggedIn = !!req.auth
  const apiKey = headers.get("X-API-Key")
  const isValidApiKey = apiKey && apiKey === process.env.ADMIN_API_KEY

  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isApiAdminRoute = nextUrl.pathname.startsWith("/api/admin")
  const isUserManagementRoute = nextUrl.pathname.startsWith("/admin/users")

  // API Admin Routes Protection (Session OR API Key)
  if (isApiAdminRoute) {
    const envKeyExists = !!process.env.ADMIN_API_KEY

    console.log(`[API Auth] Path: ${nextUrl.pathname}`)
    console.log(`[API Auth] Session: ${isLoggedIn ? "YES" : "NO"}`)
    console.log(`[API Auth] API Key received: ${apiKey ? apiKey.substring(0, 8) + "..." : "NONE"}`)
    console.log(`[API Auth] ENV ADMIN_API_KEY defined: ${envKeyExists}`)
    console.log(`[API Auth] API Key valid: ${isValidApiKey ? "YES" : "NO"}`)

    if (!isLoggedIn && !isValidApiKey) {
      console.warn(`[API Auth] REJECTED — Unauthorized access to ${nextUrl.pathname}`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.next()
  }

  // Admin UI Routes Protection (Session ONLY)
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl))
    }

    // Role-based authorization
    const userRoles = (req.auth?.user as any)?.roles || []

    if (isUserManagementRoute && !userRoles.includes("ADMIN")) {
      return NextResponse.rewrite(new URL("/403", nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
}
