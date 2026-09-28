"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isAnnouncementActive, type SiteAnnouncement } from "@/lib/announcement-types";
import { thumbUrl } from "@/lib/media";

function dismissKey(id: string) {
  return `anyang-announcement-dismiss-${id}`;
}

function isDismissed(item: SiteAnnouncement): boolean {
  if (typeof window === "undefined") return false;
  const key = dismissKey(item.id);
  const raw = item.dismissScope === "session" ? sessionStorage.getItem(key) : localStorage.getItem(key);
  if (!raw) return false;
  if (item.dismissScope === "day") {
    const today = new Date().toISOString().slice(0, 10);
    return raw === today;
  }
  return true;
}

function rememberDismiss(item: SiteAnnouncement) {
  const key = dismissKey(item.id);
  if (item.dismissScope === "session") {
    sessionStorage.setItem(key, "1");
  } else if (item.dismissScope === "day") {
    localStorage.setItem(key, new Date().toISOString().slice(0, 10));
  } else {
    localStorage.setItem(key, "1");
  }
}

function filterVisible(items: SiteAnnouncement[]) {
  const now = new Date();
  return items.filter((item) => isAnnouncementActive(item, now) && !isDismissed(item));
}

export function SiteAnnouncements() {
  const [queue, setQueue] = useState<SiteAnnouncement[]>([]);
  const [current, setCurrent] = useState<SiteAnnouncement | null>(null);
  const [open, setOpen] = useState(false);

  const applyQueue = useCallback((items: SiteAnnouncement[]) => {
    const visible = filterVisible(items);
    setQueue(visible);
    setCurrent((prev) => {
      if (prev && isAnnouncementActive(prev) && !isDismissed(prev)) {
        return prev;
      }
      return visible[0] ?? null;
    });
    setOpen(Boolean(visible[0]));
  }, []);

  const load = useCallback(async () => {
    const res = await fetch("/api/announcements/active", { cache: "no-store" });
    const json = (await res.json()) as { items?: SiteAnnouncement[] };
    applyQueue(json.items ?? []);
  }, [applyQueue]);

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
    if (!current) return;
    if (!isAnnouncementActive(current) || isDismissed(current)) {
      const rest = queue.filter((item) => item.id !== current.id);
      applyQueue(rest);
    }
  }, [current, queue, applyQueue]);

  function closeAndNext() {
    if (!current) return;
    rememberDismiss(current);
    const rest = queue.filter((item) => item.id !== current.id);
    applyQueue(rest);
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
              {current.dismissScope === "day" ? "오늘 하루 안 보기" : "닫기"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
