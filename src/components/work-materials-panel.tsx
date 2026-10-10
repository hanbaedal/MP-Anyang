"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ViewToggle } from "@/components/work-ledger-controls";
import { ledgerRequest } from "@/lib/ledger-client";
import type { Material } from "@/lib/work-ledgers";

const empty = { name: "", spec: "", unit: "", inPrice: "", parQty: "", openingQty: "", note: "" };

export function WorkMaterialsPanel() {
  const [rows, setRows] = useState<Material[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"input" | "list">("input");

  async function reload() {
    const json = await ledgerRequest<{ rows: Material[] }>("/api/work/materials", "GET");
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
        inPrice: Number(form.inPrice || 0),
        parQty: Number(form.parQty || 0),
        openingQty: Number(form.openingQty || 0),
      };
      await ledgerRequest("/api/work/materials", editing ? "PATCH" : "POST", editing ? { ...body, id: editing } : body);
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
    if (!window.confirm("이 부자재를 지울까요?")) return;
    try {
      await ledgerRequest("/api/work/materials", "DELETE", { id });
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
          className="grid gap-2 rounded-xl border bg-card p-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <Field label="이름" value={form.name} onChange={(value) => setField("name", value)} />
          <Field label="규격" value={form.spec} onChange={(value) => setField("spec", value)} />
          <Field label="단위" value={form.unit} onChange={(value) => setField("unit", value)} />
          <Field label="입고단가" value={form.inPrice} onChange={(value) => setField("inPrice", value)} />
          <Field label="적정재고량" value={form.parQty} onChange={(value) => setField("parQty", value)} />
          <Field label="이전 재고수량" value={form.openingQty} onChange={(value) => setField("openingQty", value)} />
          <Field label="비고" value={form.note} onChange={(value) => setField("note", value)} />
          <div className="flex items-end gap-2">
            <Button type="submit" size="sm" disabled={busy}>{editing ? "수정" : "등록"}</Button>
            {editing ? <Button type="button" size="sm" variant="outline" onClick={() => { setEditing(null); setForm(empty); }}>취소</Button> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </form>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">이름</th>
                <th className="px-3 py-2 font-medium">규격</th>
                <th className="px-3 py-2 font-medium">단위</th>
                <th className="px-3 py-2 text-right font-medium">입고단가</th>
                <th className="px-3 py-2 text-right font-medium">재고</th>
                <th className="px-3 py-2 text-right font-medium">적정</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td className="px-3 py-6 text-muted-foreground" colSpan={7}>등록된 부자재가 없습니다.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.spec || "—"}</td>
                  <td className="px-3 py-2">{row.unit || "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.inPrice.toLocaleString("ko-KR")}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.qty.toLocaleString("ko-KR")}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.parQty.toLocaleString("ko-KR")}</td>
                  <td className="px-3 py-2 text-right">
                    <Button type="button" size="sm" variant="outline" onClick={() => {
                      setEditing(row.id);
                      setForm({
                        name: row.name,
                        spec: row.spec,
                        unit: row.unit,
                        inPrice: String(row.inPrice),
                        parQty: String(row.parQty),
                        openingQty: String(row.openingQty),
                        note: row.note,
                      });
                      setMode("input");
                    }}>수정</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => void remove(row.id)}>삭제</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-xs text-muted-foreground">
      {label}
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
