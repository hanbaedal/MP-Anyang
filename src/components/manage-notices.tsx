"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Notice } from "@/lib/notices";

const field =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const area =
  "min-h-28 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ManageNotices({ initial }: { initial: Notice[] }) {
  const [items, setItems] = useState(initial);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [message, setMessage] = useState("");

  async function refresh() {
    const res = await fetch("/api/manage/notices");
    const json = (await res.json()) as { items?: Notice[] };
    if (json.items) setItems(json.items);
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/manage/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, pinned }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      setMessage(json.error || "저장에 실패했습니다.");
      return;
    }
    setTitle("");
    setBody("");
    setPinned(false);
    setMessage("등록했습니다.");
    await refresh();
  }

  async function onSave() {
    if (!editing) return;
    const res = await fetch("/api/manage/notices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      setMessage(json.error || "저장에 실패했습니다.");
      return;
    }
    setEditing(null);
    setMessage("수정했습니다.");
    await refresh();
  }

  async function onDelete(slug: string) {
    if (!confirm("이 공지를 지울까요?")) return;
    await fetch(`/api/manage/notices?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <form onSubmit={onCreate} className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-medium">새 공지</h2>
        <input className={field} placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className={area} placeholder="본문" value={body} onChange={(e) => setBody(e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          고정
        </label>
        <Button type="submit">등록</Button>
      </form>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.slug} className="rounded-xl border bg-card p-4">
            {editing?.slug === item.slug ? (
              <div className="space-y-2">
                <input className={field} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                <textarea className={area} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(editing.pinned)}
                    onChange={(e) => setEditing({ ...editing, pinned: e.target.checked })}
                  />
                  고정
                </label>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={onSave}>
                    저장
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setEditing(null)}>
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {item.pinned ? <span className="mr-2 text-xs text-ring">고정</span> : null}
                    {item.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.body}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setEditing(item)}>
                    수정
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => onDelete(item.slug)}>
                    삭제
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
