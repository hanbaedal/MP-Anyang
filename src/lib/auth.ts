import { SignJWT, jwtVerify } from "jose";
import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { publicOrigin } from "./public-url";

export const COOKIE_NAME = "ap_session";

export type SessionUser = {
  id: string;
  username: string;
  name: string;
  role: "admin" | "member";
};

function secret() {
  const value = process.env.JWT_SECRET || "anyang-park-jwt-7f3c9e2a1b84d6c0e5f118a2";
  return new TextEncoder().encode(value);
}

export async function signSession(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function readSession(): Promise<SessionUser | null> {
  noStore();
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: String(payload.id),
      username: String(payload.username),
      name: String(payload.name),
      role: payload.role === "admin" ? "admin" : "member",
    };
  } catch {
    return null;
  }
}

export async function loginAs(user: SessionUser) {
  await setSessionCookie(await signSession(user));
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

/** OAuth 콜백 — Route Handler redirect 응답에 세션 쿠키를 직접 설정 */
export async function redirectWithSession(request: Request, path: string, user: SessionUser, status = 303) {
  const token = await signSession(user);
  const res = NextResponse.redirect(new URL(path, `${publicOrigin(request)}/`), status);
  res.cookies.set(COOKIE_NAME, token, sessionCookieOptions());
  return res;
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, sessionCookieOptions());
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function requireUser() {
  const user = await readSession();
  if (!user) {
    const error = new Error("로그인이 필요합니다.") as Error & { status: number };
    error.status = 401;
    throw error;
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    const error = new Error("관리자만 할 수 있습니다.") as Error & { status: number };
    error.status = 403;
    throw error;
  }
  return user;
}

/** 관리자 페이지용 — throw 대신 로그인/메인으로 redirect */
export async function guardAdminPage(nextPath = "/admin") {
  const user = await readSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (user.role !== "admin") redirect("/");
  return user;
}

export function errorStatus(error: unknown) {
  if (error && typeof error === "object" && "status" in error) {
    return Number((error as { status: number }).status) || 500;
  }
  return 500;
}
