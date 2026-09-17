import { existsSync } from "node:fs";
import { cache } from "react";
import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { getDb, hasMongo, mongoDbName, mongoUriSet, requireDb } from "./mongo";
import type { CemeteryInfoCopy, ContractCopy, FeeCopy, ReceiptCopy, ReportCopy } from "./cemetery-parse";

export type WorkMeta = {
  syncedAt: string;
  sourceHost: string;
  contractCount: number;
  listedContractTotal: number;
  feeCount: number;
  receiptCount: number;
  reportCount: number;
  cemeteryCount: number;
  message: string;
};

export type WorkStorage = {
  used: "mongo" | "file" | "none";
  mongoConfigured: boolean;
  filePresent: boolean;
};

type WorkLists = {
  meta: WorkMeta | null;
  contracts: ContractCopy[];
  fees: FeeCopy[];
  receipts: ReceiptCopy[];
  reports: ReportCopy[];
  cemetery: CemeteryInfoCopy[];
};

export type WorkDump = WorkLists & { storage: WorkStorage };

export const WORK_COLLECTIONS = ["contracts", "fees", "receipts", "work_reports", "cemetery_info", "work_meta"] as const;

export type WorkSaveResult = {
  mongo: boolean;
  file: boolean;
  dbName: string;
  counts: Record<(typeof WORK_COLLECTIONS)[number], number>;
};

const files = {
  meta: dataFile("work-meta.local.json"),
  contracts: dataFile("work-contracts.local.json"),
  fees: dataFile("work-fees.local.json"),
  receipts: dataFile("work-receipts.local.json"),
  reports: dataFile("work-reports.local.json"),
  cemetery: dataFile("work-cemetery.local.json"),
};

const DOT = ".";
const DOT_SAFE = "\uFF0E";

function encodeMongoKey(key: string) {
  return key.replaceAll(DOT, DOT_SAFE);
}

function decodeMongoKey(key: string) {
  return key.replaceAll(DOT_SAFE, DOT);
}

function mapKeys(value: unknown, mapKey: (key: string) => string): unknown {
  if (Array.isArray(value)) return value.map((item) => mapKeys(item, mapKey));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (key === "_id") continue;
      out[mapKey(key)] = mapKeys(nested, mapKey);
    }
    return out;
  }
  return value;
}

function toMongoDocs(docs: object[]) {
  return docs.map((doc) => mapKeys(doc, encodeMongoKey) as object);
}

function workFilesPresent() {
  return existsSync(files.meta) || existsSync(files.contracts) || existsSync(files.fees);
}

export function dumpHasCopyRows(dump: WorkLists) {
  return (
    dump.contracts.length > 0 ||
    dump.fees.length > 0 ||
    dump.receipts.length > 0 ||
    dump.reports.length > 0 ||
    dump.cemetery.length > 0
  );
}

export function pickWorkDump(
  mongo: WorkLists | null,
  file: WorkLists,
  flags: { mongoConfigured: boolean; filePresent: boolean },
): WorkDump {
  if (mongo) {
    return { ...mongo, storage: { used: "mongo", ...flags } };
  }
  if (dumpHasCopyRows(file) || flags.filePresent) {
    return { ...file, storage: { used: "file", ...flags } };
  }
  return { ...file, storage: { used: flags.filePresent ? "file" : "none", ...flags } };
}

function withoutMongoId<T>(docs: object[]): T[] {
  return docs.map((doc) => {
    const { _id: _ignored, ...rest } = doc as { _id?: unknown } & T;
    return mapKeys(rest, decodeMongoKey) as T;
  });
}

export type WorkDumpSlice = "full" | "contracts" | "fees" | "receipts" | "reports" | "master" | "status";

type WorkListKey = keyof Omit<WorkLists, "meta">;

type WorkSliceSpec = {
  meta: boolean;
  contracts: boolean;
  fees: boolean;
  receipts: boolean;
  reports: boolean;
  cemetery: boolean;
};

const SLICE_SPEC: Record<WorkDumpSlice, WorkSliceSpec> = {
  full: { meta: true, contracts: true, fees: true, receipts: true, reports: true, cemetery: true },
  contracts: { meta: true, contracts: true, fees: false, receipts: false, reports: false, cemetery: false },
  fees: { meta: true, contracts: false, fees: true, receipts: false, reports: false, cemetery: false },
  receipts: { meta: true, contracts: false, fees: false, receipts: false, reports: false, cemetery: false },
  reports: { meta: true, contracts: false, fees: false, receipts: false, reports: true, cemetery: false },
  master: { meta: true, contracts: false, fees: false, receipts: false, reports: false, cemetery: false },
  status: { meta: true, contracts: true, fees: true, receipts: false, reports: false, cemetery: false },
};

function sliceHasRows(spec: WorkSliceSpec, lists: WorkLists) {
  if (lists.meta) return true;
  const keys: WorkListKey[] = ["contracts", "fees", "receipts", "reports", "cemetery"];
  return keys.some((key) => spec[key] && lists[key].length > 0);
}

async function readFileSlice(spec: WorkSliceSpec): Promise<WorkLists> {
  const [meta, contracts, fees, receipts, reports, cemetery] = await Promise.all([
    spec.meta ? readJsonFile<WorkMeta | null>(files.meta, null) : Promise.resolve(null),
    spec.contracts ? readJsonFile<ContractCopy[]>(files.contracts, []) : Promise.resolve([]),
    spec.fees ? readJsonFile<FeeCopy[]>(files.fees, []) : Promise.resolve([]),
    spec.receipts ? readJsonFile<ReceiptCopy[]>(files.receipts, []) : Promise.resolve([]),
    spec.reports ? readJsonFile<ReportCopy[]>(files.reports, []) : Promise.resolve([]),
    spec.cemetery ? readJsonFile<CemeteryInfoCopy[]>(files.cemetery, []) : Promise.resolve([]),
  ]);
  return { meta, contracts, fees, receipts, reports, cemetery };
}

async function readFileDump(): Promise<WorkLists> {
  return readFileSlice(SLICE_SPEC.full);
}

async function readMongoSlice(spec: WorkSliceSpec): Promise<WorkLists | null> {
  if (!mongoUriSet()) return null;
  try {
    const db = await getDb();
    if (!db) return null;
    const names = new Set((await db.listCollections().toArray()).map((item) => item.name));
    const many = async <T,>(name: string) =>
      names.has(name) ? withoutMongoId<T>((await db.collection(name).find({}).toArray()) as object[]) : [];
    const metaPromise = spec.meta
      ? many<WorkMeta>("work_meta").then((rows) => rows[0] ?? null)
      : Promise.resolve(null);
    const [meta, contracts, fees, receipts, reports, cemetery] = await Promise.all([
      metaPromise,
      spec.contracts ? many<ContractCopy>("contracts") : Promise.resolve([]),
      spec.fees ? many<FeeCopy>("fees") : Promise.resolve([]),
      spec.receipts ? many<ReceiptCopy>("receipts") : Promise.resolve([]),
      spec.reports ? many<ReportCopy>("work_reports") : Promise.resolve([]),
      spec.cemetery ? many<CemeteryInfoCopy>("cemetery_info") : Promise.resolve([]),
    ]);
    return { meta, contracts, fees, receipts, reports, cemetery };
  } catch {
    console.error("[work-store] mongo read failed; falling back to local files (URI not logged)");
    return null;
  }
}

async function readMongoDump(): Promise<WorkLists | null> {
  return readMongoSlice(SLICE_SPEC.full);
}

function storageFlags(fileHint: boolean) {
  return {
    mongoConfigured: hasMongo(),
    filePresent: workFilesPresent() || fileHint,
  };
}

async function readWorkDumpSliceImpl(slice: WorkDumpSlice): Promise<WorkDump> {
  const spec = SLICE_SPEC[slice];
  if (mongoUriSet()) {
    const mongo = await readMongoSlice(spec);
    if (mongo && sliceHasRows(spec, mongo)) {
      return { ...mongo, storage: { used: "mongo", ...storageFlags(false) } };
    }
  }
  const file = await readFileSlice(spec);
  const mongo = mongoUriSet() ? await readMongoSlice(spec) : null;
  const fileHint = dumpHasCopyRows(file) || Boolean(file.meta);
  return pickWorkDump(mongo, file, storageFlags(fileHint));
}

async function replaceCollection(
  db: Awaited<ReturnType<typeof requireDb>>,
  name: string,
  docs: object[],
  onChunk?: (done: number, total: number) => void,
) {
  const staging = `${name}__staging`;
  const staged = db.collection(staging);
  await staged.drop().catch(() => undefined);
  const payload = toMongoDocs(docs);
  if (payload.length === 0) {
    await db.collection(name).deleteMany({});
    await staged.drop().catch(() => undefined);
    onChunk?.(1, 1);
    return;
  }
  let written = 0;
  onChunk?.(0, payload.length);
  for (let i = 0; i < payload.length; i += 500) {
    const chunk = payload.slice(i, i + 500);
    if (chunk.length) await staged.insertMany(chunk, { ordered: false });
    written += chunk.length;
    onChunk?.(written, payload.length);
  }
  try {
    await db.renameCollection(staging, name, { dropTarget: true });
  } catch {
    const live = db.collection(name);
    await live.deleteMany({});
    written = 0;
    for (let i = 0; i < payload.length; i += 500) {
      const chunk = payload.slice(i, i + 500);
      if (chunk.length) await live.insertMany(chunk, { ordered: false });
      written += chunk.length;
      onChunk?.(written, payload.length);
    }
    await staged.drop().catch(() => undefined);
  }
  onChunk?.(payload.length, payload.length);
}

async function writeMongoDump(
  dump: WorkLists,
  onCollection?: (name: (typeof WORK_COLLECTIONS)[number], done: number, total: number) => void,
) {
  const db = await requireDb();
  await replaceCollection(db, "contracts", dump.contracts, (done, total) => onCollection?.("contracts", done, total));
  await replaceCollection(db, "fees", dump.fees, (done, total) => onCollection?.("fees", done, total));
  await replaceCollection(db, "receipts", dump.receipts, (done, total) => onCollection?.("receipts", done, total));
  await replaceCollection(db, "work_reports", dump.reports, (done, total) => onCollection?.("work_reports", done, total));
  await replaceCollection(db, "cemetery_info", dump.cemetery, (done, total) => onCollection?.("cemetery_info", done, total));
  const metaCol = db.collection<{ _id: string } & Record<string, unknown>>("work_meta");
  onCollection?.("work_meta", 0, 1);
  if (dump.meta) {
    const body = toMongoDocs([dump.meta])[0] as Record<string, unknown>;
    await metaCol.replaceOne({ _id: "current" }, { _id: "current", ...body }, { upsert: true });
  } else {
    await metaCol.deleteMany({});
  }
  onCollection?.("work_meta", 1, 1);
}

async function writeFileDump(dump: WorkLists) {
  await writeJsonFile(files.contracts, dump.contracts);
  await writeJsonFile(files.fees, dump.fees);
  await writeJsonFile(files.receipts, dump.receipts);
  await writeJsonFile(files.reports, dump.reports);
  await writeJsonFile(files.cemetery, dump.cemetery);
  await writeJsonFile(files.meta, dump.meta);
}

export async function saveWorkDump(
  dump: WorkLists,
  opts: { onCollection?: (name: (typeof WORK_COLLECTIONS)[number], done: number, total: number) => void } = {},
): Promise<WorkSaveResult> {
  const counts: WorkSaveResult["counts"] = {
    contracts: dump.contracts.length,
    fees: dump.fees.length,
    receipts: dump.receipts.length,
    work_reports: dump.reports.length,
    cemetery_info: dump.cemetery.length,
    work_meta: dump.meta ? 1 : 0,
  };
  let mongo = false;
  if (mongoUriSet()) {
    await writeMongoDump(dump, opts.onCollection);
    mongo = true;
    console.log(
      `[work-store] mongo upsert db=${mongoDbName()} contracts=${counts.contracts} fees=${counts.fees} receipts=${counts.receipts} reports=${counts.work_reports} cemetery=${counts.cemetery_info}`,
    );
  } else {
    const mark = (name: (typeof WORK_COLLECTIONS)[number], total: number) => {
      opts.onCollection?.(name, 0, total || 1);
      opts.onCollection?.(name, total || 1, total || 1);
    };
    mark("contracts", counts.contracts);
    mark("fees", counts.fees);
    mark("receipts", counts.receipts);
    mark("work_reports", counts.work_reports);
    mark("cemetery_info", counts.cemetery_info);
    mark("work_meta", counts.work_meta);
  }
  let file = false;
  try {
    await writeFileDump(dump);
    file = true;
  } catch {
    console.error("[work-store] local json write failed");
    if (!mongo) throw new Error("FILE_WRITE_FAILED");
  }
  return { mongo, file, dbName: mongoDbName(), counts };
}

/** 경영관리·계약·관리비·영수증이 같은 복사본을 읽습니다. URI가 있으면 Mongo가 우선, JSON은 로컬 폴백입니다. */
export const readWorkDumpBySlice = cache(readWorkDumpSliceImpl);

export async function readWorkDump(): Promise<WorkDump> {
  return readWorkDumpBySlice("full");
}

export async function countWorkCollections() {
  if (!mongoUriSet()) return { configured: false as const, dbName: mongoDbName(), counts: null };
  const db = await requireDb();
  const counts: Record<string, number> = {};
  for (const name of WORK_COLLECTIONS) {
    counts[name] = await db.collection(name).countDocuments();
  }
  return { configured: true as const, dbName: mongoDbName(), counts };
}

export function summarizeFees(fees: FeeCopy[]) {
  const unpaidStatuses = new Set(["미납", "납부중", "보류"]);
  let paidCount = 0;
  let paidAmount = 0;
  let unpaidCount = 0;
  let unpaidAmount = 0;
  const paidKeys = new Set<string>();
  const unpaidKeys = new Set<string>();
  for (const row of fees) {
    const key = row.tombNo || row.ref || `${row.userName}-${row.billedOn}`;
    if (row.status === "완납" || (row.paidAmount > 0 && row.balance === 0 && row.status !== "미납")) {
      paidAmount += row.paidAmount;
      if (!paidKeys.has(key)) {
        paidKeys.add(key);
        paidCount += 1;
      }
    }
    if (unpaidStatuses.has(row.status) || row.balance > 0) {
      unpaidAmount += row.balance > 0 ? row.balance : Math.max(0, row.billedAmount - row.paidAmount);
      if (!unpaidKeys.has(key)) {
        unpaidKeys.add(key);
        unpaidCount += 1;
      }
    }
  }
  return { paidCount, paidAmount, unpaidCount, unpaidAmount };
}
