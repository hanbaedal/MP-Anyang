"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CatalogItemSelect } from "@/components/work-catalog-select";
import { DateSpan, ViewToggle, inDateRange } from "@/components/work-ledger-controls";
import { ledgerRequest } from "@/lib/ledger-client";
import type { Material, Partner, Product, Purchase, StockKind } from "@/lib/work-ledgers";

function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const empty = {
  purchasedOn: "",
  partnerId: "",
  stockKind: "상품" as StockKind,
  itemId: "",
  item: "",
  spec: "",
  qty: "",
  unitPrice: "",
  note: "",
};

export function WorkPurchasesPanel() {
  const [rows, setRows] = useState<Purchase[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [form, setForm] = useState({ ...empty, purchasedOn: today() });
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"input" | "list">("input");
  const [group, setGroup] = useState<"partner" | "date">("date");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("");

  async function reload() {
    const [purchases, partnerList, productList, materialList] = await Promise.all([
      ledgerRequest<{ rows: Purchase[] }>("/api/work/purchases", "GET"),
      ledgerRequest<{ rows: Partner[] }>("/api/work/partners", "GET"),
      ledgerRequest<{ rows: Product[] }>("/api/work/products", "GET"),
      ledgerRequest<{ rows: Material[] }>("/api/work/materials", "GET"),
    ]);
    setRows(purchases.rows);
    setPartners(partnerList.rows.filter((row) => row.kind === "매입" || row.kind === "공통"));
    setProducts(productList.rows);
    setMaterials(materialList.rows);
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
      const partner = partners.find((row) => row.id === form.partnerId);
      const body = {
        ...form,
        partnerName: partner?.name ?? "",
        qty: Number(form.qty || 0),
        unitPrice: Number(form.unitPrice || 0),
      };
      await ledgerRequest("/api/work/purchases", editing ? "PATCH" : "POST", editing ? { ...body, id: editing } : body);
      setForm({ ...empty, purchasedOn: today() });
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
    if (!window.confirm("이 매입을 지울까요? 넣었던 수량만큼 재고도 빠집니다.")) return;
    setError("");
    try {
      await ledgerRequest("/api/work/purchases", "DELETE", { id });
      if (editing === id) {
        setEditing(null);
        setForm({ ...empty, purchasedOn: today() });
      }
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "지우지 못했습니다.");
    }
  }

  const visible = rows.filter((row) => {
    if (!inDateRange(row.purchasedOn, from, to)) return false;
    if (group === "partner" && partnerFilter && row.partnerId !== partnerFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <ViewToggle mode={mode} onChange={setMode} />
      {mode === "input" ? (
      <form
        className="grid gap-2 rounded-xl border bg-card p-3 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label className="space-y-1 text-xs text-muted-foreground">
          매입일
          <Input type="date" value={form.purchasedOn} onChange={(event) => setField("purchasedOn", event.target.value)} />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          거래처
          <select
            className="h-9 w-full rounded-md border bg-transparent px-3 text-sm text-foreground"
            value={form.partnerId}
            onChange={(event) => setField("partnerId", event.target.value)}
          >
            <option value="">선택</option>
            {partners.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          품목
          <CatalogItemSelect
            products={products}
            materials={materials}
            includeMaterials
            priceOf="in"
            stockKind={form.stockKind}
            itemId={form.itemId}
            onChange={(next) => setForm((prev) => ({
              ...prev,
              stockKind: next.stockKind,
              itemId: next.itemId,
              item: next.item,
              spec: next.spec,
              unitPrice: String(next.unitPrice || ""),
            }))}
          />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          규격
          <Input value={form.spec} onChange={(event) => setField("spec", event.target.value)} />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          수량
          <Input inputMode="decimal" value={form.qty} onChange={(event) => setField("qty", event.target.value)} />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          단가
          <Input inputMode="numeric" value={form.unitPrice} onChange={(event) => setField("unitPrice", event.target.value)} />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground lg:col-span-2">
          메모
          <Input value={form.note} onChange={(event) => setField("note", event.target.value)} />
        </label>
        <div className="flex items-center gap-2 lg:col-span-4">
          <Button type="submit" size="sm" disabled={busy}>
            {editing ? "수정" : "등록"}
          </Button>
          {editing ? (
            <Button type="button" size="sm" variant="outline" onClick={() => { setEditing(null); setForm({ ...empty, purchasedOn: today() }); }}>
              취소
            </Button>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </form>
      ) : (
      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-2">
          <Button type="button" size="sm" variant={group === "partner" ? "default" : "outline"} onClick={() => setGroup("partner")}>
            업체별
          </Button>
          <Button type="button" size="sm" variant={group === "date" ? "default" : "outline"} onClick={() => setGroup("date")}>
            일자별
          </Button>
          {group === "partner" ? (
            <select
              className="h-8 rounded-md border bg-transparent px-2 text-sm"
              value={partnerFilter}
              onChange={(event) => setPartnerFilter(event.target.value)}
            >
              <option value="">전체 업체</option>
              {partners.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
            </select>
          ) : null}
          <DateSpan from={from} to={to} onFrom={setFrom} onTo={setTo} />
        </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">매입일</th>
              <th className="px-3 py-2 font-medium">거래처</th>
              <th className="px-3 py-2 font-medium">품목</th>
              <th className="px-3 py-2 font-medium">규격</th>
              <th className="px-3 py-2 text-right font-medium">수량</th>
              <th className="px-3 py-2 text-right font-medium">단가</th>
              <th className="px-3 py-2 text-right font-medium">금액</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={8}>
                  매입 내역이 없습니다.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{row.purchasedOn}</td>
                  <td className="px-3 py-2">{row.partnerName || "—"}</td>
                  <td className="px-3 py-2">{row.item}</td>
                  <td className="px-3 py-2">{row.spec || "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.qty.toLocaleString("ko-KR")}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.unitPrice.toLocaleString("ko-KR")}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.amount.toLocaleString("ko-KR")}</td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(row.id);
                        setForm({
                          purchasedOn: row.purchasedOn,
                          partnerId: row.partnerId,
                          stockKind: row.stockKind === "부자재" ? "부자재" : "상품",
                          itemId: row.itemId || "",
                          item: row.item,
                          spec: row.spec,
                          qty: String(row.qty),
                          unitPrice: String(row.unitPrice),
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
      </div>
      )}
    </div>
  );
}
