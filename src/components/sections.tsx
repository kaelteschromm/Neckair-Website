import Link from "next/link";
import { Picture } from "./Picture";
import { LightField, type LightMode } from "./LightField";
import type { ImageName } from "@/lib/images.generated";
import { site } from "@/lib/site";

/**
 * Seitenkopf der Unterseiten: Foto mit langsamer Kamerafahrt und der seiteneigenen Lichtstimmung.
 * Die Headline erscheint zeilenweise – der eine orchestrierte Moment der Seite.
 */
export function PageHero({
  title,
  intro,
  kicker,
  image,
  imageAlt,
  light,
  compact = false,
  children,
}: {
  title: string;
  intro?: string;
  kicker?: string;
  image?: ImageName;
  imageAlt?: string;
  light?: LightMode;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={`relative isolate flex overflow-hidden bg-graphite text-on-dark ${compact ? "min-h-[52svh]" : "min-h-[88svh]"} items-end`}
    >
      {image ? (
        <div className="hero-media absolute inset-0 -z-10">
          <div className="hero-camera h-full w-full">
            <Picture name={image} alt={imageAlt ?? ""} priority sizes="100vw" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/55 to-graphite/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-graphite/80 to-transparent" />
        </div>
      ) : null}
      {light ? <LightField mode={light} className="-z-10" /> : null}
      <div className="container-x pb-14 pt-36 lg:pb-20">
        {kicker ? (
          <p className="hero-fade text-sm font-medium text-on-dark-muted" style={{ animationDelay: "0.2s" }}>
            {kicker}
          </p>
        ) : null}
        <h1 className={`mt-4 max-w-5xl ${compact ? "text-[clamp(2.25rem,5.5vw,4.5rem)]" : "text-[clamp(2.5rem,7vw,6.4rem)]"}`}>
          <span className="hero-line">
            <span style={{ animationDelay: "0.3s" }}>{title}</span>
          </span>
        </h1>
        {intro ? (
          <p className="hero-fade measure mt-6 text-lg leading-relaxed text-on-dark-muted" style={{ animationDelay: "0.6s" }}>
            {intro}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/** Abschnittsüberschrift ohne Zierlabel – die Überschrift trägt selbst. */
export function SectionHeading({
  title,
  text,
  dark = false,
  className = "",
  id,
}: {
  title: string;
  text?: string;
  dark?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <div className={className}>
      <h2 id={id} className={`text-[clamp(2rem,4.2vw,3.6rem)] ${dark ? "text-on-dark" : "text-navy"}`}>
        {title}
      </h2>
      {text ? <p className={`measure mt-5 text-lg leading-relaxed ${dark ? "text-on-dark-muted" : "text-muted"}`}>{text}</p> : null}
    </div>
  );
}

export const processSteps = [
  { title: "Beratung vor Ort", text: "Wir sehen uns Gebäude und Technik an und hören zu, was Ihnen wichtig ist." },
  { title: "Planung und Angebot", text: "Sie erhalten ein klares Konzept mit nachvollziehbarem Angebot." },
  { title: "Montage", text: "Saubere Ausführung durch unser Fachteam – termintreu und mit Rücksicht auf Ihren Alltag." },
  { title: "Inbetriebnahme", text: "Wir stellen die Anlage optimal ein und erklären Ihnen alles Wichtige." },
  { title: "Service", text: "Wartung und schnelle Hilfe, damit Ihre Anlage dauerhaft effizient bleibt." },
];

/** Ablauf – eine echte Reihenfolge, daher nummeriert. */
export function ProcessSection() {
  return (
    <section aria-labelledby="ablauf-titel" className="bg-graphite py-24 text-on-dark lg:py-32">
      <div className="container-x">
        <SectionHeading
          dark
          id="ablauf-titel"
          title="So arbeiten wir."
          text="Von der ersten Idee bis zur Wartung haben Sie einen festen Ansprechpartner. Klar strukturiert, ohne Überraschungen."
        />
        <ol className="mt-16 grid gap-px bg-on-dark/15 sm:grid-cols-2 lg:grid-cols-5">
          {processSteps.map((s, i) => (
            <li key={s.title} className="bg-graphite p-6 lg:p-7">
              <span className="annot text-on-dark-muted">Schritt {i + 1}</span>
              <h3 className="mt-6 text-xl">{s.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-on-dark-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function CtaSection({
  title = "Erzählen Sie uns von Ihrem Vorhaben.",
  text = "Mit dem Anfrage-Assistenten beschreiben Sie Ihr Projekt in wenigen Schritten. Wir melden uns persönlich mit einer ersten Einschätzung.",
  image = "haus-daemmerung",
}: {
  title?: string;
  text?: string;
  image?: ImageName;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-graphite text-on-dark">
      <div className="absolute inset-0 -z-10 opacity-45">
        <Picture name={image} alt="" sizes="100vw" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-graphite via-graphite/85 to-graphite/30" />
      <div className="container-x py-24 lg:py-32">
        <h2 className="max-w-3xl text-[clamp(2.25rem,5vw,4.4rem)]">{title}</h2>
        <p className="measure mt-6 text-lg text-on-dark-muted">{text}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/kontakt/" className="btn btn-light">Projekt anfragen</Link>
          <a href={`tel:${site.phoneHref}`} className="btn btn-outline-light">Anrufen: {site.phone}</a>
        </div>
      </div>
    </section>
  );
}
