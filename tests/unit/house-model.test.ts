// Unit-Tests für das Datenmodell des 3D-Hauses (Node-Testrunner, ohne Abhängigkeiten).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CLADDING, COMPONENTS, HERO_POSES, PIPES, SITE, SYSTEM_ORDER, WALLS, blindsFor, measure, pathLevels, pipeComponent, pointAt, serpentine, sillsFor, wallBoxes, windowParts,
  type Vec3, type WallDef,
} from "../../src/components/house/model.ts";
import { coverFrame } from "../../src/components/house/camera.ts";

const area = (w: WallDef) => (w.to - w.from) * (w.top - w.bottom);
const boxArea = (w: WallDef) =>
  wallBoxes(w).reduce((sum, b) => sum + (w.axis === "x" ? b.size[0] : b.size[2]) * b.size[1], 0);

test("Wand ohne Öffnung ergibt genau einen Quader", () => {
  const w: WallDef = { axis: "x", at: 0, from: -2, to: 2, bottom: 0, top: 3, thick: 0.3, level: "eg", exterior: true };
  const boxes = wallBoxes(w);
  assert.equal(boxes.length, 1);
  assert.deepEqual(boxes[0].size, [4, 3, 0.3]);
});

test("Öffnungen werden aus der Wandfläche ausgespart", () => {
  for (const w of WALLS) {
    const openings = (w.openings ?? []).reduce((s, o) => s + (o.to - o.from) * (o.top - o.bottom), 0);
    assert.ok(Math.abs(boxArea(w) - (area(w) - openings)) < 1e-6, `Wand bei ${w.axis}=${w.at} (${w.level})`);
  }
});

test("Öffnungen liegen innerhalb ihrer Wand und überlappen nicht", () => {
  for (const w of WALLS) {
    const ops = [...(w.openings ?? [])].sort((a, b) => a.from - b.from);
    ops.forEach((o, i) => {
      assert.ok(o.from >= w.from && o.to <= w.to, "innerhalb der Länge");
      assert.ok(o.bottom >= w.bottom && o.top <= w.top, "innerhalb der Höhe");
      if (i) assert.ok(ops[i - 1].to <= o.from, "keine Überlappung");
    });
  }
});

test("Innenwände bekommen kein Glas, Außenwände je Öffnung eine Scheibe", () => {
  for (const w of WALLS) {
    const { glass } = windowParts(w);
    assert.equal(glass.length, w.exterior ? (w.openings ?? []).length : 0);
  }
});

test("Bauteile: eindeutige IDs, Texte vorhanden, jedes Gewerk vertreten", () => {
  const ids = new Set(COMPONENTS.map((c) => c.id));
  assert.equal(ids.size, COMPONENTS.length);
  for (const c of COMPONENTS) {
    assert.ok(c.title.length > 3 && c.text.length > 40, c.id);
    assert.ok(Math.hypot(...c.view) > 2, `Kamera nicht im Bauteil: ${c.id}`);
  }
  for (const s of SYSTEM_ORDER) assert.ok(COMPONENTS.filter((c) => c.system === s).length >= 3, s);
});

test("Leitungen verweisen nur auf existierende Bauteile", () => {
  const ids = new Set(COMPONENTS.map((c) => c.id));
  for (const p of PIPES) {
    const comp = pipeComponent(p);
    if (comp) assert.ok(ids.has(comp), comp);
    assert.ok(p.pts.length >= 2);
  }
});

test("pointAt liefert Anfang, Ende und Zwischenpunkte", () => {
  const pts: Vec3[] = [[0, 0, 0], [2, 0, 0], [2, 2, 0]];
  const { cum, length } = measure(pts);
  assert.equal(length, 4);
  const out: Vec3 = [0, 0, 0];
  assert.deepEqual(pointAt(pts, cum, 0, out), [0, 0, 0]);
  assert.deepEqual(pointAt(pts, cum, 3, out), [2, 1, 0]);
  assert.deepEqual(pointAt(pts, cum, 99, out), [2, 2, 0]);
});

test("Schlangenverlegung wechselt die Richtung je Reihe", () => {
  const s = serpentine(0, 0, 5, 0, 1, 0.5);
  assert.equal(s.length, 6);
  assert.deepEqual([s[0][0], s[1][0], s[2][0], s[3][0]], [0, 5, 5, 0]);
});

test("Geschosszuordnung von Leitungen", () => {
  assert.deepEqual([...pathLevels([[0, 0.1, 0], [0, 0.2, 0]])], ["eg"]);
  assert.deepEqual([...pathLevels([[0, 0.1, 0], [0, 4, 0]])].sort(), ["eg", "og"]);
});

test("Raffstores und Fensterbänke nur an Außenwänden", () => {
  for (const w of WALLS) {
    const blinds = blindsFor(w), sills = sillsFor(w);
    if (!w.exterior) {
      assert.equal(blinds.length, 0);
      assert.equal(sills.length, 0);
    } else {
      assert.equal(blinds.length, (w.openings ?? []).length);
      // Fensterbänke nur bei Fenstern mit Brüstung, nicht bei bodentiefen Elementen
      assert.equal(sills.length, (w.openings ?? []).filter((o) => o.bottom > w.bottom + 0.05).length);
    }
  }
});

test("Hero-Blickwinkel: waagerechte Kamera (keine stürzenden Linien) innerhalb des Grundstücks", () => {
  for (const pose of [HERO_POSES.landscape, HERO_POSES.portrait]) {
    assert.equal(pose.pos[1], pose.target[1], "Kamera blickt waagerecht");
    assert.ok(pose.fov > 20 && pose.fov < 70);
  }
  assert.ok(HERO_POSES.landscape.pos[0] > SITE.plot.minX, "Kamera steht im Garten, nicht hinter der Hecke");
});

test("Bildausschnitt folgt object-fit: cover", () => {
  const pose = HERO_POSES.landscape;
  assert.deepEqual(coverFrame(pose, pose.aspect), { fov: pose.fov, shift: pose.shift });
  const wide = coverFrame(pose, pose.aspect * 1.5);
  assert.ok(wide.fov < pose.fov, "breiterer Bildschirm schneidet oben/unten ab → engerer Bildwinkel");
  assert.ok(Math.abs(wide.shift - pose.shift * 1.5) < 1e-9);
  assert.deepEqual(coverFrame(pose, 1), { fov: pose.fov, shift: pose.shift });
});

test("Fassadenakzente liegen an Außenflächen und in gültiger Höhe", () => {
  for (const c of CLADDING) {
    assert.ok(c.to > c.from && c.top > c.bottom);
    assert.ok(Math.abs(c.face) >= 4.5, "vor der Außenwand");
  }
});
