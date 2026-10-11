import { NextResponse } from "next/server";
import { requireWorkApi } from "@/lib/manage-guard";
import { allocateReceiptSerials } from "@/lib/receipt-serial";

export async function POST(request: Request) {
  const guard = await requireWorkApi("staff");
  if (guard.error) return guard.error;
  let count = 1;
  try {
    const body = (await request.json()) as { count?: number };
    if (typeof body.count === "number" && Number.isFinite(body.count)) {
      count = Math.max(1, Math.min(50, Math.floor(body.count)));
    }
  } catch {
    /* default 1 */
  }
  try {
    const serials = await allocateReceiptSerials(count);
    return NextResponse.json({ ok: true, serial: serials[0], serials });
  } catch (error) {
    const message = error instanceof Error ? error.message : "일련번호 발급 실패";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
