import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // Function that is executed on each request
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/h5p-viewer/admin");

    // Check if trying to access admin route without admin role
    if (isAdminRoute && token?.role !== "admin") {
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
  matcher: ["/admin/:path*", "/h5p-viewer/admin/:path*"],
};
