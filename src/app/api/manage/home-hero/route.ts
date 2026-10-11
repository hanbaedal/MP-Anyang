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
 * MongoDB 저장
 * - 영상 필수, 음악 선택
 * - 기존 영상·음악 업로드 삭제 후 새로 저장
 * - 음악 미등록이면 음악 슬롯 공란
 */
export async function POST(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;

  const form = await request.formData();
  const videoFile = form.get("video");
  const audioFile = form.get("audio");
  const hasVideo = videoFile instanceof File && videoFile.size > 0;
  const hasAudio = audioFile instanceof File && audioFile.size > 0;

  if (!hasVideo) {
    return NextResponse.json(
      { ok: false, error: "영상을 등록한 뒤 저장해 주세요." },
      { status: 400 },
    );
  }

  const savedVideo = await saveHomeHeroUpload(videoFile, "video");
  if (!savedVideo.ok) return NextResponse.json(savedVideo, { status: 400 });

  let audioSrc = "";
  let audioLabel: string | undefined;
  if (hasAudio) {
    const savedAudio = await saveHomeHeroUpload(audioFile, "audio");
    if (!savedAudio.ok) return NextResponse.json(savedAudio, { status: 400 });
    audioSrc = savedAudio.src;
    audioLabel = audioFile.name;
  }

  try {
    const current = await getHomeHeroSettings();
    const settings = await commitHomeHeroSlots(current, {
      videoSrc: savedVideo.src,
      audioSrc,
      videoLabel: videoFile.name,
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
