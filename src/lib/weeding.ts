import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getDb, hasMongo } from "./mongo";

export type WeedingRequest = {
  id: string;
  name: string;
  phone: string;
  plot: string;
  when: string;
  note: string;
  createdAt: string;
  status: "new";
};

const localFile = path.join(process.cwd(), "data", "weeding.local.json");

function cleanPhone(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

export function validateWeeding(input: {
  name?: string;
  phone?: string;
  plot?: string;
  when?: string;
  note?: string;
}) {
  const name = input.name?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const plot = input.plot?.trim() ?? "";
  const when = input.when?.trim() ?? "";
  const note = input.note?.trim() ?? "";
  const digits = cleanPhone(phone);
  if (name.length < 2 || name.length > 40) return "이름을 2자 이상 적어 주세요.";
  if (digits.length < 9 || digits.length > 11) return "연락처를 숫자로 정확히 적어 주세요.";
  if (plot.length < 2 || plot.length > 200) return "내용을 조금 더 적어 주세요.";
  if (when.length < 2 || when.length > 120) return "내용을 조금 더 적어 주세요.";
  if (note.length > 2000) return "내용을 조금 더 적어 주세요.";
  return null;
}

export async function saveWeeding(input: {
  name: string;
  phone: string;
  plot: string;
  when: string;
  note: string;
}) {
  const item: WeedingRequest = {
    id: randomUUID(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    plot: input.plot.trim(),
    when: input.when.trim(),
    note: input.note.trim(),
    createdAt: new Date().toISOString(),
    status: "new",
  };

  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("weeding").insertOne({ ...item, createdAt: new Date(item.createdAt) });
    return { stored: "mongo" as const };
  }

  await mkdir(path.dirname(localFile), { recursive: true });
  let current: WeedingRequest[] = [];
  try {
    current = JSON.parse(await readFile(localFile, "utf8")) as WeedingRequest[];
  } catch {
    current = [];
  }
  current.unshift(item);
  await writeFile(localFile, JSON.stringify(current, null, 2), "utf8");
  return { stored: "file" as const };
}
