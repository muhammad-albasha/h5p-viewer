import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // Function that is executed on each request
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/h5p-viewer/admin");
    const is2FARoute = req.nextUrl.pathname.startsWith("/auth/2fa") || req.nextUrl.pathname.startsWith("/h5p-viewer/auth/2fa");
    const isLoginRoute = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/h5p-viewer/login";

    // Check if trying to access admin route without admin role
    if (isAdminRoute && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/h5p-viewer/login", req.url));
    }

    // If user has 2FA enabled but hasn't completed 2FA verification
    if (token?.requiresTwoFactor && !is2FARoute && !isLoginRoute) {
      console.log("2FA required but not completed, redirecting to 2FA verification");
      const callbackUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(new URL(`/auth/2fa/verify?callbackUrl=${callbackUrl}`, req.url));
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
  matcher: [
    "/admin/:path*", 
    "/h5p-viewer/admin/:path*",
    "/auth/2fa/setup/:path*",
    "/h5p-viewer/auth/2fa/setup/:path*"
  ],
};
