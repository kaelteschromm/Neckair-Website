---
name: neckair-seo-audit
description: SEO-Prüfung der NECKAIR-Website mit regionalem Fokus (Waghäusel, Wiesloch, Walldorf, Sandhausen). Verwenden für Audits von Titles, Descriptions, Überschriften, JSON-LD, Sitemap und interner Verlinkung.
---
# SEO-Audit

## Ablauf
1. `npm run build` und die erzeugten HTML-Dateien in `out/` prüfen (das ist, was Google sieht).
2. Je Seite erfassen: `<title>` (≤ 60), `meta description` (≤ 160), Canonical, `og:*`, Anzahl h1 (= 1), robots.
   ```bash
   for f in $(find out -name index.html); do echo "$f"; grep -o '<title>[^<]*' "$f"; grep -c '<h1' "$f"; done
   ```
3. JSON-LD extrahieren und auf Gültigkeit prüfen (`HVACBusiness`, `Service`, `FAQPage`, `BreadcrumbList`).
4. `out/sitemap.xml` gegen die Routen abgleichen; Demo-Referenzen dürfen nicht enthalten sein (noindex).
5. Bilder: jedes inhaltliche Bild hat einen beschreibenden Alt-Text, dekorative `alt=""`.
6. Interne Links: jede Leistungsseite verlinkt Kontakt, passende Referenzen und das nächste Gewerk.

## Regionale Regeln
- Einzugsgebiet ehrlich benennen (Sitz Waghäusel, Kunden in der Umgebung). Keine Fake-Standorte, keine Orts-Doorway-Pages.
- `areaServed` im JSON-LD mit den Orten.
- Kein `aggregateRating` ohne echte Bewertungen.

## Bericht
Tabelle Seite × Kriterium, dann priorisierte Maßnahmen.
