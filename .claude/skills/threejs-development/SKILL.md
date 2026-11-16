---
name: neckair-threejs-development
description: Regeln und Vorgehen für das interaktive 3D-Haus der NECKAIR-Website (three.js, React Three Fiber, Drei). Verwenden bei jeder Änderung in src/components/house/.
---
# 3D-Haus entwickeln

## Architektur
```
src/components/house/
  model.ts            Daten: Maße, Räume, Leitungen, Bauteile (Erklärtext, Link) – ohne React
  HouseExperience.tsx Client-UI: Modi, Etagen, Schalter, Bauteil-Liste, Infokarte; lädt die Szene lazy
  HouseScene.tsx      R3F-Canvas: Gelände, EG, OG, Dach, Fassade, Systeme, Kamera
```
Zustand (Modus, Etage, Dach, Wände, Auswahl) lebt in `HouseExperience` und wird als Props an die Szene gereicht.

## Modularität
Gelände, Terrasse, EG, OG, Dach, Außenwände, Innenwände, Fenster sowie die Systeme Wärme, Wasser, Kälte sind eigene Gruppen mit eigener Sichtbarkeit/Opazität. Nie zu einem Mesh verschmelzen, das sich nicht mehr einzeln steuern lässt.

## Neues Bauteil hinzufügen
1. In `model.ts` unter `COMPONENTS` eintragen: `id`, `system`, `title`, `text`, `href`, `focus` (Kamera-Ziel), `position`.
2. Geometrie in `HouseScene.tsx` im passenden System rendern und mit `usePick(id)` anklickbar machen.
3. Die Bauteil-Liste und die Infokarte übernehmen es automatisch.

## Performance
- `next/dynamic(..., { ssr: false })`, Laden erst bei Sichtbarkeit bzw. Klick.
- `frameloop` auf `"never"`, wenn außerhalb des Viewports.
- Geometrien/Materialien per `useMemo` teilen, Instancing für Wiederholungen (Lamellen, Bäume, Flusspunkte).
- Mobil: `dpr` ≤ 1.5, Schattenkarte 1024, keine Flusspartikel bei reduzierter Bewegung.

## Datenschutz
Keine externen Assets: kein `Environment preset`, kein Drei-`Text`, keine Remote-Texturen. Licht über `Environment` + `Lightformer`.

## Barrierefreiheit
Jede Aktion im Canvas ist auch über Buttons möglich. Der Canvas ist `aria-hidden`; die Bauteil-Liste ist die zugängliche Darstellung. Infokarte mit `aria-live="polite"`.

## Fallback
Ohne WebGL: Standbild (`haus-3d` aus assets-src) plus Bauteil-Liste.

## Ausbaustufen
1. (umgesetzt) Prozedurales Modell mit PBR-Materialien und Lightformer-Licht.
2. In Blender modelliertes GLB je Gebäudeteil (Draco-komprimiert, selbst gehostet) mit gebackener Beleuchtung.
3. Echte Projektdaten (Grundrisse realer Referenzen) als Szenarien.
