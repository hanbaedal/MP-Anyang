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

export function isAnnouncementActive(item: SiteAnnouncement, at = new Date()) {
  if (!item.enabled) return false;
  if (item.startsAt) {
    const start = new Date(item.startsAt);
    if (!Number.isNaN(start.getTime()) && at < start) return false;
  }
  if (item.endsAt) {
    const end = new Date(item.endsAt);
    if (!Number.isNaN(end.getTime()) && at > end) return false;
  }
  return true;
}
