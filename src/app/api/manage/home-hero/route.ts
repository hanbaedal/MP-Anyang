import { NextResponse } from "next/server";
import { commitHomeHeroSlots, getHomeHeroSettings, saveHomeHeroSettings } from "@/lib/home-hero";
import { saveHomeHeroUpload } from "@/lib/manage-media-upload";
import { requireStaffApi } from "@/lib/manage-guard";

export async function GET() {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const settings = await getHomeHeroSettings();
  return NextResponse.json({ ok: true, settings });
}

/**
 * 영상·음악 슬롯 저장.
 * - video / audio 파일 중 하나 이상 필요
 * - 올린 종류만 교체, 이전 업로드 파일 삭제
 * - DB에는 각각 1개만 유지
 */
export async function POST(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;

  const form = await request.formData();
  const videoFile = form.get("video");
  const audioFile = form.get("audio");
  const hasVideo = videoFile instanceof File && videoFile.size > 0;
  const hasAudio = audioFile instanceof File && audioFile.size > 0;

  if (!hasVideo && !hasAudio) {
    return NextResponse.json(
      { ok: false, error: "영상 또는 음악 파일을 선택한 뒤 저장해 주세요." },
      { status: 400 },
    );
  }

  let videoSrc: string | undefined;
  let audioSrc: string | undefined;
  let videoLabel: string | undefined;
  let audioLabel: string | undefined;

  if (hasVideo) {
    const saved = await saveHomeHeroUpload(videoFile, "video");
    if (!saved.ok) return NextResponse.json(saved, { status: 400 });
    videoSrc = saved.src;
    videoLabel = videoFile.name;
  }
  if (hasAudio) {
    const saved = await saveHomeHeroUpload(audioFile, "audio");
    if (!saved.ok) return NextResponse.json(saved, { status: 400 });
    audioSrc = saved.src;
    audioLabel = audioFile.name;
  }

  try {
    const current = await getHomeHeroSettings();
    const settings = await commitHomeHeroSlots(current, {
      videoSrc,
      audioSrc,
      videoLabel,
      audioLabel,
    });
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error("[home-hero] commit failed", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "저장에 실패했습니다." },
      { status: 500 },
    );
  }
}

/** 포스터 등 보조 필드만 갱신할 때 */
export async function PUT(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  let body: { posterSrc?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }
  const current = await getHomeHeroSettings();
  if (body.posterSrc) {
    const settings = await saveHomeHeroSettings({ ...current, posterSrc: body.posterSrc });
    return NextResponse.json({ ok: true, settings });
  }
  return NextResponse.json({ ok: true, settings: current });
}
