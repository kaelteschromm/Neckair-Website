---
name: neckair-frontend-design
description: Designsystem und Gestaltungsregeln der NECKAIR-Website. Verwenden, wenn Seiten, Abschnitte oder Komponenten gestaltet oder überarbeitet werden. Ergänzt den globalen Skill frontend-design um die konkreten NECKAIR-Vorgaben.
---
# NECKAIR Frontend-Design

## Marke
- Name immer „NECKAIR“. **Kein Slogan** – „Handwerk mit Ingenieursblick“ ist gestrichen und darf nirgends erscheinen.
- Leitidee: Gebäudetechnik aus einer Hand – Wärme, Wasser, Kälte.
- Genau drei Gewerke: Heizung · Sanitär & Trinkwasser · Klima & Kälte. Keine Lüftung.

## Tokens (`src/app/globals.css`)
| Zweck | Token |
|---|---|
| Dunkle Bühne | `graphite` #14181d, Text `on-dark`, `on-dark-muted` |
| Markenfarbe | `navy` #0b2239 |
| Heller Grund | `white` #f7f8f8, `kalk` #e7e9e8 |
| Wärme / Wasser / Kälte | `heat` #f07e26, `water` #1e88e5, `cold` #8fd3e8 (+ `*-ink` für Text auf hell) |

Medienfarben ausschließlich für ihr Gewerk verwenden – sie sind Bedeutung, keine Dekoration.

## Typografie
Archivo (breit, `wdth`-Achse) für Headlines, IBM Plex Sans für Fließtext (`measure` begrenzt die Zeilenlänge), Plex Mono (`annot`) nur für technische Beschriftungen.

## Komponenten zuerst wiederverwenden
`PageHero`, `SectionHeading`, `ProcessSection`, `CtaSection` (sections.tsx), `Picture`, `MaskReveal`, `.btn`-Varianten, `.plan-frame`, `.link`, `.press`.

## Bewegung
Kurven `--ease-out`, `--ease-in-out`, `--ease-drawer`. UI ≤ 300 ms. Hover nur unter `(hover: hover) and (pointer: fine)`. Jede Animation hat eine Variante für `prefers-reduced-motion`. Details: globale Skills `animate`, `review-animations`.

## Checkliste vor Abschluss
- [ ] Eine Hauptaussage pro Abschnitt, keine Textwände
- [ ] Keine erfundenen Fakten, Platzhalter erkennbar
- [ ] 360 px ohne horizontales Scrollen
- [ ] Kontraste AA, sichtbarer Fokus
- [ ] Konsistent mit den übrigen Unterseiten
