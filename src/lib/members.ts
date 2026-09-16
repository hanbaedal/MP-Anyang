import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { getDb, hasMongo } from "./mongo";

export const MEMBER_COOKIE = "anyang_sid";

export type Member = {
  id: string;
  name: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
};

export type MemberSession = { id: string; name: string; phone: string };

const localFile = path.join(process.cwd(), "data", "members.local.json");

function secret() {
  return process.env.AUTH_SECRET?.trim() || "anyang-local-auth";
}

function cleanPhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeSession(member: MemberSession) {
  const payload = Buffer.from(JSON.stringify({ ...member, exp: Date.now() + 1000 * 60 * 60 * 24 * 30 })).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined | null): MemberSession | null {
  if (!token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expected = sign(payload);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as MemberSession & { exp?: number };
    if (!data.id || !data.name || !data.phone) return null;
    if (data.exp && data.exp < Date.now()) return null;
    return { id: data.id, name: data.name, phone: data.phone };
  } catch {
    return null;
  }
}

async function readLocal(): Promise<Member[]> {
  try {
    return JSON.parse(await readFile(localFile, "utf8")) as Member[];
  } catch {
    return [];
  }
}

async function writeLocal(members: Member[]) {
  await mkdir(path.dirname(localFile), { recursive: true });
  await writeFile(localFile, JSON.stringify(members, null, 2), "utf8");
}

async function findByPhone(phone: string): Promise<Member | null> {
  const digits = cleanPhone(phone);
  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    const row = await db.collection("members").findOne({ phone: digits });
    if (!row) return null;
    return {
      id: String(row.id ?? row._id),
      name: String(row.name ?? ""),
      phone: String(row.phone ?? ""),
      passwordHash: String(row.passwordHash ?? ""),
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt ?? ""),
    };
  }
  const all = await readLocal();
  return all.find((item) => item.phone === digits) ?? null;
}

export function validateRegister(input: { name?: string; phone?: string; password?: string; password2?: string }) {
  const name = input.name?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const password = input.password ?? "";
  const password2 = input.password2 ?? "";
  const digits = cleanPhone(phone);
  if (name.length < 2 || name.length > 40) return "이름을 2자 이상 적어 주세요.";
  if (digits.length < 9 || digits.length > 11) return "연락처를 숫자로 정확히 적어 주세요.";
  if (password.length < 6 || password.length > 80) return "비밀번호는 6자 이상이어야 합니다.";
  if (password !== password2) return "비밀번호가 서로 다릅니다.";
  return null;
}

export async function registerMember(input: { name: string; phone: string; password: string }) {
  const phone = cleanPhone(input.phone);
  const existing = await findByPhone(phone);
  if (existing) return { ok: false as const, error: "이미 가입된 연락처입니다." };

  const member: Member = {
    id: randomBytes(12).toString("hex"),
    name: input.name.trim(),
    phone,
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };

  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("members").insertOne({
      ...member,
      createdAt: new Date(member.createdAt),
    });
  } else {
    const all = await readLocal();
    all.unshift(member);
    await writeLocal(all);
  }

  return { ok: true as const, member: { id: member.id, name: member.name, phone: member.phone } };
}

export async function loginMember(input: { phone: string; password: string }) {
  const member = await findByPhone(input.phone);
  if (!member || !verifyPassword(input.password, member.passwordHash)) {
    return { ok: false as const, error: "연락처 또는 비밀번호가 올바르지 않습니다." };
  }
  return { ok: true as const, member: { id: member.id, name: member.name, phone: member.phone } };
}

export async function readSession(): Promise<MemberSession | null> {
  const token = (await cookies()).get(MEMBER_COOKIE)?.value;
  return decodeSession(token);
}

export function sessionCookieOptions() {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30,
  };
}
