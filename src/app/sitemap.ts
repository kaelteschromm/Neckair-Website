import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const pages = ["", "heizung", "sanitaer", "klima", "lueftung", "referenzen", "unternehmen", "kontakt", "impressum", "datenschutz"];
  return pages.map((p) => ({
    url: `${base}/${p ? p + "/" : ""}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : ["impressum", "datenschutz"].includes(p) ? 0.2 : 0.8,
  }));
}
