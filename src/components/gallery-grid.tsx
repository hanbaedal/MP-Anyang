"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { GALLERY, type GalleryTag } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const TAGS: Array<"전체" | GalleryTag> = ["전체", "전경", "매장묘", "평장묘", "봉안묘", "리모델링"];

export function GalleryGrid({ preview }: { preview?: number }) {
  const [tag, setTag] = useState<(typeof TAGS)[number]>("전체");
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
              key={item}
              type="button"
              size="sm"
              variant={tag === item ? "default" : "outline"}
              onClick={() => setTag(item)}
            >
              {item}
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
              <Image src={item.src} alt={item.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </button>
            <p className="mt-2 text-sm text-muted-foreground">{item.alt}</p>
          </li>
        ))}
      </ul>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">이 태그에 해당하는 사진이 없습니다.</p> : null}
      <Dialog open={Boolean(open)} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{current?.alt ?? "사진"}</DialogTitle>
          {current ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black">
              <Image src={current.src} alt={current.alt} fill className="object-contain" sizes="100vw" />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
