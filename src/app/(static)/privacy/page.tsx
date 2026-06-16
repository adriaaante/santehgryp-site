import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "Политика конфиденциальности",
  description: "Политика обработки персональных данных в соответствии с 152-ФЗ.",
  path: "/privacy",
  noindex: true,
});

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl pb-10">
      <Breadcrumbs items={[{ name: "Главная", url: "/" }, { name: "Политика конфиденциальности", url: "/privacy" }]} />
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Политика конфиденциальности</h1>
      <div className="prose prose-sm max-w-none text-slate-600">
        <p>
          Настоящая политика определяет порядок обработки персональных данных пользователей сайта
          {" "}{site.name} в соответствии с Федеральным законом №152-ФЗ «О персональных данных».
        </p>
        <p>
          Персональные данные (имя, телефон, e-mail, адрес доставки) используются исключительно для
          обработки заказов и связи с покупателем. Данные хранятся на серверах, расположенных на
          территории Российской Федерации, и не передаются третьим лицам.
        </p>
      </div>
    </div>
  );
}
