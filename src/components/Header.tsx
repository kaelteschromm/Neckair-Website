"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useReduceMotion } from "@/lib/useReduceMotion";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { nav, site } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReduceMotion();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const delta = y - lastY.current;
      if (Math.abs(delta) < 6) return;
      setHidden(y > 400 && delta > 0);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled && !open;
  const isActive = (href: string) => pathname?.startsWith(href.replace(/\/$/, ""));

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color,box-shadow] duration-700 ease-[var(--ease-out-expo)] ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        } ${solid ? "bg-paper/85 text-navy-900 shadow-[0_1px_0_rgb(11_34_57/0.08)] backdrop-blur-xl" : "bg-transparent text-paper"}`}
      >
        <div className="container-x flex h-20 items-center justify-between gap-6 lg:h-24">
          <Link href="/" className="relative z-10 shrink-0" aria-label="Neckair – zur Startseite">
            <Logo tone={solid ? "dark" : "light"} className="h-7 w-auto lg:h-8" />
          </Link>

          <nav aria-label="Hauptnavigation" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="group relative block px-4 py-2 text-[0.92rem] font-medium"
                  >
                    {item.label}
                    <span
                      className={`absolute inset-x-4 bottom-1 h-px origin-left bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                        isActive(item.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/kontakt/"
              className={`btn hidden !py-3 sm:inline-flex ${solid ? "btn-dark" : "btn-light"}`}
            >
              Kontakt <span className="arrow" aria-hidden>→</span>
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Menü schließen" : "Menü öffnen"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-3 w-6">
                <span className={`absolute left-0 h-[1.5px] w-6 bg-current transition-all duration-500 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-[1.5px] w-6 bg-current transition-all duration-500 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menü"
            className="fixed inset-0 z-40 flex flex-col bg-navy-950 text-paper lg:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.8, ease: [0.77, 0, 0.18, 1] }}
          >
            <nav aria-label="Mobile Navigation" className="container-x flex flex-1 flex-col justify-center pt-24">
              <ul className="space-y-1">
                {[{ href: "/", label: "Start" }, ...nav, { href: "/kontakt/", label: "Kontakt" }].map((item, i) => (
                  <li key={item.href} className="overflow-hidden">
                    <motion.div
                      initial={reduce ? false : { y: "100%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className="flex items-baseline gap-4 py-1.5 text-[2.1rem] font-medium leading-tight tracking-tight"
                      >
                        <span className="w-7 text-xs font-semibold tracking-widest text-sky">{String(i + 1).padStart(2, "0")}</span>
                        {item.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="container-x space-y-1 pb-10 text-sm text-paper/60">
              <a href={`tel:${site.phoneHref}`} className="block">{site.phone}</a>
              <a href={`mailto:${site.email}`} className="block">{site.email}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
