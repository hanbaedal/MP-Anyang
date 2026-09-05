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

export async function uploadImageBuffer(buffer: Buffer, folder: string) {
  if (!configured()) {
    throw new Error("Cloudinary 환경변수가 설정되지 않았습니다.");
  }
  ensureConfig();
  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: `mp-anyang/${folder}` }, (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary 업로드에 실패했습니다."));
          return;
        }
        resolve(result.secure_url);
      })
      .end(buffer);
  });
}
