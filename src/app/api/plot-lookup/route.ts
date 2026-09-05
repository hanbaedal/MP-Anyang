import { resolveRelationSlots } from "../../../lib/plot-specs";
import { findGraveByPlotNo, resolvePlotPrices } from "../../../lib/store";

export async function GET(request: Request) {
  const plotNo = new URL(request.url).searchParams.get("plotNo")?.trim() || "";
  if (!plotNo) {
    return Response.json({ error: "plotNo required" }, { status: 400 });
  }

  try {
    const grave = await findGraveByPlotNo(plotNo);
    if (!grave) {
      return Response.json({ found: false, plotNo });
    }

    const type = String(grave.type || "");
    const capacity = String(grave.capacity || "");
    const resolved = resolveRelationSlots(type, capacity);
    const prices = await resolvePlotPrices(plotNo);

    return Response.json({
      found: true,
      plotNo: String(grave.plotNo),
      type,
      capacity: capacity || resolved.variant,
      zone: String(grave.zone || ""),
      slots: resolved.slots,
      hint: resolved.hint,
      variants: resolved.variants,
      annualFee: prices?.annualFee ?? 0,
      salePrice: prices?.salePrice ?? 0,
      feeSource: Number(grave.annualFee || 0) > 0 ? "plot" : "rate-table",
      saleSource: Number(grave.salePrice || 0) > 0 ? "plot" : "rate-table",
    });
  } catch {
    return Response.json({ error: "lookup failed" }, { status: 500 });
  }
}
