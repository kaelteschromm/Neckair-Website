"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useReduceMotion } from "@/lib/useReduceMotion";
import { Logo } from "./Logo";
import { Picture } from "./Picture";
import { site } from "@/lib/site";
import { serviceList } from "@/content/services";

const MAIN = [
  { href: "/referenzen/", label: "Referenzen" },
  { href: "/unternehmen/", label: "Unternehmen" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false); // Mobilmenü
  const [drop, setDrop] = useState(false); // Leistungen-Dropdown
  const reduce = useReduceMotion();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const dropBtn = useRef<HTMLButtonElement>(null);
  const dropWrap = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const delta = y - lastY.current;
      if (Math.abs(delta) < 6) return;
      setHidden(y > 400 && delta > 0);
      if (delta > 0) setDrop(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setDrop(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open && !drop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (open) {
        setOpen(false);
        toggleRef.current?.focus();
      } else if (drop) {
        setDrop(false);
        dropBtn.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, drop]);

  // Hover-Absicht: kurz verzögert öffnen/schließen, damit Überfahren nicht flackert
  const hover = (v: boolean) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setDrop(v), v ? 70 : 140);
  };

  const solid = (scrolled || drop) && !open;
  const isActive = (href: string) => pathname?.startsWith(href.replace(/\/$/, ""));
  const serviceActive = serviceList.some((s) => isActive(`/${s.slug}/`));

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color,box-shadow] duration-300 ease-[var(--ease-out)] ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        } ${solid ? "bg-white/90 text-navy shadow-[0_1px_0_rgb(11_34_57/0.1)] backdrop-blur-xl" : "bg-transparent text-on-dark"}`}
      >
        <div className="container-x flex h-20 items-center justify-between gap-6 lg:h-24">
          <Link href="/" className="relative z-10 shrink-0" aria-label="NECKAIR – zur Startseite">
            <Logo tone={solid ? "dark" : "light"} className="h-7 w-auto lg:h-8" />
          </Link>

          <nav aria-label="Hauptnavigation" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              <li>
                <div
                  ref={dropWrap}
                  className="relative"
                  onPointerEnter={() => hover(true)}
                  onPointerLeave={() => hover(false)}
                  onBlur={(e) => {
                    if (!dropWrap.current?.contains(e.relatedTarget as Node)) setDrop(false);
                  }}
                >
                  <button
                    ref={dropBtn}
                    type="button"
                    aria-expanded={drop}
                    aria-controls="leistungen-menu"
                    onClick={() => setDrop((v) => !v)}
                    className="group relative flex items-center gap-1.5 px-4 py-2 text-[0.92rem] font-medium"
                  >
                    Leistungen
                    <svg viewBox="0 0 12 12" aria-hidden className={`h-3 w-3 transition-transform duration-200 ease-[var(--ease-out)] ${drop ? "rotate-180" : ""}`}>
                      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    <span
                      className={`absolute inset-x-4 bottom-1 h-px origin-left bg-current transition-transform duration-300 ease-[var(--ease-out)] ${
                        serviceActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </button>

                  {/* Dropdown: wächst aus dem Auslöser (origin oben links), 200 ms, --ease-out */}
                  <div
                    id="leistungen-menu"
                    className={`absolute left-0 top-full w-[40rem] origin-top-left pt-3 transition-[opacity,transform,visibility] duration-200 ease-[var(--ease-out)] ${
                      drop ? "visible scale-100 opacity-100" : "pointer-events-none invisible scale-[0.97] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden border border-on-dark/10 bg-graphite p-2 text-on-dark shadow-[0_24px_48px_-24px_rgb(0_0_0/0.6)]">
                      <ul className="grid gap-1">
                        {serviceList.map((s) => (
                          <li key={s.slug}>
                            <Link
                              href={`/${s.slug}/`}
                              tabIndex={drop ? 0 : -1}
                              className="group/item flex items-center gap-5 p-3 transition-colors duration-200 hover:bg-on-dark/[0.06] focus-visible:bg-on-dark/[0.06]"
                            >
                              <span className="relative block h-16 w-24 shrink-0 overflow-hidden">
                                <Picture name={s.hero} alt="" sizes="96px" imgClassName="transition-transform duration-300 ease-[var(--ease-out)] group-hover/item:scale-105" />
                              </span>
                              <span className="min-w-0">
                                <span className="flex items-center gap-3 font-display text-lg font-semibold [font-stretch:110%]">
                                  <span aria-hidden className={`h-2 w-2 ${s.medium === "heat" ? "bg-heat" : s.medium === "water" ? "bg-water" : "bg-cold"}`} />
                                  {s.title}
                                </span>
                                <span className="mt-1 line-clamp-2 block text-sm leading-snug text-on-dark-muted">{s.teaser}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
              {MAIN.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="group relative block px-4 py-2 text-[0.92rem] font-medium"
                  >
                    {item.label}
                    <span
                      className={`absolute inset-x-4 bottom-1 h-px origin-left bg-current transition-transform duration-300 ease-[var(--ease-out)] ${
                        isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <a href={`tel:${site.phoneHref}`} className="hidden text-sm font-medium opacity-80 transition-opacity duration-200 hover:opacity-100 xl:block">
              {site.phone}
            </a>
            <Link href="/kontakt/" className={`btn hidden !py-3 sm:inline-flex ${solid ? "btn-primary" : "btn-light"}`}>
              Projekt anfragen
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="press relative z-10 flex h-11 w-11 items-center justify-center lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Menü schließen" : "Menü öffnen"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-3 w-6">
                <span className={`absolute left-0 h-[1.5px] w-6 bg-current transition-transform duration-300 ease-[var(--ease-out)] ${open ? "translate-y-1.5 rotate-45" : ""}`} />
                <span className={`absolute left-0 top-3 h-[1.5px] w-6 bg-current transition-transform duration-300 ease-[var(--ease-out)] ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobilmenü: Drawer-Kurve, 450 ms; Einträge mit 40 ms Versatz */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menü"
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-graphite text-on-dark lg:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: reduce ? 0.2 : 0.45, ease: [0.32, 0.72, 0, 1] }}
          >
            <nav aria-label="Mobile Navigation" className="container-x relative flex flex-1 flex-col justify-center pb-8 pt-28">
              <p className="mb-3 text-sm text-on-dark-muted">Leistungen</p>
              <ul className="grid gap-2">
                {serviceList.map((s, i) => (
                  <motion.li
                    key={s.slug}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1], delay: 0.12 + i * 0.04 }}
                  >
                    <Link href={`/${s.slug}/`} className="press relative block h-20 overflow-hidden">
                      <Picture name={s.hero} alt="" sizes="100vw" />
                      <span className="absolute inset-0 bg-gradient-to-r from-graphite/90 to-graphite/20" />
                      <span className="absolute bottom-3 left-4 flex items-center gap-3 font-display text-xl font-semibold [font-stretch:110%]">
                        <span aria-hidden className={`h-2 w-2 ${s.medium === "heat" ? "bg-heat" : s.medium === "water" ? "bg-water" : "bg-cold"}`} />
                        {s.title}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <ul className="mt-8 space-y-1">
                {[{ href: "/", label: "Start" }, ...MAIN, { href: "/kontakt/", label: "Kontakt" }].map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1], delay: 0.28 + i * 0.04 }}
                  >
                    <Link href={item.href} className="flex items-center justify-between py-2 font-display text-[1.9rem] font-semibold leading-tight [font-stretch:115%]">
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="container-x relative space-y-1 pb-10 text-sm text-on-dark-muted">
              <a href={`tel:${site.phoneHref}`} className="block">{site.phone}</a>
              <a href={`mailto:${site.email}`} className="block">{site.email}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
