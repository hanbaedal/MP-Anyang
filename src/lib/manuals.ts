import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import PDFDocument from "pdfkit";

export type ManualFormat = "docx" | "pdf";

export type ManualItem = {
  id: string;
  serial: string;
  title: string;
  audience: string;
  file: string;
  revised: string;
};

export const MANUAL_REVISED = "2026-10-05";

export const MANUAL_ITEMS: ManualItem[] = [
  {
    id: "01-homepage",
    serial: "01",
    title: "홈페이지",
    audience: "방문객·안내 직원",
    file: "01-홈페이지.md",
    revised: MANUAL_REVISED,
  },
  {
    id: "02-cms",
    serial: "02",
    title: "홈페이지관리",
    audience: "admin, supervisor",
    file: "02-홈페이지관리.md",
    revised: MANUAL_REVISED,
  },
  {
    id: "03-work",
    serial: "03",
    title: "업무프로그램",
    audience: "전 직원",
    file: "03-업무프로그램.md",
    revised: MANUAL_REVISED,
  },
  {
    id: "04-exec",
    serial: "04",
    title: "경영관리",
    audience: "ceo, supervisor",
    file: "04-경영관리.md",
    revised: MANUAL_REVISED,
  },
  {
    id: "05a-supervisor-ops",
    serial: "05-A",
    title: "슈퍼바이저 운영",
    audience: "supervisor",
    file: "05a-슈퍼바이저-운영.md",
    revised: MANUAL_REVISED,
  },
  {
    id: "05b-supervisor-ledger",
    serial: "05-B",
    title: "슈퍼바이저 계약·원장",
    audience: "supervisor",
    file: "05b-슈퍼바이저-계약원장.md",
    revised: MANUAL_REVISED,
  },
];

export function findManual(id: string) {
  return MANUAL_ITEMS.find((item) => item.id === id) ?? null;
}

function manualsDir() {
  return path.join(process.cwd(), "docs", "manuals");
}

function fontPath() {
  return path.join(process.cwd(), "assets", "fonts", "NanumGothicCoding.ttf");
}

export function readManualMarkdown(item: ManualItem) {
  const full = path.join(manualsDir(), item.file);
  if (!existsSync(full)) throw new Error("manual-missing");
  return readFileSync(full, "utf8");
}

function plainLines(md: string) {
  return md
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\*\*/g, "").replace(/`/g, "").trimEnd());
}

export async function buildManualDocx(item: ManualItem) {
  const lines = plainLines(readManualMarkdown(item));
  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: `${item.serial}. ${item.title}`, bold: true, size: 36 })],
    }),
    new Paragraph({
      children: [new TextRun({ text: `대상: ${item.audience}  ·  개정: ${item.revised}`, size: 20, color: "555555" })],
    }),
    new Paragraph({ children: [] }),
  ];
  for (const line of lines) {
    if (!line.trim()) {
      children.push(new Paragraph({ children: [] }));
      continue;
    }
    if (line.startsWith("# ")) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: line.slice(2), bold: true, size: 32 })],
        }),
      );
      continue;
    }
    if (line.startsWith("## ")) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: line.slice(3), bold: true, size: 28 })],
        }),
      );
      continue;
    }
    if (line.startsWith("### ")) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: line.slice(4), bold: true, size: 24 })],
        }),
      );
      continue;
    }
    children.push(new Paragraph({ children: [new TextRun({ text: line, size: 20 })] }));
  }
  const doc = new Document({
    sections: [{ properties: {}, children }],
  });
  return Buffer.from(await Packer.toBuffer(doc));
}

export async function buildManualPdf(item: ManualItem) {
  const font = fontPath();
  if (!existsSync(font)) throw new Error("font-missing");
  const lines = plainLines(readManualMarkdown(item));
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4", info: { Title: `${item.serial} ${item.title}` } });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.registerFont("kr", font);
    doc.font("kr").fontSize(16).text(`${item.serial}. ${item.title}`);
    doc.moveDown(0.4);
    doc.fontSize(10).fillColor("#444444").text(`대상: ${item.audience}  ·  개정: ${item.revised}`);
    doc.fillColor("#000000");
    doc.moveDown(0.8);
    for (const line of lines) {
      if (!line.trim()) {
        doc.moveDown(0.35);
        continue;
      }
      if (line.startsWith("# ")) {
        doc.moveDown(0.4);
        doc.fontSize(14).text(line.slice(2), { underline: false });
        doc.fontSize(10);
        continue;
      }
      if (line.startsWith("## ")) {
        doc.moveDown(0.3);
        doc.fontSize(12).text(line.slice(3));
        doc.fontSize(10);
        continue;
      }
      if (line.startsWith("### ")) {
        doc.moveDown(0.2);
        doc.fontSize(11).text(line.slice(4));
        doc.fontSize(10);
        continue;
      }
      doc.fontSize(10).text(line, { width: 500 });
    }
    doc.end();
  });
}

export function downloadFileName(item: ManualItem, format: ManualFormat) {
  const base = `${item.serial}_${item.title}`.replace(/[\\/:*?"<>|]/g, "-");
  return `${base}.${format}`;
}
