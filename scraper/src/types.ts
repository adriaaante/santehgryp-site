export type RawProduct = {
  url: string;
  name: string;
  sku: string;
  price: number;
  oldPrice: number | null;
  currency: string;
  availability: "IN_STOCK" | "ON_ORDER" | "OUT_OF_STOCK";
  image: string | null;
  images: string[];
  descriptionHtml: string | null;
  brand: string | null;
  // Breadcrumb category chain (excluding "Главная"/"Каталог" and the product itself).
  categoryPath: { name: string; slug: string }[];
  attributes: { name: string; value: string }[];
};

export type Variant = {
  sku: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  availability: RawProduct["availability"];
  image: string | null;
  axisValues: Record<string, string>;
  attributes: { code: string; name: string; value: string }[];
};

export type Family = {
  slug: string;
  name: string;
  categorySlug: string;
  brandSlug: string | null;
  descriptionHtml: string | null;
  mainImageUrl: string | null;
  variantAxes: { key: string; label: string; unit?: string }[];
  variants: Variant[];
  confidence: "native" | "grouped" | "single";
};

export type CategoryNode = {
  slug: string;
  name: string;
  parentSlug: string | null;
  depth: number;
  sortOrder: number;
};

export type Catalog = {
  generatedAt: string;
  categories: CategoryNode[];
  brands: { slug: string; name: string }[];
  families: Family[];
  report: Record<string, number>;
};
