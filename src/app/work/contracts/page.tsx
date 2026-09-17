import { WorkCopiedTable } from "@/components/work-copied-table";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readWorkDump } from "@/lib/work";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.contracts") };
}

export default async function WorkContractsPage() {
  const locale = await readLocale();
  const dump = await readWorkDump();
  const rows = dump.contracts.map((row) => ({
    tombNo: row.tombNo,
    burialDate: row.burialDate,
    userName: row.userName,
    familyName: row.familyName,
    pyeong: row.pyeong,
    address: row.address,
  }));
  return (
    <WorkCopiedTable
      title={t(locale, "work.contracts")}
      lead={`복사본 ${rows.length}건${dump.meta?.listedContractTotal ? ` (원본 표시 ${dump.meta.listedContractTotal}건)` : ""}`}
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
    />
  );
}
