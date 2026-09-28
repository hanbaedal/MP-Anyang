"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { AnnouncementDismissScope, SiteAnnouncement } from "@/lib/announcement-types";
import { ANNOUNCEMENT_SCHEDULE_LABELS, announcementScheduleStatus } from "@/lib/announcement-types";

const field =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const area =
  "min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

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
      setMessage("저장했습니다. 메인에서 조건에 맞으면 모달로 표시됩니다.");
    } catch {
      setMessage("네트워크 오류입니다.");
    } finally {
      setStatus("idle");
    }
  }

  async function remove(id: string) {
    if (!confirm("이 공지·이벤트를 삭제할까요?")) return;
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
    const form = new FormData();
    form.set("file", file);
    const res = await fetch("/api/manage/upload-image", { method: "POST", body: form });
    const json = (await res.json()) as { ok?: boolean; src?: string; error?: string };
    if (json.src) setDraft((d) => ({ ...d, imageSrc: json.src }));
    else setMessage(json.error || "이미지 업로드에 실패했습니다.");
  }

  function edit(item: SiteAnnouncement) {
    setEditingId(item.id);
    setDraft({ ...item, startsAt: item.startsAt, endsAt: item.endsAt });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-10">
      <p className="text-sm text-muted-foreground">
        <strong>메인(/) 접속 시</strong>만 모달로 뜹니다. <strong>노출 시작</strong> 전에는 안 보이고, <strong>종료</strong> 시각이 지나면 자동으로 숨깁니다(1분마다
        갱신). 「사용 안 함」이면 즉시 OFF. 방문자가 닫아도 <strong>다른 메뉴 갔다가 메인(/)으로
        다시 들어오면</strong> 노출 기간 안이면 모달이 다시 뜹니다.
      </p>

      <section className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-medium">{editingId ? "수정" : "새 이벤트·소식"}</h2>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">제목</span>
          <input className={field} value={draft.title ?? ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">본문</span>
          <textarea className={area} value={draft.body ?? ""} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">포스터 이미지</span>
          <input type="file" accept="image/*" disabled={status === "busy"} onChange={(e) => e.target.files?.[0] && void uploadPoster(e.target.files[0])} />
          {draft.imageSrc ? <p className="text-xs text-muted-foreground">{draft.imageSrc}</p> : null}
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium">링크 URL (선택)</span>
            <input className={field} value={draft.linkHref ?? ""} onChange={(e) => setDraft({ ...draft, linkHref: e.target.value })} placeholder="/support/notices/…" />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">링크 버튼 글</span>
            <input className={field} value={draft.linkLabel ?? ""} onChange={(e) => setDraft({ ...draft, linkLabel: e.target.value })} />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="font-medium">노출 시작 (비우면 즉시)</span>
            <input
              type="datetime-local"
              className={field}
              value={toLocalInput(draft.startsAt ?? "")}
              onChange={(e) => setDraft({ ...draft, startsAt: fromLocalInput(e.target.value) })}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">노출 종료 (비우면 무기한)</span>
            <input
              type="datetime-local"
              className={field}
              value={toLocalInput(draft.endsAt ?? "")}
              onChange={(e) => setDraft({ ...draft, endsAt: fromLocalInput(e.target.value) })}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.enabled !== false} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} />
            사용함
          </label>
          <label className="block space-y-1 text-sm sm:col-span-2">
            <span className="font-medium">닫기 후 다시 보기</span>
            <select
              className={field}
              value={draft.dismissScope ?? "day"}
              onChange={(e) => setDraft({ ...draft, dismissScope: e.target.value as AnnouncementDismissScope })}
            >
              <option value="day">오늘 하루 안 보기</option>
              <option value="session">이 탭에서만 안 보기</option>
              <option value="until_end">닫으면 종료일까지 안 보기</option>
            </select>
          </label>
        </div>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">표시 순서 (작을수록 먼저)</span>
          <input
            type="number"
            className={field}
            value={draft.sortOrder ?? 0}
            onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) || 0 })}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={status === "busy"} onClick={() => void save()}>
            {editingId ? "수정 저장" : "등록"}
          </Button>
          {editingId ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setDraft(emptyDraft());
              }}
            >
              취소
            </Button>
          ) : null}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-medium">등록 목록</h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border px-3 py-3 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    · {ANNOUNCEMENT_SCHEDULE_LABELS[announcementScheduleStatus(item)]}
                    {item.startsAt ? ` · 시작 ${new Date(item.startsAt).toLocaleString("ko-KR", { hour12: false })}` : " · 시작 즉시"}
                    {item.endsAt ? ` · 종료 ${new Date(item.endsAt).toLocaleString("ko-KR", { hour12: false })}` : " · 종료 없음"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => edit(item)}>
                    수정
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => void remove(item.id)}>
                    삭제
                  </Button>
                </div>
              </div>
            </li>
          ))}
          {!items.length ? <p className="text-muted-foreground">등록된 이벤트가 없습니다.</p> : null}
        </ul>
      </section>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
