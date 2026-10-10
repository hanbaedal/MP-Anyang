import { NextResponse } from "next/server";
import { requireWorkApi } from "@/lib/manage-guard";
import { assembleProduct, deleteProduct, listProducts, saveProduct, type Product } from "@/lib/work-ledgers";

export const dynamic = "force-dynamic";

function fail(error: unknown) {
  const message = error instanceof Error ? error.message : "처리하지 못했습니다.";
  return NextResponse.json({ ok: false, error: message }, { status: 400 });
}

export async function GET() {
  const guard = await requireWorkApi("staff");
  if (guard.error) return guard.error;
  try {
    return NextResponse.json({ ok: true, rows: await listProducts() });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  const guard = await requireWorkApi("staff");
  if (guard.error) return guard.error;
  try {
    const body = (await request.json()) as Partial<Product> & { action?: string; count?: number };
    if (body.action === "assemble") {
      if (!body.id) throw new Error("상품을 찾지 못했습니다.");
      return NextResponse.json({ ok: true, row: await assembleProduct(body.id, Number(body.count)) });
    }
    return NextResponse.json({ ok: true, row: await saveProduct(body) });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  const guard = await requireWorkApi("staff");
  if (guard.error) return guard.error;
  try {
    const body = (await request.json()) as Partial<Product> & { id?: string };
    if (!body.id) throw new Error("상품을 찾지 못했습니다.");
    return NextResponse.json({ ok: true, row: await saveProduct(body, body.id) });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  const guard = await requireWorkApi("staff");
  if (guard.error) return guard.error;
  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) throw new Error("상품을 찾지 못했습니다.");
    await deleteProduct(body.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
