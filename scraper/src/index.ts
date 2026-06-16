import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import PQueue from "p-queue";
import { collectProductUrls } from "./sitemap.js";
import { fetchCached } from "./http.js";
import { parseProduct } from "./parse.js";
import { buildFamilies } from "./variants.js";
import { slugify } from "./slug.js";
import type { Catalog, CategoryNode, RawProduct } from "./types.js";

const OUT_DIR = path.resolve("scraper/data/normalized");
const CONCURRENCY = Number(process.env.SCRAPE_CONCURRENCY ?? 3);

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

// Build a category tree from the breadcrumb chains of all products.
function buildCategories(products: RawProduct[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  for (const p of products) {
    let parentSlug: string | null = null;
    p.categoryPath.forEach((c, depth) => {
      const slug = c.slug || slugify(c.name);
      if (!map.has(slug)) {
        map.set(slug, { slug, name: c.name, parentSlug, depth, sortOrder: map.size });
      }
      parentSlug = slug;
    });
  }
  return [...map.values()];
}

async function writeCatalog(products: RawProduct[], partial: boolean) {
  const categories = buildCategories(products);
  const families = buildFamilies(products);
  const brands = [
    ...new Map(
      products
        .filter((p) => p.brand)
        .map((p) => [slugify(p.brand!), { slug: slugify(p.brand!), name: p.brand! }]),
    ).values(),
  ];
  const catalog: Catalog = {
    generatedAt: new Date().toISOString(),
    categories,
    brands,
    families,
    report: {
      productsParsed: products.length,
      categories: categories.length,
      brands: brands.length,
      families: families.length,
      groupedFamilies: families.filter((f) => f.confidence === "grouped").length,
      variants: families.reduce((n, f) => n + f.variants.length, 0),
      partial: partial ? 1 : 0,
    },
  };
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "catalog.json"), JSON.stringify(catalog, null, 2), "utf8");
  return catalog.report;
}

async function main() {
  const limit = arg("--limit") ? Number(arg("--limit")) : Infinity;
  const useCache = !process.argv.includes("--no-cache");

  console.log("→ collecting product URLs from sitemap…");
  let urls = await collectProductUrls();
  console.log(`  found ${urls.length} product URLs`);
  const offset = arg("--offset") ? Number(arg("--offset")) : 0;
  if (offset || Number.isFinite(limit)) {
    urls = urls.slice(offset, Number.isFinite(limit) ? offset + limit : undefined);
  }

  const queue = new PQueue({ concurrency: CONCURRENCY, interval: 1000, intervalCap: CONCURRENCY * 2 });
  const products: RawProduct[] = [];
  let done = 0;
  let dead = 0;
  let failed = 0;

  await Promise.all(
    urls.map((url) =>
      queue.add(async () => {
        try {
          const html = await fetchCached(url, useCache);
          const product = parseProduct(html, url);
          if (product) products.push(product);
          else dead++;
        } catch (e) {
          failed++;
          if (failed <= 10) console.warn(`  fail ${url}: ${(e as Error).message}`);
        } finally {
          if (++done % 200 === 0) console.log(`  processed ${done}/${urls.length}`);
          // Periodic checkpoint so a long crawl survives interruption.
          if (done % 1000 === 0) {
            await writeCatalog(products, true).catch(() => {});
            console.log(`  ↳ checkpoint written (${products.length} products so far)`);
          }
        }
      }),
    ),
  );

  console.log(`→ parsed ${products.length} products (${dead} dead, ${failed} failed)`);

  const report = await writeCatalog(products, false);
  console.log("→ wrote scraper/data/normalized/catalog.json");
  console.table({ ...report, dead, failed });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
