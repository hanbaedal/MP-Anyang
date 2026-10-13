/**
 * 첨부한 신청서 앞·뒤 이미지를 A4 PDF로 묶습니다.
 * 결과: public/docs/funeral/family-relation-certificate-application.pdf
 */
import { createWriteStream, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const front = path.join(root, "assets/funeral-forms/family-cert-front.png");
const back = path.join(root, "assets/funeral-forms/family-cert-back.png");
const outDir = path.join(root, "public/docs/funeral");
const outFile = path.join(outDir, "family-relation-certificate-application.pdf");

mkdirSync(outDir, { recursive: true });

const doc = new PDFDocument({
  size: "A4",
  margin: 28,
  info: {
    Title: "고인 포함 가족관계증명서 교부 신청서",
    Author: "(재)안양공원묘원",
    Subject: "가족관계 등록사항별 증명서 교부 등 신청서 (별지 제11호 서식)",
  },
});

const stream = createWriteStream(outFile);
doc.pipe(stream);

const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
const pageHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

function addScanPage(imagePath, { first = false } = {}) {
  if (!first) doc.addPage();
  doc.image(imagePath, doc.page.margins.left, doc.page.margins.top, {
    fit: [pageWidth, pageHeight],
    align: "center",
    valign: "center",
  });
}

addScanPage(front, { first: true });
addScanPage(back);

doc.end();

await new Promise((resolve, reject) => {
  stream.on("finish", resolve);
  stream.on("error", reject);
});

console.log("wrote", outFile);
