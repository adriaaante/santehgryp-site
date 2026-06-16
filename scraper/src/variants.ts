import { slugify, uniqueSlug } from "./slug.js";
import type { Family, RawProduct, Variant } from "./types.js";

// Known color tokens (Russian) used to split colour variants.
const COLORS = [
  "белый", "черный", "чёрный", "хром", "золото", "золотой", "бронза", "никель",
  "графит", "матовый", "глянцевый", "серый", "красный", "синий", "зеленый",
  "зелёный", "бежевый", "коричневый", "медь", "латунь", "сатин",
];

const COLOR_RE = new RegExp(`\\b(${COLORS.join("|")}[а-я]*)\\b`, "gi");

// Trailing model/dimension token, e.g. "ITTZ.090.200.700", "200 мм", "DN25".
const MODEL_RE = /\s+([A-ZА-Я0-9]+(?:[.\-х/][A-ZА-Я0-9]+)+|\d+\s?(?:мм|см|dn\d+))\s*$/i;

type Extracted = {
  baseName: string;
  color: string | null;
  model: string | null;
};

function extract(name: string): Extracted {
  let base = name.trim();
  let color: string | null = null;
  let model: string | null = null;

  const colorMatch = base.match(COLOR_RE);
  if (colorMatch) {
    color = colorMatch[colorMatch.length - 1];
    base = base.replace(COLOR_RE, "").replace(/\s{2,}/g, " ").trim();
  }

  const modelMatch = base.match(MODEL_RE);
  if (modelMatch) {
    model = modelMatch[1].trim();
    base = base.replace(MODEL_RE, "").trim();
  }

  return { baseName: base.replace(/[\s,;–-]+$/, "").trim() || name, color, model };
}

function toVariant(p: RawProduct, axisValues: Record<string, string>, slugTaken: Set<string>): Variant {
  return {
    sku: p.sku,
    slug: uniqueSlug(p.name, slugTaken),
    price: p.price,
    oldPrice: p.oldPrice,
    availability: p.availability,
    image: p.image,
    axisValues,
    attributes: p.attributes.map((a) => ({ code: slugify(a.name), name: a.name, value: a.value })),
  };
}

/**
 * Groups raw products into product families with variant axes.
 * Grouping key = leaf category slug + extracted base name + brand.
 */
export function buildFamilies(products: RawProduct[]): Family[] {
  const familySlugs = new Set<string>();
  const variantSlugs = new Set<string>();
  const groups = new Map<string, { base: string; items: { p: RawProduct; ex: Extracted }[] }>();

  for (const p of products) {
    const ex = extract(p.name);
    const leafCat = p.categoryPath[p.categoryPath.length - 1]?.slug ?? "catalog";
    const key = `${leafCat}::${slugify(ex.baseName)}::${p.brand ?? ""}`;
    if (!groups.has(key)) groups.set(key, { base: ex.baseName, items: [] });
    groups.get(key)!.items.push({ p, ex });
  }

  const families: Family[] = [];

  for (const { base, items } of groups.values()) {
    const first = items[0].p;
    const leafCat = first.categoryPath[first.categoryPath.length - 1]?.slug ?? "catalog";

    const hasColor = items.some((i) => i.ex.color) && new Set(items.map((i) => i.ex.color)).size > 1;
    const hasModel = items.some((i) => i.ex.model) && new Set(items.map((i) => i.ex.model)).size > 1;

    const axes: Family["variantAxes"] = [];
    if (hasModel) axes.push({ key: "model", label: "Модель / размер" });
    if (hasColor) axes.push({ key: "color", label: "Цвет" });

    const grouped = items.length > 1 && axes.length > 0;

    const variants: Variant[] = items.map(({ p, ex }) => {
      const axisValues: Record<string, string> = {};
      if (hasModel && ex.model) axisValues.model = ex.model;
      if (hasColor && ex.color) axisValues.color = ex.color;
      // Fallback so single-axis groups always have a selectable value.
      if (grouped && Object.keys(axisValues).length === 0) axisValues.model = p.name;
      return toVariant(p, axisValues, variantSlugs);
    });

    families.push({
      slug: uniqueSlug(grouped ? base : first.name, familySlugs),
      name: grouped ? base : first.name,
      categorySlug: leafCat,
      brandSlug: first.brand ? slugify(first.brand) : null,
      descriptionHtml: first.descriptionHtml,
      mainImageUrl: first.image,
      variantAxes: grouped ? axes : [],
      variants,
      confidence: grouped ? "grouped" : "single",
    });
  }

  return families;
}
