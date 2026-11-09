import type { Metadata } from "next";
import { Picture } from "@/components/Picture";
import { ReferenceGrid } from "@/components/ReferenceGrid";
import { CtaSection, PageHero } from "@/components/sections";
import { references } from "@/content/references";

export const metadata: Metadata = {
  title: "Referenzen",
  description: "Projekte von NECKAIR aus Heizung, Sanitär & Trinkwasser sowie Klima & Kälte – für Privat- und Geschäftskunden.",
  alternates: { canonical: "/referenzen/" },
};

export default function ReferenzenPage() {
  const hasExamples = references.some((r) => r.example);
  return (
    <>
      <PageHero
        kicker="Referenzen"
        title="Jedes Projekt erzählt eine Geschichte."
        intro="Ausgangslage, Herausforderung, Lösung, Ergebnis – so zeigen wir, wie wir arbeiten."
        image="villa-pforzheim"
        imageAlt="Moderne weiße Villa mit auskragendem Obergeschoss"
        light="home"
        compact
      />
      <section className="bg-kalk pb-32 pt-16 lg:pt-24">
        <div className="container-x">
          {hasExamples ? (
            <p className="measure mb-12 border-l-2 border-heat bg-white px-5 py-4 text-sm leading-relaxed text-muted">
              Hinweis: Alle Einträge sind derzeit Demo-Projekte mit Symbolbildern und beispielhaften Texten. Sie zeigen typische
              Leistungsumfänge und werden durch echte NECKAIR-Projekte ersetzt.
            </p>
          ) : null}
          <ReferenceGrid
            items={references.map((r) => ({
              slug: r.slug,
              title: r.title,
              type: r.type,
              trades: r.trades,
              summary: r.summary,
              example: r.example,
              media: <Picture name={r.image} alt={r.imageAlt} sizes="(min-width: 768px) 46vw, 100vw" />,
            }))}
          />
        </div>
      </section>
      <CtaSection title="Ihr Projekt könnte das nächste sein." image="haus-daemmerung" />
    </>
  );
}
