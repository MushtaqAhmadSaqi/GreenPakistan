# ReGongches — "Threads of Mountain Heritage"

**Front-End Static E-Commerce Website & Custom WordPress + WooCommerce Theme Prototype**  
*Prepared for: Mushtaq Ahmad (SP25-BAI-047 | CSC417 | Department of Computer Science, COMSATS)*

---

## 1. Quick Start (Works via `file://` AND Static Server)

- **Double-Click (`file://` protocol):** Open `index.html` directly in any modern browser (Chrome, Firefox, Safari, Edge). Because all product, artisan, region, review, and journal data are loaded via `<script>` tags assigning to `window.RG_DATA` (zero `fetch()` calls to local JSON), the entire store works offline with no CORS or `file://` errors.
- **Local Static Server (optional):**
  ```bash
  cd regongches-static
  python3 -m http.server 8080
  # Open http://localhost:8080
  ```
- **Visual Theme Switcher:** Append `?styles=1` to any URL (e.g., `index.html?styles=1`) or click the **Theme** button in the top announcement bar to switch live between:
  1. `heritage` (Default warm snow, mountain blue `#1F3A5F`, heritage maroon `#7A1F2B`, antique gold `#B8913A`)
  2. `mountain-night` (Cinematic dark mode `#0E1620`, also respects `prefers-color-scheme: dark`)
  3. `minimal-gallery` (High-contrast gallery framing)
  4. `festive` (Rich maroon & gold border edition for Eid and wedding campaigns)

---

## 2. Complete Directory & File Architecture (28 HTML Pages + Modular Assets)

```text
/regongches-static/
├── index.html                  # Home page (15 sections, hero parallax, SVG thread draw)
├── shop.html                   # Full catalogue archive with multi-facet filters & URL sync
├── category.html               # Category archive (?cat=Caps+%26+Headwear)
├── region.html                 # Regional taxonomy archive (?region=hunza) with cultural note
├── product.html                # Single product (?id=1) with Size Buttons, Size Guide & Origin Card
├── cart.html                   # Shopping bag with coupons (THREADS10, WELCOME) & gift wrap
├── checkout.html               # Single-page checkout with Pakistani phone validation & COD rules
├── order-confirmation.html     # Printable A4 order receipt & WhatsApp confirmation link
├── account.html                # My Account demo (Orders, 5-step Tracking Timeline, Mountain Points)
├── wishlist.html               # Saved wishlist items persisted in localStorage
├── search.html                 # Full search results page (?q=)
├── collections.html            # Curated seasonal & event collections index
├── gift-sets.html              # Interactive 3-piece Gift Set Builder + Institutional Quote form
├── custom-orders.html          # Made-to-order bespoke measurement configurator
├── artisans.html               # Filterable directory of partner artisans & guilds
├── artisan.html                # Single artisan profile (?id=artisan-1) + their pieces
├── journal.html                # Cultural Journal blog index
├── journal-post.html           # Single editorial article with TOC & related products
├── our-story.html              # Founder story (Mushtaq Ahmad), Vision, Mission, Roadmap
├── authenticity.html           # 3-Tier Craft Standard (Handmade / Hand-finished / Machine-made)
├── size-guide.html             # Printable cm & inch measurement charts
├── faq.html                    # Searchable FAQ accordion + FAQPage JSON-LD
├── contact.html                # Customer care form, WhatsApp link & studio hours
├── shipping-policy.html        # Nationwide tracked delivery rates & dispatch tiers
├── returns-exchange.html       # 7-day size exchange & transit damage policy
├── privacy.html                # Customer privacy & documented artisan consent policy
├── terms.html                  # Terms of service & academic planning notice
├── 404.html                    # Lost-in-the-mountains illustration & quick recovery links
├── assets/
│   ├── css/
│   │   ├── tokens.css          # Brand colour palette, fluid clamp() typography, spacing, motion
│   │   ├── themes.css          # 4 [data-theme] presets + prefers-color-scheme & reduced-motion
│   │   ├── base.css            # Reset, logical RTL-ready properties, WCAG 2.2 AA focus styles
│   │   ├── layout.css          # Container, sticky header, mega-menus, mobile bar, footer
│   │   ├── components.css      # Buttons, badges, Origin Card, drawers, modals, toasts
│   │   ├── woocommerce.css     # Exact WooCommerce DOM selectors for drop-in theme styling
│   │   ├── pages.css           # Hero, 30-day campaign calendar, shop sidebar, gift builder
│   │   └── print.css           # Clean A4 print layout for order receipts
│   ├── js/
│   │   ├── data/
│   │   │   ├── site-config.js  # Thresholds (PKR 5,000), coupons, city delivery estimates
│   │   │   ├── products.js     # 24 products across all 8 categories (WC field structure)
│   │   │   ├── artisans.js     # 6 artisan profiles marked with [verify] placeholders
│   │   │   ├── regions.js      # 10 districts of Gilgit-Baltistan with cultural notes
│   │   │   ├── reviews.js      # 12 dated customer reviews with Fit sub-scores
│   │   │   └── journal.js      # 6 editorial articles on sizing, wool care, and styling
│   │   ├── data-source.js      # Adapter isolating window.RG_DATA for future WC Store API swap
│   │   ├── cart.js             # Reactive localStorage cart store emitting 'rg:cart:updated'
│   │   ├── wishlist.js         # Wishlist & Recently Viewed persistence
│   │   ├── search.js           # Instant search engine with popular & recent chips
│   │   ├── ui.js               # WP Partial renderers, Quick View, Size Guide modal, Toasts
│   │   ├── motion.js           # IntersectionObserver reveals, counters, rails, parallax
│   │   ├── filters.js          # Pure filter/sort engine synced with URL query string
│   │   ├── product.js          # Single product gallery, size buttons, Origin Card, JSON-LD
│   │   ├── checkout.js         # Cart table, PK phone validator (03XX-XXXXXXX), demo orders
│   │   ├── account.js          # Demo auth, order history, 5-step status tracker, loyalty
│   │   └── main.js             # Global bootstrapper
│   ├── img/                    # Brand SVGs (logo.svg, logo-mark.svg, favicon.svg, icons.svg, gb-map.svg) + 88 local WebP images
│   ├── fonts/                  # Local font-face declarations with editorial & Urdu fallbacks
│   └── vendor/                 # Graceful progressive wrapper for Lenis / GSAP
├── README.md
├── CONVERSION-NOTES.md
└── CREDITS.md
```
