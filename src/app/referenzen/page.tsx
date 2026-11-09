import type { Metadata } from "next";
import { Picture } from "@/components/Picture";
import { ReferenceGrid } from "@/components/ReferenceGrid";
import { CtaSection, PageHero } from "@/components/sections";
import { Reveal } from "@/components/motion";
import { references } from "@/content/references";

export const metadata: Metadata = {
  title: "Referenzen",
  description: "Ausgewählte Projekte von Neckair aus Heizung, Sanitär, Klima und Lüftung – für Privat- und Geschäftskunden.",
  alternates: { canonical: "/referenzen/" },
};

export default function ReferenzenPage() {
  const hasExamples = references.some((r) => r.example);
  return (
    <>
      <PageHero
        eyebrow="Referenzen"
        title={["Arbeit, die man", "sehen kann."]}
        intro="Jedes Gebäude ist anders. Hier zeigen wir, wie wir Wärme, Wasser, Klima und Luft in unterschiedlichen Projekten umsetzen."
        image="villa-pforzheim"
        imageAlt="Moderne weiße Villa mit auskragendem Obergeschoss"
        light="home"
        hud={["Heizung", "Sanitär", "Klima", "Lüftung"]}
        compact
      />
      <section className="bg-paper pb-40 pt-20 lg:pt-28">
        <div className="container-x">
          {hasExamples && (
            <Reveal>
              <p className="mb-12 max-w-2xl rounded-2xl border border-navy-900/12 bg-paper-2 px-5 py-4 text-sm leading-relaxed text-muted">
                Hinweis: Die folgenden Einträge sind Demo-Projekte mit Symbolbildern. Sie zeigen typische Leistungsumfänge und werden
                nach und nach durch echte Neckair-Projekte ersetzt.
              </p>
            </Reveal>
          )}
          <ReferenceGrid
            items={references.map((r) => ({
              slug: r.slug,
              title: r.title,
              category: r.category,
              client: r.client,
              services: r.services,
              text: r.text,
              example: r.example,
              media: <Picture name={r.image} alt={r.imageAlt} sizes="(min-width: 768px) 46vw, 100vw" />,
            }))}
          />
        </div>
      </section>
      <CtaSection title={["Ihr Projekt", "könnte das nächste sein."]} image="haus-daemmerung" />
      <div className="h-16 bg-paper lg:h-24" />
    </>
  );
}
