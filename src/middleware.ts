import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, readSession, passwordStorageIsDurable } from "@/lib/admin-auth";

/** Reachable while a password change is being forced, or she would be trapped. */
const DURING_FORCED_CHANGE = ["/admin/password", "/api/admin/password", "/api/admin/login"];

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

  const session = await readSession(req.cookies.get(ADMIN_COOKIE)?.value);

  if (session) {
    // Signed in with the handover password: nothing else opens until she has
    // set one of her own. The flag rides in the verified cookie, so this costs
    // no lookup.
    //
    // Except where the change could not be completed. With no durable store
    // the change screen refuses to save, so forcing it would shut her out of
    // the dashboard entirely — a lockout caused by a safety feature. Settings
    // still reports the storage state.
    if (
      session.mustChange &&
      passwordStorageIsDurable() &&
      !DURING_FORCED_CHANGE.includes(pathname)
    ) {
      return NextResponse.redirect(`${origin}/admin/password?first=1`);
    }
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
