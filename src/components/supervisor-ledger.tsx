export function SupervisorLedger({
  title,
  query,
  action,
  placeholder,
  total,
  page,
  pages,
  columns,
  rows,
}: {
  title: string;
  query: string;
  action: string;
  placeholder: string;
  total: number;
  page: number;
  pages: number;
  columns: string[];
  rows: string[][];
}) {
  const prev = page > 1 ? `${action}?q=${encodeURIComponent(query)}&pg=${page - 1}` : "";
  const next = page < pages ? `${action}?q=${encodeURIComponent(query)}&pg=${page + 1}` : "";
  return (
    <div className="mx-auto max-w-[90rem] space-y-3 px-3 py-4 pb-16 text-slate-800">
      <h1 className="font-serif text-xl text-primary">{title}</h1>
      <form action={action} className="flex flex-wrap items-center gap-1 rounded border border-[#9db7d0] bg-[#f4f8fc] px-2 py-2">
        <input name="q" defaultValue={query} placeholder={placeholder} className="h-7 w-64 border border-[#b7c6d6] bg-white px-2 text-xs" />
        <button type="submit" className="h-7 bg-[#6b7280] px-3 text-xs text-white">
          검색
        </button>
        <a href={action} className="inline-flex h-7 items-center bg-[#6b7280] px-3 text-xs text-white">
          새조건
        </a>
        <span className="px-2 text-[11px] text-slate-500">
          {total.toLocaleString("ko-KR")}건 · {page}/{pages}
        </span>
      </form>
      <div className="overflow-x-auto border border-[#9db7d0]">
        <table className="w-full min-w-[48rem] border-collapse text-xs">
          <thead className="bg-[#d7ebfb]">
            <tr>
              {columns.map((header) => (
                <th key={header} className="border border-[#c5d4e4] px-1 py-1 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={index} className="odd:bg-white even:bg-slate-50">
                  {columns.map((header, cell) => (
                    <td key={header} className="border border-[#d5e0ea] px-1 py-0.5">
                      {row[cell] ?? ""}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="border px-2 py-8 text-center text-slate-500">
                  복사된 자료가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 text-xs">
        {prev ? (
          <a href={prev} className="text-[#1d4f91] underline-offset-2 hover:underline">
            이전
          </a>
        ) : null}
        {next ? (
          <a href={next} className="text-[#1d4f91] underline-offset-2 hover:underline">
            다음
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function ledgerWindow(total: number, pageRaw: string | undefined, size = 30) {
  const pages = Math.max(1, Math.ceil(total / size));
  const page = Math.min(pages, Math.max(1, Number(pageRaw) || 1));
  return { page, pages, from: (page - 1) * size, size };
}
