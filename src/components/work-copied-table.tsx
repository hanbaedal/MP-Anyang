import type { ReactNode } from "react";

export function WorkCopiedTable({
  title,
  lead,
  syncedAt,
  columns,
  rows,
  empty,
}: {
  title: string;
  lead?: string;
  syncedAt?: string;
  columns: { key: string; label: string; numeric?: boolean }[];
  rows: Array<Record<string, string | number>>;
  empty?: ReactNode;
}) {
  const shown = rows.slice(0, 200);
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
      <div>
        <h1 className="font-serif text-xl text-primary">{title}</h1>
        {lead ? <p className="mt-2 text-sm text-muted-foreground">{lead}</p> : null}
        {rows.length > shown.length ? (
          <p className="mt-1 text-xs text-muted-foreground">화면에는 앞 {shown.length}건만 보여 줍니다.</p>
        ) : null}
        {syncedAt ? (
          <p className="mt-1 text-xs text-muted-foreground">복사 시각 {new Date(syncedAt).toLocaleString("ko-KR")}</p>
        ) : null}
      </div>
      {rows.length === 0 ? (
        empty ?? (
          <p className="rounded-lg border bg-card px-4 py-6 text-sm text-muted-foreground">
            아직 복사본이 없습니다.
          </p>
        )
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-3 py-2 font-medium">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((row, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-3 py-2 ${col.numeric ? "text-right tabular-nums" : ""}`}>
                      {row[col.key] === "" || row[col.key] == null ? "—" : String(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
