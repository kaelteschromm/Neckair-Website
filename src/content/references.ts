import type { ImageName } from "@/lib/images.generated";
import type { ServiceSlug } from "./services";

export interface Reference {
  slug: string;
  title: string;
  /** Projektart, z. B. „Neubau Einfamilienhaus“ */
  type: string;
  trades: ServiceSlug[];
  client: "Privat" | "Gewerbe";
  summary: string;
  situation: string;
  challenge: string;
  solution: string;
  result: string;
  services: string[];
  image: ImageName;
  imageAlt: string;
  /**
   * true = Demo-Projekt: Symbolbild und beispielhafter Text, KEIN realer Auftrag.
   * Wird auf der Website überall als Demo gekennzeichnet und nicht indexiert.
   * Vor der offiziellen Veröffentlichung durch echte NECKAIR-Projekte ersetzen oder entfernen.
   */
  example: boolean;
}

export const references: Reference[] = [
  {
    slug: "einfamilienhaus-waermepumpe",
    title: "Einfamilienhaus mit Wärmepumpe",
    type: "Neubau Einfamilienhaus",
    trades: ["heizung", "sanitaer"],
    client: "Privat",
    summary: "Wärmepumpe und Flächenheizung in allen Räumen für einen Neubau mit niedrigem Wärmebedarf.",
    situation: "Ein Neubau mit guter Dämmung und dem Wunsch, vollständig auf fossile Energie zu verzichten.",
    challenge: "Die Heizlast sollte genau getroffen werden, damit die Wärmepumpe effizient und leise arbeitet.",
    solution: "Heizlastberechnung je Raum, Luft-Wasser-Wärmepumpe, Fußbodenheizung in beiden Etagen und hydraulischer Abgleich.",
    result: "Gleichmäßige Wärme bei niedriger Vorlauftemperatur und eine Anlage, die über eine App bedient werden kann.",
    services: ["Luft-Wasser-Wärmepumpe", "Fußbodenheizung", "Hydraulischer Abgleich"],
    image: "haus-am-wald",
    imageAlt: "Einfamilienhaus mit Wärmepumpe und Photovoltaik am Waldrand",
    example: true,
  },
  {
    slug: "sanitaer-gewerbe",
    title: "Sanitärbereich im Gewerbeobjekt",
    type: "Umbau Gewerbe",
    trades: ["sanitaer"],
    client: "Gewerbe",
    summary: "Robuste, pflegeleichte Sanitärräume für hohe Frequenz mit hygienischer Leitungsführung.",
    situation: "Stark genutzte Sanitärräume in einem Gewerbeobjekt, deren Installation in die Jahre gekommen war.",
    challenge: "Umbau im laufenden Betrieb und eine Trinkwasserinstallation ohne Stagnationsstrecken.",
    solution: "Neue Leitungsführung mit kurzen Wegen, berührungslose Armaturen und ein Konzept zur Trinkwasserhygiene.",
    result: "Hygienische, leicht zu reinigende Räume und eine Installation, die im Betrieb sicher bleibt.",
    services: ["Trinkwasserinstallation", "Berührungslose Armaturen", "Hygienekonzept"],
    image: "waschbereich-rund",
    imageAlt: "Runder Waschtisch mit mehreren Armaturen in einem modernen Sanitärraum",
    example: true,
  },
  {
    slug: "badsanierung",
    title: "Badsanierung mit Aufsatzwaschtisch",
    type: "Sanierung Bad",
    trades: ["sanitaer"],
    client: "Privat",
    summary: "Komplette Badsanierung mit klarer Linie und verdeckter Installation.",
    situation: "Ein Bad aus den Neunzigern mit dunklen Fliesen und einer Wanne, die kaum genutzt wurde.",
    challenge: "Mehr Bewegungsfläche auf gleichem Grundriss und eine Bauzeit, in der die Familie weiter im Haus wohnt.",
    solution: "Bodengleiche Dusche, Aufsatzwaschtisch auf Massivholz, großformatige Fliesen und Vorwandinstallation.",
    result: "Ein ruhiges, helles Bad, das größer wirkt und sich leicht pflegen lässt.",
    services: ["Badgestaltung", "Bodengleiche Dusche", "Vorwandinstallation"],
    image: "waschtisch-weiss",
    imageAlt: "Weißer Aufsatzwaschtisch auf einer hellen Holzplatte",
    example: true,
  },
  {
    slug: "wohnung-klima",
    title: "Wohnung mit Multisplit-Klima",
    type: "Nachrüstung Wohnung",
    trades: ["klima"],
    client: "Privat",
    summary: "Leise Klimatisierung für Wohn- und Schlafräume, die in der Übergangszeit auch heizt.",
    situation: "Eine Dachgeschosswohnung, die sich im Sommer stark aufheizt.",
    challenge: "Mehrere Räume kühlen, ohne die Fassade mit Geräten zu überladen.",
    solution: "Ein Außengerät mit drei Innengeräten, verdeckte Leitungsführung und Einzelraumregelung.",
    result: "Angenehme Temperaturen in jedem Raum und ein Außengerät, das kaum wahrnehmbar arbeitet.",
    services: ["Multisplit-System", "Kühlen und Heizen", "Wartungsvertrag"],
    image: "wohnzimmer",
    imageAlt: "Helles Wohnzimmer mit blauem Sofa und großen Fenstern",
    example: true,
  },
  {
    slug: "buerogebaeude",
    title: "Bürogebäude",
    type: "Gewerbe Bestand",
    trades: ["klima"],
    client: "Gewerbe",
    summary: "Arbeitsklima für Büroflächen und eine redundante Kühlung für den Serverraum.",
    situation: "Ein Bürogebäude mit großen Glasflächen und einem Serverraum ohne eigene Kühlung.",
    challenge: "Verlässliche Temperaturen für Arbeitsplätze und Technik, auch bei Ausfall eines Geräts.",
    solution: "Klimatisierung der Büroflächen und eine zweifach ausgelegte Kühlung für den Serverraum.",
    result: "Konstante Bedingungen für Menschen und Technik und planbare Wartung.",
    services: ["Büroklimatisierung", "Serverraumkühlung", "Wartung"],
    image: "glasfassade",
    imageAlt: "Moderne Glasfassade eines Bürogebäudes",
    example: true,
  },
  {
    slug: "modernisierung-bestand",
    title: "Heizungsmodernisierung im Bestand",
    type: "Modernisierung Bestand",
    trades: ["heizung"],
    client: "Privat",
    summary: "Neue Verteilung, hydraulischer Abgleich und moderne Regelung für ein Bestandsgebäude.",
    situation: "Ein Bestandsgebäude mit altem Kessel und ungleich warmen Räumen.",
    challenge: "Effizienter heizen, ohne alle Heizflächen zu tauschen.",
    solution: "Neuer Heizkreisverteiler, hydraulischer Abgleich und eine Regelung, die sich der Nutzung anpasst.",
    result: "Gleichmäßig warme Räume und eine Anlage, die auf eine spätere Wärmepumpe vorbereitet ist.",
    services: ["Kesseltausch", "Hydraulischer Abgleich", "Heizkreisverteiler"],
    image: "heizkreisverteiler",
    imageAlt: "Heizkreisverteiler einer Fußbodenheizung mit Stellventilen",
    example: true,
  },
  {
    slug: "wohnhaus-hanglage",
    title: "Wohnhaus in Hanglage",
    type: "Neubau Wohnhaus",
    trades: ["heizung", "sanitaer", "klima"],
    client: "Privat",
    summary: "Gebäudetechnik für ein architektonisch anspruchsvolles Wohnhaus – vom Technikraum bis zum fertigen Bad.",
    situation: "Ein Wohnhaus mit auskragendem Obergeschoss und großen Glasflächen.",
    challenge: "Drei Gewerke abgestimmt planen, damit Technik und Architektur sich nicht im Weg stehen.",
    solution: "Wärmepumpe mit Flächenheizung, zwei Bäder mit Trinkwasser-Zirkulation und Klimatisierung im Obergeschoss.",
    result: "Ein Haus, in dem die Technik unsichtbar bleibt und trotzdem jederzeit erreichbar ist.",
    services: ["Wärmepumpe", "Trinkwasserinstallation", "Klimatisierung"],
    image: "villa-pforzheim",
    imageAlt: "Moderne weiße Villa mit auskragendem Obergeschoss",
    example: true,
  },
];
