"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ledgerRequest } from "@/lib/ledger-client";
import type { InventoryItem } from "@/lib/work-ledgers";

const empty = { name: "", spec: "", unit: "개", qty: "", unitCost: "", note: "" };

export function WorkInventoryPanel() {
  const [rows, setRows] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
      const body = { ...form, qty: Number(form.qty || 0), unitCost: Number(form.unitCost || 0) };
      await ledgerRequest("/api/work/inventory", editing ? "PATCH" : "POST", editing ? { ...body, id: editing } : body);
      setForm(empty);
      setEditing(null);
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
      <form
        className="grid gap-2 rounded-xl border bg-card p-3 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label className="space-y-1 text-xs text-muted-foreground">
          품목
          <Input value={form.name} onChange={(event) => setField("name", event.target.value)} />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          규격
          <Input value={form.spec} onChange={(event) => setField("spec", event.target.value)} />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          단위
          <Input value={form.unit} onChange={(event) => setField("unit", event.target.value)} />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          수량
          <Input inputMode="decimal" value={form.qty} onChange={(event) => setField("qty", event.target.value)} />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          단가
          <Input inputMode="numeric" value={form.unitCost} onChange={(event) => setField("unitCost", event.target.value)} />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          메모
          <Input value={form.note} onChange={(event) => setField("note", event.target.value)} />
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
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">품목</th>
              <th className="px-3 py-2 font-medium">규격</th>
              <th className="px-3 py-2 font-medium">단위</th>
              <th className="px-3 py-2 text-right font-medium">수량</th>
              <th className="px-3 py-2 text-right font-medium">단가</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={6}>
                  등록된 재고가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.spec || "—"}</td>
                  <td className="px-3 py-2">{row.unit}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.qty.toLocaleString("ko-KR")}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.unitCost.toLocaleString("ko-KR")}</td>
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
                          unit: row.unit,
                          qty: String(row.qty),
                          unitCost: String(row.unitCost),
                          note: row.note,
                        });
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
    </div>
  );
}
