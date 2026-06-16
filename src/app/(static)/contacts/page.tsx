import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { site, telHref } from "@/lib/site";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Контакты",
  description: `Контакты интернет-магазина ${site.name}: телефоны, адрес, режим работы, реквизиты.`,
  path: "/contacts",
});

export default function ContactsPage() {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: site.name,
    url: site.url,
    telephone: site.phones.map((p) => p.value),
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.full,
      addressLocality: site.address.locality,
      addressCountry: site.address.country,
    },
    openingHours: ["Mo-Fr 09:00-19:00", "Sa-Su 09:00-18:00"],
  };

  return (
    <div className="container-page max-w-4xl pb-12">
      <JsonLd data={localBusiness} />
      <Breadcrumbs items={[{ name: "Главная", url: "/" }, { name: "Контакты", url: "/contacts" }]} />
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Контакты</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-slate-900">Телефоны</h2>
          <ul className="space-y-2">
            {site.phones.map((p) => (
              <li key={p.value}>
                <a href={telHref(p.value)} className="text-lg font-semibold text-brand-700 hover:underline">
                  {p.value}
                </a>
                <span className="ml-2 text-sm text-slate-400">{p.label}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <a href={`mailto:${site.email}`} className="text-brand-700 hover:underline">{site.email}</a>
          </div>
          <div className="mt-4 flex gap-3">
            <a href={site.social.telegram} className="rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-100">Telegram</a>
            <a href={site.social.whatsapp} className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100">WhatsApp</a>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-slate-900">Адрес и режим работы</h2>
          <p className="text-slate-700">{site.address.full}</p>
          <div className="mt-3 space-y-1 text-sm text-slate-600">
            {site.hours.map((h) => (
              <div key={h.days} className="flex justify-between">
                <span>{h.days}</span>
                <span className="font-medium text-slate-800">{h.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-slate-900">Реквизиты</h2>
        <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Наименование</dt><dd className="text-right text-slate-800">{site.legal.name}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">ИНН</dt><dd className="text-right text-slate-800">{site.legal.inn}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">ОГРНИП</dt><dd className="text-right text-slate-800">{site.legal.ogrnip}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Расчётный счёт</dt><dd className="text-right text-slate-800">{site.legal.account}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Банк</dt><dd className="text-right text-slate-800">{site.legal.bank}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">БИК</dt><dd className="text-right text-slate-800">{site.legal.bik}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Корр. счёт</dt><dd className="text-right text-slate-800">{site.legal.corrAccount}</dd></div>
        </dl>
      </div>
    </div>
  );
}
