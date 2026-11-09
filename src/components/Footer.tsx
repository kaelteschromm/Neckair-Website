import Link from "next/link";
import { Logo } from "./Logo";
import { nav, site } from "@/lib/site";
import { serviceList } from "@/content/services";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy-950 text-paper">
      <div className="brand-line" />
      <div className="container-x grid gap-14 py-20 md:grid-cols-12 lg:py-28">
        <div className="md:col-span-5">
          <Logo tone="light" className="h-8 w-auto" />
          <p className="mt-8 max-w-sm text-paper/60">
            Heizung, Sanitär, Klima und Lüftung für Privat- und Geschäftskunden. Geplant mit Präzision, installiert mit Sorgfalt.
          </p>
          <address className="mt-8 space-y-1 text-sm not-italic text-paper/80">
            <p>{site.name}</p>
            <p>{site.street}</p>
            <p>{site.zip} {site.city}</p>
          </address>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
          <div>
            <h2 className="eyebrow text-paper/45">Leistungen</h2>
            <ul className="mt-6 space-y-3">
              {serviceList.map((s) => (
                <li key={s.slug}>
                  <Link href={`/${s.slug}/`} className="link-underline text-paper/85 hover:text-paper">{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="eyebrow text-paper/45">Neckair</h2>
            <ul className="mt-6 space-y-3">
              {nav.slice(4).map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="link-underline text-paper/85 hover:text-paper">{n.label}</Link>
                </li>
              ))}
              <li><Link href="/kontakt/" className="link-underline text-paper/85 hover:text-paper">Kontakt</Link></li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h2 className="eyebrow text-paper/45">Kontakt</h2>
            <ul className="mt-6 space-y-3 text-paper/85">
              <li><a href={`tel:${site.phoneHref}`} className="link-underline">{site.phone}</a></li>
              <li><a href={`mailto:${site.email}`} className="link-underline break-all">{site.email}</a></li>
              <li className="text-sm text-paper/55">{site.hours}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container-x relative">
        <p aria-hidden className="display pointer-events-none select-none whitespace-nowrap text-[22vw] leading-[0.8] text-paper/[0.04] lg:text-[17rem]">
          Neckair
        </p>
      </div>

      <div className="border-t border-paper/10">
        <div className="container-x flex flex-col gap-4 py-8 text-sm text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li><Link href="/impressum/" className="hover:text-paper">Impressum</Link></li>
            <li><Link href="/datenschutz/" className="hover:text-paper">Datenschutz</Link></li>
            <li><Link href="/agb/" className="hover:text-paper">AGB</Link></li>
            <li><Link href="/nutzungsbedingungen/" className="hover:text-paper">Nutzungsbedingungen</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
