import { getFeeRatesMerged, getSaleRatesMerged } from "../../../lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [annualFees, salePrices] = await Promise.all([getFeeRatesMerged(), getSaleRatesMerged()]);
  return Response.json({
    ok: true,
    note: "평당 신고가입니다. 형태·기수별 총액은 상담 후 확정됩니다.",
    annualFees: annualFees.map((r) => ({ type: r.type, capacity: r.capacity, amount: r.annualFee })),
    salePrices: salePrices.map((r) => ({ type: r.type, capacity: r.capacity, amount: r.annualFee })),
  });
}
