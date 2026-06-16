import nodemailer from "nodemailer";

type OrderNotification = {
  number: string;
  customerName: string;
  phone: string;
  email?: string | null;
  deliveryMethod?: string | null;
  address?: string | null;
  comment?: string | null;
  total: number;
  items: { name: string; sku: string; qty: number; price: number }[];
};

function renderText(o: OrderNotification): string {
  const lines = o.items
    .map((i) => `• ${i.name} (${i.sku}) × ${i.qty} = ${i.price * i.qty} ₽`)
    .join("\n");
  return [
    `Новый заказ №${o.number}`,
    `Имя: ${o.customerName}`,
    `Телефон: ${o.phone}`,
    o.email ? `E-mail: ${o.email}` : "",
    o.deliveryMethod ? `Доставка: ${o.deliveryMethod}` : "",
    o.address ? `Адрес: ${o.address}` : "",
    o.comment ? `Комментарий: ${o.comment}` : "",
    "",
    lines,
    "",
    `Итого: ${o.total} ₽`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendEmail(o: OrderNotification) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, ORDER_NOTIFY_EMAIL } = process.env;
  if (!SMTP_HOST || !ORDER_NOTIFY_EMAIL) return;
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 465),
    secure: Number(SMTP_PORT ?? 465) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
  });
  await transport.sendMail({
    from: SMTP_USER ?? ORDER_NOTIFY_EMAIL,
    to: ORDER_NOTIFY_EMAIL,
    subject: `Новый заказ №${o.number}`,
    text: renderText(o),
  });
}

async function sendTelegram(o: OrderNotification) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: renderText(o) }),
  });
}

// Fire both channels; never throw so the order still succeeds if a channel fails.
export async function notifyOrder(o: OrderNotification): Promise<void> {
  await Promise.allSettled([sendEmail(o), sendTelegram(o)]);
}
