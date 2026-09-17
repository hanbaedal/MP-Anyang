import { getDb, hasMongo } from "./mongo";

export type WorkOverview = {
  connected: boolean;
  contractCount: number;
  paidCount: number;
  paidAmount: number;
  unpaidCount: number;
  unpaidAmount: number;
};

const EMPTY: WorkOverview = {
  connected: false,
  contractCount: 0,
  paidCount: 0,
  paidAmount: 0,
  unpaidCount: 0,
  unpaidAmount: 0,
};

function num(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function readWorkOverview(): Promise<WorkOverview> {
  if (!hasMongo()) return EMPTY;
  try {
    const db = await getDb();
    if (!db) return EMPTY;
    const names = new Set((await db.listCollections().toArray()).map((item) => item.name));
    if (!names.has("contracts") && !names.has("fees")) return EMPTY;

    const overview: WorkOverview = { ...EMPTY, connected: true };
    if (names.has("contracts")) {
      overview.contractCount = await db.collection("contracts").countDocuments();
    }
    if (names.has("fees")) {
      const fees = await db.collection("fees").find({}).toArray();
      for (const row of fees) {
        const amount = num((row as { amount?: unknown }).amount);
        if ((row as { paid?: unknown }).paid === true) {
          overview.paidCount += 1;
          overview.paidAmount += amount;
        } else {
          overview.unpaidCount += 1;
          overview.unpaidAmount += amount;
        }
      }
    }
    return overview;
  } catch {
    return EMPTY;
  }
}

export function isWorkEmpty(overview: WorkOverview) {
  return (
    overview.contractCount === 0 &&
    overview.paidCount === 0 &&
    overview.paidAmount === 0 &&
    overview.unpaidCount === 0 &&
    overview.unpaidAmount === 0
  );
}
