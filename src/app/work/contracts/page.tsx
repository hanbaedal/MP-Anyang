import { WorkCopyEmpty } from "@/components/work-copy-empty";
import { WorkCopiedTable } from "@/components/work-copied-table";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { loadWorkCopyPage, workCopyLead } from "@/lib/work";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.contracts") };
}

export default async function WorkContractsPage() {
  const { locale, session, dump, envReady } = await loadWorkCopyPage();
  const rows = dump.contracts.map((row) => ({
    tombNo: row.tombNo,
    burialDate: row.burialDate,
    userName: row.userName,
    familyName: row.familyName,
    pyeong: row.pyeong,
    address: row.address,
  }));
  const listed = dump.meta?.listedContractTotal
    ? ` (원본 표시 ${dump.meta.listedContractTotal.toLocaleString("ko-KR")}건)`
    : "";
  return (
    <WorkCopiedTable
      title={t(locale, "work.contracts")}
      lead={workCopyLead(rows.length, listed)}
      syncedAt={dump.meta?.syncedAt}
      columns={[
        { key: "tombNo", label: "묘지번호" },
        { key: "burialDate", label: "매장일자" },
        { key: "userName", label: "사용자" },
        { key: "familyName", label: "연고자" },
        { key: "pyeong", label: "평수" },
        { key: "address", label: "주소(연고자)" },
      ]}
      rows={rows}
      empty={<WorkCopyEmpty locale={locale} role={session.role} envReady={envReady} storage={dump.storage} />}
    />
  );
}
