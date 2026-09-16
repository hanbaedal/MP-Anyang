import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-primary-foreground/20 bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground sm:px-6">
      <p className="font-serif text-base">{SITE.legalName}</p>
      <p className="mt-1 text-primary-foreground/85">
        방문: {SITE.address} ({SITE.visitName})
        <br />
        {SITE.addressAlt}
        <br />
        전화{" "}
        <a className="underline-offset-4 hover:underline" href={SITE.phoneTel}>
          {SITE.phone}
        </a>
        {" · "}
        {SITE.postalCode}
      </p>
    </footer>
  );
}
