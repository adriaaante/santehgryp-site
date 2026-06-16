import { buildYmlFeed } from "@/lib/yml";

// Cached for an hour; regenerated after price/stock refresh via revalidate.
export const revalidate = 3600;

export async function GET() {
  const xml = await buildYmlFeed();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
