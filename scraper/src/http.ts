import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import got from "got";

const CACHE_DIR = path.resolve("scraper/data/raw");

const client = got.extend({
  timeout: { request: 30000 },
  retry: { limit: 3, methods: ["GET"] },
  // Do not throw on 4xx/5xx — stale sitemap entries (404) are expected and
  // handled as "no product" rather than crawl failures.
  throwHttpErrors: false,
  headers: {
    "user-agent":
      "SantehgrypMigrationBot/1.0 (+catalog migration; contact info@santehgryp.ru)",
  },
});

async function getOk(url: string): Promise<string> {
  const res = await client.get(url);
  if (res.statusCode >= 400) return ""; // treated as soft-404 downstream
  return res.body;
}

function cachePath(url: string): string {
  const hash = createHash("sha1").update(url).digest("hex");
  return path.join(CACHE_DIR, `${hash}.html`);
}

/** Fetches a URL as text, caching raw HTML so re-parsing never re-hits the network. */
export async function fetchCached(url: string, useCache = true): Promise<string> {
  const file = cachePath(url);
  if (useCache && existsSync(file)) {
    return readFile(file, "utf8");
  }
  const body = await getOk(url);
  // Only persist raw HTML when caching is enabled (a full 18k crawl with
  // --no-cache streams without filling the disk with ~6GB of pages).
  if (body && useCache) {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(file, body, "utf8");
  }
  return body;
}

export async function fetchText(url: string): Promise<string> {
  return client.get(url).text();
}
