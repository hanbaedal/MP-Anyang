import { NextResponse } from "next/server";
import { saveInquiry, validateInquiry } from "@/lib/inquiries";

export async function POST(request: Request) {
  let body: { name?: string; phone?: string; message?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  const error = validateInquiry(body);
  if (error) return NextResponse.json({ ok: false, error }, { status: 400 });

  try {
    await saveInquiry({
      name: body.name!,
      phone: body.phone!,
      message: body.message!,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[inquiries]", err);
    return NextResponse.json(
      { ok: false, error: "저장에 실패했습니다. 031-482-2949로 전화 주세요." },
      { status: 500 },
    );
  }
}
