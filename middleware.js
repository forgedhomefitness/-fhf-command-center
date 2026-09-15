import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Reachable with no credential at all. Keep this list as short as it can be.
const ALWAYS_PUBLIC = ["/login", "/api/auth"];

// Cron-invoked ACTIONS. Vercel cron cannot send a cookie, and each of these
// already enforces its own CRON_SECRET bearer check internally, so the
// middleware lets them through and the route decides.
const ACTION_PATHS = [
  "/api/reports",
  "/api/newsletter",
  "/api/monthly-newsletter",
  "/api/send-report",
  "/api/cron",
];

// DATA endpoints. These were public, and /api/stripe returns charge
// descriptions containing CLIENT NAMES alongside revenue, customer counts and
// YTD totals - on a PUBLIC repo, which makes the URL findable. They now
// require either the dashboard cookie or the internal/cron bearer.
const PROTECTED_DATA_PATHS = [
  "/api/stripe",
  "/api/acuity",
  "/api/quickbooks",
  "/api/analytics",
  "/api/mileage",
];

function hasInternalBearer(request) {
  const secret = process.env.CRON_SECRET;
  // FAIL OPEN when no secret is configured. Without CRON_SECRET there is no
  // way for the weekly report to authenticate its own read of /api/stripe,
  // and silently breaking the Saturday tax-reserve email would be worse than
  // the leak this closes. With CRON_SECRET set (it is, in Vercel) this is a
  // real gate. If these endpoints ever go public again, that env var is why.
  if (!secret) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (ALWAYS_PUBLIC.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (ACTION_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Server-to-server calls (the weekly report reading /api/stripe, the daily
  // cron fanning out) carry the CRON_SECRET bearer instead of a cookie.
  if (
    PROTECTED_DATA_PATHS.some((path) => pathname.startsWith(path)) &&
    hasInternalBearer(request)
  ) {
    return NextResponse.next();
  }

  if (!process.env.AUTH_SECRET) {
    return NextResponse.next();
  }

  const token = request.cookies.get("fhf-auth")?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("fhf-auth");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
