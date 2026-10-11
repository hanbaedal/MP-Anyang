"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ViewToggle } from "@/components/work-ledger-controls";
import { ledgerRequest } from "@/lib/ledger-client";
import type { Material, Product } from "@/lib/work-ledgers";

const SLOT = 10;
const emptySlots = () => Array.from({ length: SLOT }, () => ({ materialId: "", qty: "" }));
const empty = { name: "", spec: "", outPrice: "", inPrice: "", parQty: "", openingQty: "", note: "" };

export function WorkProductsPanel() {
  const [rows, setRows] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [form, setForm] = useState(empty);
  const [parts, setParts] = useState(emptySlots);
  const [editing, setEditing] = useState<string | null>(null);
  const [makeQty, setMakeQty] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"input" | "list">("input");

  async function reload() {
    const [products, mats] = await Promise.all([
      ledgerRequest<{ rows: Product[] }>("/api/work/products", "GET"),
      ledgerRequest<{ rows: Material[] }>("/api/work/materials", "GET"),
    ]);
    setRows(products.rows);
    setMaterials(mats.rows);
  }

  useEffect(() => {
    void reload().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "목록을 읽지 못했습니다."));
  }, []);

  function setField(key: keyof typeof empty, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setPart(index: number, key: "materialId" | "qty", value: string) {
    setParts((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  async function save() {
    setBusy(true);
    setError("");
    try {
      const body = {
        ...form,
        outPrice: Number(form.outPrice || 0),
        inPrice: Number(form.inPrice || 0),
        parQty: Number(form.parQty || 0),
        openingQty: Number(form.openingQty || 0),
        parts: parts.map((row) => ({ materialId: row.materialId, qty: Number(row.qty || 0) })),
      };
      await ledgerRequest("/api/work/products", editing ? "PATCH" : "POST", editing ? { ...body, id: editing } : body);
      setForm(empty);
      setParts(emptySlots());
      setEditing(null);
      setMakeQty("");
      setMode("list");
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function assemble() {
    if (!editing) return;
    setBusy(true);
    setError("");
    try {
      await ledgerRequest("/api/work/products", "POST", { action: "assemble", id: editing, count: Number(makeQty || 0) });
      setMakeQty("");
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "조합하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("이 상품을 지울까요?")) return;
    try {
      await ledgerRequest("/api/work/products", "DELETE", { id });
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "지우지 못했습니다.");
    }
  }

  const canAssemble = Boolean(editing && parts.some((row) => row.materialId && Number(row.qty) > 0));

  return (
    <div className="space-y-4">
      <ViewToggle mode={mode} onChange={setMode} />
      {mode === "input" ? (
        <form
          className="space-y-3 rounded-xl border bg-card p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="상품명" value={form.name} onChange={(value) => setField("name", value)} />
            <Field label="규격" value={form.spec} onChange={(value) => setField("spec", value)} />
            <Field label="출고단가" value={form.outPrice} onChange={(value) => setField("outPrice", value)} />
            <Field label="입고단가" value={form.inPrice} onChange={(value) => setField("inPrice", value)} />
            <Field label="적정재고량" value={form.parQty} onChange={(value) => setField("parQty", value)} />
            <Field label="이전 재고수량" value={form.openingQty} onChange={(value) => setField("openingQty", value)} />
            <label className="space-y-1 text-xs text-muted-foreground sm:col-span-2">
              비고
              <Input value={form.note} onChange={(event) => setField("note", event.target.value)} />
            </label>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">부자재 구성. 비우면 단독 상품입니다. 칸의 수량은 상품 1개에 들어가는 양입니다.</p>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {parts.map((row, index) => (
                <div key={index} className="grid grid-cols-[minmax(0,1fr)_4.5rem] gap-1">
                  <select
                    className="h-9 min-w-0 rounded-md border bg-transparent px-2 text-sm"
                    value={row.materialId}
                    onChange={(event) => setPart(index, "materialId", event.target.value)}
                  >
                    <option value="">부자재 {index + 1}</option>
                    {materials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.spec ? `${material.name} / ${material.spec}` : material.name}
                      </option>
                    ))}
                  </select>
                  <Input inputMode="decimal" placeholder="수량" value={row.qty} onChange={(event) => setPart(index, "qty", event.target.value)} />
                </div>
              ))}
            </div>
          </div>
          {canAssemble ? (
            <div className="flex flex-wrap items-end gap-2">
              <label className="space-y-1 text-xs text-muted-foreground">
                만들 수량
                <Input className="w-28" inputMode="decimal" value={makeQty} onChange={(event) => setMakeQty(event.target.value)} />
              </label>
              <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void assemble()}>조합</Button>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={busy}>{editing ? "수정" : "등록"}</Button>
            {editing ? (
              <Button type="button" size="sm" variant="outline" onClick={() => { setEditing(null); setForm(empty); setParts(emptySlots()); setMakeQty(""); }}>
                취소
              </Button>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </form>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">상품명</th>
                <th className="px-3 py-2 font-medium">규격</th>
                <th className="px-3 py-2 text-right font-medium">출고단가</th>
                <th className="px-3 py-2 text-right font-medium">재고</th>
                <th className="px-3 py-2 font-medium">구성</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td className="px-3 py-6 text-muted-foreground" colSpan={6}>등록된 상품이 없습니다.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.spec || "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.outPrice.toLocaleString("ko-KR")}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.qty.toLocaleString("ko-KR")}</td>
                  <td className="px-3 py-2">{row.parts.length ? `${row.parts.length}종` : "단독"}</td>
                  <td className="px-3 py-2 text-right">
                    <Button type="button" size="sm" variant="outline" onClick={() => {
                      setEditing(row.id);
                      setForm({
                        name: row.name,
                        spec: row.spec,
                        outPrice: String(row.outPrice),
                        inPrice: String(row.inPrice),
                        parQty: String(row.parQty),
                        openingQty: String(row.openingQty),
                        note: row.note,
                      });
                      const slots = emptySlots();
                      row.parts.slice(0, SLOT).forEach((part, index) => {
                        slots[index] = { materialId: part.materialId, qty: String(part.qty) };
                      });
                      setParts(slots);
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
