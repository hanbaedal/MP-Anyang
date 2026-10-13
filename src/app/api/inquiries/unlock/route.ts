import { NextResponse } from "next/server";
import { unlockSecretInquiry } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { id?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }
  if (!body.id?.trim()) {
    return NextResponse.json({ ok: false, error: "문의가 없습니다." }, { status: 400 });
  }
  if (!body.password) {
    return NextResponse.json({ ok: false, error: "비밀번호를 입력해 주세요." }, { status: 400 });
  }

  try {
    const result = await unlockSecretInquiry(body.id.trim(), body.password);
    if (!result.ok) return NextResponse.json(result, { status: 400 });
    return NextResponse.json({ ok: true, item: result.item });
  } catch (err) {
    console.error("[inquiries/unlock]", err);
    return NextResponse.json({ ok: false, error: "확인에 실패했습니다." }, { status: 500 });
  }
}
