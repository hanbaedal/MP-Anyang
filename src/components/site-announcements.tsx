"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isAnnouncementActive, type SiteAnnouncement } from "@/lib/announcement-types";
import { thumbUrl } from "@/lib/media";

function filterVisible(items: SiteAnnouncement[], dismissedIds: ReadonlySet<string>) {
  const now = new Date();
  return items.filter((item) => isAnnouncementActive(item, now) && !dismissedIds.has(item.id));
}

export function SiteAnnouncements() {
  const [allActive, setAllActive] = useState<SiteAnnouncement[]>([]);
  /** 이번 메인(/) 방문 동안만 — 다른 메뉴 갔다가 메인으로 오면 컴포넌트가 다시 마운트되어 비워짐 */
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
  const [current, setCurrent] = useState<SiteAnnouncement | null>(null);
  const [open, setOpen] = useState(false);

  const syncFromActive = useCallback(
    (items: SiteAnnouncement[], dismissed: ReadonlySet<string>) => {
      const visible = filterVisible(items, dismissed);
      setCurrent((prev) => {
        if (prev && visible.some((item) => item.id === prev.id)) return prev;
        return visible[0] ?? null;
      });
      setOpen(visible.length > 0);
    },
    [],
  );

  const load = useCallback(async () => {
    const res = await fetch("/api/announcements/active", { cache: "no-store" });
    const json = (await res.json()) as { items?: SiteAnnouncement[] };
    const items = json.items ?? [];
    setAllActive(items);
    setDismissedIds((dismissed) => {
      syncFromActive(items, dismissed);
      return dismissed;
    });
  }, [syncFromActive]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  useEffect(() => {
    syncFromActive(allActive, dismissedIds);
  }, [allActive, dismissedIds, syncFromActive]);

  function closeAndNext() {
    if (!current) return;
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(current.id);
      const visible = filterVisible(allActive, next);
      setCurrent(visible[0] ?? null);
      setOpen(visible.length > 0);
      return next;
    });
  }

  if (!current) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeAndNext();
        else setOpen(next);
      }}
    >
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto p-0" showCloseButton>
        <DialogTitle className="px-5 pt-5 text-lg font-semibold">{current.title}</DialogTitle>
        {current.imageSrc ? (
          <div className="relative mt-3 aspect-[4/3] w-full bg-muted">
            <Image src={thumbUrl(current.imageSrc)} alt="" fill className="object-cover" sizes="(max-width:512px) 100vw" />
          </div>
        ) : null}
        <div className="space-y-4 px-5 pb-5 pt-3">
          {current.body ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{current.body}</p> : null}
          {current.linkHref ? (
            <Button asChild variant="default" className="w-full sm:w-auto">
              <Link href={current.linkHref}>{current.linkLabel || "자세히 보기"}</Link>
            </Button>
          ) : null}
          <div className="flex flex-wrap gap-2 border-t pt-3">
            <Button type="button" variant="outline" size="sm" onClick={closeAndNext}>
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
