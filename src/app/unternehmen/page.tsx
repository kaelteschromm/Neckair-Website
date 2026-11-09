import type { Metadata } from "next";
import { Picture } from "@/components/Picture";
import { Logo } from "@/components/Logo";
import { MaskReveal, Reveal, ScrollText } from "@/components/motion";
import { CtaSection, PageHero, ProcessSection, SectionIntro } from "@/components/sections";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Unternehmen",
  description: "Neckair ist Ihr Fachbetrieb für Heizung, Sanitär, Klima und Lüftung. Lernen Sie unsere Haltung, unsere Arbeitsweise und unseren Inhaber kennen.",
  alternates: { canonical: "/unternehmen/" },
};

const values = [
  { title: "Präzision", text: "Wir rechnen, messen und planen, bevor wir bauen. So passt jede Anlage zum Gebäude – und nicht umgekehrt." },
  { title: "Verlässlichkeit", text: "Zusagen gelten. Termine, Preise und Absprachen sind für uns kein Verhandlungsspielraum." },
  { title: "Weitsicht", text: "Wir denken an morgen: an Effizienz, Wartbarkeit und daran, dass Ihre Technik viele Jahre gut funktioniert." },
  { title: "Sauberkeit", text: "Eine ordentliche Baustelle ist Ausdruck von Respekt – vor Ihrem Zuhause und vor unserer Arbeit." },
];

export default function UnternehmenPage() {
  return (
    <>
      <PageHero
        eyebrow="Unternehmen"
        title={["Handwerk mit", "Ingenieursblick."]}
        intro="Neckair verbindet solides Fachhandwerk mit moderner Gebäudetechnik – für Menschen, die Wert auf Qualität legen."
        image="beton"
        imageAlt="Abstrakte Betonarchitektur mit klaren Linien"
        light="home"
        hud={["Präzision", "Verlässlichkeit", "Weitsicht"]}
      />

      <section className="bg-paper py-28 lg:py-40">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <p className="eyebrow text-azure-strong">Haltung</p>
          </Reveal>
          <div className="lg:col-span-9">
            <ScrollText
              className="text-[clamp(1.75rem,3.4vw,3rem)] font-medium leading-[1.2] tracking-tight text-navy-900"
              text="Unser Name verbindet zwei Dinge, die uns wichtig sind: die Verwurzelung in unserer Region und die Luft, die wir atmen. Wir verstehen Gebäudetechnik als System – Wärme, Wasser, Kühle und Luft gehören zusammen und verdienen eine Planung, die das Ganze im Blick behält."
            />
          </div>
        </div>
      </section>

      {/* Inhaber */}
      <section className="bg-paper-2 py-24 lg:py-36">
        <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <MaskReveal className="aspect-[4/5] rounded-2xl bg-navy-900">
              {/* PLATZHALTER: hier später ein Porträtfoto des Inhabers einsetzen */}
              <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-navy-900 p-10 text-center text-paper/60">
                <Logo tone="light" markOnly className="w-32" />
                <span className="text-sm">Porträtfoto folgt</span>
              </div>
            </MaskReveal>
          </div>
          <div className="lg:col-span-7">
            <SectionIntro eyebrow="Inhaber" title={[site.owner, "Gründer von Neckair"]} />
            <Reveal delay={0.15}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
                Mit Neckair hat {site.owner} einen Fachbetrieb aufgebaut, der Wärme- und Kältetechnik aus einer Hand anbietet. Sein Anspruch:
                Kunden ehrlich beraten, Anlagen sauber planen und Projekte so umsetzen, dass sie über viele Jahre Freude machen.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="display mt-10 max-w-xl border-l-2 border-sky pl-6 text-2xl italic leading-snug text-navy-900 lg:text-3xl">
                „Gute Technik merkt man nicht. Man merkt nur, dass alles funktioniert.“
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Werte */}
      <section className="bg-paper py-24 lg:py-36">
        <div className="container-x">
          <SectionIntro eyebrow="Werte" title={["Wofür", "wir stehen."]} className="mb-16" />
          <ul className="grid gap-px overflow-hidden rounded-2xl bg-navy-900/12 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal as="li" key={v.title} delay={i * 0.08} className="group bg-paper p-8 transition-colors duration-200 hover:bg-navy-900 lg:p-10">
                <span className="text-xs font-semibold tracking-[0.2em] text-azure-strong transition-colors duration-200 group-hover:text-sky">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-10 text-2xl font-medium text-navy-900 transition-colors duration-200 group-hover:text-paper">{v.title}</h3>
                <p className="mt-4 leading-relaxed text-muted transition-colors duration-200 group-hover:text-paper/70">{v.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Persönliche Betreuung & Qualitätsanspruch */}
      <section className="relative overflow-hidden bg-navy-950 py-24 text-paper lg:py-36">
        <div aria-hidden className="grid-lines absolute inset-0 opacity-50" />
        <div className="container-x relative grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionIntro dark eyebrow="Persönliche Betreuung" title={["Ein Ansprechpartner.", "Vom ersten Gespräch an."]} />
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-md leading-relaxed text-paper/65">
                Bei uns landen Sie nicht in einer Warteschleife. Sie sprechen mit den Menschen, die Ihre Anlage planen und einbauen –
                und die auch danach für Sie erreichbar sind.
              </p>
            </Reveal>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-2xl bg-paper/10 sm:grid-cols-2 lg:col-span-7">
            {[
              ["Zuhören", "Wir klären zuerst, was Ihnen wichtig ist: Komfort, Kosten, Gestaltung oder Zeitplan."],
              ["Ehrlich beraten", "Wenn eine Lösung für Ihr Gebäude nicht sinnvoll ist, sagen wir das – und zeigen die Alternative."],
              ["Transparent planen", "Angebote, die man versteht: klar gegliedert, nachvollziehbar, ohne versteckte Positionen."],
              ["Dranbleiben", "Nach der Inbetriebnahme sind wir für Wartung, Fragen und schnelle Hilfe weiter für Sie da."],
            ].map(([t, d], i) => (
              <Reveal as="li" key={t} delay={i * 0.05} className="bg-navy-950/80 p-8 lg:p-10">
                <span className="hud text-sky">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 text-2xl font-medium">{t}</h3>
                <p className="mt-3 leading-relaxed text-paper/60">{d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-paper py-24 lg:py-36">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionIntro eyebrow="Qualitätsanspruch" title={["Woran Sie", "gute Arbeit erkennen."]} />
          </div>
          <ul className="lg:col-span-7 lg:col-start-6">
            {[
              ["Planung vor Montage", "Heizlast, Wasserbedarf, Luftmengen: Wir rechnen, bevor wir bohren."],
              ["Markenkomponenten", "Bewährte Hersteller mit langfristiger Ersatzteilversorgung."],
              ["Saubere Dokumentation", "Sie erhalten nachvollziehbare Unterlagen zu Ihrer Anlage und ihren Einstellungen."],
              ["Einweisung inklusive", "Wir erklären Ihnen Ihre Anlage so, dass Sie sie im Alltag sicher bedienen können."],
            ].map(([t, d], i) => (
              <Reveal as="li" key={t} delay={0.04} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-navy-900/12 py-8 last:border-b sm:grid-cols-[4rem_1fr]">
                <span className="hud pt-2 text-azure-strong">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-2xl font-medium tracking-tight text-navy-900">{t}</h3>
                  <p className="mt-2 max-w-lg leading-relaxed text-muted">{d}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Region */}
      <section className="bg-paper pb-24 lg:pb-36">
        <div className="container-x grid items-end gap-10 lg:grid-cols-12">
          <MaskReveal className="aspect-[16/10] rounded-2xl lg:col-span-7" direction="left">
            <Picture name="wald" alt="Bewaldete Hügellandschaft unter hellem Himmel" sizes="(min-width: 1024px) 58vw, 100vw" />
          </MaskReveal>
          <div className="lg:col-span-5">
            <SectionIntro
              eyebrow="Standort"
              title={["Zuhause in", "der Region."]}
              text={`Unser Sitz ist in ${site.city}. Von hier aus betreuen wir Privat- und Geschäftskunden in der Umgebung – mit kurzen Wegen und schneller Reaktionszeit.`}
            />
          </div>
        </div>
      </section>

      <ProcessSection />
      <div className="h-16 bg-paper lg:h-24" />
      <CtaSection title={["Lernen wir", "uns kennen."]} image="beton" />
      <div className="h-16 bg-paper lg:h-24" />
    </>
  );
}
