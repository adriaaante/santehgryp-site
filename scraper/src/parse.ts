import * as cheerio from "cheerio";
import { slugify } from "./slug.js";
import type { RawProduct } from "./types.js";

function num(s: string | undefined | null): number | null {
  if (!s) return null;
  const n = Number(String(s).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function mapAvailability(href: string | undefined): RawProduct["availability"] {
  const v = (href ?? "").toLowerCase();
  if (v.includes("instock")) return "IN_STOCK";
  if (v.includes("preorder") || v.includes("backorder")) return "ON_ORDER";
  if (v.includes("outofstock") || v.includes("soldout")) return "OUT_OF_STOCK";
  return "IN_STOCK";
}

/**
 * Parses an Aspro/Bitrix product page into a RawProduct.
 * Returns null for soft-404 ("Страница не найдена") or pages without a price.
 */
export function parseProduct(html: string, url: string): RawProduct | null {
  const $ = cheerio.load(html);

  const h1 = $("h1").first().text().trim();
  if (!h1 || /страница не найдена/i.test(h1)) return null;

  // Breadcrumbs via schema.org itemListElement.
  const crumbs: { name: string; slug: string }[] = [];
  $('[itemprop="itemListElement"]').each((_, el) => {
    const name = $(el).find('[itemprop="name"]').first().text().trim();
    const href = $(el).find('[itemprop="item"]').attr("href") ?? "";
    if (name) {
      const slugFromUrl = href.replace(/\/$/, "").split("/").pop() ?? "";
      crumbs.push({ name, slug: slugFromUrl || slugify(name) });
    }
  });

  // Drop "Главная", "Каталог" and the last crumb (the product itself).
  const categoryPath = crumbs
    .filter((c) => !/^(главная|каталог)$/i.test(c.name))
    .slice(0, -1)
    .map((c) => ({ name: c.name, slug: c.slug || slugify(c.name) }));

  const sku =
    $('[itemprop="sku"]').attr("content") ??
    $('[itemprop="sku"]').first().text().trim() ??
    "";

  const price =
    num($('[itemprop="price"]').attr("content")) ??
    num($("[data-price]").first().attr("data-price")) ??
    num($(".price_value").first().text());
  if (!price) return null;

  const oldPrice =
    num($(".price_old_value, .old_price .price_value").first().text()) ?? null;

  const availability = mapAvailability(
    $('[itemprop="availability"]').attr("href") ??
      $('[itemprop="availability"]').attr("content"),
  );

  const image =
    $('meta[property="og:image"]').attr("content") ??
    $('[itemprop="image"]').attr("content") ??
    $('[itemprop="image"]').attr("src") ??
    null;

  // Gallery images (Aspro slider) — collect unique upload paths.
  const images = new Set<string>();
  if (image) images.add(image);
  $(".slider_container img, .product-detail-gallery img, [itemprop='image']").each((_, el) => {
    const src = $(el).attr("data-src") ?? $(el).attr("src");
    if (src && /\/upload\//.test(src)) images.add(src);
  });

  const descriptionHtml =
    $('[itemprop="description"]').html()?.trim() ??
    $(".detail_text, .product-detail-description").first().html()?.trim() ??
    null;

  // Characteristics: Aspro renders schema.org PropertyValue blocks plus
  // ".properties__item" rows. Collect unique name/value pairs.
  const attributes: { name: string; value: string }[] = [];
  const seenAttr = new Set<string>();
  const addAttr = (rawName: string, rawValue: string) => {
    const name = rawName.replace(/\s+/g, " ").replace(/:$/, "").trim();
    const value = rawValue.replace(/\s+/g, " ").trim();
    if (!name || !value || name === value || /^артикул$/i.test(name)) return;
    if (seenAttr.has(name)) return;
    seenAttr.add(name);
    attributes.push({ name, value });
  };
  $('[itemprop="additionalProperty"]').each((_, el) => {
    addAttr(
      $(el).find('[itemprop="name"]').first().text(),
      $(el).find('[itemprop="value"]').first().text(),
    );
  });
  $(".properties__item, .props_item, .char_item").each((_, el) => {
    addAttr(
      $(el).find(".properties__title, .char_name, .js-prop-title").first().text(),
      $(el).find(".properties__value, .char_value, .js-prop-value").first().text(),
    );
  });

  const brand =
    attributes.find((a) => /бренд|производитель|марка/i.test(a.name))?.value ?? null;

  return {
    url,
    name: h1,
    sku: sku || slugify(h1),
    price,
    oldPrice,
    currency: "RUB",
    availability,
    image,
    images: [...images],
    descriptionHtml,
    brand,
    categoryPath,
    attributes,
  };
}
