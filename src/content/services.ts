import type { ImageName } from "@/lib/images.generated";

export type ServiceSlug = "heizung" | "sanitaer" | "klima" | "lueftung";

export interface Service {
  slug: ServiceSlug;
  index: string;
  title: string;
  /** Tonwert aus dem Logo: Wärme = Orange, Luft/Wasser = Blau */
  tone: "warm" | "cool";
  kicker: string;
  headline: [string, string]; // zweiter Teil wird kursiv gesetzt
  teaser: string;
  intro: string;
  hero: ImageName;
  detail: ImageName;
  detailAlt: string;
  heroAlt: string;
  seoTitle: string;
  seoDescription: string;
  offers: { title: string; text: string }[];
  benefits: string[];
  audiences: { private: string; business: string };
  faq: { q: string; a: string }[];
}

export const services: Record<ServiceSlug, Service> = {
  heizung: {
    slug: "heizung",
    index: "01",
    title: "Heizung",
    tone: "warm",
    kicker: "Wärme",
    headline: ["Wärme, die", "mitdenkt."],
    teaser: "Wärmepumpen, Flächenheizung und Modernisierung – effizient geplant für Bestand und Neubau.",
    intro:
      "Ein Heizsystem ist nur so gut wie seine Planung. Wir betrachten Gebäude, Wärmebedarf und Nutzung als Ganzes und entwickeln daraus eine Lösung, die leise arbeitet, Energie spart und über Jahre zuverlässig bleibt.",
    hero: "haus-am-wald",
    heroAlt: "Modernes Einfamilienhaus mit Wärmepumpe und Photovoltaik am Waldrand",
    detail: "fussbodenheizung",
    detailAlt: "Verlegte Rohre einer Fußbodenheizung vor dem Estrich",
    seoTitle: "Heizung & Wärmepumpen",
    seoDescription:
      "Wärmepumpen, Fußbodenheizung, Heizungsmodernisierung und hydraulischer Abgleich von Neckair – geplant für Bestand und Neubau.",
    offers: [
      { title: "Wärmepumpen", text: "Luft-Wasser- und Sole-Wasser-Wärmepumpen, dimensioniert nach Heizlastberechnung statt nach Faustformel." },
      { title: "Flächenheizung", text: "Fußboden- und Wandheizung für gleichmäßige Wärme bei niedrigen Vorlauftemperaturen." },
      { title: "Modernisierung", text: "Austausch alter Kessel, Hybridlösungen und schrittweise Umstellung auf erneuerbare Wärme." },
      { title: "Hydraulischer Abgleich", text: "Jeder Raum bekommt genau die Wärme, die er braucht – messbar effizienter und leiser." },
      { title: "Regelung & Smart Home", text: "Moderne Regelungstechnik, die sich Ihrem Alltag anpasst und per App bedienbar ist." },
      { title: "Wartung", text: "Regelmäßige Inspektion für sichere, effiziente Anlagen und lange Lebensdauer." },
    ],
    benefits: ["Heizlast- und Bedarfsanalyse vor Ort", "Unterstützung bei technischen Nachweisen für Förderprogramme", "Ein Ansprechpartner von der Planung bis zur Wartung"],
    audiences: {
      private: "Für Einfamilienhäuser, Doppelhäuser und Wohnungen – ob Neubau oder Sanierung im Bestand.",
      business: "Für Mehrfamilienhäuser, Büros und Gewerbeobjekte mit höherem Wärmebedarf und mehreren Heizkreisen.",
    },
    faq: [
      { q: "Funktioniert eine Wärmepumpe auch im Altbau?", a: "In vielen Fällen ja. Entscheidend sind Wärmebedarf, Heizflächen und Vorlauftemperatur. Wir prüfen das vor Ort und sagen Ihnen ehrlich, ob und unter welchen Voraussetzungen es sinnvoll ist." },
      { q: "Wie lange dauert ein Heizungstausch?", a: "Der Austausch selbst dauert meist wenige Tage. Den genauen Ablauf stimmen wir vorab mit Ihnen ab, damit Sie möglichst kurz ohne Wärme sind." },
      { q: "Helfen Sie bei der Förderung?", a: "Wir liefern die technischen Angaben und Nachweise, die für Förderanträge benötigt werden, und beraten Sie zu den Anforderungen an die Anlage." },
    ],
  },
  sanitaer: {
    slug: "sanitaer",
    index: "02",
    title: "Sanitär",
    tone: "cool",
    kicker: "Wasser",
    headline: ["Bäder mit", "Haltung."],
    teaser: "Badgestaltung, Trinkwasserhygiene und Warmwasser – langlebig, normgerecht und schön.",
    intro:
      "Wasser ist das sensibelste Medium im Haus. Wir planen Bäder und Trinkwasserinstallationen mit Sorgfalt im Detail: hygienisch einwandfrei, durchdacht in der Nutzung und mit Materialien, die auch nach Jahren noch überzeugen.",
    hero: "armatur-wasser",
    heroAlt: "Moderne Edelstahl-Armatur, aus der Wasser in ein weißes Becken fließt",
    detail: "waschtisch-weiss",
    detailAlt: "Weißer Aufsatzwaschtisch auf einer hellen Holzplatte",
    seoTitle: "Sanitär & Badgestaltung",
    seoDescription:
      "Badplanung, barrierearme Bäder, Trinkwasserinstallation und Warmwasserbereitung von Neckair – hygienisch, langlebig und hochwertig.",
    offers: [
      { title: "Badplanung", text: "Vom ersten Grundriss bis zur fertigen Armatur – mit klarer Linie und durchdachten Details." },
      { title: "Barrierearme Bäder", text: "Bodengleiche Duschen und komfortable Lösungen, die mit Ihren Bedürfnissen mitwachsen." },
      { title: "Trinkwasserinstallation", text: "Hygienische Leitungsführung nach den anerkannten Regeln der Technik – für Neubau und Sanierung." },
      { title: "Warmwasser", text: "Effiziente Warmwasserbereitung, abgestimmt auf Heizsystem und Bedarf." },
      { title: "Wasseraufbereitung", text: "Filter und Enthärtung zum Schutz von Leitungen, Armaturen und Geräten." },
      { title: "Leckageschutz", text: "Systeme, die Wasserschäden erkennen und die Zufuhr automatisch stoppen." },
    ],
    benefits: ["Koordination der Gewerke rund ums Bad", "Saubere Baustelle und verlässliche Termine", "Hochwertige Markenprodukte mit Ersatzteilversorgung"],
    audiences: {
      private: "Für das neue Familienbad, das Gäste-WC oder die altersgerechte Modernisierung.",
      business: "Für Wohnanlagen, Praxen, Büros und Gewerbe – inklusive Trinkwasserhygiene im Betrieb.",
    },
    faq: [
      { q: "Wie läuft eine Badsanierung ab?", a: "Nach einem Termin vor Ort erstellen wir Planung und Angebot. Danach koordinieren wir die Arbeiten so, dass Ihr Bad in möglichst kurzer Zeit wieder nutzbar ist." },
      { q: "Was bedeutet Trinkwasserhygiene konkret?", a: "Leitungen werden so geplant und betrieben, dass Wasser nicht stagniert und Temperaturen eingehalten werden. So bleibt die Trinkwasserqualität bis zur Zapfstelle erhalten." },
    ],
  },
  klima: {
    slug: "klima",
    index: "03",
    title: "Klima",
    tone: "cool",
    kicker: "Kühle",
    headline: ["Kühle, die", "man nicht hört."],
    teaser: "Split- und Multisplit-Systeme, Gewerbeklimatisierung und Kältetechnik mit Fachkompetenz.",
    intro:
      "Gutes Raumklima fällt nicht auf – es ist einfach da. Wir planen Klimaanlagen, die leise und effizient arbeiten, sich harmonisch in die Architektur einfügen und im Winter auf Wunsch auch heizen.",
    hero: "fassade-himmel",
    heroAlt: "Weiße, rasterartige Gebäudefassade vor blauem Himmel",
    detail: "wohnzimmer",
    detailAlt: "Helles Wohnzimmer mit blauem Sofa, Parkett und großen Fenstern",
    seoTitle: "Klimaanlagen & Kältetechnik",
    seoDescription:
      "Split- und Multisplit-Klimaanlagen, Gewerbeklimatisierung, Serverraumkühlung und Wartung von Neckair – leise, effizient, fachgerecht.",
    offers: [
      { title: "Split-Klimaanlagen", text: "Für einzelne Räume wie Schlafzimmer, Homeoffice oder Dachgeschoss." },
      { title: "Multisplit-Systeme", text: "Ein Außengerät, mehrere Räume – individuell regelbar und dezent in der Optik." },
      { title: "Kühlen & Heizen", text: "Moderne Klimageräte arbeiten als Wärmepumpe und heizen effizient in der Übergangszeit." },
      { title: "Gewerbe & Büro", text: "Klimatisierung für Büroflächen, Praxen, Ladenlokale und Besprechungsräume." },
      { title: "Serverräume", text: "Zuverlässige Kühlung für IT-Technik, auf Wunsch redundant ausgelegt." },
      { title: "Wartung & Dichtheit", text: "Inspektion, Reinigung und Dichtheitskontrollen durch zertifiziertes Kältefachpersonal." },
    ],
    benefits: ["Arbeiten am Kältekreis durch zertifiziertes Fachpersonal", "Leise Geräte und durchdachte Positionierung", "Saubere Leitungsführung ohne sichtbare Kompromisse"],
    audiences: {
      private: "Für erholsame Nächte im Sommer, ein produktives Homeoffice und angenehme Wohnräume.",
      business: "Für Arbeitsplätze, Kundenbereiche und Technikräume mit verlässlichen Temperaturen.",
    },
    faq: [
      { q: "Wie laut ist eine Klimaanlage?", a: "Moderne Innengeräte sind im Flüstermodus kaum hörbar. Für das Außengerät wählen wir den Standort so, dass weder Sie noch Ihre Nachbarn gestört werden." },
      { q: "Kann eine Klimaanlage auch heizen?", a: "Ja. Split-Geräte arbeiten nach dem Wärmepumpenprinzip und können in der Übergangszeit sehr effizient heizen." },
      { q: "Wie oft sollte eine Klimaanlage gewartet werden?", a: "Wir empfehlen eine jährliche Wartung mit Reinigung der Filter und Wärmetauscher. Das hält die Luft hygienisch und die Anlage effizient." },
    ],
  },
  lueftung: {
    slug: "lueftung",
    index: "04",
    title: "Lüftung",
    tone: "cool",
    kicker: "Luft",
    headline: ["Frische Luft,", "ganz ohne Fenster."],
    teaser: "Kontrollierte Wohnraumlüftung mit Wärmerückgewinnung und Lüftungskonzepte für Gewerbe.",
    intro:
      "Dichte, energieeffiziente Gebäude brauchen einen planbaren Luftaustausch. Unsere Lüftungslösungen sorgen für frische, gefilterte Luft, schützen die Bausubstanz vor Feuchtigkeit und halten die Wärme im Haus.",
    hero: "wald",
    heroAlt: "Weiter Blick über bewaldete Hügel unter einem hellen Himmel",
    detail: "decke-weiss",
    detailAlt: "Lichtdurchflutete, weiße Dachkonstruktion mit Lamellen",
    seoTitle: "Lüftung & Wohnraumlüftung",
    seoDescription:
      "Kontrollierte Wohnraumlüftung mit Wärmerückgewinnung, dezentrale Lüftung, Lüftungskonzepte nach DIN 1946-6 und Gewerbelüftung von Neckair.",
    offers: [
      { title: "Zentrale Wohnraumlüftung", text: "Kontrollierte Be- und Entlüftung mit Wärmerückgewinnung für das ganze Haus." },
      { title: "Dezentrale Lüftung", text: "Einzelraumlösungen, ideal für die Sanierung ohne aufwendige Kanalführung." },
      { title: "Lüftungskonzept", text: "Bewertung des Lüftungsbedarfs nach DIN 1946-6 für Neubau und Modernisierung." },
      { title: "Gewerbelüftung", text: "Lüftungsanlagen für Büros, Praxen und Gewerbeflächen mit hoher Belegung." },
      { title: "Filter & Hygiene", text: "Filterwechsel, Reinigung und Inspektion für dauerhaft saubere Luft." },
    ],
    benefits: ["Weniger Pollen und Feinstaub dank Filterung", "Schutz vor Feuchtigkeit und Schimmel", "Wärmerückgewinnung senkt den Heizbedarf"],
    audiences: {
      private: "Für Neubauten, sanierte Altbauten und alle, die Wert auf gesunde Raumluft legen.",
      business: "Für Arbeitsräume, in denen konzentriert gearbeitet wird und viele Menschen zusammenkommen.",
    },
    faq: [
      { q: "Brauche ich in meinem Haus eine Lüftungsanlage?", a: "Nach einer energetischen Sanierung oder im Neubau ist ein Lüftungskonzept oft erforderlich. Wir prüfen, ob Lüftung durch Fenster genügt oder eine Anlage sinnvoll ist." },
      { q: "Darf ich die Fenster trotzdem öffnen?", a: "Natürlich. Die Anlage sorgt für den Grundluftwechsel – Fenster öffnen bleibt jederzeit möglich, ist aber nicht mehr nötig." },
    ],
  },
};

export const serviceList = Object.values(services);
