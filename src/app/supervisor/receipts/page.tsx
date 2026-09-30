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
  return { title: t(locale, "work.receipts") };
}

export default async function SupervisorReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pg?: string }>;
}) {
  await requireSupervisor();
  const locale = await readLocale();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const dump = await readWorkDumpBySlice("full");
  const found = dump.receipts.filter((row) => {
    if (!query) return true;
    return [row.date, row.tombNo, row.deceased, row.serial, row.summary, row.kind, row.staff].join(" ").includes(query);
  });
  const window = ledgerWindow(found.length, params.pg);
  const rows = found.slice(window.from, window.from + window.size).map((row) => [
    row.date,
    row.tombNo,
    row.deceased,
    row.serial,
    money(row.amount),
    row.summary,
    row.kind,
    row.staff,
  ]);
  return (
    <SupervisorLedger
      title={t(locale, "work.receipts")}
      action="/supervisor/receipts"
      query={query}
      placeholder="묘지번호, 고인, 종류, 담당자"
      total={found.length}
      page={window.page}
      pages={window.pages}
      columns={["거래년월일", "묘지번호", "고인성명", "일련번호", "거래금액", "내역요약", "영수종류", "담당자"]}
      rows={rows}
    />
  );
}
