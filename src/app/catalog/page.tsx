import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getCategoryTiles } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Каталог товаров",
  description:
    "Полный каталог инженерной и бытовой сантехники, отопления, водоподготовки и инструментов. Удобный подбор, актуальные цены, доставка по России.",
  path: "/catalog",
});

export default async function CatalogPage() {
  const tiles = await getCategoryTiles();
  return (
    <div className="container-page">
      <Breadcrumbs items={[{ name: "Главная", url: "/" }, { name: "Каталог", url: "/catalog" }]} />
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Каталог товаров</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map((cat) => (
          <Link
            key={cat.slug}
            href={`/catalog/${cat.slug}`}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] bg-slate-50">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-contain p-4 transition group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300">📦</div>
              )}
            </div>
            <div className="border-t border-slate-100 p-3">
              <div className="font-semibold text-slate-900 group-hover:text-brand-700">{cat.name}</div>
              {cat.childrenCount > 0 && (
                <div className="mt-0.5 text-xs text-slate-400">{cat.childrenCount} подкатегорий</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
