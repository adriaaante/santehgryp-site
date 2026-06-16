import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { notifyOrder } from "@/lib/notify";

const orderSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email().optional().or(z.literal("")),
  deliveryMethod: z.string().optional(),
  address: z.string().optional(),
  comment: z.string().optional(),
  metricaClientId: z.string().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        name: z.string(),
        sku: z.string(),
        price: z.number(),
        qty: z.number().int().positive(),
      }),
    )
    .min(1),
});

function orderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 422 });
  }
  const data = parsed.data;
  const total = data.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const number = orderNumber();

  try {
    await prisma.order.create({
      data: {
        number,
        customerName: data.customerName,
        phone: data.phone,
        email: data.email || null,
        deliveryMethod: data.deliveryMethod,
        address: data.address,
        comment: data.comment,
        total,
        metricaClientId: data.metricaClientId,
        items: {
          create: data.items.map((i) => ({
            // variantId may be absent in DB during early MVP; store snapshots regardless.
            nameSnapshot: i.name,
            skuSnapshot: i.sku,
            priceSnapshot: i.price,
            qty: i.qty,
          })),
        },
      },
    });
  } catch {
    // Persisting failed (e.g. DB not ready) — still notify so no lead is lost.
  }

  await notifyOrder({ number, total, ...data });

  return NextResponse.json({ ok: true, number });
}
