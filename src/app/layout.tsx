import type { Metadata, Viewport } from "next";
import { Manrope, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";
import { site } from "@/lib/site";

// Schriften werden beim Build heruntergeladen und lokal ausgeliefert – keine Verbindung zu Google im Browser.
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url.endsWith("/") ? site.url : site.url + "/"),
  title: { default: `${site.name} – Heizung, Sanitär, Klima & Lüftung`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.owner }],
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: site.name,
    title: `${site.name} – Heizung, Sanitär, Klima & Lüftung`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  icons: { icon: [{ url: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon.svg`, type: "image/svg+xml" }] },
};

export const viewport: Viewport = {
  themeColor: "#0b2239",
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
  areaServed: site.region,
  knowsAbout: ["Heizung", "Wärmepumpen", "Sanitär", "Klimaanlagen", "Kältetechnik", "Lüftung"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${manrope.variable} ${serif.variable}`}>
      <body className="min-h-dvh">
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
        <a
          href="#inhalt"
          className="sr-only z-[100] rounded-full bg-paper px-5 py-3 font-semibold text-navy-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
