import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/sections";
import { Reveal } from "@/components/motion";
import { Arrow } from "@/components/Arrow";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontaktieren Sie Neckair für Heizung, Sanitär, Klima und Lüftung – per Formular, Telefon oder E-Mail. Wartungstermine online buchen.",
  alternates: { canonical: "/kontakt/" },
};

export default function KontaktPage() {
  return (
    <>
      <PageHero
        eyebrow="Kontakt"
        title={["Sprechen wir", "über Ihr Vorhaben."]}
        intro="Schreiben Sie uns ein paar Zeilen zu Ihrem Projekt. Wir melden uns persönlich bei Ihnen."
        compact
      />
      <section className="bg-paper py-20 lg:py-32">
        <div className="container-x grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <Reveal className="rounded-2xl bg-navy-900 p-8 text-paper lg:p-10">
              <p className="eyebrow text-sky">Direkt erreichen</p>
              <ul className="mt-8 space-y-6">
                <li>
                  <p className="text-sm text-paper/55">Telefon</p>
                  <a href={`tel:${site.phoneHref}`} className="link-underline mt-1 inline-block text-2xl font-medium">{site.phone}</a>
                </li>
                <li>
                  <p className="text-sm text-paper/55">E-Mail</p>
                  <a href={`mailto:${site.email}`} className="link-underline mt-1 inline-block break-all text-xl font-medium">{site.email}</a>
                </li>
                <li>
                  <p className="text-sm text-paper/55">Erreichbarkeit</p>
                  <p className="mt-1">{site.hours}</p>
                </li>
              </ul>
            </Reveal>

            <Reveal delay={0.1} className="rounded-2xl border border-navy-900/12 p-8 lg:p-10">
              <p className="eyebrow text-azure-strong">Wartung</p>
              <p className="mt-6 text-xl font-medium text-navy-900">Wartungstermin online buchen</p>
              <p className="mt-3 leading-relaxed text-muted">
                Wählen Sie einen freien Termin direkt in unserem Kalender. Die Buchung öffnet sich in einem neuen Fenster bei Google Kalender.
              </p>
              <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-dark mt-8">
                Termin wählen <Arrow className="arrow" />
                <span className="sr-only">(öffnet Google Kalender in neuem Fenster)</span>
              </a>
            </Reveal>

            <Reveal delay={0.2} className="rounded-2xl border border-navy-900/12 p-8 lg:p-10">
              <p className="eyebrow text-azure-strong">Anschrift</p>
              <address className="mt-6 not-italic leading-relaxed text-navy-900">
                {site.name}
                <br />
                {site.street}
                <br />
                {site.zip} {site.city}
              </address>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}
