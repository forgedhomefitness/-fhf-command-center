import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
  "/api/reports",
  "/api/acuity",
  "/api/quickbooks",
  "/api/stripe",
  "/api/analytics",
  "/api/mileage",
  "/api/newsletter",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If auth is not configured, allow all requests (safe deploy)
  if (!process.env.AUTH_SECRET) {
    return NextResponse.next();
  }

  // Check auth cookie
  const token = request.cookies.get("fhf-auth")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
