import { prisma } from "./db";
import type { ProductCardData } from "@/components/catalog/ProductCard";

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
    const [families, total] = await Promise.all([
      prisma.productFamily.findMany({
        where: { categoryId },
        skip: opts.skip ?? 0,
        take: opts.take ?? 24,
        orderBy,
        include: {
          variants: { orderBy: { price: "asc" }, take: 1 },
          _count: { select: { variants: true } },
        },
      }),
      prisma.productFamily.count({ where: { categoryId } }),
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
