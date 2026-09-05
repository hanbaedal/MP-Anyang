"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export type AdminHallRow = {
  code: string;
  plotNo: string;
  deceasedName: string;
  visibility: string;
  updatedAt: string;
};

export type AdminJobRow = {
  _id: string;
  hallCode: string;
  deceasedName: string;
  plotNo: string;
  requesterName: string;
  status: string;
  note: string;
  staffNote?: string;
  createdAt: string;
};

export type PublishedVideoRow = {
  _id: string;
  hallCode: string;
  title: string;
  body?: string;
  mediaUrl?: string;
  mediaType?: string;
  authorName: string;
  createdAt: string;
};

type Tab = "halls" | "requests" | "publish";

const STATUS_LABEL: Record<string, string> = {
  requested: "접수",
  in_progress: "편집 중",
  completed: "완료",
  rejected: "반려",
};

const TABS: { id: Tab; label: string; sub: string }[] = [
  { id: "halls", label: "등록된 추모관", sub: "리스트" },
  { id: "requests", label: "편집 영상 요청", sub: "리스트" },
  { id: "publish", label: "편집 영상 게시", sub: "리스트" },
];

type Props = {
  halls: AdminHallRow[];
  jobs: AdminJobRow[];
  published: PublishedVideoRow[];
  updateJobAction: (formData: FormData) => Promise<void>;
  publishVideoAction: (formData: FormData) => Promise<void>;
};

export function AdminMemorialClient({ halls, jobs, published, updateJobAction, publishVideoAction }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: Tab = tabParam === "requests" || tabParam === "publish" ? tabParam : "halls";

  const [jobModal, setJobModal] = useState<AdminJobRow | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [preview, setPreview] = useState<PublishedVideoRow | null>(null);

  const setTab = (next: Tab) => {
    router.push(`/admin/memorial?tab=${next}`);
  };

  return (
    <>
      <nav className="admin-memorial-tabs" aria-label="사이버 추모관 관리">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-memorial-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.label}</span>
            <span className="admin-memorial-tab-sub">{t.sub}</span>
          </button>
        ))}
      </nav>

      {tab === "halls" && (
        <section className="panel admin-memorial-panel">
          <h2>등록된 추모관 ({halls.length})</h2>
          {!halls.length ? (
            <p className="meta">회원이 내 추모관에 접속하면 자동 생성됩니다.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table admin-member-table">
                <thead>
                  <tr>
                    <th>망자</th>
                    <th>묘역</th>
                    <th>코드</th>
                    <th>공개</th>
                    <th>갱신</th>
                    <th>보기</th>
                  </tr>
                </thead>
                <tbody>
                  {halls.map((hall) => (
                    <tr key={hall.code}>
                      <td>{hall.deceasedName}</td>
                      <td>{hall.plotNo}</td>
                      <td><code>{hall.code}</code></td>
                      <td>{hall.visibility === "public" ? "공개" : "가족"}</td>
                      <td>{hall.updatedAt ? new Date(hall.updatedAt).toLocaleDateString("ko-KR") : "—"}</td>
                      <td>
                        <Link href={`/memorial/${hall.code}`} className="btn btn-sm" target="_blank">
                          추모관
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "requests" && (
        <section className="panel admin-memorial-panel">
          <h2>편집 영상 요청 ({jobs.length})</h2>
          {!jobs.length ? (
            <p className="meta">접수된 편집 요청이 없습니다.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table admin-member-table">
                <thead>
                  <tr>
                    <th>망자</th>
                    <th>묘역</th>
                    <th>요청자</th>
                    <th>상태</th>
                    <th>요청일</th>
                    <th>처리</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td>{job.deceasedName}</td>
                      <td>{job.plotNo}</td>
                      <td>{job.requesterName}</td>
                      <td>{STATUS_LABEL[job.status] || job.status}</td>
                      <td>{new Date(job.createdAt).toLocaleDateString("ko-KR")}</td>
                      <td>
                        <button type="button" className="btn btn-sm" onClick={() => setJobModal(job)}>
                          상세·처리
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "publish" && (
        <section className="panel admin-memorial-panel">
          <div className="admin-memorial-panel-head">
            <h2>편집 영상 게시 ({published.length})</h2>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setPublishOpen(true)}>
              + 영상 게시
            </button>
          </div>
          {!published.length ? (
            <p className="meta">게시된 편집 영상이 없습니다.</p>
          ) : (
            <div className="admin-published-grid">
              {published.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  className="admin-published-card panel"
                  onClick={() => setPreview(item)}
                >
                  {item.mediaUrl ? (
                    item.mediaType === "video" ? (
                      <video src={item.mediaUrl} className="admin-published-thumb" muted preload="metadata" />
                    ) : (
                      <Image
                        src={item.mediaUrl}
                        alt={item.title}
                        width={320}
                        height={180}
                        className="admin-published-thumb"
                        unoptimized
                      />
                    )
                  ) : (
                    <div className="admin-published-thumb placeholder">미디어 없음</div>
                  )}
                  <strong>{item.title}</strong>
                  <span className="meta">{item.hallCode}</span>
                  <time className="meta">{new Date(item.createdAt).toLocaleDateString("ko-KR")}</time>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {jobModal && (
        <div className="modal-backdrop" onClick={() => setJobModal(null)}>
          <div className="modal admin-memorial-modal" onClick={(e) => e.stopPropagation()}>
            <h2>편집 영상 요청 처리</h2>
            <dl className="admin-job-detail">
              <dt>망자</dt>
              <dd>{jobModal.deceasedName}</dd>
              <dt>묘역</dt>
              <dd>{jobModal.plotNo}</dd>
              <dt>추모관</dt>
              <dd><code>{jobModal.hallCode}</code></dd>
              <dt>요청자</dt>
              <dd>{jobModal.requesterName}</dd>
              <dt>요청 내용</dt>
              <dd>{jobModal.note}</dd>
            </dl>
            <form action={updateJobAction} className="form-grid">
              <input type="hidden" name="id" value={jobModal._id} />
              <label>
                상태
                <select name="status" defaultValue={jobModal.status}>
                  <option value="requested">접수</option>
                  <option value="in_progress">편집 중</option>
                  <option value="completed">완료</option>
                  <option value="rejected">반려</option>
                </select>
              </label>
              <label>
                메모
                <textarea name="staffNote" rows={2} defaultValue={jobModal.staffNote || ""} />
              </label>
              <div className="memorial-modal-actions">
                <button type="button" className="btn" onClick={() => setJobModal(null)}>
                  닫기
                </button>
                <button type="submit" className="btn btn-primary">
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {publishOpen && (
        <div className="modal-backdrop" onClick={() => setPublishOpen(false)}>
          <div className="modal admin-memorial-modal" onClick={(e) => e.stopPropagation()}>
            <h2>편집 영상 게시</h2>
            <p className="meta">완성된 영상을 해당 추모관 타임라인에 등록합니다.</p>
            <form action={publishVideoAction} encType="multipart/form-data" className="form-grid">
              <label>
                추모관 코드
                <input name="hallCode" required placeholder="DEMO-A101" list="hall-codes" />
                <datalist id="hall-codes">
                  {halls.map((h) => (
                    <option key={h.code} value={h.code}>
                      {h.deceasedName}
                    </option>
                  ))}
                </datalist>
              </label>
              <label>
                제목
                <input name="title" required placeholder="2027년 기일 추모 영상" />
              </label>
              <label>
                설명
                <textarea name="body" rows={2} placeholder="편집 내용 요약" />
              </label>
              <label>
                동영상 파일
                <input name="file" type="file" accept="video/*,image/*" required />
              </label>
              <label>
                연결 요청 ID (선택)
                <input name="jobId" placeholder="완료 처리할 요청 ID" list="job-ids" />
                <datalist id="job-ids">
                  {jobs.filter((j) => j.status !== "completed").map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.deceasedName}
                    </option>
                  ))}
                </datalist>
              </label>
              <div className="memorial-modal-actions">
                <button type="button" className="btn" onClick={() => setPublishOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  게시
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {preview && (
        <div className="modal-backdrop" onClick={() => setPreview(null)}>
          <div className="modal admin-memorial-modal admin-preview-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{preview.title}</h2>
            <p className="meta">
              {preview.hallCode} · {preview.authorName} · {new Date(preview.createdAt).toLocaleDateString("ko-KR")}
            </p>
            {preview.mediaUrl ? (
              preview.mediaType === "video" ? (
                <video src={preview.mediaUrl} controls className="admin-preview-media" preload="metadata" />
              ) : (
                <Image
                  src={preview.mediaUrl}
                  alt={preview.title}
                  width={960}
                  height={540}
                  className="admin-preview-media"
                  unoptimized
                />
              )
            ) : null}
            {preview.body ? <p>{preview.body.replace(/^demo:[^\n]*\n?/, "")}</p> : null}
            <div className="memorial-modal-actions">
              <Link href={`/memorial/${preview.hallCode}`} className="btn btn-sm" target="_blank">
                추모관에서 보기
              </Link>
              <button type="button" className="btn" onClick={() => setPreview(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
