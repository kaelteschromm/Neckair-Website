import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Picture } from "@/components/Picture";
import { MaskReveal } from "@/components/motion";
import { CtaSection, PageHero } from "@/components/sections";
import { references } from "@/content/references";
import { services } from "@/content/services";

export const dynamicParams = false;

export function generateStaticParams() {
  return references.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = references.find((x) => x.slug === slug);
  if (!r) return {};
  return {
    title: `${r.title} – Referenz`,
    description: r.summary,
    alternates: { canonical: `/referenzen/${r.slug}/` },
    // Demo-Projekte nicht indexieren, solange sie keine echten Referenzen sind
    robots: r.example ? { index: false, follow: true } : undefined,
  };
}

export default async function ReferenzDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idx = references.findIndex((x) => x.slug === slug);
  if (idx < 0) notFound();
  const r = references[idx];
  const next = references[(idx + 1) % references.length];
  const story = [
    { title: "Ausgangssituation", text: r.situation },
    { title: "Herausforderung", text: r.challenge },
    { title: "Technische Lösung", text: r.solution },
    { title: "Ergebnis", text: r.result },
  ];

  return (
    <>
      <PageHero kicker={r.example ? `Demo-Projekt – ${r.type}` : r.type} title={r.title} intro={r.summary} image={r.image} imageAlt={r.imageAlt} compact />

      <section className="bg-kalk py-20 lg:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              {r.example ? (
                <p className="mb-8 border-l-2 border-heat bg-white p-5 text-sm leading-relaxed text-heat-ink">
                  Dies ist ein Demo-Projekt mit Symbolbild und beispielhaftem Text – kein realer Auftrag. Es wird durch ein echtes
                  NECKAIR-Projekt ersetzt.
                </p>
              ) : null}
              <dl className="divide-y divide-navy/10 border-y border-navy/10">
                <div className="flex justify-between gap-6 py-4">
                  <dt className="text-sm text-muted">Projektart</dt>
                  <dd className="text-right text-navy">{r.type}</dd>
                </div>
                <div className="flex justify-between gap-6 py-4">
                  <dt className="text-sm text-muted">Kunde</dt>
                  <dd className="text-right text-navy">{r.client === "Privat" ? "Privatkunde" : "Geschäftskunde"}</dd>
                </div>
                <div className="py-4">
                  <dt className="text-sm text-muted">Gewerke</dt>
                  <dd className="mt-3 flex flex-wrap gap-2">
                    {r.trades.map((t) => (
                      <Link key={t} href={`/${t}/`} className="link text-navy">
                        {services[t].title}
                      </Link>
                    ))}
                  </dd>
                </div>
                <div className="py-4">
                  <dt className="text-sm text-muted">Leistungen</dt>
                  <dd className="mt-2 text-navy">{r.services.join(", ")}</dd>
                </div>
              </dl>
            </div>
          </aside>

          <div className="lg:col-span-7 lg:col-start-6">
            <MaskReveal className="plan-frame aspect-[4/3] text-navy/40">
              <Picture name={r.image} alt={r.imageAlt} sizes="(min-width: 1024px) 55vw, 100vw" />
            </MaskReveal>
            <ol className="mt-16 space-y-12">
              {story.map((s, i) => (
                <li key={s.title} className="grid gap-3 border-t border-navy/15 pt-6 sm:grid-cols-[10rem_1fr]">
                  <h2 className="font-sans text-sm font-semibold text-muted [font-stretch:100%]">
                    {i + 1}. {s.title}
                  </h2>
                  <p className="text-xl leading-relaxed text-navy">{s.text}</p>
                </li>
              ))}
            </ol>
            <div className="mt-16 grid grid-cols-2 gap-4" aria-label="Bildergalerie">
              {[0, 1].map((i) => (
                <div key={i} className="flex aspect-[4/3] items-center justify-center border border-dashed border-navy/30 bg-white/60 p-4 text-center text-sm text-muted">
                  Projektfoto folgt
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Link href={`/referenzen/${next.slug}/`} className="group relative block overflow-hidden bg-graphite text-on-dark">
        <div className="absolute inset-0 opacity-40 transition-opacity duration-300 group-hover:opacity-55">
          <Picture name={next.image} alt="" sizes="100vw" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-graphite/90 to-graphite/30" />
        <div className="container-x relative py-20 lg:py-28">
          <p className="text-sm text-on-dark-muted">Nächstes Projekt</p>
          <p className="font-display mt-3 text-4xl font-semibold [font-stretch:118%] lg:text-6xl">{next.title}</p>
        </div>
      </Link>
      <CtaSection title="Ihr Projekt könnte das nächste sein." image={r.image} />
    </>
  );
}
