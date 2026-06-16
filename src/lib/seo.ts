import type { Metadata } from "next";
import { absoluteUrl, site } from "./site";

type BuildMetaArgs = {
  title: string;
  description?: string;
  path: string;
  image?: string;
  noindex?: boolean;
};

/** Builds page metadata with canonical, OpenGraph and robots in one place. */
export function buildMetadata({
  title,
  description,
  path,
  image,
  noindex,
}: BuildMetaArgs): Metadata {
  const url = absoluteUrl(path);
  const desc = description ?? site.description;
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description: desc,
      url,
      siteName: site.name,
      locale: "ru_RU",
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}
