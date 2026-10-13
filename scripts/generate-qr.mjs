/**
 * 접속용 QR 이미지 생성 (인쇄·안내, 사이트 UI에는 넣지 않음).
 *
 *   # 홈페이지 (기본)
 *   npm run qr
 *
 *   # 운경 도메인
 *   npm run qr:unkyung
 *
 *   # 임의 URL
 *   SITE_URL=https://example.com QR_NAME=example npm run qr
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public");

const PRESETS = {
  homepage: { url: "https://www.anyangmp.com", name: "homepage" },
  unkyung: { url: "https://unkyung.co.kr", name: "unkyung" },
};

const presetKey = (process.env.QR_PRESET || "").trim().toLowerCase();
const preset = PRESETS[presetKey];
const url = (process.env.SITE_URL?.trim() || preset?.url || PRESETS.homepage.url).replace(/\/$/, "");
const name = (process.env.QR_NAME?.trim() || preset?.name || "homepage").replace(/[^a-z0-9_-]/gi, "");

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
  const png = join(outDir, `qr-${name}.png`);
  const svg = join(outDir, `qr-${name}.svg`);
  await QRCode.toFile(png, url, { ...opts, type: "png", width: 512 });
  await QRCode.toFile(svg, url, { ...opts, type: "svg" });
  console.log(`QR → ${url}`);
  console.log(`  public/qr-${name}.png`);
  console.log(`  public/qr-${name}.svg`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
