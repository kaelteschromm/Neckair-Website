import type { ImageName } from "@/lib/images.generated";

export interface Reference {
  slug: string;
  title: string;
  category: string;
  services: string[];
  client: "Privat" | "Gewerbe";
  text: string;
  image: ImageName;
  imageAlt: string;
  /**
   * true = Beispielprojekt mit Symbolbild. Wird auf der Website als solches gekennzeichnet.
   * Bitte durch echte Neckair-Projekte (eigene Fotos, Freigabe der Kunden) ersetzen.
   */
  example: boolean;
}

export const references: Reference[] = [
  {
    slug: "einfamilienhaus-waermepumpe",
    title: "Einfamilienhaus mit Wärmepumpe",
    category: "Heizung · Lüftung",
    services: ["Luft-Wasser-Wärmepumpe", "Fußbodenheizung", "Wohnraumlüftung"],
    client: "Privat",
    text: "Neubau mit niedrigem Wärmebedarf: Wärmepumpe, Flächenheizung in allen Räumen und kontrollierte Wohnraumlüftung mit Wärmerückgewinnung.",
    image: "haus-am-wald",
    imageAlt: "Einfamilienhaus mit Wärmepumpe und Photovoltaik am Waldrand",
    example: true,
  },
  {
    slug: "sanitaer-gewerbe",
    title: "Sanitärbereich im Gewerbeobjekt",
    category: "Sanitär",
    services: ["Trinkwasserinstallation", "Berührungslose Armaturen", "Hygienekonzept"],
    client: "Gewerbe",
    text: "Robuste, pflegeleichte Sanitärräume für hohe Frequenz – mit berührungslosen Armaturen und hygienischer Leitungsführung.",
    image: "waschbereich-rund",
    imageAlt: "Runder Waschtisch mit mehreren Armaturen in einem modernen Sanitärraum",
    example: true,
  },
  {
    slug: "badsanierung",
    title: "Badsanierung mit Aufsatzwaschtisch",
    category: "Sanitär",
    services: ["Badplanung", "Aufsatzwaschtisch", "Bodengleiche Dusche"],
    client: "Privat",
    text: "Komplette Badsanierung mit klarer Linie: Aufsatzwaschtisch auf Massivholz, großformatige Fliesen und verdeckte Installation.",
    image: "waschtisch-weiss",
    imageAlt: "Weißer Aufsatzwaschtisch auf einer hellen Holzplatte",
    example: true,
  },
  {
    slug: "wohnung-klima",
    title: "Wohnung mit Multisplit-Klima",
    category: "Klima",
    services: ["Multisplit-System", "Kühlen & Heizen", "Wartungsvertrag"],
    client: "Privat",
    text: "Leise Klimatisierung für Wohn- und Schlafräume – dezent integriert, raumweise regelbar und in der Übergangszeit auch zum Heizen genutzt.",
    image: "wohnzimmer",
    imageAlt: "Helles Wohnzimmer mit blauem Sofa und großen Fenstern",
    example: true,
  },
  {
    slug: "buerogebaeude",
    title: "Bürogebäude",
    category: "Klima · Lüftung",
    services: ["Büroklimatisierung", "Lüftungsanlage", "Serverraumkühlung"],
    client: "Gewerbe",
    text: "Angenehmes Arbeitsklima für Büroflächen und Besprechungsräume, dazu eine redundante Kühlung für den Serverraum.",
    image: "glasfassade",
    imageAlt: "Moderne Glasfassade eines Bürogebäudes",
    example: true,
  },
  {
    slug: "modernisierung-bestand",
    title: "Heizungsmodernisierung im Bestand",
    category: "Heizung",
    services: ["Kesseltausch", "Hydraulischer Abgleich", "Heizkreisverteiler"],
    client: "Privat",
    text: "Umstellung eines Bestandsgebäudes auf effiziente Wärme: neue Verteilung, hydraulischer Abgleich und moderne Regelung.",
    image: "heizkreisverteiler",
    imageAlt: "Heizkreisverteiler einer Fußbodenheizung mit Stellventilen",
    example: true,
  },
  {
    slug: "wohnhaus-hanglage",
    title: "Wohnhaus in Hanglage",
    category: "Heizung · Sanitär",
    services: ["Wärmepumpe", "Trinkwasserinstallation", "Zwei Bäder"],
    client: "Privat",
    text: "Gebäudetechnik für ein architektonisch anspruchsvolles Wohnhaus – vom Technikraum bis zum fertigen Bad.",
    image: "villa-pforzheim",
    imageAlt: "Moderne weiße Villa mit auskragendem Obergeschoss",
    example: true,
  },
];
