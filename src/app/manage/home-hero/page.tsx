import { PageHero } from "@/components/page-hero";
import { ManageHomeHero } from "@/components/manage-home-hero";
import { getHomeHeroSettingsForWrite } from "@/lib/home-hero";

export default async function ManageHomeHeroPage() {
  // 관리 화면은 타임아웃 기본값 대신 DB 실데이터를 쓴다
  const settings = await getHomeHeroSettingsForWrite();
  return (
    <>
      <PageHero
        kicker="관리"
        title="메인 영상·음악"
        lead="영상·음악을 최대 8세트까지 등록합니다. 아래 카드에서 세트를 고르면 미리보기가 나오고, 「이 세트 공개」로 홈에 반영됩니다. 음악이 없으면 홈에서 「배경음악 재생」으로 영상 소리를 켭니다."
      />
      <ManageHomeHero initial={settings} />
    </>
  );
}
