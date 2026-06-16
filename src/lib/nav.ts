// Top-level catalog structure derived from santehgryp.ru analysis.
// Used for the mega-menu and homepage before/independently of DB seeding;
// the scraper will replace slugs/children with real data.
export type NavCategory = {
  name: string;
  slug: string;
  icon?: string;
  children?: { name: string; slug: string }[];
};

export const catalogNav: NavCategory[] = [
  {
    name: "Инженерная сантехника",
    slug: "inzhenernaya-santehnika",
    children: [
      { name: "Трубы", slug: "truby" },
      { name: "Фитинги", slug: "fitingi" },
      { name: "Коллекторные группы", slug: "kollektornye-gruppy" },
      { name: "Котлы", slug: "kotly" },
      { name: "Расширительные баки", slug: "rasshiritelnye-baki" },
      { name: "Защита от протечек", slug: "zaschita-ot-protechek" },
    ],
  },
  {
    name: "Бытовая сантехника",
    slug: "bytovaya-santehnika",
    children: [
      { name: "Смесители", slug: "smesiteli" },
      { name: "Инсталляции", slug: "installyacii" },
      { name: "Трапы и сливы", slug: "trapy-i-slivy" },
      { name: "Сифоны", slug: "sifony" },
    ],
  },
  {
    name: "Отопление",
    slug: "otoplenie",
    children: [
      { name: "Стальные панельные радиаторы", slug: "stalnye-panelnye-radiatory" },
      { name: "Биметаллические радиаторы", slug: "bimetallicheskie-radiatory" },
      { name: "Алюминиевые радиаторы", slug: "alyuminievye-radiatory" },
      { name: "Трубчатые радиаторы", slug: "trubchatye-radiatory" },
      { name: "Конвекторы", slug: "konvektory" },
    ],
  },
  {
    name: "Водоподготовка",
    slug: "vodopodgotovka",
    children: [
      { name: "Фильтры грубой очистки", slug: "filtry-gruboy-ochistki" },
      { name: "Фильтры тонкой очистки", slug: "filtry-tonkoy-ochistki" },
      { name: "Магнитные фильтры", slug: "magnitnye-filtry" },
    ],
  },
  {
    name: "Водоотведение",
    slug: "vodootvedenie",
    children: [
      { name: "Дренажные системы", slug: "drenazhnye-sistemy" },
      { name: "Дождеприёмники", slug: "dozhdepriemniki" },
      { name: "Трубы ПНД", slug: "truby-pnd" },
    ],
  },
  {
    name: "Инструменты",
    slug: "instrumenty",
    children: [
      { name: "Монтажный инструмент", slug: "montazhnyy-instrument" },
      { name: "Шланги", slug: "shlangi" },
    ],
  },
  {
    name: "Вентиляция",
    slug: "ventilyaciya",
    children: [
      { name: "Воздуховоды", slug: "vozduhovody" },
      { name: "Вентиляторы", slug: "ventilyatory" },
    ],
  },
];
