import { sourceEnvReady } from "./cemetery-source";
import { requireStaff, type SessionUser } from "./auth";
import type { Locale } from "./i18n";
import { readLocale } from "./i18n-server";
import { readWorkDump, summarizeFees, type WorkDump } from "./work-store";
import { buildWorkStatusTables, type WorkStatusTables } from "./work-status";

export type WorkOverview = {
  connected: boolean;
  syncedAt: string;
  contractCount: number;
  paidCount: number;
  paidAmount: number;
  unpaidCount: number;
  unpaidAmount: number;
  feeCount: number;
  receiptCount: number;
  message: string;
};

const EMPTY: WorkOverview = {
  connected: false,
  syncedAt: "",
  contractCount: 0,
  paidCount: 0,
  paidAmount: 0,
  unpaidCount: 0,
  unpaidAmount: 0,
  feeCount: 0,
  receiptCount: 0,
  message: "",
};

export async function readWorkOverview(): Promise<WorkOverview> {
  try {
    const dump = await readWorkDump();
    if (!dump.meta && dump.contracts.length === 0 && dump.fees.length === 0) return EMPTY;
    const feeSum = summarizeFees(dump.fees);
    return {
      connected: true,
      syncedAt: dump.meta?.syncedAt ?? "",
      contractCount: dump.contracts.length || dump.meta?.listedContractTotal || 0,
      feeCount: dump.fees.length,
      receiptCount: dump.receipts.length,
      message: dump.meta?.message ?? "",
      ...feeSum,
    };
  } catch {
    return EMPTY;
  }
}

export async function readWorkStatus(): Promise<WorkStatusTables> {
  try {
    const dump = await readWorkDump();
    return buildWorkStatusTables(dump.contracts, dump.fees, dump.meta?.syncedAt ?? "");
  } catch {
    return buildWorkStatusTables([], [], "");
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

export async function loadWorkCopyPage(): Promise<{
  locale: Locale;
  session: SessionUser;
  dump: WorkDump;
  envReady: boolean;
}> {
  const locale = await readLocale();
  const session = await requireStaff();
  const dump = await readWorkDump();
  return { locale, session, dump, envReady: sourceEnvReady() };
}

export { readWorkDump } from "./work-store";
export { workCopyLead } from "./work-copy-text";
