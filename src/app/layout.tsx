import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { YandexMetrica } from "@/components/analytics/YandexMetrica";
import { JsonLd, organizationSchema } from "@/components/seo/JsonLd";
import { getNavCategories } from "@/lib/catalog";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  verification: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
    ? { yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION }
    : undefined,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories = await getNavCategories();
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <JsonLd data={organizationSchema(site.url, site.name)} />
        <Header categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer categories={categories} />
        <YandexMetrica />
      </body>
    </html>
  );
}
