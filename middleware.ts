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
    if (!isLoggedIn && !isValidApiKey) {
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
