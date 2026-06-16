// Central site configuration (single source of truth for SEO defaults,
// contacts and LocalBusiness schema).
export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Сантехгруп",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://santehgryp.ru",
  description:
    "Интернет-магазин инженерного оборудования и сантехники: трубы, фитинги, радиаторы отопления, котлы, фильтры для воды, насосы. Быстрая доставка по России.",
  tagline: "Интернет-магазин инженерного оборудования и сантехники",
  phones: ["+7 (495) 000-00-00", "+7 (999) 000-00-00"],
  email: "info@santehgryp.ru",
  address: {
    locality: "Москва",
    region: "Москва",
    country: "RU",
  },
  social: {
    telegram: "https://t.me/santehgryp",
    whatsapp: "https://wa.me/79990000000",
  },
} as const;

export function absoluteUrl(path = ""): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
