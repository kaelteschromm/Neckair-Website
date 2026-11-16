---
name: neckair-responsive-design
description: Responsive-Regeln und Prüfablauf für die NECKAIR-Website (Smartphone, Tablet, Desktop). Verwenden bei Layout-Änderungen und vor jedem Release.
---
# Responsive Design

## Breakpoints (Tailwind 4)
`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280. Mobile first schreiben.

## Prüfgrößen
| Gerät | Viewport |
|---|---|
| Smartphone klein | 360 × 740 |
| Smartphone | 390 × 844 |
| Tablet | 820 × 1180 |
| Desktop | 1440 × 900 |

## Regeln
- `container-x` für seitliche Ränder, kein horizontales Scrollen der Seite (Ausnahme: bewusst scrollbare Schnittzeichnungen in eigenem Container).
- Fluid-Typo mit `clamp()`, Headlines dürfen auf 360 px nicht abgeschnitten werden.
- Touch-Ziele ≥ 44 px auf Mobilgeräten.
- `svh`/`dvh` statt `vh` für Vollbildbereiche.
- 3D-Haus auf Touch-Geräten: Start per Button im Vollbild, damit Wischen die Seite nicht blockiert.

## Automatisch prüfen
`npm run test:e2e` – die Playwright-Tests prüfen alle Seiten in den drei Projekten (desktop, tablet, mobile) auf horizontalen Überlauf.
