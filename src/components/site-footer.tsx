import { SocialActions } from "@/components/hero-actions";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-primary-foreground/20 bg-primary text-sm leading-6 text-primary-foreground">
      <div className="flex flex-col items-center gap-3 px-4 py-3 text-center sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:pl-36 lg:pr-6 lg:text-left">
        <div className="min-w-0">
          <p className="font-serif text-base">{SITE.legalName}</p>
          <p className="mt-1 text-primary-foreground/85">
            {SITE.address}
            <br />
            전화{" "}
            <a className="underline-offset-4 hover:underline" href={SITE.phoneTel}>
              {SITE.phone}
            </a>
            {" · "}
            {SITE.postalCode}
          </p>
        </div>
        <div className="flex shrink-0 justify-center lg:justify-end">
          <SocialActions />
        </div>
      </div>
    </footer>
  );
}
