import { NextResponse } from "next/server";
import { listPublicInquiries, saveInquiry, validateInquiry } from "@/lib/inquiries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await listPublicInquiries();
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("[inquiries] list", err);
    return NextResponse.json({ ok: false, error: "목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: {
    name?: string;
    phone?: string;
    message?: string;
    visibility?: string;
    password?: string;
    passwordConfirm?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  const error = validateInquiry(body);
  if (error) return NextResponse.json({ ok: false, error }, { status: 400 });

  try {
    const visibility = body.visibility === "secret" ? "secret" : "public";
    const result = await saveInquiry({
      name: body.name!,
      phone: body.phone!,
      message: body.message!,
      visibility,
      password: visibility === "secret" ? body.password : undefined,
    });
    return NextResponse.json({ ok: true, id: result.id });
  } catch (err) {
    console.error("[inquiries]", err);
    return NextResponse.json(
      { ok: false, error: "저장에 실패했습니다. 031-482-2949로 전화 주세요." },
      { status: 500 },
    );
  }
}
