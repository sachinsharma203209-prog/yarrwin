# Yarrwin — Astro 5 + Tailwind CSS 4

Production-ready static site for **yarrwin.com** — an online gaming & lottery results
platform engineered to rank: static pre-rendering, semantic HTML, automated JSON-LD,
OpenGraph/Twitter cards, sitemap and a deterministic results simulator that keeps every
page crawlable without a backend.

> Design system: **["Midnight Mint"](DESIGN.md)** — deep-space dark UI, mint accent,
> glassmorphism, monospaced numerics. Original design, not derived from any competitor.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview    # serve the production build
```

Requires Node 18.17+ (built and verified on Node 24 / Astro 5 / Tailwind 4).

## Directory structure

```
├── astro.config.mjs            # site URL, sitemap, Tailwind v4 Vite plugin
├── DESIGN.md                   # design system — single source of visual truth
├── public/
│   ├── favicon.svg             # Y-glyph mark
│   ├── robots.txt              # allows all + sitemap pointer
│   └── og/                     # 1200×630 OG cards (default / games / results / guide)
└── src/
    ├── styles/global.css       # Tailwind v4 @theme tokens + glass utilities + components
    ├── lib/
    │   ├── simulator.ts        # deterministic draw engine (shared by SSG + islands)
    │   └── rows.ts             # draw → table-cell view models
    ├── layouts/
    │   └── BaseLayout.astro    # SEO master layout (see below)
    ├── components/
    │   ├── Header.astro        # fixed glass pill nav + mobile menu
    │   ├── Footer.astro        # link columns, 18+/responsible-gaming notices
    │   ├── Hero.astro          # H1, value props, decorative draw card
    │   ├── LiveBoard.astro     # interactive island: countdowns + live draws
    │   ├── TickerMarquee.astro # results ticker strip
    │   ├── GameCard.astro      # game category card
    │   ├── ResultsTable.astro  # accessible results table (caption, scope, sr-only)
    │   ├── FaqAccordion.astro  # <details>-based FAQ (no JS)
    │   ├── CtaBand.astro / SectionHeading.astro / Logo.astro / Icon.astro / JsonLd.astro
    └── pages/
        ├── index.astro           # landing: hero, live board, stats, games, features, results preview, FAQ
        ├── games/index.astro     # games hub: rules, payout tables, strategy tips per game
        ├── results/index.astro   # results archive: tabbed tables, deep-linkable (#wingo/#k3/#5d)
        ├── guide/how-to-play.astro # 6-step beginner guide + responsible gaming + FAQ
        └── 404.astro
```

## SEO architecture (how this is built to rank)

1. **`BaseLayout.astro`** — one master `<head>`:
   - canonical URL (trailing-slash normalised), `robots` with `max-image-preview:large`
   - full OpenGraph + Twitter `summary_large_image` cards, per-page OG images
   - **automated JSON-LD**: `WebSite` + `Organization` on every page; pages append
     `BreadcrumbList`, `FAQPage`, `HowTo`, `ItemList` via the `schema` prop
   - preconnected Google Fonts (Sora / Inter / JetBrains Mono, `display=swap`)
2. **Semantic, keyword-targeted HTML** — one `<h1>` per page targeting the page's primary
   query ("Yarrwin official game", "WinGo results", "how to play"), `<h2>` long-tails,
   `<table>` with `<caption>`/`<th scope>` designed for rich-snippet extraction, all
   result data server-rendered (no JS-only content).
3. **Sitemap** — `@astrojs/sitemap` emits `/sitemap-index.xml` at build; `robots.txt`
   points to it; canonicals always carry trailing slashes to match.
4. **Performance** — zero framework runtime, ~2 KB vanilla JS on interactive islands,
   one stylesheet, inline SVG icons, `content-visibility`-friendly sections, static
   output suitable for CDN edge caching.
5. **Freshness signal** — the live board and period timestamps change every minute;
   wire a real feed and rebuild/revalidate on draw boundaries (see below) to keep
   crawl results current.

## Replacing the simulator with a live feed

`src/lib/simulator.ts` exports the draw types plus `history()`/`drawFor()`. To go live:

1. Implement the same functions against your REST/WS feed (keep the exported types).
2. Or fetch JSON at build time in pages (`fetch` in frontmatter) and rebuild on a cron
   aligned to draw intervals — the static tables update wholesale.
3. The client-side islands (`LiveBoard.astro`) consume only `simulator.ts` helpers, so
   swapping the data source requires no component changes.

## Deployment

Any static host works (Vercel, Netlify, Cloudflare Pages):

- Build command `npm run build`, output directory `dist/`.
- Set the production domain in `astro.config.mjs` (`site`) before building — it drives
  canonicals, OG URLs, JSON-LD `@id`s and the sitemap.
- Add headers for `/og/*` images (`Cache-Control: public, max-age=86400, immutable`).

## Content & compliance notes

- Payout figures are labelled **illustrative**; replace with exact in-app odds.
- 18+ and responsible-gaming notices appear in the footer, guide and FAQ — keep them
  when editing copy.
- Results shown in this build are **simulated demo data** (deterministic, seeded) and
  marked as such on-page; connect a real feed before production use.
