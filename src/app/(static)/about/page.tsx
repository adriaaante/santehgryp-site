import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "О компании",
  description: `${site.name} — интернет-магазин инженерного оборудования и сантехники. О компании, ассортимент, преимущества.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="container-page max-w-3xl pb-10">
      <Breadcrumbs items={[{ name: "Главная", url: "/" }, { name: "О компании", url: "/about" }]} />
      <h1 className="mb-4 text-2xl font-bold text-slate-900">О компании {site.name}</h1>
      <div className="prose prose-sm max-w-none text-slate-600">
        <p>
          {site.name} — интернет-магазин инженерного оборудования и сантехники. Мы предлагаем
          широкий ассортимент: трубы и фитинги, коллекторные группы, котлы, радиаторы отопления,
          конвекторы, фильтры для воды, насосное оборудование и системы защиты от протечек.
        </p>
        <p>
          Только оригинальная продукция от производителей, актуальные цены, удобный подбор товаров
          и быстрая доставка по всей России.
        </p>
      </div>
    </div>
  );
}
