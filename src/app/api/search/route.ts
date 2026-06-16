import { NextResponse } from "next/server";
import { productsIndex } from "@/lib/search";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Autocomplete endpoint. Uses Meilisearch when configured, otherwise falls
// back to a Postgres query so search works in any environment.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ hits: [] });

  const index = productsIndex();
  if (index) {
    try {
      const res = await index.search(q, { limit: 8 });
      return NextResponse.json({
        hits: res.hits.map((h) => ({
          slug: h.slug,
          name: h.name,
          price: h.price,
          sku: h.sku,
          image: h.image,
        })),
      });
    } catch {
      // fall through to DB
    }
  }

  try {
    const variants = await prisma.variant.findMany({
      where: {
        OR: [
          { family: { name: { contains: q, mode: "insensitive" } } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 8,
      include: { family: true },
    });
    return NextResponse.json({
      hits: variants.map((v) => ({
        slug: v.slug,
        name: v.family.name,
        price: Number(v.price),
        sku: v.sku,
        image: v.family.mainImageUrl,
      })),
    });
  } catch {
    return NextResponse.json({ hits: [] });
  }
}
