/* ==========================================================================
   ReGongches UI Components & WP Partial Renderers (assets/js/ui.js)
   Contains single-source render functions mirroring future PHP partials.
   ========================================================================== */
(function (window, document) {
  'use strict';

  const SWATCH_MAP = {
    'Snow Wool': '#F7F4EE',
    'Walnut Brown': '#5C4033',
    'Charcoal Slate': '#36393F',
    'Heritage Maroon': '#7A1F2B',
    'Mountain Blue': '#1F3A5F',
    'Antique Gold': '#B8913A',
    'Camel Bark': '#9C7A54',
    'Natural Walnut': '#6E5239',
    'Emerald Pine': '#2F6B4F'
  };

  const RGUI = {
    /* <!-- WP PARTIAL: template-parts/content-product-card.php --> */
    renderProductCard(product) {
      if (!product) return '';
      const fmt = window.RG.data.formatPKR;
      const inWishlist = window.RG.wishlist && window.RG.wishlist.has(product.id);
      const img1 = (product.images && product.images[0] && product.images[0].src) || 'assets/img/heritage-flatlay.webp';
      const img1Alt = (product.images && product.images[0] && product.images[0].alt) || product.name;
      const img2 = (product.images && product.images[1] && product.images[1].src) || img1;

      const badges = [];
      if (product.sale_price && product.sale_price < product.regular_price) {
        badges.push('<span class="onsale rg-badge rg-badge--sale">Sale</span>');
      }
      if (product.is_new) {
        badges.push('<span class="rg-badge rg-badge--new">New</span>');
      }
      if (product.craft_type === 'handmade') {
        badges.push('<span class="rg-badge rg-badge--handmade">Handmade</span>');
      } else if (product.craft_type === 'hand-finished') {
        badges.push('<span class="rg-badge rg-badge--hand-finished">Hand-Finished</span>');
      }
      if (product.availability === 'made-to-order') {
        badges.push('<span class="rg-badge rg-badge--mto">Made to Order</span>');
      } else if (product.stock_quantity && product.stock_quantity <= 5) {
        badges.push('<span class="rg-badge rg-badge--mto">Low Stock</span>');
      }

      const priceHtml = (product.sale_price && product.sale_price < product.regular_price)
        ? `<span class="price"><del><span class="woocommerce-Price-amount amount">${fmt(product.regular_price)}</span></del> <ins><span class="woocommerce-Price-amount amount">${fmt(product.sale_price)}</span></ins></span>`
        : `<span class="price"><span class="woocommerce-Price-amount amount">${fmt(product.price)}</span></span>`;

      const colours = (product.attributes && product.attributes.colour) || [];
      const swatchesHtml = colours.slice(0, 4).map((c, idx) => {
        const hexMatch = c.match(/#[0-9A-Fa-f]{6}/);
        const hex = hexMatch ? hexMatch[0] : (SWATCH_MAP[c] || '#7A1F2B');
        const label = c.replace(/\s*\(#[0-9A-Fa-f]{6}\)/, '');
        return `<span class="rg-swatch ${idx === 0 ? 'is-selected' : ''}" style="background-color:${hex}" title="${label}" aria-label="${label}"></span>`;
      }).join('');

      return `
        <!-- WP PARTIAL: template-parts/content-product-card.php -->
        <li class="product type-product status-publish instock" data-product-id="${product.id}">
          <div class="rg-product-card__media">
            <div class="rg-product-card__badges">${badges.join('')}</div>
            <button type="button" class="rg-product-card__wishlist ${inWishlist ? 'is-active' : ''}" data-rg-wishlist-toggle="${product.id}" aria-label="Save ${product.name} to wishlist">
              <svg width="18" height="18" aria-hidden="true"><use href="#icon-heart"></use></svg>
            </button>
            <a href="product.html?id=${product.id}" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
              <img src="${img1}" alt="${img1Alt}" width="640" height="800" loading="lazy" class="rg-product-card__img-primary">
              <img src="${img2}" alt="${img1Alt} detail view" width="640" height="800" loading="lazy" class="rg-product-card__img-secondary">
            </a>
            <button type="button" class="rg-product-card__quickview" data-rg-quick-view="${product.id}">
              Quick View
            </button>
          </div>
          <div class="rg-product-card__body">
            <div class="rg-product-card__meta">
              <a href="region.html?region=${product.region.toLowerCase()}" class="rg-product-card__region">${product.region}</a>
              <div class="star-rating" aria-label="Rated ${product.rating} out of 5">
                <span>★ ${product.rating.toFixed(1)}</span>
                <span style="color:var(--text-secondary);font-weight:400">(${product.review_count})</span>
              </div>
            </div>
            <h2 class="woocommerce-loop-product__title">
              <!-- WP: the_title() -->
              <a href="product.html?id=${product.id}">${product.name}</a>
            </h2>
            <!-- WP: wc_price() -->
            ${priceHtml}
            <div class="rg-swatches" aria-label="Available colours">${swatchesHtml}</div>
            <div class="rg-product-card__footer">
              <a href="product.html?id=${product.id}" class="button add_to_cart_button" data-rg-add-to-cart="${product.id}">
                Add to Bag
              </a>
            </div>
          </div>
        </li>
      `;
    },

    /* <!-- WP PARTIAL: template-parts/content-artisan-card.php --> */
    renderArtisanCard(artisan) {
      if (!artisan) return '';
      return `
        <!-- WP PARTIAL: template-parts/content-artisan-card.php -->
        <article class="post rg-artisan-card" style="background:var(--bg-elevated);border:1px solid var(--rg-border);border-radius:var(--radius-card);overflow:hidden;display:flex;flex-direction:column;">
          <div style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-5);background:var(--bg-secondary);border-block-end:1px solid var(--rg-border);">
            <img src="${artisan.avatar}" alt="${artisan.name}" width="76" height="76" loading="lazy" style="width:76px;height:76px;border-radius:50%;object-fit:cover;border:2px solid var(--brand-accent);">
            <div>
              <span class="rg-badge rg-badge--handmade" style="margin-block-end:4px;">${artisan.region}</span>
              <h3 class="entry-title" style="font-size:var(--text-md);"><a href="artisan.html?id=${artisan.id}">${artisan.name}</a></h3>
              <p style="font-size:var(--text-xs);color:var(--text-secondary);margin:0;">${artisan.craft}</p>
            </div>
          </div>
          <div style="padding:var(--space-5);display:flex;flex-direction:column;flex:1;gap:var(--space-3);">
            <blockquote style="font-style:italic;font-size:var(--text-sm);color:var(--text-primary);border-inline-start:3px solid var(--brand-accent);padding-inline-start:var(--space-3);">
              "${artisan.quote}"
            </blockquote>
            <p style="font-size:var(--text-xs);color:var(--text-secondary);margin:0;">${artisan.shortBio}</p>
            <div style="margin-block-start:auto;padding-block-start:var(--space-3);display:flex;align-items:center;justify-content:space-between;border-block-start:1px dashed var(--rg-border);">
              <span style="font-size:11px;color:var(--text-secondary);">${artisan.permissionStatus}</span>
              <a href="artisan.html?id=${artisan.id}" class="rg-btn rg-btn--outline rg-btn--sm">View Profile</a>
            </div>
          </div>
        </article>
      `;
    },

    /* <!-- WP PARTIAL: template-parts/content-journal-card.php --> */
    renderJournalCard(post) {
      if (!post) return '';
      return `
        <!-- WP PARTIAL: template-parts/content-journal-card.php -->
        <article class="post rg-journal-card" style="background:var(--bg-elevated);border:1px solid var(--rg-border);border-radius:var(--radius-card);overflow:hidden;display:flex;flex-direction:column;">
          <a href="journal-post.html?id=${post.id}" style="aspect-ratio:16/10;overflow:hidden;background:var(--bg-secondary);">
            <img src="${post.image}" alt="${post.title}" width="640" height="400" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
          </a>
          <div style="padding:var(--space-5);display:flex;flex-direction:column;flex:1;gap:var(--space-2);">
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:var(--text-xs);color:var(--text-secondary);">
              <span style="font-weight:700;color:var(--brand-secondary);text-transform:uppercase;">${post.category}</span>
              <span>${post.readingTime} · ${post.date}</span>
            </div>
            <h3 class="entry-title" style="font-size:var(--text-lg);margin-block:4px;">
              <!-- WP: the_title() -->
              <a href="journal-post.html?id=${post.id}">${post.title}</a>
            </h3>
            <p style="font-size:var(--text-sm);color:var(--text-secondary);flex:1;">${post.excerpt}</p>
            <a href="journal-post.html?id=${post.id}" style="font-size:var(--text-sm);font-weight:600;color:var(--brand-primary);display:inline-flex;align-items:center;gap:4px;">
              Read Story →
            </a>
          </div>
        </article>
      `;
    },

    /* <!-- WP PARTIAL: template-parts/content-review-card.php --> */
    renderReviewCard(rev) {
      if (!rev) return '';
      const stars = '★'.repeat(rev.rating) + '☆'.repeat(Math.max(0, 5 - rev.rating));
      return `
        <!-- WP PARTIAL: template-parts/content-review-card.php (Sample placeholder review) -->
        <article class="rg-review-card" style="background:var(--bg-elevated);border:1px solid var(--rg-border);border-radius:var(--radius-card);padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-3);">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);">
            <span class="star-rating" aria-label="${rev.rating} out of 5 stars">${stars}</span>
            <span class="rg-badge rg-badge--hand-finished">${rev.source} · ${rev.date}</span>
          </div>
          <h4 style="font-size:var(--text-base);margin:0;">"${rev.title}"</h4>
          <p style="font-size:var(--text-sm);color:var(--text-secondary);margin:0;flex:1;">${rev.comment}</p>
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:var(--text-xs);padding-block-start:var(--space-3);border-block-start:1px dashed var(--rg-border);">
            <strong>${rev.reviewer}</strong>
            <span style="color:var(--rg-success);font-weight:600;">Fit: ${rev.fitScore}</span>
          </div>
        </article>
      `;
    },

    toast(message, options = {}) {
      let stack = document.getElementById('rg-toast-stack');
      if (!stack) {
        stack = document.createElement('div');
        stack.id = 'rg-toast-stack';
        stack.className = 'rg-toast-stack';
        stack.setAttribute('aria-live', 'polite');
        document.body.appendChild(stack);
      }
      const el = document.createElement('div');
      el.className = 'rg-toast';
      el.innerHTML = `
        <span>${message}</span>
        ${options.undo ? '<button type="button" class="rg-btn rg-btn--sm" style="background:var(--rg-antique-gold);color:#1A1A1A;min-height:30px;padding:4px 10px;" data-rg-toast-undo>Undo</button>' : ''}
      `;
      stack.appendChild(el);
      if (options.undo) {
        const undoBtn = el.querySelector('[data-rg-toast-undo]');
        if (undoBtn) {
          undoBtn.addEventListener('click', () => {
            options.undo();
            el.remove();
          });
        }
      }
      setTimeout(() => {
        if (el.parentNode) el.remove();
      }, 4200);
    },

    openSizeGuideModal(type = 'cap') {
      const modal = document.getElementById('rg-size-guide-modal');
      if (!modal) return;
      const tabs = modal.querySelectorAll('[data-size-tab]');
      const panels = modal.querySelectorAll('[data-size-panel]');
      const activeType = (type === 'none' || !type) ? 'cap' : type;
      tabs.forEach((t) => {
        const match = t.getAttribute('data-size-tab') === activeType;
        t.classList.toggle('rg-btn--primary', match);
        t.classList.toggle('rg-btn--outline', !match);
      });
      panels.forEach((p) => {
        p.hidden = p.getAttribute('data-size-panel') !== activeType;
      });
      this.openModal('rg-size-guide-modal');
    },

    openQuickView(productId) {
      const product = window.RG.data.getProductById(productId);
      const modal = document.getElementById('rg-quickview-modal');
      const body = document.getElementById('rg-quickview-body');
      if (!product || !modal || !body) return;

      const fmt = window.RG.data.formatPKR;
      const sizes = (product.attributes && product.attributes.size) || ['Standard'];
      const colours = (product.attributes && product.attributes.colour) || ['Default'];

      body.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:var(--space-6);align-items:start;">
          <div>
            <img src="${product.images[0].src}" alt="${product.images[0].alt}" style="width:100%;border-radius:var(--radius-card);border:1px solid var(--rg-border);">
          </div>
          <div>
            <div style="display:flex;gap:8px;margin-block-end:8px;">
              <span class="rg-badge rg-badge--handmade">${product.region}</span>
              <span class="rg-badge rg-badge--hand-finished">${product.craft_type}</span>
            </div>
            <h2 style="font-size:var(--text-xl);margin-block-end:8px;">${product.name}</h2>
            <p class="price" style="font-size:var(--text-lg);margin-block-end:12px;">${fmt(product.price)}</p>
            <p style="font-size:var(--text-sm);color:var(--text-secondary);">${product.short_description}</p>
            <div style="margin-block:14px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-block-end:6px;">
                <strong style="font-size:var(--text-xs);text-transform:uppercase;">Select Size</strong>
                <button type="button" style="font-size:var(--text-xs);color:var(--brand-secondary);text-decoration:underline;font-weight:600;" data-rg-open-size-guide="${product.size_guide_type}">Size Guide (cm/in)</button>
              </div>
              <div class="rg-size-buttons" data-qv-sizes>
                ${sizes.map((s, idx) => `<button type="button" class="rg-size-btn ${idx === 0 ? 'is-selected' : ''}" data-qv-size="${s}">${s}</button>`).join('')}
              </div>
            </div>
            <div style="margin-block-end:16px;">
              <strong style="font-size:var(--text-xs);text-transform:uppercase;display:block;margin-block-end:6px;">Colour: <span data-qv-colour-label>${colours[0]}</span></strong>
              <div style="display:flex;gap:8px;">
                ${colours.map((c, idx) => `<button type="button" class="rg-btn rg-btn--sm ${idx === 0 ? 'rg-btn--secondary' : 'rg-btn--outline'}" data-qv-colour="${c}">${c.replace(/\s*\(#[0-9A-Fa-f]{6}\)/, '')}</button>`).join('')}
              </div>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <button type="button" class="rg-btn rg-btn--primary" style="flex:1;" data-qv-add="${product.id}">Add to Bag — ${fmt(product.price)}</button>
              <a href="product.html?id=${product.id}" class="rg-btn rg-btn--outline">Full Details & Origin Card</a>
            </div>
          </div>
        </div>
      `;

      body.querySelectorAll('[data-qv-size]').forEach((btn) => {
        btn.addEventListener('click', () => {
          body.querySelectorAll('[data-qv-size]').forEach((b) => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
        });
      });

      body.querySelectorAll('[data-qv-colour]').forEach((btn) => {
        btn.addEventListener('click', () => {
          body.querySelectorAll('[data-qv-colour]').forEach((b) => {
            b.classList.remove('rg-btn--secondary');
            b.classList.add('rg-btn--outline');
          });
          btn.classList.add('rg-btn--secondary');
          btn.classList.remove('rg-btn--outline');
          const lbl = body.querySelector('[data-qv-colour-label]');
          if (lbl) lbl.textContent = btn.getAttribute('data-qv-colour');
        });
      });

      const addBtn = body.querySelector('[data-qv-add]');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const selSizeEl = body.querySelector('[data-qv-size].is-selected');
          const selColEl = body.querySelector('[data-qv-colour].rg-btn--secondary');
          const size = selSizeEl ? selSizeEl.getAttribute('data-qv-size') : sizes[0];
          const colour = selColEl ? selColEl.getAttribute('data-qv-colour') : colours[0];
          window.RG.cart.addItem(product.id, 1, { size, colour });
          this.closeModal('rg-quickview-modal');
          this.openDrawer('rg-minicart-drawer');
          this.toast(`Added "${product.name}" (${size}) to your bag.`);
        });
      }

      this.openModal('rg-quickview-modal');
    },

    openModal(id) {
      const m = document.getElementById(id);
      const backdrop = document.getElementById('rg-global-backdrop');
      if (m) m.classList.add('is-open');
      if (backdrop) backdrop.classList.add('is-open');
    },

    closeModal(id) {
      const m = document.getElementById(id);
      const backdrop = document.getElementById('rg-global-backdrop');
      if (m) m.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-open');
    },

    openDrawer(id) {
      const d = document.getElementById(id);
      const backdrop = document.getElementById('rg-global-backdrop');
      if (d) d.classList.add('is-open');
      if (backdrop) backdrop.classList.add('is-open');
    },

    closeAllOverlays() {
      document.querySelectorAll('.rg-drawer.is-open, .rg-modal.is-open, .rg-search-overlay.is-open, .rg-filter-sidebar.is-open').forEach((el) => {
        el.classList.remove('is-open');
      });
      const backdrop = document.getElementById('rg-global-backdrop');
      if (backdrop) backdrop.classList.remove('is-open');
    },

    renderMiniCart() {
      const summary = window.RG.cart.getSummary();
      const fmt = window.RG.data.formatPKR;

      document.querySelectorAll('[data-rg-cart-count]').forEach((el) => {
        el.textContent = summary.count;
        el.classList.add('is-bouncing');
        setTimeout(() => el.classList.remove('is-bouncing'), 250);
      });

      const body = document.getElementById('rg-minicart-body');
      const footer = document.getElementById('rg-minicart-footer');
      if (!body || !footer) return;

      const shipMsg = summary.freeShippingRemaining > 0
        ? `You're <strong>${fmt(summary.freeShippingRemaining)}</strong> away from free nationwide delivery`
        : `<strong style="color:var(--rg-success);">✓ You've unlocked Free Tracked Delivery across Pakistan!</strong>`;

      if (summary.items.length === 0) {
        const suggested = window.RG.data.getProducts().slice(0, 3);
        body.innerHTML = `
          <div style="text-align:center;padding-block:var(--space-6);">
            <p style="font-family:var(--font-display);font-size:var(--text-lg);margin-block-end:8px;">Your heritage bag is empty</p>
            <p style="font-size:var(--text-sm);color:var(--text-secondary);margin-block-end:16px;">Explore authentic caps, hand-loomed shawls, and gift sets from Gilgit-Baltistan.</p>
            <a href="shop.html" class="rg-btn rg-btn--primary rg-btn--sm">Browse Catalogue</a>
          </div>
          <hr class="rg-stitch-line" style="margin-block:16px;">
          <h4 style="font-size:var(--text-xs);text-transform:uppercase;letter-spacing:0.08em;margin-block-end:12px;">Popular Mountain Pieces</h4>
          <div style="display:grid;gap:12px;">
            ${suggested.map((p) => `
              <div style="display:flex;align-items:center;gap:12px;padding:8px;background:var(--bg-secondary);border-radius:var(--radius-editorial);">
                <img src="${p.images[0].src}" alt="${p.name}" width="52" height="64" style="width:52px;height:64px;object-fit:cover;border-radius:4px;">
                <div style="flex:1;">
                  <a href="product.html?id=${p.id}" style="font-weight:600;font-size:var(--text-xs);display:block;">${p.name}</a>
                  <span style="font-size:12px;color:var(--text-secondary);">${fmt(p.price)}</span>
                </div>
                <button type="button" class="rg-btn rg-btn--outline rg-btn--sm" data-rg-add-to-cart="${p.id}">+ Add</button>
              </div>
            `).join('')}
          </div>
        `;
        footer.innerHTML = '';
        return;
      }

      body.innerHTML = `
        <div class="rg-shipping-bar">
          <div style="font-size:var(--text-xs);">${shipMsg}</div>
          <div class="rg-shipping-bar__track">
            <div class="rg-shipping-bar__fill" style="width:${summary.freeShippingProgress}%"></div>
          </div>
        </div>
        <div style="display:grid;gap:var(--space-4);">
          ${summary.items.map((item) => `
            <div style="display:flex;gap:12px;padding-block-end:12px;border-block-end:1px solid var(--rg-border);">
              <a href="product.html?id=${item.productId}">
                <img src="${item.image}" alt="${item.name}" width="64" height="80" style="width:64px;height:80px;object-fit:cover;border-radius:var(--radius-editorial);border:1px solid var(--rg-border);">
              </a>
              <div style="flex:1;">
                <div style="display:flex;justify-content:space-between;gap:8px;">
                  <a href="product.html?id=${item.productId}" style="font-weight:600;font-size:var(--text-sm);">${item.name}</a>
                  <button type="button" aria-label="Remove ${item.name}" data-rg-cart-remove="${item.key}" style="color:var(--text-secondary);">✕</button>
                </div>
                <div style="font-size:12px;color:var(--text-secondary);margin-block:2px 6px;">
                  ${item.size} · ${item.colour.replace(/\s*\(#[0-9A-Fa-f]{6}\)/, '')}
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <div class="quantity" style="height:32px;">
                    <button type="button" style="width:28px;height:30px;" data-rg-cart-dec="${item.key}" aria-label="Decrease quantity">−</button>
                    <input type="number" class="qty" value="${item.qty}" min="1" max="99" style="width:34px;height:30px;font-size:12px;" readonly aria-label="Quantity">
                    <button type="button" style="width:28px;height:30px;" data-rg-cart-inc="${item.key}" aria-label="Increase quantity">+</button>
                  </div>
                  <strong style="font-size:var(--text-sm);">${fmt(item.price * item.qty)}</strong>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      footer.innerHTML = `
        <label style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:var(--text-xs);padding:8px 10px;background:var(--bg-elevated);border:1px solid var(--rg-border);border-radius:var(--radius-editorial);margin-block-end:12px;cursor:pointer;">
          <span><input type="checkbox" data-rg-giftwrap-toggle ${summary.giftWrap ? 'checked' : ''}> Add heritage gift wrap & origin card (+PKR 300)</span>
        </label>
        <div style="display:flex;justify-content:space-between;font-size:var(--text-base);font-weight:700;margin-block-end:12px;">
          <span>Subtotal</span>
          <span>${fmt(summary.total)}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <a href="cart.html" class="rg-btn rg-btn--outline">View Bag</a>
          <a href="checkout.html" class="rg-btn rg-btn--primary">Checkout</a>
        </div>
      `;
    }
  };

  window.RG = window.RG || {};
  window.RG.ui = RGUI;
})(window, document);
