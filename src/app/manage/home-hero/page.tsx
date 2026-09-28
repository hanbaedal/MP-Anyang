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
        lead="메인 화면 배경 영상과 BGM을 올리거나 목록에서 골라 공개합니다. 방문자는 재생 버튼을 눌러야 소리·영상이 함께 나옵니다."
      />
      <ManageHomeHero initial={settings} />
    </>
  );
}
