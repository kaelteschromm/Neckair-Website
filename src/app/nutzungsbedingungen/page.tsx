import type { Metadata } from "next";
import { PageHero } from "@/components/sections";

// Text unverändert von der bisherigen Website übernommen (Stand: Januar 2025).
export const metadata: Metadata = {
  title: "Nutzungsbedingungen",
  description: "Nutzungsbedingungen der Website von Neckair.",
  alternates: { canonical: "/nutzungsbedingungen/" },
};

const sections: [string, string][] = [
  [
    "1. Allgemeines",
    "Die Nutzung dieser Website unterliegt den folgenden Bedingungen. Mit dem Aufruf akzeptieren Sie diese."
  ],
  [
    "2. Inhalte",
    "Alle Inhalte dienen ausschließlich Informationszwecken. Änderungen und Irrtümer bleiben vorbehalten."
  ],
  [
    "3. Urheberrecht",
    "Texte, Bilder, Logos und Layout sind urheberrechtlich geschützt und dürfen nicht ohne Zustimmung genutzt werden."
  ],
  [
    "4. Haftung",
    "Wir übernehmen keine Haftung für externe Links. Für den Inhalt verlinkter Seiten sind deren Betreiber verantwortlich."
  ],
  [
    "5. Nutzung",
    "Die Website darf nicht missbräuchlich verwendet werden. Technische Angriffe oder Manipulationen sind verboten."
  ],
  [
    "6. Datenschutz",
    "Es gelten die Bestimmungen unserer Datenschutzerklärung."
  ],
  [
    "7. Änderungen",
    "Wir behalten uns vor, die Nutzungsbedingungen jederzeit zu ändern. Bitte prüfen Sie diese regelmäßig."
  ],
  [
    "8. Rechtswahl",
    "Es gilt deutsches Recht. Gerichtsstand ist unser Geschäftssitz, soweit gesetzlich zulässig."
  ]
];

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Rechtliches" title={["Nutzungsbedingungen"]} compact />
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
