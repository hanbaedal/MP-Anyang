import { getFeeRatesMerged, getSaleRatesMerged } from "../../../lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [annualFees, salePrices] = await Promise.all([getFeeRatesMerged(), getSaleRatesMerged()]);
  return Response.json({
    ok: true,
    note: "임시 요금표입니다. 정확한 금액은 상담 후 확정됩니다.",
    annualFees: annualFees.map((r) => ({ type: r.type, capacity: r.capacity, amount: r.annualFee })),
    salePrices: salePrices.map((r) => ({ type: r.type, capacity: r.capacity, amount: r.annualFee })),
  });
}
