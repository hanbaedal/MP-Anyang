import { isCloudinaryEnabled, uploadImageBuffer } from "./cloudinary-upload";

const BASE64_MAX_BYTES = 450_000;
const CLOUDINARY_MAX_BYTES = 5_000_000;
const MAX_COUNT = 10;

async function fileToStoredUrl(file: File, folder: string) {
  if (!file.type.startsWith("image/")) return null;

  const maxBytes = isCloudinaryEnabled() ? CLOUDINARY_MAX_BYTES : BASE64_MAX_BYTES;
  if (file.size > maxBytes) {
    const limit = isCloudinaryEnabled() ? "5MB" : "450KB";
    throw new Error(`이미지는 장당 ${limit} 이하로 올려 주세요. (${file.name})`);
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (isCloudinaryEnabled()) {
    return uploadImageBuffer(buf, folder);
  }
  return `data:${file.type};base64,${buf.toString("base64")}`;
}

export async function filesToDataUrls(formData: FormData, field: string, max = MAX_COUNT, folder = "graves") {
  const files = formData.getAll(field).filter((item): item is File => item instanceof File && item.size > 0);
  const urls: string[] = [];
  for (const file of files.slice(0, max)) {
    const url = await fileToStoredUrl(file, folder);
    if (url) urls.push(url);
  }
  return urls;
}

export async function fileToDataUrl(formData: FormData, field: string, folder = "graves") {
  const urls = await filesToDataUrls(formData, field, 1, folder);
  return urls[0] || "";
}

export function imageStorageMode() {
  return isCloudinaryEnabled() ? "cloudinary" : "base64";
}
