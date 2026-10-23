# ReGongches Upgrade Audit Report

**Date:** 2026-10-22  
**Project:** ReGongches — Threads of Mountain Heritage  
**Scope:** Comprehensive Front-End, UX, Copywriting & Technical Audit across all 28 HTML files, 8 CSS stylesheets, and 17 JavaScript files.

---

## 1. Executive Summary

The ReGongches static e-commerce prototype features a solid foundational architecture with clean separation of concerns, semantic HTML5 with WooCommerce-ready selectors (`ul.products > li.product`, `.woocommerce-product-gallery`, `.site-header`, `.site-footer`), and zero external API dependencies (fully offline-compatible under `file://`).

However, the audit revealed several critical upgrade requirements across four major areas:
1. **Copywriting & Voice:** Widespread use of boilerplate newsletter headings ("Threads of the North Letter"), generic welcome messages, weak CTAs ("Explore Shop"), formulaic numbered product descriptions, outdated catalogue counts referencing 24 pieces instead of the target 25-product catalogue, and minor copy discrepancies against the master brief.
2. **Missing Media & Assets:** 4 missing banner image references triggering 404 console errors (`assets/img/banners/rg-hero-hunza-2026.webp`, `assets/img/banners/rg-banner-cap-2026.webp`, `assets/img/banners/rg-banner-loom-2026.webp`), and product image paths reflecting old/temporary catalogue items.
3. **Product Data Structure:** The existing `products.js` data file contains an earlier set of sample products with non-standard uppercase `specs` keys (`SKU`, `District of Origin`, etc.) and structured templates rather than the fluid editorial standard specified in Section 6.1 and 6.2.
4. **Interactive Features & UX Depth:** Several advanced UX features (e.g. wool-to-wear before/after slider, compare tray, product magnifier lens enhancements, cap size finder interactive mode with visual band, smooth page transitions, and quick view interactions) need full implementation and refinement.

---

## 2. Generic, Placeholder, and Weak Copy Audit

### 2.1 Newsletter & Footer Across All 28 HTML Pages
All 28 HTML files currently use a legacy newsletter title and generic confirmation text instead of the on-brand "Letters from the North" copy specified in Section 3.2.

| File | Line(s) | Existing Text | Issue / Recommended Replacement |
|---|---|---|---|
| `index.html` | 1011, 1013, 1019 | `<span class="rg-badge">Threads of the North Letter</span>`, `Join the Threads of the North letter.`, `data-rg-demo-form="Welcome to the Threads of the North letter! (Demo subscription saved)"` | Replace with Section 3.2 standard: "Letters from the North" / "New collections, maker stories and care tips, about twice a month. No spam, unsubscribe anytime." Button: "Subscribe". Success toast: "You're in. Your first letter arrives with our next collection." |
| `shop.html` | 711, 713, 719 | Same legacy newsletter component | Same replacement as above |
| `category.html` | 711, 713, 719 | Same legacy newsletter component | Same replacement as above |
| `region.html` | 714, 716, 722 | Same legacy newsletter component | Same replacement as above |
| `product.html` | 574, 576, 582 | Same legacy newsletter component | Same replacement as above |
| `cart.html` | 548, 550, 556 | Same legacy newsletter component | Same replacement as above |
| `checkout.html` | 681, 683, 689 | Same legacy newsletter component | Same replacement as above |
| `order-confirmation.html` | 544, 546, 552 | Same legacy newsletter component | Same replacement as above |
| `account.html` | 635, 637, 643 | Same legacy newsletter component | Same replacement as above |
| `wishlist.html` | 548, 550, 556 | Same legacy newsletter component | Same replacement as above |
| `search.html` | 710, 712, 718 | Same legacy newsletter component | Same replacement as above |
| `collections.html` | 590, 592, 598 | Same legacy newsletter component | Same replacement as above |
| `gift-sets.html` | 617, 619, 625 | Same legacy newsletter component | Same replacement as above |
| `custom-orders.html` | 590, 592, 598 | Same legacy newsletter component | Same replacement as above |
| `artisans.html` | 560, 562, 568 | Same legacy newsletter component | Same replacement as above |
| `artisan.html` | 544, 546, 552 | Same legacy newsletter component | Same replacement as above |
| `journal.html` | 559, 561, 567 | Same legacy newsletter component | Same replacement as above |
| `journal-post.html` | 545, 547, 553 | Same legacy newsletter component | Same replacement as above |
| `our-story.html` | 610, 612, 618 | Same legacy newsletter component | Same replacement as above |
| `authenticity.html` | 575, 577, 583 | Same legacy newsletter component | Same replacement as above |
| `size-guide.html` | 579, 581, 587 | Same legacy newsletter component | Same replacement as above |
| `faq.html` | 589, 591, 597 | Same legacy newsletter component | Same replacement as above |
| `contact.html` | 602, 604, 610 | Same legacy newsletter component | Same replacement as above |
| `shipping-policy.html` | 551, 553, 559 | Same legacy newsletter component | Same replacement as above |
| `returns-exchange.html` | 550, 552, 558 | Same legacy newsletter component | Same replacement as above |
| `privacy.html` | 549, 551, 557 | Same legacy newsletter component | Same replacement as above |
| `terms.html` | 549, 551, 557 | Same legacy newsletter component | Same replacement as above |
| `404.html` | 557, 559, 565 | Same legacy newsletter component | Same replacement as above |

### 2.2 Hardcoded Legacy Catalogue Counts ("24 Pieces")
The navigation menus, mobile drawer, and hero sections across all pages reference 24 products from the prototype phase. These must be updated to 25 products.

- **Primary Navigation Mega Menu (`ul.menu`):**
  - Line 174 in all 28 HTML files: `<li><a href="shop.html">View All Catalogue (24)</a></li>` -> Update to `(25)`
- **Mobile Menu Drawer (`#rg-mobile-menu-drawer`):**
  - Line 338 (or corresponding line in sub-pages): `<li><a href="shop.html">Shop All Catalogue (24)</a></li>` -> Update to `(25)`
- **Home Page (`index.html`):**
  - Line 540: `View All 24 Pieces →` -> Update to `View All 25 Pieces →`
  - Line 633: `24 Documented Heritage Pieces` -> Update to `25 Documented Heritage Pieces`
- **Shop & Category Page headers (`shop.html`, `category.html`, `search.html`, `region.html`):**
  - Filter counter captions referencing 24 pieces -> dynamically update from `window.RG_DATA.products.length`.

### 2.3 Home Page Section Headings & Hero Copy Discrepancies (`index.html`)

| Section | Current Copy (index.html) | Section 3.2 Specified Copy |
|---|---|---|
| **Hero Eyebrow** | `Authentic Craft from Gilgit-Baltistan` (line 511) | `From the valleys of Gilgit-Baltistan` |
| **Hero H1** | `Threads of Mountain Heritage` (line 512) | `Threads of Mountain Heritage` (Matches) |
| **Hero Subline** | `Authentic traditional clothing and craftsmanship from Gilgit-Baltistan—every piece documented with its valley of origin, material composition, exact centimetre sizing, and artisan story.` (line 513–515) | `Traditional clothing, shawls and caps made by artisans in Hunza, Gilgit, Skardu and beyond, with the maker, material and origin shown on every piece.` |
| **Hero CTAs** | `Shop the Collection` · `Meet the Artisans` (line 517–518) | `Shop the collection` · `Meet the makers` |
| **Hero Trust Row** | `✓ Verified Valley Origin · ✓ Size Guidance in cm & inches · ✓ Nationwide Tracked Delivery · ✓ Cash on Delivery Available` (line 521–527) | `Origin shown on every product · Size guidance for every fit · Tracked delivery across Pakistan · Cash on Delivery` |
| **Categories** | `Explore by Category` / `Focused Regional Catalogue` (line 537–538) | `Shop by craft` / `Eight traditions of cloth, from everyday caps to wedding wear.` |
| **New Arrivals** | `New from the Mountains` / `Fresh off the Valley Looms` (line 584–585) | `New from the mountains` / `The latest pieces from our workshops, photographed and measured before they reach the shop.` |
| **Origin Promise** | `Every Piece Answers Four Essential Questions` / `Our Core Standard` (line 601–602) | `Four answers on every product` / `Who made it. Where it's from. What it's made of. What it means.` |
| **Shop by Region** | `Shop by Region of Origin` / `10 Districts · Distinct Valley Traditions` (line 644–645) | `Every valley has its own hand` / `Explore pieces by the district they come from.` |
| **Scroll Story** | `From Mountain Wool to Wearable Heritage` / `Craft Process` (line 707–708) | `From wool to wear` / Steps: `Shearing and spinning`, `Weaving the cloth`, `Embroidery by hand`, `Finishing and quality check` (each 2 sentences) |
| **Wedding Rail** | `Selected Edit 01` / `For the Wedding & Nikkah Season` (line 741) | `For the wedding season` / `Caps, waistcoats and embroidered pieces for mehndi, nikah and walima.` |
| **Winter Rail** | `Selected Edit 02` / `Winter Warmers` (line 749) | `Winter warmers` / `Dense sheep wool and hand-woven shawls for cold mornings.` |
| **Gifts Rail** | `Selected Edit 03` / `Meaningful Gifts Under PKR 3,000` (line 757) | `Gifts under PKR 3,000` / `Small pieces with a big story.` |
| **Gift Sets Banner** | `B2C & Institutional Gifting` / `Heritage Gift Sets & University / Corporate Orders` (line 838–839) | `Give something with a place behind it` / `Curated heritage gift sets, gift-wrapped, with an authenticity card explaining where each piece comes from.` |
| **Institutional** | `B2C & Institutional Gifting` | `Gifting for universities, hotels and companies` / `Branded cards, bulk pricing and delivery planning for orders of 20 or more. Request a quote.` |
| **Founder's Pick** | `Founder's Personal Recommendation` (line 857) | `Founder's pick` / First-person note from Mushtaq Ahmad [placeholder — founder to approve] |
| **Reviews Heading** | `What Customers Across Pakistan Say` (line 880) | `What our customers say` |
| **Journal Heading** | `Stories, Sizing & Care` / `From the Cultural Journal` (line 890–891) | `The Cultural Journal` / `Care guides, styling notes and the stories behind the stitches.` |

### 2.4 Weak CTAs and Microcopy in JavaScript
- `assets/js/main.js` line 527: `Explore Shop` -> Update to "Explore the collection" or direct to caps.
- `assets/js/ui.js` toast messages: update to exact microcopy specified in Section 3.2.
- `assets/js/cart.js` & `checkout.js`: ensure delivery threshold microcopy matches: `"You're {PKR x} away from free delivery."` / `"You've unlocked free delivery."`

---

## 3. Media, Broken Links, and Image Audit

### 3.1 Broken Links
- **Internal HTML Links:** 0 broken links. All 28 pages exist and cross-link with valid URLs (`index.html`, `shop.html`, `category.html`, `region.html`, `product.html`, `cart.html`, `checkout.html`, `order-confirmation.html`, `account.html`, `wishlist.html`, `search.html`, `collections.html`, `gift-sets.html`, `custom-orders.html`, `artisans.html`, `artisan.html`, `journal.html`, `journal-post.html`, `our-story.html`, `authenticity.html`, `size-guide.html`, `faq.html`, `contact.html`, `shipping-policy.html`, `returns-exchange.html`, `privacy.html`, `terms.html`, `404.html`).

### 3.2 Missing Image Assets
The following 4 image paths are referenced in HTML markup but do not exist on disk, generating HTTP 404 network errors in the browser:
1. `assets/img/banners/rg-hero-hunza-2026.webp` (referenced in `index.html` line 505)
2. `assets/img/banners/rg-banner-cap-2026.webp` (referenced in `index.html` line 778, `our-story.html` line 482)
3. `assets/img/banners/rg-banner-loom-2026.webp` (referenced in `our-story.html` line 474)

*Action required in Phase 6:* Create directory `assets/img/banners/`, generate/provide high-fidelity 2400×1350 banners matching the master style guide, and ensure fallback references (`assets/img/hero-mountains.webp`, `assets/img/craft-weaving.webp`, `assets/img/heritage-flatlay.webp`) remain intact.

### 3.3 Alt Text Quality
- All `<img>` tags currently include `alt` attributes (no empty `alt=""` where informative text is needed).
- However, product gallery images must explicitly describe the view and colour according to Section 6.2 (e.g. `"Charcoal Gilgiti cap, side view showing the hand-rolled brim"`).

---

## 4. Product Data Structure Audit

### 4.1 Current Schema (`assets/js/data/products.js`)
The existing file holds 25 legacy prototype products. Its schema is:
```javascript
{
  "id": 1,
  "slug": "traditional-gilgiti-cap",
  "name": "Traditional Gilgiti Cap (Hand-Woven Patti)",
  "sku": "RG-CAP-001",
  "categories": ["Caps & Headwear"],
  "region": "Gilgit",
  "district": "Gilgit Central [verify]",
  "price": 1800,
  "regular_price": 1800,
  "sale_price": null,
  "currency": "PKR",
  "images": [
    { "src": "...", "alt": "...", "caption": "Illustrative image", "colour": "Snow Wool (#F7F4EE)" }
  ],
  "short_description": "...",
  "description": "...",
  "description_html": "<p><strong>1. What It Is &amp; Who It Is For:</strong> ...",
  "attributes": { "size": [...], "unavailable_sizes": [...], "colour": [...], "material": [...] },
  "craft_type": "handmade",
  "availability": "ready",
  "stock_status": "instock",
  "stock_quantity": 18,
  "dispatch_days": [1, 2],
  "artisan_id": "artisan-2",
  "technique": "...",
  "care": [...],
  "cultural_story": "... [verify with regional reviewer]",
  "verified": true,
  "occasions": [...],
  "customisable": true,
  "size_guide_type": "cap",
  "rating": 4.9,
  "review_count": 34,
  "tags": [...],
  "is_new": true,
  "featured": true,
  "date_added": "2026-09-15",
  "highlights": [...],
  "specs": {
    "SKU": "RG-CAP-001",
    "District of Origin": "Gilgit Central [verify]",
    "Craft Classification": "Handmade",
    "Technique": "...",
    "Material Composition": "...",
    "Available Sizes": "...",
    "Time to Make": "...",
    "Dispatch Window": "..."
  },
  "faqs": [...],
  "pairs_with": [2, 3, 4],
  "seo": { "title": "...", "meta_description": "..." }
}
```

### 4.2 Gaps vs Section 6.1 & 6.2 Requirements
1. **Product Catalogue Mismatch:** Existing products include items that are not in the 25-product brief (e.g. `baltistani-velvet-trimmed-dress`, `nagar-hand-knitted-patterned-wool-socks`, `diamer-woven-geometric-belt`, `gilgit-silver-feather-cap-brooch`, `ghanche-handspun-wool-throw`). These must be completely replaced with the 25 specific products enumerated in Section 6.
2. **`specs` Object Format:** Section 6.1 specifies lowercase specification keys:
   `specs: { material, technique, dimensions, weight, lining, closure }`
   Currently, the prototype uses uppercase strings (`"SKU"`, `"District of Origin"`, `"Craft Classification"`, etc.).
3. **`description_html` Format:** Section 6.2 specifies 170–250 words in 4 short editorial paragraphs (origin & what it is; how it's made: materials & technique; feel, fit & styling; quality check, sizing & handmade variation). The current files use formulaic bold numbered headers (`1. What It Is &amp; Who It Is For:`, etc.).
4. **Cultural Story Honesty:** All cultural stories must end with `[verify with regional reviewer]`, and artisan references must remain `[ARTISAN NAME — verify]`.
5. **Exact Occasions & Attributes:** Assign exact sizes, colours, occasions (Wedding, Eid, Cultural event, Everyday, Gift, Winter), 6 marked as `is_new`, 6 as `featured`, exactly 3 with `sale_price`, and ratings between 4.3 and 4.9.

---

## 5. User Experience, Interactivity & Accessibility Audit

1. **Live Search:** Works well, but keyboard navigation (Arrow Down, Arrow Up, Enter) and matching substring highlighting require enhancement.
2. **Cap Size Finder:** Currently features an HTML5 range slider in the modal. Needs a dual cm/inch interactive toggle, visual headband graphic indicator, and "I don't have a tape" guidance tips.
3. **Product Compare Tray:** Needs a persistent sticky tray allowing up to 3 products to be compared side-by-side on Material, Origin, Craft Type, Dispatch, and Price.
4. **Before/After Wool-to-Wear Slider:** An interactive comparison slider (Raw Fleece vs Finished Hand-Woven Shawl) needs to be integrated into `index.html` and `authenticity.html`.
5. **Journal Reading Progress:** Journal articles need the top "thread" progress indicator.
6. **Smooth Transitions & Reduced Motion:** All animations must strictly honor `prefers-reduced-motion: reduce`.

---

## 6. Implementation Action Plan

- **Phase 2:** Complete Copy Rewrite across all pages, 6 comprehensive Journal articles (600–900 words), microcopy overhaul, and SEO metadata update.
- **Phase 3:** Interactivity enhancements: live search highlighting & keyboard navigation, Cap Size Finder with cm/inch toggle and visual band, Compare Tray (up to 3 products), Before/After wool slider, Magnifier lens enhancement, Sticky add-to-cart, Gift quiz, and Testimonial marquee.
- **Phase 4:** Visual layout refinements (asymmetric editorial sections, spacing consistency).
- **Phase 5 & 6:** Replace the product catalogue with the exact 25 products from Section 6, create clean WebP/SVG images and prompt documentation (`/docs/IMAGE-PROMPTS.md`, `/docs/IMAGE-REPLACEMENT.md`).
- **Phase 7:** Final QA verification, `/docs/CHANGELOG.md`, and `/docs/VERIFY-LIST.md`.
