"use client";

import Link from "next/link";
import { useState } from "react";
import type { NavCat } from "@/lib/catalog";
import { site } from "@/lib/site";
import { SearchBox } from "@/components/search/SearchBox";
import { useCart } from "@/stores/cart";

export function Header({ categories }: { categories: NavCat[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      {/* Top bar */}
      <div className="hidden border-b border-slate-100 md:block">
        <div className="container-page flex h-9 items-center justify-between text-xs text-slate-500">
          <span>{site.tagline}</span>
          <div className="flex items-center gap-4">
            <Link href="/delivery" className="hover:text-brand-600">Доставка и оплата</Link>
            <Link href="/contacts" className="hover:text-brand-600">Контакты</Link>
            <a href={site.social.telegram} className="hover:text-brand-600">Telegram</a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container-page flex h-16 items-center gap-4">
        <button
          className="md:hidden"
          aria-label="Меню"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <BurgerIcon />
        </button>

        <Link href="/" className="text-xl font-bold text-brand-700 whitespace-nowrap">
          {site.name}
        </Link>

        <div className="hidden flex-1 md:block">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-4">
          <a
            href={`tel:${site.phones[0].replace(/[^+\d]/g, "")}`}
            className="hidden text-sm font-semibold text-slate-800 lg:block"
          >
            {site.phones[0]}
          </a>
          <Link href="/cart" className="relative flex items-center gap-1.5 text-slate-700 hover:text-brand-600">
            <CartIcon />
            <span className="hidden text-sm sm:inline">Корзина</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile search */}
      <div className="container-page pb-3 md:hidden">
        <SearchBox />
      </div>

      {/* Catalog nav (desktop) */}
      <nav className="hidden border-t border-slate-100 md:block">
        <div className="container-page relative">
          <button
            onMouseEnter={() => setCatalogOpen(true)}
            onClick={() => setCatalogOpen((v) => !v)}
            className="flex h-11 items-center gap-2 px-1 text-sm font-medium text-slate-800 hover:text-brand-600"
          >
            <GridIcon /> Каталог товаров
          </button>

          {catalogOpen && (
            <div
              onMouseLeave={() => setCatalogOpen(false)}
              className="absolute left-0 top-full z-50 grid w-full grid-cols-3 gap-x-8 gap-y-4 rounded-b-xl border border-slate-200 bg-white p-6 shadow-xl"
            >
              {categories.map((cat) => (
                <div key={cat.slug}>
                  <Link
                    href={`/catalog/${cat.slug}`}
                    className="font-semibold text-slate-900 hover:text-brand-600"
                    onClick={() => setCatalogOpen(false)}
                  >
                    {cat.name}
                  </Link>
                  <ul className="mt-1.5 space-y-1">
                    {cat.children?.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/catalog/${cat.slug}/${c.slug}`}
                          className="text-sm text-slate-500 hover:text-brand-600"
                          onClick={() => setCatalogOpen(false)}
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-slate-100 bg-white md:hidden">
          <ul className="container-page divide-y divide-slate-100 py-2">
            {categories.map((cat) => (
              <li key={cat.slug} className="py-2">
                <Link
                  href={`/catalog/${cat.slug}`}
                  className="font-medium text-slate-900"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function BurgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
