const SEOUL = "Asia/Seoul";

export function seoulParts(date: Date, timeZone = SEOUL) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  let hour = pick("hour");
  if (hour === 24) hour = 0;
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour,
    minute: pick("minute"),
    second: pick("second"),
  };
}

/** Civil wall time in `timeZone` → UTC epoch ms. Uses the zone offset, not a hardcoded UTC hour. */
export function zonedCivilToUtcMs(
  civil: { year: number; month: number; day: number; hour: number; minute?: number; second?: number },
  timeZone = SEOUL,
) {
  const minute = civil.minute ?? 0;
  const second = civil.second ?? 0;
  let utc = Date.UTC(civil.year, civil.month - 1, civil.day, civil.hour, minute, second);
  for (let i = 0; i < 4; i++) {
    const seen = seoulParts(new Date(utc), timeZone);
    const seenUtc = Date.UTC(seen.year, seen.month - 1, seen.day, seen.hour, seen.minute, seen.second);
    const wantUtc = Date.UTC(civil.year, civil.month - 1, civil.day, civil.hour, minute, second);
    utc += wantUtc - seenUtc;
  }
  return utc;
}

function addGregorianDays(year: number, month: number, day: number, days: number) {
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() };
}

/** Next 01:00 Asia/Seoul as UTC epoch ms. If now is already 01:00:00 or later that Seoul day, returns tomorrow. */
export function nextSeoulHourUtcMs(hour = 1, now = new Date(), timeZone = SEOUL) {
  const z = seoulParts(now, timeZone);
  const passed = z.hour >= hour;
  let year = z.year;
  let month = z.month;
  let day = z.day;
  if (passed) {
    const next = addGregorianDays(year, month, day, 1);
    year = next.year;
    month = next.month;
    day = next.day;
  }
  return zonedCivilToUtcMs({ year, month, day, hour, minute: 0, second: 0 }, timeZone);
}

export function msUntilNextSeoulHour(hour = 1, now = new Date(), timeZone = SEOUL) {
  return Math.max(250, nextSeoulHourUtcMs(hour, now, timeZone) - now.getTime());
}
