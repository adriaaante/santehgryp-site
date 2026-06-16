import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Контакты",
  description: `Контакты интернет-магазина ${site.name}: телефоны, e-mail, мессенджеры.`,
  path: "/contacts",
});

export default function ContactsPage() {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: site.name,
    url: site.url,
    telephone: site.phones[0],
    email: site.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.locality,
      addressCountry: site.address.country,
    },
  };

  return (
    <div className="container-page max-w-3xl pb-10">
      <JsonLd data={localBusiness} />
      <Breadcrumbs items={[{ name: "Главная", url: "/" }, { name: "Контакты", url: "/contacts" }]} />
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Контакты</h1>
      <div className="space-y-2 text-slate-700">
        {site.phones.map((p) => (
          <div key={p}>
            Телефон:{" "}
            <a href={`tel:${p.replace(/[^+\d]/g, "")}`} className="font-semibold text-brand-700">
              {p}
            </a>
          </div>
        ))}
        <div>
          E-mail: <a href={`mailto:${site.email}`} className="text-brand-700">{site.email}</a>
        </div>
        <div className="flex gap-3 pt-2">
          <a href={site.social.telegram} className="text-brand-600 hover:underline">Telegram</a>
          <a href={site.social.whatsapp} className="text-brand-600 hover:underline">WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
