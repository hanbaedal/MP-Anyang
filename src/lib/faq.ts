import { randomUUID } from "node:crypto";
import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { getDb, hasMongo } from "./mongo";
import type { Locale } from "./i18n";
import { CONTENT_LOCALES, translateText, type ContentLocale } from "./translate-content";

export type FaqLocaleFields = {
  question: string;
  answer: string;
};

export type FaqItem = {
  id: string;
  name: string;
  question: string;
  answer: string;
  createdAt: string;
  public: boolean;
  i18n?: Partial<Record<"en" | "zh", FaqLocaleFields>>;
};

const seedFile = dataFile("faq.json");
const localFile = dataFile("faq.local.json");

function fromDoc(doc: Record<string, unknown>): FaqItem {
  const created = doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt ?? "");
  return {
    id: String(doc.id ?? doc._id ?? ""),
    name: String(doc.name ?? ""),
    question: String(doc.question ?? ""),
    answer: String(doc.answer ?? ""),
    createdAt: created,
    public: doc.public !== false,
    i18n: doc.i18n && typeof doc.i18n === "object" ? (doc.i18n as FaqItem["i18n"]) : undefined,
  };
}

async function readMerged(): Promise<FaqItem[]> {
  const seeded = await readJsonFile<FaqItem[]>(seedFile, []);
  const extra = await readJsonFile<FaqItem[]>(localFile, []);
  const byId = new Map<string, FaqItem>();
  for (const item of [...seeded, ...extra]) byId.set(item.id, item);
  return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
  return readMerged();
}

export async function listPublicFaq(): Promise<FaqItem[]> {
  return (await listFaq()).filter((item) => item.public);
}

export function localizeFaq(item: FaqItem, locale: Locale): FaqItem {
  if (locale === "ko") return item;
  const loc = item.i18n?.[locale];
  if (!loc) return item;
  return {
    ...item,
    question: loc.question || item.question,
    answer: loc.answer || item.answer,
  };
}

export async function listPublicFaqLocalized(locale: Locale): Promise<FaqItem[]> {
  const items = await listPublicFaq();
  if (locale === "ko") return items;
  const out: FaqItem[] = [];
  for (const item of items) {
    let row = item;
    if (!row.i18n?.[locale]?.question) {
      try {
        row = { ...row, i18n: await fillFaqI18n(row, false) };
        await persistFaqItem(row);
      } catch (error) {
        console.error(`[faq] auto-localize ${row.id} failed`, error);
      }
    }
    out.push(localizeFaq(row, locale));
  }
  return out;
}

async function buildFaqLocale(question: string, answer: string, to: ContentLocale): Promise<FaqLocaleFields> {
  return {
    question: await translateText(question, to),
    answer: answer.trim() ? await translateText(answer, to) : "",
  };
}

export async function fillFaqI18n(item: Pick<FaqItem, "question" | "answer" | "i18n">, force = false): Promise<FaqItem["i18n"]> {
  const i18n: NonNullable<FaqItem["i18n"]> = { ...(item.i18n ?? {}) };
  for (const to of CONTENT_LOCALES) {
    if (!force && i18n[to]?.question) continue;
    try {
      i18n[to] = await buildFaqLocale(item.question, item.answer, to);
    } catch (error) {
      console.error(`[faq] translate ${to} failed`, error);
    }
  }
  return i18n;
}

export function validateFaq(input: { name?: string; question?: string; answer?: string }) {
  const name = input.name?.trim() ?? "";
  const question = input.question?.trim() ?? "";
  if (name.length < 2 || name.length > 40) return "이름을 2자 이상 적어 주세요.";
  if (question.length < 5 || question.length > 2000) return "질문을 조금 더 적어 주세요.";
  if ((input.answer ?? "").length > 4000) return "답변이 너무 깁니다.";
  return null;
}

async function persistAll(items: FaqItem[]) {
  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("faq").deleteMany({});
    if (items.length) {
      await db.collection("faq").insertMany(items.map((item) => ({ ...item, createdAt: new Date(item.createdAt) })));
    }
    return;
  }
  await writeJsonFile(localFile, items);
}

export async function saveFaq(input: { name: string; question: string; answer?: string; public?: boolean }) {
  const item: FaqItem = {
    id: randomUUID(),
    name: input.name.trim(),
    question: input.question.trim(),
    answer: (input.answer ?? "").trim(),
    createdAt: new Date().toISOString(),
    public: input.public !== false,
  };
  item.i18n = await fillFaqI18n(item, true);

  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("faq").insertOne({ ...item, createdAt: new Date(item.createdAt) });
    return item;
  }

  const current = await readMerged();
  current.unshift(item);
  await writeJsonFile(localFile, current);
  return item;
}

export async function updateFaq(
  id: string,
  input: { name?: string; question?: string; answer?: string; public?: boolean },
) {
  const items = await listFaq();
  const idx = items.findIndex((item) => item.id === id);
  if (idx < 0) return { ok: false as const, error: "항목을 찾지 못했습니다." };
  const prev = items[idx];
  const question = input.question !== undefined ? input.question.trim() : prev.question;
  const answer = input.answer !== undefined ? input.answer.trim() : prev.answer;
  const contentChanged = question !== prev.question || answer !== prev.answer;
  const next: FaqItem = {
    ...prev,
    name: input.name !== undefined ? input.name.trim() : prev.name,
    question,
    answer,
    public: input.public !== undefined ? input.public : prev.public,
  };
  if (contentChanged) {
    next.i18n = await fillFaqI18n(next, true);
  }
  items[idx] = next;
  await persistAll(items);
  return { ok: true as const, item: items[idx] };
}

export async function deleteFaq(id: string) {
  const items = await listFaq();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return { ok: false as const, error: "항목을 찾지 못했습니다." };
  await persistAll(next);
  return { ok: true as const };
}

export async function persistFaqItem(item: FaqItem) {
  const items = await listFaq();
  const idx = items.findIndex((row) => row.id === item.id);
  if (idx >= 0) items[idx] = item;
  else items.unshift(item);
  await persistAll(items);
}
