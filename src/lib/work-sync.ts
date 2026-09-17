import { pullCemeterySource } from "./cemetery-source";
import { saveWorkDump, summarizeFees } from "./work-store";

export async function syncWorkFromSource() {
  const pulled = await pullCemeterySource();
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
