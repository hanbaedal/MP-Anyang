import { NextResponse } from "next/server";
import { decodeSession, SESSION_COOKIE } from "@/lib/auth";
import { trackPageView } from "@/lib/site-analytics";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  let pathname = "/";
  try {
    const body = (await request.json()) as { pathname?: string };
    if (body.pathname?.startsWith("/")) pathname = body.pathname.split("?")[0].slice(0, 160);
  } catch {
    /* empty body ok */
  }

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = decodeSession(token);
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "";
  const userAgent = request.headers.get("user-agent");

  await trackPageView({ pathname, session, userAgent, ip });
  return NextResponse.json({ ok: true });
}
