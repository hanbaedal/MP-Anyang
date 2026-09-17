import { NextResponse } from "next/server";
import { decodeSession, SESSION_COOKIE } from "@/lib/auth";
import {
  ANON_VISITOR_COOKIE,
  anonVisitorCookieOptions,
  isValidVisitorId,
  newVisitorId,
  trackPageView,
} from "@/lib/site-analytics";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  let pathname = "/";
  try {
    const body = (await request.json()) as { pathname?: string };
    if (body.pathname?.startsWith("/")) pathname = body.pathname.split("?")[0].slice(0, 160);
  } catch {
    /* empty body ok */
  }

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const session = decodeSession(token);
  let visitorId = jar.get(ANON_VISITOR_COOKIE)?.value;
  let freshVisitor = false;
  if (!session && !isValidVisitorId(visitorId)) {
    visitorId = newVisitorId();
    freshVisitor = true;
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "";
  const userAgent = request.headers.get("user-agent");

  await trackPageView({
    pathname,
    session,
    visitorId: session ? null : visitorId,
    userAgent,
    ip,
  });

  const res = NextResponse.json({ ok: true });
  if (freshVisitor && visitorId) {
    res.cookies.set(ANON_VISITOR_COOKIE, visitorId, anonVisitorCookieOptions());
  }
  return res;
}
