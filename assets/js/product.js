/* ==========================================================================
   ReGongches Single Product Page Controller (assets/js/product.js)
   Handles gallery + magnifier lens, colour-linked gallery, size buttons,
   live dispatch countdown timer, city delivery estimator, flippable ORIGIN CARD,
   "Complete the look" bundle builder, interactive review filter, and JSON-LD.
   ========================================================================== */
(function (window, document) {
  'use strict';

  function formatFutureDate(daysToAdd) {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    return d.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
  }

  function getDispatchCountdownText() {
    const cfg = window.RG.data.getConfig();
    const cutoff = cfg.dispatchCutoffHourPKT || 16;
    const now = new Date();
    const pktHour = (now.getUTCHours() + 5) % 24;
    const pktMin = now.getUTCMinutes();
    let hoursLeft = cutoff - pktHour - 1;
    let minsLeft = 60 - pktMin;
    if (hoursLeft < 0) {
      hoursLeft += 24;
    }
    return `Order within ${hoursLeft}h ${minsLeft}m for next-batch dispatch from our northern desk.`;
  }

  const RGProductPage = {
    init() {
      const container = document.getElementById('rg-single-product-container');
      if (!container) return;

      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id') || '1';
      const product = window.RG.data.getProductById(idParam);
      if (!product) return;

      window.RG.wishlist.addRecentlyViewed(product.id);
      this.renderProduct(container, product);
      this.injectJsonLd(product);
    },

    renderProduct(container, product) {
      const fmt = window.RG.data.formatPKR;
      const artisan = window.RG.data.getArtisanById(product.artisan_id);
      const reviews = window.RG.data.getReviews(product.id);
      const cfg = window.RG.data.getConfig();

      const breadcrumbEl = document.getElementById('rg-product-breadcrumb-current');
      if (breadcrumbEl) breadcrumbEl.textContent = product.name;
      document.title = (product.seo && product.seo.title) || `${product.name} (${product.region}) — ReGongches`;

      const sizes = (product.attributes && product.attributes.size) || ['Standard'];
      const unavail = (product.attributes && product.attributes.unavailable_sizes) || [];
      const colours = (product.attributes && product.attributes.colour) || ['Default'];

      const minD = product.dispatch_days ? product.dispatch_days[0] : 1;
      const maxD = product.dispatch_days ? product.dispatch_days[1] : 2;
      const estRange = `${formatFutureDate(minD)} – ${formatFutureDate(maxD)}`;
      const dispatchHeadline = product.availability === 'made-to-order'
        ? `Made to order: ships in ${product.time_to_make} (Est. dispatch: ${estRange})`
        : `Ready to ship: dispatched in ${minD}–${maxD} days (Est. dispatch: ${estRange})`;

      const verifiedBadgeHtml = product.verified === true
        ? `<span class="rg-badge rg-badge--verified" title="Cultural & origin details reviewed">✓ Verified by regional reviewer</span>`
        : `<span class="rg-badge rg-badge--hand-finished">Origin documented [Pending regional review]</span>`;

      const waText = encodeURIComponent(`Hi ReGongches, I have a question about ${product.name} (SKU: ${product.sku})`);
      const waFloat = document.querySelector('.rg-whatsapp-float');
      if (waFloat) {
        waFloat.href = `https://wa.me/${cfg.whatsappNumber}?text=${waText}`;
      }

      const pairIds = (product.pairs_with && product.pairs_with.length) ? product.pairs_with : [1, 2, 16].filter((id) => id !== product.id).slice(0, 2);
      const pairProducts = pairIds.map((id) => window.RG.data.getProductById(id)).filter(Boolean);

      container.innerHTML = `
        <div class="rg-single-product-grid">
          <!-- Gallery Column (.woocommerce-product-gallery) -->
          <div class="woocommerce-product-gallery">
            <div class="woocommerce-product-gallery__main" id="rg-gallery-main" title="Hover to magnify · Click to open full lightbox">
              <img src="${product.images[0].src}" alt="${product.images[0].alt}" id="rg-gallery-main-img" width="640" height="800">
              <div class="rg-magnifier-lens" id="rg-magnifier-lens"></div>
              <span class="rg-badge rg-badge--hand-finished" style="position:absolute;inset-block-end:12px;inset-inline-start:12px;">Illustrative image</span>
              <span class="rg-badge rg-badge--hand-finished" style="position:absolute;inset-block-end:12px;inset-inline-end:12px;">Hover / Click Zoom</span>
            </div>
            <div class="woocommerce-product-gallery__thumbs">
              ${product.images.map((img, idx) => `
                <button type="button" class="woocommerce-product-gallery__thumb ${idx === 0 ? 'is-active' : ''}" data-rg-thumb="${img.src}" data-rg-thumb-alt="${img.alt}" data-rg-thumb-colour="${img.colour || ''}">
                  <img src="${img.src}" alt="${img.alt}" width="120" height="120">
                </button>
              `).join('')}
              ${product.video ? `
                <button type="button" class="woocommerce-product-gallery__thumb rg-thumb--video" id="rg-video-thumb-btn" data-rg-video-src="${product.video.src}" data-rg-video-poster="${product.video.poster || product.images[0].src}" title="Watch Craft Demonstration Video" style="position:relative;border:2px solid var(--rg-antique-gold);">
                  <img src="${product.video.poster || product.images[0].src}" alt="Watch craft video" width="120" height="120" style="filter:brightness(0.7);">
                  <span style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#FFFFFF;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="margin-block-end:2px;"><path d="M8 5v14l11-7z"/></svg>
                    ▶ Video
                  </span>
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Summary Column (.summary.entry-summary) -->
          <div class="summary entry-summary">
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-block-end:12px;">
              <a href="region.html?region=${product.region.toLowerCase()}" class="rg-badge rg-badge--new">${product.region} Origin</a>
              <span class="rg-badge rg-badge--handmade">${product.craft_type}</span>
              ${product.availability === 'made-to-order' ? '<span class="rg-badge rg-badge--mto">Made to order</span>' : '<span class="rg-badge rg-badge--verified">Ready to ship</span>'}
            </div>

            <!-- WP: the_title() -->
            <h1 class="product_title entry-title" style="margin-block-end:8px;">${product.name}</h1>

            <div style="display:flex;align-items:center;gap:16px;margin-block-end:16px;font-size:var(--text-sm);">
              <a href="#tab-reviews" class="star-rating">★ ${product.rating.toFixed(1)} (${product.review_count} sample reviews)</a>
              <span style="color:var(--text-secondary);">SKU: ${product.sku}</span>
            </div>

            <!-- WP: wc_price() -->
            <p class="price" style="font-size:var(--text-xl);margin-block-end:6px;">
              ${product.sale_price ? `<del>${fmt(product.regular_price)}</del> <ins>${fmt(product.sale_price)}</ins>` : `<span class="woocommerce-Price-amount amount">${fmt(product.price)}</span>`}
            </p>
            <p style="font-size:var(--text-xs);color:var(--text-secondary);margin-block-end:16px;">
              ${product.availability === 'made-to-order'
                ? 'Advance payment via Bank Transfer / Easypaisa / JazzCash required for made-to-order pieces.'
                : 'Pay with Cash on Delivery (COD), Bank Transfer, Easypaisa, or JazzCash.'}
            </p>

            <div class="woocommerce-product-details__short-description">
              <p>${product.short_description}</p>
              ${product.highlights ? `
                <ul style="list-style:disc;padding-inline-start:18px;font-size:var(--text-xs);color:var(--text-secondary);margin-block-end:16px;display:grid;gap:4px;">
                  ${product.highlights.map((h) => `<li>${h}</li>`).join('')}
                </ul>
              ` : ''}
            </div>

            <form class="cart" id="rg-single-product-form" onsubmit="return false;">
              <div class="variations">
                <!-- Size Selector (Buttons + Size Guide right next to it) -->
                <div class="rg-size-selector">
                  <div class="rg-size-selector__header">
                    <label style="font-weight:700;font-size:var(--text-sm);">Size: <span id="rg-selected-size-label">${sizes[0]}</span></label>
                    <button type="button" class="rg-btn rg-btn--outline rg-btn--sm" data-rg-open-size-guide="${product.size_guide_type}" style="min-height:32px;padding:4px 10px;">
                      <svg width="14" height="14" aria-hidden="true"><use href="#icon-ruler"></use></svg>
                      Size Guide (cm & inches)
                    </button>
                  </div>
                  <div class="rg-size-buttons" role="radiogroup" aria-label="Select size">
                    ${sizes.map((s, idx) => `
                      <button type="button" class="rg-size-btn ${idx === 0 ? 'is-selected' : ''}" data-rg-size-btn="${s}">${s}</button>
                    `).join('')}
                    ${unavail.map((u) => `
                      <button type="button" class="rg-size-btn is-disabled" disabled title="Currently out of stock in ${u}">${u}</button>
                    `).join('')}
                  </div>
                </div>

                <!-- Colour Swatches (Colour-linked gallery) -->
                <div style="margin-block:16px;">
                  <label style="font-weight:700;font-size:var(--text-sm);display:block;margin-block-end:8px;">
                    Colour: <span id="rg-selected-colour-label">${colours[0]}</span>
                  </label>
                  <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${colours.map((c, idx) => `
                      <button type="button" class="rg-btn rg-btn--sm ${idx === 0 ? 'rg-btn--secondary' : 'rg-btn--outline'}" data-rg-colour-btn="${c}" data-rg-colour-idx="${idx}">
                        ${c.replace(/\s*\(#[0-9A-Fa-f]{6}\)/, '')}
                      </button>
                    `).join('')}
                  </div>
                </div>

                ${product.customisable ? `
                <!-- Customisation Panel -->
                <details style="background:var(--bg-secondary);padding:12px 16px;border-radius:var(--radius-card);border:1px solid var(--rg-border);margin-block:16px;">
                  <summary style="font-weight:600;font-size:var(--text-sm);cursor:pointer;">
                    + Optional Customisation (Embroidery Thread / Custom-measured Fit Note)
                  </summary>
                  <div style="margin-block-start:12px;display:grid;gap:10px;">
                    <p style="font-size:12px;color:var(--rg-warning);margin:0;font-weight:600;">
                      Note: Advance payment is required for customised orders.
                    </p>
                    <input type="text" id="rg-custom-note-input" placeholder="E.g., Head 57.5cm, or prefer antique gold border thread" style="padding:8px 12px;border:1px solid var(--rg-border-strong);border-radius:var(--radius-editorial);background:var(--bg-elevated);">
                  </div>
                </details>
                ` : ''}
              </div>

              <!-- Stock & Live Dispatch Countdown + City Delivery Estimator -->
              <div style="background:var(--bg-elevated);border:1px solid var(--rg-border);border-radius:var(--radius-card);padding:14px 16px;margin-block:16px;display:grid;gap:8px;">
                <div style="display:flex;align-items:center;gap:8px;font-size:var(--text-sm);font-weight:600;color:var(--rg-success);">
                  <svg width="18" height="18" aria-hidden="true"><use href="#icon-truck"></use></svg>
                  <span>${dispatchHeadline}</span>
                </div>
                <div style="font-size:12px;color:var(--brand-secondary);font-weight:600;" id="rg-dispatch-countdown">
                  ⏱ ${getDispatchCountdownText()}
                </div>
                <div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-size:var(--text-xs);">
                  <label for="rg-city-estimator" style="font-weight:600;">Delivery Estimate to:</label>
                  <select id="rg-city-estimator" style="padding:4px 10px;border:1px solid var(--rg-border-strong);border-radius:var(--radius-editorial);background:var(--bg-primary);">
                    ${Object.keys(cfg.deliveryEstimates || {}).map((city) => `<option value="${city}">${city}</option>`).join('')}
                  </select>
                  <span id="rg-city-estimate-output" style="color:var(--text-secondary);font-weight:500;">
                    2–3 working days via Leopards / TCS Tracked
                  </span>
                </div>
              </div>

              <!-- Add to Cart Row -->
              <div class="rg-cart-actions-row">
                <div class="quantity">
                  <button type="button" id="rg-qty-dec" aria-label="Decrease quantity">−</button>
                  <input type="number" id="rg-qty-input" class="input-text qty text" value="1" min="1" max="20" aria-label="Product quantity">
                  <button type="button" id="rg-qty-inc" aria-label="Increase quantity">+</button>
                </div>
                <button type="button" class="single_add_to_cart_button button alt" id="rg-main-add-to-cart" style="flex:1;">
                  Add to Cart — ${fmt(product.price)}
                </button>
                <button type="button" class="rg-btn rg-btn--outline" data-rg-wishlist-toggle="${product.id}" aria-label="Add to Wishlist">
                  <svg width="20" height="20" aria-hidden="true"><use href="#icon-heart"></use></svg>
                </button>
              </div>

              <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;margin-block-start:12px;">
                <label style="font-size:var(--text-xs);display:flex;align-items:center;gap:6px;cursor:pointer;">
                  <input type="checkbox" id="rg-product-giftwrap"> Add heritage gift wrap + wax-stamped card (+PKR 300)
                </label>
                <a href="https://wa.me/${cfg.whatsappNumber}?text=${waText}" target="_blank" rel="noopener" style="font-size:var(--text-xs);font-weight:600;color:#1E7E48;display:inline-flex;align-items:center;gap:4px;">
                  <svg width="16" height="16" aria-hidden="true"><use href="#icon-whatsapp"></use></svg> Ask an Artisan / Tailor on WhatsApp
                </a>
              </div>
            </form>

            <!-- SIGNATURE FEATURE: THE ORIGIN CARD (Expandable / Flippable with Mini Map Pin) -->
            <section class="rg-origin-card" id="rg-origin-card-widget" aria-label="Product Origin and Craft Verification">
              <div class="rg-origin-card__header">
                <h2 class="rg-origin-card__title">
                  <svg width="20" height="20" aria-hidden="true"><use href="#icon-shield"></use></svg>
                  The ReGongches Origin Card
                </h2>
                <div style="display:flex;align-items:center;gap:8px;">
                  ${verifiedBadgeHtml}
                  <button type="button" class="rg-btn rg-btn--outline rg-btn--sm" id="rg-origin-flip-btn" style="min-height:28px;padding:2px 8px;font-size:11px;">
                    Flip to Valley Map ↻
                  </button>
                </div>
              </div>

              <div id="rg-origin-front">
                ${artisan ? `
                <div class="rg-origin-card__artisan">
                  <img src="${artisan.avatar}" alt="${artisan.name}" width="56" height="56">
                  <div style="flex:1;">
                    <span style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:var(--brand-secondary);font-weight:700;">Crafted By</span>
                    <h3 style="font-size:var(--text-base);margin:0;"><a href="artisan.html?id=${artisan.id}">${artisan.name}</a></h3>
                    <span style="font-size:11px;color:var(--text-secondary);">${artisan.permissionStatus}</span>
                  </div>
                  <a href="artisan.html?id=${artisan.id}" class="rg-btn rg-btn--outline rg-btn--sm">Artisan Profile</a>
                </div>
                ` : ''}

                <div class="rg-origin-card__grid">
                  <div class="rg-origin-card__item">
                    <span class="rg-origin-card__label">01 · Where it comes from</span>
                    <span class="rg-origin-card__value">${product.district || product.region}</span>
                  </div>
                  <div class="rg-origin-card__item">
                    <span class="rg-origin-card__label">02 · What it is made of</span>
                    <span class="rg-origin-card__value">${(product.attributes.material || []).join(', ')}</span>
                  </div>
                  <div class="rg-origin-card__item">
                    <span class="rg-origin-card__label">03 · How it is made</span>
                    <span class="rg-origin-card__value" style="text-transform:capitalize;">${product.craft_type} (${product.technique})</span>
                  </div>
                  <div class="rg-origin-card__item">
                    <span class="rg-origin-card__label">04 · Time to make</span>
                    <span class="rg-origin-card__value">${product.time_to_make || '3–5 days'}</span>
                  </div>
                </div>

                <div style="font-size:var(--text-sm);color:var(--text-secondary);border-block-start:1px dashed var(--rg-border-strong);padding-block-start:12px;">
                  <strong style="color:var(--text-primary);">Cultural Context:</strong> ${product.cultural_story}
                </div>
              </div>

              <div id="rg-origin-back" hidden style="padding-block:8px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
                  <div>
                    <span class="rg-badge rg-badge--new">District Pin: ${product.region}</span>
                    <h4 style="margin-block:8px 4px;">${product.district || product.region}, Gilgit-Baltistan</h4>
                    <p style="font-size:var(--text-xs);color:var(--text-secondary);margin:0;">Every piece is tagged with its valley of origin and inspected before dispatch.</p>
                  </div>
                  <a href="region.html?region=${product.region.toLowerCase()}" class="rg-btn rg-btn--secondary rg-btn--sm">Explore All ${product.region} Pieces →</a>
                </div>
              </div>
            </section>

            <!-- "Complete the Look" Bundle Builder -->
            <section style="background:var(--bg-elevated);border:1px solid var(--rg-border-strong);border-radius:var(--radius-card);padding:20px;margin-block:20px;" aria-label="Complete the Look Bundle Builder">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-block-end:12px;">
                <div>
                  <span class="rg-section__eyebrow" style="margin:0;">Complete the Ensemble</span>
                  <h3 style="font-size:var(--text-base);margin:0;">Pair with Companion Valley Pieces</h3>
                </div>
                <strong id="rg-bundle-total-price" style="color:var(--brand-secondary);">${fmt(product.price + pairProducts.reduce((s, p) => s + p.price, 0))}</strong>
              </div>
              <div style="display:grid;gap:10px;margin-block-end:14px;">
                <label style="display:flex;align-items:center;gap:10px;font-size:var(--text-xs);">
                  <input type="checkbox" checked disabled>
                  <strong>This piece: ${product.name}</strong> (${fmt(product.price)})
                </label>
                ${pairProducts.map((pp) => `
                  <label style="display:flex;align-items:center;gap:10px;font-size:var(--text-xs);cursor:pointer;">
                    <input type="checkbox" checked data-rg-bundle-check="${pp.id}" data-rg-bundle-price="${pp.price}">
                    <img src="${pp.images[0].src}" alt="${pp.name}" width="36" height="44" style="width:36px;height:44px;object-fit:cover;border-radius:4px;">
                    <span style="flex:1;"><strong>${pp.name}</strong> (${pp.region})</span>
                    <strong>${fmt(pp.price)}</strong>
                  </label>
                `).join('')}
              </div>
              <button type="button" class="rg-btn rg-btn--secondary rg-btn--sm" id="rg-add-bundle-btn" style="width:100%;">
                Add Selected Ensemble to Cart
              </button>
            </section>
          </div>
        </div>

        <!-- WooCommerce Tabs (.woocommerce-tabs.wc-tabs-wrapper) -->
        <div class="woocommerce-tabs wc-tabs-wrapper">
          <ul class="tabs wc-tabs" role="tablist">
            <li class="active" data-rg-tab-li="desc"><button type="button" data-rg-tab-btn="desc">Description & Specs</button></li>
            <li data-rg-tab-li="care"><button type="button" data-rg-tab-btn="care">Materials & Care</button></li>
            <li data-rg-tab-li="fit"><button type="button" data-rg-tab-btn="fit">Size & Fit</button></li>
            <li data-rg-tab-li="shipping"><button type="button" data-rg-tab-btn="shipping">Shipping & Exchanges</button></li>
            <li data-rg-tab-li="story"><button type="button" data-rg-tab-btn="story">Cultural Story & FAQs</button></li>
          </ul>
          <div class="woocommerce-Tabs-panel" data-rg-tab-panel="desc">
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:28px;">
              <div>${product.description_html || `<p>${product.description}</p>`}</div>
              ${product.specs ? `
                <div>
                  <h3 style="font-size:var(--text-md);margin-block-end:12px;">Technical Specifications</h3>
                  <table class="shop_table cart">
                    <tbody>
                      ${Object.entries(product.specs).map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}
                    </tbody>
                  </table>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="woocommerce-Tabs-panel" data-rg-tab-panel="care" hidden>
            <h3 style="margin-block-end:12px;">Materials & Seasonal Care Instructions</h3>
            <p><strong>Materials:</strong> ${(product.attributes.material || []).join(' · ')}</p>
            <ul style="list-style:disc;padding-inline-start:20px;display:grid;gap:8px;">
              ${(product.care || []).map((c) => `<li>${c}</li>`).join('')}
            </ul>
          </div>
          <div class="woocommerce-Tabs-panel" data-rg-tab-panel="fit" hidden>
            <h3 style="margin-block-end:12px;">Measurements & Fit Guidance (cm & inches)</h3>
            <p>Every piece is measured in both centimetres and inches prior to dispatch. Click the <strong>Size Guide</strong> button above to use our interactive head/chest measurement finder.</p>
          </div>
          <div class="woocommerce-Tabs-panel" data-rg-tab-panel="shipping" hidden>
            <h3 style="margin-block-end:12px;">Nationwide Tracked Delivery & 7-Day Size Exchange</h3>
            <p>Orders over PKR 5,000 qualify for free tracked courier delivery across Pakistan. Ready-to-ship sizes can be exchanged within 7 days of delivery if unworn with the Origin Card attached.</p>
          </div>
          <div class="woocommerce-Tabs-panel" data-rg-tab-panel="story" hidden>
            <h3 style="margin-block-end:12px;">Regional Tradition & Product FAQs</h3>
            <p>${product.cultural_story}</p>
            ${product.faqs ? `
              <div style="display:grid;gap:10px;margin-block-start:16px;">
                ${product.faqs.map((fq) => `
                  <details style="background:var(--bg-secondary);padding:12px 16px;border-radius:var(--radius-card);">
                    <summary style="font-weight:700;cursor:pointer;">${fq.q}</summary>
                    <p style="margin:8px 0 0;font-size:var(--text-sm);color:var(--text-secondary);">${fq.a}</p>
                  </details>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Reviews Section with Interactive Star Filter + Fit Meter -->
        <section id="tab-reviews" style="padding-block:var(--space-8);border-block-start:1px solid var(--rg-border);">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:16px;margin-block-end:20px;">
            <div>
              <span class="rg-section__eyebrow">Customer Feedback (Sample Placeholders)</span>
              <h2>Customer Reviews</h2>
              <p style="font-size:var(--text-sm);color:var(--text-secondary);margin:4px 0 0;">Fit Meter Consensus: <strong>92% say True to Size</strong> (Runs small: 4% · Runs large: 4%)</p>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" class="rg-btn rg-btn--secondary rg-btn--sm" data-rg-rev-filter="all">All Stars</button>
              <button type="button" class="rg-btn rg-btn--outline rg-btn--sm" data-rg-rev-filter="5">5 ★ Only</button>
              <button type="button" class="rg-btn rg-btn--outline rg-btn--sm" data-rg-rev-filter="4">4 ★ Only</button>
              <button type="button" class="rg-btn rg-btn--outline rg-btn--sm" id="rg-toggle-review-form">Write a Review</button>
            </div>
          </div>

          <form id="rg-demo-review-form" hidden style="background:var(--bg-secondary);padding:20px;border-radius:var(--radius-card);margin-block-end:24px;display:grid;gap:12px;">
            <h4>Submit a Customer Review (Demo Only)</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <input type="text" placeholder="Your Name & City" required style="padding:10px;border:1px solid var(--rg-border-strong);">
              <select style="padding:10px;border:1px solid var(--rg-border-strong);">
                <option value="5">★★★★★ (5/5)</option>
                <option value="4">★★★★☆ (4/5)</option>
              </select>
            </div>
            <textarea rows="3" placeholder="Share how the size fit and what you thought of the wool/embroidery quality..." required style="padding:10px;border:1px solid var(--rg-border-strong);"></textarea>
            <button type="submit" class="rg-btn rg-btn--primary rg-btn--sm" style="justify-self:start;">Submit Demo Review</button>
          </form>

          <div class="rg-grid rg-grid--3" id="rg-pdp-reviews-list">
            ${reviews.map((r) => window.RG.ui.renderReviewCard(r)).join('')}
          </div>
        </section>

        <!-- Sticky Add-to-Cart Bar on Scroll -->
        <div class="rg-sticky-pdp-bar" id="rg-sticky-pdp-bar">
          <div class="rg-container" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <div style="display:flex;align-items:center;gap:12px;">
              <img src="${product.images[0].src}" alt="" width="40" height="48" style="width:40px;height:48px;object-fit:cover;border-radius:4px;">
              <div>
                <strong style="font-size:var(--text-sm);display:block;">${product.name}</strong>
                <span style="font-size:12px;color:var(--text-secondary);">${product.region} · ${fmt(product.price)}</span>
              </div>
            </div>
            <button type="button" class="rg-btn rg-btn--primary rg-btn--sm" id="rg-sticky-add-btn">Add to Cart — ${fmt(product.price)}</button>
          </div>
        </div>
      `;

      this.bindProductInteractions(container, product, pairProducts);
      this.renderRelatedAndRecent(product);
    },

    bindProductInteractions(container, product, pairProducts) {
      const mainImg = document.getElementById('rg-gallery-main-img');
      const mainBox = document.getElementById('rg-gallery-main');
      const lens = document.getElementById('rg-magnifier-lens');

      // Hover Magnifier Lens
      if (mainBox && mainImg && lens) {
        mainBox.addEventListener('mousemove', (e) => {
          const rect = mainBox.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          lens.style.display = 'block';
          lens.style.left = `${Math.max(0, Math.min(rect.width - 150, x - 75))}px`;
          lens.style.top = `${Math.max(0, Math.min(rect.height - 150, y - 75))}px`;
          lens.style.backgroundImage = `url('${mainImg.src}')`;
          lens.style.backgroundSize = `${rect.width * 2}px ${rect.height * 2}px`;
          lens.style.backgroundPosition = `-${x * 2 - 75}px -${y * 2 - 75}px`;
        });
        mainBox.addEventListener('mouseleave', () => {
          lens.style.display = 'none';
        });
      }

      // Gallery thumbnails & Video Toggle
      const videoThumbBtn = document.getElementById('rg-video-thumb-btn');

      const restoreImageGallery = () => {
        const currentVideo = mainBox.querySelector('video');
        if (currentVideo) currentVideo.remove();
        if (mainImg) mainImg.style.display = 'block';
        if (lens) lens.style.display = 'none';
        const illBadge = document.getElementById('rg-gallery-badge-illustrative');
        const zoomBadge = document.getElementById('rg-gallery-badge-zoom');
        if (illBadge) illBadge.style.display = 'inline-flex';
        if (zoomBadge) zoomBadge.style.display = 'inline-flex';
      };

      container.querySelectorAll('[data-rg-thumb]').forEach((btn) => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.woocommerce-product-gallery__thumb').forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          restoreImageGallery();
          if (mainImg) {
            mainImg.src = btn.getAttribute('data-rg-thumb');
            mainImg.alt = btn.getAttribute('data-rg-thumb-alt') || product.name;
          }
        });
      });

      if (videoThumbBtn && product.video) {
        videoThumbBtn.addEventListener('click', () => {
          container.querySelectorAll('.woocommerce-product-gallery__thumb').forEach((b) => b.classList.remove('is-active'));
          videoThumbBtn.classList.add('is-active');

          if (mainImg) mainImg.style.display = 'none';
          if (lens) lens.style.display = 'none';

          const illBadge = document.getElementById('rg-gallery-badge-illustrative');
          const zoomBadge = document.getElementById('rg-gallery-badge-zoom');
          if (illBadge) illBadge.style.display = 'none';
          if (zoomBadge) zoomBadge.style.display = 'none';

          let vidEl = mainBox.querySelector('video');
          if (!vidEl) {
            vidEl = document.createElement('video');
            vidEl.src = product.video.src;
            vidEl.poster = product.video.poster;
            vidEl.controls = true;
            vidEl.autoplay = true;
            vidEl.loop = true;
            vidEl.playsInline = true;
            vidEl.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:var(--radius-card);display:block;';
            mainBox.appendChild(vidEl);
          } else {
            vidEl.play();
          }
        });
      }

      // Lightbox zoom
      if (mainBox && mainImg) {
        mainBox.addEventListener('click', () => {
          const modal = document.getElementById('rg-quickview-modal');
          const body = document.getElementById('rg-quickview-body');
          if (modal && body) {
            body.innerHTML = `<img src="${mainImg.src}" alt="${mainImg.alt}" style="width:100%;max-height:78vh;object-fit:contain;margin-inline:auto;"><p style="text-align:center;font-size:12px;color:var(--text-secondary);margin-block-start:8px;">Illustrative image — ${product.name}</p>`;
            window.RG.ui.openModal('rg-quickview-modal');
          }
        });
      }

      // Size buttons
      container.querySelectorAll('[data-rg-size-btn]').forEach((btn) => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('[data-rg-size-btn]').forEach((b) => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          const lbl = document.getElementById('rg-selected-size-label');
          if (lbl) lbl.textContent = btn.getAttribute('data-rg-size-btn');
        });
      });

      // Colour buttons (Colour-linked gallery swap)
      container.querySelectorAll('[data-rg-colour-btn]').forEach((btn) => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('[data-rg-colour-btn]').forEach((b) => {
            b.classList.remove('rg-btn--secondary');
            b.classList.add('rg-btn--outline');
          });
          btn.classList.add('rg-btn--secondary');
          btn.classList.remove('rg-btn--outline');
          const lbl = document.getElementById('rg-selected-colour-label');
          if (lbl) lbl.textContent = btn.getAttribute('data-rg-colour-btn');
          const idx = Number(btn.getAttribute('data-rg-colour-idx')) || 0;
          const targetImg = product.images[idx % product.images.length];
          if (targetImg && mainImg) {
            mainImg.src = targetImg.src;
          }
        });
      });

      // Origin Card Flip
      const flipBtn = document.getElementById('rg-origin-flip-btn');
      const front = document.getElementById('rg-origin-front');
      const back = document.getElementById('rg-origin-back');
      if (flipBtn && front && back) {
        flipBtn.addEventListener('click', () => {
          const showingFront = !front.hidden;
          front.hidden = showingFront;
          back.hidden = !showingFront;
          flipBtn.textContent = showingFront ? 'Back to Origin Details ↺' : 'Flip to Valley Map ↻';
        });
      }

      // Bundle Builder
      const bundleChecks = container.querySelectorAll('[data-rg-bundle-check]');
      const bundleTotalEl = document.getElementById('rg-bundle-total-price');
      const addBundleBtn = document.getElementById('rg-add-bundle-btn');
      if (bundleChecks.length && bundleTotalEl) {
        const recalc = () => {
          let sum = product.price;
          bundleChecks.forEach((chk) => {
            if (chk.checked) sum += Number(chk.getAttribute('data-rg-bundle-price')) || 0;
          });
          bundleTotalEl.textContent = window.RG.data.formatPKR(sum);
        };
        bundleChecks.forEach((c) => c.addEventListener('change', recalc));
      }
      if (addBundleBtn) {
        addBundleBtn.addEventListener('click', () => {
          window.RG.cart.addItem(product.id, 1);
          bundleChecks.forEach((chk) => {
            if (chk.checked) window.RG.cart.addItem(Number(chk.getAttribute('data-rg-bundle-check')), 1);
          });
          window.RG.ui.openDrawer('rg-minicart-drawer');
          window.RG.ui.toast(`Added to your cart: ${product.name} ensemble.`, { viewCart: true });
        });
      }

      // City estimator
      const citySel = document.getElementById('rg-city-estimator');
      const cityOut = document.getElementById('rg-city-estimate-output');
      if (citySel && cityOut) {
        citySel.addEventListener('change', () => {
          const est = (window.RG.data.getConfig().deliveryEstimates || {})[citySel.value];
          if (est) cityOut.textContent = `${est.ready} via ${est.courier}`;
        });
      }

      // Quantity stepper
      const qtyInput = document.getElementById('rg-qty-input');
      const decBtn = document.getElementById('rg-qty-dec');
      const incBtn = document.getElementById('rg-qty-inc');
      if (qtyInput && decBtn && incBtn) {
        decBtn.addEventListener('click', () => {
          qtyInput.value = String(Math.max(1, Number(qtyInput.value) - 1));
        });
        incBtn.addEventListener('click', () => {
          qtyInput.value = String(Math.min(20, Number(qtyInput.value) + 1));
        });
      }

      // Main Add to Cart
      const triggerMainAdd = () => {
        const sizeEl = container.querySelector('[data-rg-size-btn].is-selected');
        const colEl = container.querySelector('[data-rg-colour-btn].rg-btn--secondary');
        const customEl = document.getElementById('rg-custom-note-input');
        const wrapEl = document.getElementById('rg-product-giftwrap');
        const qty = qtyInput ? Number(qtyInput.value) : 1;

        if (sizes.length > 1 && !sizeEl) {
          window.RG.ui.toast('Please choose a size. Not sure? Open the size guide.');
          return;
        }
        const size = sizeEl ? sizeEl.getAttribute('data-rg-size-btn') : 'Standard';
        const colour = colEl ? colEl.getAttribute('data-rg-colour-btn') : 'Default';
        const customNote = customEl ? customEl.value.trim() : '';

        window.RG.cart.addItem(product.id, qty, { size, colour, customNote });
        if (wrapEl && wrapEl.checked) {
          window.RG.cart.setGiftWrap(true);
        }
        window.RG.ui.openDrawer('rg-minicart-drawer');
        window.RG.ui.toast(`Added to your cart: ${product.name}, ${size}. View cart`, { viewCart: true });
        document.querySelectorAll('[data-rg-cart-count]').forEach((b) => {
          b.classList.add('is-bouncing');
          setTimeout(() => b.classList.remove('is-bouncing'), 400);
        });
      };

      const addBtn = document.getElementById('rg-main-add-to-cart');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          window.RG.ui.animateFlyToCart(addBtn);
          triggerMainAdd();
        });
      }

      const stickyAddBtn = document.getElementById('rg-sticky-add-btn');
      if (stickyAddBtn) {
        stickyAddBtn.addEventListener('click', triggerMainAdd);
      }

      // Sticky PDP bar visibility on scroll
      const stickyBar = document.getElementById('rg-sticky-pdp-bar');
      if (stickyBar && addBtn) {
        window.addEventListener('scroll', () => {
          const rect = addBtn.getBoundingClientRect();
          stickyBar.classList.toggle('is-visible', rect.bottom < 0);
        }, { passive: true });
      }

      // Tabs
      container.querySelectorAll('[data-rg-tab-btn]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-rg-tab-btn');
          container.querySelectorAll('[data-rg-tab-li]').forEach((li) => {
            li.classList.toggle('active', li.getAttribute('data-rg-tab-li') === target);
          });
          container.querySelectorAll('[data-rg-tab-panel]').forEach((panel) => {
            panel.hidden = panel.getAttribute('data-rg-tab-panel') !== target;
          });
        });
      });

      // Interactive Review Star Filter
      container.querySelectorAll('[data-rg-rev-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const rating = btn.getAttribute('data-rg-rev-filter');
          container.querySelectorAll('[data-rg-rev-filter]').forEach((b) => {
            b.classList.toggle('rg-btn--secondary', b === btn);
            b.classList.toggle('rg-btn--outline', b !== btn);
          });
          container.querySelectorAll('[data-review-rating]').forEach((card) => {
            card.hidden = rating !== 'all' && card.getAttribute('data-review-rating') !== rating;
          });
        });
      });

      // Review form toggle
      const revToggle = document.getElementById('rg-toggle-review-form');
      const revForm = document.getElementById('rg-demo-review-form');
      if (revToggle && revForm) {
        revToggle.addEventListener('click', () => {
          revForm.hidden = !revForm.hidden;
        });
        revForm.addEventListener('submit', (e) => {
          e.preventDefault();
          revForm.hidden = true;
          window.RG.ui.toast('Thank you! Demo review submitted for moderation.');
        });
      }
    },

    renderRelatedAndRecent(product) {
      const relatedGrid = document.getElementById('rg-related-products-grid');
      if (relatedGrid) {
        const others = window.RG.data.getProducts()
          .filter((p) => p.id !== product.id)
          .slice(0, 4);
        relatedGrid.innerHTML = others.map((p) => window.RG.ui.renderProductCard(p)).join('');
      }

      const recentGrid = document.getElementById('rg-recently-viewed-grid');
      if (recentGrid) {
        const recents = window.RG.wishlist.getRecentlyViewed(product.id);
        const list = recents.length ? recents.slice(0, 4) : window.RG.data.getProducts().slice(4, 8);
        recentGrid.innerHTML = list.map((p) => window.RG.ui.renderProductCard(p)).join('');
      }
    },

    injectJsonLd(product) {
      const existing = document.getElementById('rg-product-jsonld');
      if (existing) existing.remove();
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'rg-product-jsonld';
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        sku: product.sku,
        description: product.short_description,
        brand: { '@type': 'Brand', name: 'ReGongches' },
        countryOfOrigin: 'Pakistan',
        offers: {
          '@type': 'Offer',
          priceCurrency: 'PKR',
          price: product.price,
          availability: 'https://schema.org/InStock'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.review_count
        }
      });
      document.head.appendChild(script);
    }
  };

  window.RG = window.RG || {};
  window.RG.productPage = RGProductPage;
})(window, document);
