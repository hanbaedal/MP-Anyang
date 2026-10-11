"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ManageImagePicker } from "@/components/manage-image-picker";
import type { SiteAnnouncement } from "@/lib/announcement-types";
import { ANNOUNCEMENT_SCHEDULE_LABELS, announcementScheduleStatus } from "@/lib/announcement-types";
import { thumbUrl } from "@/lib/media";

const field =
  "h-8 w-full rounded-md border border-input bg-card px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const area =
  "min-h-20 w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function emptyDraft(): Partial<SiteAnnouncement> {
  return {
    title: "",
    body: "",
    imageSrc: "",
    linkHref: "",
    linkLabel: "자세히 보기",
    enabled: true,
    startsAt: "",
    endsAt: "",
    dismissScope: "day",
    sortOrder: 0,
  };
}

function toLocalInput(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

export function ManageAnnouncements({ initial }: { initial: SiteAnnouncement[] }) {
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState<Partial<SiteAnnouncement>>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "busy">("idle");
  const [message, setMessage] = useState("");

  async function save() {
    setStatus("busy");
    setMessage("");
    try {
      const res = await fetch("/api/manage/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, id: editingId ?? undefined }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; items?: SiteAnnouncement[] };
      if (!res.ok || !json.ok || !json.items) {
        setMessage(json.error || "저장에 실패했습니다.");
        return;
      }
      setItems(json.items);
      setDraft(emptyDraft());
      setEditingId(null);
      setMessage("저장했습니다.");
    } catch {
      setMessage("네트워크 오류입니다.");
    } finally {
      setStatus("idle");
    }
  }

  async function remove(id: string) {
    if (!confirm("삭제할까요?")) return;
    setStatus("busy");
    const res = await fetch(`/api/manage/announcements?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const json = (await res.json()) as { items?: SiteAnnouncement[] };
    if (json.items) setItems(json.items);
    if (editingId === id) {
      setEditingId(null);
      setDraft(emptyDraft());
    }
    setStatus("idle");
  }

  async function uploadPoster(file: File) {
    setStatus("busy");
    const form = new FormData();
    form.set("file", file);
    try {
      const res = await fetch("/api/manage/upload-image", { method: "POST", body: form });
      const json = (await res.json()) as { ok?: boolean; src?: string; error?: string };
      if (json.src) {
        setDraft((d) => ({ ...d, imageSrc: json.src }));
        setMessage("사진을 올렸습니다. 「저장」을 눌러야 목록·메인에 반영됩니다.");
      } else setMessage(json.error || "업로드 실패");
    } finally {
      setStatus("idle");
    }
  }

  function edit(item: SiteAnnouncement) {
    setEditingId(item.id);
    setDraft({ ...item });
  }

  const busy = status === "busy";

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-3 py-6 sm:px-4">
      <p className="text-xs leading-relaxed text-muted-foreground">
        메인(/) 접속 시 모달 · 노출 시작/종료 · 「사용 안 함」OFF · 다른 메뉴 후 메인 재진입 시 다시 표시
      </p>

      <section className="space-y-3 rounded-lg border bg-card p-3 sm:p-4">
        <h2 className="text-sm font-medium">{editingId ? "수정" : "새 팝업"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block space-y-0.5 text-xs md:col-span-2">
            <span className="text-muted-foreground">제목</span>
            <input className={field} value={draft.title ?? ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </label>
          <label className="block space-y-0.5 text-xs md:col-span-2">
            <span className="text-muted-foreground">본문</span>
            <textarea className={area} value={draft.body ?? ""} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
          </label>
          <div className="md:col-span-2">
            <p className="mb-1 text-xs text-muted-foreground">포스터</p>
            <ManageImagePicker src={draft.imageSrc ?? ""} disabled={busy} onFile={uploadPoster} />
          </div>
          <label className="block space-y-0.5 text-xs">
            <span className="text-muted-foreground">링크 URL</span>
            <input className={field} value={draft.linkHref ?? ""} onChange={(e) => setDraft({ ...draft, linkHref: e.target.value })} placeholder="/support/notices/…" />
          </label>
          <label className="block space-y-0.5 text-xs">
            <span className="text-muted-foreground">링크 버튼</span>
            <input className={field} value={draft.linkLabel ?? ""} onChange={(e) => setDraft({ ...draft, linkLabel: e.target.value })} />
          </label>
          <label className="block space-y-0.5 text-xs">
            <span className="text-muted-foreground">노출 시작</span>
            <input
              type="datetime-local"
              className={field}
              value={toLocalInput(draft.startsAt ?? "")}
              onChange={(e) => setDraft({ ...draft, startsAt: fromLocalInput(e.target.value) })}
            />
          </label>
          <label className="block space-y-0.5 text-xs">
            <span className="text-muted-foreground">노출 종료</span>
            <input
              type="datetime-local"
              className={field}
              value={toLocalInput(draft.endsAt ?? "")}
              onChange={(e) => setDraft({ ...draft, endsAt: fromLocalInput(e.target.value) })}
            />
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={draft.enabled !== false} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} />
            사용함
          </label>
          <label className="block space-y-0.5 text-xs">
            <span className="text-muted-foreground">순서 (작을수록 먼저)</span>
            <input
              type="number"
              className={field}
              value={draft.sortOrder ?? 0}
              onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" size="sm" disabled={busy} onClick={() => void save()}>
            {editingId ? "저장" : "등록"}
          </Button>
          {editingId ? (
            <Button type="button" size="sm" variant="outline" onClick={() => { setEditingId(null); setDraft(emptyDraft()); }}>
              취소
            </Button>
          ) : null}
        </div>
      </section>

      <section className="space-y-2 rounded-lg border bg-card p-3 sm:p-4">
        <h2 className="text-sm font-medium">목록 ({items.length})</h2>
        <ul className="divide-y rounded-md border">
          {items.map((item) => (
            <li key={item.id} className="flex gap-2 p-2 text-xs sm:gap-3">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded bg-muted">
                {item.imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbUrl(item.imageSrc)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-muted-foreground">없음</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {ANNOUNCEMENT_SCHEDULE_LABELS[announcementScheduleStatus(item)]}
                  {item.startsAt ? ` · ${new Date(item.startsAt).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}~` : ""}
                  {item.endsAt ? new Date(item.endsAt).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }) : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => edit(item)}>
                  수정
                </Button>
                <Button type="button" size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => void remove(item.id)}>
                  삭제
                </Button>
              </div>
            </li>
          ))}
          {!items.length ? <li className="p-3 text-muted-foreground">등록 없음</li> : null}
        </ul>
      </section>

      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
