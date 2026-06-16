# Сантехгруп — интернет-магазин (Next.js)

Новый интернет-магазин инженерной сантехники, спроектированный под SEO,
Яндекс.Директ и удобный подбор товаров. Заменяет сайт на 1С-Битрикс.

## Ключевые возможности

- **Конфигуратор вариантов** — товары, отличающиеся размером/моделью/цветом,
  объединены в одну карточку с панелью выбора; каждый вариант имеет свой
  индексируемый URL (преимущество над конкурентами, которые плодят отдельные
  страницы под каждый размер).
- **Умный поиск** — мгновенный автокомплит, опечаткоустойчивость и русская
  морфология через Meilisearch (с резервом на Postgres).
- **SEO с нуля** — SSR/SSG, мета-теги и canonical на каждой странице,
  Product / BreadcrumbList / Organization / LocalBusiness JSON-LD,
  `sitemap.xml`, `robots.txt`.
- **Яндекс** — счётчик Метрики с ecommerce, YML-фид `/feed.yml` для
  Яндекс.Маркет/Директа.
- **Корзина и заявка** — корзина в localStorage, оформление заявки с
  уведомлением на email (SMTP) и в Telegram.
- **Адаптивность** — mobile-first, мега-меню, мобильное меню и поиск.
- **152-ФЗ** — данные хранятся в РФ (российский VPS), согласие в чекауте.

## Стек

Next.js 15 (App Router, TypeScript) · Tailwind CSS v4 · PostgreSQL + Prisma ·
Meilisearch · Zustand · Docker.

## Быстрый старт (локально)

```bash
cp .env.example .env            # заполнить DATABASE_URL и пр.
npm install
docker compose up -d db search  # Postgres + Meilisearch
npm run db:push                 # применить схему
# перенос каталога (см. ниже) -> создаст scraper/data/normalized/catalog.json
npm run db:seed                 # импорт каталога в БД
npm run search:reindex          # индексация в Meilisearch
npm run dev                     # http://localhost:3000
```

## Перенос каталога с santehgryp.ru

```bash
npm run scrape                  # полный обход (~18k товаров)
npm run scrape -- --limit 200   # выборка для теста
npm run scrape -- --offset 1000 --limit 200
```

Парсер берёт URL из `sitemap.xml`, разбирает карточки Aspro по schema.org
микроразметке (артикул, цена, наличие, хлебные крошки, характеристики),
кэширует сырой HTML (`scraper/data/raw/`), группирует варианты и пишет
`scraper/data/normalized/catalog.json`. Повторный запуск использует кэш.

## Деплой (российский VPS)

```bash
docker compose up -d            # web + db + search
```

`Dockerfile` собирает standalone-сборку Next.js. Перед продакшеном поставьте
перед `web` реверс-прокси (Caddy/nginx) для HTTPS и сжатия, заполните `.env`
(SMTP, Telegram, Meilisearch master key, Яндекс.Метрика).

## Структура

```
prisma/schema.prisma    модель данных (ProductFamily <-> Variant)
prisma/seed.ts          импорт catalog.json в БД
scraper/src/            парсер каталога Битрикса
scripts/reindex-search  индексация Meilisearch из БД
src/app/                страницы (каталог, товар, поиск, корзина, чекаут, SEO-роуты)
src/components/         UI (Header, ProductCard, VariantConfigurator, …)
src/lib/                db, search, seo, yml, slug, notify, nav
src/stores/cart.ts      корзина (Zustand)
```

## Дорожная карта

Реализовано: витрина (каталог, товар + конфигуратор, поиск, корзина, заявка),
SEO-обвязка, YML-фид, парсер+импорт каталога.

Дальше: фасетные фильтры по характеристикам, онлайн-оплата и личный кабинет,
админка управления товарами/заказами, `generateStaticParams` + ISR для
предрендеринга тысяч карточек, image sitemap и хранилище оригиналов (S3/MinIO),
плановое обновление цен/наличия.
