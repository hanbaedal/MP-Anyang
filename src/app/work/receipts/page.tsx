import { WorkCopiedTable } from "@/components/work-copied-table";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readWorkDump } from "@/lib/work";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.receipts") };
}

export default async function WorkReceiptsPage() {
  const locale = await readLocale();
  const dump = await readWorkDump();
  const rows = dump.receipts.map((row) => ({
    date: row.date,
    tombNo: row.tombNo,
    deceased: row.deceased,
    serial: row.serial,
    amount: row.amount.toLocaleString("ko-KR"),
    summary: row.summary,
    kind: row.kind,
    staff: row.staff,
  }));
  return (
    <WorkCopiedTable
      title={t(locale, "work.receipts")}
      lead={`복사본 ${rows.length}건`}
      syncedAt={dump.meta?.syncedAt}
      columns={[
        { key: "date", label: "거래년월일" },
        { key: "tombNo", label: "묘지번호" },
        { key: "deceased", label: "고인성명" },
        { key: "serial", label: "일련번호" },
        { key: "amount", label: "거래금액", numeric: true },
        { key: "summary", label: "내역요약" },
        { key: "kind", label: "영수종류" },
        { key: "staff", label: "담당자" },
      ]}
      rows={rows}
    />
  );
}
