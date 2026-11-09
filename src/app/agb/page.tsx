import type { Metadata } from "next";
import { PageHero } from "@/components/sections";

// Text unverändert von der bisherigen Website übernommen (Stand: Januar 2025).
export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description: "Allgemeine Geschäftsbedingungen der Neckair.",
  alternates: { canonical: "/agb/" },
};

const sections: [string, string][] = [
  [
    "1. Geltung",
    "Unsere AGB gelten für alle Verträge, Lieferungen und Leistungen."
  ],
  [
    "2. Angebot & Vertragsschluss",
    "Unsere Angebote sind freibleibend. Verträge kommen erst durch unsere schriftliche Bestätigung zustande."
  ],
  [
    "3. Preise & Zahlung",
    "Alle Preise verstehen sich zzgl. gesetzlicher MwSt. Zahlungen sind sofort nach Rechnungsstellung ohne Abzug fällig."
  ],
  [
    "4. Leistungen & Termine",
    "Leistungen werden nach Stand der Technik erbracht. Termine gelten als unverbindlich, außer sie sind schriftlich bestätigt."
  ],
  [
    "5. Gewährleistung",
    "Die Gewährleistung richtet sich nach den gesetzlichen Vorschriften, sofern nicht abweichend vereinbart."
  ],
  [
    "6. Haftung",
    "Wir haften nur für Vorsatz und grobe Fahrlässigkeit. Für Folgeschäden wird keine Haftung übernommen."
  ],
  [
    "7. Eigentumsvorbehalt",
    "Gelieferte Ware bleibt bis zur vollständigen Bezahlung unser Eigentum."
  ],
  [
    "8. Datenschutz",
    "Personenbezogene Daten werden nur im Rahmen der gesetzlichen Bestimmungen verarbeitet. Details siehe Datenschutzerklärung."
  ],
  [
    "9. Gerichtsstand",
    "Gerichtsstand ist unser Geschäftssitz, soweit gesetzlich zulässig."
  ]
];

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Rechtliches" title={["Allgemeine Geschäftsbedingungen"]} compact />
      <section className="bg-paper py-20 lg:py-28">
        <div className="container-x prose-legal max-w-3xl">
          {sections.map(([h, t]) => (
            <div key={h}>
              <h2>{h}</h2>
              <p>{t}</p>
            </div>
          ))}
          <p className="mt-12 text-sm">Stand: Januar 2025</p>
        </div>
      </section>
    </>
  );
}
