import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { afterLoginPath, isStaffRole, type SessionUser } from "./auth-types";
import { findMemberByUsername, loginMember, memberSession } from "./members";
import { ensureAuthSeed, findStaffByUsername } from "./staff";
import { verifyPassword } from "./passwords";

export { isStaffRole, profileIncomplete, afterLoginPath } from "./auth-types";
export type { Role, SessionUser } from "./auth-types";

export const MEMBER_COOKIE = "anyang_sid";
export const SESSION_COOKIE = MEMBER_COOKIE;

function secret() {
  return process.env.AUTH_SECRET?.trim() || "anyang-local-auth";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeSession(user: SessionUser) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      phone: user.phone ?? "",
      email: user.email ?? "",
      title: user.title ?? "",
      exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined | null): SessionUser | null {
  if (!token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expected = sign(payload);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser & { exp?: number };
    if (!data.id || !data.role) return null;
    if (data.exp && data.exp < Date.now()) return null;
    return {
      id: data.id,
      username: data.username || "",
      name: data.name || "",
      role: data.role,
      phone: data.phone || "",
      email: data.email || "",
      title: data.title || "",
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30,
  };
}

export async function readSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return decodeSession(token);
}

export async function loginAccount(input: { username: string; password: string }) {
  await ensureAuthSeed();
  const username = input.username.trim();
  const password = input.password;
  if (!username || !password) return { ok: false as const, error: "아이디 또는 비밀번호가 올바르지 않습니다." };

  const staff = await findStaffByUsername(username);
  if (staff) {
    if (await verifyPassword(password, staff.passwordHash)) {
      const user: SessionUser = {
        id: staff.id,
        username: staff.username,
        name: staff.name,
        role: staff.role,
        phone: staff.phone,
        email: staff.email,
        title: staff.title,
      };
      return { ok: true as const, user, redirect: afterLoginPath(user) };
    }
    return { ok: false as const, error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  const result = await loginMember({ login: username, password });
  if (!result.ok) return { ok: false as const, error: result.error };
  const user = memberSession(result.member);
  return { ok: true as const, user, redirect: afterLoginPath(user) };
}

export async function usernameTaken(username: string, exceptId?: string) {
  const staff = await findStaffByUsername(username);
  if (staff && staff.id !== exceptId) return true;
  const member = await findMemberByUsername(username);
  if (member && member.id !== exceptId) return true;
  return false;
}

export async function requireStaff(supervisor = false) {
  const session = await readSession();
  if (!session || !isStaffRole(session.role)) redirect("/account/login");
  if (supervisor && session.role !== "supervisor") redirect("/manage");
  return session;
}
