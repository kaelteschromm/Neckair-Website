"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type FormEvent } from "react";
import { site } from "@/lib/site";
import { Arrow } from "./Arrow";

const TOPICS = ["Heizung", "Sanitär", "Klima", "Lüftung", "Wartung / Service", "Sonstiges"];
type Errors = Partial<Record<"name" | "email" | "message" | "consent" | "topic", string>>;
type Status = "idle" | "sending" | "success" | "error";

const field =
  "peer w-full rounded-none border-0 border-b border-navy-900/20 bg-transparent px-0 pb-3 pt-7 text-lg text-navy-900 placeholder-transparent transition-colors focus:border-navy-900 focus:outline-none focus:ring-0 aria-[invalid=true]:border-ember-strong";
const label =
  "pointer-events-none absolute left-0 top-7 text-lg text-muted transition-all duration-300 peer-focus:top-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.18em] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.18em]";

export function ContactForm() {
  const [topics, setTopics] = useState<string[]>([]);
  const [customer, setCustomer] = useState<"Privat" | "Gewerbe">("Privat");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const toggle = (t: string) => setTopics((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  function validate(fd: FormData): Errors {
    const e: Errors = {};
    if (!topics.length) e.topic = "Bitte wählen Sie mindestens einen Bereich.";
    if (!String(fd.get("name") || "").trim()) e.name = "Bitte geben Sie Ihren Namen an.";
    const email = String(fd.get("email") || "").trim();
    if (!email) e.email = "Bitte geben Sie Ihre E-Mail-Adresse an.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "Bitte prüfen Sie die E-Mail-Adresse.";
    if (String(fd.get("message") || "").trim().length < 10) e.message = "Bitte beschreiben Sie Ihr Anliegen kurz (mind. 10 Zeichen).";
    if (!fd.get("consent")) e.consent = "Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.";
    return e;
  }

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const fd = new FormData(form);
    const e = validate(fd);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = form.querySelector<HTMLElement>(`[data-field="${Object.keys(e)[0]}"]`);
      first?.focus();
      return;
    }
    if (fd.get("_gotcha")) return; // Spam-Schutz
    setStatus("sending");
    try {
      const res = await fetch(site.formEndpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: `Neue Anfrage über neckair: ${topics.join(", ")}`,
          bereich: topics.join(", "),
          kundentyp: customer,
          name: fd.get("name"),
          firma: fd.get("company") || "",
          email: fd.get("email"),
          telefon: fd.get("phone") || "",
          ort: fd.get("place") || "",
          nachricht: fd.get("message"),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      form.reset();
      setTopics([]);
    } catch {
      setStatus("error");
    }
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`${k}-error`} className="mt-2 text-sm text-ember-strong">
        {errors[k]}
      </p>
    ) : null;

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="ok"
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-sm bg-navy-900 p-10 text-paper lg:p-14"
          >
            <p className="eyebrow text-sky">Vielen Dank</p>
            <p className="mt-6 text-3xl font-medium tracking-tight lg:text-4xl">
              Ihre Anfrage ist bei uns <span className="display italic">angekommen.</span>
            </p>
            <p className="mt-4 max-w-md text-paper/70">Wir melden uns so schnell wie möglich persönlich bei Ihnen.</p>
            <button type="button" onClick={() => setStatus("idle")} className="btn btn-ghost-light mt-10">
              Weitere Anfrage senden
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            noValidate
            onSubmit={onSubmit}
            initial={false}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
            aria-describedby="form-hint"
          >
            <fieldset>
              <legend className="eyebrow text-azure-strong">Worum geht es?</legend>
              <div className="mt-6 flex flex-wrap gap-2" data-field="topic" tabIndex={-1}>
                {TOPICS.map((t) => {
                  const on = topics.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(t)}
                      className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                        on ? "border-navy-900 bg-navy-900 text-paper" : "border-navy-900/20 text-navy-900 hover:border-navy-900/60"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              {err("topic")}
            </fieldset>

            <fieldset>
              <legend className="eyebrow text-azure-strong">Sie sind</legend>
              <div className="mt-6 inline-flex rounded-full border border-navy-900/20 p-1">
                {(["Privat", "Gewerbe"] as const).map((c) => (
                  <label key={c} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="customer"
                      value={c}
                      checked={customer === c}
                      onChange={() => setCustomer(c)}
                      className="peer sr-only"
                    />
                    <span className="block rounded-full px-5 py-2 text-sm font-medium text-navy-900 transition-colors peer-checked:bg-navy-900 peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-sky">
                      {c === "Privat" ? "Privatkunde" : "Geschäftskunde"}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              <div className="relative">
                <input id="name" name="name" data-field="name" autoComplete="name" placeholder="Name" className={field}
                  aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
                <label htmlFor="name" className={label}>Name *</label>
                {err("name")}
              </div>
              <div className="relative">
                <input id="company" name="company" autoComplete="organization" placeholder="Firma" className={field} />
                <label htmlFor="company" className={label}>Firma (optional)</label>
              </div>
              <div className="relative">
                <input id="email" name="email" type="email" data-field="email" autoComplete="email" inputMode="email" placeholder="E-Mail" className={field}
                  aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
                <label htmlFor="email" className={label}>E-Mail *</label>
                {err("email")}
              </div>
              <div className="relative">
                <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="Telefon" className={field} />
                <label htmlFor="phone" className={label}>Telefon (optional)</label>
              </div>
              <div className="relative sm:col-span-2">
                <input id="place" name="place" autoComplete="address-level2" placeholder="PLZ / Ort" className={field} />
                <label htmlFor="place" className={label}>PLZ / Ort des Objekts (optional)</label>
              </div>
              <div className="relative sm:col-span-2">
                <textarea id="message" name="message" data-field="message" rows={5} placeholder="Nachricht" className={`${field} resize-y`}
                  aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} />
                <label htmlFor="message" className={label}>Ihr Anliegen *</label>
                {err("message")}
              </div>
            </div>

            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>Bitte leer lassen <input name="_gotcha" tabIndex={-1} autoComplete="off" /></label>
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-4 text-[0.95rem] leading-relaxed text-muted">
                <input
                  type="checkbox"
                  name="consent"
                  data-field="consent"
                  className="mt-1 h-5 w-5 shrink-0 accent-navy-900"
                  aria-invalid={!!errors.consent}
                  aria-describedby={errors.consent ? "consent-error" : undefined}
                />
                <span>
                  Ich bin einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage verarbeitet werden. Die Übermittlung erfolgt über den
                  Dienst Formspree. Details in der{" "}
                  <Link href="/datenschutz/" className="text-navy-900 underline underline-offset-4">Datenschutzerklärung</Link>. *
                </span>
              </label>
              {err("consent")}
            </div>

            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <button type="submit" disabled={status === "sending"} className="btn btn-dark disabled:opacity-60">
                {status === "sending" ? "Wird gesendet …" : "Anfrage senden"} <Arrow className="arrow" />
              </button>
              <p id="form-hint" className="text-sm text-muted">* Pflichtfelder</p>
            </div>
            <div aria-live="assertive">
              {status === "error" && (
                <p className="rounded-sm border border-ember-strong/30 bg-ember/10 px-5 py-4 text-sm text-ember-strong">
                  Leider konnte Ihre Anfrage nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt an{" "}
                  <a href={`mailto:${site.email}`} className="underline">{site.email}</a>.
                </p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
