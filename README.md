# ReGongches — Threads of Mountain Heritage

ReGongches is a zero-build, production-ready luxury editorial e-commerce storefront celebrating authentic traditional clothing, hand-loomed *pattu* textiles, embroidered headwear, and cultural gift boxes from the **7 districts of Gilgit-Baltistan, Pakistan** (`Gilgit`, `Hunza`, `Nagar`, `Ghizer`, `Baltistan (Skardu)`, `Diamer`, and `Astore`).

## Architecture & Modular ES6+ File Structure

```text
regongches-storefront/
├── index.html               # Home storefront (Hero, Marquee, Categories, Curated Rails, Catalogue, Lookbook, 7-District SVG Map, 4 Pillars, 4-Step Authenticity, Gifts, Bespoke, Reviews, Journal, Social, Newsletter)
├── shop.html                # Dedicated 16-product archive with URL-synced multi-facet filters & mobile filter bottom-sheet drawer
├── product.html             # Shareable Product Detail Page (?id=...) with 3-angle hover/tap zoom gallery, Provenance Passport, sticky mobile ATC bar & dynamic Product JSON-LD in PKR
├── collections.html         # Curated themed rails (Gifts for Him, Wedding Season, Under PKR 5,000, Winter Warmth: Pattu, From Hunza) & Lookbook ensembles
├── story.html               # Brand narrative, Founder/Artisan's Pick, 4-Step Authenticity Promise, Partner Guilds & Interactive 7-District Map
├── journal.html             # Cultural Journal & interactive full-essay reader
├── contact.html             # Customer care hub, validated contact form with WhatsApp hand-off, studio coordinates & searchable FAQ
├── 404.html                 # Custom high-altitude 404 page
├── styles.css               # Unified design system (Ivory Daylight & Karakoram Night Mode, WCAG AA, 320px–1920px responsive)
├── storefront-pages.css     # Compatibility stylesheet alias importing styles.css
├── config.js                # SINGLE SOURCE OF TRUTH for phone, WhatsApp, IBAN, wallet, COD limit (PKR 25,000), shipping, promo codes, currency rates & webhook URL
├── data/
│   └── products.js          # 16 products, bespoke 3-angle SVG fallbacks, 3D badge icons, 7 regions, themed rails, curated reviews, journal essays, artisans & FAQs
├── cart.js                  # Safe localStorage store, multi-tab sync, cart maths, non-stacking promo validator, 2-tier progress bar, wishlist & compare
├── checkout.js              # Consistent 3-step checkout (1. Delivery -> 2. Payment -> 3. Review & Confirm) + Confirmation, COD limit enforcer, WhatsApp & webhook hand-off, printable invoice
├── filters.js               # Multi-facet filtering, URL query string sync, mobile filter bottom-sheet drawer & card renderer
├── ui.js                    # Accessible modals/drawers, focus trap, single announcement bar, sequenced storage & newsletter notices, search overlay & honest reviews
├── motion.js                # Desktop-only hero video controller, word-by-word reveal, scroll reveals & prefers-reduced-motion compliance
├── main.js                  # Application bootstrapper & page-specific view builders
├── manifest.webmanifest     # Web app manifest with ReGongches branding
├── sitemap.xml              # Search engine sitemap for https://regongches.store/
├── robots.txt               # Crawler directives
└── assets/
    ├── images/              # 8 WebP brand & product photos
    └── video/
        └── hero-loom.mp4    # Web-safe hero background video (plays on desktop only when reduced-motion is off)
```

## Running Locally

Because the site uses zero build steps, you can open `index.html` directly or serve it locally via Python:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Automated Tests

Run the built-in automated test suite to validate all 80 commerce calculations, promo code thresholds, COD limits, product data integrity, and HTML standards:

```bash
node test_suite.js
```

## Production Deployment & Webhook Setup

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions on:
- Setting up free Formspree or Google Apps Script order logging webhooks.
- Replacing store contact, bank IBAN, and WhatsApp placeholders in `config.js`.
- 1-click deployment to Cloudflare Pages, GitHub Pages, Netlify, or Vercel with custom domain SSL.
