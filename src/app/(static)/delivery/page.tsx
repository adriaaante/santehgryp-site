import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Доставка и оплата",
  description:
    "Условия доставки и оплаты в интернет-магазине Сантехгруп: доставка по России, самовывоз, транспортные компании, способы оплаты.",
  path: "/delivery",
});

export default function DeliveryPage() {
  return (
    <div className="container-page max-w-3xl pb-10">
      <Breadcrumbs items={[{ name: "Главная", url: "/" }, { name: "Доставка и оплата", url: "/delivery" }]} />
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Доставка и оплата</h1>
      <div className="prose prose-sm max-w-none text-slate-600">
        <h2>Доставка</h2>
        <ul>
          <li>Доставка курьером по Москве и области.</li>
          <li>Отправка транспортными компаниями по всей России.</li>
          <li>Самовывоз со склада.</li>
          <li>Отправка заказов в день оформления.</li>
        </ul>
        <h2>Оплата</h2>
        <ul>
          <li>Наличными или картой при получении.</li>
          <li>Безналичный расчёт для юридических лиц.</li>
          <li>Онлайн-оплата картой (подключается).</li>
        </ul>
      </div>
    </div>
  );
}
