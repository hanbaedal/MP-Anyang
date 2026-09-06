import { createHash } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { IdentityProvider } from "./identity-config";
import { normalizePhone } from "./phone";

export const IDENTITY_COOKIE_NAME = "ap_id_verify";
const MAX_AGE_SEC = 60 * 30;

export type IdentityPayload = {
  name: string;
  birthDate: string;
  phone: string;
  ciHash: string;
  provider: IdentityProvider;
  verifiedAt: string;
};

function secret() {
  const value = process.env.IDENTITY_VERIFY_SECRET || process.env.JWT_SECRET || "anyang-park-jwt-7f3c9e2a1b84d6c0e5f118a2";
  return new TextEncoder().encode(value);
}

export function hashCi(input: { name: string; birthDate: string; phone: string; provider: IdentityProvider }) {
  const raw = `${input.provider}:${input.name.trim()}:${input.birthDate}:${normalizePhone(input.phone)}`;
  return createHash("sha256").update(raw).digest("hex");
}

export async function signIdentityPayload(payload: IdentityPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(secret());
}

export async function readIdentityPayload(): Promise<IdentityPayload | null> {
  const jar = await cookies();
  const token = jar.get(IDENTITY_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      name: String(payload.name || ""),
      birthDate: String(payload.birthDate || ""),
      phone: String(payload.phone || ""),
      ciHash: String(payload.ciHash || ""),
      provider: (payload.provider === "nice" || payload.provider === "danal" ? payload.provider : "mock") as IdentityProvider,
      verifiedAt: String(payload.verifiedAt || ""),
    };
  } catch {
    return null;
  }
}

export function identityCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}

export async function setIdentityCookie(payload: IdentityPayload) {
  const jar = await cookies();
  jar.set(IDENTITY_COOKIE_NAME, await signIdentityPayload(payload), identityCookieOptions());
}

export async function clearIdentityCookie() {
  const jar = await cookies();
  jar.delete(IDENTITY_COOKIE_NAME);
}

export function identityFieldsFromPayload(payload: IdentityPayload) {
  return {
    name: payload.name.trim(),
    phone: normalizePhone(payload.phone),
    birthDate: payload.birthDate,
    ciHash: payload.ciHash,
    identityProvider: payload.provider,
    identityVerifiedAt: new Date(payload.verifiedAt || Date.now()),
  };
}
