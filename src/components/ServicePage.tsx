import Link from "next/link";
import type { Metadata } from "next";
import { Picture } from "./Picture";
import { MaskReveal } from "./motion";
import { CtaSection, PageHero, ProcessSection, SectionHeading } from "./sections";
import { TechDrawing } from "./drawings/TechDrawing";
import { services, serviceList, type Medium, type ServiceSlug } from "@/content/services";
import { site } from "@/lib/site";

export function serviceMetadata(slug: ServiceSlug): Metadata {
  const s = services[slug];
  return {
    title: s.seoTitle,
    description: s.seoDescription,
    alternates: { canonical: `/${slug}/` },
    openGraph: { title: `${s.seoTitle} | NECKAIR`, description: s.seoDescription },
  };
}

/** Jede Leistungswelt hat ihre eigene Lichtstimmung – gleiche Grammatik, andere Atmosphäre. */
const WORLD: Record<Medium, { tint: string; light: "heat" | "water" | "climate"; ink: string; bar: string }> = {
  heat: { tint: "#ece7e2", light: "heat", ink: "text-heat-ink", bar: "bg-heat" },
  water: { tint: "#e3e9ee", light: "water", ink: "text-water-ink", bar: "bg-water" },
  cold: { tint: "#e2ebed", light: "climate", ink: "text-cold-ink", bar: "bg-cold" },
};

export function ServicePage({ slug }: { slug: ServiceSlug }) {
  const s = services[slug];
  const w = WORLD[s.medium];
  const idx = serviceList.findIndex((x) => x.slug === slug);
  const next = serviceList[(idx + 1) % serviceList.length];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: s.seoTitle,
      description: s.seoDescription,
      provider: { "@type": "HVACBusiness", name: site.name, url: site.url },
      areaServed: site.region,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: s.title,
        itemListElement: s.offers.map((o) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: o.title } })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: s.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div style={{ backgroundColor: w.tint }}>
      <PageHero kicker={s.title} title={s.headline} intro={s.teaser} image={s.hero} imageAlt={s.heroAlt} light={w.light}>
        <div className="hero-fade mt-10 flex flex-wrap gap-3" style={{ animationDelay: "0.8s" }}>
          <Link href="/kontakt/" className="btn btn-light">Beratung anfragen</Link>
          <a href="#aufbau" className="btn btn-outline-light">So funktioniert es</a>
        </div>
      </PageHero>

      {/* Haltung und Detailbild */}
      <section className="py-24 lg:py-32">
        <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <p className="text-[clamp(1.4rem,2.4vw,2rem)] font-medium leading-snug text-navy">{s.intro}</p>
            <ul className="mt-10 space-y-3 border-t border-navy/15 pt-8">
              {s.benefits.map((b) => (
                <li key={b} className="flex items-baseline gap-4 text-muted">
                  <span aria-hidden className={`h-2 w-2 shrink-0 translate-y-[-1px] ${w.bar}`} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <MaskReveal className="plan-frame aspect-[4/5] text-navy/40">
              <Picture name={s.detail} alt={s.detailAlt} sizes="(min-width: 1024px) 40vw, 100vw" />
            </MaskReveal>
          </div>
        </div>
      </section>

      {/* Technische Zeichnung, die sich beim Scrollen zeichnet */}
      <section id="aufbau" aria-labelledby="aufbau-titel" className="pb-24 lg:pb-32">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-12">
            <SectionHeading id="aufbau-titel" title={s.drawingTitle} className="lg:col-span-5" />
            <p className="measure text-lg leading-relaxed text-muted lg:col-span-6 lg:col-start-7 lg:pt-3">{s.drawingText}</p>
          </div>
          <div className="mt-12">
            <TechDrawing medium={s.medium} title={`Schematische Zeichnung: ${s.drawingTitle}`} />
          </div>
        </div>
      </section>

      {/* Leistungen: Überschrift angeheftet, Liste daneben – keine gleichförmigen Karten */}
      <section aria-labelledby="leistungen-titel" className="border-t border-navy/10 bg-white/60 py-24 lg:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <SectionHeading id="leistungen-titel" title="Was wir umsetzen." />
              <Link href="/kontakt/" className="btn btn-primary mt-10">Projekt anfragen</Link>
            </div>
          </div>
          <dl className="grid gap-x-10 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            {s.offers.map((o) => (
              <div key={o.title} className="border-t border-navy/15 py-7">
                <dt className="font-display text-xl font-semibold text-navy [font-stretch:108%]">{o.title}</dt>
                <dd className="mt-2 leading-relaxed text-muted">{o.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Zielgruppen */}
      <section className="py-24 lg:py-28">
        <div className="container-x grid gap-px bg-navy/15 md:grid-cols-2">
          {[
            { label: "Für Privatkunden", text: s.audiences.private },
            { label: "Für Geschäftskunden", text: s.audiences.business },
          ].map((a) => (
            <div key={a.label} style={{ backgroundColor: w.tint }} className="p-8 lg:p-12">
              <h2 className={`text-lg ${w.ink}`}>{a.label}</h2>
              <p className="mt-4 text-xl leading-relaxed text-navy lg:text-2xl">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      <ProcessSection />

      {/* FAQ */}
      <section aria-labelledby="faq-titel" className="py-24 lg:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <SectionHeading id="faq-titel" title="Häufige Fragen." className="lg:col-span-4" />
          <div className="lg:col-span-8">
            {s.faq.map((f) => (
              <details key={f.q} className="faq group border-t border-navy/15 last:border-b [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium text-navy">
                  {f.q}
                  <span className="relative h-4 w-4 shrink-0" aria-hidden>
                    <span className="absolute left-0 top-1/2 h-px w-4 bg-current" />
                    <span className="absolute left-0 top-1/2 h-px w-4 rotate-90 bg-current transition-transform duration-200 ease-[var(--ease-out)] group-open:rotate-0" />
                  </span>
                </summary>
                <p className="measure pb-7 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Nächste Leistungswelt */}
      <Link href={`/${next.slug}/`} className="group relative block overflow-hidden bg-graphite text-on-dark">
        <div className="absolute inset-0 opacity-40 transition-opacity duration-300 group-hover:opacity-55">
          <Picture name={next.hero} alt="" sizes="100vw" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-graphite/90 to-graphite/20" />
        <div className="container-x relative py-20 lg:py-28">
          <p className="text-sm text-on-dark-muted">Nächste Leistung</p>
          <p className="font-display mt-3 text-5xl font-semibold [font-stretch:118%] lg:text-7xl">{next.title}</p>
          <p className="measure mt-3 text-on-dark-muted">{next.teaser}</p>
        </div>
      </Link>

      <CtaSection image={s.detail} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
