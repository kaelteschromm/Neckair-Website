---
name: neckair-performance-audit
description: Performance-Messung der NECKAIR-Website – Bundle-Größen, Bilder, Core Web Vitals, 3D-Last. Verwenden nach größeren Änderungen und vor Releases.
---
# Performance-Audit

## Messen
1. `npm run build`
2. Initial-JS der Startseite (gzip):
   ```bash
   node scripts/bundle-report.mjs
   ```
   Budget: ≤ 260 KB. three.js/R3F müssen in einem separaten, nachgeladenen Chunk liegen.
3. Bilder: `public/img` – LCP-Bild ≤ 200 KB (AVIF), alle mit `srcset`.
4. Core Web Vitals lokal: `npx serve out` und Lighthouse in Edge/Chrome DevTools (mobil, gedrosselt). Nach Livegang zusätzlich PageSpeed Insights.
5. 3D: Edge DevTools → Performance, 10 s Interaktion aufzeichnen; Ziel ≥ 50 fps Desktop, keine Long Tasks > 50 ms beim Moduswechsel.

## Typische Hebel
- Client-Komponenten verkleinern, Server Components bevorzugen
- `next/dynamic` für schwere, nicht sofort sichtbare Teile
- Canvas außerhalb des Viewports pausieren
- Feste Seitenverhältnisse gegen CLS

## Bericht
Messwert, Methode, Budget, Bewertung, Maßnahme.
