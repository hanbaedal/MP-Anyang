"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ledgerRequest } from "@/lib/ledger-client";
import { ViewToggle } from "@/components/work-ledger-controls";
import type { InventoryItem } from "@/lib/work-ledgers";

const empty = { name: "", spec: "", qty: "", parQty: "", inPrice: "", outPrice: "", note: "" };

export function WorkInventoryPanel() {
  const [rows, setRows] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"input" | "list">("input");

  async function reload() {
    const json = await ledgerRequest<{ rows: InventoryItem[] }>("/api/work/inventory", "GET");
    setRows(json.rows);
  }

  useEffect(() => {
    void reload().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "목록을 읽지 못했습니다."));
  }, []);

  function setField(key: keyof typeof empty, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setBusy(true);
    setError("");
    try {
      const body = {
        ...form,
        qty: Number(form.qty || 0),
        parQty: Number(form.parQty || 0),
        inPrice: Number(form.inPrice || 0),
        outPrice: Number(form.outPrice || 0),
      };
      await ledgerRequest("/api/work/inventory", editing ? "PATCH" : "POST", editing ? { ...body, id: editing } : body);
      setForm(empty);
      setEditing(null);
      setMode("list");
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("이 재고를 지울까요?")) return;
    setError("");
    try {
      await ledgerRequest("/api/work/inventory", "DELETE", { id });
      if (editing === id) {
        setEditing(null);
        setForm(empty);
      }
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "지우지 못했습니다.");
    }
  }

  return (
    <div className="space-y-4">
      <ViewToggle mode={mode} onChange={setMode} />
      {mode === "input" ? (
        <form
          className="grid gap-2 rounded-xl border bg-card p-3 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <label className="space-y-1 text-xs text-muted-foreground">
            품명
            <Input value={form.name} onChange={(event) => setField("name", event.target.value)} />
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            규격
            <Input value={form.spec} onChange={(event) => setField("spec", event.target.value)} />
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            재고량
            <Input inputMode="decimal" value={form.qty} onChange={(event) => setField("qty", event.target.value)} />
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            적정재고량
            <Input inputMode="decimal" value={form.parQty} onChange={(event) => setField("parQty", event.target.value)} />
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            입고가격
            <Input inputMode="numeric" value={form.inPrice} onChange={(event) => setField("inPrice", event.target.value)} />
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            출고가격
            <Input inputMode="numeric" value={form.outPrice} onChange={(event) => setField("outPrice", event.target.value)} />
          </label>
          <label className="space-y-1 text-xs text-muted-foreground lg:col-span-3">
            비고
            <Input value={form.note} onChange={(event) => setField("note", event.target.value)} placeholder="상품 설명" />
          </label>
          <div className="flex items-center gap-2 lg:col-span-3">
            <Button type="submit" size="sm" disabled={busy}>
              {editing ? "수정" : "등록"}
            </Button>
            {editing ? (
              <Button type="button" size="sm" variant="outline" onClick={() => { setEditing(null); setForm(empty); }}>
                취소
              </Button>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </form>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">품명</th>
                <th className="px-3 py-2 font-medium">규격</th>
                <th className="px-3 py-2 text-right font-medium">재고량</th>
                <th className="px-3 py-2 text-right font-medium">적정재고량</th>
                <th className="px-3 py-2 text-right font-medium">입고가격</th>
                <th className="px-3 py-2 text-right font-medium">출고가격</th>
                <th className="px-3 py-2 font-medium">비고</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={8}>
                    등록된 재고가 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.spec || "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.qty.toLocaleString("ko-KR")}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.parQty.toLocaleString("ko-KR")}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.inPrice.toLocaleString("ko-KR")}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.outPrice.toLocaleString("ko-KR")}</td>
                    <td className="px-3 py-2">{row.note || "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(row.id);
                          setForm({
                            name: row.name,
                            spec: row.spec,
                            qty: String(row.qty),
                            parQty: String(row.parQty),
                            inPrice: String(row.inPrice),
                            outPrice: String(row.outPrice),
                            note: row.note,
                          });
                          setMode("input");
                        }}
                      >
                        수정
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => void remove(row.id)}>
                        삭제
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
