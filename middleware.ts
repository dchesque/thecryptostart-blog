import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isUserManagementRoute = nextUrl.pathname.startsWith("/admin/users")

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
  matcher: ["/admin/:path*"]
}
