import { randomUUID } from "node:crypto";
import { BURIAL, COLUMBARIUM, LAWN, REMODEL_TYPES } from "./content";
import { MESSAGES } from "./i18n";
import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { getDb, hasMongo } from "./mongo";
import { FEATURES } from "./site";
import { PRICES, REMAINING } from "./facts";
import { type CmsItem, type CmsPage, type CmsSlug } from "./cms-types";

export { CMS_SLUGS, isCmsSlug, type CmsItem, type CmsPage, type CmsSlug } from "./cms-types";

const localFile = dataFile("cms.local.json");
const ko = MESSAGES.ko;

function nid() {
  return randomUUID();
}

export function defaultCmsPage(slug: CmsSlug): CmsPage {
  const now = new Date().toISOString();
  if (slug === "greeting") {
    return {
      slug,
      title: ko["greeting.title"],
      lead: ko["greeting.lead"],
      body: [ko["greeting.p1"], ko["greeting.p2"], ko["greeting.p3"], ko["greeting.thanks"], ko["greeting.sign"]].join(
        "\n\n",
      ),
      items: [],
      updatedAt: now,
    };
  }
  if (slug === "features") {
    return {
      slug,
      title: ko["features.title"],
      lead: ko["features.lead"],
      body: "",
      items: FEATURES.map((feature) => ({
        id: nid(),
        title: ko[feature.titleKey],
        text: ko[feature.bodyKey],
      })),
      updatedAt: now,
    };
  }
  if (slug === "burial") {
    return {
      slug,
      title: ko["burial.title"],
      lead: ko["burial.lead"],
      body: ko["burial.body"],
      items: BURIAL.map((item) => ({ id: nid(), title: item.title, text: item.caption, image: item.image })),
      updatedAt: now,
    };
  }
  if (slug === "lawn") {
    return {
      slug,
      title: ko["lawn.title"],
      lead: ko["lawn.lead"],
      body: ko["lawn.body"],
      items: LAWN.map((item) => ({ id: nid(), title: item.title, image: item.image })),
      updatedAt: now,
    };
  }
  if (slug === "columbarium") {
    return {
      slug,
      title: ko["col.title"],
      lead: ko["col.lead"],
      body: ko["col.body"],
      items: COLUMBARIUM.map((item) => ({ id: nid(), title: item.title, image: item.image })),
      updatedAt: now,
    };
  }
  if (slug === "remodeling") {
    return {
      slug,
      title: ko["remodel.title"],
      lead: ko["remodel.lead"],
      body: [ko["remodel.body"], ko["remodel.cost"]].join("\n\n"),
      items: REMODEL_TYPES.map((item) => ({ id: nid(), title: item.title, text: item.text, image: item.image })),
      updatedAt: now,
    };
  }
  return {
    slug: "prices",
    title: ko["prices.title"],
    lead: ko["prices.lead"],
    body: ko["prices.deposit"],
    items: [
      ...PRICES.map((row) => ({ id: nid(), title: ko[row.nameKey], won: "" })),
      ...REMAINING.map((row) => ({ id: nid(), title: ko[row.nameKey], remaining: "" })),
    ],
    updatedAt: now,
  };
}

function fromDoc(doc: Record<string, unknown>): CmsPage {
  return {
    slug: doc.slug as CmsSlug,
    title: String(doc.title ?? ""),
    lead: String(doc.lead ?? ""),
    body: String(doc.body ?? ""),
    items: Array.isArray(doc.items) ? (doc.items as CmsItem[]) : [],
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt ?? ""),
  };
}

async function readLocal(): Promise<CmsPage[]> {
  return readJsonFile<CmsPage[]>(localFile, []);
}

export async function getCmsPage(slug: CmsSlug): Promise<CmsPage | null> {
  if (hasMongo()) {
    try {
      const db = await getDb();
      if (db) {
        const row = await db.collection("cms").findOne({ slug });
        if (row) return fromDoc(row as Record<string, unknown>);
      }
    } catch (error) {
      console.error("[cms] mongo read failed", error);
    }
  }
  const all = await readLocal();
  return all.find((item) => item.slug === slug) ?? null;
}

export async function getCmsPageOrDefault(slug: CmsSlug): Promise<CmsPage> {
  return (await getCmsPage(slug)) ?? defaultCmsPage(slug);
}

export async function saveCmsPage(input: Omit<CmsPage, "updatedAt"> & { updatedAt?: string }): Promise<CmsPage> {
  const page: CmsPage = {
    slug: input.slug,
    title: input.title.trim(),
    lead: input.lead.trim(),
    body: input.body,
    items: (input.items ?? []).map((item) => ({
      id: item.id || nid(),
      title: item.title.trim(),
      text: item.text ?? "",
      image: item.image ?? "",
      won: item.won,
      remaining: item.remaining,
    })),
    updatedAt: new Date().toISOString(),
  };

  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("cms").updateOne({ slug: page.slug }, { $set: { ...page, updatedAt: new Date(page.updatedAt) } }, { upsert: true });
    return page;
  }

  const all = await readLocal();
  const idx = all.findIndex((item) => item.slug === page.slug);
  if (idx >= 0) all[idx] = page;
  else all.push(page);
  await writeJsonFile(localFile, all);
  return page;
}
