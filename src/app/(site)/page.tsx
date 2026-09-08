import { Suspense } from "react";
import { IntroGate } from "../../components/IntroGate";
import { t } from "../../lib/i18n-messages";
import { getLocale } from "../../lib/locale";
import { SITE } from "../../lib/site";

async function HomeContent() {
  const locale = await getLocale();
  return (
    <IntroGate>
      <div className="home-view">
        <section className="home-hero" style={{ backgroundImage: "url(/images/park-panorama.png)" }}>
          <div className="home-hero-copy">
            <p>{SITE.englishName}</p>
            <h1>{t(locale, "home.heroTitle")}</h1>
          </div>
        </section>
      </div>
    </IntroGate>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
