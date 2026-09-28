import { NextResponse } from "next/server";
import {
  appendHomeHeroAsset,
  getHomeHeroSettings,
  isSafeHomeMediaPath,
  saveHomeHeroSettings,
} from "@/lib/home-hero";
import { saveHomeHeroUpload } from "@/lib/manage-media-upload";
import { saveManageUpload } from "@/lib/manage-image-upload";
import { requireStaffApi } from "@/lib/manage-guard";

export async function GET() {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const settings = await getHomeHeroSettings();
  return NextResponse.json({ ok: true, settings });
}

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

export async function POST(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const form = await request.formData();
  const kind = String(form.get("kind") ?? "");
  const label = String(form.get("label") ?? "").trim();
  const file = form.get("file");

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
  settings = appendHomeHeroAsset(settings, {
    kind,
    src: saved.src,
    label: label || file.name,
  });
  settings = await saveHomeHeroSettings(settings);
  return NextResponse.json({ ok: true, settings });
}
