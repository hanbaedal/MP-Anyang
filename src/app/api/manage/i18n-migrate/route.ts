import { NextResponse } from "next/server";
import { migrateContentI18n } from "@/lib/content-i18n-migrate";
import { requireStaffApi } from "@/lib/manage-guard";

/** 기존 CMS·공지·FAQ를 영어·중국어로 채웁니다. ?force=1 이면 다시 번역합니다. */
export async function POST(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const force = new URL(request.url).searchParams.get("force") === "1";
  try {
    const result = await migrateContentI18n(force);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[i18n-migrate]", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "번역 채우기에 실패했습니다." },
      { status: 500 },
    );
  }
}
