import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string }>;
}) {
  const { n } = await searchParams;
  return (
    <div className="container-page py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
        ✓
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Заказ оформлен!</h1>
      {n && <p className="mt-2 text-slate-600">Номер заказа: <strong>{n}</strong></p>}
      <p className="mt-2 text-slate-500">
        Мы свяжемся с вами в ближайшее время для подтверждения.
      </p>
      <Link
        href="/catalog"
        className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
      >
        Продолжить покупки
      </Link>
    </div>
  );
}
