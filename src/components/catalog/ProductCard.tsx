import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export type ProductCardData = {
  slug: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  image?: string | null;
  availability?: string;
  variantCount?: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="relative aspect-square bg-slate-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-3"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">нет фото</div>
        )}
        {discount && (
          <span className="absolute left-2 top-2 rounded-md bg-accent-500 px-1.5 py-0.5 text-xs font-bold text-white">
            −{discount}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm text-slate-800 group-hover:text-brand-700">
          {product.name}
        </h3>
        {product.variantCount && product.variantCount > 1 && (
          <span className="mt-1 text-xs text-slate-400">
            {product.variantCount} вариантов
          </span>
        )}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
