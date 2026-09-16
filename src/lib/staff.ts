import { randomBytes } from "node:crypto";
import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { getDb, hasMongo } from "./mongo";
import { hashPassword } from "./passwords";
import type { Role } from "./auth-types";

export type Staff = {
  id: string;
  username: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: "supervisor" | "admin";
  createdAt: string;
};

const localFile = dataFile("staff.local.json");

function fromDoc(doc: Record<string, unknown>): Staff {
  return {
    id: String(doc.id ?? doc._id ?? ""),
    username: String(doc.username ?? ""),
    name: String(doc.name ?? ""),
    title: String(doc.title ?? ""),
    phone: String(doc.phone ?? ""),
    email: String(doc.email ?? ""),
    passwordHash: String(doc.passwordHash ?? ""),
    role: doc.role === "supervisor" ? "supervisor" : "admin",
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt ?? ""),
  };
}

async function readLocal() {
  return readJsonFile<Staff[]>(localFile, []);
}

async function writeLocal(rows: Staff[]) {
  await writeJsonFile(localFile, rows);
}

export function parseAdminSeed(raw: string | undefined) {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const i = chunk.indexOf(":");
      if (i <= 0) return null;
      const username = chunk.slice(0, i).trim();
      const password = chunk.slice(i + 1);
      if (!username || !password) return null;
      return { username, password };
    })
    .filter((row): row is { username: string; password: string } => Boolean(row));
}

export async function listStaff(): Promise<Staff[]> {
  if (hasMongo()) {
    const db = await getDb();
    if (db) {
      const rows = await db.collection("staff").find({}).sort({ role: -1, username: 1 }).toArray();
      return rows.map((row) => fromDoc(row as Record<string, unknown>));
    }
  }
  return readLocal();
}

export async function findStaffByUsername(username: string): Promise<Staff | null> {
  const key = username.trim();
  if (!key) return null;
  if (hasMongo()) {
    const db = await getDb();
    if (db) {
      const row = await db.collection("staff").findOne({ username: key });
      return row ? fromDoc(row as Record<string, unknown>) : null;
    }
  }
  const all = await readLocal();
  return all.find((item) => item.username === key) ?? null;
}

export async function findStaffById(id: string): Promise<Staff | null> {
  if (hasMongo()) {
    const db = await getDb();
    if (db) {
      const row = await db.collection("staff").findOne({ id });
      return row ? fromDoc(row as Record<string, unknown>) : null;
    }
  }
  const all = await readLocal();
  return all.find((item) => item.id === id) ?? null;
}

async function insertStaff(staff: Staff) {
  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("staff").insertOne({ ...staff, createdAt: new Date(staff.createdAt) });
    return;
  }
  const all = await readLocal();
  all.push(staff);
  await writeLocal(all);
}

export async function ensureAuthSeed() {
  const supervisorId = process.env.SUPERVISOR_ID?.trim();
  const supervisorPassword = process.env.SUPERVISOR_PASSWORD ?? "";
  if (supervisorId && supervisorPassword) {
    const existing = await findStaffByUsername(supervisorId);
    if (!existing) {
      await insertStaff({
        id: randomBytes(12).toString("hex"),
        username: supervisorId,
        name: "감독",
        title: "감독",
        phone: "",
        email: "",
        passwordHash: await hashPassword(supervisorPassword),
        role: "supervisor",
        createdAt: new Date().toISOString(),
      });
    }
  }

  for (const row of parseAdminSeed(process.env.ADMIN_SEED)) {
    const existing = await findStaffByUsername(row.username);
    if (existing) continue;
    await insertStaff({
      id: randomBytes(12).toString("hex"),
      username: row.username,
      name: row.username,
      title: "관리자",
      phone: "",
      email: "",
      passwordHash: await hashPassword(row.password),
      role: "admin",
      createdAt: new Date().toISOString(),
    });
  }
}

export function validateAdminInput(input: {
  username?: string;
  password?: string;
  name?: string;
  title?: string;
  phone?: string;
  email?: string;
  creating?: boolean;
}) {
  const username = input.username?.trim() ?? "";
  const name = input.name?.trim() ?? "";
  const phone = (input.phone ?? "").replace(/[^\d]/g, "");
  const email = input.email?.trim() ?? "";
  if (!/^[a-zA-Z0-9._-]{4,32}$/.test(username)) return "아이디는 영문·숫자 4–32자로 적어 주세요.";
  if (name.length < 2 || name.length > 40) return "이름을 2자 이상 적어 주세요.";
  if (input.creating && (!input.password || input.password.length < 6 || input.password.length > 80)) {
    return "비밀번호는 6자 이상이어야 합니다.";
  }
  if (input.password && (input.password.length < 6 || input.password.length > 80)) {
    return "비밀번호는 6자 이상이어야 합니다.";
  }
  if (phone && (phone.length < 9 || phone.length > 11)) return "연락처를 숫자로 정확히 적어 주세요.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "이메일을 정확히 적어 주세요.";
  return null;
}

export async function createAdmin(input: {
  username: string;
  password: string;
  name: string;
  title?: string;
  phone?: string;
  email?: string;
}) {
  const username = input.username.trim();
  if (await findStaffByUsername(username)) return { ok: false as const, error: "이미 있는 아이디입니다." };
  const staff: Staff = {
    id: randomBytes(12).toString("hex"),
    username,
    name: input.name.trim(),
    title: input.title?.trim() ?? "",
    phone: (input.phone ?? "").replace(/[^\d]/g, ""),
    email: input.email?.trim() ?? "",
    passwordHash: await hashPassword(input.password),
    role: "admin",
    createdAt: new Date().toISOString(),
  };
  await insertStaff(staff);
  return { ok: true as const, staff };
}

export async function updateStaff(
  id: string,
  input: { name?: string; title?: string; phone?: string; email?: string; password?: string },
) {
  const current = await findStaffById(id);
  if (!current) return { ok: false as const, error: "계정을 찾지 못했습니다." };
  const next: Staff = {
    ...current,
    name: input.name?.trim() ?? current.name,
    title: input.title !== undefined ? input.title.trim() : current.title,
    phone: input.phone !== undefined ? input.phone.replace(/[^\d]/g, "") : current.phone,
    email: input.email !== undefined ? input.email.trim() : current.email,
    passwordHash: input.password ? await hashPassword(input.password) : current.passwordHash,
  };
  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("staff").updateOne({ id }, { $set: { ...next, createdAt: new Date(next.createdAt) } });
  } else {
    const all = await readLocal();
    await writeLocal(all.map((item) => (item.id === id ? next : item)));
  }
  return { ok: true as const, staff: next };
}

export async function deleteAdmin(id: string) {
  const current = await findStaffById(id);
  if (!current) return { ok: false as const, error: "계정을 찾지 못했습니다." };
  if (current.role === "supervisor") return { ok: false as const, error: "감독 계정은 삭제할 수 없습니다." };
  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("staff").deleteOne({ id, role: "admin" as Role });
  } else {
    const all = await readLocal();
    await writeLocal(all.filter((item) => item.id !== id));
  }
  return { ok: true as const };
}

export function publicStaff(staff: Staff) {
  return {
    id: staff.id,
    username: staff.username,
    name: staff.name,
    title: staff.title,
    phone: staff.phone,
    email: staff.email,
    role: staff.role,
    createdAt: staff.createdAt,
  };
}
