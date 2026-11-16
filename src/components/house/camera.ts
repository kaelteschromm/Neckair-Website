// Kamera-Hilfen für das Hero-Motiv: Architekturfotografie mit waagerechter Kamera und Shift (stürzende Linien vermeiden).
// Dieselben Funktionen nutzt das Pathtracing-Rendering – so passen Bild und Echtzeit-3D exakt übereinander.
import type * as THREE from "three";
import type { HeroPose } from "./model";

const RAD = Math.PI / 180;

/**
 * Das Hero-Bild wird per object-fit: cover dargestellt. Ist der Bildschirm breiter als das Bild, wird oben und unten
 * beschnitten – dann muss auch die 3D-Kamera enger werden (kleinerer vertikaler Bildwinkel, proportional größerer Shift).
 */
export function coverFrame(pose: HeroPose, canvasAspect: number): { fov: number; shift: number } {
  if (canvasAspect <= pose.aspect) return { fov: pose.fov, shift: pose.shift };
  const k = canvasAspect / pose.aspect;
  const fov = (2 * Math.atan(Math.tan((pose.fov * RAD) / 2) / k)) / RAD;
  return { fov, shift: pose.shift * k };
}

/** Setzt Bildwinkel und vertikalen Shift (verschiebt den Bildausschnitt, ohne die Kamera zu neigen). */
export function applyLens(camera: THREE.PerspectiveCamera, fov: number, shift: number) {
  camera.fov = fov;
  camera.updateProjectionMatrix();
  if (shift !== 0) {
    camera.projectionMatrix.elements[9] = shift;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  }
}
