import { NextResponse } from "next/server";
import { requireWorkApi } from "@/lib/manage-guard";
import { deletePurchase, listPurchases, savePurchase, type Purchase } from "@/lib/work-ledgers";

export const dynamic = "force-dynamic";

function fail(error: unknown) {
  const message = error instanceof Error ? error.message : "처리하지 못했습니다.";
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export async function GET() {
  const guard = await requireWorkApi("staff");
  if (guard.error) return guard.error;
  try {
    return NextResponse.json({ ok: true, rows: await listPurchases() });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  const guard = await requireWorkApi("staff");
  if (guard.error) return guard.error;
  try {
    const body = (await request.json()) as Partial<Purchase>;
    const row = await savePurchase(body);
    return NextResponse.json({ ok: true, row });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  const guard = await requireWorkApi("staff");
  if (guard.error) return guard.error;
  try {
    const body = (await request.json()) as Partial<Purchase> & { id?: string };
    if (!body.id) throw new Error("매입 내역을 찾지 못했습니다.");
    const row = await savePurchase(body, body.id);
    return NextResponse.json({ ok: true, row });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  const guard = await requireWorkApi("staff");
  if (guard.error) return guard.error;
  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) throw new Error("매입 내역을 찾지 못했습니다.");
    await deletePurchase(body.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
