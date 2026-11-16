---
name: neckair-gdpr-audit
description: Technische DSGVO-/TDDDG-Prüfung der NECKAIR-Website. Verwenden für Datenschutz-Audits, neue Drittanbieter, Formulare, Cookies oder externe Medien. Gibt keine Rechtsberatung.
---
# DSGVO-Audit (technisch)

## Grundsätze
- Keine Garantie rechtlicher Konformität.
- Jeden Punkt einordnen: **technisch geprüft** · **organisatorisch nötig** · **rechtlich zu prüfen**.
- Keine Rechtstexte erfinden; Formulierungen als Entwurf kennzeichnen.

## Ablauf
1. Externe Verbindungen im Build finden:
   ```bash
   grep -rhoE "https?://[a-zA-Z0-9.-]+" out --include=*.html --include=*.js | sort | uniq -c | sort -rn
   ```
   Beim Seitenaufruf dürfen nur eigene Ressourcen geladen werden.
2. Speicher: `grep -rn "localStorage\|sessionStorage\|document.cookie" src`.
3. Live passiv: `curl -sI` – setzt der CDN Cookies? Werden Reporting-Endpunkte (NEL) übermittelt?
4. Formular: Empfänger (Formspree, USA), Pflichtfelder nur, was nötig ist, Einwilligung nicht vorangekreuzt, Hinweis auf Datenschutzerklärung.
5. Datenschutzerklärung mit dem tatsächlichen Verhalten abgleichen: Hosting (GitHub Pages), CDN (Cloudflare), Formular (Formspree), Terminbuchung (Google, nur als Link), Schriften (lokal).
6. Consent: Nur nötig, wenn nicht notwendige Dienste/Cookies eingesetzt werden. Falls doch: Ablehnen gleichwertig zum Akzeptieren, nichts vorangekreuzt, externe Medien erst nach Klick.

## Bericht
`NECKAIR-PRIVACY-REPORT.md` mit Liste „für Datenschutzexperten/Anwalt“.
