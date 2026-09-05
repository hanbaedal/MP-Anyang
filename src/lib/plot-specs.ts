/** 분양 형태별 안치 규모 (회원가입·분양안내 공통) */

export type GraveTypeKey = "봉안묘" | "매장묘" | "평장묘" | "수목장" | "복합묘";

export const GRAVE_TYPE_SPECS: Record<
  GraveTypeKey,
  { variants: string[]; defaultSlots: number; hint: string }
> = {
  봉안묘: {
    variants: ["2기", "4기", "8기", "16기", "24기", "32기"],
    defaultSlots: 2,
    hint: "2기~32기형 — 기수만큼 망자 성함을 등록합니다.",
  },
  매장묘: {
    variants: ["단장형", "합장형", "쌍분형"],
    defaultSlots: 1,
    hint: "단장형 1기 · 합장·쌍분형 2기",
  },
  평장묘: {
    variants: ["4위", "6위", "8위", "16위"],
    defaultSlots: 4,
    hint: "4·6·8·16위 잔디 평장",
  },
  수목장: {
    variants: ["1기", "2기"],
    defaultSlots: 1,
    hint: "수목 1~2기",
  },
  복합묘: {
    variants: ["16기", "20기", "24기"],
    defaultSlots: 16,
    hint: "16기~24기형 복합 안치",
  },
};

function parseSlotsFromCapacity(type: string, capacity: string): number | null {
  const text = capacity.trim();
  if (!text) return null;

  const numMatch = text.match(/(\d+)/);
  const n = numMatch ? Number(numMatch[1]) : NaN;
  if (!Number.isFinite(n) || n < 1) return null;

  if (type === "매장묘") {
    if (text.includes("단장")) return 1;
    if (text.includes("합장") || text.includes("쌍분")) return 2;
    return n;
  }

  return n;
}

export function resolveRelationSlots(type: string, capacity?: string) {
  const spec = GRAVE_TYPE_SPECS[type as GraveTypeKey];
  if (!spec) {
    return { slots: 4, typeLabel: type || "미확인", variant: "", hint: "" };
  }

  const parsed = capacity ? parseSlotsFromCapacity(type, capacity) : null;
  const slots = Math.min(Math.max(parsed ?? spec.defaultSlots, 1), 32);

  return {
    slots,
    typeLabel: type,
    variant: capacity?.trim() || spec.variants[0] || "",
    hint: spec.hint,
    variants: spec.variants,
  };
}
