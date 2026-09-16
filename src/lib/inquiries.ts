import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getDb, hasMongo } from "./mongo";

export type Inquiry = {
  name: string;
  phone: string;
  message: string;
  createdAt: Date;
  status: "new" | "stored";
};

const localFile = path.join(process.cwd(), "data", "inquiries.local.json");

function cleanPhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
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

async function saveLocal(inquiry: Inquiry) {
  await mkdir(path.dirname(localFile), { recursive: true });
  let current: Inquiry[] = [];
  try {
    current = JSON.parse(await readFile(localFile, "utf8")) as Inquiry[];
  } catch {
    current = [];
  }
  current.unshift(inquiry);
  await writeFile(localFile, JSON.stringify(current, null, 2), "utf8");
}

export async function saveInquiry(input: { name: string; phone: string; message: string }) {
  const inquiry: Inquiry = {
    name: input.name.trim(),
    phone: input.phone.trim(),
    message: input.message.trim(),
    createdAt: new Date(),
    status: "new",
  };

  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("inquiries").insertOne({
      ...inquiry,
      inbox: process.env.INQUIRY_INBOX?.trim() || null,
    });
    return { stored: "mongo" as const };
  }

  await saveLocal(inquiry);
  return { stored: "file" as const };
}

export function inquiryInboxConfigured() {
  return Boolean(process.env.INQUIRY_INBOX?.trim());
}
