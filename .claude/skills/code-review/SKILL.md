---
name: neckair-code-review
description: Projektspezifische Review-Checkliste für die NECKAIR-Website. Verwenden vor Commits größerer Änderungen; ergänzt das eingebaute /code-review.
---
# Code-Review NECKAIR

## Vorgehen
1. `git diff --stat` und `git diff` lesen.
2. Checkliste unten durchgehen, nur echte Probleme melden (Datei:Zeile, Fehlerszenario).
3. `npm run typecheck && npm run lint && npm test` ausführen.

## Checkliste
- **Korrektheit:** Randfälle, leere Listen, Server/Client-Unterschiede (Hydration), Effekte mit Cleanup.
- **3D:** Keine Allokation in `useFrame`, Geometrien/Materialien geteilt, keine externen Assets.
- **Next.js:** `"use client"` nur wo nötig; schwere Module per `next/dynamic`; Pfade mit `trailingSlash`.
- **Inhalt:** Keine erfundenen Daten, kein gestrichener Slogan, keine Lüftung, Marke „NECKAIR“.
- **Sicherheit:** Kein neues `dangerouslySetInnerHTML`, externe Links mit `noopener noreferrer`, keine Secrets.
- **Barrierefreiheit:** Buttons statt klickbarer divs, Labels, Fokus.
- **Bewegung:** Tokens statt eigener Kurven, reduzierte Bewegung berücksichtigt.
