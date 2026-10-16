ReGongches | Threads of Mountain Heritage

ReGongches is a luxury editorial e-commerce storefront celebrating authentic traditional clothing, hand-loomed pattu textiles, embroidered headwear, and cultural gift boxes from the 7 districts of Gilgit-Baltistan, Pakistan (Gilgit, Baltistan, Hunza, Ghizer, Nagar, Diamer, and Astore).

Built with zero external build dependencies using semantic HTML5, modular CSS3, and Vanilla JavaScript (ES6+), the storefront runs directly in any modern browser or static hosting environment.

Key Storefront & UI/UX Features

1. Editorial Discovery & Resilient Visual Architecture

Bespoke 3-Angle SVG Studio Fallbacks: Every product features 3 distinct gallery views (Garment View, Macro Weave & Motif Study, and Archive Packaging & Story Card) with automatic fallback to bespoke SVG textile illustrations when external .webp photos are absent.

Karakoram Night Mode (data-theme="dark"): Instant header toggle switching between Warm Ivory Daylight and Obsidian/Gold Karakoram Night Mode.

Interactive "Shop the Mountain Lookbook": Curated highland ensembles (The Highland Dignitary Edit and The Baltistan Silk-Road Edit) with pulsing gold hotspot pins, individual piece previews, and 1-click Add All 4 Pieces to Bag bundle checkout.

7-District Region Explorer: Interactive regional tabs with altitude metadata, verified artisan counts, signature motifs, and live regional product previews.

2. Advanced Catalogue, Filtering & Comparison

16-Piece Provenance Catalogue: Covers Headwear, Shawls & Textiles, Clothing, Waistcoats, Accessories, and Heritage Gifts.

Multi-Facet Filtering & Sorting: Filter by category chips, inline keyword search, district of origin, price range (Under PKR 2,500, PKR 2,500 – 6,500, Above PKR 6,500), availability status, and sort by Featured, Highest Rated, Newest, or Price.

Interactive Card Swatches: Preview colour palettes directly on product cards before adding to bag.

Side-by-Side Comparison Matrix: Compare up to 3 heritage pieces across Origin Valley, Rating, Craft Technique, Artisan Guild, Material Composition, Warmth/Weight, and Lead Time.

3. Upgraded Quick View & Provenance Passport

Interactive Hover-Zoom Loupe: Cursor-tracked 1.75× textile weave inspection on the main product image.

Provenance Passport Card: Displays verified Origin Valley, Craft Technique, Artisan Collective, SKU, and Weight/Warmth specs.

Express "Buy Now" & Utility Bar: Supports both Add to Bag and instant Buy Now checkout, alongside Compare, Wishlist, and Copy Link.

4. Smart Cart, Promo Engine & 4-Step Checkout

Two-Tier Progress Bar: Tracks progress toward Complimentary Nationwide Delivery (PKR 8,000) and a Complimentary Himalayan Cedar Sachet & Story Booklet (PKR 15,000).

Live Promo Code Engine: Supports HERITAGE10 (10% off), HUNZA15 (15% off orders over PKR 10,000), and FREESHIP (free shipping) with 1-click apply pills.

Dynamic City Shipping Estimator: Calculates delivery timelines and courier rates across 13+ cities in Pakistan (Gilgit, Hunza, Skardu, Islamabad, Rawalpindi, Lahore, Karachi, Peshawar, etc.).

Payment Options & Printable Invoice: Supports Cash on Delivery (COD), Direct Bank Transfer (IBAN), and JazzCash/EasyPaisa, generating a printable official invoice (@media print) and saving the order to local storage.

5. Interactive Modals & Customer Care Hub

5-Stage Live Order Tracker: Look up any saved order reference (or test with RG-DEMO101) to view its 5-stage dispatch progress from the Gilgit studio.

Interactive Size & Care Guide: Toggle measurements between cm and inches, use the live Quick Fit Finder calculator, and review the 3-step Highland Wool Care Protocol.

Cultural Journal Reader: Full long-form essay modal with pull quotes and shoppable related pieces.

Artisan Guilds & Searchable FAQ Modal: Profiles of 4 documented artisan collectives across Gilgit-Baltistan plus searchable policies.

Customer Review Publishing: Collectors can submit verified star ratings and reviews that persist in localStorage.

Project Structure

.
├── index.html # Storefront markup, Lookbook stage, and interactive modals
├── styles.css # Design tokens, responsive layouts, Night Mode, and print styles
├── products.js # 16 products, SVG studio art generator, regions, lookbook, promos, FAQs
├── script.js # Core e-commerce state engine, filters, cart, checkout, and modals
├── phase10.js # GPU-accelerated micro-interactions, 3D card tilt, FLIP grid, and ripples
└── README.md # Documentation and setup guide

Running Locally

Place all files (index.html, styles.css, products.js, script.js, phase10.js) in the same folder.

Open index.html directly in any modern browser, or serve locally via Python:

python3 -m http.server 8000

Then visit http://localhost:8000.
