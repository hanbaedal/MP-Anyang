export const ANON_VISITOR_COOKIE = "anyang_vid";

export function anonVisitorCookieOptions(secure = process.env.NODE_ENV === "production") {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 400,
    secure,
  };
}

export function isValidVisitorId(value: string | undefined | null) {
  return Boolean(value && /^[a-f0-9-]{16,64}$/i.test(value));
}

export function newVisitorId() {
  return crypto.randomUUID();
}
