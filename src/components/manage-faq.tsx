"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type FaqItem = {
  id: string;
  name: string;
  question: string;
  answer: string;
  createdAt: string;
  public: boolean;
};

const field =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const area =
  "min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ManageFaq({ initial }: { initial: FaqItem[] }) {
  const [items, setItems] = useState(initial);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [name, setName] = useState("관리사무실");
  const [isPublic, setIsPublic] = useState(true);
  const [message, setMessage] = useState("");

  async function refresh() {
    const res = await fetch("/api/manage/faq");
    const json = (await res.json()) as { items?: FaqItem[] };
    if (json.items) setItems(json.items);
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/manage/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, question, answer, public: isPublic }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      setMessage(json.error || "저장에 실패했습니다.");
      return;
    }
    setQuestion("");
    setAnswer("");
    setMessage("등록했습니다. 공개로 두면 묻고답하기 목록에 보입니다.");
    await refresh();
  }

  async function onPatch(item: FaqItem) {
    await fetch("/api/manage/faq", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    await refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("이 항목을 지울까요?")) return;
    await fetch(`/api/manage/faq?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <form onSubmit={onCreate} className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-medium">질문·답 등록</h2>
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="작성 이름" />
        <textarea className={area} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="질문" />
        <textarea className={area} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="답" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          공개 목록에 보이기
        </label>
        <Button type="submit">등록</Button>
      </form>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="space-y-2 rounded-xl border bg-card p-4">
            <textarea
              className={area}
              value={item.question}
              onChange={(e) => setItems(items.map((row) => (row.id === item.id ? { ...row, question: e.target.value } : row)))}
            />
            <textarea
              className={area}
              value={item.answer}
              onChange={(e) => setItems(items.map((row) => (row.id === item.id ? { ...row, answer: e.target.value } : row)))}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item.public}
                onChange={(e) => setItems(items.map((row) => (row.id === item.id ? { ...row, public: e.target.checked } : row)))}
              />
              공개
            </label>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={() => onPatch(item)}>
                저장
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => onDelete(item.id)}>
                삭제
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
