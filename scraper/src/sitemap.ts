import { fetchText } from "./http.js";

const BASE = process.env.SCRAPE_SOURCE_BASE_URL ?? "https://santehgryp.ru";

function extractLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/** Collects all product URLs (under /catalog/) from the sitemap index. */
export async function collectProductUrls(): Promise<string[]> {
  const index = await fetchText(`${BASE}/sitemap.xml`);
  const childMaps = extractLocs(index);

  const urls = new Set<string>();
  for (const map of childMaps) {
    try {
      const xml = await fetchText(map);
      for (const loc of extractLocs(xml)) {
        // Product pages live under /catalog/ ; skip /info, /brands, sections.
        if (/\/catalog\//.test(loc) && !/\/catalog\/?$/.test(loc)) {
          urls.add(loc);
        }
      }
    } catch (e) {
      console.warn(`sitemap fetch failed: ${map}`, (e as Error).message);
    }
  }
  return [...urls];
}
