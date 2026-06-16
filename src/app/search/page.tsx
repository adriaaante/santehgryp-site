import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { productsIndex } from "@/lib/search";
import { ProductCard, type ProductCardData } from "@/components/catalog/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Поиск: ${q}` : "Поиск",
    robots: { index: false, follow: true },
  };
}

async function runSearch(q: string): Promise<ProductCardData[]> {
  const index = productsIndex();
  if (index) {
    try {
      const res = await index.search(q, { limit: 48 });
      return res.hits.map((h) => ({
        slug: h.slug,
        name: h.name,
        price: h.price,
        oldPrice: h.oldPrice,
        image: h.image,
      }));
    } catch {
      /* fall through */
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
      take: 48,
      include: { family: true },
    });
    return variants.map((v) => ({
      slug: v.slug,
      name: v.family.name,
      price: Number(v.price),
      oldPrice: v.oldPrice ? Number(v.oldPrice) : null,
      image: v.family.mainImageUrl,
    }));
  } catch {
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q.trim().length >= 2 ? await runSearch(q.trim()) : [];

  return (
    <div className="container-page py-6">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Результаты поиска</h1>
      <p className="mb-6 text-sm text-slate-500">
        {q ? `По запросу «${q}» найдено: ${results.length}` : "Введите запрос для поиска"}
      </p>
      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        q.trim().length >= 2 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Ничего не найдено. Попробуйте изменить запрос.
          </div>
        )
      )}
    </div>
  );
}
