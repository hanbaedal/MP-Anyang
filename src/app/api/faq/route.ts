import { NextResponse } from "next/server";
import { saveFaq, validateFaq } from "@/lib/faq";

export async function POST(request: Request) {
  let body: { name?: string; question?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  const error = validateFaq(body);
  if (error) return NextResponse.json({ ok: false, error }, { status: 400 });

  try {
    await saveFaq({ name: body.name!, question: body.question! });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[faq]", err);
    return NextResponse.json(
      { ok: false, error: "저장에 실패했습니다. 031-482-2949로 전화 주세요." },
      { status: 500 },
    );
  }
}
