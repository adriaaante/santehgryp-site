// Central site configuration (single source of truth for SEO defaults,
// contacts, legal requisites and LocalBusiness schema). Real data from
// santehgryp.ru.
export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Сантехгруп",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://santehgryp.ru",
  description:
    "Интернет-магазин инженерного оборудования и сантехники: трубы, фитинги, радиаторы отопления, котлы, фильтры для воды, насосы. Быстрая доставка по России.",
  tagline: "Интернет-магазин инженерного оборудования и сантехники",
  phones: [
    { label: "Основной", value: "+7 (495) 220-50-09" },
    { label: "Отдел продаж", value: "+7 (999) 880-88-38" },
    { label: "Дополнительный", value: "+7 (985) 220-50-09" },
    { label: "Вентиляция", value: "+7 (966) 099-71-78" },
  ],
  email: "santehgryp@mail.ru",
  address: {
    full: "г. Москва, Новомосковский АО, район Коммунарка, ТЦ «Славянский Мир», ряд НБ 46/2",
    locality: "Москва",
    region: "Москва",
    country: "RU",
  },
  hours: [
    { days: "Пн–Пт", time: "9:00–19:00" },
    { days: "Сб–Вс", time: "9:00–18:00" },
  ],
  social: {
    telegram: "https://t.me/+79998808838",
    whatsapp: "https://wa.me/79998808838",
  },
  // Юридические реквизиты (ИП)
  legal: {
    name: "ИП Билян Айк Сантурович",
    inn: "771686609504",
    ogrnip: "323508100478226",
    account: "40802810401210001872",
    bank: "АО «АЛЬФА-БАНК»",
    bik: "044525593",
    corrAccount: "30101810145250000974",
  },
} as const;

export function absoluteUrl(path = ""): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

// Primary phone helpers (the phones array now holds {label,value} objects).
export const primaryPhone = site.phones[0].value;
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}
