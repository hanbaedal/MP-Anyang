import { WorkCopyEmpty } from "@/components/work-copy-empty";
import { WorkCopiedTable } from "@/components/work-copied-table";
import { WorkYearFilter } from "@/components/work-lookup-filters";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { loadWorkCopyPage } from "@/lib/work";
import { contractDate, contractYearsInCopy, parseYearParam } from "@/lib/work-status";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.contracts") };
}

export default async function WorkContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const { locale, session, dump, envReady } = await loadWorkCopyPage();
  const years = contractYearsInCopy(dump.contracts);
  const year = parseYearParam(yearParam, years);
  const ofYear = dump.contracts.filter((row) => {
    const when = contractDate(row);
    return Boolean(when && when.year === year);
  });
  const undated = dump.contracts.filter((row) => !contractDate(row)).length;
  const rows = ofYear.map((row) => ({
    tombNo: row.tombNo,
    burialDate: row.burialDate,
    userName: row.userName,
    familyName: row.familyName,
    pyeong: row.pyeong,
    address: row.address,
  }));
  const copyMissing = dump.contracts.length === 0;
  const lead = copyMissing
    ? undefined
    : [
        t(locale, rows.length ? "work.contractYearLead" : "work.contractYearEmpty", {
          year,
          n: rows.length.toLocaleString("ko-KR"),
        }),
        undated > 0 ? t(locale, "work.contractUndatedNote", { n: undated.toLocaleString("ko-KR") }) : "",
      ]
        .filter(Boolean)
        .join(" ");

  return (
    <WorkCopiedTable
      title={t(locale, "work.contracts")}
      lead={lead}
      syncedAt={dump.meta?.syncedAt}
      toolbar={<WorkYearFilter locale={locale} years={years} year={year} />}
      columns={[
        { key: "tombNo", label: "묘지번호" },
        { key: "burialDate", label: "매장일자" },
        { key: "userName", label: "사용자" },
        { key: "familyName", label: "연고자" },
        { key: "pyeong", label: "평수" },
        { key: "address", label: "주소(연고자)" },
      ]}
      rows={rows}
      empty={
        copyMissing ? (
          <WorkCopyEmpty locale={locale} role={session.role} envReady={envReady} storage={dump.storage} />
        ) : (
          <p className="rounded-lg border bg-card px-4 py-6 text-sm text-muted-foreground">
            {t(locale, "work.contractYearEmpty", { year })}
          </p>
        )
      }
    />
  );
}
