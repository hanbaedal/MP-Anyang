/** 방문자가 「오늘 하루 안 보기」 등으로 닫을 때 저장 범위 */
export type AnnouncementDismissScope = "session" | "day" | "until_end";

export type SiteAnnouncement = {
  id: string;
  title: string;
  body: string;
  /** 포스터·배너 이미지 (선택) */
  imageSrc: string;
  linkHref: string;
  linkLabel: string;
  /** false면 노출 안 함 (관리자 즉시 끄기) */
  enabled: boolean;
  /** ISO datetime — 비우면 즉시 시작 */
  startsAt: string;
  /** ISO datetime — 비우면 종료 없음 */
  endsAt: string;
  dismissScope: AnnouncementDismissScope;
  /** 작을수록 먼저 (동시에 여러 개면 하나씩) */
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

function parseScheduleInstant(iso: string) {
  const trimmed = iso.trim();
  if (!trimmed) return null;
  const ms = new Date(trimmed).getTime();
  return Number.isNaN(ms) ? null : ms;
}

/** 노출 시작 ≤ now ≤ 종료 (종료 시각까지 포함) */
export function isAnnouncementActive(item: SiteAnnouncement, at = new Date()) {
  if (!item.enabled) return false;
  const now = at.getTime();
  const startMs = parseScheduleInstant(item.startsAt);
  if (startMs !== null && now < startMs) return false;
  const endMs = parseScheduleInstant(item.endsAt);
  if (endMs !== null && now > endMs) return false;
  return true;
}

export type AnnouncementScheduleStatus = "disabled" | "scheduled" | "active" | "ended";

export function announcementScheduleStatus(item: SiteAnnouncement, at = new Date()): AnnouncementScheduleStatus {
  if (!item.enabled) return "disabled";
  const now = at.getTime();
  const startMs = parseScheduleInstant(item.startsAt);
  if (startMs !== null && now < startMs) return "scheduled";
  const endMs = parseScheduleInstant(item.endsAt);
  if (endMs !== null && now > endMs) return "ended";
  return "active";
}

export const ANNOUNCEMENT_SCHEDULE_LABELS: Record<AnnouncementScheduleStatus, string> = {
  disabled: "사용 안 함",
  scheduled: "예약 (시작 전)",
  active: "노출 중",
  ended: "종료됨",
};
