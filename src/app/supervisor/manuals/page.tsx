import { requireSupervisor } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { MANUAL_ITEMS, MANUAL_REVISED } from "@/lib/manuals";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "supervisor.manuals") };
}

export default async function SupervisorManualsPage() {
  await requireSupervisor();
  const locale = await readLocale();

  return (
    <div className="mx-auto max-w-5xl px-3 py-4 pb-16 text-slate-800">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-serif text-xl text-primary">{t(locale, "supervisor.manuals")}</h1>
          <p className="mt-1 text-[11px] text-slate-500">{t(locale, "supervisor.manualsLead")}</p>
        </div>
        <p className="text-[11px] text-slate-500">
          {t(locale, "supervisor.manualsRevised")}: {MANUAL_REVISED}
        </p>
      </div>

      <div className="overflow-x-auto border border-[#9db7d0]">
        <table className="w-full min-w-[40rem] border-collapse text-xs">
          <thead className="bg-[#d7ebfb]">
            <tr>
              <th className="w-16 border border-[#c5d4e4] px-2 py-1.5 text-left font-medium">{t(locale, "supervisor.manualsSerial")}</th>
              <th className="border border-[#c5d4e4] px-2 py-1.5 text-left font-medium">{t(locale, "supervisor.manualsTitle")}</th>
              <th className="border border-[#c5d4e4] px-2 py-1.5 text-left font-medium">{t(locale, "supervisor.manualsAudience")}</th>
              <th className="w-56 border border-[#c5d4e4] px-2 py-1.5 text-left font-medium">{t(locale, "supervisor.manualsDownload")}</th>
            </tr>
          </thead>
          <tbody>
            {MANUAL_ITEMS.map((item) => (
              <tr key={item.id} className="odd:bg-white even:bg-slate-50">
                <td className="border border-[#d5e0ea] px-2 py-1.5 font-medium tabular-nums">{item.serial}</td>
                <td className="border border-[#d5e0ea] px-2 py-1.5">{item.title}</td>
                <td className="border border-[#d5e0ea] px-2 py-1.5 text-slate-600">{item.audience}</td>
                <td className="border border-[#d5e0ea] px-2 py-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    <a
                      href={`/api/supervisor/manuals/${item.id}/docx`}
                      className="inline-flex h-7 items-center bg-[#1d4f91] px-2.5 text-[11px] text-white hover:bg-[#163d72]"
                    >
                      Word
                    </a>
                    <a
                      href={`/api/supervisor/manuals/${item.id}/pdf`}
                      className="inline-flex h-7 items-center bg-[#6b7280] px-2.5 text-[11px] text-white hover:bg-[#4b5563]"
                    >
                      PDF
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[11px] text-slate-500">{t(locale, "supervisor.manualsNote")}</p>
    </div>
  );
}
