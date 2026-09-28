"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAnnouncementActive, type SiteAnnouncement } from "@/lib/announcement-types";
import { thumbUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

/** 카드 폭 고정 — 화면을 가로로 채우지 않고 타일 크기 통일 */
const CARD_WIDTH_CLASS = "w-[168px] sm:w-[176px] md:w-[272px]";

function filterVisible(items: SiteAnnouncement[], dismissedIds: ReadonlySet<string>) {
  const now = new Date();
  return items.filter((item) => isAnnouncementActive(item, now) && !dismissedIds.has(item.id));
}

function AnnouncementCard({ item, onDismiss }: { item: SiteAnnouncement; onDismiss: () => void }) {
  return (
    <article
      className={cn(
        CARD_WIDTH_CLASS,
        "relative flex shrink-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/95 text-card-foreground shadow-md ring-1 ring-black/5 backdrop-blur-md",
      )}
    >
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-1.5 top-1.5 z-10 inline-flex size-7 items-center justify-center rounded-full bg-black/55 text-white shadow-sm hover:bg-black/75"
        aria-label={`${item.title} 닫기`}
      >
        <X className="size-3.5" aria-hidden />
      </button>
      {item.imageSrc ? (
        <div className="relative aspect-[3/4] w-full bg-muted md:aspect-[4/5]">
          <Image
            src={thumbUrl(item.imageSrc)}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:768px) 168px, 272px"
          />
        </div>
      ) : (
        <div className="aspect-[3/4] w-full bg-muted/80 md:aspect-[4/5]" aria-hidden />
      )}
      <div className="flex flex-1 flex-col items-center gap-2 px-3 py-3 text-center md:px-4 md:py-3.5">
        <h3 className="line-clamp-2 w-full text-sm font-semibold leading-snug tracking-tight md:text-[15px]">
          {item.title}
        </h3>
        {item.body ? (
          <p className="line-clamp-3 w-full text-xs leading-relaxed text-muted-foreground md:text-[13px] md:leading-snug">
            {item.body}
          </p>
        ) : null}
        {item.linkHref ? (
          <Button asChild size="sm" variant="secondary" className="mt-auto h-8 min-w-[7rem] px-4 text-xs">
            <Link href={item.linkHref}>{item.linkLabel || "자세히 보기"}</Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function SiteAnnouncements() {
  const [allActive, setAllActive] = useState<SiteAnnouncement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());

  const visible = useMemo(() => filterVisible(allActive, dismissedIds), [allActive, dismissedIds]);

  const load = useCallback(async () => {
    const res = await fetch("/api/announcements/active", { cache: "no-store" });
    const json = (await res.json()) as { items?: SiteAnnouncement[] };
    setAllActive(json.items ?? []);
  }, []);

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

  function dismiss(id: string) {
    setDismissedIds((prev) => new Set(prev).add(id));
  }

  if (!visible.length) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-12 z-30 max-h-[min(48vh,480px)] overflow-y-auto px-2 py-2.5 sm:px-3 lg:left-36 lg:px-4"
      aria-label="이벤트·소식"
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto flex max-w-6xl flex-wrap justify-center gap-2.5 sm:gap-3",
          "max-md:grid max-md:grid-cols-2 max-md:justify-items-center max-md:gap-x-2 max-md:gap-y-2.5",
        )}
      >
        {visible.map((item) => (
          <AnnouncementCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </div>
  );
}
