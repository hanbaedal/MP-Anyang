import Link from "next/link";
import { Phone, MapPin, Trees, Landmark, Hammer, ClipboardList } from "lucide-react";
import { DirectionsMap } from "@/components/directions-map";
import { GalleryGrid } from "@/components/gallery-grid";
import { Photo } from "@/components/page-hero";
import { SaleSteps } from "@/components/sale-steps";
import { Button } from "@/components/ui/button";
import { FEATURES, SITE } from "@/lib/site";
import { PRODUCT_OVERVIEW } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[72vh] overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0">
          <Photo src="/images/hero.jpg" alt="(재)안양공원묘원 언덕 묘역 전경" className="h-full rounded-none" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/55 to-primary/20" />
        </div>
        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-4 py-16 md:py-24">
          <p className="text-sm tracking-wide text-primary-foreground/80">{SITE.region}</p>
          <h1 className="mt-2 max-w-3xl font-serif text-3xl leading-tight text-primary-foreground md:text-5xl">
            {SITE.heroLine}
          </h1>
          <p className="mt-4 max-w-xl text-base text-primary-foreground/90">
            매장·평장·봉안과 이미 모신 자리의 관리까지, 전화 한 통과 방문으로 안내합니다.
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
                오시는 길
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl gap-3 px-4 py-6 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { href: SITE.phoneTel, label: "전화 상담", icon: Phone, external: true },
            { href: "/intro/directions", label: "오시는 길", icon: MapPin },
            { href: "/lots/burial", label: "분양 상품", icon: Landmark },
            { href: "/guide/fees", label: "관리비", icon: ClipboardList },
            { href: "/guide/funeral", label: "장례·개장", icon: Hammer },
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
        <h2 className="font-serif text-2xl md:text-3xl">공원의 네 가지</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          서울에서 약 30분, 안산IC에서 3분. 이미 모신 가족과 새로 자리를 찾는 분 모두 쓰시는 공원입니다.
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg">
                <Trees className="size-4 text-ring" />
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{feature.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-card py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl">분양 상품</h2>
              <p className="mt-2 text-muted-foreground">금액은 사이트에 올리지 않습니다. 위수와 형태만 안내합니다.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/lots/burial">상품 더 보기</Link>
            </Button>
          </div>
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {PRODUCT_OVERVIEW.map((product) => (
              <li key={product.title}>
                <Link href={product.href} className="group block overflow-hidden rounded-xl border bg-background shadow-sm">
                  <Photo src={product.image} alt={product.title} className="aspect-[4/3] rounded-none" />
                  <div className="p-4">
                    <h3 className="text-lg group-hover:underline">{product.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{product.summary}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm">
            이미 쓰시는 묘는{" "}
            <Link href="/lots/remodeling" className="font-medium text-primary underline-offset-4 hover:underline">
              리모델링
            </Link>
            으로 가족묘로 다듬을 수 있습니다. 신규 분양과 견주면 비용이 낮은 경우가 많습니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-serif text-2xl md:text-3xl">분양 절차</h2>
        <p className="mt-2 text-muted-foreground">계약서가 아니라 청약서입니다. 비율·계약금 문구는 쓰지 않습니다.</p>
        <div className="mt-8">
          <SaleSteps compact />
        </div>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/guide/procedure">절차 자세히</Link>
        </Button>
      </section>

      <section className="bg-card py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-serif text-2xl md:text-3xl">둘러보기</h2>
            <Button asChild variant="outline">
              <Link href="/gallery">갤러리</Link>
            </Button>
          </div>
          <div className="mt-8">
            <GalleryGrid preview={6} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-serif text-2xl md:text-3xl">오시는 길</h2>
        <p className="mt-2 text-muted-foreground">길찾기를 먼저 쓰시고, 버스·택시는 그다음입니다.</p>
        <div className="mt-8">
          <DirectionsMap compact />
        </div>
      </section>
    </>
  );
}
