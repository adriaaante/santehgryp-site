"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, setQty, remove, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Корзина пуста</h1>
        <p className="mt-2 text-slate-500">Добавьте товары из каталога, чтобы оформить заказ.</p>
        <Link
          href="/catalog"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Корзина</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((i) => (
            <div
              key={i.variantId}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="relative h-16 w-16 shrink-0 bg-slate-50">
                {i.image && (
                  <Image src={i.image} alt={i.name} fill className="object-contain" sizes="64px" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${i.slug}`} className="line-clamp-2 text-sm text-slate-800 hover:text-brand-600">
                  {i.name}
                </Link>
                <div className="text-xs text-slate-400">Артикул: {i.sku}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQty(i.variantId, i.qty - 1)}
                  className="h-8 w-8 rounded-md border border-slate-300 text-slate-600"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{i.qty}</span>
                <button
                  onClick={() => setQty(i.variantId, i.qty + 1)}
                  className="h-8 w-8 rounded-md border border-slate-300 text-slate-600"
                >
                  +
                </button>
              </div>
              <div className="w-24 text-right font-semibold text-slate-900">
                {formatPrice(i.price * i.qty)}
              </div>
              <button
                onClick={() => remove(i.variantId)}
                aria-label="Удалить"
                className="text-slate-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex justify-between text-lg">
            <span className="text-slate-600">Итого</span>
            <span className="font-bold text-slate-900">{formatPrice(total())}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-5 block rounded-lg bg-brand-600 px-6 py-3 text-center font-semibold text-white hover:bg-brand-700"
          >
            Оформить заказ
          </Link>
        </div>
      </div>
    </div>
  );
}
