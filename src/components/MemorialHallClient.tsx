"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { eventKindLabel } from "../lib/memorial-events";
import { ImageLightbox, type GallerySlide, type LightboxItem } from "./ImageLightbox";

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

export type MemorialJobView = {
  _id: string;
  status: string;
  note: string;
  staffNote?: string;
  createdAt: string;
};

type Tab = "timeline" | "intro" | "memories" | "edited";

type Props = {
  hallCode: string;
  deceasedName: string;
  plotNo: string;
  deathDate?: string;
  canEdit: boolean;
  recallPhotos: string[];
  entries: MemorialEntryView[];
  jobs: MemorialJobView[];
};

const JOB_LABEL: Record<string, string> = {
  requested: "접수",
  in_progress: "편집 중",
  completed: "완료",
  rejected: "반려",
};

function entryBadge(type: string, eventKind?: string) {
  if (type === "edited_video") return "편집 영상";
  if (type === "grave_snapshot") return "추억 회상";
  if (type === "event") return eventKindLabel(eventKind || "custom");
  if (type === "video") return "동영상";
  if (type === "photo") return "사진";
  return "추억";
}

function displayBody(body?: string) {
  if (!body) return "";
  return body.replace(/^demo:[^\n]*\n?/, "").replace(/^grave:[^\n]*\n?/, "");
}

export function MemorialHallClient({
  hallCode,
  deceasedName,
  plotNo,
  deathDate,
  canEdit,
  recallPhotos,
  entries,
  jobs,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("timeline");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editNote, setEditNote] = useState("생전·가족 사진과 영상으로 추모 영상 편집을 요청합니다.");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);

  const timelineEntries = entries.filter((e) => e.type !== "edited_video");
  const editedEntries = entries.filter((e) => e.type === "edited_video");

  const recallSlides = useMemo<GallerySlide[]>(
    () =>
      recallPhotos.map((src, i) => ({
        src,
        alt: `${deceasedName} 추억 ${i + 1}`,
        caption: `${deceasedName}님 — 추억 회상 ${i + 1}`,
      })),
    [recallPhotos, deceasedName],
  );

  const editedSlides = useMemo<GallerySlide[]>(
    () =>
      editedEntries
        .filter((e) => e.mediaUrl)
        .map((e) => ({
          src: e.mediaUrl!,
          alt: e.title,
          caption: e.title,
        })),
    [editedEntries],
  );

  const openRecallGallery = (index: number) => {
    if (!recallSlides.length) return;
    setLightbox({ kind: "gallery", items: recallSlides, index });
  };

  const openEditedGallery = (index: number) => {
    if (!editedSlides.length) return;
    setLightbox({ kind: "gallery", items: editedSlides, index });
  };

  const onUploadRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setMsg("사진 또는 동영상을 선택해 주세요.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.set("hallCode", hallCode);
      fd.set("file", uploadFile);
      const res = await fetch("/api/memorial/grave-photos", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "업로드 실패");
      setUploadFile(null);
      setUploadOpen(false);
      setMsg("추억이 등록되었습니다.");
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
      setMsg("편집 추모영상 요청이 접수되었습니다.");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "요청 실패");
    } finally {
      setBusy(false);
    }
  };

  const tabs: { id: Tab; label: string; sub: string }[] = [
    { id: "timeline", label: "내 추모관", sub: "추모 타임라인" },
    { id: "intro", label: "소개", sub: "설명" },
    { id: "memories", label: "추억 올리기", sub: "추억 회상하기" },
    { id: "edited", label: "편집 추모영상", sub: "요청·영상" },
  ];

  return (
    <>
      <div className="memorial-hall memorial-hall-v2">
        <header className="memorial-hall-head panel">
          <p className="kicker">사이버 추모관</p>
          <h1>{deceasedName}님 추모관</h1>
          <p className="lead memorial-hall-lead">
            묘역 <strong>{plotNo || "—"}</strong> · 추억과 그리움이 시간순으로 쌓입니다.
          </p>

          <nav className="memorial-tab-nav" aria-label="추모관 메뉴">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`memorial-tab-btn ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                <span className="memorial-tab-label">{t.label}</span>
                <span className="memorial-tab-sub">{t.sub}</span>
              </button>
            ))}
          </nav>
        </header>

        {msg && <p className={msg.includes("접수") || msg.includes("등록") ? "ok memorial-msg" : "alert memorial-msg"}>{msg}</p>}

        {tab === "timeline" && (
          <section className="memorial-tab-panel">
            <div className="memorial-tab-panel-head">
              <h2>추모 타임라인</h2>
            </div>
            {!timelineEntries.length ? (
              <p className="meta panel">아직 등록된 추억이 없습니다.</p>
            ) : (
              <ol className="memorial-timeline-list">
                {timelineEntries.map((entry) => {
                  const hasMedia = Boolean(entry.mediaUrl);
                  return (
                  <li
                    key={entry._id}
                    className={`panel memorial-timeline-item${hasMedia ? " memorial-timeline-card" : ""}`}
                  >
                    <div className="memorial-timeline-meta">
                      <span className="memorial-badge">{entryBadge(entry.type, entry.eventKind)}</span>
                      <time>{new Date(entry.createdAt).toLocaleDateString("ko-KR")}</time>
                    </div>
                    <h3>{entry.title}</h3>
                    {!hasMedia && displayBody(entry.body) ? <p>{displayBody(entry.body)}</p> : null}
                    {entry.mediaUrl ? (
                      entry.mediaType === "video" || entry.type === "video" ? (
                        <video src={entry.mediaUrl} controls className="memorial-media" preload="metadata" />
                      ) : (
                        <button
                          type="button"
                          className="memorial-media-btn"
                          onClick={() => setLightbox({ kind: "image", src: entry.mediaUrl!, alt: entry.title, caption: entry.title })}
                        >
                          <Image src={entry.mediaUrl} alt={entry.title} width={320} height={240} className="memorial-media" unoptimized />
                        </button>
                      )
                    ) : null}
                    <p className="meta memorial-author">{entry.authorName}</p>
                  </li>
                  );
                })}
              </ol>
            )}
          </section>
        )}

        {tab === "intro" && (
          <section className="panel memorial-tab-panel memorial-intro-tab">
            <h2>{deceasedName}님 추모관 안내</h2>
            <p>
              이 공간은 <strong>{deceasedName}</strong>님을 기억하기 위한 디지털 추모관입니다.
              {deathDate ? ` 기일은 ${deathDate}입니다.` : ""}
            </p>
            <ul className="memorial-intro-list">
              <li>
                <strong>내 추모관</strong> — 기일·명절·가족 추억이 시간순으로 쌓입니다.
              </li>
              <li>
                <strong>추억 회상하기</strong> — 묘역찾기와 같은 앨범에 생전·가족 사진을 올립니다.
              </li>
              <li>
                <strong>편집 추모영상</strong> — 운영팀이 자료를 모아 기념 영상을 제작합니다.
              </li>
            </ul>
            <Link href="/memorial" className="btn btn-sm">
              사이버 추모관 소개
            </Link>
          </section>
        )}

        {tab === "memories" && (
          <section className="memorial-tab-panel">
            <div className="memorial-tab-panel-head">
              <div>
                <h2>추억 회상하기</h2>
                <p className="meta">묘역찾기와 동일한 앨범 · 최대 10장</p>
              </div>
              {canEdit && (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setUploadOpen(true)}>
                  추억 올리기
                </button>
              )}
            </div>
            {recallPhotos.length ? (
              <div className="gallery-grid memorial-recall-grid">
                {recallPhotos.map((src, i) => (
                  <figure key={src + i} className="gallery-thumb">
                    <button
                      type="button"
                      className="gallery-thumb-btn"
                      onClick={() => openRecallGallery(i)}
                      aria-label={`추억 ${i + 1} 크게 보기`}
                    >
                      <Image src={src} alt={`${deceasedName} 추억 ${i + 1}`} width={400} height={260} unoptimized />
                    </button>
                    <figcaption>추억 {i + 1}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="meta panel">등록된 추억 사진이 없습니다.{canEdit ? " 「추억 올리기」로 추가해 주세요." : ""}</p>
            )}
          </section>
        )}

        {tab === "edited" && (
          <section className="memorial-tab-panel">
            <div className="memorial-tab-panel-head">
              <h2>편집 추모영상</h2>
              {canEdit && (
                <button type="button" className="btn btn-sm" onClick={onRequestEdit} disabled={busy}>
                  편집 영상 요청
                </button>
              )}
            </div>

            {canEdit && (
              <div className="panel memorial-edit-note-box">
                <label>
                  요청 메모
                  <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} rows={2} />
                </label>
              </div>
            )}

            {jobs.length > 0 && (
              <div className="memorial-job-cards">
                <h3 className="memorial-subtitle">요청 현황</h3>
                {jobs.map((job) => (
                  <article key={job._id} className="panel memorial-job-card">
                    <span className="memorial-badge">{JOB_LABEL[job.status] || job.status}</span>
                    <p>{job.note}</p>
                    {job.staffNote ? <p className="meta">{job.staffNote}</p> : null}
                    <time className="meta">{new Date(job.createdAt).toLocaleDateString("ko-KR")}</time>
                  </article>
                ))}
              </div>
            )}

            {editedEntries.length ? (
              <div className="memorial-edited-grid">
                <h3 className="memorial-subtitle">게시된 영상</h3>
                <div className="memorial-edited-cards">
                  {editedEntries.map((entry, i) => (
                    <button
                      key={entry._id}
                      type="button"
                      className="memorial-edited-card panel"
                      onClick={() => openEditedGallery(i)}
                    >
                      {entry.mediaUrl ? (
                        entry.mediaType === "video" ? (
                          <video src={entry.mediaUrl} className="memorial-edited-thumb" muted preload="metadata" />
                        ) : (
                          <Image
                            src={entry.mediaUrl}
                            alt={entry.title}
                            width={320}
                            height={200}
                            className="memorial-edited-thumb"
                            unoptimized
                          />
                        )
                      ) : (
                        <div className="memorial-edited-placeholder">영상</div>
                      )}
                      <span className="memorial-edited-title">{entry.title}</span>
                      <time className="meta">{new Date(entry.createdAt).toLocaleDateString("ko-KR")}</time>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              !jobs.length && <p className="meta panel">아직 편집 추모영상이 없습니다.</p>
            )}
          </section>
        )}
      </div>

      {uploadOpen && (
        <div className="modal-backdrop" onClick={() => !busy && setUploadOpen(false)}>
          <div className="modal memorial-upload-modal" onClick={(e) => e.stopPropagation()}>
            <h2>추억 올리기</h2>
            <p className="meta">묘역찾기 「추억 회상하기」와 같은 앨범에 저장됩니다.</p>
            <form onSubmit={onUploadRecall} className="form-grid">
              <label>
                사진 / 동영상
                <input type="file" accept="image/*,video/*" required onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
              </label>
              <div className="memorial-modal-actions">
                <button type="button" className="btn" onClick={() => setUploadOpen(false)} disabled={busy}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? "올리는 중…" : "등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lightbox && <ImageLightbox item={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}
