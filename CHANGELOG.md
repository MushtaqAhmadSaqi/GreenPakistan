# ReGongches Storefront — Changelog

All notable changes to the ReGongches mountain heritage storefront are documented in this ledger.

---

## [3.7.0] — Luxury UI/UX Elevation & Standalone Policy Architecture

### Added
- **Tactile "Added to Bag" Button State:** Instant haptic feedback inline on buttons (`✓ Added to Bag` with gold shimmer pulse) and spring physics bounce (`@keyframes badgeBounce`) on header bag badges without page shift.
- **Weave Inspection & Image Zoom:** Silky image hover cross-fade with smooth scale transition (`1.02` → `1.045`) revealing macro weave details alongside a frosted-glass inspection badge (`.card-inspect-pill`).
- **Archival Collector Unboxing Presentation:** Packaging showcase card inside the Cart Drawer highlighting the debossed midnight-blue presentation box, mountain cedar shavings, and wax seal.
- **Universal Floating Sticky Action Bar:** Responsive bar sliding in from the bottom on PDPs when scrolling past the main buy box, offering thumbnail preview, selected size, price, and 1-tap purchase.
- **Smart VIP Studio Concierge Desk:** Floating WhatsApp widget featuring 1-tap pre-composed consultation prompts for custom tailoring, fabric warmth, regional COD verification, and wedding commissions.
- **Standalone Policy & Utility Pages:**
  - `track-order.html`: Live order reference lookup (sample `RG-DEMO101`), 5-stage graphical timeline, courier tracking links, and direct WhatsApp studio desk integration.
  - `size-guide.html`: Interactive cm/inches unit toggle, Quick Fit Finder, measurement tables for all 4 apparel types, and printable cheat sheet.
  - `care.html`: Highland wool 3 golden rules, step-by-step cold soak & flat dry, tea/mud/oil stain matrix, and Himalayan cedar storage.
  - `shipping.html`: 13-city courier rates, transit days schedule, free delivery threshold (PKR 8,000), courier partner badges (TCS, Leopards, Trax, PostEx), and COD limits.
  - `exchanges.html`: 14-day exchange promise, 3-step WhatsApp roadmap, reverse courier doorstep pickup terms, and bespoke tailoring alteration guarantees.
  - `privacy.html`: Honest zero-tracker disclosure, full `localStorage` keys transparency table, and 1-tap browser data reset button (`#btn-clear-browser-data`).
  - `terms.html`: Craft authenticity variations disclaimer, official PKR settlement, COD limits (PKR 25,000), and bespoke 50% advance commission policies.
  - Upgraded `404.html`: Mountain pass closed hero, dedicated archive search form, and popular heritage chips.
- **Sitemap & SEO Indexing:** Updated `sitemap.xml` to index all 15 HTML pages and 16 product deep links.
- **Expanded Test Suite:** Added Suite 8 to `test_suite.js`; all 153 automated tests pass with zero failures.

---

## [3.6.0] — Checkout & Payment Engine Upgrade

### Added
- **1-Tap Copy Buttons:** Added clipboard copy buttons for Meezan Bank IBAN (`PK36 MEZN 0001 2345 6789 0102`) and JazzCash/EasyPaisa wallet numbers with visual "Copied" feedback.
- **Copy Line Rows:** Styled copy line rows in `styles.css` matching luxury typography and color contrast.
- **Placeholder Safeguards:** Suite 3 test enforcement blocking unconfigured bank accounts and test wallets.

---

## [3.5.0] — Product Detail Page & Provenance Passport

### Added
- **3-Angle Hover/Tap Gallery:** Main studio view, macro weave & motif detail, archival presentation box.
- **Verified Provenance Passport:** Detailed origin valley, artisan guild, loom technique, weight grade, and thermal rating.
- **Pakistani City Delivery & COD Estimator:** Live calculation of transit days and courier fees across 13 major Pakistani cities.
- **Structured Schema.org Metadata:** Dual `Product` and `BreadcrumbList` JSON-LD schema formatted in PKR.

---

## [3.4.0] — Multi-Facet Filtering & URL Sync Engine

### Added
- **Facet Engine:** Real-time multi-dimensional filtering across Category, District/Region, Price Range, Availability, and Colour.
- **URL Synchronization:** Bidirectional sync with browser query string (`?category=...&region=...`) for shareable catalog URLs.
- **Mobile Filter Drawer:** Bottom-sheet filter drawer with live match counter and reset controls.

---

## [3.3.0] — Unified State Store & Cart Mathematics

### Added
- **Reactive Store:** Safari private mode resilient storage, multi-tab cross-synchronization via `storage` event listeners.
- **Two-Tier Progress Bar:** Dual milestone progress meter for PKR 8,000 complimentary delivery and PKR 15,000 free cedar gift.
- **Non-Stacking Promo Engine:** Validation for `HERITAGE10`, `HUNZA15` (minimum PKR 10,000), and `FREESHIP`.
- **Accurate Cart Calculations:** Conditional gift wrap fee applied only when ticked on non-empty bags.

---

## [3.1.0] — Design System & Tokens Foundation

### Added
- **Unified Stylesheet:** Daylight Ivory & Karakoram Night Mode design system.
- **Typography:** Cormorant Garamond, Playfair Display, and Inter with optimized `font-display: swap`.
- **WCAG 2.2 AA Contrast:** High-contrast color tokens and keyboard accessibility focus traps.
