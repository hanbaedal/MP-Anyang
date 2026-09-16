import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getDb, hasMongo } from "./mongo";

export type FaqItem = {
  id: string;
  name: string;
  question: string;
  answer: string;
  createdAt: string;
  public: boolean;
};

const seedFile = path.join(process.cwd(), "data", "faq.json");
const localFile = path.join(process.cwd(), "data", "faq.local.json");

function fromDoc(doc: Record<string, unknown>): FaqItem {
  const created =
    doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt ?? "");
  return {
    id: String(doc.id ?? doc._id ?? ""),
    name: String(doc.name ?? ""),
    question: String(doc.question ?? ""),
    answer: String(doc.answer ?? ""),
    createdAt: created,
    public: doc.public !== false,
  };
}

async function readJson(file: string): Promise<FaqItem[]> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as FaqItem[];
  } catch {
    return [];
  }
}

export function validateFaq(input: { name?: string; question?: string }) {
  const name = input.name?.trim() ?? "";
  const question = input.question?.trim() ?? "";
  if (name.length < 2 || name.length > 40) return "이름을 2자 이상 적어 주세요.";
  if (question.length < 5 || question.length > 2000) return "내용을 조금 더 적어 주세요.";
  return null;
}

export async function listFaq(): Promise<FaqItem[]> {
  if (hasMongo()) {
    try {
      const db = await getDb();
      if (db) {
        const rows = await db.collection("faq").find({}).sort({ createdAt: -1 }).toArray();
        if (rows.length) return rows.map((row) => fromDoc(row as Record<string, unknown>));
      }
    } catch (error) {
      console.error("[faq] mongo read failed, using file fallback", error);
    }
  }
  const seeded = await readJson(seedFile);
  const extra = await readJson(localFile);
  return [...extra, ...seeded].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveFaq(input: { name: string; question: string }) {
  const item: FaqItem = {
    id: randomUUID(),
    name: input.name.trim(),
    question: input.question.trim(),
    answer: "",
    createdAt: new Date().toISOString(),
    public: true,
  };

  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("faq").insertOne({ ...item, createdAt: new Date(item.createdAt) });
    return { stored: "mongo" as const };
  }

  await mkdir(path.dirname(localFile), { recursive: true });
  const current = await readJson(localFile);
  current.unshift(item);
  await writeFile(localFile, JSON.stringify(current, null, 2), "utf8");
  return { stored: "file" as const };
}
