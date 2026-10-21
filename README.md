# ReGongches — Threads of Mountain Heritage

ReGongches is a zero-build, production-ready luxury editorial e-commerce storefront celebrating authentic traditional clothing, hand-loomed *pattu* textiles, embroidered headwear, and cultural gift boxes from the **7 districts of Gilgit-Baltistan, Pakistan** (`Gilgit`, `Hunza`, `Nagar`, `Ghizer`, `Baltistan (Skardu)`, `Diamer`, and `Astore`).

---

## 1. World-Class Luxury UI & UX Benchmarks

Inspired by top-tier heritage and fashion houses (**Aimé Leon Dore**, **Bode New York**, **Toast UK**, **Loewe**, and **Awwwards Site of the Day** winners), ReGongches introduces thoughtful, tactile e-commerce micro-interactions:

1. **Tactile "Add to Bag" State (`.btn-added-state`):** Instant, haptic visual feedback inline on buttons (`✓ Added to Bag` with gold shimmer pulse) paired with a spring-physics bounce (`@keyframes badgeBounce`) on header bag badges without jarring screen jumps.
2. **Weave Inspection & Image Zoom (`.card-inspect-pill`):** Silky image hover cross-fade with smooth scale transition (`1.02` → `1.045`) revealing macro weave details alongside a frosted-glass inspection badge.
3. **Archival Collector Unboxing Presentation (`.cart-unboxing-card`):** Highlighting the physical delivery experience inside the Cart Drawer—our debossed midnight-blue presentation box, mountain cedar shavings, brass-sealed wax certificate, and calligraphed origin card.
4. **Universal Responsive Sticky Action Bar (`.pdp-sticky-bar`):** Discreet floating bar sliding in from the bottom when scrolling past the main buy box, offering thumbnail preview, selected size, price, and 1-tap purchase.
5. **Smart VIP Studio Concierge Desk (`.concierge-card`):** Floating WhatsApp widget featuring 1-tap pre-composed consultation prompts for custom tailoring, fabric warmth, regional COD verification, and wedding commissions.
6. **Archival Memory Trail:** Seamless "Recently Examined Pieces" carousel rendered across PDP and catalog archives powered by reactive `localStorage` subscriptions.

---

## 2. Complete 15-Page Architecture

```text
d:\E-comerence\
├── index.html               # Home storefront (Hero, Marquee, Categories, Lookbook, 7-District Map, Authenticity, Reviews)
├── shop.html                # 16-product archive with URL-synced multi-facet filters & mobile drawer
├── product.html             # Shareable PDP with 3-angle gallery, Provenance Passport, Sticky Bar & Schema.org JSON-LD
├── collections.html         # Curated themed rails (Gifts for Him, Wedding Season, Under PKR 5,000, Winter Warmth)
├── story.html               # Brand narrative, Founder/Artisan's Pick, 4-Step Authenticity Promise & Partner Guilds
├── journal.html             # Cultural Journal & interactive full-essay reader
├── contact.html             # Studio concierge, contact form with WhatsApp hand-off & searchable FAQ
├── track-order.html         # Live order tracker (sample: RG-DEMO101), 5-stage timeline & courier portal links
├── size-guide.html          # Interactive cm/inches unit toggle, Quick Fit Finder & printable cheat sheet
├── care.html                # Highland wool 3 golden rules, cold soak & dry protocol, cedar storage & stain matrix
├── shipping.html            # 13-city courier rates, transit days schedule, free delivery threshold & partner badges
├── exchanges.html           # 14-day exchange promise, WhatsApp roadmap & reverse courier pickup terms
├── privacy.html             # Honest zero-tracker disclosure, full localStorage keys table & 1-tap browser data reset
├── terms.html               # Handmade craft variations disclaimer, official PKR settlement & COD limits
├── 404.html                 # Mountain pass closed hero, dedicated archive search form & popular heritage chips
├── styles.css               # Unified design system (Daylight Ivory & Karakoram Night Mode, WCAG AA, 320px–1920px)
├── config.js                # SINGLE SOURCE OF TRUTH (WhatsApp, IBAN, wallet, COD ceiling, transit rates, promos)
├── data/
│   └── products.js          # 16 products, 3-angle SVG fallbacks, 3D icons, 7 regions, journal essays, artisan bios
├── cart.js                  # Reactive state, cart maths, non-stacking promos, 2-tier reward bar, wishlist & compare
├── checkout.js              # 3-step checkout (Delivery -> Payment -> Confirm), COD limit enforcer & WhatsApp hand-off
├── filters.js               # Multi-facet filtering, URL query string sync, mobile filter drawer & card renderer
├── ui.js                    # Modals, focus trap, announcement bar, sequenced notices, search overlay & concierge
├── motion.js                # Desktop-only hero video controller, scroll reveals & prefers-reduced-motion compliance
├── main.js                  # Unified application bootstrapper & page view builders
├── manifest.webmanifest     # Web app manifest with ReGongches branding
├── sitemap.xml              # Search engine sitemap indexing all 15 pages and 16 product deep links
├── robots.txt               # Crawler directives
└── test_suite.js            # Automated verification test suite (153 checks across 8 suites)
```

---

## 3. Running Locally

Because the storefront uses zero build tools or bundlers, you can serve it locally using any static web server:

```powershell
python -m http.server 8080
```

Then navigate to `http://localhost:8080`.

---

## 4. Automated Verification Test Suite

Run the built-in automated test suite to validate all 153 checks:

```powershell
node test_suite.js
```

### Verified Test Suites:
- **Suite 1:** Config & Data Integrity (Single source of truth, 16 products, zero placeholders)
- **Suite 2:** Commerce & Promo Calculations (Maths, non-stacking promos, COD ceilings, gift wrap)
- **Suite 3:** Checkout Protection Logic (Blocks placeholder banking & wallets)
- **Suite 4:** HTML Structure & Noscript Audit (All 15 HTML pages verified for UTF-8, viewport, styles, and noscript)
- **Suite 5:** Sitemap & PWA Audit (Valid sitemap, manifest, and icons)
- **Suite 6:** Multi-Facet Filter & Card Architecture (CLS prevention, case-insensitive region matchers, swatches)
- **Suite 7:** Product Detail & Provenance Engine (JSON-LD BreadcrumbList, Provenance Passport, city delivery estimator)
- **Suite 8:** Luxury UI/UX & Standalone Policy Pages Audit (Badge bounce, tactile button states, sticky bars, unboxing cards, policy tables)

---

## 5. Deployment & Production Readiness

Consult [DEPLOYMENT.md](DEPLOYMENT.md) for instructions on:
1. Setting up backend order logging via Formspree or Google Apps Script.
2. Updating production WhatsApp numbers and bank IBAN in `config.js`.
3. Deploying to Cloudflare Pages, GitHub Pages, Netlify, or Vercel.
