import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";
import { site } from "@/lib/site";

// Schriften werden beim Build heruntergeladen und lokal ausgeliefert – keine Verbindung zu Google im Browser.
// Archivo (breite Schnitte über die wdth-Achse) für Headlines – wie Planbeschriftung und Typenschilder;
// IBM Plex Sans für Fließtext, Plex Mono nur für Beschriftungen in technischen Zeichnungen.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plexmono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url.endsWith("/") ? site.url : site.url + "/"),
  title: { default: `${site.name} – Heizung, Sanitär & Trinkwasser, Klima & Kälte`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.owner }],
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: site.name,
    title: `${site.name} – Heizung, Sanitär & Trinkwasser, Klima & Kälte`,
    description: site.description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "3D-Modell eines modernen Einfamilienhauses – NECKAIR" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: { icon: [{ url: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon.svg`, type: "image/svg+xml" }] },
};

/**
 * Content Security Policy als Meta-Tag (GitHub Pages kann keine Header setzen).
 * 'unsafe-inline' ist für die Inline-Skripte des statischen Next.js-Exports nötig; Verbindungen gehen nur an die eigene
 * Domain und an den Formular-Dienst. frame-ancestors wirkt nur als HTTP-Header (siehe NECKAIR-SECURITY-REPORT.md).
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' ${new URL(site.formEndpoint).origin} data: blob:`,
  `form-action 'self' ${new URL(site.formEndpoint).origin}`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

export const viewport: Viewport = {
  themeColor: "#14181d",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HVACBusiness",
  name: site.name,
  description: site.description,
  url: site.url,
  email: site.email,
  telephone: site.phoneHref,
  founder: { "@type": "Person", name: site.owner },
  address: {
    "@type": "PostalAddress",
    streetAddress: site.street,
    postalCode: site.zip,
    addressLocality: site.city,
    addressRegion: site.region,
    addressCountry: "DE",
  },
  areaServed: [...site.serviceArea.map((name) => ({ "@type": "City", name })), { "@type": "State", name: site.region }],
  knowsAbout: ["Heizung", "Wärmepumpen", "Flächenheizung", "Sanitär", "Trinkwasserhygiene", "Klimaanlagen", "Kältetechnik"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${archivo.variable} ${plex.variable} ${plexMono.variable}`}>
      <head>
        {process.env.NODE_ENV === "production" ? <meta httpEquiv="Content-Security-Policy" content={CSP} /> : null}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className="min-h-dvh">
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
        <a
          href="#inhalt"
          className="sr-only z-[100] bg-white px-5 py-3 font-semibold text-navy focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Zum Inhalt springen
        </a>
        <MotionProvider>
          <Header />
          <main id="inhalt" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
        </MotionProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
