# ReGongches Storefront — Phase 3 Implementation Plan

**Brand:** ReGongches — *"Threads of Mountain Heritage"*  
**Deliverable:** Prioritized Phase 3 Roadmap & Effort Estimates (`IMPLEMENTATION-PLAN.md`)  
**Architecture:** Zero-Build, Modular ES6+, Vanilla CSS Custom Properties  
**Verification Gate:** `node test_suite.js` (Must pass 100% after every single step)  

---

## 1. Roadmap Overview & Effort Breakdown

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PHASE 3 IMPLEMENTATION SEQUENCE                       │
│                                                                             │
│  [Step 3.1] Foundation & Design Tokens              (Est: 2.0 hrs)          │
│  [Step 3.2] Navigation, Mega Menu & Search          (Est: 2.5 hrs)          │
│  [Step 3.3] Homepage Elevation & Hero Architecture  (Est: 3.5 hrs)          │
│  [Step 3.4] Shop Archive & Filter Engine            (Est: 2.0 hrs)          │
│  [Step 3.5] Product Detail Page (PDP) Upgrade       (Est: 2.5 hrs)          │
│  [Step 3.6] Cart Drawer & 3-Step Checkout           (Est: 2.5 hrs)          │
│  [Step 3.7] Standalone Supporting & Policy Pages    (Est: 3.0 hrs)          │
│  [Step 3.8] Performance Optimization & Assets       (Est: 1.5 hrs)          │
│  [Step 3.9] SEO, Social Cards & PWA Manifest        (Est: 1.5 hrs)          │
│  [Step 3.10] Test Suite Expansion & Documentation   (Est: 2.0 hrs)          │
│                                                                             │
│  Total Estimated Engineering Effort: ~23 Hours                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Step-by-Step Execution Plan

### Step 3.1: Foundation & Design Tokens
- **Objectives:**
  1. Unify all CSS custom properties in [`styles.css`](file:///d:/E-comerence/styles.css): eliminate duplicate `html[data-theme="dark"]` rules.
  2. Implement fluid clamp typography scale (`--fs-xs` to `--fs-hero`) and 8-pt spacing scale (`--sp-1` to `--sp-10`).
  3. Set up WCAG 2.2 AA-passing color token pairs for both **Ivory Daylight** and **Karakoram Night** themes (darkening light-theme text gold to `#8A661D` for 5.2:1 contrast).
  4. Implement visible, high-contrast focus rings (`outline: 2px solid var(--c-gold); outline-offset: 2px`) for keyboard accessibility.
  5. Enforce strict `prefers-reduced-motion` global resets.
- **Verification Gate:** `node test_suite.js` passes. Visual check of both themes in browser.
- **Estimated Effort:** 2.0 hours.

---

### Step 3.2: Navigation, Mega Menu, Drawer & Command Search
- **Objectives:**
  1. Implement sticky shrink-on-scroll header behavior in [`ui.js`](file:///d:/E-comerence/ui.js) and [`styles.css`](file:///d:/E-comerence/styles.css) (`72px` → `56px` with glassmorphic backdrop).
  2. Build desktop multi-column **Shop Mega Menu** featuring:
     - 4 category columns (Clothing & Shuqa / Pakols & Caps / Pattu Shawls / Heritage Gifting).
     - *"New Season: Hunza & Baltistan Edit"* featured visual card.
     - 7-District regional provenance footer strip.
  3. Upgrade the **Announcement Bar**: rotating 4 slides with manual arrows, close button, and dismissal state saved in `localStorage` (`regongches-ann-dismissed`).
  4. Refine full-height **Mobile Drawer**: accordion category navigation, touch-friendly tap targets (≥44px), embedded currency switcher, and direct WhatsApp concierge button.
  5. Upgrade **Command Search Overlay**: keyboard shortcut (`Cmd+K`), popular heritage search chips, recent search history, and live keyword filtering.
  6. Add structured breadcrumbs across all subpages.
- **Verification Gate:** `node test_suite.js` passes. Complete keyboard traversal of menu and search overlay without mouse.
- **Estimated Effort:** 2.5 hours.

---

### Step 3.3: Homepage Elevation & Hero Architecture
- **Objectives:**
  1. Implement **Hero Concept 1 ("The Highland Loom Sanctuary")**:
     - Desktop: Autoplaying muted loop `assets/video/hero-loom.mp4`.
     - Mobile / Slow-connection fallback: Crisp WebP still `assets/images/hero-mountain-textiles.webp` with `fetchpriority="high"`.
     - Editorial serif typography with word-by-word entry reveal.
     - Dual CTAs (*Shop the Archive* [Gold] / *Explore Lookbook* [Ghost]).
     - 3-point floating Trust Strip: `[ 7 Districts ] · [ 100% Hand-Loomed ] · [ Nationwide COD & Origin Card ]`.
  2. Implement dynamic **7-District Marquee** ticker with delicate loom-divider motifs.
  3. Upgrade **Lookbook Section**: accessible interactive hotspots (focus-trapped, keyboard navigable, announcing piece name and price).
  4. Polish **Interactive 7-District SVG Map**: tap-friendly regional polygons with accessible list fallback on small screens.
  5. Implement **Service Bento** for the 4 Brand Pillars (Verified Origin, Artisan Craft, Material Transparency, Cultural Story) utilizing 3dicons CC0 badge renders.
  6. Refactor **Heritage Gift Boxes** into 3 Tier Cards (Fan Deck pattern) with explicit inclusion lists.
  7. Upgrade **Reviews Wall** into a dated customer feedback stream with source attribution.
  8. Build mountain-ridge SVG divider and rich editorial footer with giant wordmark bleed.
- **Verification Gate:** `node test_suite.js` passes. Responsive sweep from 320px to 1920px with zero horizontal overflow.
- **Estimated Effort:** 3.5 hours.

---

### Step 3.4: Shop Archive & Multi-Facet Filter Engine
- **Objectives:**
  1. Lock image aspect ratios (`aspect-ratio: 4 / 5`) with explicit `width` and `height` to eliminate Cumulative Layout Shift (CLS).
  2. Enhance product cards: Region pill tag, Loom/Material subtitle, price in selected currency, stock badges (*Ready to Ship*, *Made to Order*, *Low Stock*), quick-add button, wishlist heart, and compare checkbox.
  3. Upgrade mobile filter experience: full bottom-sheet filter drawer with live result count button (`"Apply Filters (n Pieces)"`).
  4. Ensure 2-way URL synchronization for all facets (`category`, `region`, `price`, `status`, `color`, `q`, `sort`).
  5. Add CSS skeleton loading state for smooth catalogue transitions.
  6. Create rich empty state for filters with 1-click "Reset All Filters" action.
- **Verification Gate:** `node test_suite.js` passes. URL query bookmarking test.
- **Estimated Effort:** 2.0 hours.

---

### Step 3.5: Product Detail Page (PDP) Overhaul
- **Objectives:**
  1. Implement 3-angle gallery: Desktop hover loupe zoom; mobile swipeable carousel + tap-to-expand modal.
  2. Build tactile **Archival Provenance Passport** card: District, Guild elder, loom type, altitude, wool grade, and card inclusion note.
  3. Fix the **Silent Fallback Glitch**: When visiting an invalid SKU (`product.html?id=missing`), display an informative notification and curated alternative pieces instead of silently rendering product 0.
  4. Add City Delivery Estimator & COD Eligibility calculator based on selected city.
  5. Add sticky mobile add-to-cart bar with coordinated floating WhatsApp button.
  6. Add accordion tabs: *Cultural Story & Symbolism*, *Highland Wool & Loom Technique*, *Care Protocol*.
  7. Implement *"Complete Your Mountain Pairing"* curated recommendations.
  8. Inject dynamic Product JSON-LD in PKR with BreadcrumbList schema.
- **Verification Gate:** `node test_suite.js` passes. Test with valid and invalid `?id=` query parameters.
- **Estimated Effort:** 2.5 hours.

---

### Step 3.6: Cart Drawer & 3-Step Checkout Protection
- **Objectives:**
  1. Cart Drawer:
     - 2-tier progress bar with accessible aria announcements (`PKR 8,000` free shipping / `PKR 15,000` cedar sachet gift).
     - Non-stacking promo validation with explicit, helpful error feedback (`HERITAGE10`, `HUNZA15`, `FREESHIP`).
     - Archival Gift Wrap toggle (`+PKR 350`) strictly zeroed when cart is empty.
     - Multi-tab storage sync fix: auto-invalidate promos if subtotal drops below required threshold in another tab.
  2. 3-Step Checkout Modal:
     - Step 1 (Delivery): Validates Pakistani phone format (`+92 3XX...` or `03XX...`) and required destination city.
     - Step 2 (Payment): Enforces strict PKR 25,000 COD limit with helpful warning banner; displays Bank & Wallet details with **1-tap Copy to Clipboard buttons**.
     - Step 3 (Review): Item breakdown, dual currency display, customer gift note, and final order submit.
     - Order Request screen: Printable invoice view, pre-filled WhatsApp dispatch hand-off, and optional webhook post.
- **Verification Gate:** `node test_suite.js` passes all commerce calculations and checkout protection rules.
- **Estimated Effort:** 2.5 hours.

---

### Step 3.7: Standalone Supporting & Policy Pages
- **Objectives:**
  Create dedicated, crawlable standalone HTML pages to replace modal popups linked from the footer:
  1. [`track-order.html`](file:///d:/E-comerence/track-order.html): Order tracking lookup with sample `RG-DEMO101` and live WhatsApp dispatch desk connection.
  2. [`size-guide.html`](file:///d:/E-comerence/size-guide.html): Comprehensive metric/imperial tables for caps, shuqa robes, and waistcoats with interactive fit guide.
  3. [`care.html`](file:///d:/E-comerence/care.html): Highland wool care protocol, cedar wood storage, and cleaning instructions.
  4. [`shipping.html`](file:///d:/E-comerence/shipping.html): Complete 13-city courier rates, transit days, and free delivery threshold rules.
  5. [`exchanges.html`](file:///d:/E-comerence/exchanges.html): 14-day exchange process, return courier pickup across Pakistan, and custom tailoring alteration terms.
  6. [`privacy.html`](file:///d:/E-comerence/privacy.html): Honest transparency on `localStorage` usage, WhatsApp order sharing, and data privacy.
  7. [`terms.html`](file:///d:/E-comerence/terms.html): Terms of service, COD limits, and bespoke order policies.
  8. Upgrade [`404.html`](file:///d:/E-comerence/404.html): *"Trail Not Found"* with search bar, popular heritage links, and 3D icon.
  9. Refine [`story.html`](file:///d:/E-comerence/story.html), [`journal.html`](file:///d:/E-comerence/journal.html), and [`contact.html`](file:///d:/E-comerence/contact.html).
- **Verification Gate:** `node test_suite.js` verifies all new pages exist with valid UTF-8, viewports, styles, and noscript fallbacks.
- **Estimated Effort:** 3.0 hours.

---

### Step 3.8: Performance, Core Web Vitals & Media Assets
- **Objectives:**
  1. Compress and optimize all image assets to responsive WebP with explicit dimensions.
  2. Add `fetchpriority="high"` and `<link rel="preload">` for the LCP hero image.
  3. Quarantine / delete dead assets in [`legacy/`](file:///d:/E-comerence/legacy) (removing 8.1 MB of unused files).
  4. Add CC0 3dicons assets into `assets/icons/`.
  5. Audit CSS for zero render-blocking unused styles.
- **Verification Gate:** Verify mobile performance metrics and zero layout shift.
- **Estimated Effort:** 1.5 hours.

---

### Step 3.9: SEO Master Clean-Up, Sitemaps & PWA
- **Objectives:**
  1. Ensure every page has a unique, descriptive `<title>` and `<meta name="description">` (permanently resolving the "My WordPress Blog" issue).
  2. Complete full JSON-LD schemas: Organization, WebSite, Product, BreadcrumbList, FAQPage.
  3. Update [`sitemap.xml`](file:///d:/E-comerence/sitemap.xml) with all new standalone policy pages.
  4. Upgrade [`manifest.webmanifest`](file:///d:/E-comerence/manifest.webmanifest) with real PWA icons from `assets/icons/` and both theme colors (`#214C63` light / `#0E171F` dark).
- **Verification Gate:** `node test_suite.js` validates sitemap completeness and manifest validity.
- **Estimated Effort:** 1.5 hours.

---

### Step 3.10: Automated Tests, Documentation & Go-Live Checklist
- **Objectives:**
  1. Expand [`test_suite.js`](file:///d:/E-comerence/test_suite.js) to 100+ automated checks:
     - Verify all standalone HTML pages exist and load without broken internal links.
     - Verify every `<img>` tag has a non-empty `alt` attribute.
     - Verify every form field has an associated `<label>` or `aria-label`.
     - Verify all promo maths, COD enforcement, and shipping fees.
  2. Update [`README.md`](file:///d:/E-comerence/README.md) with updated architecture, directory map, design tokens, and CC0 icon licensing.
  3. Update [`DEPLOYMENT.md`](file:///d:/E-comerence/DEPLOYMENT.md) with:
     - Exact root-cause explanation of the live WordPress shell issue and how to deploy purely static files to Cloudflare Pages / GitHub Pages / Netlify.
     - Comprehensive **"BEFORE GO-LIVE"** checklist for the store owner.
  4. Create [`CHANGELOG.md`](file:///d:/E-comerence/CHANGELOG.md) documenting all improvements.
- **Verification Gate:** `node test_suite.js` passes 100%.
- **Estimated Effort:** 2.0 hours.

---

## 3. Risk Mitigation & Quality Controls

| Risk | Mitigation Strategy |
|---|---|
| **Breaking Existing Tests** | All 80 existing tests in `test_suite.js` will remain green throughout Phase 3. Any updates to data shapes will be strictly additive. |
| **Accidental Hardcoded Business Data** | All contact, banking, shipping, and currency values will strictly be read from `CONFIG` in `config.js`. Zero hardcoded phone or bank numbers in HTML/JS. |
| **Mobile Slowdown from Heavy Media** | Hero video remains desktop-only (>1024px) and is gated by connection speed and `prefers-reduced-motion`. Mobile receives optimized WebP. |
| **CDN Library Outages** | Zero build step remains. If any optional CDN library (GSAP / Lenis) fails to load, native CSS transitions and `IntersectionObserver` guarantee 100% functionality. |

---

## 4. Next Step: Awaiting User Approval

Per Section 5 of the prompt instructions:
> *"STOP after Phase 2 and present AUDIT.md + DESIGN-RESEARCH.md + an IMPLEMENTATION-PLAN.md (prioritized, with effort estimates). Wait for my approval before Phase 3."*

We are ready to begin Phase 3 upon your confirmation.
