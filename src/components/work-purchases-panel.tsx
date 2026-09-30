"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ledgerRequest } from "@/lib/ledger-client";
import type { Partner, Purchase } from "@/lib/work-ledgers";

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
  item: "",
  spec: "",
  qty: "",
  unitPrice: "",
  note: "",
};

export function WorkPurchasesPanel() {
  const [rows, setRows] = useState<Purchase[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [form, setForm] = useState({ ...empty, purchasedOn: today() });
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function reload() {
    const [purchases, partnerList] = await Promise.all([
      ledgerRequest<{ rows: Purchase[] }>("/api/work/purchases", "GET"),
      ledgerRequest<{ rows: Partner[] }>("/api/work/partners", "GET"),
    ]);
    setRows(purchases.rows);
    setPartners(partnerList.rows.filter((row) => row.kind === "매입" || row.kind === "공통"));
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

  return (
    <div className="space-y-4">
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
          <Input value={form.item} onChange={(event) => setField("item", event.target.value)} />
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
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={8}>
                  매입 내역이 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
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
                          item: row.item,
                          spec: row.spec,
                          qty: String(row.qty),
                          unitPrice: String(row.unitPrice),
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
