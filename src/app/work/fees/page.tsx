import { WorkCopiedTable } from "@/components/work-copied-table";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readWorkDump } from "@/lib/work";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.fees") };
}

export default async function WorkFeesPage() {
  const locale = await readLocale();
  const dump = await readWorkDump();
  const rows = dump.fees.map((row) => ({
    billedOn: row.billedOn,
    tombNo: row.tombNo,
    userName: row.userName,
    period: row.period,
    billedAmount: row.billedAmount.toLocaleString("ko-KR"),
    paidAmount: row.paidAmount.toLocaleString("ko-KR"),
    balance: row.balance.toLocaleString("ko-KR"),
    dueDate: row.dueDate,
    status: row.status,
  }));
  return (
    <WorkCopiedTable
      title={t(locale, "work.fees")}
      lead={`복사본 ${rows.length}건`}
      syncedAt={dump.meta?.syncedAt}
      columns={[
        { key: "billedOn", label: "청구일자" },
        { key: "tombNo", label: "묘지번호" },
        { key: "userName", label: "사용자" },
        { key: "period", label: "적용기간" },
        { key: "billedAmount", label: "청구금액", numeric: true },
        { key: "paidAmount", label: "납부금액", numeric: true },
        { key: "balance", label: "잔액", numeric: true },
        { key: "dueDate", label: "납부기한" },
        { key: "status", label: "구분" },
      ]}
      rows={rows}
    />
  );
}
