# Yarrwin Production CMS — Implementation Plan

## Current State
- Astro 5.18.2 + Cloudflare adapter + React + TipTap + Tailwind CSS v4
- Brand: Yarrwin, Domain: yarrwin.online
- Build passes, admin login works, seed data applied
- ImageKit upload broken (placeholder keys need regeneration)
- Homepage fully rewritten with 14 sections and ~1000 words SEO content

## Implementation Order

### Phase 1: Inspection & Baseline
- [x] Read all source files
- [x] Run build
- [x] Test admin flow
- [x] Fix branding (all HostingExpert → Yarrwin, all yarrwin.com → yarrwin.online)

### Phase 2: Homepage (Part A)
- [x] Rewrite BaseLayout.astro with typed SEO props (title, description, canonical, image, type, robots, jsonLd, keywords, schema)
- [x] Rewrite index.astro with 14 sections (Hero, QuickAccess, GameCategories, LoginHelp, LotteryResults, ClubRewards, GiftCodeSafety, ScamWarning, HowItWorks, ResponsibleUse, FAQ, LatestPosts, Header, Footer)
- [x] Fix Header.astro nav (Home/Games/Results/Blog/Guide, CTAs: Play Now/Live Results)
- [x] Update Footer.astro with Yarrwin branding (Games/Results/Learn/Legal columns)
- [x] Add FAQSection component with yarrwin.online references
- [x] Add GameCategoriesGrid, HowItWorks, ResponsibleUse, ScamWarning, LoginHelp, ClubRewards, GiftCodeSafety components
- [x] Latest Posts section pulls from D1

### Phase 3: Admin Dashboard (Part B)
- [x] Fix login page (styled login form)
- [x] Fix dashboard page (stats from D1, quick actions grid)
- [x] Fix logout endpoint (session-clearing)
- [x] Posts management (search/filter/bulk/pagination)
- [x] Categories management (CRUD with edit forms)
- [x] Media library (upload grid, search)
- [x] Settings page (site settings form)
- [x] Fix category view links (/category/ not /blog/category/)
- [x] Fix AdminLayout to use Yarrwin branding

### Phase 4: TipTap Editor (Part D)
- [x] Editor already exists as React island with full toolbar
- [x] Create/edit post pages use TipTap editor
- [ ] Verify word/char count display (optional enhancement)

### Phase 5: ImageKit Upload (Part E)
- [x] Auth endpoint exists (/api/imagekit/auth)
- [x] Client upload helper exists (src/lib/imagekit.ts)
- [ ] Fix placeholder keys in .dev.vars (need fresh keys from user)
- [ ] Test upload flow end-to-end

### Phase 6: Public Pages (Part F)
- [x] Blog index works
- [x] Blog posts work (both seeded posts verified)
- [x] Category pages work (all 3 categories)
- [x] Games page works
- [x] Results page works
- [x] Guide page works
- [ ] Pagination verification (if posts exceed page limit)

### Phase 7: Sitemaps (Part I)
- [x] Sitemap index, pages, posts, categories all work
- [x] SITE_URL updated to yarrwin.online
- [x] robots.txt points to yarrwin.online sitemap

### Phase 8: Auth & Security
- [x] PBKDF2 password hashing
- [x] Signed session tokens (HMAC-SHA256)
- [x] Cookie Secure flag (protocol-based)
- [x] parseCookies with decodeURIComponent
- [x] Admin setup endpoint (/api/admin/setup)
- [x] Admin pages redirect to /admin/login when unauthenticated

### Phase 9: Build & Test (Part J/K)
- [x] Production build passes (9.15s)
- [x] All 15 public routes return HTTP 200
- [x] All 12 admin routes return HTTP 200 with correct titles
- [x] API routes work (auth, settings, dashboard stats, posts CRUD, categories CRUD)
- [x] No console errors

## Test Results (Last Run)
### Public Routes
| Route | Status | Size | Title |
|-------|--------|------|-------|
| / | 200 | 167KB | Yarrwin Game, Login Help and Platform Guide |
| /games/ | 200 | 165KB | Yarrwin Games Hub - WinGo, K3 Lottery, 5D & Aviator Rules |
| /results/ | 200 | 287KB | Yarrwin Results - Live & Historical WinGo, K3, 5D Draws |
| /blog/ | 200 | 104KB | Yarrwin Blog - Gaming & Lottery Insights |
| /blog/how-to-check-lottery-numbers-online/ | 200 | 102KB | How to Check Your Lottery Numbers Online |
| /blog/top-5-online-gaming-strategies-beginners/ | 200 | 102KB | Top 5 Online Gaming Strategies for Beginners |
| /guide/how-to-play/ | 200 | 150KB | How to Play on Yarrwin - Beginner's Guide to Safe Gaming |
| /category/gaming-guides/ | 200 | 100KB | Gaming Guides - Yarrwin Blog |
| /category/lottery-results/ | 200 | 100KB | Lottery Results - Yarrwin Blog |
| /category/winner-stories/ | 200 | 98KB | Winner Stories - Yarrwin Blog |
| /sitemap-index.xml | 200 | 471B | N/A |
| /sitemap-pages.xml | 200 | 583B | N/A |
| /sitemap-posts.xml | 200 | 505B | N/A |
| /sitemap-categories.xml | 200 | 645B | N/A |
| /robots.txt | 200 | 92B | N/A |

### Admin Routes (Authenticated)
| Route | Status | Size | Title |
|-------|--------|------|-------|
| /admin/login | Redirect | 0B | Login page |
| /admin/ | 200 | 28KB | Dashboard - Yarrwin Admin |
| /admin/posts/ | 200 | 36KB | Posts - Yarrwin Admin |
| /admin/posts/new | 200 | 45KB | Add New Post - Yarrwin Admin |
| /admin/posts/1/edit | 200 | 49KB | Edit: How to Check Your Lottery Numbers Online |
| /admin/posts/2/edit | 200 | 49KB | Edit: Top 5 Online Gaming Strategies for Beginners |
| /admin/categories/ | 200 | 32KB | Categories - Yarrwin Admin |
| /admin/categories/new | 200 | 30KB | Add New Category - Yarrwin Admin |
| /admin/categories/1/edit | 200 | 38KB | Edit: Lottery Results |
| /admin/categories/2/edit | 200 | 38KB | Edit: Gaming Guides |
| /admin/media/ | 200 | 46KB | Media Library - Yarrwin Admin |
| /admin/settings/ | 200 | 32KB | Site Settings - Yarrwin Admin |

### API Routes
| Route | Status | Notes |
|-------|--------|-------|
| POST /api/auth/login | 200 | Returns session cookie |
| GET /api/auth/me | 200 | Returns user info when authenticated |
| GET /api/dashboard/stats | 200 | Returns post/category/media counts |
| GET /api/settings | 200 | Returns all settings |

## Blockers
1. **ImageKit upload** — `.dev.vars` has placeholder keys; user needs to regenerate fresh ImageKit API keys
2. **Cloudflare deployment** — `wrangler.toml` needs real D1 database_id; Cloudflare Pages secrets need configuration

## Next Steps (If Requested)
1. Polish any visual issues by viewing pages in browser
2. Generate fresh ImageKit keys and test upload flow
3. Configure Cloudflare Pages deployment
4. Add word/char count to TipTap editor
5. Verify pagination behavior when posts exceed page limit
