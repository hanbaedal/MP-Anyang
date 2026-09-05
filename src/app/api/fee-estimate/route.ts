import { GRAVE_LOT_TYPES } from "../../../lib/fee-rates";
import { getFeeRatesMerged, getSaleRatesMerged } from "../../../lib/store";
import { resolvePlotPrices as computePlotPrices } from "../../../lib/fee-rates";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type")?.trim() || "";
  const capacity = url.searchParams.get("capacity")?.trim() || "";

  if (!type) {
    return Response.json({ error: "type required" }, { status: 400 });
  }

  if (!GRAVE_LOT_TYPES.includes(type as (typeof GRAVE_LOT_TYPES)[number])) {
    return Response.json({ ok: true, graveType: false, type, capacity });
  }

  const [annualRates, saleRates] = await Promise.all([getFeeRatesMerged(), getSaleRatesMerged()]);
  const prices = computePlotPrices({
    type,
    capacity,
    annualRates,
    saleRates,
  });

  return Response.json({
    ok: true,
    graveType: true,
    type,
    capacity,
    annualFee: prices.annualFee,
    salePrice: prices.salePrice,
  });
}
