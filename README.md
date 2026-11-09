# NECKAIR – Website

Webauftritt von NECKAIR: Heizung, Sanitär & Trinkwasser, Klima & Kälte.
Konzept „Der lebendige Bauplan“ – Next.js (statischer Export), TypeScript, Tailwind CSS 4, Motion.
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
| `src/app/` | Seiten: Start, Heizung, Sanitär & Trinkwasser, Klima & Kälte, Referenzen (+ Detailseiten), Unternehmen, Kontakt, Rechtliches |
| `src/content/services.ts` | Texte der vier Leistungsseiten (Leistungen, FAQ, Zielgruppen) |
| `src/content/references.ts` | Referenzprojekte (`example: true` = Beispielprojekt, wird gekennzeichnet) |
| `src/lib/site.ts` | Firmendaten: Adresse, Telefon, E-Mail, Formular-Endpunkt, Terminbuchung |
| `src/components/` | Header, Footer, Logo, Animationen (`motion.tsx`), Formular … |
| `assets-src/photos/` | Original-Fotos – werden beim Build automatisch in AVIF/WebP-Größen umgewandelt |

## Visuelle Effekte & Motion

| Komponente | Zweck |
|---|---|
| `src/components/building/` | Das NECKAIR-Gebäude: eigene 3D-Projektion (BuildingCanvas), Scrolltelling der Startseite (BuildingStory), interaktives Gebäude (BuildingExplorer) |
| `src/components/drawings/TechDrawing.tsx` | Technische Schnittzeichnungen je Gewerk, die sich beim Scrollen zeichnen |
| `src/components/LightField.tsx` | WebGL-Lichtschicht über den Hero-Bildern (home, heat, water, climate) |
| `src/components/ContactForm.tsx` | Anfrage-Assistent in vier Schritten (Formspree) |
| `src/app/globals.css` | Motion-Tokens `--ease-out`, `--ease-in-out`, `--ease-drawer` (nach Emil Kowalski) |

Alle Effekte pausieren außerhalb des Sichtbereichs und respektieren „Bewegung reduzieren“. Ohne WebGL bleibt das Foto stehen.

## Vor dem Livegang

- Platzhalter in `src/lib/site.ts` ersetzen (Straße, Telefon, USt-ID, Öffnungszeiten – mit `PLATZHALTER` markiert)
- Demo-Projekte in `src/content/references.ts` (`example: true`) durch echte Projekte mit eigenen Fotos ersetzen – Demo-Seiten sind gekennzeichnet und `noindex`
- Porträtfoto des Inhabers auf der Seite „Unternehmen“ einsetzen
- Eigene Projektfotos in `assets-src/photos/` ablegen (gleicher Dateiname ersetzt das Bild)
- Für die offizielle Domain: in `.github/workflows/deploy.yml` `NEXT_PUBLIC_SITE_URL` umstellen und die Custom Domain in den GitHub-Pages-Einstellungen ändern (aktuell Testdomain hünig.com)

## Vorschau

Jeder Push auf `main` baut die Seite per GitHub Actions und veröffentlicht sie auf GitHub Pages.
