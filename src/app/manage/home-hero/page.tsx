import { PageHero } from "@/components/page-hero";
import { ManageHomeHero } from "@/components/manage-home-hero";
import { getHomeHeroSettings } from "@/lib/home-hero";

export default async function ManageHomeHeroPage() {
  const settings = await getHomeHeroSettings();
  return (
    <>
      <PageHero
        kicker="관리"
        title="메인 영상·음악"
        lead="영상(필수)·음악(선택)을 등록한 뒤 MongoDB에 저장합니다. 저장 시 이전 영상·음악은 삭제되고, 음악을 안 올리면 음악은 공란입니다. 메인은 무음 영상 자동 재생이며, 별도 음악이 있을 때만 BGM 버튼이 나옵니다."
      />
      <ManageHomeHero initial={settings} />
    </>
  );
}
