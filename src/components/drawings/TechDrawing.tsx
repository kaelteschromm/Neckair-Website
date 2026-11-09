"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { useReduceMotion } from "@/lib/useReduceMotion";
import type { Medium } from "@/content/services";

/**
 * Technische Schnittzeichnungen, die sich beim Scrollen selbst zeichnen.
 * Zweck: Erklärung – zeigt, wie das System aufgebaut ist. Der Zeichenfortschritt ist direkt an den
 * Scroll gekoppelt (unterbrechbar, keine Dauer). Danach fließt das Medium als feine Strichlinie
 * (konstante Bewegung → linear). Reduzierte Bewegung: fertige Zeichnung, kein Fließen.
 */
const INK = "#0b2239";
const C = { heat: "#d66818", water: "#1259a8", cold: "#1f6b80", heatSoft: "#f0a066" } as const;

type P = { progress: MotionValue<number>; reduce: boolean };

function Line({ d, from, to, color = INK, width = 1.2, progress, reduce, dash }: P & { d: string; from: number; to: number; color?: string; width?: number; dash?: string }) {
  const len = useTransform(progress, [from, to], [0, 1]);
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dash}
      style={reduce || dash ? { opacity: dash ? len : 1 } : { pathLength: len }}
    />
  );
}

/** Fließendes Medium: feine Strichlinie über der Leitung */
function Flow({ d, color, progress, at, reduce, reverse = false }: P & { d: string; color: string; at: number; reverse?: boolean }) {
  const opacity = useTransform(progress, [at, at + 0.06], [0, 1]);
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeDasharray="2 14"
      className={reduce ? "" : reverse ? "drawing-flow-rev" : "drawing-flow"}
      style={{ opacity }}
    />
  );
}

function Label({ x, y, children, at, progress, anchor = "start", color = INK, lead }: { x: number; y: number; children: string; at: number; anchor?: "start" | "end" | "middle"; color?: string; lead?: string } & Pick<P, "progress">) {
  const opacity = useTransform(progress, [at, at + 0.05], [0, 1]);
  return (
    <motion.g style={{ opacity }}>
      {lead && <path d={lead} fill="none" stroke={INK} strokeWidth={0.8} opacity={0.55} />}
      <text x={x} y={y} textAnchor={anchor} fill={color} className="annot" style={{ fontSize: 16 }}>
        {children}
      </text>
    </motion.g>
  );
}

function Fade({ at, progress, children }: { at: number; children: React.ReactNode } & Pick<P, "progress">) {
  const opacity = useTransform(progress, [at, at + 0.06], [0, 1]);
  return <motion.g style={{ opacity }}>{children}</motion.g>;
}

function Heating(p: P) {
  return (
    <>
      {/* Gelände und Außenwand */}
      <Line {...p} d="M20 500 H300 M300 500 V200 M318 500 V200 M300 200 H318" from={0} to={0.15} />
      <Label {...p} x={309} y={188} at={0.1} anchor="middle">Außenwand</Label>
      <Fade {...p} at={0.05}>
        <path d="M20 500 L40 520 M60 500 L80 520 M100 500 L120 520 M140 500 L160 520 M180 500 L200 520 M220 500 L240 520 M260 500 L280 520" stroke={INK} strokeWidth={0.8} opacity={0.4} />
      </Fade>
      {/* Wärmepumpe */}
      <Line {...p} d="M70 380 H230 V500 H70 Z M150 405 m-38 0 a38 38 0 1 0 76 0 a38 38 0 1 0 -76 0" from={0.08} to={0.22} />
      <Label {...p} x={70} y={365} at={0.2}>Wärmepumpe (außen)</Label>
      {/* Pufferspeicher */}
      <Line {...p} d="M380 280 H450 V500 H380 Z" from={0.18} to={0.3} />
      <Label {...p} x={415} y={265} at={0.28} anchor="middle">Pufferspeicher</Label>
      {/* Heizkreisverteiler */}
      <Line {...p} d="M520 430 H640 V470 H520 Z M545 470 V478 M575 470 V478 M605 470 V478" from={0.26} to={0.36} />
      <Label {...p} x={580} y={415} at={0.34} anchor="middle">Heizkreisverteiler</Label>
      {/* Vorlauf / Rücklauf */}
      <Line {...p} d="M230 420 H380" color={C.heat} width={2} from={0.2} to={0.3} />
      <Line {...p} d="M230 460 H380" color={C.heatSoft} width={2} from={0.22} to={0.32} />
      <Line {...p} d="M450 320 H490 V440 H520" color={C.heat} width={2} from={0.3} to={0.38} />
      <Line {...p} d="M450 480 H500 V460 H520" color={C.heatSoft} width={2} from={0.32} to={0.4} />
      <Label {...p} x={250} y={412} at={0.3} color={C.heat}>Vorlauf</Label>
      <Label {...p} x={250} y={480} at={0.32} color={C.heat}>Rücklauf</Label>
      {/* Bodenaufbau */}
      <Line {...p} d="M660 470 H950 M660 478 H950 M660 506 H950 M660 530 H950 M660 570 H950" from={0.36} to={0.52} />
      <Fade {...p} at={0.46}>
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M${672 + i * 23} 530 L${690 + i * 23} 506`} stroke={INK} strokeWidth={0.7} opacity={0.35} />
        ))}
        {Array.from({ length: 14 }, (_, i) => (
          <path key={`r${i}`} d={`M${664 + i * 20} 570 L${684 + i * 20} 530`} stroke={INK} strokeWidth={0.7} opacity={0.25} />
        ))}
      </Fade>
      <Line {...p} d="M640 450 H660 V492 H950" color={C.heat} width={2} from={0.48} to={0.6} />
      <Fade {...p} at={0.56}>
        {Array.from({ length: 8 }, (_, i) => (
          <circle key={i} cx={690 + i * 36} cy={492} r={6} fill="none" stroke={C.heat} strokeWidth={1.6} />
        ))}
      </Fade>
      <Label {...p} x={966} y={472} at={0.56}>Bodenbelag</Label>
      <Label {...p} x={966} y={498} at={0.58} color={C.heat}>Estrich mit Heizrohren</Label>
      <Label {...p} x={966} y={524} at={0.6}>Dämmung</Label>
      <Label {...p} x={966} y={556} at={0.62}>Rohdecke</Label>
      {/* Wärmeabgabe */}
      {[690, 775, 860, 935].map((x, i) => (
        <Line key={x} {...p} d={`M${x} 440 C${x - 14} 410 ${x + 14} 390 ${x} 360 C${x - 14} 330 ${x + 14} 310 ${x} 280`} color={C.heatSoft} width={1.6} from={0.64 + i * 0.03} to={0.78 + i * 0.03} />
      ))}
      <Label {...p} x={810} y={262} at={0.8} anchor="middle" color={C.heat}>Wärmeabgabe über die gesamte Fläche</Label>
      <Flow {...p} d="M230 420 H380 M450 320 H490 V440 H520 M640 450 H660 V492 H950" color={C.heat} at={0.66} />
    </>
  );
}

function Water(p: P) {
  return (
    <>
      {/* Geschosse */}
      <Line {...p} d="M20 520 H1180 M160 520 V60 M178 520 V60 M178 300 H1180 M178 286 H1180" from={0} to={0.16} />
      <Label {...p} x={1180} y={276} at={0.1} anchor="end">Obergeschoss</Label>
      <Label {...p} x={1180} y={510} at={0.12} anchor="end">Erdgeschoss</Label>
      {/* Hausanschluss */}
      <Line {...p} d="M20 560 H120 V500 H230" color={C.water} width={2.2} from={0.12} to={0.24} />
      <Label {...p} x={24} y={582} at={0.2}>Hausanschluss</Label>
      {/* Wasserzähler, Filter */}
      <Line {...p} d="M260 500 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0" from={0.2} to={0.28} />
      <Label {...p} x={260} y={550} at={0.26} anchor="middle">Wasserzähler</Label>
      <Line {...p} d="M282 500 H330" color={C.water} width={2.2} from={0.26} to={0.3} />
      <Line {...p} d="M330 470 H370 V530 H330 Z M340 482 H360 M340 494 H360 M340 506 H360 M340 518 H360" from={0.28} to={0.34} />
      <Label {...p} x={350} y={455} at={0.32} anchor="middle">Filter</Label>
      {/* Warmwasserspeicher */}
      <Line {...p} d="M370 500 H440" color={C.water} width={2.2} from={0.32} to={0.36} />
      <Line {...p} d="M440 360 H520 V520 H440 Z" from={0.34} to={0.42} />
      <Label {...p} x={480} y={345} at={0.4} anchor="middle">Warmwasserspeicher</Label>
      {/* Steigleitungen: Kaltwasser, Warmwasser, Zirkulation */}
      <Line {...p} d="M405 500 V470 H600 V150 H700" color={C.water} width={2.2} from={0.42} to={0.56} />
      <Line {...p} d="M520 390 H630 V170 H860" color={C.heat} width={2.2} from={0.46} to={0.6} />
      <Line {...p} d="M860 186 H660 V410 H520" color={C.heatSoft} width={1.6} dash="6 6" from={0.56} to={0.66} />
      <Label {...p} x={612} y={460} at={0.52} color={C.water}>Kaltwasser</Label>
      <Label {...p} x={528} y={378} at={0.56} color={C.heat}>Warmwasser</Label>
      <Label {...p} x={672} y={250} at={0.64} color={C.heat}>Zirkulation</Label>
      {/* Bad */}
      <Line {...p} d="M700 150 V200 M680 200 H780 V215 H680 Z M730 215 V286" from={0.58} to={0.68} />
      <Label {...p} x={730} y={130} at={0.66} anchor="middle">Waschtisch</Label>
      <Line {...p} d="M860 170 H960 V110 M940 110 H990 M950 118 V128 M965 118 V132 M980 118 V128 M920 286 V250 H1060 V286" from={0.62} to={0.72} />
      <Label {...p} x={1000} y={100} at={0.7} anchor="middle">Dusche</Label>
      {/* Küche Erdgeschoss */}
      <Line {...p} d="M600 470 H900 V420 M860 420 H960 V440 H860 Z" color={C.water} width={2} from={0.66} to={0.76} />
      <Label {...p} x={910} y={404} at={0.74} anchor="middle">Küche</Label>
      <Flow {...p} d="M20 560 H120 V500 H440 M405 500 V470 H600 V150 H700" color={C.water} at={0.72} />
      <Flow {...p} d="M520 390 H630 V170 H860" color={C.heat} at={0.76} />
    </>
  );
}

function Cold(p: P) {
  return (
    <>
      {/* Innen / Außen */}
      <Line {...p} d="M600 40 V580 M616 40 V580" from={0} to={0.12} />
      <Label {...p} x={300} y={604} at={0.06} anchor="middle">Innenraum</Label>
      <Label {...p} x={900} y={604} at={0.08} anchor="middle">Außen</Label>
      {/* Verdampfer (Innengerät) */}
      <Line {...p} d="M120 110 H460 V180 H120 Z M140 168 H440" from={0.1} to={0.22} />
      <Label {...p} x={290} y={98} at={0.2} anchor="middle">Verdampfer (Innengerät)</Label>
      {/* Kühle Luft */}
      {[180, 290, 400].map((x, i) => (
        <Line key={x} {...p} d={`M${x} 196 C${x - 20} 240 ${x + 20} 280 ${x} 330 M${x - 8} 318 L${x} 332 L${x + 8} 318`} color={C.cold} width={1.6} from={0.22 + i * 0.03} to={0.34 + i * 0.03} />
      ))}
      <Label {...p} x={290} y={360} at={0.34} anchor="middle" color={C.cold}>nimmt Wärme aus dem Raum auf</Label>
      {/* Verdichter */}
      <Line {...p} d="M860 450 m-46 0 a46 46 0 1 0 92 0 a46 46 0 1 0 -92 0 M832 470 L860 420 L888 470" from={0.3} to={0.42} />
      <Label {...p} x={860} y={524} at={0.4} anchor="middle">Verdichter</Label>
      {/* Verflüssiger (Außengerät) */}
      <Line {...p} d="M740 110 H1080 V200 H740 Z M760 128 H1060 M760 146 H1060 M760 164 H1060 M760 182 H1060" from={0.38} to={0.5} />
      <Label {...p} x={740} y={232} at={0.48}>Verflüssiger (Außengerät)</Label>
      {[820, 910, 1000].map((x, i) => (
        <Line key={x} {...p} d={`M${x} 104 C${x - 14} 86 ${x + 14} 72 ${x} 54`} color={C.heat} width={1.6} from={0.5 + i * 0.03} to={0.6 + i * 0.03} />
      ))}
      <Label {...p} x={1080} y={36} at={0.6} anchor="end" color={C.heat}>gibt Wärme nach außen ab</Label>
      {/* Expansionsventil */}
      <Line {...p} d="M430 430 L470 450 L430 470 Z M510 430 L470 450 L510 470 Z" from={0.5} to={0.58} />
      <Label {...p} x={470} y={500} at={0.56} anchor="middle">Expansionsventil</Label>
      {/* Kreislauf */}
      <Line {...p} d="M460 145 H540 V300 H680 V450 H814" color={C.cold} width={2.2} from={0.58} to={0.68} />
      <Line {...p} d="M906 450 H1120 V155 H1080" color={C.heat} width={2.2} from={0.64} to={0.74} />
      <Line {...p} d="M740 155 H700 V380 H560 V450 H510" color={C.heatSoft} width={2.2} from={0.7} to={0.8} />
      <Line {...p} d="M430 450 H80 V145 H120" color={C.cold} width={2.2} from={0.76} to={0.86} />
      <Label {...p} x={712} y={340} at={0.66} color={C.cold}>Niederdruck, gasförmig</Label>
      <Label {...p} x={1110} y={480} at={0.72} anchor="end" color={C.heat}>Hochdruck, heiß</Label>
      <Label {...p} x={548} y={405} at={0.78} anchor="end" color={C.heat}>Hochdruck, flüssig</Label>
      <Label {...p} x={90} y={560} at={0.84} color={C.cold}>Niederdruck, kalt</Label>
      <Flow {...p} d="M460 145 H540 V300 H680 V450 H814" color={C.cold} at={0.86} />
      <Flow {...p} d="M906 450 H1120 V155 H1080" color={C.heat} at={0.86} />
      <Flow {...p} d="M740 155 H700 V380 H560 V450 H510" color={C.heat} at={0.86} />
      <Flow {...p} d="M430 450 H80 V145 H120" color={C.cold} at={0.86} />
    </>
  );
}

export function TechDrawing({ medium, title }: { medium: Medium; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduceMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "center 0.5"] });
  const done = useTransform(scrollYProgress, () => 1);
  const progress = reduce ? done : scrollYProgress;
  const p = { progress, reduce };
  return (
    <div ref={ref} className="plan-frame relative bg-white text-navy/40">
      {/* Auf schmalen Bildschirmen seitlich verschiebbar, damit die Beschriftung lesbar bleibt */}
      <div className="overflow-x-auto" tabIndex={0} aria-label={`${title} – Zeichnung, seitlich verschiebbar`}>
      <svg viewBox="0 0 1200 620" role="img" aria-label={title} className="block h-auto w-full min-w-[820px]">
        {medium === "heat" ? <Heating {...p} /> : medium === "water" ? <Water {...p} /> : <Cold {...p} />}
      </svg>
      </div>
      <p className="annot px-4 pb-3 text-navy/55 md:hidden">Zeichnung seitlich verschieben</p>
    </div>
  );
}
