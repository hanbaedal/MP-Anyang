import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/media";

export function PageHero({
  kicker,
  title,
  lead,
  image,
}: {
  kicker: string;
  title: string;
  lead?: string;
  image?: { src: string; alt: string };
}) {
  return (
    <section className="relative overflow-hidden border-b bg-primary text-primary-foreground">
      {image ? (
        <Image
          src={mediaUrl(image.src)}
          alt={image.alt}
          fill
          priority
          className="object-cover opacity-35"
          sizes="100vw"
        />
      ) : null}
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        <p className="text-xs tracking-[0.18em] text-primary-foreground/75 uppercase">{kicker}</p>
        <h1 className="mt-2 font-serif text-3xl text-primary-foreground md:text-4xl">{title}</h1>
        {lead ? <p className="mt-4 max-w-2xl text-base text-primary-foreground/90">{lead}</p> : null}
      </div>
    </section>
  );
}

export function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="현재 위치" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap gap-1">
        <li>
          <Link href="/" className="hover:text-primary">
            홈
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex gap-1">
            <span aria-hidden>/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("max-w-3xl space-y-4 text-[15px] leading-7 text-foreground/90", className)}>{children}</div>;
}

export function Photo({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-muted", className)}>
      <Image src={mediaUrl(src)} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority={priority} />
    </div>
  );
}
