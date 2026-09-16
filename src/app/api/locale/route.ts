import { NextResponse } from "next/server";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n";

function cookie(res: NextResponse, locale: string) {
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}

function safeNext(request: Request, next: string | null) {
  const path = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
  const proto = (request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "") || "http").split(",")[0].trim();
  return new URL(path, `${proto}://${host}`);
}

export async function POST(request: Request) {
  let locale = "";
  try {
    const body = (await request.json()) as { locale?: string };
    locale = body.locale ?? "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!isLocale(locale)) return NextResponse.json({ ok: false }, { status: 400 });
  return cookie(NextResponse.json({ ok: true }), locale);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "";
  if (!isLocale(locale)) return NextResponse.json({ ok: false }, { status: 400 });
  return cookie(NextResponse.redirect(safeNext(request, url.searchParams.get("next"))), locale);
}
