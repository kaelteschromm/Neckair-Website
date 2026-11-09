import Link from "next/link";
import { Picture } from "@/components/Picture";
import { BuildingStory } from "@/components/building/BuildingStory";
import { BuildingExplorer } from "@/components/building/BuildingExplorer";
import { CtaSection, ProcessSection, SectionHeading } from "@/components/sections";
import { serviceList } from "@/content/services";
import { references } from "@/content/references";

const AUDIENCES = [
  { title: "Bauherren", text: "Wir planen die Gebäudetechnik von Anfang an mit – abgestimmt auf Grundriss, Bauablauf und Budget." },
  { title: "Architekten", text: "Wir liefern Haustechnik, die sich der Architektur unterordnet, und stimmen uns früh mit Planung und Bauleitung ab." },
  { title: "Privatkunden", text: "Ob neue Heizung, neues Bad oder Klimaanlage: persönliche Beratung und saubere Umsetzung im bewohnten Haus." },
  { title: "Gewerbe und Immobilien", text: "Für Büros, Praxen, Wohnanlagen und Gewerbe: verlässliche Anlagen und planbare Wartung." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero + Scrolltelling: eine durchgehende Szene */}
      <BuildingStory />

      {/* Das interaktive Gebäude */}
      <BuildingExplorer />

      {/* Drei Leistungswelten – große, versetzte Reihen statt Kacheln */}
      <section aria-labelledby="leistungen-titel" className="bg-kalk py-24 lg:py-32">
        <div className="container-x">
          <SectionHeading
            id="leistungen-titel"
            title="Drei Gewerke. Ein Ansprechpartner."
            text="Wärme, Wasser und Kälte greifen in modernen Gebäuden ineinander. Wir planen sie zusammen und setzen sie aus einer Hand um."
          />
          <ul className="mt-16 space-y-20 lg:space-y-28">
            {serviceList.map((s, i) => (
              <li key={s.slug} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
                <Link
                  href={`/${s.slug}/`}
                  tabIndex={-1}
                  aria-hidden
                  className={`plan-frame group relative block aspect-[16/10] overflow-hidden text-navy/40 lg:col-span-7 ${i % 2 ? "lg:order-2 lg:col-start-6" : ""}`}
                >
                  <div className="h-full w-full transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.02]">
                    <Picture name={s.hero} alt="" sizes="(min-width: 1024px) 55vw, 100vw" />
                  </div>
                </Link>
                <div className={`lg:col-span-4 ${i % 2 ? "lg:order-1 lg:col-start-1" : "lg:col-start-9"}`}>
                  <span aria-hidden className={`block h-1 w-12 ${s.medium === "heat" ? "bg-heat" : s.medium === "water" ? "bg-water" : "bg-cold"}`} />
                  <h3 className="mt-6 text-[clamp(1.75rem,3vw,2.6rem)] text-navy">{s.title}</h3>
                  <p className="mt-4 leading-relaxed text-muted">{s.teaser}</p>
                  <Link href={`/${s.slug}/`} className="link mt-6 inline-block font-semibold text-navy">
                    Mehr zu {s.title}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Für wen */}
      <section aria-labelledby="fuer-wen-titel" className="border-t border-navy/10 bg-white py-24 lg:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <SectionHeading id="fuer-wen-titel" title="Für Menschen, die Wert auf Qualität legen." className="lg:col-span-5" />
          <dl className="grid gap-x-10 sm:grid-cols-2 lg:col-span-7">
            {AUDIENCES.map((a) => (
              <div key={a.title} className="border-t border-navy/15 py-7">
                <dt className="font-display text-xl font-semibold text-navy [font-stretch:108%]">{a.title}</dt>
                <dd className="mt-2 leading-relaxed text-muted">{a.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <ProcessSection />

      {/* Referenzen */}
      <section aria-labelledby="ref-titel" className="bg-kalk py-24 lg:py-32">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionHeading id="ref-titel" title="Projekte" text="So sieht unsere Arbeit in der Praxis aus. Die gezeigten Einträge sind derzeit Demo-Projekte mit Symbolbildern." />
            <Link href="/referenzen/" className="btn btn-outline-dark shrink-0">Alle Projekte</Link>
          </div>
          <ul className="mt-14 grid gap-10 md:grid-cols-3">
            {references.slice(0, 3).map((r) => (
              <li key={r.slug}>
                <Link href={`/referenzen/${r.slug}/`} className="group block">
                  <div className="plan-frame relative aspect-[4/3] overflow-hidden text-navy/40">
                    <div className="h-full w-full transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.02]">
                      <Picture name={r.image} alt={r.imageAlt} sizes="(min-width: 768px) 30vw, 100vw" />
                    </div>
                    {r.example ? <span className="absolute left-3 top-3 bg-white px-2 py-1 text-xs font-semibold text-navy">Demo-Projekt</span> : null}
                  </div>
                  <p className="mt-5 text-sm text-muted">{r.type}</p>
                  <h3 className="mt-1 text-xl text-navy">{r.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
