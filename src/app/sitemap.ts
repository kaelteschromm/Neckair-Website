import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { references } from "@/content/references";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const pages = ["", "heizung", "sanitaer", "klima", "lueftung", "referenzen", "unternehmen", "kontakt", "impressum", "datenschutz", "agb", "nutzungsbedingungen"];
  // Demo-Projekte (example: true) sind bewusst nicht in der Sitemap
  const refs = references.filter((r) => !r.example).map((r) => `referenzen/${r.slug}`);
  return [...pages, ...refs].map((p) => ({
    url: `${base}/${p ? p + "/" : ""}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : ["impressum", "datenschutz", "agb", "nutzungsbedingungen"].includes(p) ? 0.2 : 0.8,
  }));
}
