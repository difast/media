import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight guard: redirect unauthenticated users away from /studio.
// Fine-grained role checks happen in the studio layout / server actions.
export function middleware(req: NextRequest) {
  const hasSession =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");

  if (!hasSession) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*"],
};
