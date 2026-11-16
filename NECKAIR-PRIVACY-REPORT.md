# NECKAIR – Datenschutzbericht (technische Prüfung)

**Stand:** 16.11.2026 · **Geprüft:** Code (`src/`), Build (`out/`), Live-Seite https://hünig.com, nur passiv
**Prüfer:** unabhängiger Privacy-Auditor-Agent (`.claude/agents/privacy-auditor.md`). Die Umsetzung hat ein anderer Agent übernommen.

> **Wichtig:** Dies ist keine Rechtsberatung und keine Garantie für DSGVO-Konformität. Jeder Punkt ist eingeordnet als
> **T** = technisch geprüft · **O** = organisatorisch nötig · **R** = rechtlich zu prüfen.

## 1. Zusammenfassung

Die Website ist technisch datensparsam aufgebaut:
- Es gibt kein Tracking und keine Analytics.
- Sie setzt keine Cookies und nutzt weder localStorage noch sessionStorage.
- Beim Seitenaufruf werden keine Ressourcen von Drittanbietern geladen. Schriften, Bilder und 3D-Szene kommen von der eigenen Domain.
- Formspree wird erst beim Absenden des Formulars angesprochen.
- Die Google-Terminbuchung ist nur ein Link.

**Ein Consent-Banner ist nach technischem Stand nicht erforderlich** (Begründung in Abschnitt 4).

Abweichungen gibt es vor allem beim **vorgeschalteten Cloudflare** und bei **Platzhaltern im Impressum**.

## 2. Befunde und Status

| ID | Thema | Befund | Art | Status |
|---|---|---|---|---|
| P1 | Cloudflare | Cloudflare verarbeitet als vorgeschaltetes Netz (CDN) sämtlichen Verkehr, wurde in der Datenschutzerklärung aber nicht genannt. | T/R | **Behoben im Code:** Abschnitt 2 der Datenschutzerklärung ergänzt. Offen: Vertrag zur Auftragsverarbeitung (AVV) mit Cloudflare, Prüfung der Drittlandübermittlung |
| P2 | Fehlerberichte (NEL/Report-To) | Cloudflare weist Browser an, bei Verbindungsfehlern Fehlerberichte zu senden. | T/R | In der Datenschutzerklärung erwähnt. **Empfehlung:** in Cloudflare abschalten, falls möglich |
| P3 | E-Mail-Verschleierung | Cloudflare schreibt `mailto`-Links um und fügt ein Skript ein. Ohne JavaScript ist die E-Mail-Adresse im Impressum dann nicht lesbar. | T/R | **Offen, Cloudflare:** „Email Address Obfuscation“ abschalten |
| P5 | HTTPS | `http://` wurde ohne Weiterleitung ausgeliefert, es gab kein HSTS. | T | Text in der Datenschutzerklärung korrigiert. **Offen, Cloudflare:** „Always Use HTTPS“ und HSTS einschalten (siehe Security-Bericht) |
| P6/P7 | GitHub Pages, Server-Logs | GitHub Pages wird korrekt genannt. Die Speicherdauer der Logs ist nicht angegeben. | O/R | Offen: Speicherdauer laut Anbieter ergänzen |
| P8 | Cookies | Es werden keine Cookies gesetzt. Nur bei Bot-Schutz oder Challenges könnte Cloudflare ein Sicherheits-Cookie setzen. | T | Bot Fight Mode und Challenges ausgeschaltet lassen oder den Text anpassen |
| P9–P13 | Speicher, Fremdverbindungen, Schriften, Bilder, Tracking | Unauffällig. Wird jetzt automatisch geprüft (E2E-Tests „Keine Fremd-Verbindungen“, „Keine Cookies und kein Web Storage“). | T | ✓ |
| P10 | 3D-Bibliothek | Drei enthält Adressen für Umgebungs-Presets eines Drittservers. Sie werden nicht genutzt, das Licht entsteht lokal. | T | ✓ Regel im Skill `threejs-development` festgehalten |
| P14 | Formspree | Der Formulardienst sitzt in den USA. | R | Offen: Auftragsverarbeitungsvertrag (DPA) und Grundlage der Drittlandübermittlung prüfen, Speicherdauer im Formspree-Archiv festlegen |
| P15 | Formular-Datenumfang | Die Datenschutzerklärung nannte die Felder Objekt, Vorhaben und Zeitraum nicht. | T | **Behoben:** Feldliste ergänzt. Offen zur Prüfung: Müssen Objektart und Vorhaben Pflichtfelder sein? |
| P16 | Einwilligungsnachweis | Die Einwilligung wurde nicht mit übermittelt. | T/R | **Behoben:** Jede Anfrage enthält jetzt „Datenschutzhinweis akzeptiert am …“. Checkbox-Text nennt „Formspree (USA)“. Die Checkbox ist nicht vorangekreuzt (per Test geprüft) |
| P17 | Gmail-Postfach | Anfragen landen in einem privaten Gmail-Postfach. | O/R | Offen: geschäftliches Postfach oder Google als Empfänger nennen |
| P18 | Google-Terminbuchung | Nur ein Link, kein eingebettetes Widget. | T | ✓ So beibehalten |
| P19/P20 | Impressum | Straße, Telefon, USt-ID und Öffnungszeiten sind Platzhalter. Handwerksrechtliche Angaben fehlen. | O/R | Offen: echte Daten vom Inhaber nötig |
| P21 | Live und Build | Live lief zum Prüfzeitpunkt noch der Stand vom 9.11. | T | Nach Freigabe des Deployments erneut prüfen |
| P23 | AVV/Verarbeitungsverzeichnis | Technisch nicht prüfbar. | O | Offen |

## 3. Umgesetzte technische Maßnahmen

- Datenschutzerklärung:
  - Cloudflare-Abschnitt ergänzt
  - vollständige Feldliste des Formulars
  - Einwilligungszeitpunkt
  - Formulierung zur Verschlüsselung korrigiert
- Formular:
  - Einwilligungsnachweis wird mit übertragen
  - USA-Hinweis
  - Längenbegrenzungen auf allen Freitextfeldern
- Content Security Policy als Meta-Tag. `connect-src` und `form-action` sind nur für die eigene Domain und Formspree erlaubt.
- `Referrer-Policy: strict-origin-when-cross-origin` (Meta).
- Automatisierte Tests: keine Fremdverbindungen, keine Cookies und kein Web Storage beim Seitenaufruf.

## 4. Consent-Banner: nicht erforderlich (technischer Stand)

Für die Prüfung nach § 25 TDDDG ist entscheidend:
- Im Browser wird nichts gespeichert oder ausgelesen.
- Beim Aufruf werden keine Drittanbieter-Ressourcen geladen.
- Formspree und Google werden erst durch eine aktive Handlung angesprochen.

Offen ist nur die Grauzone der Cloudflare-Fehlerberichte (NEL). Am einfachsten ist es, NEL in Cloudflare abzuschalten.

**Diese Einschätzung ändert sich, sobald** eines der folgenden Dinge hinzukommt:
- Cloudflare Web Analytics oder Bot-Challenges mit Cookies
- ein eingebettetes Google-Widget
- Karten oder Videos
- Analytics

Dann braucht es einen Consent-Dialog, bei dem „Ablehnen“ gleichwertig angeboten wird, nichts vorangekreuzt ist und externe Medien erst nach einem Klick geladen werden.

## 5. Für Datenschutzbeauftragte oder Rechtsanwalt zu prüfen

1. **Cloudflare:** Ist der Dienst Auftragsverarbeiter? Gibt es einen Vertrag zur Auftragsverarbeitung (AVV/DPA)? Wie ist der DPF-Status? Reicht der neue Abschnitt der Datenschutzerklärung?
2. **Cloudflare-Fehlerberichte (NEL/Report-To):** Fällt das unter § 25 TDDDG? Reicht ein Hinweis, oder sollte NEL abgeschaltet werden?
3. **GitHub Pages:** Braucht es einen AVV/DPA? Reicht der Verweis auf das DPF? Wie lange werden die Logs gespeichert?
4. **Formspree:** Sind ein DPA bzw. Standardvertragsklauseln (SCC) tatsächlich vereinbart? Ist die Formulierung in Abschnitt 3 korrekt? Wie lange wird gespeichert?
5. **Rechtsgrundlage des Kontaktformulars:** Einwilligung (lit. a) und/oder lit. b/f?
6. **Gmail-Postfach:** Ist ein privates Gmail-Postfach für geschäftliche Anfragen zulässig (Auftragsverarbeitung, Angabe in der Datenschutzerklärung)?
7. **Impressum:**
   - echte Anschrift, Telefon, USt-ID (oder Wegfall)
   - Handwerkskammer, Handwerksrolle, Berufsbezeichnung und Staat der Verleihung
   - Aufsichtsbehörde
   - Berufshaftpflicht nach DL-InfoV
   - Formulierung zum VSBG
8. **§ 18 Abs. 2 MStV:** Ist die Angabe „Verantwortlich für den Inhalt“ nötig?
9. **Speicherdauern** konkret benennen.
10. **Nach dem nächsten Deployment** die Datenschutzerklärung erneut gegen den Live-Stand abgleichen.
