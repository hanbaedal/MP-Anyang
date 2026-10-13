"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ManageGalleryLibrary } from "@/components/manage-gallery-library";
import type { CmsItem, CmsSlug } from "@/lib/cms-types";
import { mediaUrl, thumbUrl } from "@/lib/media";

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

export function CmsPhotoItems({ slug, items, onItemsChange, onPersist }: Props) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [pickedSrc, setPickedSrc] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  function clearFile() {
    setFile(null);
    setFilePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  const showText = slug === "remodeling" || slug === "burial";
  const textLabel = slug === "burial" ? "설명 (캡션)" : "설명";

  async function persistNew(image: string) {
    if (!title.trim()) {
      setMessage("제목을 입력해 주세요.");
      return false;
    }
    const next = [...items, { id: crypto.randomUUID(), title: title.trim(), text: text.trim(), image }];
    onItemsChange(next);
    const saved = await onPersist(next);
    if (!saved) {
      setMessage("사진은 연결했지만 저장에 실패했습니다. 아래 ‘저장’을 다시 눌러 주세요.");
      return false;
    }
    setTitle("");
    setText("");
    clearFile();
    setPickedSrc("");
    setMessage("올리고 저장했습니다.");
    return true;
  }

  async function onUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setMessage("제목을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      if (pickedSrc) {
        await persistNew(pickedSrc);
        return;
      }
      if (!file) {
        setMessage("사진 파일을 선택하거나 갤러리에서 골라 주세요.");
        return;
      }
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/manage/upload-image", { method: "POST", body: form });
      const json = (await res.json()) as { ok?: boolean; src?: string; error?: string };
      if (!res.ok || !json.ok || !json.src) {
        setMessage(json.error || "업로드에 실패했습니다.");
        return;
      }
      await persistNew(json.src);
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

  const preview = pickedSrc ? thumbUrl(pickedSrc) : filePreview || "";

  return (
    <div className="space-y-6">
      <form onSubmit={onUpload} className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-medium">사진 올리기</h2>
        <p className="text-sm text-muted-foreground">
          파일을 직접 올리거나, 갤러리에 「일반」으로 올린 사진을 고릅니다.
        </p>
        <div className="flex flex-wrap items-start gap-4">
          <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-md border bg-muted">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center px-2 text-center text-[11px] leading-tight text-muted-foreground">
                선택한 이미지
                <br />
                미리보기
              </span>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap gap-1.5">
              <Button type="button" variant="outline" size="sm" className="w-fit" asChild>
                <label className="cursor-pointer">
                  {file || pickedSrc ? "다른 파일" : "파일 선택"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const next = e.target.files?.[0] ?? null;
                      setPickedSrc("");
                      setFile(next);
                      setFilePreview((prev) => {
                        if (prev) URL.revokeObjectURL(prev);
                        return next ? URL.createObjectURL(next) : null;
                      });
                    }}
                  />
                </label>
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setLibraryOpen(true)}>
                갤러리에서 고르기
              </Button>
            </div>
            {file ? <p className="truncate text-xs text-muted-foreground">{file.name}</p> : null}
            {pickedSrc ? <p className="truncate text-xs text-muted-foreground">{pickedSrc}</p> : null}
          </div>
        </div>
        <input className={field} placeholder="제목 (카드 제목)" value={title} onChange={(e) => setTitle(e.target.value)} />
        {showText ? (
          <textarea className={area} placeholder={textLabel} value={text} onChange={(e) => setText(e.target.value)} />
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? "처리 중…" : "올리기"}
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </form>

      <ManageGalleryLibrary
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        onPick={(photo) => {
          setPickedSrc(photo.src);
          clearFile();
          if (!title.trim()) setTitle(photo.alt);
          setMessage("갤러리 사진을 골랐습니다. 제목을 확인한 뒤 「올리기」를 누르세요.");
        }}
      />

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
            {item.image ? <p className="truncate text-xs text-muted-foreground">{item.image}</p> : null}
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
