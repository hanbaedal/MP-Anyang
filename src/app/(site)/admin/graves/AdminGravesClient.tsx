"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export type AdminGraveRow = {
  id: string;
  plotNo: string;
  deceasedName: string;
  familyName: string;
  zone: string;
  type: string;
  capacity: string;
  annualFee: number;
  buriedAt: string;
  mapNote: string;
  mapImage: string;
  photos: string[];
  lastInspectedAt: string;
  inspectNote: string;
};

const GRAVE_TYPES = ["봉안묘", "수목장", "매장묘", "평장묘"] as const;
type Tab = "basic" | "map" | "media";

type Props = {
  graves: AdminGraveRow[];
  imageStorage: "cloudinary" | "base64";
  addGraveAction: (formData: FormData) => Promise<void>;
  editGraveAction: (formData: FormData) => Promise<void>;
  removeGraveAction: (formData: FormData) => Promise<void>;
};

function isStaleInspection(dateStr: string) {
  if (!dateStr) return true;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return true;
  const days = (Date.now() - date.getTime()) / 86_400_000;
  return days > 90;
}

function GraveFields({ tab, grave }: { tab: Tab; grave?: AdminGraveRow }) {
  if (tab === "basic") {
    return (
      <div className="form-grid modal-form-compact">
        <label>
          묘번
          <input name="plotNo" defaultValue={grave?.plotNo} required={!grave} />
        </label>
        <label>
          고인
          <input name="deceasedName" defaultValue={grave?.deceasedName} required={!grave} />
        </label>
        <label>
          성씨
          <input name="familyName" defaultValue={grave?.familyName} required={!grave} />
        </label>
        <label>
          구역
          <input name="zone" defaultValue={grave?.zone} required={!grave} />
        </label>
        <label>
          형태
          <select name="type" defaultValue={grave?.type || "봉안묘"}>
            {GRAVE_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          기수·규모
          <input name="capacity" defaultValue={grave?.capacity} placeholder="2기, 합장형, 4위…" />
        </label>
        <label>
          연간 관리비 (개별)
          <input
            name="annualFee"
            type="number"
            min="0"
            defaultValue={grave?.annualFee || ""}
            placeholder="비우면 요금표 적용"
          />
        </label>
        <label>
          안치일
          <input name="buriedAt" type="date" defaultValue={grave?.buriedAt} required={!grave} />
        </label>
      </div>
    );
  }

  if (tab === "map") {
    return (
      <div className="form-grid modal-form-compact modal-form-single">
        <label className="modal-field-full">
          약도 안내
          <textarea name="mapNote" defaultValue={grave?.mapNote} placeholder="정문 → A구역..." rows={4} />
        </label>
        <label className="modal-field-full">
          약도 이미지 {grave?.mapImage ? "교체" : "등록"}
          <input name="mapImage" type="file" accept="image/*" />
        </label>
        {grave?.mapImage ? (
          <div className="modal-field-full modal-preview">
            <Image src={grave.mapImage} alt="약도" width={640} height={360} className="modal-image" unoptimized />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="form-grid modal-form-compact modal-form-single">
      {grave && grave.photos.length > 0 ? (
        <div className="modal-field-full">
          <p className="meta">유지할 사진을 선택하세요.</p>
          <div className="grave-photo-picks">
            {grave.photos.map((src, i) => (
              <label key={src} className="grave-photo-pick">
                <input type="checkbox" name="keepPhoto" value={src} defaultChecked />
                <Image src={src} alt={`사진 ${i + 1}`} width={88} height={66} unoptimized />
                <span>{i + 1}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
      <label className="modal-field-full">
        묘역 사진 추가 (최대 10장)
        <input name="photos" type="file" accept="image/*" multiple />
      </label>
      <label>
        최근 점검일
        <input name="lastInspectedAt" type="date" defaultValue={grave?.lastInspectedAt} />
      </label>
      <label className="modal-field-full">
        점검 메모
        <textarea name="inspectNote" defaultValue={grave?.inspectNote} placeholder="설·추석 전 점검 내용" rows={3} />
      </label>
    </div>
  );
}

function GraveModal({
  title,
  sub,
  grave,
  action,
  onClose,
}: {
  title: string;
  sub?: string;
  grave?: AdminGraveRow;
  action: (formData: FormData) => Promise<void>;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("basic");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-admin-grave" onClick={(e) => e.stopPropagation()}>
        <div className="modal-admin-head">
          <h2>{title}</h2>
          <button type="button" className="btn btn-sm btn-ghost modal-close" onClick={onClose}>
            닫기
          </button>
        </div>
        {sub ? <p className="meta modal-sub">{sub}</p> : null}

        <div className="tab-row">
          <button type="button" className={`tab ${tab === "basic" ? "active" : ""}`} onClick={() => setTab("basic")}>
            기본
          </button>
          <button type="button" className={`tab ${tab === "map" ? "active" : ""}`} onClick={() => setTab("map")}>
            약도
          </button>
          <button type="button" className={`tab ${tab === "media" ? "active" : ""}`} onClick={() => setTab("media")}>
            사진·점검
          </button>
        </div>

        <form action={action} className="modal-member-form" encType="multipart/form-data">
          {grave ? <input type="hidden" name="id" value={grave.id} /> : null}
          <div className="modal-tab-body">
            <div className={`modal-tab-panel ${tab === "basic" ? "active" : ""}`}>
              <GraveFields tab="basic" grave={grave} />
            </div>
            <div className={`modal-tab-panel ${tab === "map" ? "active" : ""}`}>
              <GraveFields tab="map" grave={grave} />
            </div>
            <div className={`modal-tab-panel ${tab === "media" ? "active" : ""}`}>
              <GraveFields tab="media" grave={grave} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              {grave ? "저장" : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminGravesClient({
  graves,
  imageStorage,
  addGraveAction,
  editGraveAction,
  removeGraveAction,
}: Props) {
  const [query, setQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [inspectFilter, setInspectFilter] = useState<"all" | "unchecked" | "checked" | "stale">("all");
  const [editTarget, setEditTarget] = useState<AdminGraveRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminGraveRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const zones = useMemo(
    () => [...new Set(graves.map((g) => g.zone).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ko")),
    [graves],
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    return graves.filter((g) => {
      if (q && !g.plotNo.includes(q) && !g.deceasedName.includes(q) && !g.familyName.includes(q)) return false;
      if (zoneFilter && g.zone !== zoneFilter) return false;
      if (inspectFilter === "unchecked" && g.lastInspectedAt) return false;
      if (inspectFilter === "checked" && !g.lastInspectedAt) return false;
      if (inspectFilter === "stale" && !isStaleInspection(g.lastInspectedAt)) return false;
      return true;
    });
  }, [graves, query, zoneFilter, inspectFilter]);

  const filterActive = Boolean(query.trim() || zoneFilter || inspectFilter !== "all");

  return (
    <>
      <div className="admin-member-toolbar panel">
        <label className="admin-member-search">
          묘역 검색
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="묘번 · 고인 · 성씨"
          />
        </label>
        <div className="admin-grave-filters">
          <label>
            구역
            <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)}>
              <option value="">전체</option>
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </label>
          <label>
            점검
            <select
              value={inspectFilter}
              onChange={(e) => setInspectFilter(e.target.value as typeof inspectFilter)}
            >
              <option value="all">전체</option>
              <option value="unchecked">미점검</option>
              <option value="checked">점검완료</option>
              <option value="stale">90일+ 미점검</option>
            </select>
          </label>
        </div>
        <div className="admin-grave-toolbar-actions">
          <p className="meta admin-member-count">
            {filterActive ? `조회 ${filtered.length}건` : `전체 ${graves.length}건`} · 묘번순
            {imageStorage === "cloudinary" ? " · Cloudinary" : " · 로컬(base64)"}
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>
            + 새 묘역
          </button>
        </div>
      </div>

      <div className="table-wrap admin-member-table-wrap">
        <table className="data-table admin-member-table admin-grave-table">
          <thead>
            <tr>
              <th>묘번</th>
              <th>고인</th>
              <th>성씨</th>
              <th>구역</th>
              <th>형태</th>
              <th>점검일</th>
              <th aria-label="관리" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className={!g.lastInspectedAt ? "admin-grave-row-warn" : undefined}>
                <td className="admin-member-name">{g.plotNo}</td>
                <td>{g.deceasedName}</td>
                <td>{g.familyName}</td>
                <td>{g.zone}</td>
                <td>{g.type}</td>
                <td>{g.lastInspectedAt || "-"}</td>
                <td>
                  <div className="admin-member-row-actions">
                    <button type="button" className="btn btn-sm" onClick={() => setEditTarget(g)}>
                      수정
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(g)}>
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="alert admin-member-empty">
            {filterActive ? "조건에 맞는 묘역이 없습니다." : "등록된 묘역이 없습니다."}
          </p>
        )}
      </div>

      {createOpen && (
        <GraveModal title="새 묘역 등록" action={addGraveAction} onClose={() => setCreateOpen(false)} />
      )}

      {editTarget && (
        <GraveModal
          title="묘역 수정"
          sub={`${editTarget.plotNo} · ${editTarget.deceasedName}`}
          grave={editTarget}
          action={editGraveAction}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal modal-admin-member modal-admin-member-sm" onClick={(e) => e.stopPropagation()}>
            <h2>묘역 삭제</h2>
            <p>
              <strong>{deleteTarget.plotNo}</strong> · {deleteTarget.deceasedName} 묘역을 삭제할까요?
            </p>
            <p className="meta">삭제 후 복구할 수 없습니다.</p>
            <form action={removeGraveAction} className="modal-actions">
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
    </>
  );
}
