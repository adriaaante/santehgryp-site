import Link from "next/link";
import { site } from "@/lib/site";
import { getFeaturedProducts, getNavCategories } from "@/lib/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";

export const revalidate = 600;

const advantages = [
  { title: "Быстрая доставка", text: "Отправка в день заказа по всей России" },
  { title: "Подбор под проект", text: "Поможем подобрать оборудование под вашу систему" },
  { title: "Гарантия качества", text: "Только оригинальная продукция от производителей" },
  { title: "Удобный подбор", text: "Умный поиск и конфигуратор размеров и моделей" },
];

export default async function HomePage() {
  const [featured, catalogNav] = await Promise.all([
    getFeaturedProducts(8),
    getNavCategories(),
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
      <section className="container-page mt-12">
        <h2 className="mb-5 text-2xl font-bold text-slate-900">Каталог товаров</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {catalogNav.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalog/${cat.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-md"
            >
              <div className="font-semibold text-slate-900">{cat.name}</div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {cat.children?.map((c) => c.name).join(", ")}
              </p>
            </Link>
          ))}
        </div>
      </section>

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
