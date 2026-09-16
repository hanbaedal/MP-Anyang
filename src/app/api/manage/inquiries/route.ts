import { NextResponse } from "next/server";
import { answerInquiry, listInquiries } from "@/lib/inquiries";
import { requireStaffApi } from "@/lib/manage-guard";

export async function GET() {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  return NextResponse.json({ ok: true, items: await listInquiries() });
}

export async function PATCH(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const body = (await request.json()) as { id?: string; answer?: string };
  if (!body.id) return NextResponse.json({ ok: false, error: "문의가 없습니다." }, { status: 400 });
  const result = await answerInquiry(body.id, body.answer ?? "", guard.session.name || guard.session.username);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
