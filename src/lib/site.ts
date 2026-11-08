// Zentrale Firmendaten. Werte mit PLATZHALTER-Kommentar bitte vor dem Livegang ersetzen.
export const site = {
  name: "Neckair",
  claim: "Heizung · Sanitär · Klima · Lüftung",
  description:
    "Neckair plant, installiert und betreut Heizung, Sanitär, Klima und Lüftung für Privat- und Geschäftskunden – präzise, effizient und zuverlässig.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://xn--hnig-0ra.com",
  owner: "Jérôme Hünig",
  street: "Musterstraße 12", // PLATZHALTER
  zip: "68753",
  city: "Waghäusel",
  region: "Baden-Württemberg",
  country: "Deutschland",
  phone: "07254 / 123456", // PLATZHALTER
  phoneHref: "+497254123456", // PLATZHALTER
  email: "kaelteschromm@gmail.com",
  vatId: "DE123456789", // PLATZHALTER
  hours: "Mo – Fr · 7:30 – 17:00 Uhr", // PLATZHALTER
  formEndpoint: "https://formspree.io/f/xaqpnnqp",
  bookingUrl:
    "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3WAFu6PQ3iuhuda1uh1SkaavT_P0iys19oEr77Db8CO_LABc3ejPOT0lzRXaPK3U7eDw-yWnh1?gv=true",
} as const;

export const nav = [
  { href: "/heizung/", label: "Heizung" },
  { href: "/sanitaer/", label: "Sanitär" },
  { href: "/klima/", label: "Klima" },
  { href: "/lueftung/", label: "Lüftung" },
  { href: "/referenzen/", label: "Referenzen" },
  { href: "/unternehmen/", label: "Unternehmen" },
] as const;

/** Pfad für Dateien aus /public – berücksichtigt den basePath der Vorschau. */
export const asset = (p: string) => `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${p}`;
