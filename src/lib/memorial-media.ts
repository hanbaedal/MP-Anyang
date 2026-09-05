import { isCloudinaryEnabled, uploadMediaBuffer } from "./cloudinary-upload";

const BASE64_MAX_BYTES = 450_000;
const CLOUDINARY_MAX_BYTES = 5_000_000;
const VIDEO_MAX_BYTES = 20_000_000;

export async function storeMemorialMedia(file: File) {
  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isVideo && !isImage) {
    throw new Error("사진 또는 동영상만 업로드할 수 있습니다.");
  }

  const maxBytes = isCloudinaryEnabled()
    ? isVideo
      ? VIDEO_MAX_BYTES
      : CLOUDINARY_MAX_BYTES
    : BASE64_MAX_BYTES;

  if (file.size > maxBytes) {
    const limit = isCloudinaryEnabled() ? (isVideo ? "20MB" : "5MB") : "450KB";
    throw new Error(`파일은 ${limit} 이하로 올려 주세요.`);
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (isCloudinaryEnabled()) {
    const url = await uploadMediaBuffer(buf, "memorial", file.type);
    return { url, mediaType: isVideo ? ("video" as const) : ("image" as const) };
  }

  return {
    url: `data:${file.type};base64,${buf.toString("base64")}`,
    mediaType: isVideo ? ("video" as const) : ("image" as const),
  };
}
