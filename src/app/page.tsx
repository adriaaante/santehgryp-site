import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";
import { getFeaturedProducts, getCategoryTiles, getPromoProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";

export const revalidate = 3600;

const advantages = [
  { title: "Быстрая доставка", text: "Отправка в день заказа по всей России" },
  { title: "Подбор под проект", text: "Поможем подобрать оборудование под вашу систему" },
  { title: "Гарантия качества", text: "Только оригинальная продукция от производителей" },
  { title: "Удобный подбор", text: "Умный поиск и конфигуратор размеров и моделей" },
];

export default async function HomePage() {
  const [featured, tiles, promos] = await Promise.all([
    getFeaturedProducts(8),
    getCategoryTiles(),
    getPromoProducts(8),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="container-page py-14 md:py-20">
          <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
            {site.tagline}
          </h1>
          <p className="mt-4 max-w-2xl text-brand-100">
            Трубы, фитинги, радиаторы отопления, котлы, фильтры для воды и насосы.
            Тысячи товаров с быстрой доставкой по всей России.
          </p>
          <Link
            href="/catalog"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50"
          >
            Перейти в каталог
          </Link>
        </div>
      </section>

      {/* Advantages */}
      <section className="container-page -mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {advantages.map((a) => (
          <div key={a.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="font-semibold text-slate-900">{a.title}</div>
            <p className="mt-1 text-sm text-slate-500">{a.text}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      {tiles.length > 0 && (
        <section className="container-page mt-12">
          <h2 className="mb-5 text-2xl font-bold text-slate-900">Каталог товаров</h2>
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
        </section>
      )}

      {/* Promotions / Акции */}
      {promos.length > 0 && (
        <section className="container-page mt-12">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-md bg-accent-500 px-2 py-1 text-sm font-bold text-white">АКЦИИ</span>
            <h2 className="text-2xl font-bold text-slate-900">Скидки и спецпредложения</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {promos.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="container-page mt-12">
          <h2 className="mb-5 text-2xl font-bold text-slate-900">Популярные товары</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* SEO text */}
      <section className="container-page mt-14 mb-4">
        <div className="prose prose-sm max-w-none text-slate-600">
          <h2 className="text-xl font-bold text-slate-900">
            Интернет-магазин инженерной сантехники {site.name}
          </h2>
          <p>
            В нашем каталоге представлен широкий ассортимент инженерного
            оборудования: трубы и фитинги, коллекторные группы, котлы и
            расширительные баки, радиаторы отопления (стальные панельные,
            биметаллические, алюминиевые, трубчатые), конвекторы, системы
            водоподготовки и фильтры для воды, насосное оборудование, системы
            защиты от протечек. Удобный умный поиск, подбор размеров и моделей в
            один клик, актуальные цены и быстрая доставка по всей России.
          </p>
        </div>
      </section>
    </>
  );
}
