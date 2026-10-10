import { NextResponse } from "next/server";
import { getCmsPageOrDefault, isCmsSlug, saveCmsPage, type CmsItem } from "@/lib/cms";
import { requireStaffApi } from "@/lib/manage-guard";

export async function GET(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const slug = new URL(request.url).searchParams.get("slug") ?? "";
  if (!isCmsSlug(slug)) return NextResponse.json({ ok: false, error: "잘못된 페이지입니다." }, { status: 400 });
  const page = await getCmsPageOrDefault(slug);
  return NextResponse.json({ ok: true, page });
}

export async function PUT(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  let body: { slug?: string; title?: string; lead?: string; body?: string; items?: CmsItem[] };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }
  if (!body.slug || !isCmsSlug(body.slug)) {
    return NextResponse.json({ ok: false, error: "잘못된 페이지입니다." }, { status: 400 });
  }
  const page = await saveCmsPage({
    slug: body.slug,
    title: body.title ?? "",
    lead: body.lead ?? "",
    body: body.body ?? "",
    items: body.items ?? [],
  });
  return NextResponse.json({ ok: true, page });
}
