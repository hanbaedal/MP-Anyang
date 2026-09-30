"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ledgerRequest } from "@/lib/ledger-client";
import type { StockKind, StockView } from "@/lib/work-ledgers";

export function WorkInventoryPanel() {
  const [rows, setRows] = useState<StockView[]>([]);
  const [error, setError] = useState("");
  const [kind, setKind] = useState<"전체" | StockKind>("전체");

  useEffect(() => {
    void ledgerRequest<{ rows: StockView[] }>("/api/work/inventory", "GET")
      .then((json) => setRows(json.rows))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "재고를 읽지 못했습니다."));
  }, []);

  const visible = kind === "전체" ? rows : rows.filter((row) => row.kind === kind);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["전체", "상품", "부자재"] as const).map((label) => (
          <Button key={label} type="button" size="sm" variant={kind === label ? "default" : "outline"} onClick={() => setKind(label)}>
            {label}
          </Button>
        ))}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">구분</th>
              <th className="px-3 py-2 font-medium">품명</th>
              <th className="px-3 py-2 font-medium">규격</th>
              <th className="px-3 py-2 text-right font-medium">재고량</th>
              <th className="px-3 py-2 text-right font-medium">적정재고량</th>
              <th className="px-3 py-2 text-right font-medium">입고가격</th>
              <th className="px-3 py-2 text-right font-medium">출고가격</th>
              <th className="px-3 py-2 font-medium">비고</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td className="px-3 py-6 text-muted-foreground" colSpan={8}>재고가 없습니다.</td></tr>
            ) : visible.map((row) => (
              <tr key={`${row.kind}-${row.id}`} className="border-b last:border-b-0">
                <td className="px-3 py-2">{row.kind}</td>
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">{row.spec || "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.qty.toLocaleString("ko-KR")}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.parQty.toLocaleString("ko-KR")}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.inPrice ? row.inPrice.toLocaleString("ko-KR") : "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.kind === "상품" ? row.outPrice.toLocaleString("ko-KR") : "—"}</td>
                <td className="px-3 py-2">{row.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
