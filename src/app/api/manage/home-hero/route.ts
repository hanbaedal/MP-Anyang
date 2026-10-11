import { NextResponse } from "next/server";
import {
  addHomeHeroSet,
  deleteHomeHeroSet,
  getHomeHeroSettings,
  publishHomeHeroSet,
  renameHomeHeroSet,
  replaceHomeHeroSet,
  saveHomeHeroSettings,
} from "@/lib/home-hero";
import { saveHomeHeroUpload } from "@/lib/manage-media-upload";
import { requireStaffApi } from "@/lib/manage-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** GridFS 업로드·교체 여유 */
export const maxDuration = 120;

export async function GET() {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;
  const settings = await getHomeHeroSettings();
  return NextResponse.json({ ok: true, settings });
}

/**
 * 세트 추가·교체 (multipart)
 * - action=add (기본): 새 세트 추가 (최대 8)
 * - action=replace + setId: 선택 세트 파일 교체
 * - 영상 필수, 음악 선택(없으면 공란)
 */
export async function POST(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;

  let form: FormData;
  try {
    form = await request.formData();
  } catch (error) {
    console.error("[home-hero] formData failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "업로드가 끊겼거나 파일이 너무 큽니다. 영상 25MB·음악 12MB 이하로 다시 시도해 주세요.",
      },
      { status: 413 },
    );
  }

  const action = String(form.get("action") || "add");
  const setId = String(form.get("setId") || "");
  const label = String(form.get("label") || "").trim();
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

  const payload = {
    videoSrc: savedVideo.src,
    audioSrc,
    label: label || undefined,
    videoLabel: videoFile.name,
    audioLabel,
  };

  try {
    const current = await getHomeHeroSettings();
    const settings =
      action === "replace"
        ? await replaceHomeHeroSet(current, setId, payload)
        : await addHomeHeroSet(current, payload);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error("[home-hero] commit failed", error);
    // 업로드는 됐지만 메타 저장 실패 시 고아 파일 가능 — 메시지로 안내
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "저장에 실패했습니다." },
      { status: 500 },
    );
  }
}

/**
 * 공개·삭제·이름 변경·포스터
 * body.action: publish | delete | rename | poster
 */
export async function PUT(request: Request) {
  const guard = await requireStaffApi();
  if (guard.error) return guard.error;

  let body: {
    action?: string;
    setId?: string;
    label?: string;
    posterSrc?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  const current = await getHomeHeroSettings();
  const action = String(body.action || (body.posterSrc ? "poster" : ""));

  try {
    if (action === "publish") {
      if (!body.setId) {
        return NextResponse.json({ ok: false, error: "세트를 선택해 주세요." }, { status: 400 });
      }
      const settings = await publishHomeHeroSet(current, body.setId);
      return NextResponse.json({ ok: true, settings });
    }
    if (action === "delete") {
      if (!body.setId) {
        return NextResponse.json({ ok: false, error: "세트를 선택해 주세요." }, { status: 400 });
      }
      const settings = await deleteHomeHeroSet(current, body.setId);
      return NextResponse.json({ ok: true, settings });
    }
    if (action === "rename") {
      if (!body.setId) {
        return NextResponse.json({ ok: false, error: "세트를 선택해 주세요." }, { status: 400 });
      }
      const settings = await renameHomeHeroSet(current, body.setId, String(body.label || ""));
      return NextResponse.json({ ok: true, settings });
    }
    if (action === "poster" || body.posterSrc) {
      if (body.posterSrc) {
        const settings = await saveHomeHeroSettings({ ...current, posterSrc: body.posterSrc });
        return NextResponse.json({ ok: true, settings });
      }
      return NextResponse.json({ ok: true, settings: current });
    }
    return NextResponse.json({ ok: false, error: "지원하지 않는 작업입니다." }, { status: 400 });
  } catch (error) {
    console.error("[home-hero] put failed", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "처리에 실패했습니다." },
      { status: 500 },
    );
  }
}
