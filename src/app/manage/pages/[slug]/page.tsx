import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { CmsEditor } from "@/components/cms-editor";
import { CMS_SLUGS, getCmsPageOrDefault, isCmsSlug } from "@/lib/cms";

export default async function ManageCmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isCmsSlug(slug)) notFound();
  const meta = CMS_SLUGS.find((item) => item.slug === slug)!;
  const page = await getCmsPageOrDefault(slug);
  return (
    <>
      <PageHero
        kicker="관리"
        title={meta.label}
        lead={
          ["burial", "lawn", "columbarium", "remodeling"].includes(slug)
            ? "갤러리와 같이 사진을 올리고, 3열 격자에서 제목·설명을 수정합니다. 저장하면 공개 페이지에 바로 반영됩니다."
            : "저장하면 공개 페이지에 바로 반영됩니다. 분양가 원을 비우면 ‘확인 필요’로 보입니다."
        }
      />
      <CmsEditor initial={page} />
    </>
  );
}
