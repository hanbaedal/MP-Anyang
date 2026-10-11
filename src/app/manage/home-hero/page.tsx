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
        lead="영상(필수)·음악(선택)을 등록한 뒤 MongoDB에 저장합니다. 저장 시 이전 파일은 삭제되고, 음악을 안 올리면 공란입니다. 음악 공란이면 홈에서 「배경음악 재생」으로 영상에 담긴 소리를 켭니다. 별도 음악을 올리면 그 파일이 BGM이 됩니다."
      />
      <ManageHomeHero initial={settings} />
    </>
  );
}
