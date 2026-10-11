"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FUNERAL_DOC_IDS,
  FUNERAL_DOC_META,
  type FuneralDocFile,
  type FuneralDocId,
} from "@/lib/funeral-docs-types";

export function ManageFuneralDocs({ initial }: { initial: FuneralDocFile[] }) {
  const [items, setItems] = useState(initial);
  const [files, setFiles] = useState<Partial<Record<FuneralDocId, File | null>>>({});
  const [message, setMessage] = useState("");

  const byId = Object.fromEntries(items.map((item) => [item.docId, item])) as Partial<
    Record<FuneralDocId, FuneralDocFile>
  >;

  async function refresh() {
    const res = await fetch("/api/manage/funeral-docs");
    const json = (await res.json()) as { items?: FuneralDocFile[] };
    if (json.items) setItems(json.items);
  }

  async function onUpload(docId: FuneralDocId) {
    const file = files[docId];
    if (!file) {
      setMessage("PDF 파일을 선택해 주세요.");
      return;
    }
    const form = new FormData();
    form.set("docId", docId);
    form.set("file", file);
    const res = await fetch("/api/manage/funeral-docs", { method: "POST", body: form });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      setMessage(json.error || "업로드에 실패했습니다.");
      return;
    }
    setFiles((prev) => ({ ...prev, [docId]: null }));
    setMessage("저장했습니다. 공개 장례·안치 페이지에서 바로 다운로드할 수 있습니다.");
    await refresh();
  }

  async function onDelete(docId: FuneralDocId) {
    if (!confirm("등록된 PDF를 지울까요? 공개 페이지에는 「준비 중」으로 보입니다.")) return;
    const res = await fetch(`/api/manage/funeral-docs?docId=${encodeURIComponent(docId)}`, { method: "DELETE" });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      setMessage(json.error || "삭제에 실패했습니다.");
      return;
    }
    setMessage("삭제했습니다.");
    await refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <p className="text-sm text-muted-foreground">
        매장·화장 안내에 쓰는 공공자료 PDF입니다. 연고자 신분증은 지참 안내만 있으며 여기서 올리지 않습니다.
      </p>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <ul className="space-y-4">
        {FUNERAL_DOC_IDS.map((docId) => {
          const current = byId[docId];
          return (
            <li key={docId} className="space-y-3 rounded-xl border bg-card p-5">
              <h2 className="font-medium">{FUNERAL_DOC_META[docId].manageLabel}</h2>
              {current ? (
                <p className="text-sm text-muted-foreground">
                  등록됨: {current.fileName}
                  <span className="ml-2 text-xs">({new Date(current.updatedAt).toLocaleString("ko-KR")})</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">등록된 PDF 없음 (공개 페이지: 준비 중)</p>
              )}
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setFiles((prev) => ({ ...prev, [docId]: e.target.files?.[0] ?? null }))}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => onUpload(docId)}>
                  {current ? "PDF 교체" : "PDF 올리기"}
                </Button>
                {current ? (
                  <Button type="button" variant="outline" onClick={() => onDelete(docId)}>
                    삭제
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
