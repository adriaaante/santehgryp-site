import { PrismaClient } from "@prisma/client";
import { MeiliSearch } from "meilisearch";
import { SEARCH_INDEX, indexSettings, type ProductDoc } from "../src/lib/search.js";

const prisma = new PrismaClient();

// Builds Meilisearch documents from the DB (one per variant) and applies the
// Russian-tuned index settings. Run after each catalog import / price refresh.
async function main() {
  const host = process.env.MEILISEARCH_HOST;
  if (!host) throw new Error("MEILISEARCH_HOST is not set");
  const client = new MeiliSearch({ host, apiKey: process.env.MEILISEARCH_API_KEY });

  // Load the full category tree once so we can resolve ancestry at any depth.
  const allCats = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, parentId: true },
  });
  const catById = new Map(allCats.map((c) => [c.id, c]));

  const variants = await prisma.variant.findMany({
    include: {
      family: {
        include: {
          brand: true,
          category: true,
          attributes: { include: { attribute: true } },
        },
      },
    },
  });

  const docs: ProductDoc[] = variants.map((v) => {
    const f = v.family;
    const path: string[] = [];
    const slugs: string[] = [];
    let cat = catById.get(f.categoryId);
    while (cat) {
      path.unshift(cat.name);
      slugs.unshift(cat.slug);
      cat = cat.parentId ? catById.get(cat.parentId) : undefined;
    }
    const attributes: Record<string, string> = {};
    for (const a of f.attributes) attributes[a.attribute.code] = a.value;

    return {
      id: v.id,
      slug: v.slug,
      name: f.name,
      sku: v.sku,
      price: Number(v.price),
      oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
      brand: f.brand?.name ?? null,
      categoryPath: path,
      categorySlugs: slugs,
      image: f.mainImageUrl,
      availability: v.availability,
      attributes,
    };
  });

  const index = client.index<ProductDoc>(SEARCH_INDEX);
  await index.updateSettings(indexSettings);
  const task = await index.addDocuments(docs, { primaryKey: "id" });
  console.log(`→ queued ${docs.length} documents (task ${task.taskUid})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
