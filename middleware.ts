import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// RBAC matcher – any paths listed here will be checked server-side.
export const config = {
  matcher: [
    "/admin/:path*",
    "/government-official/:path*",
    "/election-commission/:path*",
  ],
};

export function middleware(req: NextRequest) {
  const role = req.cookies.get("userType")?.value;
  const { pathname } = req.nextUrl;

  // Helper to redirect to /unauthorized while preserving original path (optional)
  const redirectUnauthorized = () => {
    const url = req.nextUrl.clone();
    url.pathname = "/unauthorized";
    url.search = ``;
    return NextResponse.redirect(url);
  };

  if (pathname.startsWith("/admin") && role !== "admin") {
    return redirectUnauthorized();
  }
  if (
    pathname.startsWith("/government-official") &&
    role !== "government_official"
  ) {
    return redirectUnauthorized();
  }
  if (
    pathname.startsWith("/election-commission") &&
    role !== "election_commission"
  ) {
    return redirectUnauthorized();
  }
  if (pathname.startsWith("/polling-station") && role !== "polling_station") {
    return redirectUnauthorized();
  }

  // Otherwise allow request
  return NextResponse.next();
}
