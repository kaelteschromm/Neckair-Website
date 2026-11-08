import Link from "next/link";
import type { Metadata } from "next";
import { Picture } from "./Picture";
import { Arrow } from "./Arrow";
import { MaskReveal, Reveal } from "./motion";
import { CtaSection, PageHero, ProcessSection, SectionIntro } from "./sections";
import { services, serviceList, type ServiceSlug } from "@/content/services";

export function serviceMetadata(slug: ServiceSlug): Metadata {
  const s = services[slug];
  return {
    title: s.seoTitle,
    description: s.seoDescription,
    alternates: { canonical: `/${slug}/` },
    openGraph: { title: `${s.seoTitle} | Neckair`, description: s.seoDescription },
  };
}

export function ServicePage({ slug }: { slug: ServiceSlug }) {
  const s = services[slug];
  const accent = s.tone === "warm" ? "text-ember-strong" : "text-azure-strong";
  const accentBg = s.tone === "warm" ? "bg-ember" : "bg-azure";
  const idx = serviceList.findIndex((x) => x.slug === slug);
  const next = serviceList[(idx + 1) % serviceList.length];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: s.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <PageHero
        eyebrow={`${s.index} — ${s.title}`}
        title={s.headline}
        intro={s.teaser}
        image={s.hero}
        imageAlt={s.heroAlt}
        tone={s.tone}
      />

      {/* Einleitung */}
      <section className="bg-paper py-24 lg:py-36">
        <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <Reveal>
              <p className={`eyebrow ${accent}`}>{s.kicker}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-6 text-[clamp(1.5rem,2.6vw,2.25rem)] font-medium leading-snug tracking-tight text-navy-900">{s.intro}</p>
            </Reveal>
            <ul className="mt-10 space-y-4">
              {s.benefits.map((b, i) => (
                <Reveal as="li" key={b} delay={0.15 + i * 0.07} className="flex items-start gap-4 text-muted">
                  <span className={`mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full ${accentBg}`} />
                  {b}
                </Reveal>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6">
            <MaskReveal className="aspect-[4/5] rounded-sm lg:aspect-[5/6]">
              <Picture name={s.detail} alt={s.detailAlt} sizes="(min-width: 1024px) 45vw, 100vw" />
            </MaskReveal>
          </div>
        </div>
      </section>

      {/* Leistungen */}
      <section className="bg-paper-2 py-24 lg:py-36">
        <div className="container-x">
          <SectionIntro eyebrow="Leistungsumfang" title={["Was wir für Sie", "umsetzen."]} className="mb-16" />
          <ul className="grid border-t border-navy-900/12 sm:grid-cols-2 lg:grid-cols-3">
            {s.offers.map((o, i) => (
              <Reveal
                as="li"
                key={o.title}
                delay={(i % 3) * 0.08}
                className="group relative border-b border-navy-900/12 py-10 sm:px-6 sm:[&:nth-child(odd)]:border-r lg:[&:nth-child(odd)]:border-r-0 lg:[&:not(:nth-child(3n))]:border-r"
              >
                <span
                  aria-hidden
                  className={`absolute left-0 top-0 h-px w-full origin-left scale-x-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100 ${accentBg}`}
                />
                <span className={`text-xs font-semibold tracking-[0.2em] ${accent}`}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 text-2xl font-medium tracking-tight text-navy-900 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
                  {o.title}
                </h3>
                <p className="mt-3 max-w-sm leading-relaxed text-muted">{o.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Zielgruppen */}
      <section className="bg-paper py-24 lg:py-32">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {[
            { label: "Privatkunden", text: s.audiences.private },
            { label: "Geschäftskunden", text: s.audiences.business },
          ].map((a, i) => (
            <Reveal key={a.label} delay={i * 0.1} className="rounded-sm border border-navy-900/12 p-8 lg:p-12">
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
              <Reveal key={f.q} delay={i * 0.06}>
                <details className="group border-t border-navy-900/12 last:border-b [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-lg font-medium text-navy-900 lg:text-xl">
                    {f.q}
                    <span className="relative h-4 w-4 shrink-0" aria-hidden>
                      <span className="absolute left-0 top-1/2 h-px w-4 bg-current" />
                      <span className="absolute left-0 top-1/2 h-px w-4 rotate-90 bg-current transition-transform duration-500 group-open:rotate-0" />
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-8 leading-relaxed text-muted">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Nächste Leistung */}
      <section className="bg-paper pb-10">
        <div className="container-x">
          <Link href={`/${next.slug}/`} className="group relative block overflow-hidden rounded-sm bg-navy-950 text-paper">
            <div className="absolute inset-0 opacity-40 transition-[opacity,transform] duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.03] group-hover:opacity-60">
              <Picture name={next.hero} alt="" sizes="100vw" />
            </div>
            <div className="relative flex items-end justify-between gap-6 px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
              <div>
                <p className="eyebrow text-paper/60">Nächste Leistung · {next.index}</p>
                <p className="mt-4 text-5xl font-medium tracking-tight lg:text-7xl">{next.title}</p>
              </div>
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-paper/30 transition-colors duration-500 group-hover:bg-paper group-hover:text-navy-900">
                <Arrow />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <div className="h-6 bg-paper" />
      <CtaSection image={s.hero} />
      <div className="h-16 bg-paper lg:h-24" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </>
  );
}
