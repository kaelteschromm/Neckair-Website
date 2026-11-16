---
name: neckair-accessibility-audit
description: Barrierefreiheitsprüfung (WCAG 2.2 AA) der NECKAIR-Website inklusive 3D-Haus. Verwenden bei UI-Änderungen und vor Releases.
---
# Accessibility-Audit

## Checkliste
- **Tastatur:** Alles per Tab erreichbar, sinnvolle Reihenfolge, Esc schließt Menüs/Overlays, kein Fokusverlust (Wizard-Schritte, Vollbild-3D).
- **Fokus:** sichtbar auf hellem und dunklem Grund.
- **Kontrast:** Text 4.5:1, große Schrift und UI-Elemente 3:1. Medienfarben auf hell nur als `*-ink`.
- **Struktur:** Landmarks (header, nav, main, footer), genau eine h1, keine übersprungenen Ebenen.
- **Medien:** Alt-Texte; Canvas `aria-hidden` mit zugänglicher Alternative (Bauteil-Liste).
- **Formulare:** sichtbare Labels, `aria-invalid`, `aria-describedby` auf Fehler, Fehler-Zusammenfassung oder Fokus auf erstes Fehlerfeld.
- **Dynamik:** `aria-live` für Filterergebnisse, Infokarten, Formularstatus.
- **Bewegung:** `prefers-reduced-motion` – keine Fahrten/Parallax, Inhalte sofort sichtbar.
- **Zoom:** 200 % ohne Inhaltsverlust; 320 px Breite ohne horizontales Scrollen.

## Automatisch
`npm run test:e2e` enthält Basisprüfungen (eine h1, Alt-Texte, Labels, Tastaturbedienung des 3D-Hauses).

## Manuell
Screenreader-Stichprobe (NVDA/Narrator): Startseite, 3D-Haus über Bauteil-Liste, Anfrage-Assistent.
