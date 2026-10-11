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
        lead="영상·음악을 등록한 뒤 MongoDB에 저장합니다. 각각 1개만 유지되며, 새로 저장하면 이전 파일이 교체됩니다. 메인은 무음 영상 자동 재생, BGM은 방문자가 켭니다."
      />
      <ManageHomeHero initial={settings} />
    </>
  );
}
