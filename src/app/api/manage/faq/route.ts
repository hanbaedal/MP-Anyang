import { NextResponse } from "next/server";
import { deleteFaq, listFaq, saveFaq, updateFaq, validateFaq } from "@/lib/faq";
import { requireStaffApi } from "@/lib/manage-guard";

export async function GET() {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  return NextResponse.json({ ok: true, items: await listFaq() });
}

export async function POST(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const body = (await request.json()) as { name?: string; question?: string; answer?: string; public?: boolean };
  const error = validateFaq(body);
  if (error) return NextResponse.json({ ok: false, error }, { status: 400 });
  const item = await saveFaq({
    name: body.name || "관리사무실",
    question: body.question!,
    answer: body.answer,
    public: body.public,
  });
  return NextResponse.json({ ok: true, item });
}

export async function PATCH(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const body = (await request.json()) as {
    id?: string;
    name?: string;
    question?: string;
    answer?: string;
    public?: boolean;
  };
  if (!body.id) return NextResponse.json({ ok: false, error: "항목이 없습니다." }, { status: 400 });
  const result = await updateFaq(body.id, body);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}

export async function DELETE(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const result = await deleteFaq(id);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
