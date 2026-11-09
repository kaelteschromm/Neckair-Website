import type { Metadata } from "next";
import { PageHero } from "@/components/sections";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung von NECKAIR.",
  alternates: { canonical: "/datenschutz/" },
};

export default function DatenschutzPage() {
  return (
    <>
      <PageHero kicker="Rechtliches" title="Datenschutz" compact />
      <section className="bg-kalk py-20 lg:py-28">
        <div className="container-x prose-legal max-w-3xl">
          <p>
            Der Schutz Ihrer persönlichen Daten ist uns wichtig. Diese Website verzichtet bewusst auf Tracking, Analyse-Tools, Werbe-Cookies und
            eingebettete Inhalte Dritter, die beim Seitenaufruf Daten übertragen.
          </p>

          <h2>1. Verantwortlicher</h2>
          <p>
            {site.name}, Inhaber {site.owner}
            <br />
            {site.street}, {site.zip} {site.city}
            <br />
            E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a> · Telefon: {site.phone}
          </p>

          <h2>2. Hosting und Server-Logfiles</h2>
          <p>
            Diese Website wird als statische Website bei GitHub Pages gehostet (GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA
            94107, USA). Beim Aufruf der Seiten verarbeitet der Hoster technisch notwendige Daten, insbesondere Ihre IP-Adresse, Datum und
            Uhrzeit des Zugriffs sowie Informationen zu Browser und Betriebssystem, um die Website auszuliefern und die Sicherheit zu
            gewährleisten. Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und stabilen Bereitstellung (Art. 6 Abs. 1 lit. f
            DSGVO). GitHub ist unter dem EU-US Data Privacy Framework zertifiziert. Weitere Informationen:{" "}
            <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">
              Datenschutzerklärung von GitHub
            </a>
            .
          </p>

          <h2>3. Kontaktformular</h2>
          <p>
            Wenn Sie uns über das Kontaktformular schreiben, verarbeiten wir Ihre Angaben (Name, E-Mail-Adresse, optional Firma, Telefon und
            Ort, Ihre Nachricht sowie den gewählten Bereich), um Ihre Anfrage zu beantworten. Die Übermittlung erfolgt über den Dienst Formspree
            (Formspree Inc., USA), der uns die Nachricht per E-Mail zustellt. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a
            DSGVO) sowie – bei Anfragen zu Angeboten oder Aufträgen – die Durchführung vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO).
            Ihre Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Eine Übermittlung in die USA erfolgt auf Grundlage
            von Standardvertragsklauseln der EU-Kommission. Weitere Informationen:{" "}
            <a href="https://formspree.io/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
              Datenschutzerklärung von Formspree
            </a>
            .
          </p>

          <h2>4. Kontakt per E-Mail oder Telefon</h2>
          <p>
            Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir Ihre Angaben ausschließlich zur Bearbeitung Ihres Anliegens
            (Art. 6 Abs. 1 lit. b bzw. f DSGVO).
          </p>

          <h2>5. Online-Terminbuchung</h2>
          <p>
            Auf der Kontaktseite verlinken wir auf unseren Terminplan bei Google Kalender (Google Ireland Limited, Gordon House, Barrow Street,
            Dublin 4, Irland). Es handelt sich um einen einfachen Link: Erst wenn Sie ihn anklicken, wird die Seite von Google geöffnet und
            Google verarbeitet Ihre Daten nach eigenen Bestimmungen. Wenn Sie einen Termin buchen, werden Ihre Angaben (z. B. Name,
            E-Mail-Adresse, gewählter Termin) zur Terminverwaltung verarbeitet (Art. 6 Abs. 1 lit. b DSGVO). Weitere Informationen:{" "}
            <a href="https://policies.google.com/privacy?hl=de" target="_blank" rel="noopener noreferrer">
              Datenschutzerklärung von Google
            </a>
            .
          </p>

          <h2>6. Schriftarten</h2>
          <p>
            Die auf dieser Website verwendeten Schriftarten werden lokal mit der Website ausgeliefert. Es wird keine Verbindung zu Servern von
            Google oder anderen Schriftanbietern hergestellt.
          </p>

          <h2>7. Cookies</h2>
          <p>Diese Website setzt keine Cookies und verwendet keine Tracking- oder Analysedienste.</p>

          <h2>8. Speicherdauer</h2>
          <p>
            Wir speichern personenbezogene Daten nur so lange, wie es für den jeweiligen Zweck erforderlich ist, und löschen sie anschließend
            unter Beachtung gesetzlicher Aufbewahrungsfristen.
          </p>

          <h2>9. Ihre Rechte</h2>
          <p>Sie haben jederzeit das Recht auf</p>
          <ul>
            <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO),</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
            <li>Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO) sowie Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO).</li>
          </ul>

          <h2>10. Beschwerderecht</h2>
          <p>
            Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, zum Beispiel beim Landesbeauftragten für den
            Datenschutz und die Informationsfreiheit Baden-Württemberg.
          </p>

          <h2>11. Datensicherheit</h2>
          <p>Diese Website wird ausschließlich verschlüsselt über HTTPS ausgeliefert.</p>

          <p className="mt-12 text-sm">Stand: November 2026</p>
        </div>
      </section>
    </>
  );
}
