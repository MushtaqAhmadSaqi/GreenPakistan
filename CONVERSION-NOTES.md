# WordPress & WooCommerce Theme Conversion Guide (`CONVERSION-NOTES.md`)

This static front-end (`regongches-static`) was engineered specifically to convert into a custom WordPress + WooCommerce theme (`wp-content/themes/regongches/`) with zero CSS rewrites.

---

## 1. HTML File → WordPress / WooCommerce Template Mapping

| Static HTML File | Target WordPress / WooCommerce Template File | Dynamic Query / Routing Notes |
| :--- | :--- | :--- |
| `<!-- RG:HEADER START ... END -->` | `header.php` | Identical across all 28 HTML files; extract directly into `header.php` |
| `<!-- RG:FOOTER START ... END -->` | `footer.php` | Identical across all 28 HTML files; extract directly into `footer.php` |
| `index.html` | `front-page.php` | Uses ACF / Customizer blocks or `WC_Product_Query` for rails |
| `shop.html` | `woocommerce/archive-product.php` | Main WooCommerce shop archive |
| `category.html` | `woocommerce/taxonomy-product_cat.php` | Replaces `?cat=` with native `product_cat` term archive |
| `region.html` | `taxonomy-region.php` | Register custom taxonomy `region` attached to `product` post type |
| `product.html` | `woocommerce/single-product.php` | Uses custom meta fields for **The ReGongches Origin Card** |
| `cart.html` | `page-cart.php` (`[woocommerce_cart]`) | **Important:** Use classic shortcode `[woocommerce_cart]` rather than WooCommerce Blocks so `assets/css/woocommerce.css` applies directly |
| `checkout.html` | `page-checkout.php` (`[woocommerce_checkout]`) | **Important:** Use classic shortcode `[woocommerce_checkout]` for direct styling compatibility |
| `order-confirmation.html` | `woocommerce/checkout/thankyou.php` | Styled automatically by `.woocommerce-order-received` & `print.css` |
| `account.html` | `woocommerce/myaccount/my-account.php` | Styled by `.woocommerce-MyAccount-navigation` & `.woocommerce-MyAccount-content` |
| `wishlist.html` | `page-wishlist.php` | Pairs with wishlist plugin shortcode or custom user-meta endpoint |
| `search.html` | `search.php` | Standard WP search template (`?s=`) |
| `collections.html` | `page-collections.php` | Selected seasonal landing page |
| `gift-sets.html` | `page-gift-sets.php` | Gift Set Builder + Institutional B2B Quote form |
| `custom-orders.html` | `page-custom-orders.php` | Made-to-order measurement form (hooks into Contact Form 7 / WPForms) |
| `artisans.html` | `archive-artisan.php` | Register custom post type `artisan` |
| `artisan.html` | `single-artisan.php` | Queries products matching `_rg_artisan_id` meta |
| `journal.html` | `home.php` / `archive.php` | Editorial blog index |
| `journal-post.html` | `single.php` | Single blog post with TOC & related products |
| `our-story.html` | `page-our-story.php` (`page-about.php`) | About & brand story template |
| `authenticity.html` | `page-authenticity.php` | Origin & 3-tier craft verification standard |
| `size-guide.html` | `page-size-guide.php` | Standalone size & measurement reference |
| `faq.html` | `page-faq.php` | Searchable FAQ accordion with `FAQPage` JSON-LD |
| `contact.html` | `page-contact.php` | Customer support & WhatsApp concierge |
| `shipping-policy.html`, `returns-exchange.html`, `privacy.html`, `terms.html` | `page.php` | Standard policy pages |
| `404.html` | `404.php` | Custom mountain 404 template |

---

## 2. WordPress Partial & Comment Markers

Search the codebase for these exact markers when splitting templates:
- `<!-- RG:HEADER START -->` and `<!-- RG:HEADER END -->` → `header.php`
- `<!-- RG:FOOTER START -->` and `<!-- RG:FOOTER END -->` → `footer.php`
- `<!-- WP PARTIAL: template-parts/content-product-card.php -->` → `woocommerce/content-product.php`
- `<!-- WP PARTIAL: template-parts/content-artisan-card.php -->` → `template-parts/content-artisan-card.php`
- `<!-- WP PARTIAL: template-parts/content-journal-card.php -->` → `template-parts/content-journal-card.php`
- `<!-- WP PARTIAL: template-parts/content-review-card.php -->` → `template-parts/content-review-card.php`
- `<!-- WP: wp_nav_menu('primary') -->` → Replace with `wp_nav_menu(['theme_location' => 'primary', 'container' => false, 'menu_class' => 'menu'])`
- `<!-- WP: woocommerce_breadcrumb() -->` → Replace with `woocommerce_breadcrumb()`
- `<!-- WP: the_title() -->` → Replace with `the_title()`
- `<!-- WP: wc_price() -->` → Replace with `$product->get_price_html()`

---

## 3. JavaScript Modules: Which Stay vs. Which Become Obsolete in WooCommerce

| JS File | Status in WordPress + WooCommerce | Migration Action |
| :--- | :--- | :--- |
| `assets/js/ui.js` | **KEEP** | Retains Size Guide modal, Toast notifications, Quick View UI, and theme preset switcher |
| `assets/js/motion.js` | **KEEP** | Retains IntersectionObserver reveals, hero parallax, SVG thread draw, and horizontal rail scroll |
| `assets/js/main.js` | **KEEP** | Retains sticky header, mega-menu accessibility, interactive Gilgit-Baltistan SVG map, and FAQ search |
| `assets/js/data-source.js` | **UPDATE** | Switch `mode: 'static'` to fetch from WooCommerce Store API (`/wp-json/wc/store/v1/products`) for instant search & gift builder |
| `assets/js/filters.js` | **KEEP UI / HOOK TO WC** | Keep URL-sync & filter drawer UX, or connect to a WooCommerce AJAX filter plugin |
| `assets/js/product.js` | **PARTIAL KEEP** | Keep city delivery estimator, dispatch date calculator, and Size Guide modal trigger; let WooCommerce handle native variation form submission |
| `assets/js/cart.js` | **OBSOLETE** | Replaced by native WooCommerce PHP session cart & `wc-cart-fragments` |
| `assets/js/checkout.js` | **OBSOLETE** | Replaced by native WooCommerce checkout processing & payment gateways (keep the regex `^03\d{2}-?\d{7}$` in `woocommerce_checkout_process` PHP hook) |
| `assets/js/account.js` | **OBSOLETE** | Replaced by native WooCommerce My Account endpoints |

---

## 4. Recommended WordPress & WooCommerce Plugins

1. **Custom Fields (Origin Card & Artisan CPT):** *Advanced Custom Fields (ACF)* or native `register_post_meta` for `_rg_district`, `_rg_artisan_id`, `_rg_craft_type`, `_rg_time_to_make`, `_rg_cultural_story`, and `_rg_verified`.
2. **Variation Swatches (Size Buttons & Colour Swatches):** *Variation Swatches for WooCommerce* (converts default WooCommerce `<select>` dropdowns into the button/swatch markup styled in `woocommerce.css`).
3. **Pakistani Payment Gateways:** *Easypaisa & JazzCash WooCommerce Gateway* plugins + native WooCommerce *Cash on Delivery (COD)* (with a conditional `woocommerce_available_payment_gateways` filter disabling COD when `_rg_availability === 'made-to-order'`).
4. **Wishlist:** *TI WooCommerce Wishlist* or *YITH WooCommerce Wishlist*.
5. **Reviews with Customer Photos & Fit Score:** *Customer Reviews for WooCommerce (CusRev)*.
6. **Catalogue Filtering:** *Filter Everything — WooCommerce Product & WordPress Filter* (supports custom taxonomies like `region` and custom meta like `craft_type`).
