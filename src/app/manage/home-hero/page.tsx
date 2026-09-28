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
        lead="계절별 영상·음악 라이브러리에서 공개 조합을 고릅니다. 메인은 접속 시 무음 영상이 자동 재생되고, BGM은 방문자가 켭니다."
      />
      <ManageHomeHero initial={settings} />
    </>
  );
}
