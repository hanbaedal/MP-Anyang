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
  /** 관리 답변 시 솔라피 문자 발송 결과 */
  smsStatus?: "sent" | "failed" | "skipped";
  smsError?: string;
  smsSentAt?: string;
  smsTo?: string;
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
    smsStatus:
      doc.smsStatus === "sent" || doc.smsStatus === "failed" || doc.smsStatus === "skipped"
        ? doc.smsStatus
        : undefined,
    smsError: doc.smsError ? String(doc.smsError) : undefined,
    smsSentAt: doc.smsSentAt instanceof Date ? doc.smsSentAt.toISOString() : doc.smsSentAt ? String(doc.smsSentAt) : undefined,
    smsTo: doc.smsTo ? String(doc.smsTo) : undefined,
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

export async function getInquiry(id: string): Promise<Inquiry | null> {
  if (hasMongo()) {
    const db = await getDb();
    if (db) {
      const byId = await db.collection("inquiries").findOne({ id });
      if (byId) return fromDoc(byId as Record<string, unknown>);
      try {
        const byOid = await db.collection("inquiries").findOne({ _id: id as never });
        if (byOid) return fromDoc(byOid as Record<string, unknown>);
      } catch {
        /* ignore invalid ObjectId */
      }
    }
  }
  const all = await readLocal();
  return all.find((item) => item.id === id) ?? null;
}

export async function answerInquiry(id: string, answer: string, answeredBy: string) {
  const memo = answer.trim();
  if (!memo) return { ok: false as const, error: "답변 내용을 적어 주세요." };
  const answeredAt = new Date().toISOString();
  const patch = {
    answer: memo,
    status: "answered" as const,
    answeredAt,
    answeredBy,
  };

  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    const result = await db.collection("inquiries").findOneAndUpdate(
      { id },
      { $set: { ...patch, answeredAt: new Date(answeredAt) } },
      { returnDocument: "after" },
    );
    if (result) return { ok: true as const, inquiry: fromDoc(result as Record<string, unknown>) };

    const byOid = await db.collection("inquiries").findOneAndUpdate(
      { _id: id as never },
      { $set: { ...patch, answeredAt: new Date(answeredAt) } },
      { returnDocument: "after" },
    );
    if (!byOid) return { ok: false as const, error: "문의를 찾지 못했습니다." };
    return { ok: true as const, inquiry: fromDoc(byOid as Record<string, unknown>) };
  }

  const all = await readLocal();
  const idx = all.findIndex((item) => item.id === id);
  if (idx < 0) return { ok: false as const, error: "문의를 찾지 못했습니다." };
  all[idx] = { ...all[idx], ...patch };
  await writeJsonFile(localFile, all);
  return { ok: true as const, inquiry: all[idx] };
}

export async function setInquirySmsResult(
  id: string,
  sms: {
    smsStatus: "sent" | "failed" | "skipped";
    smsError?: string;
    smsTo?: string;
  },
) {
  const smsSentAt = new Date().toISOString();
  const fields = {
    smsStatus: sms.smsStatus,
    smsError: sms.smsError ?? "",
    smsTo: sms.smsTo ?? "",
    smsSentAt,
  };

  if (hasMongo()) {
    const db = await getDb();
    if (!db) return;
    const result = await db.collection("inquiries").updateOne(
      { id },
      { $set: { ...fields, smsSentAt: new Date(smsSentAt) } },
    );
    if (!result.matchedCount) {
      await db.collection("inquiries").updateOne(
        { _id: id as never },
        { $set: { ...fields, smsSentAt: new Date(smsSentAt) } },
      );
    }
    return;
  }

  const all = await readLocal();
  const idx = all.findIndex((item) => item.id === id);
  if (idx < 0) return;
  all[idx] = { ...all[idx], ...fields };
  await writeJsonFile(localFile, all);
}

export function inquiryInboxConfigured() {
  return Boolean(process.env.INQUIRY_INBOX?.trim());
}
