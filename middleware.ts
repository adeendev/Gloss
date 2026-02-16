import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // If user is trying to access admin routes and is not authenticated
    if (req.nextUrl.pathname.startsWith("/admin") && 
        req.nextUrl.pathname !== "/admin/login" && 
        !req.nextauth.token) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    // If user is authenticated and trying to access login page, redirect to dashboard
    if (req.nextUrl.pathname === "/admin/login" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }

    // Check if user has admin role for admin routes
    if (req.nextUrl.pathname.startsWith("/admin") && 
        req.nextUrl.pathname !== "/admin/login" && 
        req.nextauth.token) {
      const userRole = req.nextauth.token.role as string
      if (userRole !== "ADMIN" && userRole !== "BUSINESS_OWNER") {
        return NextResponse.redirect(new URL("/admin/login?error=access-denied", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login page without authentication
        if (req.nextUrl.pathname === "/admin/login") {
          return true
        }
        
        // For all other admin routes, require authentication
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token
        }
        
        // Allow access to non-admin routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*"
  ]
}