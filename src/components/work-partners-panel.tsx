"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ViewToggle } from "@/components/work-ledger-controls";
import { Input } from "@/components/ui/input";
import { ledgerRequest } from "@/lib/ledger-client";
import type { Partner, PartnerKind } from "@/lib/work-ledgers";

const empty = {
  kind: "매입" as PartnerKind,
  name: "",
  bizNo: "",
  representative: "",
  phone: "",
  email: "",
  address: "",
  note: "",
};

export function WorkPartnersPanel() {
  const [rows, setRows] = useState<Partner[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"input" | "list">("input");

  async function reload() {
    const json = await ledgerRequest<{ rows: Partner[] }>("/api/work/partners", "GET");
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
      await ledgerRequest("/api/work/partners", editing ? "PATCH" : "POST", editing ? { ...form, id: editing } : form);
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
    if (!window.confirm("이 거래처를 지울까요?")) return;
    setError("");
    try {
      await ledgerRequest("/api/work/partners", "DELETE", { id });
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
        <label className="space-y-1 text-xs text-muted-foreground">
          구분
          <select
            className="h-9 w-full rounded-md border bg-transparent px-3 text-sm text-foreground"
            value={form.kind}
            onChange={(event) => setField("kind", event.target.value)}
          >
            <option value="매입">매입</option>
            <option value="공통">공통</option>
          </select>
        </label>
        <Field label="상호" value={form.name} onChange={(value) => setField("name", value)} />
        <Field label="사업자번호" value={form.bizNo} onChange={(value) => setField("bizNo", value)} />
        <Field label="대표자" value={form.representative} onChange={(value) => setField("representative", value)} />
        <Field label="전화" value={form.phone} onChange={(value) => setField("phone", value)} />
        <Field label="이메일" value={form.email} onChange={(value) => setField("email", value)} />
        <Field label="주소" value={form.address} onChange={(value) => setField("address", value)} />
        <Field label="메모" value={form.note} onChange={(value) => setField("note", value)} />
        <div className="flex items-end gap-2 sm:col-span-2">
          <Button type="submit" size="sm" disabled={busy}>
            {editing ? "수정" : "등록"}
          </Button>
          {editing ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
            >
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
              <th className="px-3 py-2 font-medium">구분</th>
              <th className="px-3 py-2 font-medium">상호</th>
              <th className="px-3 py-2 font-medium">사업자번호</th>
              <th className="px-3 py-2 font-medium">대표자</th>
              <th className="px-3 py-2 font-medium">전화</th>
              <th className="px-3 py-2 font-medium">이메일</th>
              <th className="px-3 py-2 font-medium">주소</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-muted-foreground" colSpan={8}>
                  등록된 거래처가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{row.kind}</td>
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2">{row.bizNo || "—"}</td>
                  <td className="px-3 py-2">{row.representative || "—"}</td>
                  <td className="px-3 py-2">{row.phone || "—"}</td>
                  <td className="px-3 py-2">{row.email || "—"}</td>
                  <td className="px-3 py-2">{row.address || "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditing(row.id);
                        setForm({
                          kind: row.kind,
                          name: row.name,
                          bizNo: row.bizNo,
                          representative: row.representative,
                          phone: row.phone,
                          email: row.email,
                          address: row.address,
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

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1 text-xs text-muted-foreground">
      {label}
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
