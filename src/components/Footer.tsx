import Link from "next/link";
import { Logo } from "./Logo";
import { site } from "@/lib/site";
import { serviceList } from "@/content/services";

export function Footer() {
  return (
    <footer className="bg-graphite text-on-dark">
      <div className="brand-stripe flex h-1" aria-hidden>
        <span className="flex-1 bg-heat" />
        <span className="flex-1 bg-water" />
        <span className="flex-1 bg-cold" />
      </div>
      <div className="container-x grid gap-14 py-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo tone="light" className="h-8 w-auto" />
          <p className="measure mt-8 text-on-dark-muted">
            Heizung, Sanitär & Trinkwasser sowie Klima & Kälte für Privat- und Geschäftskunden. Handwerk mit Ingenieursblick.
          </p>
          <address className="mt-8 space-y-1 text-sm not-italic">
            <p>{site.name}</p>
            <p>{site.street}</p>
            <p>
              {site.zip} {site.city}
            </p>
          </address>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
          <div>
            <h2 className="font-sans text-sm font-semibold text-on-dark-muted [font-stretch:100%]">Leistungen</h2>
            <ul className="mt-5 space-y-3">
              {serviceList.map((s) => (
                <li key={s.slug}>
                  <Link href={`/${s.slug}/`} className="link">{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-sans text-sm font-semibold text-on-dark-muted [font-stretch:100%]">NECKAIR</h2>
            <ul className="mt-5 space-y-3">
              <li><Link href="/referenzen/" className="link">Referenzen</Link></li>
              <li><Link href="/unternehmen/" className="link">Unternehmen</Link></li>
              <li><Link href="/kontakt/" className="link">Kontakt</Link></li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h2 className="font-sans text-sm font-semibold text-on-dark-muted [font-stretch:100%]">Kontakt</h2>
            <ul className="mt-5 space-y-3">
              <li><a href={`tel:${site.phoneHref}`} className="link">{site.phone}</a></li>
              <li><a href={`mailto:${site.email}`} className="link break-all">{site.email}</a></li>
              <li className="text-sm text-on-dark-muted">{site.hours}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-on-dark/10">
        <div className="container-x flex flex-col gap-4 py-8 text-sm text-on-dark-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li><Link href="/impressum/" className="link">Impressum</Link></li>
            <li><Link href="/datenschutz/" className="link">Datenschutz</Link></li>
            <li><Link href="/agb/" className="link">AGB</Link></li>
            <li><Link href="/nutzungsbedingungen/" className="link">Nutzungsbedingungen</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
