"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type StaffRow = {
  id: string;
  username: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  role: string;
};

const field =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ManageAdmins({ initial }: { initial: StaffRow[] }) {
  const [items, setItems] = useState(initial);
  const [form, setForm] = useState({ username: "", password: "", name: "", title: "", phone: "", email: "" });
  const [message, setMessage] = useState("");

  async function refresh() {
    const res = await fetch("/api/manage/admins");
    const json = (await res.json()) as { items?: StaffRow[] };
    if (json.items) setItems(json.items);
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/manage/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      setMessage(json.error || "저장에 실패했습니다.");
      return;
    }
    setForm({ username: "", password: "", name: "", title: "", phone: "", email: "" });
    setMessage("관리자를 만들었습니다.");
    await refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("이 관리자 계정을 지울까요?")) return;
    const res = await fetch(`/api/manage/admins?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      setMessage(json.error || "삭제에 실패했습니다.");
      return;
    }
    await refresh();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <form onSubmit={onCreate} className="grid gap-3 rounded-xl border bg-card p-5 md:grid-cols-2">
        <h2 className="font-medium md:col-span-2">관리자 만들기</h2>
        <input className={field} placeholder="아이디" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input className={field} type="password" placeholder="비밀번호" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input className={field} placeholder="이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={field} placeholder="직위 (선택)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className={field} placeholder="연락처" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className={field} placeholder="이메일" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <div className="md:col-span-2">
          <Button type="submit">만들기</Button>
        </div>
      </form>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <ul className="divide-y rounded-xl border bg-card">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">
                {item.username} · {item.name}{" "}
                <span className="text-xs text-muted-foreground">{item.role === "supervisor" ? "감독" : "관리자"}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {item.title || "직위 없음"} · {item.phone || "연락처 없음"} · {item.email || "이메일 없음"}
              </p>
            </div>
            {item.role === "admin" ? (
              <Button type="button" size="sm" variant="outline" onClick={() => onDelete(item.id)}>
                삭제
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
