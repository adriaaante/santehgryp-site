"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/stores/cart";

export function AddToCartButton({ item }: { item: Omit<CartItem, "qty"> }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  function handle() {
    add(item, 1);
    setAdded(true);
    // Yandex.Metrica ecommerce event.
    if (typeof window !== "undefined" && "dataLayer" in window) {
      // @ts-expect-error dataLayer injected by Metrica
      window.dataLayer.push({
        ecommerce: { add: { products: [{ id: item.sku, name: item.name, price: item.price }] } },
      });
    }
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handle}
      className="w-full rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-700"
    >
      {added ? "Добавлено ✓" : "В корзину"}
    </button>
  );
}
