"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CmsItem, CmsSlug } from "@/lib/cms-types";
import { mediaUrl } from "@/lib/media";

const field =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const area =
  "min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Props = {
  slug: CmsSlug;
  items: CmsItem[];
  onItemsChange: (items: CmsItem[]) => void;
  onPersist: (items: CmsItem[]) => Promise<boolean>;
};

function newItem(): CmsItem {
  return { id: crypto.randomUUID(), title: "", text: "", image: "" };
}

export function CmsPhotoItems({ slug, items, onItemsChange, onPersist }: Props) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const showText = slug === "remodeling" || slug === "burial";
  const textLabel = slug === "burial" ? "설명 (캡션)" : "설명";

  async function onUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setMessage("사진 파일을 선택해 주세요.");
      return;
    }
    if (!title.trim()) {
      setMessage("제목을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/manage/upload-image", { method: "POST", body: form });
      const json = (await res.json()) as { ok?: boolean; src?: string; error?: string };
      if (!res.ok || !json.ok || !json.src) {
        setMessage(json.error || "업로드에 실패했습니다.");
        return;
      }
      const next = [...items, { id: crypto.randomUUID(), title: title.trim(), text: text.trim(), image: json.src }];
      onItemsChange(next);
      const saved = await onPersist(next);
      if (!saved) {
        setMessage("사진은 올렸지만 저장에 실패했습니다. 아래 ‘저장’을 다시 눌러 주세요.");
        return;
      }
      setTitle("");
      setText("");
      setFile(null);
      setMessage("올리고 저장했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveItem(item: CmsItem) {
    setBusy(true);
    const next = items.map((row) => (row.id === item.id ? item : row));
    onItemsChange(next);
    const saved = await onPersist(next);
    setMessage(saved ? "항목을 저장했습니다." : "저장에 실패했습니다.");
    setBusy(false);
  }

  async function onDelete(id: string) {
    if (!confirm("이 항목을 지울까요?")) return;
    setBusy(true);
    const next = items.filter((row) => row.id !== id);
    onItemsChange(next);
    await onPersist(next);
    setMessage("삭제했습니다.");
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onUpload} className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-medium">사진 올리기</h2>
        <p className="text-sm text-muted-foreground">갤러리와 같이 파일을 선택합니다. 가로 1600px 전후 JPG를 권장합니다.</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <input className={field} placeholder="제목 (카드 제목)" value={title} onChange={(e) => setTitle(e.target.value)} />
        {showText ? (
          <textarea className={area} placeholder={textLabel} value={text} onChange={(e) => setText(e.target.value)} />
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? "처리 중…" : "올리기"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="space-y-2 rounded-xl border bg-card p-3">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(item.image)} alt={item.title} className="aspect-[4/3] w-full rounded-md object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                사진 없음
              </div>
            )}
            <input
              className={field}
              placeholder="제목"
              value={item.title}
              onChange={(e) => onItemsChange(items.map((row) => (row.id === item.id ? { ...row, title: e.target.value } : row)))}
            />
            {showText ? (
              <textarea
                className={area}
                placeholder={textLabel}
                value={item.text ?? ""}
                onChange={(e) => onItemsChange(items.map((row) => (row.id === item.id ? { ...row, text: e.target.value } : row)))}
              />
            ) : null}
            {item.image?.startsWith("/uploads/") ? (
              <p className="truncate text-xs text-muted-foreground">{item.image}</p>
            ) : item.image ? (
              <p className="truncate text-xs text-muted-foreground">{item.image}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" disabled={busy} onClick={() => onSaveItem(item)}>
                저장
              </Button>
              <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => onDelete(item.id)}>
                삭제
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">등록된 사진이 없습니다. 위에서 올려 주세요.</p> : null}
    </div>
  );
}
