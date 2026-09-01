# Yarrwin Design System — "Midnight Mint"

The single source of truth for every visual decision on yarrwin.com.
Premium fintech-gaming aesthetic: deep-space dark UI, mint "win" accent, glassmorphism
surfaces, monospaced numerics. Built for speed (static HTML), accessibility (WCAG AA)
and SEO (semantic-first markup).

> Unique to Yarrwin by design. Do **not** replicate competitor visuals, layouts or copy.

---

## 1. Brand Personality

- **Precise, fast, trustworthy** — "a Bloomberg terminal for game results".
- Wins are celebrated with **light, not noise** (glows and gradients, never clutter).
- Data is the hero: numbers are always monospaced, tabular, aligned.

## 2. Color System

### Ink — backgrounds (deep space, never pure black)

| Token         | Value     | Usage                                  |
| ------------- | --------- | -------------------------------------- |
| `ink-950`     | `#04070d` | Page background                        |
| `ink-900`     | `#070c16` | Ticker / footer / inset surfaces       |
| `ink-850`     | `#0a111e` | Alternate section background           |
| `ink-800`     | `#0e1626` | Cards, tiles, inputs                   |
| `ink-700`     | `#16223a` | Hover surfaces                         |
| `ink-600`     | `#1f2f4d` | Scrollbar thumb, strong borders        |

### Brand — mint "win" accent (primary actions, positive results)

| Token      | Value     | Usage                             |
| ---------- | --------- | --------------------------------- |
| `brand-200`| `#a9ffe0` | Highlights on dark glass          |
| `brand-300`| `#6df5c4` | Links, eyebrow text               |
| `brand-400`| `#2ee8a8` | Icon strokes, gradients           |
| `brand-500`| `#00d68f` | Primary buttons, live indicators  |
| `brand-600`| `#00b377` | Gradient end, hover states        |
| `brand-700`| `#068a61` | Borders on filled elements        |

### Gold — premium / jackpot highlights (used sparingly: countdowns, "Big" chips, secondary CTA)

`gold-300 #ffdf8f` · `gold-400 #f8c94b` · `gold-500 #dba32b`

### Game result palette (semantic, fixed)

| Color  | Value     | Notes                              |
| ------ | --------- | ---------------------------------- |
| Green  | `#00d68f` | WinGo Green, positive deltas       |
| Red    | `#ff4d5e` | WinGo Red, crash/negative          |
| Violet | `#8b5cf6` | WinGo Violet only                  |

Dual results (0 → Red+Violet, 5 → Green+Violet) use 135° hard-stop gradients,
never blending.

### Mist — text scale (AA contrast on ink-950 minimum)

`mist-100 #eef2f9` headings · `mist-200 #d7deeb` body · `mist-300 #b3c0d6`
secondary · `mist-400 #8797b3` meta · `mist-500 #64728f` faint · `mist-600 #47536e`
disabled. **Never** use text darker than mist-400 for body copy.

## 3. Typography

| Role     | Font stack                          | Notes                                  |
| -------- | ----------------------------------- | -------------------------------------- |
| Display  | `Sora` (600/700/800)                | H1–H4, buttons, prices. `-0.02em` tight |
| Body     | `Inter` (400/500/600)               | 16px base, 1.6 line-height             |
| Numeric  | `JetBrains Mono` (500/600/700)      | Periods, results, timers — `.num` utility with tabular figures |

Scale: H1 `text-4xl → 6xl`, H2 `text-3xl → 4xl`, H3 `text-xl`, eyebrow `text-xs uppercase tracking-[0.18em]`.
Headings use `text-wrap: balance`; paragraphs `text-wrap: pretty`.

## 4. Surfaces & Glassmorphism

Two sanctioned recipes (in `global.css` as `@utility`):

- **`.glass`** — light glass: `linear-gradient(155°, white 5.5% → 2% → 3.5%)`,
  `1px white/9` border, `blur(18px) saturate(140%)`. Use on cards over glow orbs.
- **`.glass-deep`** — deep glass: ink-800 → ink-900 at 78–86% opacity,
  `1px white/8` border, `blur(22px) saturate(150%)`. Use on floating panels
  (header pill, live board, mobile menu).

Rules: radius `rounded-3xl` (24px) for cards, `rounded-full` for pills/buttons.
One glass layer per region — never nest glass on glass without an ink spacer.

## 5. Depth & Glow

- `shadow-glow-brand` / `shadow-glow-gold` — 1px tinted ring + 40px colored bloom.
  Reserve for primary CTAs, logo mark, active tabs, live balls.
- `shadow-card` — inset top highlight + deep drop. Default card elevation.
- Background orbs: 600–900px radial gradients of brand/violet at 5–10% opacity,
  `blur(120px)`, absolutely positioned, `pointer-events-none`, `aria-hidden`.
- Optional `.grid-bg`: 44px grid lines at 4% white, radial-masked. Hero only.

## 6. Layout & Spacing

- Container: `.container-site` → `max-w-7xl`, 16/24/32px responsive gutters.
- Section rhythm: `.section-pad` → `py-16 md:py-24`.
- Cards: `p-5 p-6` content padding, `gap-4 gap-6` grid gaps. Never arbitrary padding.
- Hero top padding accounts for the fixed pill header: `pt-32 md:pt-40`.

## 7. Motion

Tokens (`--animate-*`): `marquee` 55–60s linear · `pulse-soft` 2.4s ·
`rise` (18px, 0.7s, ease-out-quint) · `pop` (scale .8, spring) · `float` 7s ·
`count` (8px drop, 0.5s).

Rules:
1. Animate **transform & opacity only** (GPU-safe).
2. One ambient animation per viewport region (marquee **or** float **or** pulse).
3. Results updates always use `animate-pop`/`animate-count` — never blinking.
4. `prefers-reduced-motion: reduce` kills all animation globally (enforced in CSS).

## 8. Iconography

Inline SVG only (no icon fonts, no images) via `Icon.astro` — 24×24, 1.8 stroke,
round caps, `currentColor`, `aria-hidden`. Size with Tailwind (`h-5 w-5`).
Never mix filled and outline styles in one component.

## 9. Result Visuals

- `.ball` — 44px circular result with mono digit; tone classes
  `ball-green/red/violet/dual-red/dual-green/ink`.
- `.die` — 36px K3 dice tile. `.digit-tile` — 5D digit slot.
- `.chip` — 24px-high pill label; `chip-green/red/violet/gold/neutral` tones.
- `.dot` — 10px status dot for colour legends and LIVE indicators.

## 10. Accessibility (non-negotiable)

- Skip link first in `<body>`; single `<h1>` per page; logical heading order.
- Tables: `<caption class="sr-only">`, `<th scope="col">`.
- Tabs: `role="tablist"/tab/tabpanel`, `aria-selected`, arrow-key optional, deep-link via hash.
- Focus: `:focus-visible` 2px brand outline with 2px offset.
- Touch targets ≥ 44px; text contrast ≥ 4.5:1 (AA).

## 11. SEO-Facing UI Rules

- One `<h1>` containing the page's primary keyword; section `<h2>`s target
  long-tail queries ("WinGo results", "K3 lottery rules").
- Key numbers server-rendered in HTML (never JS-only) so crawlers see results.
- FAQ blocks rendered as real text + matching `FAQPage` JSON-LD.
- Images decorative → `aria-hidden`; no text baked into images except OG cards.

## 12. Don'ts

- No pure black (`#000`) backgrounds, no pure white text walls.
- No neon oversaturation: glows max 35% alpha, orbs max 10% alpha.
- No emoji as UI icons; no autoplaying audio/video; no layout-shifting animations.
- No fake scarcity or misleading payout claims — payouts are labelled illustrative.
