import { Photo } from "@/components/page-hero";
import { HeroActions } from "@/components/hero-actions";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export default async function HomePage() {
  const locale = await readLocale();
  return (
    <section className="relative h-full min-h-full overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0">
        <Photo src="/images/hero.jpg" alt="(재)안양공원묘원 언덕 묘역 전경" className="h-full rounded-none" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
      </div>
      <div className="relative flex h-full min-h-full flex-col justify-end px-4 pb-[4.75rem] pt-8 sm:px-6 sm:pb-7 md:px-10 md:pb-8">
        <div className="max-w-2xl sm:pr-56">
          <p className="text-sm tracking-wide text-primary-foreground/85">{t(locale, "home.kicker")}</p>
          <h1 className="mt-2 break-keep font-serif text-3xl leading-tight text-primary-foreground md:text-5xl">
            <span className="block">{t(locale, "home.hero1")}</span>
            <span className="mt-1 block">{t(locale, "home.hero2")}</span>
          </h1>
          <p className="mt-4 max-w-xl break-keep text-base text-primary-foreground/92 md:text-lg">{t(locale, "home.lead")}</p>
        </div>
        <div className="absolute bottom-5 right-4 sm:bottom-7 sm:right-6 md:bottom-8 md:right-10">
          <HeroActions />
        </div>
      </div>
    </section>
  );
}
