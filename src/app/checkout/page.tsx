"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          deliveryMethod: form.get("delivery"),
          address: form.get("address"),
          comment: form.get("comment"),
          items: items.map((i) => ({
            variantId: i.variantId,
            name: i.name,
            sku: i.sku,
            price: i.price,
            qty: i.qty,
          })),
        }),
      });
      if (!res.ok) throw new Error("Не удалось оформить заказ");
      const data = await res.json();
      clear();
      router.push(`/checkout/success?n=${encodeURIComponent(data.number ?? "")}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center text-slate-500">
        Корзина пуста. <a href="/catalog" className="text-brand-600">Перейти в каталог</a>
      </div>
    );
  }

  return (
    <div className="container-page py-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Оформление заказа</h1>
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Field name="name" label="Имя" required />
          <Field name="phone" label="Телефон" type="tel" required />
          <Field name="email" label="E-mail" type="email" />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Способ доставки</label>
            <select name="delivery" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
              <option value="courier">Доставка курьером</option>
              <option value="pickup">Самовывоз</option>
              <option value="transport">Транспортная компания</option>
            </select>
          </div>
          <Field name="address" label="Адрес доставки" />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Комментарий</label>
            <textarea name="comment" rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
          </div>
          <label className="flex items-start gap-2 text-xs text-slate-500">
            <input type="checkbox" required className="mt-0.5" />
            Я согласен на обработку персональных данных в соответствии с политикой конфиденциальности
          </label>
        </div>

        <div className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 text-sm text-slate-500">Товаров: {items.reduce((n, i) => n + i.qty, 0)}</div>
          <div className="flex justify-between text-lg">
            <span className="text-slate-600">Итого</span>
            <span className="font-bold text-slate-900">{formatPrice(total())}</span>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Отправляем…" : "Отправить заказ"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
      />
    </div>
  );
}
