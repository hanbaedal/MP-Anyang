/** 출근 9:00 이상, 퇴근 18:00 미만(한국시간). */
export function isStaffWorkHour(d = new Date()) {
  const clock = kstClock(d);
  const mins = clock.hour * 60 + clock.minute;
  return mins >= 9 * 60 && mins < 18 * 60;
}

/** 지금이 근무 중이면 퇴근(18:00)까지 남은 밀리초. 근무 중이 아니면 0. */
export function msUntilStaffWorkEnd(d = new Date()) {
  if (!isStaffWorkHour(d)) return 0;
  const clock = kstClock(d);
  const nowSec = clock.hour * 3600 + clock.minute * 60 + clock.second;
  return (18 * 3600 - nowSec) * 1000;
}

/** 일과 시간 제한은 관리자만 받는다. 감독과 CEO는 24시간 쓴다. */
export function isWorkHourLimitedRole(role: string | null | undefined) {
  return role === "admin";
}

export function roleFromSessionToken(token: string | undefined | null) {
  const payload = token?.split(".")[0];
  if (!payload) return "";
  try {
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const json = JSON.parse(atob(b64 + pad)) as { role?: string };
    return json.role ?? "";
  } catch {
    return "";
  }
}

function kstClock(d: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const num = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0");
  return { hour: num("hour"), minute: num("minute"), second: num("second") };
}
