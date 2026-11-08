import Link from "next/link";
import { Picture } from "@/components/Picture";
import { AmbientWaves } from "@/components/AmbientWaves";
import { Arrow } from "@/components/Arrow";
import { ServiceExplorer } from "@/components/ServiceExplorer";
import { MaskReveal, Parallax, Reveal, ScrollText } from "@/components/motion";
import { CtaSection, ProcessSection, SectionIntro } from "@/components/sections";
import { serviceList } from "@/content/services";
import { references } from "@/content/references";

const heroLines = [["Gebäudetechnik,"], ["die", "man", "spürt."]];

export default function HomePage() {
  let w = 0;
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="grain relative isolate flex min-h-[100svh] items-end overflow-hidden bg-navy-950 text-paper">
        <div className="hero-media absolute inset-0 -z-10">
          <Picture
            name="haus-daemmerung"
            alt="Modernes Holzhaus in der Abenddämmerung mit warm beleuchteten Fenstern"
            priority
            sizes="100vw"
            position="60% 50%"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/45 to-navy-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 via-navy-950/30 to-transparent" />
        </div>
        <AmbientWaves intensity={0.7} className="-z-10" />

        <div className="container-x grid w-full gap-12 pb-14 pt-40 lg:grid-cols-12 lg:items-end lg:pb-20">
          <div className="lg:col-span-8">
            <p className="eyebrow hero-fade text-sky" style={{ animationDelay: "0.5s" }}>
              Heizung · Sanitär · Klima · Lüftung
            </p>
            <h1 className="mt-7 text-[clamp(2.4rem,9vw,8.5rem)] font-medium leading-[0.92]">
              {heroLines.map((line, li) => (
                <span key={li} className="block">
                  {line.map((word) => (
                    <span key={word} className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
                      <span
                        className={`hero-word ${li === 1 ? "display italic" : ""}`}
                        style={{ animationDelay: `${0.6 + w++ * 0.08}s` }}
                      >
                        {word}
                        {" "}
                      </span>
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            <p className="hero-fade mt-8 max-w-xl text-lg leading-relaxed text-paper/75 sm:text-xl" style={{ animationDelay: "1.05s" }}>
              Wir planen, installieren und betreuen Wärme, Wasser, Klima und Luft für Privat- und Geschäftskunden – präzise, effizient und mit Blick fürs Detail.
            </p>
            <div className="hero-fade mt-10 flex flex-wrap gap-3" style={{ animationDelay: "1.2s" }}>
              <Link href="/kontakt/" className="btn btn-light">
                Projekt anfragen <Arrow className="arrow" />
              </Link>
              <a href="#leistungen" className="btn btn-ghost-light">
                Leistungen entdecken
              </a>
            </div>
          </div>

          <nav aria-label="Leistungsbereiche" className="hero-fade lg:col-span-4" style={{ animationDelay: "1.35s" }}>
            <ul className="grid grid-cols-2 border-t border-paper/15 lg:grid-cols-1">
              {serviceList.map((s) => (
                <li key={s.slug} className="border-b border-paper/15 odd:border-r lg:odd:border-r-0">
                  <Link
                    href={`/${s.slug}/`}
                    className="group flex items-center justify-between gap-3 px-1 py-4 text-paper/80 transition-colors hover:text-paper sm:px-3"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-paper/40">{s.index}</span>
                      <span className="font-medium">{s.title}</span>
                    </span>
                    <Arrow className="-translate-x-1 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
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

      {/* ---------- Statement ---------- */}
      <section className="bg-paper py-28 lg:py-44">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <p className="eyebrow text-azure-strong">Neckair</p>
          </Reveal>
          <div className="lg:col-span-9">
            <ScrollText
              className="text-[clamp(1.75rem,3.6vw,3.25rem)] font-medium leading-[1.18] tracking-tight text-navy-900"
              text="Gute Haustechnik fällt nicht auf. Sie sorgt still dafür, dass Räume warm, Wasser sauber und Luft frisch ist – an jedem Tag des Jahres. Genau dafür arbeiten wir: mit sorgfältiger Planung, hochwertigen Komponenten und einem Service, der bleibt."
            />
            <Reveal delay={0.1} className="mt-14 grid gap-8 border-t border-navy-900/12 pt-10 sm:grid-cols-3">
              {[
                ["Präzise geplant", "Berechnung statt Bauchgefühl – jede Anlage passt zum Gebäude."],
                ["Sauber umgesetzt", "Ordentliche Baustellen, klare Absprachen, verlässliche Termine."],
                ["Langfristig betreut", "Wartung und Service aus einer Hand, auch nach Jahren."],
              ].map(([t, d]) => (
                <div key={t}>
                  <h3 className="font-semibold text-navy-900">{t}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{d}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Leistungen (interaktiv) ---------- */}
      <section id="leistungen" className="bg-paper pb-28 lg:pb-40">
        <div className="container-x">
          <SectionIntro
            eyebrow="Leistungen"
            title={["Vier Disziplinen.", "Ein Anspruch."]}
            text="Wärme, Wasser, Kühle und Luft greifen in modernen Gebäuden ineinander. Wir denken sie zusammen – und liefern alles aus einer Hand."
            className="mb-16 lg:mb-24"
          />
          <ServiceExplorer
            items={serviceList.map((s) => ({
              slug: s.slug,
              index: s.index,
              title: s.title,
              kicker: s.kicker,
              teaser: s.teaser,
              tone: s.tone,
              media: <Picture name={s.hero} alt={s.heroAlt} sizes="(min-width: 1024px) 45vw, 100vw" />,
            }))}
          />
        </div>
      </section>

      {/* ---------- Privat & Gewerbe ---------- */}
      <section className="relative overflow-hidden bg-navy-950 py-28 text-paper lg:py-40">
        <AmbientWaves intensity={0.45} />
        <div className="container-x relative">
          <SectionIntro
            dark
            eyebrow="Für wen wir arbeiten"
            title={["Zuhause und im Unternehmen", "– mit derselben Sorgfalt."]}
          />
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
              <Reveal key={c.title} delay={i * 0.12} className={i === 1 ? "md:mt-32" : ""}>
                <MaskReveal className="aspect-[4/5] rounded-sm">
                  <Picture name={c.img} alt={c.alt} sizes="(min-width: 768px) 45vw, 100vw" />
                </MaskReveal>
                <p className="eyebrow mt-8 text-sky">{c.eyebrow}</p>
                <h3 className="mt-4 text-3xl font-medium tracking-tight lg:text-4xl">{c.title}</h3>
                <p className="mt-4 max-w-md leading-relaxed text-paper/65">{c.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Referenzen ---------- */}
      <section className="bg-paper py-28 lg:py-40">
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
                delay={i * 0.1}
                className={i === 0 ? "md:col-span-7" : i === 1 ? "md:col-span-5 md:mt-24" : "md:col-span-6 md:col-start-4"}
              >
                <Link href="/referenzen/" className="group block">
                  <Parallax className={`rounded-sm ${i === 0 ? "aspect-[4/3]" : "aspect-[4/5]"} ${i === 2 ? "md:aspect-[16/10]" : ""}`} amount={8}>
                    <div className="h-full w-full transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
                      <Picture name={r.image} alt={r.imageAlt} sizes="(min-width: 768px) 55vw, 100vw" />
                    </div>
                  </Parallax>
                  <div className="mt-5 flex items-start justify-between gap-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{r.category}</p>
                      <h3 className="mt-2 text-xl font-medium text-navy-900">{r.title}</h3>
                    </div>
                    {r.example && (
                      <span className="mt-1 shrink-0 rounded-full border border-navy-900/15 px-3 py-1 text-[0.7rem] font-medium text-muted">
                        Beispielprojekt
                      </span>
                    )}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ProcessSection />
      <div className="h-16 bg-paper lg:h-24" />
      <CtaSection />
      <div className="h-16 bg-paper lg:h-24" />
    </>
  );
}
