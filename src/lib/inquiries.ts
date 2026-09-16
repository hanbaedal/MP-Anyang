import { randomUUID } from "node:crypto";
import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { getDb, hasMongo } from "./mongo";

export type Inquiry = {
  id: string;
  name: string;
  phone: string;
  message: string;
  createdAt: string;
  status: "new" | "answered";
  answer: string;
  answeredAt?: string;
  answeredBy?: string;
};

const localFile = dataFile("inquiries.local.json");

function cleanPhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function fromDoc(doc: Record<string, unknown>): Inquiry {
  const created = doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt ?? "");
  return {
    id: String(doc.id ?? doc._id ?? ""),
    name: String(doc.name ?? ""),
    phone: String(doc.phone ?? ""),
    message: String(doc.message ?? ""),
    createdAt: created,
    status: doc.status === "answered" || doc.answer ? "answered" : "new",
    answer: String(doc.answer ?? ""),
    answeredAt: doc.answeredAt instanceof Date ? doc.answeredAt.toISOString() : doc.answeredAt ? String(doc.answeredAt) : undefined,
    answeredBy: doc.answeredBy ? String(doc.answeredBy) : undefined,
  };
}

export function validateInquiry(input: { name?: string; phone?: string; message?: string }) {
  const name = input.name?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const message = input.message?.trim() ?? "";
  const digits = cleanPhone(phone);

  if (name.length < 2 || name.length > 40) return "이름을 2자 이상 적어 주세요.";
  if (digits.length < 9 || digits.length > 11) return "연락처를 숫자로 정확히 적어 주세요.";
  if (message.length < 5 || message.length > 2000) return "문의 내용을 조금 더 적어 주세요.";
  return null;
}

async function readLocal() {
  const raw = await readJsonFile<Array<Inquiry & { createdAt: string | Date }>>(localFile, []);
  return raw.map((item) => fromDoc(item as unknown as Record<string, unknown>));
}

export async function saveInquiry(input: { name: string; phone: string; message: string }) {
  const inquiry: Inquiry = {
    id: randomUUID(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    message: input.message.trim(),
    createdAt: new Date().toISOString(),
    status: "new",
    answer: "",
  };

  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("inquiries").insertOne({
      ...inquiry,
      createdAt: new Date(inquiry.createdAt),
      inbox: process.env.INQUIRY_INBOX?.trim() || null,
    });
    return { stored: "mongo" as const };
  }

  const current = await readLocal();
  current.unshift(inquiry);
  await writeJsonFile(localFile, current);
  return { stored: "file" as const };
}

export async function listInquiries(): Promise<Inquiry[]> {
  if (hasMongo()) {
    const db = await getDb();
    if (db) {
      const rows = await db.collection("inquiries").find({}).sort({ createdAt: -1 }).toArray();
      return rows.map((row) => fromDoc(row as Record<string, unknown>));
    }
  }
  return readLocal();
}

export async function answerInquiry(id: string, answer: string, answeredBy: string) {
  const memo = answer.trim();
  if (!memo) return { ok: false as const, error: "답변 메모를 적어 주세요." };
  const answeredAt = new Date().toISOString();

  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    const result = await db.collection("inquiries").updateOne(
      { id },
      { $set: { answer: memo, status: "answered", answeredAt: new Date(answeredAt), answeredBy } },
    );
    if (!result.matchedCount) {
      const byOid = await db.collection("inquiries").updateOne(
        { _id: id as never },
        { $set: { answer: memo, status: "answered", answeredAt: new Date(answeredAt), answeredBy } },
      );
      if (!byOid.matchedCount) return { ok: false as const, error: "문의를 찾지 못했습니다." };
    }
    return { ok: true as const };
  }

  const all = await readLocal();
  const idx = all.findIndex((item) => item.id === id);
  if (idx < 0) return { ok: false as const, error: "문의를 찾지 못했습니다." };
  all[idx] = { ...all[idx], answer: memo, status: "answered", answeredAt, answeredBy };
  await writeJsonFile(localFile, all);
  return { ok: true as const };
}

export function inquiryInboxConfigured() {
  return Boolean(process.env.INQUIRY_INBOX?.trim());
}
