import { WorkCopyEmpty } from "@/components/work-copy-empty";
import { WorkCopiedTable } from "@/components/work-copied-table";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { loadWorkCopyPage } from "@/lib/work";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.master") };
}

export default async function WorkMasterPage() {
  const { locale, session, dump, envReady } = await loadWorkCopyPage();
  const rows = dump.cemetery.map((row) => ({
    tombNo: row.tombNo,
    pyeong: row.pyeong,
    location: row.location,
    inUse: row.inUse,
  }));
  return (
    <WorkCopiedTable
      title={t(locale, "work.master")}
      lead={`묘지 기초정보 복사본 ${rows.length.toLocaleString("ko-KR")}건. 원본 사용자 비밀번호 목록은 가져오지 않습니다.`}
      syncedAt={dump.meta?.syncedAt}
      columns={[
        { key: "tombNo", label: "묘지번호" },
        { key: "pyeong", label: "평수" },
        { key: "location", label: "위치" },
        { key: "inUse", label: "사용여부" },
      ]}
      rows={rows}
      empty={<WorkCopyEmpty locale={locale} role={session.role} envReady={envReady} storage={dump.storage} />}
    />
  );
}
