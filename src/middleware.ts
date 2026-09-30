import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ANON_VISITOR_COOKIE, anonVisitorCookieOptions, isValidVisitorId } from "@/lib/analytics-cookie";
import { isStaffWorkHour } from "@/lib/work-hours";

const STAFF_COOKIE = "anyang_sid";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let visitorId = request.cookies.get(ANON_VISITOR_COOKIE)?.value;
  const needsCookie = !isValidVisitorId(visitorId);
  if (needsCookie) visitorId = crypto.randomUUID();
  requestHeaders.set("x-visitor-id", visitorId!);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (needsCookie) {
    response.cookies.set(ANON_VISITOR_COOKIE, visitorId!, anonVisitorCookieOptions());
  }

  if (!isStaffWorkHour() && request.cookies.get(STAFF_COOKIE)?.value) {
    response.cookies.set(STAFF_COOKIE, "", { path: "/", httpOnly: true, sameSite: "lax", maxAge: 0 });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)"],
};
