"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { CmsPhotoItems } from "@/components/cms-photo-items";
import type { CmsItem, CmsPage, CmsSlug } from "@/lib/cms-types";

const field =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const area =
  "min-h-32 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const PHOTO_SLUGS: CmsSlug[] = ["burial", "lawn", "columbarium", "remodeling"];

function emptyItem(slug: CmsSlug): CmsItem {
  const id = crypto.randomUUID();
  if (slug === "prices") return { id, title: "", won: "", remaining: "" };
  if (slug === "features") return { id, title: "", text: "" };
  return { id, title: "", text: "", image: "" };
}

export function CmsEditor({ initial }: { initial: CmsPage }) {
  const [page, setPage] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const showItems = page.slug !== "greeting";
  const photoGrid = PHOTO_SLUGS.includes(page.slug);
  const showPrices = page.slug === "prices";

  function patchItem(id: string, patch: Partial<CmsItem>) {
    setPage((prev) => ({ ...prev, items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) }));
  }

  const persistPage = useCallback(async (items: CmsItem[]) => {
    let snapshot!: CmsPage;
    setPage((prev) => {
      snapshot = { ...prev, items };
      return snapshot;
    });
    const res = await fetch("/api/manage/pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string; page?: CmsPage };
    if (!res.ok || !json.ok) {
      setStatus("error");
      setMessage(json.error || "저장에 실패했습니다.");
      return false;
    }
    if (json.page) setPage(json.page);
    setStatus("ok");
    return true;
  }, []);

  const persistFullPage = useCallback(async () => {
    let snapshot!: CmsPage;
    setPage((prev) => {
      snapshot = prev;
      return prev;
    });
    const res = await fetch("/api/manage/pages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string; page?: CmsPage };
    if (!res.ok || !json.ok) {
      setStatus("error");
      setMessage(json.error || "저장에 실패했습니다.");
      return false;
    }
    if (json.page) setPage(json.page);
    setStatus("ok");
    return true;
  }, []);

  async function onSave(event: React.FormEvent) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const ok = await persistFullPage();
      if (ok) setMessage("저장했습니다. 공개 페이지에 바로 반영됩니다.");
    } catch {
      setStatus("error");
      setMessage("네트워크 오류입니다.");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={onSave} className="mx-auto max-w-6xl space-y-5 px-4 py-10">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">제목</span>
          <input className={field} value={page.title} onChange={(e) => setPage({ ...page, title: e.target.value })} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">요약</span>
          <input className={field} value={page.lead} onChange={(e) => setPage({ ...page, lead: e.target.value })} />
        </label>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">본문 (빈 줄로 문단)</span>
        <textarea className={area} value={page.body} onChange={(e) => setPage({ ...page, body: e.target.value })} />
      </label>
      {showItems && photoGrid ? (
        <CmsPhotoItems
          slug={page.slug}
          items={page.items}
          onItemsChange={(items) => setPage((prev) => ({ ...prev, items }))}
          onPersist={persistPage}
        />
      ) : null}
      {showItems && !photoGrid ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">항목</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage({ ...page, items: [...page.items, emptyItem(page.slug)] })}
            >
              항목 추가
            </Button>
          </div>
          <ul className="space-y-3">
            {page.items.map((item) => (
              <li key={item.id} className="space-y-2 rounded-xl border bg-card p-4">
                <input
                  className={field}
                  placeholder="제목"
                  value={item.title}
                  onChange={(e) => patchItem(item.id, { title: e.target.value })}
                />
                {showPrices ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      className={field}
                      placeholder="분양가 (원, 비우면 확인 필요)"
                      value={item.won ?? ""}
                      onChange={(e) => patchItem(item.id, { won: e.target.value })}
                    />
                    <input
                      className={field}
                      placeholder="잔여 구좌 (비우면 확인 필요)"
                      value={item.remaining ?? ""}
                      onChange={(e) => patchItem(item.id, { remaining: e.target.value })}
                    />
                  </div>
                ) : (
                  <textarea
                    className={area}
                    placeholder="설명"
                    value={item.text ?? ""}
                    onChange={(e) => patchItem(item.id, { text: e.target.value })}
                  />
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPage({ ...page, items: page.items.filter((row) => row.id !== item.id) })}
                >
                  삭제
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <Button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "저장 중…" : "페이지 저장 (제목·본문·항목)"}
      </Button>
      {message ? <p className={status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{message}</p> : null}
    </form>
  );
}
