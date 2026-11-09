import Link from "next/link";
import type { Metadata } from "next";
import { Picture } from "./Picture";
import { Arrow } from "./Arrow";
import { ExpandSection, MaskReveal, Reveal } from "./motion";
import { CtaSection, PageHero, ProcessSection, SectionIntro } from "./sections";
import { ServiceScene } from "./building/ServiceScene";
import { services, serviceList, type ServiceSlug } from "@/content/services";
import { site } from "@/lib/site";

export function serviceMetadata(slug: ServiceSlug): Metadata {
  const s = services[slug];
  return {
    title: s.seoTitle,
    description: s.seoDescription,
    alternates: { canonical: `/${slug}/` },
    openGraph: { title: `${s.seoTitle} | Neckair`, description: s.seoDescription },
  };
}

const ACCENT_TEXT = { ember: "text-ember-strong", sky: "text-azure-strong", ice: "text-azure-strong", teal: "text-teal-strong" } as const;
const ACCENT_BG = { ember: "bg-ember", sky: "bg-sky", ice: "bg-sky-soft", teal: "bg-teal" } as const;

export function ServicePage({ slug }: { slug: ServiceSlug }) {
  const s = services[slug];
  const accent = ACCENT_TEXT[s.accent];
  const accentBg = ACCENT_BG[s.accent];
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
    <>
      <PageHero
        eyebrow={`${s.index} — ${s.title}`}
        title={s.headline}
        intro={s.teaser}
        image={s.hero}
        imageAlt={s.heroAlt}
        accent={s.accent}
        light={s.light}
        hud={s.offers.slice(0, 4).map((o) => o.title)}
      />

      {/* Einleitung: Haltung + Detailbild, asymmetrisch */}
      <section className="bg-paper py-24 lg:py-36">
        <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <Reveal>
              <p className={`eyebrow ${accent}`}>{s.kicker}</p>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="mt-6 text-[clamp(1.5rem,2.6vw,2.25rem)] font-medium leading-snug tracking-tight text-navy-900">{s.intro}</p>
            </Reveal>
            <ul className="mt-10 space-y-4">
              {s.benefits.map((b, i) => (
                <Reveal as="li" key={b} delay={0.1 + i * 0.05} className="flex items-start gap-4 text-muted">
                  <span className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${accentBg}`} />
                  {b}
                </Reveal>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <MaskReveal className="aspect-[4/5] rounded-2xl">
              <Picture name={s.detail} alt={s.detailAlt} sizes="(min-width: 1024px) 40vw, 100vw" />
            </MaskReveal>
          </div>
        </div>
      </section>

      {/* So wirkt es im Haus – 3D-Gebäudemodell mit Fokus auf dieses System */}
      <section className="bg-paper pb-24 lg:pb-36">
        <div className="container-x">
          <SectionIntro
            eyebrow="Im Gebäude"
            title={[`${s.title} als System,`, "nicht als Einzelteil."]}
            text={
              slug === "lueftung"
                ? "Schalten Sie zwischen Zuluft, Abluft und Wärmerückgewinnung um und sehen Sie, wie die Luft durch das Haus geführt wird."
                : "Jede Komponente hat ihren Platz. Das Modell zeigt, wie die Technik im Haus zusammenspielt."
            }
            className="mb-12"
          />
          <Reveal>
            <ServiceScene system={s.system} interactive={slug === "lueftung"} />
          </Reveal>
        </div>
      </section>

      {/* Leistungen: Überschrift angeheftet, Liste scrollt – statt gleichförmiger Kartenraster */}
      <section className="bg-paper-2 py-24 lg:py-36">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <SectionIntro eyebrow="Leistungsumfang" title={["Was wir für Sie", "umsetzen."]} />
              <Reveal delay={0.1}>
                <Link href="/kontakt/" className="btn btn-dark mt-10">
                  Beratung anfragen <Arrow className="arrow" />
                </Link>
              </Reveal>
            </div>
          </div>
          <ol className="lg:col-span-7 lg:col-start-6">
            {s.offers.map((o, i) => (
              <Reveal
                as="li"
                key={o.title}
                delay={0.04}
                className="group relative grid grid-cols-[3rem_1fr] gap-4 border-t border-navy-900/12 py-8 last:border-b sm:grid-cols-[4rem_1fr]"
              >
                <span
                  aria-hidden
                  className={`absolute left-0 top-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-x-100 ${accentBg}`}
                />
                <span className={`hud pt-2 ${accent}`}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-2xl font-medium tracking-tight text-navy-900">{o.title}</h3>
                  <p className="mt-2 max-w-lg leading-relaxed text-muted">{o.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Zielgruppen */}
      <section className="bg-paper py-24 lg:py-32">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {[
            { label: "Privatkunden", text: s.audiences.private },
            { label: "Geschäftskunden", text: s.audiences.business },
          ].map((a, i) => (
            <Reveal key={a.label} delay={i * 0.06} className="rounded-2xl border border-navy-900/12 p-8 lg:p-12">
              <p className={`eyebrow ${accent}`}>{a.label}</p>
              <p className="mt-6 text-xl leading-relaxed text-navy-900 lg:text-2xl">{a.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <ProcessSection />

      {/* FAQ */}
      <section className="bg-paper py-24 lg:py-36">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro eyebrow="Häufige Fragen" title={["Gut zu", "wissen."]} />
          </div>
          <div className="lg:col-span-8">
            {s.faq.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.04}>
                <details className="faq group border-t border-navy-900/12 last:border-b [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-lg font-medium text-navy-900 lg:text-xl">
                    {f.q}
                    <span className="relative h-4 w-4 shrink-0" aria-hidden>
                      <span className="absolute left-0 top-1/2 h-px w-4 bg-current" />
                      <span className="absolute left-0 top-1/2 h-px w-4 rotate-90 bg-current transition-transform duration-200 ease-[var(--ease-out)] group-open:rotate-0" />
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-8 leading-relaxed text-muted">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Nächste Leistung – wächst beim Hereinscrollen auf volle Breite */}
      <ExpandSection className="bg-navy-950 text-paper">
        <Link href={`/${next.slug}/`} className="group relative block overflow-hidden">
          <div className="absolute inset-0 opacity-45 transition-opacity duration-300 group-hover:opacity-60">
            <div className="h-full w-full transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.03]">
              <Picture name={next.hero} alt="" sizes="100vw" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 to-navy-950/20" />
          <div className="container-x relative flex items-end justify-between gap-6 py-20 lg:py-28">
            <div>
              <p className="hud text-paper/55">Nächste Leistung · {next.index} / 04</p>
              <p className="mt-4 text-5xl font-medium tracking-tight lg:text-8xl">{next.title}</p>
              <p className="mt-3 max-w-md text-paper/60">{next.teaser}</p>
            </div>
            <span className="press flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-paper/30 transition-colors duration-200 group-hover:bg-paper group-hover:text-navy-900">
              <Arrow />
            </span>
          </div>
        </Link>
      </ExpandSection>

      <div className="h-16 bg-paper lg:h-24" />
      <CtaSection image={s.detail} />
      <div className="h-16 bg-paper lg:h-24" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
