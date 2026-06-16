import { MeiliSearch, type Index } from "meilisearch";

export const SEARCH_INDEX = "products";

export type ProductDoc = {
  id: string; // variant id
  slug: string; // variant slug
  name: string;
  sku: string;
  price: number;
  oldPrice?: number | null;
  brand?: string | null;
  categoryPath: string[];
  categorySlugs: string[];
  image?: string | null;
  availability: string;
  attributes: Record<string, string>;
};

let client: MeiliSearch | null = null;

export function searchClient(): MeiliSearch | null {
  const host = process.env.MEILISEARCH_HOST;
  if (!host) return null;
  if (!client) {
    client = new MeiliSearch({ host, apiKey: process.env.MEILISEARCH_API_KEY });
  }
  return client;
}

export function productsIndex(): Index<ProductDoc> | null {
  return searchClient()?.index<ProductDoc>(SEARCH_INDEX) ?? null;
}

// Index settings tuned for Russian + SKU lookup. Applied by reindex script.
export const indexSettings = {
  searchableAttributes: ["name", "sku", "brand", "attributes"],
  filterableAttributes: [
    "categorySlugs",
    "brand",
    "price",
    "availability",
    "attributes",
  ],
  sortableAttributes: ["price"],
  rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
  },
  stopWords: ["и", "в", "на", "для", "с", "по"],
  // Domain synonyms — extend from search QA fixture.
  synonyms: {
    смеситель: ["кран"],
    кран: ["смеситель"],
    унитаз: ["туалет"],
    бойлер: ["водонагреватель"],
    водонагреватель: ["бойлер"],
  },
};
