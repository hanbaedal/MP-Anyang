/** 추모 이벤트 판단 (기일·명절·생일 등) */

export type MemorialEventKind =
  | "memorial_day"
  | "seollal"
  | "chuseok"
  | "birthday"
  | "grave_inspection"
  | "custom";

export type MemorialEventHit = {
  kind: MemorialEventKind;
  label: string;
  eventDate: string;
  daysUntil: number;
};

/** 음력 명절 — 연도별 양력 근사치 (2024~2028) */
const LUNAR_HOLIDAYS: Record<number, { seollal: string; chuseok: string }> = {
  2024: { seollal: "2024-02-10", chuseok: "2024-09-17" },
  2025: { seollal: "2025-01-29", chuseok: "2025-10-06" },
  2026: { seollal: "2026-02-17", chuseok: "2026-09-25" },
  2027: { seollal: "2027-02-06", chuseok: "2027-09-15" },
  2028: { seollal: "2028-01-26", chuseok: "2028-10-03" },
};

function parseDate(value?: string) {
  if (!value?.trim()) return null;
  const d = new Date(`${value.trim()}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function daysBetween(from: Date, to: Date) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function annualHit(base: Date, today: Date, kind: MemorialEventKind, label: string, windowDays = 14): MemorialEventHit | null {
  const candidate = new Date(today.getFullYear(), base.getMonth(), base.getDate());
  let diff = daysBetween(today, candidate);
  if (diff < -windowDays) {
    candidate.setFullYear(candidate.getFullYear() + 1);
    diff = daysBetween(today, candidate);
  }
  if (diff >= -windowDays && diff <= windowDays) {
    return { kind, label, eventDate: isoDate(candidate), daysUntil: diff };
  }
  return null;
}

export function detectMemorialEvents(input: {
  deathDate?: string;
  birthDate?: string;
  now?: Date;
}): MemorialEventHit[] {
  const today = input.now ?? new Date();
  const hits: MemorialEventHit[] = [];
  const year = today.getFullYear();

  const death = parseDate(input.deathDate);
  if (death) {
    const memorial = annualHit(death, today, "memorial_day", "기일");
    if (memorial) hits.push(memorial);
  }

  const birth = parseDate(input.birthDate);
  if (birth) {
    const birthday = annualHit(birth, today, "birthday", "생일");
    if (birthday) hits.push(birthday);
  }

  const holidays = LUNAR_HOLIDAYS[year] || LUNAR_HOLIDAYS[2026];
  for (const [kind, label] of [
    ["seollal", "설날"],
    ["chuseok", "추석"],
  ] as const) {
    const d = parseDate(holidays[kind]);
    if (!d) continue;
    const diff = daysBetween(today, d);
    if (diff >= -7 && diff <= 7) {
      hits.push({ kind, label, eventDate: isoDate(d), daysUntil: diff });
    }
  }

  return hits.sort((a, b) => a.daysUntil - b.daysUntil);
}

export function eventKindLabel(kind: string) {
  const map: Record<string, string> = {
    memorial_day: "기일",
    seollal: "설날",
    chuseok: "추석",
    birthday: "생일",
    grave_inspection: "묘역 점검",
    staff_edit: "편집 추모영상",
    custom: "추모",
    family: "가족 추억",
  };
  return map[kind] || kind;
}
