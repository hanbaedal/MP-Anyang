"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FUNERAL_BURIAL_ROWS,
  FUNERAL_CREMATION_ROWS,
  FUNERAL_DOC_META,
  type FuneralDocFile,
  type FuneralDocId,
  type FuneralDocRow,
} from "@/lib/funeral-docs-types";

function DocUploadRow({
  docId,
  current,
  file,
  onFile,
  onUpload,
  onDelete,
}: {
  docId: FuneralDocId;
  current?: FuneralDocFile;
  file: File | null | undefined;
  onFile: (file: File | null) => void;
  onUpload: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="space-y-3 rounded-xl border bg-card p-4">
      <h3 className="font-medium">{FUNERAL_DOC_META[docId].manageLabel}</h3>
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
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      {file ? <p className="truncate text-xs text-muted-foreground">선택: {file.name}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={onUpload}>
          {current ? "PDF 교체" : "PDF 올리기"}
        </Button>
        {current ? (
          <Button type="button" size="sm" variant="outline" onClick={onDelete}>
            삭제
          </Button>
        ) : null}
      </div>
    </li>
  );
}

function Section({
  title,
  hint,
  rows,
  byId,
  files,
  setFile,
  onUpload,
  onDelete,
}: {
  title: string;
  hint: string;
  rows: FuneralDocRow[];
  byId: Partial<Record<FuneralDocId, FuneralDocFile>>;
  files: Partial<Record<FuneralDocId, File | null>>;
  setFile: (docId: FuneralDocId, file: File | null) => void;
  onUpload: (docId: FuneralDocId) => void;
  onDelete: (docId: FuneralDocId) => void;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </div>
      <ul className="space-y-3">
        {rows.map((row) => {
          if (row.type === "text") {
            return (
              <li key={row.i18n} className="rounded-xl border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">연고자 신분증</p>
                <p className="mt-1">지참 안내만 공개 페이지에 표시합니다. 여기서 PDF를 올리지 않습니다.</p>
              </li>
            );
          }
          return (
            <DocUploadRow
              key={`${title}-${row.docId}`}
              docId={row.docId}
              current={byId[row.docId]}
              file={files[row.docId]}
              onFile={(file) => setFile(row.docId, file)}
              onUpload={() => onUpload(row.docId)}
              onDelete={() => onDelete(row.docId)}
            />
          );
        })}
      </ul>
    </section>
  );
}

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
    setMessage("저장했습니다. 공개 장례·안치의 매장·화장 서류 목록에 바로 반영됩니다.");
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

  function setFile(docId: FuneralDocId, file: File | null) {
    setFiles((prev) => ({ ...prev, [docId]: file }));
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        공개 페이지와 같이 「매장 시 서류」「화장 시 서류」로 나눕니다. 양쪽에 같은 서류(사망진단서 등)가 있으면 한 번만
        올리면 두 목록에 함께 쓰입니다.
      </p>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <div className="grid gap-10 md:grid-cols-2">
        <Section
          title="매장 시 서류"
          hint="공개 페이지 왼쪽 열과 같은 순서입니다."
          rows={FUNERAL_BURIAL_ROWS}
          byId={byId}
          files={files}
          setFile={setFile}
          onUpload={onUpload}
          onDelete={onDelete}
        />
        <Section
          title="화장 시 서류"
          hint="공개 페이지 오른쪽 열과 같은 순서입니다."
          rows={FUNERAL_CREMATION_ROWS}
          byId={byId}
          files={files}
          setFile={setFile}
          onUpload={onUpload}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
