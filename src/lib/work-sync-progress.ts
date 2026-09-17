import { WORK_COLLECTIONS } from "./work-store";
import { mongoDbName, mongoUriSet } from "./mongo";

export type WorkCollectionName = (typeof WORK_COLLECTIONS)[number];

export type CollectionProgress = {
  name: WorkCollectionName;
  percent: number;
  done: number;
  total: number;
};

export type WorkSyncProgress = {
  running: boolean;
  phase: "idle" | "login" | "pull" | "write" | "done" | "error";
  overallPercent: number;
  collections: CollectionProgress[];
  message: string;
  savedTo?: "mongo" | "file";
  mongoConfigured: boolean;
  mongoDb: string;
};

function emptyItems(): Record<WorkCollectionName, { percent: number; done: number; total: number }> {
  return {
    contracts: { percent: 0, done: 0, total: 0 },
    fees: { percent: 0, done: 0, total: 0 },
    receipts: { percent: 0, done: 0, total: 0 },
    work_reports: { percent: 0, done: 0, total: 0 },
    cemetery_info: { percent: 0, done: 0, total: 0 },
    work_meta: { percent: 0, done: 0, total: 0 },
  };
}

type ProgressState = {
  running: boolean;
  phase: WorkSyncProgress["phase"];
  message: string;
  savedTo: "mongo" | "file" | undefined;
  items: Record<WorkCollectionName, { percent: number; done: number; total: number }>;
};

declare global {
  var _anyangWorkSyncProgress: ProgressState | undefined;
}

function getState(): ProgressState {
  if (!globalThis._anyangWorkSyncProgress) {
    globalThis._anyangWorkSyncProgress = {
      running: false,
      phase: "idle",
      message: "",
      savedTo: undefined,
      items: emptyItems(),
    };
  }
  return globalThis._anyangWorkSyncProgress;
}

function snapshot(): WorkSyncProgress {
  const state = getState();
  const collections = WORK_COLLECTIONS.map((name) => ({
    name,
    percent: state.items[name].percent,
    done: state.items[name].done,
    total: state.items[name].total,
  }));
  const overallPercent =
    collections.length === 0
      ? 0
      : Math.round(collections.reduce((sum, item) => sum + item.percent, 0) / collections.length);
  return {
    running: state.running,
    phase: state.phase,
    overallPercent,
    collections,
    message: state.message,
    savedTo: state.savedTo,
    mongoConfigured: mongoUriSet(),
    mongoDb: mongoDbName(),
  };
}

export function readWorkSyncProgress(): WorkSyncProgress {
  return snapshot();
}

export function beginWorkSyncProgress(message: string) {
  const state = getState();
  state.running = true;
  state.phase = "login";
  state.message = message;
  state.savedTo = undefined;
  state.items = emptyItems();
}

export function setWorkSyncPhase(phase: WorkSyncProgress["phase"], message?: string) {
  const state = getState();
  state.phase = phase;
  if (message) state.message = message;
}

export function setCollectionProgress(name: WorkCollectionName, done: number, total: number, cap = 100) {
  const state = getState();
  const safeTotal = Math.max(0, total);
  const safeDone = Math.max(0, done);
  const raw = safeTotal === 0 ? (safeDone > 0 ? 100 : 0) : Math.round((safeDone / safeTotal) * 100);
  state.items[name] = {
    done: safeDone,
    total: safeTotal,
    percent: Math.max(0, Math.min(cap, raw)),
  };
}

export function finishWorkSyncProgress(opts: {
  ok: boolean;
  message: string;
  savedTo?: "mongo" | "file";
}) {
  const state = getState();
  state.running = false;
  state.phase = opts.ok ? "done" : "error";
  state.message = opts.message;
  state.savedTo = opts.savedTo;
  if (opts.ok) {
    for (const name of WORK_COLLECTIONS) {
      const cur = state.items[name];
      state.items[name] = {
        done: cur.total || cur.done,
        total: cur.total || cur.done,
        percent: 100,
      };
    }
  }
}

export function mapPullCollection(
  list: "contracts" | "fees" | "receipts" | "reports" | "cemetery",
): WorkCollectionName {
  if (list === "reports") return "work_reports";
  if (list === "cemetery") return "cemetery_info";
  return list;
}
