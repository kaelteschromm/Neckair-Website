import Link from "next/link";
import { Picture } from "@/components/Picture";
import { Arrow } from "@/components/Arrow";
import { LightField } from "@/components/LightField";
import { BuildingStory } from "@/components/building/BuildingStory";
import { ExpandSection, MaskReveal, Parallax, Reveal, ScrollText } from "@/components/motion";
import { CtaSection, ProcessSection, SectionIntro } from "@/components/sections";
import { serviceList } from "@/content/services";
import { references } from "@/content/references";

const heroLines = [["Gebäudetechnik,"], ["die", "man", "spürt."]];

export default function HomePage() {
  let w = 0;
  return (
    <>
      {/* ---------- Cinematic Hero ---------- */}
      <section className="grain relative isolate flex min-h-[100svh] items-end overflow-hidden bg-navy-950 text-paper">
        <div className="hero-media absolute inset-0 -z-10">
          <div className="hero-camera h-full w-full">
            <Picture
              name="haus-daemmerung"
              alt="Modernes Holzhaus in der Abenddämmerung mit warm beleuchteten Fenstern"
              priority
              sizes="100vw"
              position="60% 50%"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-navy-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/30 to-transparent" />
        </div>
        {/* bewegte Lichtreflexe, Tiefendunst, Partikel – reagiert sanft auf den Mauszeiger */}
        <LightField mode="home" className="-z-10" />
        <div aria-hidden className="grid-lines absolute inset-0 -z-10 opacity-25" />

        {/* technische Mikro-Beschriftung oben */}
        <div className="hero-fade hud absolute inset-x-0 top-28 hidden text-paper/40 lg:block" style={{ animationDelay: "1.3s" }}>
          <div className="container-x flex justify-between">
            <span>Neckair · Gebäudetechnik</span>
            <span>Wärme / Wasser / Klima / Luft</span>
          </div>
        </div>

        <div className="container-x grid w-full gap-12 pb-14 pt-40 lg:grid-cols-12 lg:items-end lg:pb-20">
          <div className="lg:col-span-8">
            <p className="eyebrow hero-fade text-sky" style={{ animationDelay: "0.4s" }}>
              Heizung · Sanitär · Klima · Lüftung
            </p>
            <h1 className="mt-7 text-[clamp(2.4rem,9vw,8.5rem)] font-medium leading-[0.92]">
              {heroLines.map((line, li) => (
                <span key={li} className="block">
                  {line.map((word) => (
                    <span key={word} className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
                      <span
                        className={`hero-word ${li === 1 ? "display italic" : ""}`}
                        style={{ animationDelay: `${0.5 + w++ * 0.07}s` }}
                      >
                        {word}
                        {" "}
                      </span>
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            <p className="hero-fade mt-8 max-w-xl text-lg leading-relaxed text-paper/75 sm:text-xl" style={{ animationDelay: "0.95s" }}>
              Wir verbinden Wärme, Wasser, Klima und Luft zu intelligenten Lösungen für modernes Leben und Arbeiten.
            </p>
            <div className="hero-fade mt-10 flex flex-wrap gap-3" style={{ animationDelay: "1.1s" }}>
              <Link href="/kontakt/" className="btn btn-light">
                Projekt anfragen <Arrow className="arrow" />
              </Link>
              <a href="#leistungen" className="btn btn-ghost-light">
                Leistungen entdecken
              </a>
            </div>
          </div>

          <nav aria-label="Leistungsbereiche" className="hero-fade lg:col-span-4" style={{ animationDelay: "1.25s" }}>
            <ul className="grid grid-cols-2 border-t border-paper/15 lg:grid-cols-1">
              {serviceList.map((s) => (
                <li key={s.slug} className="border-b border-paper/15 odd:border-r lg:odd:border-r-0">
                  <Link
                    href={`/${s.slug}/`}
                    className="group flex items-center justify-between gap-3 px-1 py-4 text-paper/80 transition-colors duration-200 hover:text-paper sm:px-3"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="hud text-paper/40">{s.index}</span>
                      <span className="font-medium">{s.title}</span>
                    </span>
                    <Arrow className="-translate-x-1 opacity-0 transition-[transform,opacity] duration-200 ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div aria-hidden className="absolute bottom-8 left-1/2 hidden h-14 w-px overflow-hidden bg-paper/15 lg:block">
          <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-paper/80" />
        </div>
      </section>

      {/* ---------- Statement: füllt sich Wort für Wort mit dem Scroll ---------- */}
      <section className="bg-paper py-28 lg:py-44">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <p className="hud text-azure-strong">01 — Haltung</p>
          </Reveal>
          <div className="lg:col-span-9">
            <ScrollText
              className="text-[clamp(1.75rem,3.6vw,3.25rem)] font-medium leading-[1.18] tracking-tight text-navy-900"
              text="Gute Haustechnik fällt nicht auf. Sie sorgt still dafür, dass Räume warm, Wasser sauber und Luft frisch ist – an jedem Tag des Jahres. Genau dafür arbeiten wir: mit sorgfältiger Planung, hochwertigen Komponenten und einem Service, der bleibt."
            />
            <div className="mt-14 grid gap-8 border-t border-navy-900/12 pt-10 sm:grid-cols-3">
              {[
                ["Präzise geplant", "Berechnung statt Bauchgefühl – jede Anlage passt zum Gebäude."],
                ["Sauber umgesetzt", "Ordentliche Baustellen, klare Absprachen, verlässliche Termine."],
                ["Langfristig betreut", "Wartung und Service aus einer Hand, auch nach Jahren."],
              ].map(([t, d], i) => (
                <Reveal key={t} delay={i * 0.06}>
                  <h3 className="font-semibold text-navy-900">{t}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{d}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Das intelligente Gebäude (angeheftetes Scrolltelling) ---------- */}
      <div id="leistungen">
        <BuildingStory />
      </div>

      {/* ---------- Leistungen als Bildreihe (Übergang dunkel → dunkel) ---------- */}
      <section className="bg-navy-950 pb-28 text-paper lg:pb-40">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 border-t border-paper/10 pt-16 md:flex-row md:items-end">
            <p className="hud text-paper/45">02 — Leistungen im Detail</p>
            <p className="max-w-md text-paper/60">Jede Disziplin hat ihre eigene Seite – mit Leistungsumfang, Ablauf und häufigen Fragen.</p>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {serviceList.map((s, i) => (
              <Reveal as="li" key={s.slug} delay={i * 0.05}>
                <Link href={`/${s.slug}/`} className="group relative block aspect-[3/4] overflow-hidden rounded-2xl">
                  <div className="h-full w-full transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.03]">
                    <Picture name={s.hero} alt={s.heroAlt} sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 100vw" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="hud text-paper/55">{s.index} · {s.kicker}</p>
                    <p className="mt-2 text-3xl font-medium tracking-tight">{s.title}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-paper/65">{s.teaser}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Privat & Gewerbe ---------- */}
      <section className="bg-paper py-28 lg:py-40">
        <div className="container-x">
          <SectionIntro eyebrow="Für wen wir arbeiten" title={["Zuhause und im Unternehmen", "– mit derselben Sorgfalt."]} />
          <div className="mt-20 grid gap-16 md:grid-cols-2 md:gap-10 lg:gap-16">
            {[
              {
                img: "wohnraum-hell" as const,
                alt: "Heller, minimalistisch eingerichteter Raum mit großen Fenstern",
                eyebrow: "Privatkunden",
                title: "Wohnkomfort, der bleibt",
                text: "Ob Neubau, Sanierung oder neues Bad: Wir beraten persönlich, planen individuell und sorgen dafür, dass sich Ihr Zuhause zu jeder Jahreszeit gut anfühlt.",
              },
              {
                img: "glasfassade" as const,
                alt: "Moderne Glasfassade eines Bürogebäudes",
                eyebrow: "Geschäftskunden",
                title: "Technik, die Betrieb sichert",
                text: "Für Büros, Praxen, Gewerbe und Wohnanlagen: Wir planen effiziente Anlagen, koordinieren mit Architekten und Bauleitung und halten Ihre Technik mit Wartungsverträgen zuverlässig in Betrieb.",
              },
            ].map((c, i) => (
              <div key={c.title} className={i === 1 ? "md:mt-32" : ""}>
                <MaskReveal className="aspect-[4/5] rounded-2xl" delay={i * 0.08}>
                  <Picture name={c.img} alt={c.alt} sizes="(min-width: 768px) 45vw, 100vw" />
                </MaskReveal>
                <Reveal>
                  <p className="eyebrow mt-8 text-azure-strong">{c.eyebrow}</p>
                  <h3 className="mt-4 text-3xl font-medium tracking-tight text-navy-900 lg:text-4xl">{c.title}</h3>
                  <p className="mt-4 max-w-md leading-relaxed text-muted">{c.text}</p>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Referenzen ---------- */}
      <section className="bg-paper-2 py-28 lg:py-40">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
            <SectionIntro eyebrow="Referenzen" title={["Projekte, die", "für sich sprechen."]} />
            <Reveal>
              <Link href="/referenzen/" className="btn btn-ghost-dark">
                Alle Referenzen <Arrow className="arrow" />
              </Link>
            </Reveal>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-12">
            {references.slice(0, 3).map((r, i) => (
              <Reveal
                key={r.slug}
                delay={i * 0.06}
                className={i === 0 ? "md:col-span-7" : i === 1 ? "md:col-span-5 md:mt-24" : "md:col-span-6 md:col-start-4"}
              >
                <Link href={`/referenzen/${r.slug}/`} className="group block">
                  <Parallax className={`rounded-2xl ${i === 0 ? "aspect-[4/3]" : "aspect-[4/5]"} ${i === 2 ? "md:aspect-[16/10]" : ""}`} amount={8}>
                    <div className="h-full w-full transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.03]">
                      <Picture name={r.image} alt={r.imageAlt} sizes="(min-width: 768px) 55vw, 100vw" />
                    </div>
                  </Parallax>
                  <div className="mt-5 flex items-start justify-between gap-6">
                    <div>
                      <p className="hud text-muted">{r.category}</p>
                      <h3 className="mt-2 text-xl font-medium text-navy-900">{r.title}</h3>
                    </div>
                    {r.example && (
                      <span className="mt-1 shrink-0 rounded-full border border-navy-900/15 px-3 py-1 text-[0.7rem] font-medium text-muted">
                        Demo-Projekt
                      </span>
                    )}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ExpandSection className="bg-navy-900">
        <ProcessSection />
      </ExpandSection>
      <div className="h-16 bg-paper lg:h-24" />
      <CtaSection />
      <div className="h-16 bg-paper lg:h-24" />
    </>
  );
}
