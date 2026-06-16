import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategoryByPath, getCategoryProducts, getAllCategorySlugs } from "@/lib/catalog";
import { catalogNav } from "@/lib/nav";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/catalog/ProductCard";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";

const PAGE_SIZE = 24;

// Pre-render category pages as static HTML (background refresh hourly).
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({ slug: [slug] }));
}

// Resolve category name/crumbs from the static nav as a fallback when the DB
// has no record yet (e.g. before scraping). DB record takes precedence.
function navLookup(slugs: string[]): { name: string; crumbs: Crumb[] } | null {
  const [rootSlug, childSlug] = slugs;
  const root = catalogNav.find((c) => c.slug === rootSlug);
  if (!root) return null;
  const crumbs: Crumb[] = [
    { name: "Главная", url: "/" },
    { name: "Каталог", url: "/catalog" },
    { name: root.name, url: `/catalog/${root.slug}` },
  ];
  if (childSlug) {
    const child = root.children?.find((c) => c.slug === childSlug);
    if (child) {
      crumbs.push({ name: child.name, url: `/catalog/${rootSlug}/${childSlug}` });
      return { name: child.name, crumbs };
    }
  }
  return { name: root.name, crumbs };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const leaf = slug[slug.length - 1];
  const dbCat = await getCategoryByPath(leaf);
  const nav = navLookup(slug);
  const name = dbCat?.name ?? nav?.name ?? "Каталог";
  return buildMetadata({
    title: dbCat?.metaTitle ?? `${name} — купить с доставкой`,
    description:
      dbCat?.metaDescription ??
      `${name}: широкий выбор, актуальные цены, быстрая доставка по России.`,
    path: `/catalog/${slug.join("/")}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const leaf = slug[slug.length - 1];
  const dbCat = await getCategoryByPath(leaf);
  const nav = navLookup(slug);

  if (!dbCat && !nav) notFound();

  const name = dbCat?.name ?? nav!.name;
  const crumbs = nav?.crumbs ?? [
    { name: "Главная", url: "/" },
    { name: "Каталог", url: "/catalog" },
    { name, url: `/catalog/${slug.join("/")}` },
  ];

  const { items, total } = dbCat
    ? await getCategoryProducts(dbCat.id, { skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE })
    : { items: [], total: 0 };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="container-page">
      <JsonLd
        data={breadcrumbSchema(crumbs.map((c) => ({ name: c.name, url: absoluteUrl(c.url) })))}
      />
      <Breadcrumbs items={crumbs} />
      <h1 className="mb-2 text-2xl font-bold text-slate-900">{name}</h1>
      {total > 0 && <p className="mb-5 text-sm text-slate-400">Найдено товаров: {total}</p>}

      {/* Subcategories */}
      {dbCat?.children && dbCat.children.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {dbCat.children.map((c) => (
            <Link
              key={c.id}
              href={`/catalog/${slug.join("/")}/${c.slug}`}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-brand-400"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-8 flex justify-center gap-1.5" aria-label="Пагинация">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={`/catalog/${slug.join("/")}${n > 1 ? `?page=${n}` : ""}`}
                  className={
                    n === page
                      ? "rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white"
                      : "rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-brand-400"
                  }
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          Товары в этой категории скоро появятся. Каталог наполняется.
        </div>
      )}
    </div>
  );
}
