import { requireSupervisor } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { formatActiveDuration, readAnalyticsDashboard } from "@/lib/site-analytics";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "supervisor.stats") };
}

function fmtKst(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}

export default async function SupervisorStatsPage() {
  await requireSupervisor();
  const locale = await readLocale();
  const data = await readAnalyticsDashboard();
  const maxDay = Math.max(1, ...data.last30Days.map((d) => d.publicPv + d.staffPv));

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 pb-28">
      <div>
        <h1 className="font-serif text-xl text-primary">{t(locale, "supervisor.stats")}</h1>
        {!data.configured ? (
          <p className="mt-2 text-sm text-amber-800">{t(locale, "supervisor.statsNoMongo")}</p>
        ) : null}
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t(locale, "supervisor.statsPublicUvToday")}</p>
          <p className="mt-1 font-serif text-2xl tabular-nums text-primary">
            {data.totals.publicUvToday.toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t(locale, "supervisor.statsPublicPvToday")}</p>
          <p className="mt-1 font-serif text-2xl tabular-nums text-primary">
            {data.totals.publicPvToday.toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t(locale, "supervisor.statsPublicUv7d")}</p>
          <p className="mt-1 font-serif text-2xl tabular-nums text-primary">
            {data.totals.publicUv7d.toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t(locale, "supervisor.statsPublicUv30d")}</p>
          <p className="mt-1 font-serif text-2xl tabular-nums text-primary">
            {data.totals.publicUv30d.toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t(locale, "supervisor.statsPublicTotal")}</p>
          <p className="mt-1 font-serif text-2xl tabular-nums text-primary">
            {data.totals.publicPv.toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">{t(locale, "supervisor.statsPublicUvAll")}</p>
          <p className="mt-1 font-serif text-2xl tabular-nums text-primary">
            {data.totals.publicUvAll.toLocaleString("ko-KR")}
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <p className="text-xs text-muted-foreground">{t(locale, "supervisor.statsStaffTotal")}</p>
        <p className="mt-1 font-serif text-xl tabular-nums text-primary">
          {data.totals.staffPv.toLocaleString("ko-KR")}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium text-primary">{t(locale, "supervisor.statsTrend")}</h2>
        {data.last30Days.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t(locale, "supervisor.statsEmpty")}</p>
        ) : (
          <ul className="space-y-2">
            {data.last30Days.map((day) => {
              const total = day.publicPv + day.staffPv;
              const w = Math.round((total / maxDay) * 100);
              return (
                <li key={day.date} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2 text-sm">
                  <span className="tabular-nums text-muted-foreground">{day.date.slice(5)}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="flex h-full"
                      style={{ width: `${Math.max(w, total > 0 ? 4 : 0)}%` }}
                    >
                      <span
                        className="bg-primary/70"
                        style={{ width: total ? `${(day.publicPv / total) * 100}%` : "0%" }}
                      />
                      <span
                        className="bg-primary/30"
                        style={{ width: total ? `${(day.staffPv / total) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                  <span className="tabular-nums text-right text-xs text-muted-foreground">
                    {day.publicUv} · {day.publicPv}/{day.staffPv}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium text-primary">{t(locale, "supervisor.statsTopPaths")}</h2>
        {data.topPaths.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t(locale, "supervisor.statsEmpty")}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">{t(locale, "supervisor.statsPath")}</th>
                  <th className="px-3 py-2 font-medium text-right">{t(locale, "supervisor.statsViews")}</th>
                </tr>
              </thead>
              <tbody>
                {data.topPaths.map((row) => (
                  <tr key={row.path} className="border-b last:border-b-0">
                    <td className="px-3 py-2 font-mono text-xs">{row.path}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.views.toLocaleString("ko-KR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium text-primary">{t(locale, "supervisor.statsPresence")}</h2>
        {data.staffPresence.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t(locale, "supervisor.statsEmpty")}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">계정</th>
                  <th className="px-3 py-2 font-medium">역할</th>
                  <th className="px-3 py-2 font-medium">마지막 로그인</th>
                  <th className="px-3 py-2 font-medium">마지막 활동</th>
                  <th className="px-3 py-2 font-medium text-right">추정 이용</th>
                </tr>
              </thead>
              <tbody>
                {data.staffPresence.map((row) => (
                  <tr key={row.username} className="border-b last:border-b-0">
                    <td className="px-3 py-2">
                      {row.name} ({row.username})
                    </td>
                    <td className="px-3 py-2">{row.role}</td>
                    <td className="px-3 py-2 text-xs tabular-nums">{fmtKst(row.lastLoginAt)}</td>
                    <td className="px-3 py-2 text-xs tabular-nums">{fmtKst(row.lastSeenAt)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatActiveDuration(row.activeSeconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium text-primary">{t(locale, "supervisor.statsLogins")}</h2>
        {data.recentLogins.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t(locale, "supervisor.statsEmpty")}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">시각</th>
                  <th className="px-3 py-2 font-medium">계정</th>
                  <th className="px-3 py-2 font-medium">역할</th>
                  <th className="px-3 py-2 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLogins.map((row, i) => (
                  <tr key={`${row.at}-${i}`} className="border-b last:border-b-0">
                    <td className="px-3 py-2 text-xs tabular-nums">{fmtKst(row.at)}</td>
                    <td className="px-3 py-2">
                      {row.name} ({row.username})
                    </td>
                    <td className="px-3 py-2">{row.role}</td>
                    <td className="px-3 py-2 font-mono text-xs">{row.ip || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
