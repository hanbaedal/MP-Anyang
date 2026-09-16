import Link from "next/link";
import { SITE, siteUrl } from "@/lib/site";

export function SiteFooter() {
  const url = siteUrl();

  return (
    <footer className="mt-auto border-t bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-xl">{SITE.legalName}</p>
          <p className="mt-3 text-sm/6 text-primary-foreground/80">
            {SITE.address}
            <br />
            전화{" "}
            <a className="underline-offset-4 hover:underline" href={SITE.phoneTel}>
              {SITE.phone}
            </a>
            {SITE.postalCode ? ` · 우편번호 ${SITE.postalCode}` : null}
          </p>
          {url ? (
            <p className="mt-3 text-sm text-primary-foreground/80">
              공식 사이트{" "}
              <a className="underline-offset-4 hover:underline" href={url}>
                {url.replace(/^https?:\/\//, "")}
              </a>
            </p>
          ) : (
            <p className="mt-3 text-sm text-primary-foreground/70">
              새 공식 주소는 정해지는 대로 공지로 안내합니다.
            </p>
          )}
        </div>
        <div className="text-sm">
          <p className="mb-2 font-medium">바로 가기</p>
          <ul className="space-y-1 text-primary-foreground/80">
            <li>
              <Link className="hover:underline" href="/lots/burial">
                분양 상품
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/guide/procedure">
                분양 절차
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/guide/fees">
                관리비
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/support/inquiry">
                문의·상담
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-medium">안내</p>
          <ul className="space-y-1 text-primary-foreground/80">
            <li>
              <Link className="hover:underline" href="/privacy">
                개인정보처리방침
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/support/notices">
                공지사항
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/intro/directions">
                오시는 길
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
