import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getProductByVariantSlug } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { VariantConfigurator, type VariantAxis } from "@/components/product/VariantConfigurator";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";

type Params = { slug: string };

const availabilityLabel: Record<string, string> = {
  IN_STOCK: "В наличии",
  ON_ORDER: "Под заказ",
  OUT_OF_STOCK: "Нет в наличии",
};

const availabilitySchema: Record<string, string> = {
  IN_STOCK: "https://schema.org/InStock",
  ON_ORDER: "https://schema.org/PreOrder",
  OUT_OF_STOCK: "https://schema.org/OutOfStock",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const variant = await getProductByVariantSlug(slug);
  if (!variant) return {};
  const f = variant.family;
  const title = f.metaTitle ?? `${f.name} — купить по цене ${formatPrice(Number(variant.price))}`;
  return buildMetadata({
    title,
    description:
      f.metaDescription ??
      `${f.name}. Артикул ${variant.sku}. ${availabilityLabel[variant.availability]}. Доставка по России — ${site.name}.`,
    path: `/product/${slug}`,
    image: f.mainImageUrl ?? undefined,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const variant = await getProductByVariantSlug(slug);
  if (!variant) notFound();

  const f = variant.family;
  const axes = (f.variantAxes as unknown as VariantAxis[]) ?? [];
  const price = Number(variant.price);
  const oldPrice = variant.oldPrice ? Number(variant.oldPrice) : null;

  const crumbs = [
    { name: "Главная", url: "/" },
    { name: "Каталог", url: "/catalog" },
    { name: f.category.name, url: `/catalog/${f.category.slug}` },
    { name: f.name, url: `/product/${slug}` },
  ];

  const configuratorVariants = f.variants.map((v) => ({
    id: v.id,
    slug: v.slug,
    sku: v.sku,
    price: Number(v.price),
    availability: v.availability,
    axisValues: (v.axisValues as Record<string, string>) ?? {},
  }));

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: f.name,
    sku: variant.sku,
    image: f.images.map((i) => i.url),
    description: f.metaDescription ?? f.name,
    brand: f.brand ? { "@type": "Brand", name: f.brand.name } : undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${slug}`),
      price: price.toFixed(2),
      priceCurrency: "RUB",
      availability: availabilitySchema[variant.availability],
    },
    ...(f.aggregateRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: f.aggregateRating,
            reviewCount: f.ratingCount ?? 1,
          },
        }
      : {}),
  };

  return (
    <div className="container-page">
      <JsonLd data={productSchema} />
      <JsonLd
        data={breadcrumbSchema(crumbs.map((c) => ({ name: c.name, url: absoluteUrl(c.url) })))}
      />
      <Breadcrumbs items={crumbs} />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Gallery */}
        <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white">
          {f.mainImageUrl ? (
            <Image
              src={f.mainImageUrl}
              alt={f.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-6"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">нет фото</div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{f.name}</h1>
          <div className="mt-1 text-sm text-slate-400">
            Артикул: {variant.sku}
            {f.brand && <span className="ml-3">Бренд: {f.brand.name}</span>}
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-slate-900">{formatPrice(price)}</span>
            {oldPrice && oldPrice > price && (
              <span className="text-lg text-slate-400 line-through">{formatPrice(oldPrice)}</span>
            )}
          </div>
          <div className="mt-1 text-sm font-medium text-brand-600">
            {availabilityLabel[variant.availability]}
          </div>

          {axes.length > 0 && configuratorVariants.length > 1 && (
            <div className="mt-6">
              <VariantConfigurator
                axes={axes}
                variants={configuratorVariants}
                currentSlug={slug}
              />
            </div>
          )}

          <div className="mt-6 max-w-xs">
            <AddToCartButton
              item={{
                variantId: variant.id,
                slug: variant.slug,
                name: f.name,
                sku: variant.sku,
                price,
                image: f.mainImageUrl,
              }}
            />
          </div>

          {/* Specs */}
          {f.attributes.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">Характеристики</h2>
              <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {f.attributes.map((a) => (
                  <div key={a.id} className="flex justify-between gap-4 px-4 py-2 text-sm">
                    <dt className="text-slate-500">
                      {a.attribute.name}
                      {a.attribute.unit ? `, ${a.attribute.unit}` : ""}
                    </dt>
                    <dd className="text-right text-slate-800">{a.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {f.descriptionHtml && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-bold text-slate-900">Описание</h2>
          <div
            className="prose prose-sm max-w-none text-slate-600"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: f.descriptionHtml }}
          />
        </section>
      )}
    </div>
  );
}
