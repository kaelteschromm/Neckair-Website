"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type FormEvent } from "react";
import { site } from "@/lib/site";
import { useReduceMotion } from "@/lib/useReduceMotion";

const TOPICS = ["Heizung", "Sanitär & Trinkwasser", "Klima & Kälte", "Wartung / Service", "Störung", "Sonstiges"];
const OBJECTS = ["Einfamilienhaus", "Mehrfamilienhaus", "Wohnung", "Gewerbe / Büro", "Sonstiges"];
const PLANS = ["Neubau", "Modernisierung / Sanierung", "Wartung / Reparatur", "Noch offen"];
const TIMES = ["So bald wie möglich", "In 1–3 Monaten", "Später", "Noch offen"];
const STEPS = ["Gewerk", "Objekt", "Anliegen", "Kontakt"];

type Data = {
  topics: string[];
  object: string;
  plan: string;
  message: string;
  place: string;
  time: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  consent: boolean;
  gotcha: string;
};
type Errors = Partial<Record<keyof Data, string>>;
type Status = "idle" | "sending" | "success" | "error";

const initial: Data = { topics: [], object: "", plan: "", message: "", place: "", time: "", name: "", company: "", email: "", phone: "", consent: false, gotcha: "" };

const input =
  "w-full border border-navy/25 bg-white px-4 py-3 text-base text-navy transition-[border-color] duration-200 focus:border-navy focus:outline-none aria-[invalid=true]:border-heat-ink";

function Choice({ label, selected, onClick, multi }: { label: string; selected: boolean; onClick: () => void; multi?: boolean }) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`press border px-4 py-3 text-left text-sm font-semibold transition-[background-color,border-color,color] duration-200 ${
        selected ? "border-navy bg-navy text-white" : "border-navy/25 bg-white text-navy hover:border-navy"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Anfrage-Assistent in vier Schritten. Schrittwechsel = Zustandswechsel: 250 ms, --ease-out,
 * Richtung folgt dem Vor/Zurück (räumliche Konsistenz). Fokus wandert auf die Schrittüberschrift.
 */
export function ContactForm() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<Data>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const reduce = useReduceMotion();
  // Fokus auf die Überschrift des neuen Schritts, sobald sie im DOM ist (nach der Ausblendung des alten Schritts)
  const focusNext = useRef(false);
  const heading = (el: HTMLHeadingElement | null) => {
    if (!el || !focusNext.current) return;
    focusNext.current = false;
    el.focus({ preventScroll: true });
  };

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setData((d) => ({ ...d, [k]: v }));
  const toggleTopic = (t: string) => set("topics", data.topics.includes(t) ? data.topics.filter((x) => x !== t) : [...data.topics, t]);

  const validate = (s: number): Errors => {
    const e: Errors = {};
    if (s === 0 && !data.topics.length) e.topics = "Bitte wählen Sie mindestens einen Bereich.";
    if (s === 1) {
      if (!data.object) e.object = "Bitte wählen Sie die Art des Objekts.";
      if (!data.plan) e.plan = "Bitte wählen Sie, worum es geht.";
    }
    if (s === 2 && data.message.trim().length < 10) e.message = "Bitte beschreiben Sie Ihr Anliegen kurz (mindestens 10 Zeichen).";
    if (s === 3) {
      if (!data.name.trim()) e.name = "Bitte geben Sie Ihren Namen an.";
      if (!data.email.trim()) e.email = "Bitte geben Sie Ihre E-Mail-Adresse an.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim())) e.email = "Bitte prüfen Sie die E-Mail-Adresse.";
      if (!data.consent) e.consent = "Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.";
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    setDir(1);
    focusNext.current = true;
    setStep((s) => s + 1);
  };
  const back = () => {
    setErrors({});
    setDir(-1);
    focusNext.current = true;
    setStep((s) => s - 1);
  };

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    if (step < STEPS.length - 1) return next();
    const e = validate(3);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (data.gotcha) return; // Spam-Schutz
    setStatus("sending");
    try {
      const res = await fetch(site.formEndpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `Neue Anfrage über die NECKAIR-Website: ${data.topics.join(", ")}`,
          bereich: data.topics.join(", "),
          objekt: data.object,
          vorhaben: data.plan,
          zeitraum: data.time,
          ort: data.place,
          nachricht: data.message,
          name: data.name,
          firma: data.company,
          email: data.email,
          telefon: data.phone,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const err = (k: keyof Data) =>
    errors[k] ? (
      <p id={`${k}-error`} className="field-error mt-2 text-sm text-heat-ink">
        {errors[k]}
      </p>
    ) : null;

  if (status === "success") {
    return (
      <div role="status" className="bg-graphite p-10 text-on-dark lg:p-14">
        <h2 className="text-[clamp(1.8rem,3.4vw,2.8rem)]">Anfrage gesendet.</h2>
        <p className="measure mt-4 text-on-dark-muted">Danke, {data.name.split(" ")[0]}. Wir melden uns persönlich bei Ihnen – in der Regel per E-Mail an {data.email}.</p>
        <button
          type="button"
          onClick={() => {
            setData(initial);
            setStep(0);
            setStatus("idle");
          }}
          className="btn btn-outline-light mt-10"
        >
          Weitere Anfrage stellen
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="bg-white p-6 sm:p-10" aria-describedby="form-progress">
      {/* Schrittanzeige */}
      <div id="form-progress">
        <p className="text-sm text-muted">
          Schritt {step + 1} von {STEPS.length}: <span className="font-semibold text-navy">{STEPS[step]}</span>
        </p>
        <ol className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <li key={s} className="h-1 bg-navy/15">
              <span className={`block h-full origin-left bg-navy transition-transform duration-300 ease-[var(--ease-out)] ${i <= step ? "scale-x-100" : "scale-x-0"}`} />
            </li>
          ))}
        </ol>
      </div>

      <div className="relative mt-10 min-h-[20rem]">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.fieldset
            key={step}
            custom={dir}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 16 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] } }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -12, transition: { duration: 0.15 } }}
          >
            {step === 0 ? (
              <>
                <legend className="sr-only">Gewerk</legend>
                <h2 ref={heading} tabIndex={-1} className="text-[clamp(1.6rem,3vw,2.4rem)] text-navy outline-none">Worum geht es?</h2>
                <p className="mt-2 text-muted">Mehrfachauswahl möglich.</p>
                <div role="group" aria-label="Bereich" aria-describedby={errors.topics ? "topics-error" : undefined} className="mt-6 grid gap-2 sm:grid-cols-2">
                  {TOPICS.map((t) => (
                    <Choice key={t} label={t} multi selected={data.topics.includes(t)} onClick={() => toggleTopic(t)} />
                  ))}
                </div>
                {err("topics")}
              </>
            ) : step === 1 ? (
              <>
                <legend className="sr-only">Objekt</legend>
                <h2 ref={heading} tabIndex={-1} className="text-[clamp(1.6rem,3vw,2.4rem)] text-navy outline-none">Um welches Objekt geht es?</h2>
                <p className="mt-6 text-sm font-semibold text-navy">Objektart</p>
                <div role="radiogroup" aria-label="Objektart" className="mt-3 grid gap-2 sm:grid-cols-3">
                  {OBJECTS.map((o) => (
                    <Choice key={o} label={o} selected={data.object === o} onClick={() => set("object", o)} />
                  ))}
                </div>
                {err("object")}
                <p className="mt-8 text-sm font-semibold text-navy">Vorhaben</p>
                <div role="radiogroup" aria-label="Vorhaben" className="mt-3 grid gap-2 sm:grid-cols-2">
                  {PLANS.map((o) => (
                    <Choice key={o} label={o} selected={data.plan === o} onClick={() => set("plan", o)} />
                  ))}
                </div>
                {err("plan")}
              </>
            ) : step === 2 ? (
              <>
                <legend className="sr-only">Anliegen</legend>
                <h2 ref={heading} tabIndex={-1} className="text-[clamp(1.6rem,3vw,2.4rem)] text-navy outline-none">Was haben Sie vor?</h2>
                <label htmlFor="message" className="mt-6 block text-sm font-semibold text-navy">Ihr Anliegen *</label>
                <textarea
                  id="message"
                  rows={5}
                  value={data.message}
                  onChange={(e) => set("message", e.target.value)}
                  className={`${input} mt-2 resize-y`}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : "message-hint"}
                />
                <p id="message-hint" className="mt-2 text-sm text-muted">Zum Beispiel: Gebäudegröße, vorhandene Technik, was Sie stört oder was Sie sich wünschen.</p>
                {err("message")}
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="place" className="block text-sm font-semibold text-navy">PLZ / Ort des Objekts</label>
                    <input id="place" autoComplete="address-level2" value={data.place} onChange={(e) => set("place", e.target.value)} className={`${input} mt-2`} />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-semibold text-navy">Zeitraum</label>
                    <select id="time" value={data.time} onChange={(e) => set("time", e.target.value)} className={`${input} mt-2`}>
                      <option value="">Bitte wählen</option>
                      {TIMES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <legend className="sr-only">Kontakt</legend>
                <h2 ref={heading} tabIndex={-1} className="text-[clamp(1.6rem,3vw,2.4rem)] text-navy outline-none">Wie erreichen wir Sie?</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-navy">Name *</label>
                    <input id="name" autoComplete="name" value={data.name} onChange={(e) => set("name", e.target.value)} className={`${input} mt-2`} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
                    {err("name")}
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-semibold text-navy">Firma</label>
                    <input id="company" autoComplete="organization" value={data.company} onChange={(e) => set("company", e.target.value)} className={`${input} mt-2`} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-navy">E-Mail *</label>
                    <input id="email" type="email" inputMode="email" autoComplete="email" value={data.email} onChange={(e) => set("email", e.target.value)} className={`${input} mt-2`} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
                    {err("email")}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-navy">Telefon</label>
                    <input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={data.phone} onChange={(e) => set("phone", e.target.value)} className={`${input} mt-2`} />
                  </div>
                </div>
                <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label>
                    Bitte leer lassen <input tabIndex={-1} autoComplete="off" value={data.gotcha} onChange={(e) => set("gotcha", e.target.value)} />
                  </label>
                </div>
                <label className="mt-8 flex cursor-pointer items-start gap-4 text-[0.95rem] leading-relaxed text-muted">
                  <input
                    type="checkbox"
                    checked={data.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 accent-navy"
                    aria-invalid={!!errors.consent}
                    aria-describedby={errors.consent ? "consent-error" : undefined}
                  />
                  <span>
                    Ich bin einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage verarbeitet werden. Die Übermittlung erfolgt über
                    den Dienst Formspree. Details in der{" "}
                    <Link href="/datenschutz/" className="link text-navy">Datenschutzerklärung</Link>. *
                  </span>
                </label>
                {err("consent")}
              </>
            )}
          </motion.fieldset>
        </AnimatePresence>
      </div>

      <div aria-live="assertive">
        {status === "error" ? (
          <p className="field-error mt-6 border-l-2 border-heat-ink bg-kalk px-5 py-4 text-sm text-heat-ink">
            Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie direkt an{" "}
            <a href={`mailto:${site.email}`} className="link">{site.email}</a>.
          </p>
        ) : null}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-navy/10 pt-6">
        {step > 0 ? (
          <button type="button" onClick={back} className="btn btn-outline-dark">Zurück</button>
        ) : (
          <span className="text-sm text-muted">* Pflichtfelder</span>
        )}
        {step < STEPS.length - 1 ? (
          <button type="submit" className="btn btn-primary">Weiter</button>
        ) : (
          <button type="submit" disabled={status === "sending"} className="btn btn-primary disabled:opacity-60">
            {status === "sending" ? "Wird gesendet …" : "Anfrage senden"}
          </button>
        )}
      </div>
    </form>
  );
}
