/* ==========================================================================
   ReGongches Single Product Page Controller (assets/js/product.js)
   Handles gallery, size buttons, size guide, dispatch calculator,
   city delivery estimator, THE ORIGIN CARD, reviews, and JSON-LD schema.
   ========================================================================== */
(function (window, document) {
  'use strict';

  function formatFutureDate(daysToAdd) {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    return d.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
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
      document.title = `${product.name} (${product.region}) — ReGongches`;

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

      container.innerHTML = `
        <div class="rg-single-product-grid">
          <!-- Gallery Column (.woocommerce-product-gallery) -->
          <div class="woocommerce-product-gallery">
            <div class="woocommerce-product-gallery__main" id="rg-gallery-main" title="Click to open zoom lightbox">
              <img src="${product.images[0].src}" alt="${product.images[0].alt}" id="rg-gallery-main-img" width="640" height="800">
              <span class="rg-badge rg-badge--hand-finished" style="position:absolute;inset-block-end:12px;inset-inline-end:12px;">Click to Zoom</span>
            </div>
            <div class="woocommerce-product-gallery__thumbs">
              ${product.images.map((img, idx) => `
                <button type="button" class="woocommerce-product-gallery__thumb ${idx === 0 ? 'is-active' : ''}" data-rg-thumb="${img.src}" data-rg-thumb-alt="${img.alt}">
                  <img src="${img.src}" alt="${img.alt}" width="120" height="120">
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Summary Column (.summary.entry-summary) -->
          <div class="summary entry-summary">
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-block-end:12px;">
              <a href="region.html?region=${product.region.toLowerCase()}" class="rg-badge rg-badge--new">${product.region} Origin</a>
              <span class="rg-badge rg-badge--handmade">${product.craft_type}</span>
              ${product.availability === 'made-to-order' ? '<span class="rg-badge rg-badge--mto">Made-to-Order</span>' : '<span class="rg-badge rg-badge--verified">Ready to Ship</span>'}
            </div>

            <!-- WP: the_title() -->
            <h1 class="product_title entry-title" style="margin-block-end:8px;">${product.name}</h1>

            <div style="display:flex;align-items:center;gap:16px;margin-block-end:16px;font-size:var(--text-sm);">
              <a href="#tab-reviews" class="star-rating">★ ${product.rating.toFixed(1)} (${product.review_count} verified reviews)</a>
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

                <!-- Colour Swatches -->
                <div style="margin-block:16px;">
                  <label style="font-weight:700;font-size:var(--text-sm);display:block;margin-block-end:8px;">
                    Colour: <span id="rg-selected-colour-label">${colours[0]}</span>
                  </label>
                  <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${colours.map((c, idx) => `
                      <button type="button" class="rg-btn rg-btn--sm ${idx === 0 ? 'rg-btn--secondary' : 'rg-btn--outline'}" data-rg-colour-btn="${c}">
                        ${c.replace(/\s*\(#[0-9A-Fa-f]{6}\)/, '')}
                      </button>
                    `).join('')}
                  </div>
                </div>

                ${product.customisable ? `
                <!-- Customisation Panel -->
                <details style="background:var(--bg-secondary);padding:12px 16px;border-radius:var(--radius-card);border:1px solid var(--rg-border);margin-block:16px;">
                  <summary style="font-weight:600;font-size:var(--text-sm);cursor:pointer;">
                    + Optional Customisation (Embroidery Thread / Bespoke Fit Note)
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

              <!-- Stock & Dispatch Calculator + City Delivery Estimator -->
              <div style="background:var(--bg-elevated);border:1px solid var(--rg-border);border-radius:var(--radius-card);padding:14px 16px;margin-block:16px;display:grid;gap:10px;">
                <div style="display:flex;align-items:center;gap:8px;font-size:var(--text-sm);font-weight:600;color:var(--rg-success);">
                  <svg width="18" height="18" aria-hidden="true"><use href="#icon-truck"></use></svg>
                  <span>${dispatchHeadline}</span>
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
                  Add to Heritage Bag — ${fmt(product.price)}
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

            <!-- SIGNATURE FEATURE: THE ORIGIN CARD -->
            <section class="rg-origin-card" aria-label="Product Origin and Craft Verification">
              <div class="rg-origin-card__header">
                <h2 class="rg-origin-card__title">
                  <svg width="20" height="20" aria-hidden="true"><use href="#icon-shield"></use></svg>
                  The ReGongches Origin Card
                </h2>
                ${verifiedBadgeHtml}
              </div>

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
                  <span class="rg-origin-card__label">Region / District</span>
                  <span class="rg-origin-card__value">${product.district || product.region}</span>
                </div>
                <div class="rg-origin-card__item">
                  <span class="rg-origin-card__label">Material Composition</span>
                  <span class="rg-origin-card__value">${(product.attributes.material || []).join(', ')}</span>
                </div>
                <div class="rg-origin-card__item">
                  <span class="rg-origin-card__label">Craft Classification</span>
                  <span class="rg-origin-card__value" style="text-transform:capitalize;">${product.craft_type} (${product.technique})</span>
                </div>
                <div class="rg-origin-card__item">
                  <span class="rg-origin-card__label">Time to Make</span>
                  <span class="rg-origin-card__value">${product.time_to_make || '3–5 days'}</span>
                </div>
              </div>

              <div style="font-size:var(--text-sm);color:var(--text-secondary);border-block-start:1px dashed var(--rg-border-strong);padding-block-start:12px;">
                <strong style="color:var(--text-primary);">Cultural Context:</strong> ${product.cultural_story}
              </div>
            </section>

            <!-- Trust Row -->
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;font-size:var(--text-xs);padding:12px;background:var(--bg-secondary);border-radius:var(--radius-editorial);">
              <div>✓ Nationwide Tracked Delivery</div>
              <div>✓ 7-Day Easy Size Exchange</div>
              <div>✓ Printed Origin Card Included</div>
              <div>✓ Transparent Craft Classification</div>
            </div>
          </div>
        </div>

        <!-- WooCommerce Tabs (.woocommerce-tabs.wc-tabs-wrapper) -->
        <div class="woocommerce-tabs wc-tabs-wrapper">
          <ul class="tabs wc-tabs" role="tablist">
            <li class="active" data-rg-tab-li="desc"><button type="button" data-rg-tab-btn="desc">Description</button></li>
            <li data-rg-tab-li="care"><button type="button" data-rg-tab-btn="care">Materials & Care</button></li>
            <li data-rg-tab-li="fit"><button type="button" data-rg-tab-btn="fit">Size & Fit</button></li>
            <li data-rg-tab-li="shipping"><button type="button" data-rg-tab-btn="shipping">Shipping & Exchanges</button></li>
            <li data-rg-tab-li="story"><button type="button" data-rg-tab-btn="story">Cultural Story</button></li>
          </ul>
          <div class="woocommerce-Tabs-panel" data-rg-tab-panel="desc">
            <p>${product.description}</p>
          </div>
          <div class="woocommerce-Tabs-panel" data-rg-tab-panel="care" hidden>
            <h3 style="margin-block-end:12px;">Materials & Seasonal Care Instructions</h3>
            <p><strong>Materials:</strong> ${(product.attributes.material || []).join(' · ')}</p>
            <ul style="list-style:disc;padding-inline-start:20px;display:grid;gap:8px;">
              ${(product.care || []).map((c) => `<li>${c}</li>`).join('')}
            </ul>
          </div>
          <div class="woocommerce-Tabs-panel" data-rg-tab-panel="fit" hidden>
            <h3 style="margin-block-end:12px;">Measurements & Fit Guidance</h3>
            <p>Every piece is measured in both centimetres and inches prior to dispatch. Click the <strong>Size Guide</strong> button above to inspect exact dimensions.</p>
          </div>
          <div class="woocommerce-Tabs-panel" data-rg-tab-panel="shipping" hidden>
            <h3 style="margin-block-end:12px;">Nationwide Tracked Delivery & 7-Day Size Exchange</h3>
            <p>Orders over PKR 5,000 qualify for free tracked courier delivery across Pakistan. Ready-to-ship sizes can be exchanged within 7 days of delivery if unworn with the Origin Card attached.</p>
          </div>
          <div class="woocommerce-Tabs-panel" data-rg-tab-panel="story" hidden>
            <h3 style="margin-block-end:12px;">Regional Tradition & Verification</h3>
            <p>${product.cultural_story}</p>
          </div>
        </div>

        <!-- Reviews Section -->
        <section id="tab-reviews" style="padding-block:var(--space-8);border-block-start:1px solid var(--rg-border);">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:16px;margin-block-end:24px;">
            <div>
              <span class="rg-section__eyebrow">Customer Feedback (Sample Placeholders)</span>
              <h2>Verified Customer Reviews (${product.rating.toFixed(1)} ★)</h2>
              <p style="font-size:var(--text-sm);color:var(--text-secondary);margin:0;">Fit Consensus: <strong>92% say True to Size</strong></p>
            </div>
            <button type="button" class="rg-btn rg-btn--outline rg-btn--sm" id="rg-toggle-review-form">Write a Review (Demo)</button>
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

          <div class="rg-grid rg-grid--3">
            ${reviews.map((r) => window.RG.ui.renderReviewCard(r)).join('')}
          </div>
        </section>
      `;

      this.bindProductInteractions(container, product);
      this.renderRelatedAndRecent(product);
    },

    bindProductInteractions(container, product) {
      // Gallery thumbnails
      const mainImg = document.getElementById('rg-gallery-main-img');
      container.querySelectorAll('[data-rg-thumb]').forEach((btn) => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('[data-rg-thumb]').forEach((b) => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          if (mainImg) {
            mainImg.src = btn.getAttribute('data-rg-thumb');
            mainImg.alt = btn.getAttribute('data-rg-thumb-alt') || product.name;
          }
        });
      });

      // Lightbox zoom
      const mainBox = document.getElementById('rg-gallery-main');
      if (mainBox && mainImg) {
        mainBox.addEventListener('click', () => {
          const modal = document.getElementById('rg-quickview-modal');
          const body = document.getElementById('rg-quickview-body');
          if (modal && body) {
            body.innerHTML = `<img src="${mainImg.src}" alt="${mainImg.alt}" style="width:100%;max-height:80vh;object-fit:contain;margin-inline:auto;">`;
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

      // Colour buttons
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
        });
      });

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
      const addBtn = document.getElementById('rg-main-add-to-cart');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const sizeEl = container.querySelector('[data-rg-size-btn].is-selected');
          const colEl = container.querySelector('[data-rg-colour-btn].rg-btn--secondary');
          const customEl = document.getElementById('rg-custom-note-input');
          const wrapEl = document.getElementById('rg-product-giftwrap');
          const qty = qtyInput ? Number(qtyInput.value) : 1;

          const size = sizeEl ? sizeEl.getAttribute('data-rg-size-btn') : 'Standard';
          const colour = colEl ? colEl.getAttribute('data-rg-colour-btn') : 'Default';
          const customNote = customEl ? customEl.value.trim() : '';

          window.RG.cart.addItem(product.id, qty, { size, colour, customNote });
          if (wrapEl && wrapEl.checked) {
            window.RG.cart.setGiftWrap(true);
          }
          window.RG.ui.openDrawer('rg-minicart-drawer');
          window.RG.ui.toast(`Added ${qty} × "${product.name}" (${size}) to your bag.`);
        });
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
