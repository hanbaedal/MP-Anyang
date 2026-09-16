"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GALLERY_TAGS, type GalleryPhoto } from "@/lib/gallery-types";
import type { GalleryTag } from "@/lib/content";

const field =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ManageGallery({ initial }: { initial: GalleryPhoto[] }) {
  const [items, setItems] = useState(initial);
  const [alt, setAlt] = useState("");
  const [tags, setTags] = useState<GalleryTag[]>(["전경"]);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  async function refresh() {
    const res = await fetch("/api/manage/gallery");
    const json = (await res.json()) as { items?: GalleryPhoto[] };
    if (json.items) setItems(json.items);
  }

  async function onUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setMessage("사진 파일을 선택해 주세요.");
      return;
    }
    const form = new FormData();
    form.set("file", file);
    form.set("alt", alt);
    form.set("tags", tags.join(","));
    const res = await fetch("/api/manage/gallery", { method: "POST", body: form });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      setMessage(json.error || "업로드에 실패했습니다.");
      return;
    }
    setAlt("");
    setFile(null);
    setMessage("올렸습니다. Render에 다시 배포하면 업로드 파일이 사라질 수 있습니다.");
    await refresh();
  }

  async function onSave(item: GalleryPhoto) {
    await fetch("/api/manage/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    await refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("이 사진을 지울까요?")) return;
    await fetch(`/api/manage/gallery?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await refresh();
  }

  function toggleTag(current: GalleryTag[], tag: GalleryTag) {
    return current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag];
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <form onSubmit={onUpload} className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-medium">사진 올리기</h2>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <input className={field} placeholder="설명" value={alt} onChange={(e) => setAlt(e.target.value)} />
        <div className="flex flex-wrap gap-2 text-sm">
          {GALLERY_TAGS.map((tag) => (
            <label key={tag} className="flex items-center gap-1">
              <input type="checkbox" checked={tags.includes(tag)} onChange={() => setTags(toggleTag(tags, tag))} />
              {tag}
            </label>
          ))}
        </div>
        <Button type="submit">올리기</Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="space-y-2 rounded-xl border bg-card p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.src} alt={item.alt} className="aspect-[4/3] w-full rounded-md object-cover" />
            <input className={field} value={item.alt} onChange={(e) => setItems(items.map((row) => (row.id === item.id ? { ...row, alt: e.target.value } : row)))} />
            <div className="flex flex-wrap gap-2 text-xs">
              {GALLERY_TAGS.map((tag) => (
                <label key={tag} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={item.tags.includes(tag)}
                    onChange={() =>
                      setItems(items.map((row) => (row.id === item.id ? { ...row, tags: toggleTag(row.tags, tag) } : row)))
                    }
                  />
                  {tag}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={() => onSave(item)}>
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
