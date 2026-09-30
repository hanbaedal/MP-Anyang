import { SupervisorLedger, ledgerWindow } from "@/components/supervisor-ledger";
import { requireSupervisor } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readWorkDumpBySlice } from "@/lib/work-store";

export const dynamic = "force-dynamic";

function money(n: number) {
  return n ? n.toLocaleString("ko-KR") : "";
}

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.fees") };
}

export default async function SupervisorFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pg?: string }>;
}) {
  await requireSupervisor();
  const locale = await readLocale();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const dump = await readWorkDumpBySlice("fees");
  const found = dump.fees.filter((row) => {
    if (!query) return true;
    const hay = [row.tombNo, row.userName, row.period, row.status, row.billedOn].join(" ");
    return hay.includes(query);
  });
  const window = ledgerWindow(found.length, params.pg);
  const rows = found.slice(window.from, window.from + window.size).map((row) => [
    row.billedOn,
    row.tombNo,
    row.userName,
    row.period,
    money(row.billedAmount),
    money(row.paidAmount),
    money(row.balance),
    row.dueDate,
    row.status,
  ]);
  return (
    <SupervisorLedger
      title={t(locale, "work.fees")}
      action="/supervisor/fees"
      query={query}
      placeholder="묘지번호, 사용자, 구분"
      total={found.length}
      page={window.page}
      pages={window.pages}
      columns={["청구일자", "묘지번호", "사용자", "적용기간", "청구금액", "납부금액", "잔액", "납부기한", "구분"]}
      rows={rows}
    />
  );
}
