"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { GALLERY, type GalleryTag } from "@/lib/content";
import { mediaUrl, thumbUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useT } from "@/components/locale-provider";

const TAGS: Array<{ value: "전체" | GalleryTag; key: string }> = [
  { value: "전체", key: "gallery.all" },
  { value: "전경", key: "gallery.tag.view" },
  { value: "매장묘", key: "gallery.tag.burial" },
  { value: "평장묘", key: "gallery.tag.lawn" },
  { value: "봉안묘", key: "gallery.tag.columbarium" },
  { value: "리모델링", key: "gallery.tag.remodel" },
];

export function GalleryGrid({ preview }: { preview?: number }) {
  const t = useT();
  const [tag, setTag] = useState<(typeof TAGS)[number]["value"]>("전체");
  const [open, setOpen] = useState<string | null>(null);

  const items = useMemo(() => {
    const filtered = tag === "전체" ? GALLERY : GALLERY.filter((item) => item.tags.includes(tag));
    return typeof preview === "number" ? filtered.slice(0, preview) : filtered;
  }, [tag, preview]);

  const current = GALLERY.find((item) => item.src === open);

  return (
    <div>
      {preview ? null : (
        <div className="mb-6 flex flex-wrap gap-2">
          {TAGS.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={tag === item.value ? "default" : "outline"}
              onClick={() => setTag(item.value)}
            >
              {t(item.key)}
            </Button>
          ))}
        </div>
      )}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.src}>
            <button
              type="button"
              className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted"
              onClick={() => setOpen(item.src)}
            >
              <Image src={thumbUrl(item.src)} alt={item.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </button>
            <p className="mt-2 text-sm text-muted-foreground">{item.alt}</p>
          </li>
        ))}
      </ul>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">{t("gallery.empty")}</p> : null}
      <Dialog open={Boolean(open)} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{current?.alt ?? t("photo")}</DialogTitle>
          {current ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black">
              <Image src={mediaUrl(current.src)} alt={current.alt} fill className="object-contain" sizes="100vw" />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
