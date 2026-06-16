import Link from "next/link";
import type { Metadata } from "next";
import { getNavCategories } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: "Каталог товаров",
  description:
    "Полный каталог инженерной и бытовой сантехники, отопления, водоподготовки и инструментов. Удобный подбор, актуальные цены, доставка по России.",
  path: "/catalog",
});

export default async function CatalogPage() {
  const catalogNav = await getNavCategories();
  return (
    <div className="container-page">
      <Breadcrumbs items={[{ name: "Главная", url: "/" }, { name: "Каталог", url: "/catalog" }]} />
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Каталог товаров</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {catalogNav.map((cat) => (
          <div key={cat.slug} className="rounded-xl border border-slate-200 bg-white p-5">
            <Link
              href={`/catalog/${cat.slug}`}
              className="text-lg font-semibold text-slate-900 hover:text-brand-600"
            >
              {cat.name}
            </Link>
            <ul className="mt-2 space-y-1">
              {cat.children?.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/catalog/${cat.slug}/${c.slug}`}
                    className="text-sm text-slate-500 hover:text-brand-600"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
