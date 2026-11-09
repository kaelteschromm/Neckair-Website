import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/sections";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Projekt anfragen bei NECKAIR – Heizung, Sanitär & Trinkwasser, Klima & Kälte. Anfrage-Assistent, Telefon, E-Mail und Online-Terminbuchung für Wartungen.",
  alternates: { canonical: "/kontakt/" },
};

export default function KontaktPage() {
  return (
    <>
      <PageHero
        kicker="Kontakt"
        title="Erzählen Sie uns von Ihrem Vorhaben."
        intro="In vier kurzen Schritten beschreiben Sie Ihr Projekt. Wir melden uns persönlich mit einer ersten Einschätzung."
        light="home"
        compact
      />
      <section className="bg-kalk py-16 lg:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            <ContactForm />
          </div>

          <aside className="space-y-px bg-navy/15 lg:col-span-4" aria-label="Weitere Kontaktwege">
            <div className="bg-graphite p-8 text-on-dark">
              <h2 className="text-xl">Direkt erreichen</h2>
              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="text-sm text-on-dark-muted">Telefon</dt>
                  <dd><a href={`tel:${site.phoneHref}`} className="link mt-1 inline-block text-2xl font-medium">{site.phone}</a></dd>
                </div>
                <div>
                  <dt className="text-sm text-on-dark-muted">E-Mail</dt>
                  <dd><a href={`mailto:${site.email}`} className="link mt-1 inline-block break-all text-lg font-medium">{site.email}</a></dd>
                </div>
                <div>
                  <dt className="text-sm text-on-dark-muted">Erreichbarkeit</dt>
                  <dd className="mt-1">{site.hours}</dd>
                </div>
              </dl>
            </div>

            <div id="wartung" className="scroll-mt-28 bg-white p-8">
              <h2 className="text-xl text-navy">Wartungstermin online buchen</h2>
              <p className="mt-3 leading-relaxed text-muted">
                Wählen Sie einen freien Termin direkt in unserem Kalender. Die Buchung öffnet sich in einem neuen Fenster bei Google Kalender.
              </p>
              <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark mt-6">
                Termin wählen
                <span className="sr-only">(öffnet Google Kalender in neuem Fenster)</span>
              </a>
            </div>

            <div className="bg-white p-8">
              <h2 className="text-xl text-navy">Anschrift</h2>
              <address className="mt-4 not-italic leading-relaxed text-navy">
                {site.name}
                <br />
                {site.street}
                <br />
                {site.zip} {site.city}
              </address>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
