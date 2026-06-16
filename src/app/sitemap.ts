import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { catalogNav } from "@/lib/nav";
import { absoluteUrl } from "@/lib/site";

// Auto-generated sitemap: static pages + categories + every variant URL.
// For very large catalogs split via generateSitemaps (≤50k URLs each).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/catalog"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/delivery"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/contacts"), changeFrequency: "monthly", priority: 0.4 },
  ];

  const navRoutes: MetadataRoute.Sitemap = catalogNav.flatMap((c) => [
    { url: absoluteUrl(`/catalog/${c.slug}`), changeFrequency: "weekly", priority: 0.7 },
    ...(c.children ?? []).map((ch) => ({
      url: absoluteUrl(`/catalog/${c.slug}/${ch.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const variants = await prisma.variant.findMany({
      select: { slug: true, updatedAt: true },
    });
    productRoutes = variants.map((v) => ({
      url: absoluteUrl(`/product/${v.slug}`),
      lastModified: v.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    /* DB not ready */
  }

  return [...staticRoutes, ...navRoutes, ...productRoutes];
}
