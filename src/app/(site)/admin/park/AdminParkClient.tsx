"use client";

import Image from "next/image";
import { useState } from "react";

export type AdminParkPhotoRow = {
  id: string;
  title: string;
  imageUrl: string;
  season: string;
};

type Props = {
  photos: AdminParkPhotoRow[];
  addParkPhotoAction: (formData: FormData) => Promise<void>;
  removeParkPhotoAction: (formData: FormData) => Promise<void>;
};

export function AdminParkClient({ photos, addParkPhotoAction, removeParkPhotoAction }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminParkPhotoRow | null>(null);

  return (
    <article className="article admin-members-page admin-park-page">
      <header className="admin-page-head">
        <div className="admin-page-head-text">
          <p className="kicker">관리자</p>
          <h1>공원 정보</h1>
          <p className="lead">묘역찾기 모달에서 보여줄 공원 풍광 이미지입니다.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>
          등록
        </button>
      </header>

      <p className="meta admin-park-count">전체 {photos.length}건</p>

      {photos.length === 0 ? (
        <p className="alert admin-member-empty">등록된 공원 풍광이 없습니다. 등록 버튼으로 추가해 주세요.</p>
      ) : (
        <div className="admin-park-grid">
          {photos.map((photo) => (
            <article key={photo.id} className="card admin-park-card">
              <div className="admin-park-card-image">
                <Image src={photo.imageUrl} alt={photo.title} width={480} height={300} unoptimized />
              </div>
              <div className="admin-park-card-body">
                <h2>{photo.title}</h2>
                {photo.season ? <p className="meta">{photo.season}</p> : null}
                <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(photo)}>
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {createOpen && (
        <div className="modal-backdrop" onClick={() => setCreateOpen(false)}>
          <div className="modal modal-admin-member" onClick={(e) => e.stopPropagation()}>
            <div className="modal-admin-head">
              <h2>공원 풍광 등록</h2>
              <button type="button" className="btn btn-sm btn-ghost modal-close" onClick={() => setCreateOpen(false)}>
                닫기
              </button>
            </div>
            <form action={addParkPhotoAction} className="modal-member-form" encType="multipart/form-data">
              <div className="form-grid modal-form-compact modal-form-single">
                <label className="modal-field-full">
                  제목
                  <input name="title" required placeholder="예: 봄 정원" />
                </label>
                <label className="modal-field-full">
                  계절
                  <input name="season" placeholder="봄/여름/가을/겨울/사계절" />
                </label>
                <label className="modal-field-full">
                  이미지 파일
                  <input name="image" type="file" accept="image/*" />
                </label>
                <label className="modal-field-full">
                  또는 이미지 URL
                  <input name="imageUrl" placeholder="https://..." />
                </label>
              </div>
              <p className="meta modal-sub">파일 또는 URL 중 하나는 반드시 입력해 주세요.</p>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setCreateOpen(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal modal-admin-member modal-admin-member-sm" onClick={(e) => e.stopPropagation()}>
            <h2>공원 풍광 삭제</h2>
            <p>
              <strong>{deleteTarget.title}</strong> 항목을 삭제할까요?
            </p>
            <p className="meta">삭제 후 복구할 수 없습니다.</p>
            <form action={removeParkPhotoAction} className="modal-actions">
              <input type="hidden" name="id" value={deleteTarget.id} />
              <button type="button" className="btn" onClick={() => setDeleteTarget(null)}>
                취소
              </button>
              <button type="submit" className="btn btn-danger">
                삭제
              </button>
            </form>
          </div>
        </div>
      )}
    </article>
  );
}
