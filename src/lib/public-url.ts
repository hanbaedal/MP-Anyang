import { NextResponse } from "next/server";

export function publicOrigin(request: Request) {
  const fromEnv = (process.env.AUTH_BASE_URL || process.env.RENDER_EXTERNAL_URL || "").replace(/\/$/, "");
  if (fromEnv && !/localhost|127\.0\.0\.1/i.test(fromEnv)) return fromEnv;

  const xfHost = request.headers.get("x-forwarded-host");
  const xfProto = request.headers.get("x-forwarded-proto") || "https";
  if (xfHost && !/localhost|127\.0\.0\.1/i.test(xfHost)) {
    return `${xfProto}://${xfHost.split(",")[0].trim()}`;
  }

  const host = request.headers.get("host") || "";
  if (host && !/localhost|127\.0\.0\.1/i.test(host)) {
    return `${xfProto}://${host}`;
  }

  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function redirectTo(request: Request, path: string, status = 303) {
  return NextResponse.redirect(new URL(path, `${publicOrigin(request)}/`), status);
}
