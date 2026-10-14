/**
 * docs/manuals/*.md → docs/manuals/*.docx (홈페이지·홈페이지관리)
 * 사용: node scripts/build-manuals-docx.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { readFileSync, existsSync } from "node:fs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const manualsDir = path.join(root, "docs", "manuals");
const outDir = path.join(manualsDir, "docx");
const artifactsDir = "/opt/cursor/artifacts";

const ITEMS = [
  {
    serial: "01",
    title: "홈페이지",
    audience: "방문객·안내 직원",
    file: "01-홈페이지.md",
    revised: "2026-10-14",
  },
  {
    serial: "02",
    title: "홈페이지관리",
    audience: "admin, supervisor",
    file: "02-홈페이지관리.md",
    revised: "2026-10-14",
  },
];

function plainLines(md) {
  return md
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\*\*/g, "").replace(/`/g, "").trimEnd());
}

async function buildDocx(item) {
  const full = path.join(manualsDir, item.file);
  if (!existsSync(full)) throw new Error(`missing ${item.file}`);
  const lines = plainLines(readFileSync(full, "utf8"));
  const children = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: `${item.serial}. ${item.title}`, bold: true, size: 36 })],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `대상: ${item.audience}  ·  개정: ${item.revised}`,
          size: 20,
          color: "555555",
        }),
      ],
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

  const doc = new Document({ sections: [{ properties: {}, children }] });
  return Buffer.from(await Packer.toBuffer(doc));
}

await mkdir(outDir, { recursive: true });
await mkdir(artifactsDir, { recursive: true });

for (const item of ITEMS) {
  const buf = await buildDocx(item);
  const name = `${item.serial}_${item.title}.docx`;
  const dest = path.join(outDir, name);
  const art = path.join(artifactsDir, name);
  await writeFile(dest, buf);
  await writeFile(art, buf);
  console.log("wrote", dest, buf.length, "bytes");
  console.log("wrote", art, buf.length, "bytes");
}

console.log("done");
