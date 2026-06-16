import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient, type Availability } from "@prisma/client";

const prisma = new PrismaClient();

type Catalog = typeof import("../scraper/data/normalized/catalog.json");

async function main() {
  const file = path.resolve("scraper/data/normalized/catalog.json");
  const catalog = JSON.parse(await readFile(file, "utf8")) as Catalog;

  console.log("→ seeding", catalog.families.length, "families…");

  // Brands
  for (const b of catalog.brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      create: b,
      update: { name: b.name },
    });
  }

  // Categories — insert shallow→deep so parents exist first.
  const cats = [...catalog.categories].sort((a, b) => a.depth - b.depth);
  const catIdBySlug = new Map<string, string>();
  for (const c of cats) {
    const parentId = c.parentSlug ? catIdBySlug.get(c.parentSlug) ?? null : null;
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        name: c.name,
        depth: c.depth,
        sortOrder: c.sortOrder,
        parentId,
      },
      update: { name: c.name, depth: c.depth, parentId },
    });
    catIdBySlug.set(c.slug, row.id);
  }

  // Attributes registry (code → id), built lazily from variant attributes.
  const attrIdByCode = new Map<string, string>();
  async function attrId(code: string, name: string): Promise<string> {
    if (attrIdByCode.has(code)) return attrIdByCode.get(code)!;
    const row = await prisma.attribute.upsert({
      where: { code },
      create: { code, name },
      update: {},
    });
    attrIdByCode.set(code, row.id);
    return row.id;
  }

  const brandIdBySlug = new Map(
    (await prisma.brand.findMany()).map((b) => [b.slug, b.id]),
  );

  // Families + variants + images
  for (const f of catalog.families) {
    const categoryId = catIdBySlug.get(f.categorySlug);
    if (!categoryId) continue;

    const family = await prisma.productFamily.upsert({
      where: { slug: f.slug },
      create: {
        slug: f.slug,
        name: f.name,
        categoryId,
        brandId: f.brandSlug ? brandIdBySlug.get(f.brandSlug) ?? null : null,
        descriptionHtml: f.descriptionHtml,
        mainImageUrl: f.mainImageUrl,
        variantAxes: f.variantAxes,
      },
      update: {
        name: f.name,
        categoryId,
        mainImageUrl: f.mainImageUrl,
        variantAxes: f.variantAxes,
      },
    });

    // Family-level attributes (from the first variant's spec table).
    const familyAttrs = f.variants[0]?.attributes ?? [];
    for (const a of familyAttrs) {
      const id = await attrId(a.code, a.name);
      await prisma.productAttributeValue.upsert({
        where: { familyId_attributeId: { familyId: family.id, attributeId: id } },
        create: { familyId: family.id, attributeId: id, value: a.value },
        update: { value: a.value },
      });
    }

    let defaultVariantId: string | null = null;
    for (const v of f.variants) {
      const variant = await prisma.variant.upsert({
        where: { sku: v.sku },
        create: {
          sku: v.sku,
          slug: v.slug,
          familyId: family.id,
          price: v.price,
          oldPrice: v.oldPrice,
          availability: v.availability as Availability,
          axisValues: v.axisValues,
        },
        update: {
          price: v.price,
          oldPrice: v.oldPrice,
          availability: v.availability as Availability,
          axisValues: v.axisValues,
        },
      });
      if (!defaultVariantId) defaultVariantId = variant.id;
    }

    if (defaultVariantId) {
      await prisma.productFamily.update({
        where: { id: family.id },
        data: { defaultVariantId },
      });
    }
  }

  console.log("✓ seed complete:", catalog.report);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
