import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { getDb, hasMongo } from "./mongo";
import {
  FUNERAL_DOC_IDS,
  type FuneralDocFile,
  type FuneralDocId,
  isFuneralDocId,
} from "./funeral-docs-types";

export type { FuneralDocFile, FuneralDocId } from "./funeral-docs-types";
export {
  FUNERAL_BURIAL_ROWS,
  FUNERAL_CREMATION_ROWS,
  FUNERAL_DOC_IDS,
  FUNERAL_DOC_META,
  isFuneralDocId,
} from "./funeral-docs-types";

const localFile = dataFile("funeral-docs.local.json");

function fromDoc(doc: Record<string, unknown>): FuneralDocFile | null {
  const docId = String(doc.docId ?? "");
  if (!isFuneralDocId(docId)) return null;
  const filePath = String(doc.filePath ?? "");
  const fileName = String(doc.fileName ?? "");
  if (!filePath) return null;
  return {
    docId,
    filePath,
    fileName: fileName || "document.pdf",
    updatedAt: String(doc.updatedAt ?? new Date().toISOString()),
  };
}

async function readStored(): Promise<FuneralDocFile[]> {
  if (hasMongo()) {
    try {
      const db = await getDb();
      if (db) {
        const rows = await db.collection("funeral_docs").find({}).toArray();
        return rows.map((row) => fromDoc(row as Record<string, unknown>)).filter(Boolean) as FuneralDocFile[];
      }
    } catch (error) {
      console.error("[funeral-docs] mongo read failed", error);
    }
  }
  const local = await readJsonFile<FuneralDocFile[]>(localFile, []);
  return local.filter((item) => isFuneralDocId(item.docId) && item.filePath);
}

async function persist(items: FuneralDocFile[]) {
  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("funeral_docs").deleteMany({});
    if (items.length) {
      await db.collection("funeral_docs").insertMany(
        items.map((item) => ({
          ...item,
          updatedAt: item.updatedAt || new Date().toISOString(),
        })),
      );
    }
    return;
  }
  await writeJsonFile(localFile, items);
}

export async function listFuneralDocs(): Promise<FuneralDocFile[]> {
  return readStored();
}

export async function funeralDocsById(): Promise<Partial<Record<FuneralDocId, FuneralDocFile>>> {
  const map: Partial<Record<FuneralDocId, FuneralDocFile>> = {};
  for (const item of await readStored()) {
    map[item.docId] = item;
  }
  return map;
}

export async function setFuneralDoc(input: { docId: FuneralDocId; filePath: string; fileName: string }) {
  const items = await readStored();
  const next: FuneralDocFile = {
    docId: input.docId,
    filePath: input.filePath,
    fileName: input.fileName.trim() || "document.pdf",
    updatedAt: new Date().toISOString(),
  };
  const filtered = items.filter((item) => item.docId !== input.docId);
  filtered.push(next);
  await persist(filtered);
  return next;
}

export async function deleteFuneralDoc(docId: FuneralDocId) {
  if (!FUNERAL_DOC_IDS.includes(docId)) {
    return { ok: false as const, error: "서류 종류를 찾지 못했습니다." };
  }
  const items = await readStored();
  const next = items.filter((item) => item.docId !== docId);
  if (next.length === items.length) {
    return { ok: false as const, error: "등록된 PDF가 없습니다." };
  }
  await persist(next);
  return { ok: true as const };
}
