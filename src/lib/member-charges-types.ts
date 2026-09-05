export type ChargeType = "sale" | "annual_fee" | "memorial" | "other";
export type ChargeStatus = "pending" | "paid" | "partial" | "cancelled";

export const CHARGE_TYPE_LABELS: Record<ChargeType, string> = {
  sale: "분양가",
  annual_fee: "연관리비",
  memorial: "사이ber 추모관",
  other: "기타",
};

export const CHARGE_STATUS_LABELS: Record<ChargeStatus, string> = {
  pending: "미납",
  paid: "완납",
  partial: "분납",
  cancelled: "취소",
};

export type MemberChargeRow = {
  id: string;
  memberId: string;
  chargeType: ChargeType;
  title: string;
  amount: number;
  paidAmount: number;
  status: ChargeStatus;
  periodYear?: string;
  dueDate?: string;
  paidAt?: string;
  memo?: string;
  source: string;
  legacyKey?: string;
  createdAt: string;
  updatedAt: string;
};

export function groupChargesByType(charges: MemberChargeRow[]) {
  const groups: Record<ChargeType, MemberChargeRow[]> = {
    sale: [],
    annual_fee: [],
    memorial: [],
    other: [],
  };
  for (const row of charges) groups[row.chargeType].push(row);
  return groups;
}

export function chargeSummary(charges: MemberChargeRow[]) {
  const groups = groupChargesByType(charges);
  const sum = (type: ChargeType) => {
    const rows = groups[type];
    const total = rows.reduce((s, r) => s + r.amount, 0);
    const paid = rows.reduce((s, r) => s + r.paidAmount, 0);
    return { count: rows.length, total, paid, balance: total - paid };
  };
  return {
    sale: sum("sale"),
    annual_fee: sum("annual_fee"),
    memorial: sum("memorial"),
    other: sum("other"),
  };
}
