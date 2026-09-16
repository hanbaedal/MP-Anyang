import { randomBytes } from "node:crypto";
import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { getDb, hasMongo } from "./mongo";
import { hashPassword, verifyPassword } from "./passwords";
import type { SessionUser } from "./auth-types";

export type Member = {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  title: string;
  passwordHash: string;
  createdAt: string;
  oauthProvider?: string;
  oauthId?: string;
};

const localFile = dataFile("members.local.json");

function cleanPhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function fromDoc(doc: Record<string, unknown>): Member {
  return {
    id: String(doc.id ?? doc._id ?? ""),
    username: String(doc.username ?? doc.phone ?? ""),
    name: String(doc.name ?? ""),
    phone: String(doc.phone ?? ""),
    email: String(doc.email ?? ""),
    title: String(doc.title ?? ""),
    passwordHash: String(doc.passwordHash ?? ""),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt ?? ""),
    oauthProvider: doc.oauthProvider ? String(doc.oauthProvider) : "",
    oauthId: doc.oauthId ? String(doc.oauthId) : "",
  };
}

async function readLocal() {
  return readJsonFile<Member[]>(localFile, []);
}

async function writeLocal(rows: Member[]) {
  await writeJsonFile(localFile, rows);
}

export async function findMemberByUsername(username: string): Promise<Member | null> {
  const key = username.trim();
  if (!key) return null;
  if (hasMongo()) {
    const db = await getDb();
    if (db) {
      const row = await db.collection("members").findOne({ username: key });
      return row ? fromDoc(row as Record<string, unknown>) : null;
    }
  }
  const all = await readLocal();
  return all.find((item) => item.username === key) ?? null;
}

export async function findMemberByPhone(phone: string): Promise<Member | null> {
  const digits = cleanPhone(phone);
  if (!digits) return null;
  if (hasMongo()) {
    const db = await getDb();
    if (db) {
      const row = await db.collection("members").findOne({ phone: digits });
      return row ? fromDoc(row as Record<string, unknown>) : null;
    }
  }
  const all = await readLocal();
  return all.find((item) => item.phone === digits) ?? null;
}

export async function findMemberByLogin(login: string): Promise<Member | null> {
  return (await findMemberByUsername(login)) ?? (await findMemberByPhone(login));
}

export async function findMemberByEmail(email: string): Promise<Member | null> {
  const key = email.trim().toLowerCase();
  if (!key || !key.includes("@")) return null;
  if (hasMongo()) {
    try {
      const db = await getDb();
      if (db) {
        const row = await db.collection("members").findOne({ email: key });
        if (row) return fromDoc(row as Record<string, unknown>);
        const rows = await db.collection("members").find({}).toArray();
        const match = rows.find((item) => String((item as { email?: string }).email ?? "").trim().toLowerCase() === key);
        return match ? fromDoc(match as Record<string, unknown>) : null;
      }
    } catch {
      console.error("[members] mongo unavailable, using local file");
    }
  }
  const all = await readLocal();
  return all.find((item) => item.email.trim().toLowerCase() === key) ?? null;
}

export async function findMemberByOAuth(provider: string, oauthId: string): Promise<Member | null> {
  const id = oauthId.trim();
  if (!provider || !id) return null;
  if (hasMongo()) {
    try {
      const db = await getDb();
      if (db) {
        const row = await db.collection("members").findOne({ oauthProvider: provider, oauthId: id });
        return row ? fromDoc(row as Record<string, unknown>) : null;
      }
    } catch {
      console.error("[members] mongo unavailable, using local file");
    }
  }
  const all = await readLocal();
  return all.find((item) => item.oauthProvider === provider && item.oauthId === id) ?? null;
}

export async function findMemberById(id: string): Promise<Member | null> {
  if (hasMongo()) {
    const db = await getDb();
    if (db) {
      const row = await db.collection("members").findOne({ id });
      return row ? fromDoc(row as Record<string, unknown>) : null;
    }
  }
  const all = await readLocal();
  return all.find((item) => item.id === id) ?? null;
}

export function validateRegister(input: {
  username?: string;
  password?: string;
  password2?: string;
  name?: string;
  phone?: string;
  email?: string;
  title?: string;
}) {
  const username = input.username?.trim() ?? "";
  const name = input.name?.trim() ?? "";
  const phone = cleanPhone(input.phone ?? "");
  const email = input.email?.trim() ?? "";
  const password = input.password ?? "";
  const password2 = input.password2 ?? "";
  if (!/^[a-zA-Z0-9._-]{4,32}$/.test(username)) return "아이디는 영문·숫자 4–32자로 적어 주세요.";
  if (name.length < 2 || name.length > 40) return "이름을 2자 이상 적어 주세요.";
  if (phone.length < 9 || phone.length > 11) return "연락처를 숫자로 정확히 적어 주세요.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "이메일을 정확히 적어 주세요.";
  if (password.length < 6 || password.length > 80) return "비밀번호는 6자 이상이어야 합니다.";
  if (password !== password2) return "비밀번호가 서로 다릅니다.";
  if ((input.title ?? "").length > 40) return "직위는 40자 이하로 적어 주세요.";
  return null;
}

export function validateProfile(input: { username?: string; name?: string; phone?: string; email?: string; title?: string }) {
  const username = input.username?.trim() ?? "";
  const name = input.name?.trim() ?? "";
  const phone = cleanPhone(input.phone ?? "");
  const email = input.email?.trim() ?? "";
  if (!/^[a-zA-Z0-9._-]{4,32}$/.test(username)) return "아이디는 영문·숫자 4–32자로 적어 주세요.";
  if (name.length < 2 || name.length > 40) return "이름을 2자 이상 적어 주세요.";
  if (phone.length < 9 || phone.length > 11) return "연락처를 숫자로 정확히 적어 주세요.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "이메일을 정확히 적어 주세요.";
  if ((input.title ?? "").length > 40) return "직위는 40자 이하로 적어 주세요.";
  return null;
}

export function memberSession(member: Member): SessionUser {
  return {
    id: member.id,
    username: member.username,
    name: member.name,
    role: "member",
    phone: member.phone,
    email: member.email,
    title: member.title,
  };
}

export async function registerMember(input: {
  username: string;
  password: string;
  name: string;
  phone: string;
  email: string;
  title?: string;
}) {
  const username = input.username.trim();
  const phone = cleanPhone(input.phone);
  if (await findMemberByUsername(username)) return { ok: false as const, error: "이미 있는 아이디입니다." };
  if (await findMemberByPhone(phone)) return { ok: false as const, error: "이미 가입된 연락처입니다." };

  const member: Member = {
    id: randomBytes(12).toString("hex"),
    username,
    name: input.name.trim(),
    phone,
    email: input.email.trim(),
    title: input.title?.trim() ?? "",
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };

  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("members").insertOne({ ...member, createdAt: new Date(member.createdAt) });
  } else {
    const all = await readLocal();
    all.unshift(member);
    await writeLocal(all);
  }

  return { ok: true as const, member };
}

export async function loginMember(input: { login: string; password: string }) {
  const member = await findMemberByLogin(input.login);
  if (!member || !(await verifyPassword(input.password, member.passwordHash))) {
    return { ok: false as const, error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }
  return { ok: true as const, member };
}

export async function updateMemberProfile(
  id: string,
  input: { username: string; name: string; phone: string; email: string; title?: string },
) {
  const current = await findMemberById(id);
  if (!current) return { ok: false as const, error: "회원을 찾지 못했습니다." };
  const username = input.username.trim();
  const phone = cleanPhone(input.phone);
  const otherUser = await findMemberByUsername(username);
  if (otherUser && otherUser.id !== id) return { ok: false as const, error: "이미 있는 아이디입니다." };
  const otherPhone = await findMemberByPhone(phone);
  if (otherPhone && otherPhone.id !== id) return { ok: false as const, error: "이미 가입된 연락처입니다." };

  const next: Member = {
    ...current,
    username,
    name: input.name.trim(),
    phone,
    email: input.email.trim(),
    title: input.title?.trim() ?? "",
  };

  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("members").updateOne({ id }, { $set: next });
  } else {
    const all = await readLocal();
    await writeLocal(all.map((item) => (item.id === id ? next : item)));
  }
  return { ok: true as const, member: next };
}

function oauthUsername(provider: string, oauthId: string) {
  const raw = `${provider}_${oauthId}`.replace(/[^a-zA-Z0-9._-]/g, "");
  const base = raw.slice(0, 28) || `${provider}user`;
  return base.length >= 4 ? base : `${base}user`.slice(0, 32);
}

async function saveMember(member: Member, isNew: boolean) {
  if (hasMongo()) {
    try {
      const db = await getDb();
      if (db) {
        const doc = { ...member, createdAt: new Date(member.createdAt) };
        if (isNew) await db.collection("members").insertOne(doc);
        else await db.collection("members").updateOne({ id: member.id }, { $set: doc });
        return;
      }
    } catch {
      console.error("[members] mongo unavailable, using local file");
    }
  }
  const all = await readLocal();
  if (isNew) {
    all.unshift(member);
    await writeLocal(all);
    return;
  }
  await writeLocal(all.map((item) => (item.id === member.id ? member : item)));
}

export async function upsertOAuthMember(input: {
  provider: "kakao" | "google";
  oauthId: string;
  name?: string;
  email?: string;
  phone?: string;
}): Promise<Member> {
  const existing =
    (await findMemberByOAuth(input.provider, input.oauthId)) ??
    (input.email ? await findMemberByEmail(input.email) : null);
  if (existing) {
    const next: Member = {
      ...existing,
      name: existing.name.trim() || input.name?.trim() || existing.name,
      email: existing.email.trim() || input.email?.trim() || existing.email,
      phone: existing.phone.trim() || input.phone?.trim() || existing.phone,
      oauthProvider: existing.oauthProvider || input.provider,
      oauthId: existing.oauthId || input.oauthId,
    };
    await saveMember(next, false);
    return next;
  }

  let username = oauthUsername(input.provider, input.oauthId);
  if (await findMemberByUsername(username)) {
    username = `${username.slice(0, 24)}${randomBytes(2).toString("hex")}`.slice(0, 32);
  }

  const member: Member = {
    id: randomBytes(12).toString("hex"),
    username,
    name: input.name?.trim() ?? "",
    phone: input.phone?.trim() || "",
    email: input.email?.trim() ?? "",
    title: "",
    passwordHash: await hashPassword(randomBytes(24).toString("hex")),
    createdAt: new Date().toISOString(),
    oauthProvider: input.provider,
    oauthId: input.oauthId,
  };
  await saveMember(member, true);
  return member;
}
