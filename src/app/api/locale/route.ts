import { NextResponse } from "next/server";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n";

export async function POST(request: Request) {
  let locale = "";
  try {
    const body = (await request.json()) as { locale?: string };
    locale = body.locale ?? "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!isLocale(locale)) return NextResponse.json({ ok: false }, { status: 400 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
