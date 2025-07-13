import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // Function that is executed on each request
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin") || 
                        req.nextUrl.pathname.startsWith("/h5p-viewer/admin") ||
                        req.nextUrl.pathname.startsWith("/api/admin") ||
                        req.nextUrl.pathname.startsWith("/h5p-viewer/api/admin");

    console.log("Middleware - Path:", req.nextUrl.pathname);
    console.log("Middleware - Is admin route:", isAdminRoute);
    console.log("Middleware - Token role:", token?.role);

    // Check if trying to access admin route without admin role
    if (isAdminRoute && token?.role !== "admin") {
      console.log("Middleware - Access denied for admin route");
      
      // For API routes, return 401 instead of redirect
      if (req.nextUrl.pathname.startsWith("/api/admin") || req.nextUrl.pathname.startsWith("/h5p-viewer/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      return NextResponse.redirect(new URL("/h5p-viewer/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect these routes with authentication
export const config = {
  matcher: ["/admin/:path*", "/h5p-viewer/admin/:path*", "/api/admin/:path*", "/h5p-viewer/api/admin/:path*"],
};
