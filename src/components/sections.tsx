import Link from "next/link";
import { Picture } from "./Picture";
import { AmbientWaves } from "./AmbientWaves";
import { Arrow } from "./Arrow";
import { DrawLine, Reveal, SplitHeading } from "./motion";
import type { ImageName } from "@/lib/images.generated";
import { site } from "@/lib/site";
import { LightField, type LightMode } from "./LightField";

const ACCENT = { ember: "text-ember-soft", sky: "text-sky", ice: "text-ice", teal: "text-teal" } as const;
export type Accent = keyof typeof ACCENT;

/**
 * Dunkler Seitenkopf für Unterseiten: Bild mit Maskenaufdeckung und langsamer Kamerafahrt (CSS),
 * darüber die seiteneigene Lichtstimmung (WebGL), Headline wortweise choreografiert.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  tone = "cool",
  accent,
  light,
  hud,
  compact = false,
}: {
  eyebrow: string;
  title: [string, string?];
  intro?: string;
  image?: ImageName;
  imageAlt?: string;
  tone?: "warm" | "cool";
  accent?: Accent;
  light?: LightMode;
  hud?: string[];
  compact?: boolean;
}) {
  const words = [title[0], title[1]].filter(Boolean) as string[];
  const acc = ACCENT[accent ?? (tone === "warm" ? "ember" : "sky")];
  let i = 0;
  return (
    <section
      className={`grain relative isolate flex overflow-hidden bg-navy-950 text-paper ${
        compact ? "min-h-[56svh] items-end" : "min-h-[92svh] items-end"
      }`}
    >
      {image && (
        <div className="hero-media absolute inset-0 -z-10">
          <div className="hero-camera h-full w-full">
            <Picture name={image} alt={imageAlt ?? ""} priority sizes="100vw" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/55 to-navy-950/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/75 to-transparent" />
        </div>
      )}
      {light ? <LightField mode={light} className="-z-10" /> : <AmbientWaves intensity={image ? 0.6 : 1} className="-z-10" />}
      <div aria-hidden className="grid-lines absolute inset-0 -z-10 opacity-30" />
      <div className="container-x pb-16 pt-36 lg:pb-24">
        <p className={`eyebrow hero-fade ${acc}`} style={{ animationDelay: "0.35s" }}>
          {eyebrow}
        </p>
        <h1 className="mt-6 max-w-5xl text-[clamp(2.4rem,8vw,7.5rem)] font-medium leading-[0.95]">
          {words.map((line, li) => (
            <span key={li} className="block">
              {line.split(" ").map((w, wi) => (
                <span key={wi} className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
                  <span
                    className={`hero-word ${li === 1 ? "display italic" : ""}`}
                    style={{ animationDelay: `${0.45 + i++ * 0.05}s` }}
                  >
                    {w}
                    {" "}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </h1>
        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          {intro && (
            <p className="hero-fade max-w-xl text-lg leading-relaxed text-paper/75" style={{ animationDelay: "0.8s" }}>
              {intro}
            </p>
          )}
          {hud && (
            <ul className="hero-fade hud flex flex-wrap gap-x-6 gap-y-2 text-paper/45" style={{ animationDelay: "0.95s" }}>
              {hud.map((h) => (
                <li key={h} className="flex items-center gap-2">
                  <span aria-hidden className={`h-1 w-1 rounded-full bg-current ${acc}`} />
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  text,
  dark = false,
  className = "",
}: {
  eyebrow: string;
  title: string[];
  text?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Reveal>
        <p className={`eyebrow ${dark ? "text-sky" : "text-azure-strong"}`}>{eyebrow}</p>
      </Reveal>
      <SplitHeading
        lines={title}
        italicLast
        className={`mt-6 text-[clamp(2.25rem,5vw,4.25rem)] font-medium leading-[1.02] ${dark ? "text-paper" : "text-navy-900"}`}
      />
      {text && (
        <Reveal delay={0.15}>
          <p className={`mt-6 max-w-xl text-lg leading-relaxed ${dark ? "text-paper/70" : "text-muted"}`}>{text}</p>
        </Reveal>
      )}
    </div>
  );
}

export const processSteps = [
  { title: "Beratung vor Ort", text: "Wir sehen uns Gebäude und Technik an und hören zu, was Ihnen wichtig ist." },
  { title: "Planung & Angebot", text: "Sie erhalten ein klares Konzept mit transparentem, nachvollziehbarem Angebot." },
  { title: "Montage", text: "Saubere Ausführung durch unser Fachteam – termintreu und mit Rücksicht auf Ihren Alltag." },
  { title: "Inbetriebnahme", text: "Wir stellen die Anlage optimal ein und erklären Ihnen alles Wichtige." },
  { title: "Service", text: "Wartung und schnelle Hilfe, damit Ihre Anlage dauerhaft effizient bleibt." },
];

export function ProcessSection({ dark = true }: { dark?: boolean }) {
  return (
    <section className={`relative overflow-hidden py-24 lg:py-36 ${dark ? "bg-navy-900 text-paper" : "bg-paper-2"}`}>
      {dark && <AmbientWaves intensity={0.5} />}
      <div className="container-x relative">
        <SectionIntro
          dark={dark}
          eyebrow="Arbeitsweise"
          title={["Ein Ablauf,", "auf den Sie bauen können."]}
          text="Von der ersten Idee bis zur Wartung haben Sie bei uns einen festen Ansprechpartner. Klar strukturiert, ohne Überraschungen."
        />
        <ol className="mt-20 grid gap-y-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-8">
          {processSteps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08} className="relative">
              <DrawLine className={`mb-8 h-px ${dark ? "bg-paper/25" : "bg-navy-900/20"}`} />
              <span className={`text-xs font-semibold tracking-[0.2em] ${dark ? "text-sky" : "text-azure-strong"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-xl font-medium">{s.title}</h3>
              <p className={`mt-3 text-[0.95rem] leading-relaxed ${dark ? "text-paper/60" : "text-muted"}`}>{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function CtaSection({
  title = ["Lassen Sie uns", "über Ihr Projekt sprechen."],
  text = "Erzählen Sie uns, was Sie vorhaben. Wir melden uns zeitnah mit einer persönlichen Einschätzung.",
  image = "haus-daemmerung",
}: {
  title?: string[];
  text?: string;
  image?: ImageName;
}) {
  return (
    <section className="bg-paper py-6 lg:py-10">
      <div className="container-x">
        <div className="grain relative isolate overflow-hidden rounded-2xl bg-navy-950 px-6 py-20 text-paper sm:px-12 lg:px-20 lg:py-28">
          <div className="absolute inset-0 -z-10 opacity-35">
            <Picture name={image} alt="" sizes="100vw" />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/40" />
          <AmbientWaves intensity={0.7} className="-z-10" />
          <div className="max-w-3xl">
            <SplitHeading lines={title} italicLast className="text-[clamp(2.25rem,5vw,4.5rem)] font-medium leading-[1.02]" />
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-xl text-lg text-paper/70">{text}</p>
            </Reveal>
            <Reveal delay={0.25} className="mt-10 flex flex-wrap gap-3">
              <Link href="/kontakt/" className="btn btn-light">
                Anfrage stellen <Arrow className="arrow" />
              </Link>
              <a href={`tel:${site.phoneHref}`} className="btn btn-ghost-light">
                {site.phone}
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
