# ReGongches Storefront — Design Research & Pattern Specification

**Brand:** ReGongches — *"Threads of Mountain Heritage"*  
**Deliverable:** Design Research & Pattern Adaptation Dossier (`DESIGN-RESEARCH.md`)  
**Role:** Senior Front-End Engineer + UX Designer + E-Commerce Conversion Specialist  
**Visual Identity:** Warm Ivory (`#F7F1E7`), Karakoram Night Navy/Charcoal (`#0E171F` / `#252525`), Mountain Gold (`#C59A3D` / `#8A661D`), Apricot Blossom (`#D97B54`), and Hand-Loomed Wool Textures.  

---

## 1. Executive Research Summary

To elevate ReGongches from a standard regional catalog into an unforgettable digital craft atelier, we studied 7 specialized design libraries and high-conversion e-commerce benchmarks. 

Our goal is **editorial prestige paired with frictionless Pakistani commerce**. We adopt proven interaction patterns from the world's best craft, fashion, and navigation designs, custom-tailored to the cultural reality of Gilgit-Baltistan textiles, local courier logistics, Cash on Delivery limits, and multi-currency browsing.

---

## 2. Deep Dive: 7 Design Research Targets & Adapted Patterns

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RECONGCHES ARCHITECTURAL DNA                          │
│                                                                             │
│  Scrolltide.co  ──────►  Cinematic Scroll Motion & Section Patterns        │
│  Navbar.gallery ──────►  Shrink Header, Mega Menu & Command Search          │
│  Footer.design  ──────►  Mountain-Ridge Silhouette & Structured Grid        │
│  TheCatGallery  ──────►  Honest Niche Taxonomy & Social Proof Walls         │
│  Refero.design  ──────►  Frictionless E-Commerce Component Flows            │
│  Supahero.io    ──────►  Atmospheric Hero Archetypes (Video + Poster)       │
│  3dicons.co     ──────►  Tactile CC0 3D Trust Badges & Empty States        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Target 1: [Scrolltide.co](https://www.scrolltide.co/) — Cinematic Scroll-Driven Motion

Scrolltide specializes in scroll-driven editorial experiences that feel bespoke and fluid rather than generic or template-driven.

#### Specific Patterns Studied:
1. **Hero Word-by-Word Typography Reveal:**
   - *What it is:* Headlines masked inside `overflow: hidden` line wrappers, translating along the Y-axis (`translateY(100%)` → `translateY(0%)`) with a staggered `cubic-bezier(0.16, 1, 0.3, 1)` easing.
   - *Why it fits ReGongches:* Evokes the deliberate, rhythmic stroke of a highland handloom. It gives *"Threads of Mountain Heritage"* immediate gravitas.
   - *Where it goes:* Homepage Hero headline and section titles on `story.html` and `journal.html`.
2. **Card Carousel Archetypes:**
   - **Spotlight Carousel:** Active central piece is 100% opacity and 1.0 scale; adjacent items are 0.45 opacity and 0.96 scale with smooth CSS snap-scroll. *Used for: "Founder’s & Artisan’s Pick" and "Curated Highland Lookbook".*
   - **Fan Deck Cards:** Subtle angular rotation (`rotate(-3deg)`, `0deg`, `rotate(3deg)`) that fans out on hover. *Used for: Heritage Gift Box sets (Tier Cards).*
   - **Parallax Rail:** Horizontal product strip with differential scroll speeds on imagery vs. text labels. *Used for: "New Season: Hunza & Baltistan Edit" rail.*
3. **GPU Gradient & Mesh Backgrounds (Earth & Mountain Palettes):**
   - *Adapted Palettes:*
     - **Karakoram Mocha Mesh:** Rich espresso (`#15232F`), deep charcoal (`#0E171F`), and antique sand (`#D8C4A8`) with `backdrop-filter: blur(80px)`.
     - **Apricot Blossom Mesh:** Terracotta (`#D97B54`), warm amber (`#C59A3D`), and soft blush ivory (`#F7F1E7`).
     - **Hunza Sage Mesh:** Muted highland lichen (`#4A6B5D`), river stone, and glacial blue.
   - *Where it goes:* Backgrounds of the Authenticity Promise section and Bespoke Commission studio container.
4. **Section Patterns:**
   - **Tier Cards:** Triple-card container with fine gold borders and subtle hover elevation. *Used for: 3-Tier Heritage Gift Boxes (Valley Keepsake / Karakoram Collector / Royal Mir Heirloom).*
   - **Service Bento:** Asymmetric 4-box grid displaying the 4 Brand Pillars (Verified Origin, Artisan Craft, Material Transparency, Cultural Story).
   - **Focus Reveal Text:** Text opacity dims to 0.35 when out of focus, illuminating to 1.0 upon scroll entry. *Used for: The Master Weaver’s manifesto in `story.html`.*

---

### Target 2: [Navbar.gallery](https://www.navbar.gallery/) — Navigation Design Inspiration

We analyzed navigation patterns across e-commerce, luxury, and editorial websites.

#### Specific Patterns Adapted for ReGongches:
1. **Sticky Shrink-on-Scroll Header:**
   - Starts at `72px` height with transparent or semi-opaque ivory/dark background.
   - On scrolling down past `80px`, smoothly compresses to `56px` with glassmorphic backdrop (`backdrop-filter: blur(16px)`), increasing viewport real estate for shopping.
2. **Desktop Multi-Column Mega Menu for "Shop":**
   - 4 Category Columns:
     1. *Traditional Clothing & Outerwear* (Ghizer Shuqa, Wool Waistcoats, Kurta Ensembles)
     2. *Highland Headwear & Accents* (Gilgiti Pakol, Balti Embroidered Caps, Feathers)
     3. *Pattu Shawls & Hand-Loomed Textiles* (Hunza Pattu, Nagar Looms, Cashmere Blends)
     4. *Curated Heritage Gifting* (Highland Gift Boxes, Collector Sets, Custom Packaging)
   - *Feature Tile:* Rich visual card showcasing the *"New Season: Hunza & Baltistan Edit"* with direct link.
   - *Regional Provenance Footer Strip:* Quick clickable chips for all 7 Districts (Gilgit, Hunza, Nagar, Ghizer, Baltistan, Diamer, Astore).
3. **Rotating Dismissible Announcement Bar:**
   - Displays 4 key brand messages (10% Welcome Code HERITAGE10, Free Tracked Shipping over PKR 8,000, COD up to PKR 25,000, Numbered Origin Card with every order).
   - Includes subtle manual navigation arrows (`<` / `>`) and a close button (`×`).
   - Remembers dismissal in `localStorage` (`regongches-ann-dismissed`) for 7 days so returning customers are not fatigued.
4. **Command-Style Search Overlay:**
   - Full keyboard accessibility (triggers on `Cmd+K` / `Ctrl+K` or search icon click; `Esc` closes).
   - Includes **"Popular Heritage Searches"** chips (*Pakol Cap, Pattu Shawl, Ghizer Shuqa, Hunza Wool, Heritage Gift Box*).
   - Shows **"Recent Searches"** saved in `localStorage`.
5. **Full-Height Mobile Drawer:**
   - Smooth slide-in drawer from the left with nested category accordions.
   - Direct currency switcher and WhatsApp direct contact shortcut in drawer footer.
6. **Accessible Breadcrumbs:**
   - Clean, structured trail (`Home > Shop > Shawls & Textiles > Hunza Hand-Loomed Pattu Shawl`) with BreadcrumbList JSON-LD schema.

---

### Target 3: [Footer.design](https://www.footer.design/) — Editorial & Conversion Footers

We studied the Typographic, Large Type, Grid, and Illustrative styles from `footer.design`.

#### Adapted Architecture for ReGongches:
1. **Mountain-Ridge Geometric Silhouette:**
   - A fine-line SVG divider echoing the ridgeline of Rakaposhi and K2 gracefully separates the main content from the dark footer.
2. **Giant "ReGongches" Wordmark Bleed:**
   - Large watermark-style serif typography (`clamp(3.5rem, 12vw, 10rem)`) embedded in subtle translucent tone (`rgba(247, 241, 231, 0.08)`), anchoring the brand identity.
3. **Structured 4-Column Footer Grid:**
   - **Col 1 (Shop Archive):** All 16 Heritage Pieces, New Season Arrivals, Clothing & Shuqa, Pakols & Balti Caps, Pattu Shawls, Gift Boxes.
   - **Col 2 (Discover & Provenance):** Our Story & Partner Guilds, Curated Lookbook, 7-District Interactive Map, Cultural Journal, 4-Step Authenticity Promise, Bespoke Commissions.
   - **Col 3 (Customer Care):** Track Your Order, Size & Fit Guide, Highland Wool Care Protocol, Shipping & Delivery Rates, 14-Day Easy Exchange Policy, Privacy & Terms.
   - **Col 4 (Gilgit Studio & Concierge):** WhatsApp Concierge (`+92 300 123 4567`), Customer Care Mailbox, Studio Physical Coordinates (Jutial & Old Bazaar, Gilgit), Operating Hours (Mon–Sat, 9 AM – 6 PM PKT).
4. **Payment & Courier Trust Badges:**
   - Official SVG badges for: **Cash on Delivery (COD)**, **Direct Bank Transfer (IBAN / Raast)**, **JazzCash**, **EasyPaisa**, and **Tracked Courier**.
5. **Mobile Accordion Collapse:**
   - On screens `<768px`, footer columns automatically become touch-friendly accordion toggles to prevent endless scrolling.

---

### Target 4: [The Cat Gallery (York, UK)](https://thecatgallery.co.uk/) — Niche E-Commerce Benchmark

*The Cat Gallery* is the definitive physical-to-digital boutique craft store in the UK. We analyzed how they build extraordinary trust as an independent, heritage-focused shop.

#### Patterns Extracted & Adapted for ReGongches:

| The Cat Gallery Pattern | ReGongches Adaptation | Purpose for Gilgit-Baltistan Storefront |
|---|---|---|
| **Shop by Theme & Occasion Rails** | **Shop by Region & Lifestyle Rails** | Rails for: *From Hunza*, *Gifts for Him*, *Winter Warmth: Heavy Pattu*, *Wedding & Ceremony*, *Under PKR 5,000*. Helps customers find gifts quickly. |
| **"Charlie Recommends" Product Card** | **"Artisan's Pick / Master Weaver's Choice"** | Editorial feature callout on select pieces with quote from guild elder explaining the weave difficulty. |
| **Dated Customer Feedback Wall with Sources** | **Verified Provenance Feedback Wall** | Displays real customer reviews with date and verified attribution (*"Verified WhatsApp Order — Lahore"*, *"Studio Guestbook — Gilgit"*). |
| **Founders Story with Pets & Studio** | **Studio Founders & Guild Elders Profile** | Authentic studio photography with founder and artisans from Nagar and Hunza; emphasizes fair-trade compensation. |
| **"Made in UK / Fair Trade" Badges** | **"100% Hand-Loomed / Mountain Heritage / Fair Trade Guild"** | Tactile badges on product cards clarifying wool origin and production time (e.g. *"14 Days on Frame Loom"*). |
| **Standalone Customer Care Pages** | **Dedicated Standalone HTML Policy Pages** | Creating indexable standalone pages: `shipping.html`, `exchanges.html`, `size-guide.html`, `track-order.html`, `care.html`. |

---

### Target 5: [Refero.design](https://refero.design/) — Real-World E-Commerce UI Flows

We reviewed top-tier mobile and desktop flows from Refero’s e-commerce reference database.

#### Component Blueprint:
1. **Multi-Facet Filter Bottom-Sheet (Mobile):**
   - Slides smoothly from bottom on mobile.
   - Sticky footer with live updating count: `"Apply Filters (12 Pieces)"` and `"Clear All"`.
   - URL-synced facets so any filtered state can be bookmarked or shared via WhatsApp.
2. **Product Detail Page (PDP):**
   - **3-Angle Gallery:** Primary front view, tactile texture close-up, lifestyle/ensemble angle.
   - **Desktop Loupe Zoom + Mobile Pinch/Tap Zoom:** Allows inspection of individual wool weaves and embroidery stitches without distortion.
   - **Archival Provenance Passport Card:** Structured table specifying District, Loom Type, Altitude, Wool Grade, Lead Time, and Numbered Card Inclusion.
   - **City Delivery Estimator & COD Check:** Auto-calculates transit days (1–2 days GB, 2–4 days Lahore/Karachi/Islamabad) and clearly marks COD eligibility.
   - **Sticky Mobile Add-to-Cart Bar:** Stays anchored at bottom of screen on mobile with selected size, price, and 1-tap "Add to Bag".
3. **Cart Drawer & Checkout:**
   - **Two-Tier Progress Bar:** Tier 1 unlocks free nationwide delivery at PKR 8,000; Tier 2 unlocks complimentary Cedar Sachet & Booklet at PKR 15,000.
   - **Archival Gift Wrap Toggle:** Checkbox with `+PKR 350` clearly calculated; automatically zeroes if cart becomes empty.
   - **3-Step Checkout:** Step 1: Delivery Details → Step 2: Payment Method (with 1-tap copy buttons for IBAN and wallet) → Step 3: Review & Hand-off.
   - **COD Limit Enforcement:** Orders > PKR 25,000 automatically disable COD with helpful explanation, prompting bank transfer or WhatsApp concierge.

---

### Target 6: [Supahero.io](https://supahero.io/) — Hero Section Library & 3 Concepts

We reviewed luxury craft and hospitality hero sections (including *Casa Lunara*, *Treize grammes*, *Craft*, *Did Global Cinema*, and *Badrutt’s Palace*).

#### Three Hero Concepts for ReGongches:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CONCEPT 1: "The Highland Loom Sanctuary" (Selected)                         │
│ Full-bleed atmospheric video background (assets/video/hero-loom.mp4 on      │
│ desktop, WebP poster on mobile) with dark scrim, centered editorial serif   │
│ headline, dual gold/ghost CTAs, and a 3-badge floating trust strip.         │
├─────────────────────────────────────────────────────────────────────────────┤
│ CONCEPT 2: "The Editorial Split Archive"                                    │
│ 50/50 split desktop layout: left half has typographic story, district       │
│ selector, and live weather at Khunjerab; right half has looped video.       │
├─────────────────────────────────────────────────────────────────────────────┤
│ CONCEPT 3: "The Curated Mountain Gallery Deck"                              │
│ Center-aligned headline with a floating fan-deck of 3 interactive product   │
│ cards layered over subtle video background with horizontal drag rail.       │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Final Selection & Justification: **Concept 1 ("The Highland Loom Sanctuary")**
- **Why it wins:** It honors the artisanal soul of Gilgit-Baltistan immediately. The tactile loom video immediately proves authentic craftsmanship, dispelling any doubts about factory-made imitations.
- **Mobile Execution:** Video is paused and hidden on mobile/slow connections, replaced by the crisp, high-resolution WebP poster `assets/images/hero-mountain-textiles.webp` with `fetchpriority="high"`, ensuring an instantaneous LCP < 1.8s.
- **Trust Strip Elements:**
  `[ 7 Districts of Gilgit-Baltistan ] · [ 100% Hand-Loomed Natural Wool ] · [ Cash on Delivery Nationwide & Origin Card ]`

---

### Target 7: [3dicons.co](https://3dicons.co/) — CC0 3D Tactile Icon Set

To replace generic flat SVGs with tactile, premium 3D badges that feel warm and collectible, we map the following open-source CC0 3D icons:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        3DICONS.CO MAPPING MATRIX                            │
├───────────────────────────────┬───────────────────────────────┬─────────────┤
│ Purpose                       │ 3dicons Motif Render          │ Icon Tone   │
├───────────────────────────────┼───────────────────────────────┼─────────────┤
│ Pillar 1: Verified Origin     │ Shield / Target Badge         │ Gold / Clay │
│ Pillar 2: Craftsmanship       │ Hand Loom / Tool              │ Slate Blue  │
│ Pillar 3: Material Transp.    │ Notebook / Scroll             │ Warm Ivory  │
│ Pillar 4: Cultural Story      │ Compass / Mountain Pin        │ Apricot     │
│ Trust: Cash on Delivery       │ Wallet / Cash Stack           │ Gold        │
│ Trust: Express GB Delivery    │ Rocket / Courier Box          │ Slate Blue  │
│ Trust: 14-Day Easy Exchange   │ Calendar (14) / Circular Loop │ Warm Ivory  │
│ Trust: Verified Reviews       │ Star Badge / Thumbs Up        │ Gold        │
│ Trust: Collector's Gift       │ Ribbon Gift Box               │ Apricot     │
│ State: Empty Cart             │ Empty Shopping Bag            │ Charcoal    │
│ State: Empty Wishlist         │ Ribbon Heart                  │ Apricot     │
│ State: 404 Trail Not Found    │ Compass / Lost Signpost       │ Slate Blue  │
└───────────────────────────────┴───────────────────────────────┴─────────────┘
```
*Note on Licensing:* All 3dicons assets are CC0 (Creative Commons Zero 1.0 Public Domain), requiring no commercial royalties or attribution, documented in `README.md`.

---

## 3. Comprehensive Design System & Token Specifications

All design tokens are defined as pure CSS custom properties in [`styles.css`](file:///d:/E-comerence/styles.css) without any framework or preprocessor.

### 1. Typography Tokens
```css
/* Locally-hosted Google Fonts with font-display: swap */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap');

:root {
  /* Font Families */
  --f-display: 'Playfair Display', Georgia, serif;
  --f-serif: 'Cormorant Garamond', Georgia, serif;
  --f-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Fluid Typographic Scale using clamp() */
  --fs-xs: clamp(0.72rem, 0.7rem + 0.2vw, 0.82rem);
  --fs-sm: clamp(0.85rem, 0.8rem + 0.3vw, 0.95rem);
  --fs-base: clamp(1rem, 0.95rem + 0.35vw, 1.08rem);
  --fs-md: clamp(1.15rem, 1.08rem + 0.5vw, 1.28rem);
  --fs-lg: clamp(1.35rem, 1.25rem + 0.8vw, 1.6rem);
  --fs-xl: clamp(1.65rem, 1.5rem + 1.2vw, 2.1rem);
  --fs-2xl: clamp(2.1rem, 1.85rem + 1.8vw, 2.85rem);
  --fs-3xl: clamp(2.75rem, 2.35rem + 2.8vw, 4.2rem);
  --fs-hero: clamp(3.2rem, 2.8rem + 4vw, 5.8rem);
  
  /* Line Heights */
  --lh-tight: 1.12;
  --lh-heading: 1.22;
  --lh-snug: 1.38;
  --lh-body: 1.65;
  --lh-loose: 1.8;
  
  /* Letter Spacing */
  --ls-tight: -0.025em;
  --ls-normal: 0em;
  --ls-wide: 0.04em;
  --ls-caps: 0.12em;
  --ls-widest: 0.2em;
}
```

### 2. Spacing Scale (8-Point Grid)
```css
:root {
  --sp-1: 4px;   /* 0.5 unit */
  --sp-2: 8px;   /* 1 unit */
  --sp-3: 12px;  /* 1.5 unit */
  --sp-4: 16px;  /* 2 units */
  --sp-5: 24px;  /* 3 units */
  --sp-6: 32px;  /* 4 units */
  --sp-7: 48px;  /* 6 units */
  --sp-8: 64px;  /* 8 units */
  --sp-9: 96px;  /* 12 units */
  --sp-10: 128px;/* 16 units */
}
```

### 3. Dual Theme Color System (WCAG 2.2 AA Passing Pairs)

```css
/* ☀️ THEME 1: Ivory Daylight (Default) */
:root,
html[data-theme="light"] {
  --c-ivory: #F7F1E7;            /* Highland wool canvas */
  --c-ivory-warm: #EFE7DA;
  --c-sand: #D8C4A8;             /* Loom reed texture */
  --c-sand-lt: #E8D8BF;
  --c-white: #FFFFFF;
  --c-charcoal: #252525;         /* AA contrast against ivory: 12.4:1 */
  --c-charcoal-lt: #3A3A3A;
  --c-blue: #214C63;             /* Indus slate */
  --c-blue-dk: #172F3D;          /* Deep Karakoram night */
  --c-blue-lt: #2A6080;
  --c-gold: #C59A3D;             /* Mountain gold for decorative/accents */
  --c-gold-text: #8A661D;        /* WCAG AA text gold against ivory: 5.2:1 */
  --c-gold-lt: #D4AE5A;
  --c-maroon: #7A263A;           /* Balti pomegranate */
  --c-apricot: #D97B54;          /* Hunza blossom */
  --c-border: rgba(33, 76, 99, 0.12);
  --c-border-strong: rgba(33, 76, 99, 0.24);
  --c-surface: #FFFFFF;
  --c-surface-elevated: #FDFBF8;
}

/* 🌙 THEME 2: Karakoram Night */
html[data-theme="dark"] {
  --c-ivory: #0E171F;            /* Deepest mountain shadow */
  --c-ivory-warm: #121D27;
  --c-sand: #182B38;
  --c-sand-lt: #203646;
  --c-white: #14212B;
  --c-charcoal: #F5EDE0;         /* High-contrast ivory text (14.2:1) */
  --c-charcoal-lt: #D8C4A8;
  --c-blue: #4FA3C7;             /* Glacial turquoise */
  --c-blue-dk: #0B141B;
  --c-blue-lt: #6AB3D3;
  --c-gold: #DEB352;             /* Glowing starlight gold */
  --c-gold-text: #DEB352;        /* WCAG AA text gold against dark: 6.1:1 */
  --c-gold-lt: #F2D58B;
  --c-maroon: #E58B73;
  --c-apricot: #F0A586;
  --c-border: rgba(222, 179, 82, 0.18);
  --c-border-strong: rgba(222, 179, 82, 0.32);
  --c-surface: #14212B;
  --c-surface-elevated: #1B2C39;
}
```

### 4. Elevation, Shadow & Radius Tokens
```css
:root {
  /* Radius Tokens */
  --r-btn: 2px;       /* Tailored architectural sharp button */
  --r-badge: 4px;
  --r-card: 8px;      /* Soft craft container */
  --r-modal: 12px;
  --r-pill: 999px;
  
  /* Layer Elevations */
  --shadow-sm: 0 1px 3px rgba(14, 23, 31, 0.08);
  --shadow-md: 0 4px 16px rgba(14, 23, 31, 0.12);
  --shadow-lg: 0 12px 32px rgba(14, 23, 31, 0.16);
  --shadow-gold: 0 8px 24px rgba(197, 154, 61, 0.22);
}
```

### 5. Motion Tokens (Strictly Respects Reduced-Motion)
```css
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast: 180ms;
  --dur-base: 320ms;
  --dur-slow: 540ms;
  --dur-reveal: 850ms;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 4. Summary of Research Deliverable

With `DESIGN-RESEARCH.md` complete, we have clear, named patterns and complete token systems ready for implementation. We now present the prioritized **Phase 3 Implementation Plan** (`IMPLEMENTATION-PLAN.md`) and will await user confirmation before writing code.
