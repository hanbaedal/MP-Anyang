import { pullCemeterySource, resolveSourceLogin, SOURCE_LOGIN_MISSING, type SourceLogin } from "./cemetery-source";
import { saveWorkDump, summarizeFees } from "./work-store";

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

let syncing = false;

export async function syncWorkFromSource(creds: SourceLogin): Promise<WorkSyncOk | WorkSyncFail> {
  const pulled = await pullCemeterySource(creds);
  if (!pulled.ok) {
    return { ok: false as const, error: pulled.error || "원본에서 자료를 읽지 못했습니다.", message: pulled.error || "원본에서 자료를 읽지 못했습니다." };
  }
  const feeSum = summarizeFees(pulled.fees);
  const meta = {
    syncedAt: new Date().toISOString(),
    sourceHost: (process.env.CEMETERY_SOURCE_URL?.trim() || "http://1.255.226.45:88/Cemetery").replace(/\/$/, ""),
    contractCount: pulled.contracts.length,
    listedContractTotal: pulled.listedContractTotal,
    feeCount: pulled.fees.length,
    receiptCount: pulled.receipts.length,
    reportCount: pulled.reports.length,
    cemeteryCount: pulled.cemetery.length,
    message: `계약 ${pulled.contracts.length}건, 관리비 ${pulled.fees.length}건, 영수증 ${pulled.receipts.length}건을 복사했습니다.`,
  };
  await saveWorkDump({
    meta,
    contracts: pulled.contracts,
    fees: pulled.fees,
    receipts: pulled.receipts,
    reports: pulled.reports,
    cemetery: pulled.cemetery,
  });
  return {
    ok: true as const,
    message: meta.message,
    contractCount: meta.contractCount,
    feeCount: meta.feeCount,
    receiptCount: meta.receiptCount,
    reportCount: meta.reportCount,
    cemeteryCount: meta.cemeteryCount,
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
  try {
    const result = await syncWorkFromSource(creds);
    if (result.ok) {
      console.log(
        `[work-sync] ok ${source} contracts=${result.contractCount} fees=${result.feeCount} receipts=${result.receiptCount}`,
      );
    } else {
      console.error(`[work-sync] failed ${source}: ${result.message}`);
    }
    return result;
  } catch (err) {
    console.error("[work-sync] failed", source);
    console.error(err);
    return { ok: false, error: "원본에서 자료를 읽지 못했습니다.", message: "원본에서 자료를 읽지 못했습니다." };
  } finally {
    syncing = false;
  }
}
