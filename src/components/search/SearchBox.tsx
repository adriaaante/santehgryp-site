"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type Hit = {
  slug: string;
  name: string;
  price: number;
  sku: string;
  image?: string | null;
};

export function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setHits(data.hits ?? []);
          setOpen(true);
        }
      } catch {
        /* aborted */
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit} className="flex">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => hits.length && setOpen(true)}
          placeholder="Поиск по товарам и артикулам…"
          aria-label="Поиск по каталогу"
          className="w-full rounded-l-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          className="rounded-r-lg bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Найти
        </button>
      </form>

      {open && hits.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-96 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {hits.map((h) => (
            <li key={h.slug}>
              <Link
                href={`/product/${h.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50"
              >
                <span className="flex-1 text-sm text-slate-800">{h.name}</span>
                <span className="whitespace-nowrap text-sm font-semibold text-brand-700">
                  {formatPrice(h.price)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
