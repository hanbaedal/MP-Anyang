/**
 * 홈페이지 접속 QR 이미지 생성.
 * 기본 URL: https://www.anyangmp.com
 *
 *   node scripts/generate-qr.mjs
 *   SITE_URL=https://example.com node scripts/generate-qr.mjs
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public");
const url = (process.env.SITE_URL?.trim() || "https://www.anyangmp.com").replace(/\/$/, "");

async function main() {
  let QRCode;
  try {
    QRCode = require("qrcode");
  } catch {
    console.error("qrcode 패키지가 필요합니다: npm install --no-save qrcode");
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });
  const opts = {
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#1a2e1a", light: "#ffffff" },
  };
  await QRCode.toFile(join(outDir, "qr-homepage.png"), url, { ...opts, type: "png", width: 512 });
  await QRCode.toFile(join(outDir, "qr-homepage.svg"), url, { ...opts, type: "svg" });
  console.log(`QR → ${url}`);
  console.log("  public/qr-homepage.png");
  console.log("  public/qr-homepage.svg");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
