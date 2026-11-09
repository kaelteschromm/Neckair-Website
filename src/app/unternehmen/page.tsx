import type { Metadata } from "next";
import { Picture } from "@/components/Picture";
import { Logo } from "@/components/Logo";
import { MaskReveal } from "@/components/motion";
import { CtaSection, PageHero, ProcessSection, SectionHeading } from "@/components/sections";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Unternehmen",
  description: "NECKAIR – Handwerk mit Ingenieursblick. Haltung, Arbeitsweise und Qualitätsanspruch Ihres Fachbetriebs für Heizung, Sanitär & Trinkwasser sowie Klima & Kälte.",
  alternates: { canonical: "/unternehmen/" },
};

const VALUES = [
  { title: "Präzision", text: "Wir rechnen, messen und planen, bevor wir bauen. So passt jede Anlage zum Gebäude – und nicht umgekehrt." },
  { title: "Verlässlichkeit", text: "Zusagen gelten. Termine, Preise und Absprachen sind für uns kein Verhandlungsspielraum." },
  { title: "Weitsicht", text: "Wir denken an Effizienz, Wartbarkeit und daran, dass Ihre Technik viele Jahre gut funktioniert." },
  { title: "Sauberkeit", text: "Eine ordentliche Baustelle ist Ausdruck von Respekt – vor Ihrem Zuhause und vor unserer Arbeit." },
];
const CARE = [
  { title: "Zuhören", text: "Wir klären zuerst, was Ihnen wichtig ist: Komfort, Kosten, Gestaltung oder Zeitplan." },
  { title: "Ehrlich beraten", text: "Wenn eine Lösung für Ihr Gebäude nicht sinnvoll ist, sagen wir das – und zeigen die Alternative." },
  { title: "Transparent planen", text: "Angebote, die man versteht: klar gegliedert, nachvollziehbar, ohne versteckte Positionen." },
  { title: "Dranbleiben", text: "Nach der Inbetriebnahme sind wir für Wartung, Fragen und schnelle Hilfe weiter für Sie da." },
];
const QUALITY = [
  { title: "Planung vor Montage", text: "Heizlast, Wasserbedarf, Kühllast: Wir rechnen, bevor wir bohren." },
  { title: "Markenkomponenten", text: "Bewährte Hersteller mit langfristiger Ersatzteilversorgung." },
  { title: "Saubere Dokumentation", text: "Nachvollziehbare Unterlagen zu Ihrer Anlage und ihren Einstellungen." },
  { title: "Einweisung inklusive", text: "Wir erklären Ihre Anlage so, dass Sie sie im Alltag sicher bedienen können." },
];

function DefList({ items, dark = false }: { items: { title: string; text: string }[]; dark?: boolean }) {
  return (
    <dl className="grid gap-x-10 sm:grid-cols-2">
      {items.map((v) => (
        <div key={v.title} className={`border-t py-7 ${dark ? "border-on-dark/15" : "border-navy/15"}`}>
          <dt className={`font-display text-xl font-semibold [font-stretch:108%] ${dark ? "text-on-dark" : "text-navy"}`}>{v.title}</dt>
          <dd className={`mt-2 leading-relaxed ${dark ? "text-on-dark-muted" : "text-muted"}`}>{v.text}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function UnternehmenPage() {
  return (
    <>
      <PageHero
        kicker="Unternehmen"
        title="Handwerk mit Ingenieursblick."
        intro="NECKAIR verbindet solides Fachhandwerk mit moderner Gebäudetechnik – für Menschen, die Wert auf Qualität legen."
        image="beton"
        imageAlt="Abstrakte Betonarchitektur mit klaren Linien"
        light="home"
      />

      <section className="bg-kalk py-24 lg:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <SectionHeading title="Haltung" className="lg:col-span-4" />
          <p className="text-[clamp(1.4rem,2.6vw,2.2rem)] font-medium leading-snug text-navy lg:col-span-8">
            Wir verstehen Gebäudetechnik als System. Wärme, Wasser und Kälte gehören zusammen und verdienen eine Planung, die das Ganze
            im Blick behält – vom ersten Gespräch bis zur Wartung nach vielen Jahren.
          </p>
        </div>
      </section>

      <section className="border-t border-navy/10 bg-white py-24 lg:py-32">
        <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <MaskReveal className="plan-frame aspect-[4/5] bg-graphite text-navy/40">
              {/* PLATZHALTER: hier später ein Porträtfoto des Inhabers einsetzen */}
              <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-graphite p-10 text-center text-on-dark-muted">
                <Logo tone="light" markOnly className="w-28" />
                <span className="text-sm">Porträtfoto folgt</span>
              </div>
            </MaskReveal>
          </div>
          <div className="lg:col-span-7">
            <p className="text-sm font-medium text-muted">Inhaber</p>
            <h2 className="mt-3 text-[clamp(2rem,4vw,3.4rem)] text-navy">{site.owner}</h2>
            <p className="measure mt-8 text-lg leading-relaxed text-muted">
              Mit NECKAIR hat {site.owner} einen Fachbetrieb aufgebaut, der Heizung, Sanitär & Trinkwasser sowie Klima & Kälte aus einer
              Hand anbietet. Sein Anspruch: ehrlich beraten, sauber planen und Projekte so umsetzen, dass sie über viele Jahre Freude
              machen.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-kalk py-24 lg:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <SectionHeading title="Wofür wir stehen." className="lg:col-span-4" />
          <div className="lg:col-span-8">
            <DefList items={VALUES} />
          </div>
        </div>
      </section>

      <section className="bg-graphite py-24 text-on-dark lg:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <SectionHeading
            dark
            title="Ein Ansprechpartner. Vom ersten Gespräch an."
            text="Bei uns landen Sie nicht in einer Warteschleife. Sie sprechen mit den Menschen, die Ihre Anlage planen und einbauen – und die auch danach für Sie erreichbar sind."
            className="lg:col-span-5"
          />
          <div className="lg:col-span-7">
            <DefList items={CARE} dark />
          </div>
        </div>
      </section>

      <section className="bg-kalk py-24 lg:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <SectionHeading title="Woran Sie gute Arbeit erkennen." className="lg:col-span-4" />
          <div className="lg:col-span-8">
            <DefList items={QUALITY} />
          </div>
        </div>
      </section>

      <section className="border-t border-navy/10 bg-white py-24 lg:py-32">
        <div className="container-x grid items-end gap-10 lg:grid-cols-12">
          <MaskReveal className="plan-frame aspect-[16/10] text-navy/40 lg:col-span-7" direction="left">
            <Picture name="wald" alt="Bewaldete Hügellandschaft unter hellem Himmel" sizes="(min-width: 1024px) 58vw, 100vw" />
          </MaskReveal>
          <SectionHeading
            title="Zuhause in der Region."
            text={`Unser Sitz ist in ${site.city}. Von hier aus betreuen wir Privat- und Geschäftskunden in der Umgebung – mit kurzen Wegen und schneller Reaktionszeit.`}
            className="lg:col-span-5"
          />
        </div>
      </section>

      <ProcessSection />
      <CtaSection title="Lernen wir uns kennen." image="beton" />
    </>
  );
}
