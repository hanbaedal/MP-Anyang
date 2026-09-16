import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { SITE, socialHref } from "@/lib/site";
import { cn } from "@/lib/utils";

const logoBtn =
  "inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/10 transition hover:scale-[1.04] hover:bg-white";

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.5 20v-6.2h2.08l.31-2.4H13.5V9.86c0-.7.19-1.17 1.2-1.17h1.28V6.54c-.22-.03-.98-.1-1.86-.1-1.84 0-3.1 1.12-3.1 3.18v1.78H8.7v2.4h2.32V20h2.48z"
      />
    </svg>
  );
}

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <defs>
        <radialGradient id="ig" cx="30%" cy="110%" r="120%">
          <stop offset="0%" stopColor="#f58529" />
          <stop offset="45%" stopColor="#dd2a7b" />
          <stop offset="100%" stopColor="#515bd4" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig)" />
      <rect x="5.2" y="5.2" width="13.6" height="13.6" rx="4" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" strokeWidth="1.7" />
      <circle cx="16.4" cy="7.6" r="1" fill="#fff" />
    </svg>
  );
}

function YoutubeMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <rect width="24" height="24" rx="6" fill="#FF0000" />
      <path fill="#fff" d="M10 8.2v7.6L16.5 12 10 8.2z" />
    </svg>
  );
}

function NaverCafeMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
      <rect width="24" height="24" rx="6" fill="#03C75A" />
      <path
        fill="#fff"
        d="M6.6 9h8.6c.5 0 .9.4.9.9v4.5c0 2.1-1.8 3.7-4 3.7H9.7c-2.2 0-4-1.6-4-3.7V9.9c0-.5.4-.9.9-.9z"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
        d="M16.1 10.3h1.6c1.2 0 2.1.9 2.1 2s-.9 2-2.1 2h-1.6"
      />
      <path fill="#fff" d="M7 18.6h10c.3 0 .5.3.4.6-.3.6-1.4 1.1-3.4 1.1H10c-2 0-3.1-.5-3.4-1.1-.1-.3.1-.6.4-.6z" />
    </svg>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http") || href.startsWith("tel:");
  if (external) {
    return (
      <a
        href={href}
        aria-label={label}
        title={label}
        className={cn(logoBtn)}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} aria-label={label} title={label} className={cn(logoBtn)}>
      {children}
    </Link>
  );
}

export function SocialActions() {
  const items = [
    { href: socialHref("FACEBOOK", SITE.phoneTel), label: "전화 상담", icon: <FacebookMark /> },
    { href: socialHref("INSTAGRAM", "/intro/directions"), label: "오시는 길", icon: <InstagramMark /> },
    { href: socialHref("YOUTUBE", "/lots/prices"), label: "분양가·잔여", icon: <YoutubeMark /> },
    { href: socialHref("CAFE", "/guide/fees"), label: "관리비", icon: <NaverCafeMark /> },
  ];

  return (
    <nav aria-label="소셜 바로 가기" className="flex shrink-0 items-center gap-2 sm:gap-2.5">
      {items.map((item) => (
        <SocialLink key={item.label} href={item.href} label={item.label}>
          {item.icon}
        </SocialLink>
      ))}
    </nav>
  );
}

export function HeroCallActions() {
  return (
    <nav aria-label="바로 가기" className="flex flex-wrap justify-center gap-2 sm:gap-3 md:justify-end">
      <a
        href={SITE.phoneTel}
        className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-[#dce8e0] sm:px-5"
      >
        <Phone className="size-4" aria-hidden />
        {SITE.phone}
      </a>
      <Link
        href="/intro/directions"
        className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-white hover:text-primary sm:px-5"
      >
        <MapPin className="size-4" aria-hidden />
        오시는 길
      </Link>
    </nav>
  );
}
