import Link from "next/link";
import { catalogNav } from "@/lib/nav";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-page grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="text-lg font-bold text-brand-700">{site.name}</div>
          <p className="mt-2 text-sm text-slate-500">{site.tagline}</p>
          <div className="mt-4 space-y-1 text-sm">
            {site.phones.map((p) => (
              <a key={p} href={`tel:${p.replace(/[^+\d]/g, "")}`} className="block font-semibold text-slate-800">
                {p}
              </a>
            ))}
            <a href={`mailto:${site.email}`} className="block text-slate-500">{site.email}</a>
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold text-slate-900">Каталог</div>
          <ul className="space-y-1.5">
            {catalogNav.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link href={`/catalog/${c.slug}`} className="text-sm text-slate-500 hover:text-brand-600">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold text-slate-900">Покупателям</div>
          <ul className="space-y-1.5 text-sm text-slate-500">
            <li><Link href="/delivery" className="hover:text-brand-600">Доставка и оплата</Link></li>
            <li><Link href="/about" className="hover:text-brand-600">О компании</Link></li>
            <li><Link href="/contacts" className="hover:text-brand-600">Контакты</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold text-slate-900">Контакты</div>
          <p className="text-sm text-slate-500">{site.address.locality}</p>
          <div className="mt-3 flex gap-3 text-sm">
            <a href={site.social.telegram} className="text-brand-600 hover:underline">Telegram</a>
            <a href={site.social.whatsapp} className="text-brand-600 hover:underline">WhatsApp</a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="container-page flex flex-col gap-2 py-4 text-xs text-slate-400 md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} {site.name}. Все права защищены.</span>
          <Link href="/privacy" className="hover:text-brand-600">Политика конфиденциальности</Link>
        </div>
      </div>
    </footer>
  );
}
