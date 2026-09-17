import { pullCemeterySource, resolveSourceLogin, SOURCE_LOGIN_MISSING, type SourceLogin } from "./cemetery-source";
import { mongoDbName, mongoUriSet } from "./mongo";
import { saveWorkDump, summarizeFees } from "./work-store";
import {
  beginWorkSyncProgress,
  finishWorkSyncProgress,
  mapPullCollection,
  setCollectionProgress,
  setWorkSyncPhase,
} from "./work-sync-progress";

export type WorkSyncOk = {
  ok: true;
  skipped?: false;
  message: string;
  contractCount: number;
  feeCount: number;
  receiptCount: number;
  reportCount: number;
  cemeteryCount: number;
  paidCount: number;
  paidAmount: number;
  unpaidCount: number;
  unpaidAmount: number;
  savedTo: "mongo" | "file";
  mongoDb: string;
  collections: Record<string, number>;
};

export type WorkSyncFail = {
  ok: false;
  skipped?: false;
  error: string;
  message: string;
};

export type WorkSyncSkip = {
  ok: false;
  skipped: true;
  message: string;
};

export type WorkSyncResult = WorkSyncOk | WorkSyncFail | WorkSyncSkip;

const MONGO_WRITE_FAILED = "MongoDB에 복사본을 넣지 못했습니다. MONGODB_URI와 네트워크를 확인하세요.";

let syncing = false;

export async function syncWorkFromSource(creds: SourceLogin): Promise<WorkSyncOk | WorkSyncFail> {
  setWorkSyncPhase("login", "원본에 로그인하는 중…");
  const pulled = await pullCemeterySource(creds, {
    onPull: (list, done, total) => {
      setWorkSyncPhase("pull");
      setCollectionProgress(mapPullCollection(list), done, total, 80);
    },
  });
  if (!pulled.ok) {
    return { ok: false as const, error: pulled.error || "원본에서 자료를 읽지 못했습니다.", message: pulled.error || "원본에서 자료를 읽지 못했습니다." };
  }
  const feeSum = summarizeFees(pulled.fees);
  const dbLabel = mongoDbName();
  const useMongo = mongoUriSet();
  const meta = {
    syncedAt: new Date().toISOString(),
    sourceHost: (process.env.CEMETERY_SOURCE_URL?.trim() || "http://1.255.226.45:88/Cemetery").replace(/\/$/, ""),
    contractCount: pulled.contracts.length,
    listedContractTotal: pulled.listedContractTotal,
    feeCount: pulled.fees.length,
    receiptCount: pulled.receipts.length,
    reportCount: pulled.reports.length,
    cemeteryCount: pulled.cemetery.length,
    message: useMongo
      ? `계약 ${pulled.contracts.length}건, 관리비 ${pulled.fees.length}건, 영수증 ${pulled.receipts.length}건을 MongoDB(${dbLabel})에 넣었습니다.`
      : `계약 ${pulled.contracts.length}건, 관리비 ${pulled.fees.length}건, 영수증 ${pulled.receipts.length}건을 이 서버 로컬 파일에 복사했습니다. MongoDB에 저장하려면 MONGODB_URI를 설정하세요.`,
  };
  setWorkSyncPhase("write", useMongo ? `MongoDB(${dbLabel})에 넣는 중…` : "로컬 파일에 저장하는 중…");
  let saved;
  try {
    saved = await saveWorkDump(
      {
        meta,
        contracts: pulled.contracts,
        fees: pulled.fees,
        receipts: pulled.receipts,
        reports: pulled.reports,
        cemetery: pulled.cemetery,
      },
      {
        onCollection: (name, done, total) => setCollectionProgress(name, done, total, 100),
      },
    );
  } catch {
    if (mongoUriSet()) {
      return { ok: false, error: MONGO_WRITE_FAILED, message: MONGO_WRITE_FAILED };
    }
    return { ok: false, error: "복사본을 저장하지 못했습니다.", message: "복사본을 저장하지 못했습니다." };
  }
  return {
    ok: true as const,
    message: meta.message,
    contractCount: meta.contractCount,
    feeCount: meta.feeCount,
    receiptCount: meta.receiptCount,
    reportCount: meta.reportCount,
    cemeteryCount: meta.cemeteryCount,
    savedTo: saved.mongo ? "mongo" : "file",
    mongoDb: saved.dbName,
    collections: saved.counts,
    ...feeSum,
  };
}

/** Supervisor button, 01:00 timer, and cron share this. Env only. Never logs secrets. */
export async function runWorkSyncFromEnv(source: "button" | "timer" | "cron"): Promise<WorkSyncResult> {
  if (syncing) {
    console.log(`[work-sync] skip already running (${source})`);
    return { ok: false, skipped: true, message: "이미 복사 중입니다." };
  }
  const creds = resolveSourceLogin();
  if (!creds) {
    console.warn("[work-sync] skip: CEMETERY_SOURCE_ID / CEMETERY_SOURCE_PASSWORD missing");
    return { ok: false, skipped: true, message: SOURCE_LOGIN_MISSING };
  }
  syncing = true;
  beginWorkSyncProgress("원본에서 복사하는 중…");
  try {
    const result = await syncWorkFromSource(creds);
    if (result.ok) {
      console.log(
        `[work-sync] ok ${source} savedTo=${result.savedTo} contracts=${result.contractCount} fees=${result.feeCount} receipts=${result.receiptCount}`,
      );
      finishWorkSyncProgress({ ok: true, message: result.message, savedTo: result.savedTo });
    } else {
      console.error(`[work-sync] failed ${source}: ${result.message}`);
      finishWorkSyncProgress({ ok: false, message: result.message });
    }
    return result;
  } catch (err) {
    console.error("[work-sync] failed", source);
    console.error(err);
    const message = mongoUriSet() ? MONGO_WRITE_FAILED : "원본에서 자료를 읽지 못했습니다.";
    finishWorkSyncProgress({ ok: false, message });
    return { ok: false, error: message, message };
  } finally {
    syncing = false;
  }
}
