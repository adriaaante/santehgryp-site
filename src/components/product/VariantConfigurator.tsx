"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type VariantAxis = { key: string; label: string; unit?: string };

export type ConfiguratorVariant = {
  id: string;
  slug: string;
  sku: string;
  price: number;
  availability: string;
  axisValues: Record<string, string>;
};

type Props = {
  axes: VariantAxis[];
  variants: ConfiguratorVariant[];
  currentSlug: string;
};

/**
 * Renders one selector row per variant axis. Each option navigates to the
 * matching variant's own (indexable) URL. The key differentiator vs.
 * competitors who split sizes into separate category pages.
 */
export function VariantConfigurator({ axes, variants, currentSlug }: Props) {
  const router = useRouter();
  const current = variants.find((v) => v.slug === currentSlug) ?? variants[0];

  // Distinct option values per axis, in stable order.
  const optionsByAxis = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const axis of axes) {
      const seen = new Set<string>();
      for (const v of variants) {
        const val = v.axisValues[axis.key];
        if (val != null) seen.add(String(val));
      }
      map[axis.key] = [...seen];
    }
    return map;
  }, [axes, variants]);

  function findVariantFor(axisKey: string, value: string): ConfiguratorVariant | undefined {
    // Keep the other selected axis values fixed, change only this axis.
    const target = { ...current.axisValues, [axisKey]: value };
    return (
      variants.find((v) =>
        axes.every((a) => String(v.axisValues[a.key]) === String(target[a.key])),
      ) ?? variants.find((v) => String(v.axisValues[axisKey]) === value)
    );
  }

  if (axes.length === 0 || variants.length <= 1) return null;

  return (
    <div className="space-y-4">
      {axes.map((axis) => (
        <div key={axis.key}>
          <div className="mb-1.5 text-sm font-medium text-slate-700">
            {axis.label}
            {axis.unit ? `, ${axis.unit}` : ""}
          </div>
          <div className="flex flex-wrap gap-2">
            {optionsByAxis[axis.key].map((value) => {
              const variant = findVariantFor(axis.key, value);
              const selected = String(current.axisValues[axis.key]) === value;
              const disabled = !variant;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={disabled}
                  onClick={() => variant && router.push(`/product/${variant.slug}`)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm transition",
                    selected
                      ? "border-brand-600 bg-brand-50 font-semibold text-brand-700"
                      : "border-slate-300 text-slate-700 hover:border-brand-400",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
