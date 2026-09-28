import { NextResponse } from "next/server";
import {
  appendHomeHeroAsset,
  deleteHomeHeroAsset,
  getHomeHeroSettings,
  isSafeHomeMediaPath,
  replaceHomeHeroAssetFile,
  saveHomeHeroSettings,
  updateHomeHeroAsset,
} from "@/lib/home-hero";
import type { HomeHeroAssetKind, HomeHeroSeasonTag } from "@/lib/home-hero-types";
import { saveHomeHeroUpload } from "@/lib/manage-media-upload";
import { saveManageUpload } from "@/lib/manage-image-upload";
import { requireStaffApi } from "@/lib/manage-guard";

export async function GET() {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const settings = await getHomeHeroSettings();
  return NextResponse.json({ ok: true, settings });
}

/** 공개 중인 영상·음악·포스터 경로만 지정 */
export async function PUT(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  let body: { videoSrc?: string; audioSrc?: string; posterSrc?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }
  const current = await getHomeHeroSettings();
  const videoSrc = body.videoSrc ?? current.videoSrc;
  const audioSrc = body.audioSrc ?? current.audioSrc;
  const posterSrc = body.posterSrc ?? current.posterSrc;
  if (!isSafeHomeMediaPath(videoSrc) || !isSafeHomeMediaPath(audioSrc) || !isSafeHomeMediaPath(posterSrc)) {
    return NextResponse.json({ ok: false, error: "허용되지 않은 파일 경로입니다." }, { status: 400 });
  }
  const settings = await saveHomeHeroSettings({ ...current, videoSrc, audioSrc, posterSrc });
  return NextResponse.json({ ok: true, settings });
}

/** 항목 이름·계절·메모 수정 */
export async function PATCH(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  let body: { id?: string; kind?: HomeHeroAssetKind; label?: string; season?: HomeHeroSeasonTag; memo?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }
  if (!body.id || (body.kind !== "video" && body.kind !== "audio")) {
    return NextResponse.json({ ok: false, error: "id와 kind(video|audio)가 필요합니다." }, { status: 400 });
  }
  const current = await getHomeHeroSettings();
  const updated = updateHomeHeroAsset(current, body.kind, body.id, {
    label: body.label,
    season: body.season,
    memo: body.memo,
  });
  if ("error" in updated) return NextResponse.json({ ok: false, error: updated.error }, { status: 400 });
  const settings = await saveHomeHeroSettings(updated);
  return NextResponse.json({ ok: true, settings });
}

export async function DELETE(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  const kind = url.searchParams.get("kind") ?? "";
  if (!id || (kind !== "video" && kind !== "audio")) {
    return NextResponse.json({ ok: false, error: "id와 kind가 필요합니다." }, { status: 400 });
  }
  const current = await getHomeHeroSettings();
  const updated = await deleteHomeHeroAsset(current, kind, id);
  if ("error" in updated) return NextResponse.json({ ok: false, error: updated.error }, { status: 400 });
  const settings = await saveHomeHeroSettings(updated);
  return NextResponse.json({ ok: true, settings });
}

export async function POST(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const form = await request.formData();
  const action = String(form.get("action") ?? "create");
  const kind = String(form.get("kind") ?? "");
  const label = String(form.get("label") ?? "").trim();
  const season = String(form.get("season") ?? "") as HomeHeroSeasonTag;
  const memo = String(form.get("memo") ?? "").trim();
  const applyPublic = String(form.get("applyPublic") ?? "1") !== "0";
  const file = form.get("file");
  const assetId = String(form.get("assetId") ?? "");

  if (action === "replace") {
    if (!assetId || (kind !== "video" && kind !== "audio") || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "assetId, kind, file이 필요합니다." }, { status: 400 });
    }
    const saved = await saveHomeHeroUpload(file, kind);
    if (!saved.ok) return NextResponse.json(saved, { status: 400 });
    let settings = await getHomeHeroSettings();
    const replaced = replaceHomeHeroAssetFile(settings, kind, assetId, saved.src);
    if ("error" in replaced) return NextResponse.json({ ok: false, error: replaced.error }, { status: 400 });
    settings = await saveHomeHeroSettings(replaced);
    return NextResponse.json({ ok: true, settings });
  }

  if (kind === "poster") {
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "포스터 이미지를 선택해 주세요." }, { status: 400 });
    }
    const saved = await saveManageUpload(file);
    if (!saved.ok) return NextResponse.json(saved, { status: 400 });
    let settings = await getHomeHeroSettings();
    settings = { ...settings, posterSrc: saved.src };
    settings = await saveHomeHeroSettings(settings);
    return NextResponse.json({ ok: true, settings });
  }

  if (kind !== "video" && kind !== "audio") {
    return NextResponse.json({ ok: false, error: "kind는 video, audio, poster 중 하나입니다." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "파일을 선택해 주세요." }, { status: 400 });
  }
  const saved = await saveHomeHeroUpload(file, kind);
  if (!saved.ok) return NextResponse.json(saved, { status: 400 });

  let settings = await getHomeHeroSettings();
  settings = appendHomeHeroAsset(
    settings,
    {
      kind,
      src: saved.src,
      label: label || file.name,
      season,
      memo,
    },
    { applyPublic },
  );
  settings = await saveHomeHeroSettings(settings);
  return NextResponse.json({ ok: true, settings });
}
