---
name: neckair-website-testing
description: Testablauf der NECKAIR-Website – Typecheck, Lint, Unit-Tests, Build und Playwright-E2E auf Desktop, Tablet und Smartphone. Verwenden nach jeder größeren Änderung.
---
# Website-Tests

## Befehle
| Schritt | Befehl |
|---|---|
| Typen | `npm run typecheck` |
| Lint | `npm run lint` |
| Unit | `npm test` (Node-Testrunner, `tests/unit/*.test.ts`) |
| Build | `npm run build` |
| E2E | `npm run test:e2e` (Playwright mit installiertem Microsoft Edge, kein Browser-Download) |
| Alles | `npm run check` |

## E2E-Abdeckung (`tests/e2e/`)
- Alle Routen laden mit Status 200, ohne Konsolenfehler, genau eine h1, kein horizontaler Überlauf.
- Navigation: Header-Links, Mobilmenü, Leistungs-Dropdown.
- Anfrage-Assistent: Validierung je Schritt, Absenden mit abgefangenem Request (es wird nie wirklich gesendet).
- 3D-Haus: lädt, Moduswechsel, Bauteil-Auswahl per Liste zeigt Infokarte, Fallback ohne WebGL.
- Reduzierte Bewegung: Inhalte sichtbar.

## Hinweise
- WebGL im Headless-Edge läuft über SwiftShader (`--use-angle=swiftshader`).
- Die Tests laufen gegen den statischen Export (`out/`), den Playwright über einen lokalen Server startet.
- Nie eine fehlerhafte Funktion als fertig melden: Fehlschläge mit Ausgabe berichten.
