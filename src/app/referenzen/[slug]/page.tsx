import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Picture } from "@/components/Picture";
import { Arrow } from "@/components/Arrow";
import { ExpandSection, MaskReveal, Reveal } from "@/components/motion";
import { CtaSection, PageHero } from "@/components/sections";
import { references } from "@/content/references";
import { serviceList } from "@/content/services";

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
    description: r.text,
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
  const related = serviceList.filter((s) => r.category.includes(s.title));

  return (
    <>
      <PageHero
        eyebrow={`${r.example ? "Demo-Projekt" : "Referenz"} · ${r.category}`}
        title={[r.title]}
        intro={r.text}
        image={r.image}
        imageAlt={r.imageAlt}
        hud={[r.client === "Privat" ? "Privatkunde" : "Geschäftskunde", ...r.services]}
      />

      <section className="bg-paper py-20 lg:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              {r.example && (
                <p className="mb-8 rounded-2xl border border-ember/30 bg-ember/5 p-5 text-sm leading-relaxed text-ember-strong">
                  Dies ist ein Demo-Projekt mit Symbolbild. Es zeigt einen typischen Leistungsumfang und wird durch ein echtes
                  Neckair-Projekt ersetzt.
                </p>
              )}
              <dl className="divide-y divide-navy-900/10 border-y border-navy-900/10">
                <div className="flex justify-between gap-6 py-4">
                  <dt className="hud text-muted">Bereich</dt>
                  <dd className="text-right text-navy-900">{r.category}</dd>
                </div>
                <div className="flex justify-between gap-6 py-4">
                  <dt className="hud text-muted">Kunde</dt>
                  <dd className="text-right text-navy-900">{r.client === "Privat" ? "Privatkunde" : "Geschäftskunde"}</dd>
                </div>
                <div className="py-4">
                  <dt className="hud text-muted">Leistungen</dt>
                  <dd className="mt-3 flex flex-wrap gap-2">
                    {r.services.map((s) => (
                      <span key={s} className="rounded-full border border-navy-900/12 px-3 py-1 text-xs text-navy-900/80">{s}</span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>

          <div className="lg:col-span-7 lg:col-start-6">
            <MaskReveal className="aspect-[4/3] rounded-2xl">
              <Picture name={r.image} alt={r.imageAlt} sizes="(min-width: 1024px) 55vw, 100vw" />
            </MaskReveal>
            <Reveal>
              <h2 className="mt-14 text-3xl font-medium tracking-tight text-navy-900 lg:text-4xl">Aufgabe und Umsetzung</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{r.text}</p>
            </Reveal>
            {related.length > 0 && (
              <Reveal className="mt-12">
                <p className="hud text-muted">Beteiligte Leistungsbereiche</p>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {related.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/${s.slug}/`} className="btn btn-ghost-dark !py-3">
                        {s.title} <Arrow className="arrow" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <ExpandSection className="bg-navy-950 text-paper">
        <Link href={`/referenzen/${next.slug}/`} className="group relative block overflow-hidden">
          <div className="absolute inset-0 opacity-40 transition-opacity duration-300 group-hover:opacity-55">
            <Picture name={next.image} alt="" sizes="100vw" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 to-navy-950/30" />
          <div className="container-x relative flex items-end justify-between gap-6 py-20 lg:py-28">
            <div>
              <p className="hud text-paper/55">Nächstes Projekt · {next.category}</p>
              <p className="mt-4 text-4xl font-medium tracking-tight lg:text-7xl">{next.title}</p>
            </div>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-paper/30 transition-colors duration-200 group-hover:bg-paper group-hover:text-navy-900">
              <Arrow />
            </span>
          </div>
        </Link>
      </ExpandSection>
      <div className="h-16 bg-paper lg:h-24" />
      <CtaSection title={["Ihr Projekt", "könnte das nächste sein."]} image={r.image} />
      <div className="h-16 bg-paper lg:h-24" />
    </>
  );
}
