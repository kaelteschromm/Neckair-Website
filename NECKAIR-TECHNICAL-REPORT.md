# NECKAIR 2.0 – Technischer Bericht

**Stand:** 16.11.2026 · **Basis:** Tag `v3-vor-neckair-2` (Sicherungspunkt vor allen Änderungen)
**Deployment:** Die Änderungen sind lokal committet, aber **nicht veröffentlicht**. Ein Push auf `main` löst das Deployment auf hünig.com aus und braucht deine Freigabe.

## 1. Bestandsaufnahme (Phase 1)

| Bereich | Ergebnis |
|---|---|
| Framework | Next.js 16 (App Router), statischer Export, React 19, TypeScript, Tailwind 4, Motion 12. **Beibehalten.** |
| Hosting | GitHub Pages über GitHub Actions, Domain über Cloudflare |
| Seiten | Start, Heizung, Sanitär & Trinkwasser, Klima & Kälte, Referenzen (+7 Demo-Detailseiten), Unternehmen, Kontakt, Impressum, Datenschutz, AGB, Nutzungsbedingungen, 404, Weiterleitungen alter Adressen |
| Stärken | Lokale Schriften, AVIF/WebP-Bilder, kein Tracking, reduzierte Bewegung durchgängig, Anfrage-Assistent mit Validierung, JSON-LD, Demo-Projekte klar gekennzeichnet |
| Schwächen | Slogan an 5 Stellen, schematisches 3D-Drahtmodell, keine Sicherheits-Header, keine Tests und kein Linter, Cloudflare in der Datenschutzerklärung nicht genannt, sharp mit bekannter Lücke |

## 2. Was wurde verändert?

- **Marke:** Der Slogan „Handwerk mit Ingenieursblick“ ist vollständig entfernt: Hero, Footer, Unternehmen (Titel und Meta), Firmenbeschreibung und Metadaten. Ein Unit-Test verhindert, dass er wiederkommt. Es gibt keinen neuen Slogan, die Leitidee „Gebäudetechnik aus einer Hand“ bleibt.
- **Startseite:**
  - Hero-Text nennt sofort die drei Gewerke.
  - Ortsbezug „Waghäusel und Umgebung“.
  - Der Button führt zum neuen 3D-Haus.
  - Das 3D-Haus ersetzt den alten Gebäude-Explorer.
- **3D-Haus:** neu, siehe Abschnitt 4.
- **Leistungsseiten:**
  - Leistungen gemäß Brief ergänzt:
    - Heizung: Heizungsmodernisierung, Heizkörper, Heizlast und Planung
    - Sanitär: Trinkwasserinstallation, Rohrleitungen, Armaturen, Hygiene
  - Neuer Abschnitt „Projekte aus diesem Gewerk“ (interne Verlinkung)
  - Link „… im 3D-Haus erkunden“
  - Einsatzgebiet genannt
  - Breadcrumb-Daten
- **Referenzen:** Detailseiten mit „Eingesetzte Technik“. Die Demo-Kennzeichnung und `noindex` bleiben.
- **Unternehmen:**
  - Neuer Titel „Gebäudetechnik aus einer Hand.“
  - Geschlechtsneutrale Formulierung zum Inhaber
  - Werbeversprechen „schnelle Reaktionszeit“ entfernt
  - Einsatzgebiet genannt
- **Kontakt:**
  - Einsatzgebiet ergänzt
  - Formular:
    - Längenbegrenzungen
    - Einwilligungsnachweis
    - Spamfeld an Formspree
    - USA-Hinweis
- **Datenschutz:**
  - Cloudflare ergänzt
  - vollständige Feldliste des Formulars
  - Formulierung zur Verschlüsselung korrigiert
- **SEO:**
  - Regionale Titles und Descriptions
  - Open-Graph-Bild `public/og.jpg` (aus dem 3D-Haus gerendert)
  - Twitter-Card
  - `areaServed` mit Waghäusel, Wiesloch, Walldorf und Sandhausen
- **Sicherheit:**
  - Meta-CSP und Referrer-Policy
  - JSON-LD-Escaping
  - Workflow mit minimalen Rechten und SHA-gepinnten Actions
  - Dependabot
  - `security.txt`
  - sharp 0.35.5 und Next 16.4.6 (`npm audit`: 0)
- **Qualität:**
  - ESLint (Next-Konfiguration), bestehende React-Hook-Befunde behoben
  - Unit-Tests
  - Playwright-E2E-Tests
  - Messskript für Bundle-Größen

## 3. Neue Funktionen

- Interaktives 3D-Haus mit Architektur- und Technikmodus, Gewerkfilter, Dach-, Wand- und Etagensteuerung, anklickbaren Bauteilen
- Bauteil-Liste als barrierefreie Alternative zum 3D-Modell
- Vollbildmodus (auf Touch-Geräten Standard)
- Ersatzdarstellung ohne WebGL
- Regionale strukturierte Daten, OG-Bild, `security.txt`
- `npm run check` als vollständiger Qualitätslauf

## 4. Das 3D-Haus

**Technik:** three.js 0.187, React Three Fiber 9, Drei 10.

Begründung: R3F passt zur bestehenden React-Architektur, und Zustand sowie Interaktion lassen sich deklarativ steuern. Ein Blender-Modell (GLB) war ohne Modellierungswerkzeug und ohne lizenzfreie Vorlage nicht verfügbar. Deshalb ist das Haus **im Code modelliert**, ohne fremde Modelle und ohne Lizenzfragen.

**Aufbau** (`src/components/house/`):
- `model.ts`: reine Daten und Geometrie-Hilfen, per Unit-Test geprüft. Enthält Wände mit Fenster- und Türöffnungen, Decken, Böden, Treppe, Leitungsverläufe und 18 Bauteile mit Erklärtext.
- `HouseScene.tsx`: Die Szene ist in getrennt steuerbare Gruppen gegliedert:
  - Gelände und Terrasse
  - EG (Putzfassade)
  - OG (dunkle Holzfassade)
  - Flachdach und Gründach
  - Innenwände, Möbel, Treppe
  - die Systeme Wärme, Wasser und Kälte
- `HouseExperience.tsx`: Bedienoberfläche, Bauteil-Liste, Infokarte. Lädt die Szene per `next/dynamic` erst bei Bedarf.

**Inhalt:**
- **Wärme:** Wärmepumpe (drehender Lüfter), Inneneinheit, Pufferspeicher, Heizkreisverteiler EG und OG, Fußbodenheizung in beiden Etagen, Badheizkörper
- **Wasser:** Hausanschluss mit Zähler und Filter, Warmwasserspeicher, Kalt- und Warmwasser sowie Zirkulation, Dusche, Waschtisch, WC, Küchenspüle
- **Kälte:** Multisplit-Außengerät auf dem Dach, drei Innengeräte, Kältemittelleitungen, Luftströmung, klimatisierte Räume

Die Flüsse sind als wandernde Punkte sichtbar (instanziert, eine Draw-Call-Gruppe je Farbe).

**Interaktion:**
- Drehen, Zoomen und Verschieben (CameraControls)
- Tastatur-Buttons für Drehen, Zoomen und Zurücksetzen
- Ein Klick auf ein Bauteil hebt es hervor, fährt die Kamera hin und öffnet eine Infokarte mit Link zur Leistungsseite

**Performance:**
- Eigener Chunk (280 KB gzip), wird erst beim Scrollen zum Haus (Desktop) bzw. per Klick (Touch) geladen.
- Rendert nicht, solange das Haus außerhalb des Sichtbereichs ist.
- Auf Mobilgeräten: geringere Auflösung, kleinere Schatten, weniger Details.
- Licht entsteht lokal über Lightformer, es gibt keine externen Assets.

**Barrierefreiheit:**
- Canvas `aria-hidden`; die Bauteil-Liste ist die zugängliche Darstellung.
- `aria-live`-Ansage, Vollbild als Dialog mit Esc und Fokus-Rückgabe.
- Bei reduzierter Bewegung gibt es keine Kamerafahrten und keine Flussanimation.

**Ehrliche Grenze:** Das Haus wirkt wie ein hochwertiges Architekturmodell, ist aber **nicht fotorealistisch**.

**Ausbaustufen:**
1. In Blender modellierte GLB-Dateien je Gebäudeteil, Draco-komprimiert und selbst gehostet, mit gebackener Beleuchtung und echten Materialien.
2. Grundrisse realer Referenzprojekte als Szenarien.
3. Gewerbe-Kältetechnik als eigene Szene (Kühlzelle, Serverraum).

## 5. Skills und Agenten

**Neu erstellt** (projektbezogen in `.claude/`, im Repo versioniert). Die Skills tragen das Präfix `neckair-`, damit sie nicht mit gleichnamigen globalen Skills kollidieren.

| Skill | Zweck |
|---|---|
| `neckair-frontend-design` | Designsystem, Marke, Tokens, Checkliste |
| `neckair-threejs-development` | Aufbau und Regeln des 3D-Hauses, Ausbaustufen |
| `neckair-responsive-design` | Breakpoints, Prüfgrößen, Touch-Regeln |
| `neckair-seo-audit` | Ablauf mit regionalen Regeln (keine Fake-Standorte) |
| `neckair-performance-audit` | Messung, Budgets |
| `neckair-security-audit` | OWASP-Checkliste, nur passiv |
| `neckair-gdpr-audit` | DSGVO-Prüfung technisch/organisatorisch/rechtlich |
| `neckair-accessibility-audit` | WCAG 2.2 AA inkl. 3D |
| `neckair-code-review` | Projekt-Checkliste |
| `neckair-website-testing` | Testbefehle und Abdeckung |

| Agent | Werkzeuge | Grenze |
|---|---|---|
| web-architect | Read, Grep, Glob, Bash | nur beraten |
| ui-ux-designer | Read, Grep, Glob | nur prüfen |
| threejs-specialist | inkl. Edit/Write | kein Deployment, keine neuen Pakete ohne Rückfrage |
| frontend-developer | inkl. Edit/Write | kein Deployment/Push |
| seo-specialist, performance-engineer, accessibility-auditor, code-reviewer | Read, Grep, Glob, Bash | nur berichten |
| security-auditor, privacy-auditor | Read, Grep, Glob, Bash | unabhängig, nur passiv, keine Änderungen |

**Externe Skills:** In dieser Phase wurden **keine neuen installiert**. Die bereits vorhandenen globalen Skills haben den Brief abgedeckt:
- frontend-design (Anthropic)
- react-best-practices (Vercel)
- animate, find-animation-opportunities, review-animations (Emil Kowalski)
- ui-ux-pro-max

Impeccable ist weiterhin lokal installiert, aber **aus dem öffentlichen Repo entfernt**.

**Subagenten:** Security- und Privacy-Prüfung liefen als unabhängige Agenten parallel zur Entwicklung (siehe die beiden Berichte).

## 6. Performance

| Messwert | Vorher | Nachher |
|---|---|---|
| Initiales JS Startseite (gzip) | 242 KB | 249 KB (Budget 260 KB) |
| 3D-Bibliotheken im Initial-Bundle | – | **nein**, eigener Chunk 280 KB, nur bei Bedarf |
| Fremdverbindungen beim Seitenaufruf | 0 | 0 (per Test geprüft) |

Lighthouse und Core Web Vitals sind erst nach dem Deployment auf der echten Domain aussagekräftig (PageSpeed Insights).

## 7. Tests (alle bestanden)

| Prüfung | Ergebnis |
|---|---|
| `tsc --noEmit` | ✓ |
| `eslint .` | ✓ 0 Befunde |
| Unit-Tests (`node --test`) | ✓ 13/13 (Hausmodell, Inhaltsregeln, noopener) |
| `next build` | ✓ |
| Bundle-Budget | ✓ |
| Playwright E2E (Desktop 1440, Tablet 820, Smartphone 390) | ✓ 65 bestanden, 7 bewusst übersprungen (nur gerätespezifisch) |

E2E-Abdeckung:
- alle 12 Seiten: Status, eine h1, kein Überlauf, Alt-Texte, keine Konsolenfehler
- 404 und Weiterleitungen
- keine Fremdverbindungen, keine Cookies und kein Web Storage
- Navigation inkl. Mobilmenü und Skip-Link
- reduzierte Bewegung
- Anfrage-Assistent komplett mit abgefangenem Versand
- 3D-Haus: lädt nicht vorab, Modi, Etagen, Bauteilauswahl, Tastatur, Vollbild mit Esc, Fallback ohne WebGL

Aufruf: `npm run check` (oder einzeln `npm run lint`, `npm test`, `npm run test:e2e`).

## 8. Was braucht deine Zustimmung?

1. **Deployment auf hünig.com** (Push auf `main`).
2. **Cloudflare- und GitHub-Einstellungen:** HTTPS-Weiterleitung, HSTS, TLS 1.2, Sicherheits-Header, SSL „Full (strict)“, E-Mail-Verschleierung aus. Anleitung im Security-Bericht.
3. **Formspree-Dashboard:** Domain-Beschränkung und Spam-Filter.

## 9. Offene Aufgaben

- **Echte Firmendaten:** Straße, Telefon, USt-ID, Öffnungszeiten, handwerksrechtliche Impressumsangaben.
- **Inhalte:** Porträtfoto, echte Referenzprojekte mit Fotos statt Demo-Projekten.
- **Geschäftliche E-Mail-Adresse** statt Gmail (Datenschutz und Spam).
- **Rechtliche Prüfung** der Punkte im Datenschutzbericht (Abschnitt 5).
- **Nach dem Deployment:** Header-, Datenschutz- und PageSpeed-Prüfung gegen live wiederholen.
- **Später:**
  - fotorealistischere 3D-Ausbaustufe (Blender/GLB)
  - Major-Updates (motion 14, eslint 10, typescript 7) geplant einspielen
  - R3F gibt mit three 0.187 eine Deprecation-Warnung aus (`THREE.Clock`), harmlos, verschwindet mit einem R3F-Update

## 10. Nachtrag: Hero-Motiv und Scrollgeschichte (Startseite)

**Ziel laut Brief:** ein großformatiges Architekturmotiv eines modernen, realistisch erreichbaren Einfamilienhauses, wie es in Wiesloch, Walldorf oder Sandhausen stehen könnte. Beim Scrollen folgt ein eleganter Übergang ins 3D-Haus, das auf **demselben Gebäudekonzept** aufbaut.

**Umsetzung:**
- **Architektur** (`src/components/house/model.ts`, `scene-core.tsx`):
  - zwei Geschosse, Flachdach mit schlanker Attika
  - heller Putz (EG weiß, OG hellgrau), anthrazitfarbene Fenster mit Raffstores und Fensterbänken
  - Lärchenholz-Lamellen und Naturstein als Akzente
  - PV-Anlage in Ost-West-Aufständerung, Gründach über dem eingeschossigen Teil
  - Terrasse aus großformatigen Natursteinplatten, Kiesstreifen, Hainbuchenhecken, Laubbäume
  - Materialien sind prozedurale Texturen (`textures.ts`), es gibt keine externen Bilddateien.
- **Hero-Bild = Rendering derselben Szene** per Pathtracing (`three-gpu-pathtracer`, MIT, nur als Entwicklungswerkzeug):
  - Licht: später Nachmittag, warme tiefe Sonne aus Westsüdwest, beleuchtete Innenräume
  - Kamera wie in der Architekturfotografie: waagerecht mit Shift, ohne stürzende Linien
  - zwei Formate: Querformat 2400 × 1350, Hochformat 1200 × 2133
- **Scrollgeschichte** (`HouseExperience.tsx`):
  1. Hero mit „Heizung. Sanitär. Klima. Kälte.“
  2. Das Bild wird unscharf und gibt das Echtzeit-3D **aus exakt demselben Blickwinkel** frei. `camera.ts` rechnet dafür den Bildausschnitt von `object-fit: cover` in Bildwinkel und Shift der 3D-Kamera um.
  3. Die Kamera fährt in die Übersicht, das Dach hebt ab, die Wände werden transparent.
  4. Kapitel Wärme, Wasser, Kälte.
  5. Danach übernimmt der Besucher (Bedienleiste, Bauteil-Liste, Vollbild).
- **Ruhige Variante:** Bei reduzierter Bewegung oder ohne WebGL zeigt die Seite das Hero-Bild ohne Scrolleffekte, darunter das 3D-Haus im Rahmen bzw. die Bauteil-Liste.

**Hero neu rendern** (z. B. nach Änderungen am Modell):
```bash
RENDER_HERO=1 npx next dev -p 3005      # lokale Render-Seite /render-hero/ (wird nie veröffentlicht)
node scripts/render-hero.mjs 900        # ca. 30 min auf einer Iris-Xe-GPU
npm run images
```

**Ehrlicher Hinweis:** Das Hero-Bild ist ein physikalisch berechnetes Rendering, kein Foto. Es kann jederzeit durch ein echtes Architekturfoto eines NECKAIR-Projekts ersetzt werden: `assets-src/photos/haus-hero.jpg` und `haus-hero-hoch.jpg` austauschen. Der Übergang ins 3D ist dann allerdings nicht mehr deckungsgleich.
