import { GRAVE_TYPE_SPECS, type GraveTypeKey } from "./plot-specs";

export type FeeRateRow = {
  type: string;
  capacity: string;
  annualFee: number;
};

/** 형태·기수별 기본 연간 관리비 (원) — DB 미설정 시 사용 */
export const DEFAULT_FEE_RATES: FeeRateRow[] = [
  { type: "봉안묘", capacity: "2기", annualFee: 120_000 },
  { type: "봉안묘", capacity: "4기", annualFee: 180_000 },
  { type: "봉안묘", capacity: "8기", annualFee: 280_000 },
  { type: "봉안묘", capacity: "16기", annualFee: 420_000 },
  { type: "봉안묘", capacity: "24기", annualFee: 560_000 },
  { type: "봉안묘", capacity: "32기", annualFee: 680_000 },
  { type: "매장묘", capacity: "단장형", annualFee: 150_000 },
  { type: "매장묘", capacity: "합장형", annualFee: 220_000 },
  { type: "매장묘", capacity: "쌍분형", annualFee: 240_000 },
  { type: "평장묘", capacity: "4위", annualFee: 200_000 },
  { type: "평장묘", capacity: "6위", annualFee: 260_000 },
  { type: "평장묘", capacity: "8위", annualFee: 320_000 },
  { type: "평장묘", capacity: "16위", annualFee: 480_000 },
  { type: "수목장", capacity: "1기", annualFee: 100_000 },
  { type: "수목장", capacity: "2기", annualFee: 160_000 },
  { type: "복합묘", capacity: "16기", annualFee: 500_000 },
  { type: "복합묘", capacity: "20기", annualFee: 580_000 },
  { type: "복합묘", capacity: "24기", annualFee: 650_000 },
];

export function allFeeRateSlots(): FeeRateRow[] {
  return Object.entries(GRAVE_TYPE_SPECS).flatMap(([type, spec]) =>
    spec.variants.map((capacity) => {
      const found = DEFAULT_FEE_RATES.find((r) => r.type === type && r.capacity === capacity);
      return { type, capacity, annualFee: found?.annualFee ?? 0 };
    }),
  );
}

export function defaultFeeFor(type: string, capacity: string) {
  const cap = capacity.trim();
  const row =
    DEFAULT_FEE_RATES.find((r) => r.type === type && r.capacity === cap) ||
    DEFAULT_FEE_RATES.find((r) => r.type === type);
  return row?.annualFee ?? 0;
}

export function mergeFeeRates(stored: FeeRateRow[]): FeeRateRow[] {
  const map = new Map(stored.map((r) => [`${r.type}|${r.capacity}`, r.annualFee]));
  return allFeeRateSlots().map((slot) => ({
    ...slot,
    annualFee: map.has(`${slot.type}|${slot.capacity}`) ? Number(map.get(`${slot.type}|${slot.capacity}`)) : slot.annualFee,
  }));
}

export function resolveAnnualFee(input: {
  type: string;
  capacity?: string;
  plotOverride?: number;
  rates: FeeRateRow[];
}) {
  if (input.plotOverride && input.plotOverride > 0) return input.plotOverride;
  const cap = (input.capacity || "").trim();
  const fromRates = input.rates.find((r) => r.type === input.type && r.capacity === cap);
  if (fromRates && fromRates.annualFee > 0) return fromRates.annualFee;
  return defaultFeeFor(input.type, cap);
}

export function graveTypeLabel(type: string) {
  return (GRAVE_TYPE_SPECS as Record<string, { hint: string }>)[type as GraveTypeKey]?.hint ? type : type || "미확인";
}
