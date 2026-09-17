import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { getDb, hasMongo } from "./mongo";
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

type WorkDump = {
  meta: WorkMeta | null;
  contracts: ContractCopy[];
  fees: FeeCopy[];
  receipts: ReceiptCopy[];
  reports: ReportCopy[];
  cemetery: CemeteryInfoCopy[];
};

const files = {
  meta: dataFile("work-meta.local.json"),
  contracts: dataFile("work-contracts.local.json"),
  fees: dataFile("work-fees.local.json"),
  receipts: dataFile("work-receipts.local.json"),
  reports: dataFile("work-reports.local.json"),
  cemetery: dataFile("work-cemetery.local.json"),
};

async function workDb() {
  if (!hasMongo()) return null;
  try {
    return await getDb();
  } catch {
    console.error("[work-store] mongo unavailable, using local files");
    return null;
  }
}

export async function saveWorkDump(dump: WorkDump) {
  const db = await workDb();
  if (db) {
    const writes: Array<Promise<unknown>> = [];
    const replace = async (name: string, docs: object[]) => {
      const col = db.collection(name);
      await col.deleteMany({});
      for (let i = 0; i < docs.length; i += 500) {
        const chunk = docs.slice(i, i + 500).map((doc) => ({ ...doc }));
        if (chunk.length) await col.insertMany(chunk);
      }
    };
    writes.push(replace("contracts", dump.contracts));
    writes.push(replace("fees", dump.fees));
    writes.push(replace("receipts", dump.receipts));
    writes.push(replace("work_reports", dump.reports));
    writes.push(replace("cemetery_info", dump.cemetery));
    writes.push(replace("work_meta", dump.meta ? [dump.meta] : []));
    await Promise.all(writes);
  }
  await writeJsonFile(files.contracts, dump.contracts);
  await writeJsonFile(files.fees, dump.fees);
  await writeJsonFile(files.receipts, dump.receipts);
  await writeJsonFile(files.reports, dump.reports);
  await writeJsonFile(files.cemetery, dump.cemetery);
  await writeJsonFile(files.meta, dump.meta);
}

export async function readWorkDump(): Promise<WorkDump> {
  const empty: WorkDump = { meta: null, contracts: [], fees: [], receipts: [], reports: [], cemetery: [] };
  const db = await workDb();
  if (db) {
    try {
      const names = new Set((await db.listCollections().toArray()).map((item) => item.name));
      const many = async <T,>(name: string) =>
        names.has(name) ? ((await db.collection(name).find({}).toArray()) as unknown as T[]) : [];
      const metaRows = await many<WorkMeta>("work_meta");
      return {
        meta: metaRows[0] ?? null,
        contracts: await many<ContractCopy>("contracts"),
        fees: await many<FeeCopy>("fees"),
        receipts: await many<ReceiptCopy>("receipts"),
        reports: await many<ReportCopy>("work_reports"),
        cemetery: await many<CemeteryInfoCopy>("cemetery_info"),
      };
    } catch {
      console.error("[work-store] mongo read failed, using local files");
    }
  }
  return {
    meta: await readJsonFile<WorkMeta | null>(files.meta, null),
    contracts: await readJsonFile<ContractCopy[]>(files.contracts, []),
    fees: await readJsonFile<FeeCopy[]>(files.fees, []),
    receipts: await readJsonFile<ReceiptCopy[]>(files.receipts, []),
    reports: await readJsonFile<ReportCopy[]>(files.reports, []),
    cemetery: await readJsonFile<CemeteryInfoCopy[]>(files.cemetery, []),
  };
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
