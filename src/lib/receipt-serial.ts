import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { getDb, hasMongo } from "./mongo";

const localCounterFile = dataFile("receipt-serial-counter.local.json");

function kstYmdParts(date = new Date()) {
  const kst = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const y = kst.getFullYear() % 100;
  const m = kst.getMonth() + 1;
  const d = kst.getDate();
  const yy = String(y).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return { dateKey: `${yy}${mm}${dd}`, yy, mm, dd };
}

function formatSerial(dateKey: string, seq: number) {
  return `${dateKey}${String(seq).padStart(3, "0")}`;
}

async function nextSeqLocal(dateKey: string, count: number) {
  const store = await readJsonFile<{ dateKey: string; seq: number }>(localCounterFile, { dateKey: "", seq: 0 });
  let seq = store.dateKey === dateKey ? store.seq : 0;
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    seq += 1;
    if (seq > 999) seq = 999;
    out.push(formatSerial(dateKey, seq));
  }
  await writeJsonFile(localCounterFile, { dateKey, seq });
  return out;
}

async function nextSeqMongo(dateKey: string, count: number) {
  const db = await getDb();
  if (!db) throw new Error("MongoDB 연결 실패");
  const col = db.collection("receipt_serial_meta");
  const result = await col.findOneAndUpdate(
    { dateKey },
    { $inc: { seq: count }, $setOnInsert: { dateKey } },
    { upsert: true, returnDocument: "after" },
  );
  const end = Number(result?.seq ?? count);
  const start = end - count + 1;
  const out: string[] = [];
  for (let s = start; s <= end; s++) {
    out.push(formatSerial(dateKey, Math.min(s, 999)));
  }
  return out;
}

/** 발급일(KST) 기준 YYMMDD + 3자리 일련번호 */
export async function allocateReceiptSerials(count = 1): Promise<string[]> {
  const n = Math.max(1, Math.min(count, 50));
  const { dateKey } = kstYmdParts();
  if (hasMongo()) {
    try {
      return await nextSeqMongo(dateKey, n);
    } catch (error) {
      console.error("[receipt-serial] mongo failed, fallback local", error);
    }
  }
  return nextSeqLocal(dateKey, n);
}
