import { v2 as cloudinary } from "cloudinary";

function configured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export function isCloudinaryEnabled() {
  return configured();
}

function ensureConfig() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function uploadBuffer(buffer: Buffer, folder: string, resourceType: "image" | "video" | "auto" = "image") {
  if (!configured()) {
    throw new Error("Cloudinary 환경변수가 설정되지 않았습니다.");
  }
  ensureConfig();
  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: `mp-anyang/${folder}`, resource_type: resourceType }, (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary 업로드에 실패했습니다."));
          return;
        }
        resolve(result.secure_url);
      })
      .end(buffer);
  });
}

export async function uploadImageBuffer(buffer: Buffer, folder: string) {
  return uploadBuffer(buffer, folder, "image");
}

export async function uploadMediaBuffer(buffer: Buffer, folder: string, mimeType: string) {
  const resourceType = mimeType.startsWith("video/") ? "video" : "image";
  return uploadBuffer(buffer, folder, resourceType);
}
