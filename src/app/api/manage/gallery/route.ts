import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { addGalleryPhoto, deleteGalleryPhoto, GALLERY_TAGS, listGallery, updateGalleryPhoto } from "@/lib/gallery";
import type { GalleryTag } from "@/lib/content";
import { requireStaffApi } from "@/lib/manage-guard";

export async function GET() {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  return NextResponse.json({ ok: true, items: await listGallery() });
}

function parseTags(raw: unknown): GalleryTag[] {
  const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
  return list.filter((tag): tag is GalleryTag => GALLERY_TAGS.includes(tag as GalleryTag));
}

export async function POST(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const form = await request.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") ?? "");
  const tags = parseTags(form.get("tags"));
  if (!(file instanceof File) || file.size < 1) {
    return NextResponse.json({ ok: false, error: "사진 파일을 선택해 주세요." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "사진은 8MB 이하만 올릴 수 있습니다." }, { status: 400 });
  }
  const type = file.type;
  const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : type === "image/gif" ? "gif" : "jpg";
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(type) && !file.name.match(/\.(jpe?g|png|webp|gif)$/i)) {
    return NextResponse.json({ ok: false, error: "JPG, PNG, WebP, GIF만 올릴 수 있습니다." }, { status: 400 });
  }
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buf);
  const photo = await addGalleryPhoto({ src: `/uploads/${name}`, alt, tags });
  return NextResponse.json({ ok: true, photo });
}

export async function PATCH(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const body = (await request.json()) as { id?: string; alt?: string; tags?: string[] };
  if (!body.id) return NextResponse.json({ ok: false, error: "사진이 없습니다." }, { status: 400 });
  const result = await updateGalleryPhoto(body.id, { alt: body.alt, tags: parseTags(body.tags) });
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}

export async function DELETE(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const result = await deleteGalleryPhoto(id);
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
