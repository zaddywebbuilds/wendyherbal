import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidSession } from "@/lib/admin-auth";

/**
 * Gates /admin and the admin-only APIs. The Google connect routes are included
 * deliberately: without that, anyone could point the shop's order book at
 * their own Google account.
 */
export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // The login page and the endpoint it posts to must stay open, or there is no
  // way to obtain the session the rest of this gate requires.
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  // With no password set the gate cannot work, so fail closed rather than open.
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SECRET) {
    return NextResponse.redirect(`${origin}/admin/login?setup=1`);
  }

  if (await isValidSession(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const next = encodeURIComponent(pathname);
  return NextResponse.redirect(`${origin}/admin/login?next=${next}`);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/google/:path*"],
};
