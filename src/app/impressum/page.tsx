import type { Metadata } from "next";
import { PageHero } from "@/components/sections";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum von NECKAIR – Angaben gemäß § 5 DDG.",
  alternates: { canonical: "/impressum/" },
};

export default function ImpressumPage() {
  return (
    <>
      <PageHero kicker="Rechtliches" title="Impressum" compact />
      <section className="bg-kalk py-20 lg:py-28">
        <div className="container-x prose-legal max-w-3xl">
          <h2>Angaben gemäß § 5 DDG</h2>
          <p>
            {site.name}
            <br />
            Inhaber: {site.owner}
            <br />
            {site.street}
            <br />
            {site.zip} {site.city}
            <br />
            {site.country}
          </p>

          <h2>Kontakt</h2>
          <p>
            Telefon: {site.phone}
            <br />
            E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>

          <h2>Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {site.vatId}</p>

          <h2>Verantwortlich für den Inhalt</h2>
          <p>{site.owner}, Anschrift wie oben.</p>

          <h2>Verbraucherstreitbeilegung</h2>
          <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

          <h2>Haftung für Inhalte</h2>
          <p>
            Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
            können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen
            Gesetzen verantwortlich.
          </p>

          <h2>Haftung für Links</h2>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten
            Seiten ist stets der jeweilige Anbieter verantwortlich.
          </p>

          <h2>Urheberrecht</h2>
          <p>
            Die durch uns erstellten Inhalte und Werke auf dieser Website unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als
            solche gekennzeichnet.
          </p>

          <h2>Bildnachweis</h2>
          <p>
            Die verwendeten Fotos sind gemeinfrei (CC0) oder stammen aus eigenem Bestand. Über Wikimedia Commons: Bruno Marinho, Matthew
            Hamilton, Breather, Toa Heftiba, Jeremy Yap, Jarosław Ceborski, Lance Anderson (jeweils via Unsplash), Kiwiev, Best Tech Nick 25
            und Werner Schüle. Weitere Fotos aus dem WordPress Photo Directory. Die auf der Seite &bdquo;Referenzen&ldquo; gekennzeichneten
            Beispielprojekte zeigen Symbolbilder.
          </p>
        </div>
      </section>
    </>
  );
}
