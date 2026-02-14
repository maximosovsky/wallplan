---
description: SEO launch checklist — what to do when a product is finished
---

# SEO Launch Checklist

Пошаговая методология SEO-оптимизации для готового веб-продукта. Проверено на WallPlan (Feb 2026).

## Phase 1: Technical SEO Foundation

### 1.1 Meta Tags (index.html)
- `<title>` — 50-60 символов, главное ключевое слово в начале
- `<meta description>` — 150-160 символов, включает CTA и ключевые слова
- `<meta keywords>` — через запятую (Google игнорирует, но Bing/Яндекс могут учитывать)
- `<meta viewport>` — `width=device-width, initial-scale=1`
- `<html lang="en">` — язык страницы

### 1.2 Open Graph + Twitter Card
```html
<meta property="og:type" content="website">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="https://domain.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="https://domain.com/">
<meta property="og:site_name" content="Brand">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="https://domain.com/og-image.png">
```
- OG-картинка: **1200×630 px** (стандарт)
- Проверка: Facebook Debugger, Twitter Card Validator

### 1.3 SEO Links
```html
<link rel="canonical" href="https://domain.com/">
<link rel="alternate" hreflang="en" href="https://domain.com/">
<link rel="alternate" hreflang="ru" href="https://domain.com/ru/">
<link rel="alternate" hreflang="x-default" href="https://domain.com/">
```

### 1.4 Favicon + PWA
```html
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,...">
<link rel="apple-touch-icon" href="...">
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#F5F0E8">
```

### 1.5 Structured Data (JSON-LD)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "...",
  "description": "...",
  "url": "...",
  "applicationCategory": "Productivity",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "author": {
    "@type": "Person",
    "name": "...",
    "sameAs": "https://www.wikidata.org/wiki/..." 
  }
}
</script>
```
- Если автор есть на Wikidata — добавить `sameAs` для Knowledge Graph
- Проверка: Google Rich Results Test

### 1.6 Noscript Fallback
```html
<noscript>
  <h1>Product Name</h1>
  <p>Requires JavaScript. Please enable JS.</p>
</noscript>
```

## Phase 2: Crawler Files

### 2.1 robots.txt
```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://domain.com/sitemap.xml
```
- Явно разрешить AI-краулеры (GPTBot, ClaudeBot, PerplexityBot)

### 2.2 sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://domain.com/</loc>
    <lastmod>2026-02-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="..." />
    <xhtml:link rel="alternate" hreflang="ru" href="..." />
  </url>
</urlset>
```

### 2.3 LLM Files
- `llms.txt` — краткое описание (5-10 строк) для быстрого чтения AI
- `llms-full.txt` — полная документация в Markdown

## Phase 3: Hidden Content for SPA/Canvas Apps

Если продукт рендерит контент в Canvas/SVG/WebGL — Google не может прочитать содержимое. Решение:

```html
<div style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden" aria-hidden="true">
  <h1>Product Name — Tagline</h1>
  <h2>Features</h2>
  <p>Feature descriptions with keywords...</p>
  <h2>Pricing</h2>
  <p>Free / pricing info...</p>
</div>
```
- Взять контент из README
- Структурировать с `<h1>`, `<h2>`, `<p>`
- Естественные ключевые слова, не спам

## Phase 4: Security Headers

В `vercel.json` (или nginx/apache конфиг):
```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
    ]
  }]
}
```

## Phase 5: Registration & Backlinks

### 5.1 Google Search Console
1. Зайти: https://search.google.com/search-console
2. Добавить ресурс → «Ресурс с префиксом URL» → URL сайта
3. Подтвердить через Google Analytics (если GA4 уже стоит — автоматически)
4. Отправить sitemap: Файлы Sitemap → `sitemap.xml` → Отправить
5. Ждать 24-48 часов

### 5.2 GitHub Backlink
- Добавить ссылку на сайт в README.md (первая строка после заголовка)
- Добавить URL в настройках репо → About → Website

### 5.3 Keyword Research
- Использовать Google Trends, Ahrefs Free, SEMrush
- Создать `keywords.md` с категориями: Primary, Feature, Long-Tail, RU
- Обновить description и hidden content на основе найденных слов

## Phase 6: Verification

| Инструмент | Что проверяет |
|-----------|--------------|
| [Google Rich Results Test](https://search.google.com/test/rich-results) | JSON-LD structured data |
| [Facebook Debugger](https://developers.facebook.com/tools/debug/) | OG-превью |
| [Twitter Card Validator](https://cards-dev.twitter.com/validator) | Twitter Card |
| [securityheaders.com](https://securityheaders.com) | Security headers |
| Google Search Console | Индексация, sitemap |
| Telegram @WebpageBot | Превью ссылки |

## Порядок действий (чеклист)

1. [ ] Meta tags: title, description, keywords, viewport, lang
2. [ ] OG image 1200×630 + meta tags
3. [ ] Twitter Card meta tags
4. [ ] Canonical + hreflang
5. [ ] Favicon + apple-touch-icon + manifest.json + theme-color
6. [ ] JSON-LD structured data + Wikidata sameAs
7. [ ] Noscript fallback
8. [ ] robots.txt с AI-краулерами
9. [ ] sitemap.xml с hreflang
10. [ ] llms.txt + llms-full.txt
11. [ ] Hidden content block (for SPA/Canvas)
12. [ ] Security headers
13. [ ] Google Search Console → отправить sitemap
14. [ ] README link + GitHub About URL
15. [ ] Keyword research → keywords.md
16. [ ] Verification через все инструменты
