import { SupervisorReceiptList } from "@/components/supervisor-receipt-list";
import { requireSupervisor } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readStoredReceipts } from "@/lib/work-store";

export const dynamic = "force-dynamic";

const KINDS = new Set(["관리비", "계약비", "시설비", "공사비"]);

function iso(raw: string | undefined) {
  const value = raw?.trim() ?? "";
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.receipts") };
}

export default async function SupervisorReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; tomb?: string; kind?: string }>;
}) {
  await requireSupervisor();
  const params = await searchParams;
  const from = iso(params.from);
  const to = iso(params.to);
  const tomb = params.tomb?.trim() ?? "";
  const kind = KINDS.has(params.kind ?? "") ? (params.kind as string) : "전체";
  const rows = (await readStoredReceipts())
    .filter((row) => {
      if (from && row.date < from) return false;
      if (to && row.date > to) return false;
      if (tomb && !row.tombNo.includes(tomb)) return false;
      if (kind !== "전체" && row.kind.trim() !== kind) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.serial.localeCompare(a.serial, "ko"));
  return <SupervisorReceiptList action="/supervisor/receipts" from={from} to={to} tomb={tomb} kind={kind} rows={rows} />;
}
