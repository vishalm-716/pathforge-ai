import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // Public routes
  const publicPaths = ["/", "/login", "/admin/login"];
  if (publicPaths.includes(pathname)) {
    // Redirect logged-in users to their dashboard
    if (isLoggedIn && pathname === "/login") {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }
    if (isLoggedIn && pathname === "/admin/login") {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }
    return NextResponse.next();
  }

  // API routes pass through
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Dev-only demo route
  if (pathname.startsWith("/demo")) {
    return NextResponse.next();
  }

  // Protected student routes
  if (pathname.startsWith("/student")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protected admin routes
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
