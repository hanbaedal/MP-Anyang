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
        lead="계절별 영상·음악을 DB 라이브러리에 쌓아 두고, 공개에 쓸 항목만 골라 바꿉니다. 방문자는 재생 버튼을 눌러야 영상·BGM이 함께 나옵니다."
      />
      <ManageHomeHero initial={settings} />
    </>
  );
}
