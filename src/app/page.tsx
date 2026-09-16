import Link from "next/link";
import { Phone, MapPin, Trees, Landmark, ClipboardList, MessageSquare } from "lucide-react";
import { DirectionsMap } from "@/components/directions-map";
import { GalleryGrid } from "@/components/gallery-grid";
import { Photo } from "@/components/page-hero";
import { SaleSteps } from "@/components/sale-steps";
import { Button } from "@/components/ui/button";
import { FEATURES, SITE } from "@/lib/site";
import { PRODUCT_OVERVIEW } from "@/lib/content";
import { listGallery } from "@/lib/gallery";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export default async function HomePage() {
  const locale = await readLocale();
  const photos = await listGallery();
  return (
    <>
      <section className="relative min-h-[72vh] overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0">
          <Photo src="/images/hero.jpg" alt="(재)안양공원묘원 언덕 묘역 전경" className="h-full rounded-none" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/55 to-primary/20" />
        </div>
        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-4 py-16 md:py-24">
          <p className="text-sm tracking-wide text-primary-foreground/80">{t(locale, "home.kicker")}</p>
          <h1 className="mt-2 max-w-3xl break-keep font-serif text-3xl leading-tight text-primary-foreground md:text-5xl">
            <span className="block">{t(locale, "home.hero1")}</span>
            <span className="mt-1 block">{t(locale, "home.hero2")}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-primary-foreground/90">{t(locale, "home.lead")}</p>
          <p className="mt-2 text-xs text-primary-foreground/75">
            {t(locale, "hoursNote")}: {t(locale, "hoursWeekday")} · {t(locale, "hoursWeekend")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <a href={SITE.phoneTel}>
                <Phone />
                {SITE.phone}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-primary/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Link href="/intro/directions">
                <MapPin />
                {t(locale, "home.map")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 py-6 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { href: SITE.phoneTel, label: t(locale, "home.call"), icon: Phone, external: true },
            { href: "/intro/directions", label: t(locale, "nav.directions"), icon: MapPin },
            { href: "/lots/prices", label: t(locale, "nav.prices"), icon: Landmark },
            { href: "/guide/fees", label: t(locale, "nav.fees"), icon: ClipboardList },
            { href: "/support/inquiry", label: t(locale, "nav.inquiry"), icon: MessageSquare },
          ].map((item) => {
            const Icon = item.icon;
            const className =
              "flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm font-medium text-primary hover:bg-accent";
            return item.external ? (
              <a key={item.label} href={item.href} className={className}>
                <Icon className="size-4" />
                {item.label}
              </a>
            ) : (
              <Link key={item.label} href={item.href} className={className}>
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-serif text-2xl md:text-3xl">{t(locale, "home.features")}</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <li key={feature.titleKey} className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg">
                <Trees className="size-4 text-ring" />
                {t(locale, feature.titleKey)}
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{t(locale, feature.bodyKey)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-card py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl">{t(locale, "home.products")}</h2>
              <p className="mt-2 text-muted-foreground">{t(locale, "home.productsLead")}</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/lots/burial">{t(locale, "home.moreProducts")}</Link>
            </Button>
          </div>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {PRODUCT_OVERVIEW.map((product) => (
              <li key={product.href}>
                <Link href={product.href} className="group block overflow-hidden rounded-xl border bg-background shadow-sm">
                  <Photo src={product.image} alt={t(locale, product.titleKey)} className="aspect-[4/3] rounded-none" />
                  <div className="p-4">
                    <h3 className="text-lg group-hover:underline">{t(locale, product.titleKey)}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t(locale, product.summaryKey)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-serif text-2xl md:text-3xl">{t(locale, "home.procedure")}</h2>
        <p className="mt-2 text-muted-foreground">{t(locale, "home.procedureLead")}</p>
        <div className="mt-8">
          <SaleSteps compact />
        </div>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/guide/procedure">{t(locale, "home.procedureMore")}</Link>
        </Button>
      </section>

      <section className="bg-card py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-serif text-2xl md:text-3xl">{t(locale, "home.gallery")}</h2>
            <Button asChild variant="outline">
              <Link href="/gallery">{t(locale, "home.galleryMore")}</Link>
            </Button>
          </div>
          <div className="mt-8">
            <GalleryGrid preview={6} items={photos} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-serif text-2xl md:text-3xl">{t(locale, "home.map")}</h2>
        <p className="mt-2 text-muted-foreground">{t(locale, "home.mapLead")}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t(locale, "hoursNote")}: {t(locale, "hoursWeekday")} · {t(locale, "hoursWeekend")}
        </p>
        <div className="mt-8">
          <DirectionsMap compact />
        </div>
      </section>
    </>
  );
}
