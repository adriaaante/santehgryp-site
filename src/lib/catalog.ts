import { prisma } from "./db";
import { catalogNav } from "./nav";
import type { ProductCardData } from "@/components/catalog/ProductCard";

export type NavCat = { name: string; slug: string; children: { name: string; slug: string }[] };

// Top-level categories with their children, sourced from the DB; falls back to
// the static nav before the catalog is imported. Drives the header mega-menu,
// homepage grid, catalog landing and footer.
export async function getNavCategories(): Promise<NavCat[]> {
  try {
    const cats = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
    if (cats.length) {
      const childrenOf = new Map<string, typeof cats>();
      for (const c of cats) {
        if (!c.parentId) continue;
        const arr = childrenOf.get(c.parentId) ?? [];
        arr.push(c);
        childrenOf.set(c.parentId, arr);
      }
      const roots = cats.filter((c) => !c.parentId);
      return roots.map((r) => ({
        name: r.name,
        slug: r.slug,
        children: (childrenOf.get(r.id) ?? []).slice(0, 8).map((c) => ({ name: c.name, slug: c.slug })),
      }));
    }
  } catch {
    /* fall through to static nav */
  }
  return catalogNav.map((c) => ({ name: c.name, slug: c.slug, children: c.children ?? [] }));
}

// Collects a category id plus all of its descendant ids so a non-leaf
// category page shows products from its subcategories too.
async function descendantCategoryIds(categoryId: string): Promise<string[]> {
  const cats = await prisma.category.findMany({ select: { id: true, parentId: true } });
  const childrenOf = new Map<string, string[]>();
  for (const c of cats) {
    if (!c.parentId) continue;
    const arr = childrenOf.get(c.parentId) ?? [];
    arr.push(c.id);
    childrenOf.set(c.parentId, arr);
  }
  const ids = [categoryId];
  const stack = [categoryId];
  while (stack.length) {
    const id = stack.pop()!;
    for (const child of childrenOf.get(id) ?? []) {
      ids.push(child);
      stack.push(child);
    }
  }
  return ids;
}

// Catalog read helpers. All wrapped to degrade gracefully when the DB is
// empty or unavailable (e.g. before the scraper import has run).

export async function getFeaturedProducts(limit = 8): Promise<ProductCardData[]> {
  try {
    const families = await prisma.productFamily.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        variants: { orderBy: { price: "asc" }, take: 1 },
        _count: { select: { variants: true } },
      },
    });
    return families
      .filter((f) => f.variants.length > 0)
      .map((f) => ({
        slug: f.slug,
        name: f.name,
        price: Number(f.variants[0].price),
        oldPrice: f.variants[0].oldPrice ? Number(f.variants[0].oldPrice) : null,
        image: f.mainImageUrl,
        variantCount: f._count.variants,
      }));
  } catch {
    return [];
  }
}

export async function getRootCategories() {
  try {
    return await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

// Resolve a product family from one of its variant slugs (each variant has
// its own indexable URL but renders the shared family page).
export async function getProductByVariantSlug(slug: string) {
  try {
    const variant = await prisma.variant.findUnique({
      where: { slug },
      include: {
        family: {
          include: {
            brand: true,
            category: true,
            images: { orderBy: { sortOrder: "asc" } },
            variants: { orderBy: { price: "asc" } },
            attributes: { include: { attribute: true } },
          },
        },
      },
    });
    return variant;
  } catch {
    return null;
  }
}

export async function getCategoryByPath(slug: string) {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      include: { children: { orderBy: { sortOrder: "asc" } } },
    });
  } catch {
    return null;
  }
}

export async function getCategoryProducts(
  categoryId: string,
  opts: { skip?: number; take?: number; sort?: "price_asc" | "price_desc" | "new" } = {},
): Promise<{ items: ProductCardData[]; total: number }> {
  try {
    const orderBy =
      opts.sort === "price_asc"
        ? { createdAt: "desc" as const }
        : { createdAt: "desc" as const };
    const ids = await descendantCategoryIds(categoryId);
    const where = { categoryId: { in: ids } };
    const [families, total] = await Promise.all([
      prisma.productFamily.findMany({
        where,
        skip: opts.skip ?? 0,
        take: opts.take ?? 24,
        orderBy,
        include: {
          variants: { orderBy: { price: "asc" }, take: 1 },
          _count: { select: { variants: true } },
        },
      }),
      prisma.productFamily.count({ where }),
    ]);
    const items = families
      .filter((f) => f.variants.length > 0)
      .map((f) => ({
        slug: f.variants[0].slug,
        name: f.name,
        price: Number(f.variants[0].price),
        oldPrice: f.variants[0].oldPrice ? Number(f.variants[0].oldPrice) : null,
        image: f.mainImageUrl,
        variantCount: f._count.variants,
      }));
    return { items, total };
  } catch {
    return { items: [], total: 0 };
  }
}

export async function getAllVariantSlugs(): Promise<string[]> {
  try {
    const variants = await prisma.variant.findMany({ select: { slug: true } });
    return variants.map((v) => v.slug);
  } catch {
    return [];
  }
}
