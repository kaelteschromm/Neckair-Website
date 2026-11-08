# Neckair – Website

Neuer Webauftritt der Neckair (Heizung · Sanitär · Klima · Lüftung).
Next.js (App Router, statischer Export) · TypeScript · Tailwind CSS 4 · Motion.

## Lokal starten

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # statische Seite in ./out
```

## Struktur

| Pfad | Inhalt |
|---|---|
| `src/app/` | Seiten: Start, Heizung, Sanitär, Klima, Lüftung, Referenzen, Unternehmen, Kontakt, Impressum, Datenschutz |
| `src/content/services.ts` | Texte der vier Leistungsseiten (Leistungen, FAQ, Zielgruppen) |
| `src/content/references.ts` | Referenzprojekte (`example: true` = Beispielprojekt, wird gekennzeichnet) |
| `src/lib/site.ts` | Firmendaten: Adresse, Telefon, E-Mail, Formular-Endpunkt, Terminbuchung |
| `src/components/` | Header, Footer, Logo, Animationen (`motion.tsx`), Formular … |
| `assets-src/photos/` | Original-Fotos – werden beim Build automatisch in AVIF/WebP-Größen umgewandelt |

## Vor dem Livegang

- Platzhalter in `src/lib/site.ts` ersetzen (Straße, Telefon, USt-ID, Öffnungszeiten – mit `PLATZHALTER` markiert)
- Beispielprojekte in `references.ts` durch echte Projekte ersetzen
- Porträtfoto des Inhabers auf der Seite „Unternehmen“ einsetzen
- Eigene Projektfotos in `assets-src/photos/` ablegen (gleicher Dateiname ersetzt das Bild)
- Für die eigene Domain: `NEXT_PUBLIC_BASE_PATH` leer lassen und `NEXT_PUBLIC_SITE_URL` setzen

## Vorschau

Jeder Push auf `main` baut die Seite per GitHub Actions und veröffentlicht sie auf GitHub Pages.
