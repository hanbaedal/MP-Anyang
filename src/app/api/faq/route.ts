import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "공개 질문 접수는 닫았습니다. 개인 상담은 문의·상담을 이용해 주세요." },
    { status: 403 },
  );
}
