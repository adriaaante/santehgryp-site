import { prisma } from "./db";
import { absoluteUrl, site } from "./site";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Builds a Yandex Market Language (YML) feed for Yandex.Market / Direct
// dynamic ads. Spec: https://yandex.ru/support/marketplace/
export async function buildYmlFeed(): Promise<string> {
  const date = new Date().toISOString().slice(0, 19);

  let categories: { id: string; name: string; parentId: string | null }[] = [];
  let offers: string[] = [];

  try {
    const cats = await prisma.category.findMany({
      select: { id: true, name: true, parentId: true },
    });
    categories = cats;

    const variants = await prisma.variant.findMany({
      include: { family: { include: { category: true, brand: true } } },
    });

    offers = variants.map((v) => {
      const f = v.family;
      const parts = [
        `<offer id="${esc(v.sku)}" available="${v.availability === "IN_STOCK" ? "true" : "false"}">`,
        `<url>${esc(absoluteUrl(`/product/${v.slug}`))}</url>`,
        `<price>${Number(v.price)}</price>`,
        v.oldPrice ? `<oldprice>${Number(v.oldPrice)}</oldprice>` : "",
        `<currencyId>RUB</currencyId>`,
        `<categoryId>${esc(f.categoryId)}</categoryId>`,
        f.mainImageUrl ? `<picture>${esc(f.mainImageUrl)}</picture>` : "",
        f.brand ? `<vendor>${esc(f.brand.name)}</vendor>` : "",
        `<name>${esc(f.name)}</name>`,
        `<vendorCode>${esc(v.sku)}</vendorCode>`,
        `</offer>`,
      ];
      return parts.filter(Boolean).join("");
    });
  } catch {
    /* DB not ready — emit empty but valid feed */
  }

  const categoriesXml = categories
    .map(
      (c) =>
        `<category id="${esc(c.id)}"${c.parentId ? ` parentId="${esc(c.parentId)}"` : ""}>${esc(c.name)}</category>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${date}">
<shop>
<name>${esc(site.name)}</name>
<company>${esc(site.name)}</company>
<url>${esc(site.url)}</url>
<currencies><currency id="RUB" rate="1"/></currencies>
<categories>${categoriesXml}</categories>
<offers>${offers.join("")}</offers>
</shop>
</yml_catalog>`;
}
