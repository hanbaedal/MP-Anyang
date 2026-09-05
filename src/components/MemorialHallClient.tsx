"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { eventKindLabel } from "../lib/memorial-events";

export type MemorialEntryView = {
  _id: string;
  type: string;
  title: string;
  body?: string;
  mediaUrl?: string;
  mediaType?: string;
  eventKind?: string;
  eventDate?: string;
  authorName: string;
  createdAt: string;
};

type Props = {
  hallCode: string;
  deceasedName: string;
  plotNo: string;
  canEdit: boolean;
  entries: MemorialEntryView[];
};

function entryBadge(type: string, eventKind?: string) {
  if (type === "edited_video") return "편집 영상";
  if (type === "grave_snapshot") return "묘역";
  if (type === "event") return eventKindLabel(eventKind || "custom");
  if (type === "video") return "동영상";
  if (type === "photo") return "사진";
  return "추억";
}

export function MemorialHallClient({ hallCode, deceasedName, plotNo, canEdit, entries }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [editNote, setEditNote] = useState("생전·가족 사진과 영상으로 추모 영상 편집을 요청합니다.");

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMsg("제목을 입력해 주세요.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.set("hallCode", hallCode);
      fd.set("title", title.trim());
      fd.set("body", body.trim());
      if (file) fd.set("file", file);
      const res = await fetch("/api/memorial/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "업로드 실패");
      setTitle("");
      setBody("");
      setFile(null);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setBusy(false);
    }
  };

  const onRequestEdit = async () => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/memorial/request-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hallCode, note: editNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "요청 실패");
      setMsg("편집 영상 요청이 접수되었습니다. 담당자가 연락드립니다.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "요청 실패");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="memorial-hall">
      <header className="memorial-hall-head panel">
        <p className="kicker">사이버 추모관</p>
        <h1>{deceasedName}님 추모관</h1>
        <p className="lead">
          묘역 <strong>{plotNo || "—"}</strong> · 추억과 그리움이 시간순으로 쌓입니다.
        </p>
        <div className="memorial-hall-actions">
          <Link href="/memorial/my" className="btn btn-sm">
            내 추모관
          </Link>
          <Link href="/memorial" className="btn btn-sm">
            소개
          </Link>
        </div>
      </header>

      {canEdit && (
        <section className="panel memorial-upload">
          <h2>추억 올리기</h2>
          <p className="meta">생전 모습, 가족 사진·동영상, 추모 글을 남겨 주세요.</p>
          <form onSubmit={onUpload} className="form-grid memorial-upload-form">
            <label>
              제목
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 1980년 가족 여행" required />
            </label>
            <label>
              추억 이야기
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="함께했던 이야기를 적어 주세요." />
            </label>
            <label>
              사진 / 동영상
              <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? "올리는 중…" : "추억 등록"}
            </button>
          </form>

          <div className="memorial-edit-request">
            <h3>편집 추모영상 요청</h3>
            <p className="meta">운영팀이 올려 주신 자료로 생전·가족 추억 영상을 편집해 드립니다.</p>
            <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} rows={2} />
            <button type="button" className="btn" onClick={onRequestEdit} disabled={busy}>
              편집 영상 요청
            </button>
          </div>
        </section>
      )}

      {msg && <p className={msg.includes("접수") ? "ok" : "alert"}>{msg}</p>}

      <section className="memorial-timeline">
        <h2>추모 타임라인</h2>
        {!entries.length ? (
          <p className="meta panel">아직 등록된 추억이 없습니다. 사진·동영상을 올려 보세요.</p>
        ) : (
          <ol className="memorial-timeline-list">
            {entries.map((entry) => (
              <li key={entry._id} className="panel memorial-timeline-item">
                <div className="memorial-timeline-meta">
                  <span className="memorial-badge">{entryBadge(entry.type, entry.eventKind)}</span>
                  <time>{new Date(entry.createdAt).toLocaleDateString("ko-KR")}</time>
                  {entry.eventDate && entry.type === "event" ? (
                    <span className="meta"> · {entry.eventDate}</span>
                  ) : null}
                </div>
                <h3>{entry.title}</h3>
                {entry.body && !entry.body.startsWith("grave:") ? <p>{entry.body}</p> : null}
                {entry.mediaUrl ? (
                  entry.mediaType === "video" || entry.type === "edited_video" || entry.type === "video" ? (
                    <video src={entry.mediaUrl} controls className="memorial-media" preload="metadata" />
                  ) : (
                    <div className="memorial-media-wrap">
                      <Image
                        src={entry.mediaUrl}
                        alt={entry.title}
                        width={800}
                        height={600}
                        className="memorial-media"
                        unoptimized
                      />
                    </div>
                  )
                ) : null}
                <p className="meta memorial-author">{entry.authorName}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
