import type { ImageName } from "@/lib/images.generated";

export type ServiceSlug = "heizung" | "sanitaer" | "klima";
/** Medium des Gewerks – bestimmt Farbe, Lichtstimmung und System im Gebäudemodell */
export type Medium = "heat" | "water" | "cold";

export interface Service {
  slug: ServiceSlug;
  title: string;
  medium: Medium;
  mediumLabel: string;
  headline: string;
  teaser: string;
  intro: string;
  hero: ImageName;
  heroAlt: string;
  detail: ImageName;
  detailAlt: string;
  seoTitle: string;
  seoDescription: string;
  drawingTitle: string;
  drawingText: string;
  offers: { title: string; text: string }[];
  benefits: string[];
  audiences: { private: string; business: string };
  faq: { q: string; a: string }[];
}

export const services: Record<ServiceSlug, Service> = {
  heizung: {
    slug: "heizung",
    title: "Heizung",
    medium: "heat",
    mediumLabel: "Wärme",
    headline: "Wärme, die mitdenkt.",
    teaser: "Wärmepumpen, Flächenheizung und Modernisierung – geplant nach Heizlast, nicht nach Faustformel.",
    intro:
      "Ein Heizsystem ist nur so gut wie seine Planung. Wir betrachten Gebäude, Wärmebedarf und Nutzung als Ganzes und entwickeln daraus eine Lösung, die leise arbeitet, Energie spart und über Jahre zuverlässig bleibt.",
    hero: "haus-am-wald",
    heroAlt: "Modernes Einfamilienhaus mit Wärmepumpe und Photovoltaik am Waldrand",
    detail: "fussbodenheizung",
    detailAlt: "Verlegte Rohre einer Fußbodenheizung vor dem Estrich",
    seoTitle: "Heizung & Wärmepumpen",
    seoDescription:
      "Wärmepumpen, Flächenheizung, Heizungsmodernisierung und hydraulischer Abgleich von NECKAIR – geplant für Neubau und Bestand.",
    drawingTitle: "Vom Außengerät bis in den Estrich",
    drawingText:
      "Die Wärmepumpe entzieht der Außenluft Energie. Ein Speicher puffert sie, der Verteiler verteilt sie auf die Heizkreise, und die Flächenheizung gibt sie gleichmäßig an den Raum ab – bei niedriger Vorlauftemperatur.",
    offers: [
      { title: "Wärmepumpen", text: "Luft-Wasser- und Sole-Wasser-Wärmepumpen, dimensioniert nach Heizlastberechnung." },
      { title: "Flächenheizung", text: "Fußboden- und Wandheizung für gleichmäßige Wärme bei niedrigen Vorlauftemperaturen." },
      { title: "Modernisierung", text: "Austausch alter Kessel, Hybridlösungen und schrittweise Umstellung auf erneuerbare Wärme." },
      { title: "Neubau und Bestand", text: "Im Neubau planen wir von Anfang an mit, im Bestand finden wir den passenden Weg für vorhandene Heizflächen." },
      { title: "Hydraulischer Abgleich", text: "Jeder Raum bekommt genau die Wärme, die er braucht – effizienter und leiser." },
      { title: "Wartung und Service", text: "Regelmäßige Inspektion für sichere, effiziente Anlagen und eine lange Lebensdauer." },
    ],
    benefits: ["Heizlast- und Bedarfsanalyse vor Ort", "Technische Angaben für Förderanträge", "Ein Ansprechpartner von der Planung bis zur Wartung"],
    audiences: {
      private: "Für Einfamilienhäuser, Doppelhäuser und Wohnungen – im Neubau wie in der Sanierung.",
      business: "Für Mehrfamilienhäuser, Büros und Gewerbeobjekte mit höherem Wärmebedarf und mehreren Heizkreisen.",
    },
    faq: [
      { q: "Funktioniert eine Wärmepumpe auch im Altbau?", a: "In vielen Fällen ja. Entscheidend sind Wärmebedarf, Heizflächen und Vorlauftemperatur. Wir prüfen das vor Ort und sagen Ihnen ehrlich, ob und unter welchen Voraussetzungen es sinnvoll ist." },
      { q: "Wie lange dauert ein Heizungstausch?", a: "Der Austausch selbst dauert meist wenige Tage. Den Ablauf stimmen wir vorab mit Ihnen ab, damit Sie möglichst kurz ohne Wärme sind." },
      { q: "Helfen Sie bei der Förderung?", a: "Wir liefern die technischen Angaben und Nachweise, die für Förderanträge benötigt werden, und beraten Sie zu den Anforderungen an die Anlage." },
    ],
  },
  sanitaer: {
    slug: "sanitaer",
    title: "Sanitär & Trinkwasser",
    medium: "water",
    mediumLabel: "Wasser",
    headline: "Wasser in seiner besten Form.",
    teaser: "Bäder mit klarer Linie und Trinkwasserinstallationen, die hygienisch bleiben – vom Hausanschluss bis zur Armatur.",
    intro:
      "Wasser ist das sensibelste Medium im Haus. Wir planen Bäder und Trinkwasserinstallationen mit Sorgfalt im Detail: hygienisch einwandfrei, durchdacht in der Nutzung und mit Materialien, die auch nach Jahren überzeugen.",
    hero: "armatur-wasser",
    heroAlt: "Moderne Edelstahl-Armatur, aus der Wasser in ein weißes Becken fließt",
    detail: "waschtisch-weiss",
    detailAlt: "Weißer Aufsatzwaschtisch auf einer hellen Holzplatte",
    seoTitle: "Sanitär & Trinkwasser",
    seoDescription:
      "Badgestaltung, Badsanierung, Trinkwasserhygiene, Warmwasser und Sanitärinstallation von NECKAIR – hygienisch, langlebig und hochwertig.",
    drawingTitle: "Der Weg des Wassers",
    drawingText:
      "Am Hausanschluss beginnt die Verantwortung für die Trinkwasserqualität. Filter, kurze Leitungswege und eine Zirkulation, die warmes Wasser in Bewegung hält, sorgen dafür, dass es bis zur Armatur hygienisch bleibt.",
    offers: [
      { title: "Badgestaltung", text: "Vom ersten Grundriss bis zur fertigen Armatur – mit klarer Linie und durchdachten Details." },
      { title: "Badsanierung", text: "Aus dem alten Bad wird ein neues: koordiniert, sauber und in möglichst kurzer Bauzeit – auch barrierearm." },
      { title: "Trinkwasserhygiene", text: "Leitungsführung und Betrieb so, dass Wasser nicht stagniert und Temperaturen eingehalten werden." },
      { title: "Warmwasser", text: "Effiziente Warmwasserbereitung, abgestimmt auf Heizsystem und Bedarf." },
      { title: "Sanitärinstallation", text: "Installation nach den anerkannten Regeln der Technik – für Neubau, Umbau und Sanierung." },
      { title: "Wasseraufbereitung und Leckageschutz", text: "Filter, Enthärtung und Systeme, die Wasserschäden erkennen und die Zufuhr automatisch stoppen." },
    ],
    benefits: ["Koordination der Gewerke rund ums Bad", "Saubere Baustelle und verlässliche Termine", "Markenprodukte mit langfristiger Ersatzteilversorgung"],
    audiences: {
      private: "Für das neue Familienbad, das Gäste-WC oder die altersgerechte Modernisierung.",
      business: "Für Wohnanlagen, Praxen, Büros und Gewerbe – inklusive Trinkwasserhygiene im laufenden Betrieb.",
    },
    faq: [
      { q: "Wie läuft eine Badsanierung ab?", a: "Nach einem Termin vor Ort erstellen wir Planung und Angebot. Danach koordinieren wir die Arbeiten so, dass Ihr Bad in möglichst kurzer Zeit wieder nutzbar ist." },
      { q: "Was bedeutet Trinkwasserhygiene konkret?", a: "Leitungen werden so geplant und betrieben, dass Wasser nicht stagniert und Temperaturen eingehalten werden. So bleibt die Trinkwasserqualität bis zur Zapfstelle erhalten." },
    ],
  },
  klima: {
    slug: "klima",
    title: "Klima & Kälte",
    medium: "cold",
    mediumLabel: "Kälte",
    headline: "Kühle, die man nicht hört.",
    teaser: "Split- und Multisplit-Systeme, Gewerbeklimatisierung und Kältetechnik – leise, effizient und fachgerecht.",
    intro:
      "Gutes Raumklima fällt nicht auf – es ist einfach da. Wir planen Klimaanlagen und Kältetechnik, die leise und effizient arbeiten, sich in die Architektur einfügen und im Winter auf Wunsch auch heizen.",
    hero: "fassade-himmel",
    heroAlt: "Weiße, rasterartige Gebäudefassade vor blauem Himmel",
    detail: "wohnzimmer",
    detailAlt: "Helles Wohnzimmer mit blauem Sofa, Parkett und großen Fenstern",
    seoTitle: "Klima & Kälte",
    seoDescription:
      "Split- und Multisplit-Klimaanlagen, Gewerbeklimatisierung, Kältetechnik und Wartung von NECKAIR – leise, effizient, fachgerecht.",
    drawingTitle: "Der Kältekreislauf",
    drawingText:
      "Im Verdampfer nimmt das Kältemittel Wärme aus dem Raum auf. Der Verdichter hebt es auf ein höheres Druck- und Temperaturniveau, im Verflüssiger gibt es die Wärme draußen wieder ab, und das Expansionsventil schließt den Kreis.",
    offers: [
      { title: "Split-Klimaanlagen", text: "Für einzelne Räume wie Schlafzimmer, Homeoffice oder Dachgeschoss." },
      { title: "Multisplit-Systeme", text: "Ein Außengerät, mehrere Räume – individuell regelbar und dezent in der Optik." },
      { title: "Kühlen und Heizen", text: "Moderne Klimageräte arbeiten als Wärmepumpe und heizen effizient in der Übergangszeit." },
      { title: "Gewerbeklimatisierung", text: "Klimatisierung für Büroflächen, Praxen, Ladenlokale und Besprechungsräume." },
      { title: "Kältetechnik", text: "Planung und fachgerechte Arbeiten am Kältekreis – bis hin zur Kühlung von Serverräumen." },
      { title: "Wartung und Dichtheit", text: "Inspektion, Reinigung und Dichtheitskontrollen nach den geltenden Vorgaben." },
    ],
    benefits: ["Fachgerechte Arbeiten am Kältekreis", "Leise Geräte und durchdachte Positionierung", "Saubere Leitungsführung ohne sichtbare Kompromisse"],
    audiences: {
      private: "Für erholsame Nächte im Sommer, ein konzentriertes Homeoffice und angenehme Wohnräume.",
      business: "Für Arbeitsplätze, Kundenbereiche und Technikräume mit verlässlichen Temperaturen.",
    },
    faq: [
      { q: "Wie laut ist eine Klimaanlage?", a: "Moderne Innengeräte sind im Flüstermodus kaum hörbar. Für das Außengerät wählen wir den Standort so, dass weder Sie noch Ihre Nachbarn gestört werden." },
      { q: "Kann eine Klimaanlage auch heizen?", a: "Ja. Split-Geräte arbeiten nach dem Wärmepumpenprinzip und können in der Übergangszeit sehr effizient heizen." },
      { q: "Wie oft sollte eine Klimaanlage gewartet werden?", a: "Wir empfehlen eine jährliche Wartung mit Reinigung von Filtern und Wärmetauschern. Das hält die Luft hygienisch und die Anlage effizient." },
    ],
  },
};

export const serviceList = Object.values(services);

export const MEDIUM_COLOR: Record<Medium, string> = { heat: "#f07e26", water: "#1e88e5", cold: "#8fd3e8" };
