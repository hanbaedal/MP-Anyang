import { GRAVE_TYPE_SPECS, type GraveTypeKey } from "./plot-specs";
import { SITE } from "./site";

export type FeeRateRow = {
  type: string;
  capacity: string;
  annualFee: number;
};

function unitRates(amount: number): FeeRateRow[] {
  return Object.entries(GRAVE_TYPE_SPECS).flatMap(([type, spec]) =>
    spec.variants.map((capacity) => ({ type, capacity, annualFee: amount })),
  );
}

/** 평당 연간 관리비 — 신고가. 형태별 총액은 상담으로 확정 */
export const DEFAULT_FEE_RATES: FeeRateRow[] = unitRates(SITE.prices.annualAmount);

/** 평당 사용료 — 신고가. 형태별 총액은 상담으로 확정 */
export const DEFAULT_SALE_RATES: FeeRateRow[] = unitRates(SITE.prices.saleAmount);

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

export function defaultSalePriceFor(type: string, capacity: string) {
  const cap = capacity.trim();
  const row =
    DEFAULT_SALE_RATES.find((r) => r.type === type && r.capacity === cap) ||
    DEFAULT_SALE_RATES.find((r) => r.type === type);
  return row?.annualFee ?? 0;
}

export function mergeSaleRates(stored: FeeRateRow[]): FeeRateRow[] {
  const map = new Map(stored.map((r) => [`${r.type}|${r.capacity}`, r.annualFee]));
  return allFeeRateSlots().map((slot) => {
    const fromDefault = DEFAULT_SALE_RATES.find((r) => r.type === slot.type && r.capacity === slot.capacity);
    return {
      type: slot.type,
      capacity: slot.capacity,
      annualFee: map.has(`${slot.type}|${slot.capacity}`)
        ? Number(map.get(`${slot.type}|${slot.capacity}`))
        : fromDefault?.annualFee ?? 0,
    };
  });
}

export function resolveSalePrice(input: {
  type: string;
  capacity?: string;
  rates: FeeRateRow[];
}) {
  const cap = (input.capacity || "").trim();
  const fromRates = input.rates.find((r) => r.type === input.type && r.capacity === cap);
  if (fromRates && fromRates.annualFee > 0) return fromRates.annualFee;
  return defaultSalePriceFor(input.type, cap);
}

export function resolvePlotPrices(input: {
  type: string;
  capacity?: string;
  plotOverride?: number;
  plotSaleOverride?: number;
  annualRates: FeeRateRow[];
  saleRates: FeeRateRow[];
}) {
  return {
    annualFee: resolveAnnualFee({
      type: input.type,
      capacity: input.capacity,
      plotOverride: input.plotOverride,
      rates: input.annualRates,
    }),
    salePrice: input.plotSaleOverride && input.plotSaleOverride > 0
      ? input.plotSaleOverride
      : resolveSalePrice({ type: input.type, capacity: input.capacity, rates: input.saleRates }),
  };
}

export const GRAVE_LOT_TYPES = ["봉안묘", "수목장", "매장묘", "평장묘", "복합묘"] as const;

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
