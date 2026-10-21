/**
 * ReGongches — Threads of Mountain Heritage
 * Application Entrypoint & Page-Specific View Builders (main.js)
 * ============================================================================
 * Renders interactive sections across:
 *  - Home (`index.html`): Lookbook with hotspots, Interactive 7-District GB SVG Map & Explorer,
 *    Themed Product Rails, Founder/Artisan's Pick, 4-Step Authenticity Promise, Journal Teasers,
 *    Recently Viewed.
 *  - Shop (`shop.html`): Full 16-product archive with URL-synced multi-facet filters.
 *  - Product Detail (`product.html?id=...` or `#product/slug`): Shareable PDP with 3-angle gallery,
 *    hover-zoom loupe + mobile tap-zoom, swatches, sizes, Provenance Passport, tabs/accordions,
 *    Complete the Look, sticky mobile ATC bar (coordinated with floating WhatsApp), and dynamic
 *    Product JSON-LD schema in PKR.
 *  - Collections (`collections.html`), Story (`story.html`), Journal (`journal.html`),
 *    Contact (`contact.html`), and 404 (`404.html`).
 */

'use strict';

window.RG = window.RG || {};

const App = {
  activeLookbookIdx: 0,
  activeHotspotIdx: 0,
  activeRegionIdx: 0,

  init() {
    window.RG.Store.init();
    window.RG.UI.init();
    window.RG.Cart.renderCartUI();
    window.RG.Wishlist.renderWishlistUI();
    window.RG.Compare.renderCompareUI();
    window.RG.Checkout.init();

    // Initialise page-specific components if their containers exist on the current page
    this.initDistrictMarquee();
    this.initLookbookSection();
    this.initRegionExplorerWithSvgMap();
    this.initThemedRailsSection();
    this.initFounderPickSection();
    this.initAuthenticityPromiseSection();
    this.initJournalSection();
    this.initRecentlyViewedSection();
    this.initProductDetailPage();
    this.initContactPage();
    this.initStandalonePages();

    if (document.getElementById('product-grid')) {
      window.RG.Filters.init();
    }

    window.RG.Motion.init();
    this.checkLaunchReadiness();
  },

  checkLaunchReadiness() {
    const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:';
    if (!isDev) return;

    const issues = [];
    const cfg = window.RG?.CONFIG;
    if (!cfg) return;

    if (!cfg.orderHandoff?.endpointUrl) {
      issues.push('CONFIG.orderHandoff.endpointUrl is blank (Formspree or Google Apps Script webhook needed for automatic backend order logging).');
    }
    if (cfg.contact?.whatsappNumber === '923001234567') {
      issues.push('CONFIG.contact.whatsappNumber has placeholder digits "923001234567".');
    }
    if (cfg.payment?.bank?.iban === 'PK36 MEZN 0001 2345 6789 0102') {
      issues.push('CONFIG.payment.bank.iban has placeholder IBAN.');
    }

    if (issues.length) {
      console.warn(
        `%c✦ ReGongches Storefront Launch Readiness Audit ✦\n%cThe following ${issues.length} items must be configured before production deployment:\n` +
        issues.map((it, i) => ` ${i + 1}. ${it}`).join('\n') +
        '\n\nSee config.js and DEPLOYMENT.md for step-by-step setup instructions.',
        'color:#d97b54;font-weight:bold;font-size:14px;',
        'color:#4f5b63;font-size:12px;'
      );
    }
  },

  /* ── 1. SLOW 7-DISTRICT MARQUEE STRIP (Inspired by Scrolltide) ── */
  initDistrictMarquee() {
    const wrap = document.getElementById('district-marquee-track');
    if (!wrap || !window.RG.REGIONS) return;
    const esc = window.RG.escapeHtml;
    const itemsHtml = window.RG.REGIONS.map(r => `
      <a href="shop.html?region=${encodeURIComponent(r.name)}" class="marquee-item">
        <span class="marquee-diamond" aria-hidden="true">✦</span>
        <strong>${esc(r.name)}</strong>
        <span class="marquee-meta">${esc(r.altitude.split('·')[0].trim())} · ${esc(r.artisanCount)}</span>
      </a>
    `).join('');
    // Duplicate once for seamless loop when motion is enabled
    wrap.innerHTML = itemsHtml + itemsHtml;
  },

  /* ── 2. SHOP THE MOUNTAIN LOOKBOOK (Hotspots + Tappable Mobile List + Bundle) ── */
  initLookbookSection() {
    const tabsEl = document.getElementById('lookbook-tabs');
    const stageEl = document.getElementById('lookbook-stage');
    if (!tabsEl || !stageEl || !window.RG.LOOKBOOK_ENSEMBLES) return;

    const render = () => {
      const ensembles = window.RG.LOOKBOOK_ENSEMBLES;
      const ensemble = ensembles[this.activeLookbookIdx] || ensembles[0];
      const esc = window.RG.escapeHtml;

      tabsEl.innerHTML = ensembles.map((ens, idx) => `
        <button type="button" class="lookbook-tab-btn ${idx === this.activeLookbookIdx ? 'is-active' : ''}"
          role="tab" aria-selected="${idx === this.activeLookbookIdx}" data-lb-idx="${idx}">
          ${esc(ens.title)} (${esc(ens.region)})
        </button>
      `).join('');

      tabsEl.querySelectorAll('[data-lb-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.activeLookbookIdx = parseInt(btn.dataset.lbIdx, 10);
          this.activeHotspotIdx = 0;
          render();
        });
      });

      const hotspotPins = ensemble.hotspots.map((hs, idx) => `
        <button type="button" class="lookbook-hotspot ${idx === this.activeHotspotIdx ? 'is-active' : ''}"
          style="left:${hs.x}%; top:${hs.y}%;"
          data-hotspot-idx="${idx}"
          aria-label="Pin ${idx + 1}: ${esc(hs.label)} (${esc(hs.note)})"
          aria-pressed="${idx === this.activeHotspotIdx}">
          <span>${idx + 1}</span>
        </button>
      `).join('');

      const piecesHtml = ensemble.hotspots.map((hs, idx) => {
        const prod = (window.RG.PRODUCTS || []).find(p => p.id === hs.productId);
        if (!prod) return '';
        return `
          <div class="lookbook-piece-item ${idx === this.activeHotspotIdx ? 'is-highlighted' : ''}" data-piece-idx="${idx}">
            <a href="product.html?id=${encodeURIComponent(prod.id)}" class="lookbook-piece-thumb">
              <img src="${esc(prod.images[0])}" data-fallback="${esc(prod.fallbackImage)}" alt="${esc(prod.name)}" width="64" height="80" loading="lazy">
            </a>
            <div class="lookbook-piece-info">
              <span class="lookbook-pin-tag">Pin 0${idx + 1} · ${esc(prod.region)}</span>
              <h4><a href="product.html?id=${encodeURIComponent(prod.id)}">${esc(prod.name)}</a></h4>
              <p>${esc(hs.note)}</p>
              <strong class="lookbook-piece-price">${window.RG.formatPrice(prod.price)}</strong>
            </div>
            <div class="lookbook-piece-actions">
              <button type="button" class="btn btn-primary btn-sm" data-quickadd-id="${esc(prod.id)}">+ Bag</button>
              <a href="product.html?id=${encodeURIComponent(prod.id)}" class="btn btn-secondary btn-sm">Details</a>
            </div>
          </div>
        `;
      }).join('');

      stageEl.innerHTML = `
        <div class="lookbook-canvas" role="region" aria-label="${esc(ensemble.title)} interactive ensemble diagram">
          <svg viewBox="0 0 400 520" class="lookbook-canvas-art" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(ensemble.title)} layered textile diagram">
            <rect x="20" y="20" width="360" height="480" rx="16" fill="rgba(255,255,255,0.04)" stroke="#C59A3D" stroke-width="1" opacity="0.5"/>
            <circle cx="200" cy="105" r="44" fill="#D8C4A8" opacity="0.25" stroke="#C59A3D" stroke-width="1.5"/>
            <path d="M148,96 C148,58 252,58 252,96 Z" fill="#C8B89A" stroke="#C59A3D" stroke-width="2"/>
            <rect x="142" y="90" width="116" height="22" rx="11" fill="#D8C4A8" stroke="#C59A3D" stroke-width="2"/>
            <path d="M115,165 L285,165 L305,425 L95,425 Z" fill="#2D5A3D" opacity="0.82" stroke="#C59A3D" stroke-width="2"/>
            <path d="M98,175 L195,165 L165,395 L88,370 Z" fill="#F7F1E7" opacity="0.9" stroke="#C59A3D" stroke-width="2"/>
            <rect x="92" y="340" width="76" height="18" fill="#7A263A"/>
            <rect x="122" y="310" width="156" height="18" rx="4" fill="#7A263A" stroke="#C59A3D" stroke-width="1.5"/>
            <text x="200" y="472" text-anchor="middle" fill="#C59A3D" font-family="Georgia, serif" font-size="14" font-style="italic">${esc(ensemble.title)}</text>
          </svg>
          ${hotspotPins}
        </div>
        <div class="lookbook-details">
          <div>
            <span class="eyebrow">${esc(ensemble.eyebrow)}</span>
            <h3>${esc(ensemble.title)}</h3>
            <p class="lookbook-sub">${esc(ensemble.subtitle)}</p>
            <div class="lookbook-piece-list" role="list" aria-label="Ensemble pieces">
              ${piecesHtml}
            </div>
          </div>
          <div class="lookbook-bundle-footer">
            <div>
              <span class="lookbook-bundle-label">Complete 4-Piece Ensemble</span>
              <strong class="lookbook-bundle-price">${window.RG.formatPrice(ensemble.totalPrice)}</strong>
              <span class="lookbook-bundle-savings">${esc(ensemble.savingsLabel)}</span>
            </div>
            <button type="button" class="btn btn-gold" id="add-entire-look-btn">
              <i class="ph ph-shopping-bag" aria-hidden="true"></i> Add Complete Look (4 Pieces)
            </button>
          </div>
        </div>
      `;

      stageEl.querySelectorAll('[data-hotspot-idx]').forEach(pin => {
        pin.addEventListener('click', () => {
          this.activeHotspotIdx = parseInt(pin.dataset.hotspotIdx, 10);
          render();
        });
      });

      stageEl.querySelectorAll('[data-piece-idx]').forEach(row => {
        row.addEventListener('click', (e) => {
          if (e.target.closest('button, a')) return;
          this.activeHotspotIdx = parseInt(row.dataset.pieceIdx, 10);
          render();
        });
      });

      document.getElementById('add-entire-look-btn')?.addEventListener('click', () => {
        ensemble.hotspots.forEach(hs => {
          const prod = (window.RG.PRODUCTS || []).find(p => p.id === hs.productId);
          if (prod) {
            window.RG.Cart.add(prod, 1, prod.sizes?.[0] || 'One Size', prod.colors?.[0]?.label || '', true);
          }
        });
        window.RG.Cart.applyPromo('HUNZA15', true);
        window.RG.UI.openCartDrawer();
        window.RG.Toast.show(`Added all 4 pieces from "${ensemble.title}" with 15% collector discount (HUNZA15)!`, 'cart', 4500);
      });
    };

    render();
    window.RG.Store.subscribe(render);
  },

  /* ── 3. INTERACTIVE 7-DISTRICT EXPLORER + SVG MAP OF GILGIT-BALTISTAN ── */
  initRegionExplorerWithSvgMap() {
    const tabsEl = document.getElementById('region-tabs');
    const panelsEl = document.getElementById('region-panels');
    const mapWrap = document.getElementById('gb-interactive-map');
    const pillsEl = document.getElementById('region-pills');
    const regions = window.RG.REGIONS || [];
    if (!regions.length) return;

    const esc = window.RG.escapeHtml;

    const renderExplorer = () => {
      const activeRegion = regions[this.activeRegionIdx] || regions[0];

      // Render Interactive SVG Map of Gilgit-Baltistan's 7 Districts
      if (mapWrap) {
        mapWrap.innerHTML = `
          <div class="gb-map-card">
            <div class="gb-map-header">
              <span class="eyebrow">Interactive Provenance Map</span>
              <h4>7 Verified Districts of Gilgit-Baltistan</h4>
              <p>Select any valley on the map or tab list to inspect its elevation, signature weave motifs, and documented makers.</p>
            </div>
            <svg viewBox="0 0 560 330" class="gb-svg-map" role="group" aria-label="Interactive map of the 7 districts of Gilgit-Baltistan">
              <defs>
                <linearGradient id="mapBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#132936"/>
                  <stop offset="100%" stop-color="#1E3F52"/>
                </linearGradient>
              </defs>
              <rect width="560" height="330" rx="12" fill="url(#mapBg)"/>
              <!-- Indus & Gilgit River Courses -->
              <path d="M55,155 Q195,165 255,180 T495,235" fill="none" stroke="#4FA3C7" stroke-width="2" stroke-dasharray="4 3" opacity="0.45"/>
              <path d="M305,65 Q285,130 255,180" fill="none" stroke="#4FA3C7" stroke-width="1.6" stroke-dasharray="3 3" opacity="0.45"/>
              ${regions.map((r, idx) => {
                const isSelected = idx === this.activeRegionIdx;
                return `
                  <g class="gb-map-district ${isSelected ? 'is-active' : ''}" data-map-region-idx="${idx}" tabindex="0" role="button" aria-label="Select ${esc(r.name)} (${esc(r.artisanCount)})" aria-pressed="${isSelected}">
                    <path d="${r.mapCoords.path}" class="gb-district-poly"/>
                    <circle cx="${r.mapCoords.cx}" cy="${r.mapCoords.cy}" r="${isSelected ? 8 : 5.5}" class="gb-district-pin"/>
                    <text x="${r.mapCoords.cx}" y="${r.mapCoords.cy - 12}" text-anchor="middle" class="gb-district-label">${esc(r.name.replace(' (Skardu)', ''))}</text>
                  </g>
                `;
              }).join('')}
            </svg>
          </div>
        `;

        mapWrap.querySelectorAll('[data-map-region-idx]').forEach(node => {
          const activate = () => {
            this.activeRegionIdx = parseInt(node.dataset.mapRegionIdx, 10);
            renderExplorer();
          };
          node.addEventListener('click', activate);
          node.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              activate();
            }
          });
        });
      }

      if (tabsEl) {
        tabsEl.innerHTML = regions.map((r, i) => `
          <button type="button" class="region-tab-btn ${i === this.activeRegionIdx ? 'is-active' : ''}"
            role="tab" aria-selected="${i === this.activeRegionIdx}" data-region-tab="${i}">
            <div>
              <strong>${esc(r.name)}</strong>
              <small>${esc(r.artisanCount)}</small>
            </div>
            <i class="ph ph-caret-right" aria-hidden="true"></i>
          </button>
        `).join('');

        tabsEl.querySelectorAll('[data-region-tab]').forEach(btn => {
          btn.addEventListener('click', () => {
            this.activeRegionIdx = parseInt(btn.dataset.regionTab, 10);
            renderExplorer();
          });
        });
      }

      if (panelsEl && activeRegion) {
        const regProducts = (window.RG.PRODUCTS || []).filter(p =>
          window.RG.Filters.matchesRegion(p.region, activeRegion.name)
        );
        panelsEl.innerHTML = `
          <div class="region-panel is-active" role="tabpanel">
            <div class="region-meta-chips">
              <span class="region-meta-chip"><i class="ph ph-mountains" aria-hidden="true"></i> ${esc(activeRegion.altitude)}</span>
              <span class="region-meta-chip"><i class="ph ph-users-three" aria-hidden="true"></i> ${esc(activeRegion.artisanCount)}</span>
              <span class="region-meta-chip"><i class="ph ph-sparkle" aria-hidden="true"></i> ${esc(activeRegion.signatureMotif)}</span>
            </div>
            <p class="region-panel-crafts">${esc(activeRegion.crafts)}</p>
            <h3>${esc(activeRegion.name)}</h3>
            <p class="region-panel-desc-body">${esc(activeRegion.description)}</p>
            ${regProducts.length ? `
              <div class="region-mini-products">
                ${regProducts.map(p => `
                  <a href="product.html?id=${encodeURIComponent(p.id)}" class="region-mini-card">
                    <img src="${esc(p.images[0])}" data-fallback="${esc(p.fallbackImage)}" alt="${esc(p.name)}" width="56" height="70" loading="lazy">
                    <div>
                      <strong>${esc(p.name)}</strong>
                      <span>${window.RG.formatPrice(p.price)} · Inspect →</span>
                    </div>
                  </a>
                `).join('')}
              </div>
            ` : ''}
            <div class="mt-3">
              <a href="shop.html?region=${encodeURIComponent(activeRegion.name)}" data-filter-region="${esc(activeRegion.name)}" class="btn btn-primary">
                Shop All ${esc(activeRegion.name)} Pieces <i class="ph ph-arrow-right" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        `;
      }

      if (pillsEl) {
        pillsEl.innerHTML = regions.map((r, idx) => `
          <button type="button" class="region-pill ${idx === this.activeRegionIdx ? 'is-active' : ''}" data-pill-region-idx="${idx}">
            ${esc(r.name)}
          </button>
        `).join('');
        pillsEl.querySelectorAll('[data-pill-region-idx]').forEach(pill => {
          pill.addEventListener('click', () => {
            this.activeRegionIdx = parseInt(pill.dataset.pillRegionIdx, 10);
            renderExplorer();
          });
        });
      }
    };

    renderExplorer();
    window.RG.Store.subscribe(renderExplorer);
  },

  /* ── 4. CURATED THEMED RAILS (Inspired by The Cat Gallery) ── */
  initThemedRailsSection() {
    const container = document.getElementById('themed-rails-container');
    const rails = window.RG.THEMED_RAILS || [];
    if (!container || !rails.length) return;

    const renderRails = () => {
      const esc = window.RG.escapeHtml;
      const maxRails = container.dataset.maxRails ? parseInt(container.dataset.maxRails, 10) : rails.length;
      const slice = rails.slice(0, maxRails);

      container.innerHTML = slice.map(rail => {
        const items = rail.productIds
          .map(id => (window.RG.PRODUCTS || []).find(p => p.id === id))
          .filter(Boolean);
        return `
          <div class="themed-rail-block" id="rail-${esc(rail.id)}">
            <div class="themed-rail-header">
              <div>
                <span class="eyebrow">${esc(rail.eyebrow)}</span>
                <h3>${esc(rail.title)}</h3>
                <p>${esc(rail.subtitle)}</p>
              </div>
              <a href="${esc(rail.filterLink)}" class="btn btn-secondary btn-sm">
                Shop All <i class="ph ph-arrow-right" aria-hidden="true"></i>
              </a>
            </div>
            <div class="product-grid product-grid--4">
              ${items.map(p => window.RG.Filters.renderProductCard(p)).join('')}
            </div>
          </div>
        `;
      }).join('');
    };

    renderRails();
    window.RG.Store.subscribe(renderRails);
  },

  /* ── 5. FOUNDER / ARTISAN'S PICK ("Charlie Recommends" Pattern) ── */
  initFounderPickSection() {
    const container = document.getElementById('founder-pick-container');
    const pick = window.RG.FOUNDER_PICKS;
    if (!container || !pick) return;

    const renderPick = () => {
      const prod = (window.RG.PRODUCTS || []).find(p => p.id === pick.featuredProductId);
      if (!prod) return;
      const esc = window.RG.escapeHtml;
      container.innerHTML = `
        <div class="founder-pick-card">
          <div class="founder-pick-copy">
            <span class="eyebrow eyebrow--gold">${esc(pick.eyebrow)}</span>
            <h2>${esc(pick.title)}</h2>
            <blockquote class="founder-pick-quote">"${esc(pick.quote)}"</blockquote>
            <p class="founder-pick-author">
              <strong>${esc(pick.curatorName)}</strong>
              <span>${esc(pick.curatorRole)}</span>
            </p>
            <div class="founder-pick-actions">
              <button type="button" class="btn btn-gold" data-quickadd-id="${esc(prod.id)}">
                <i class="ph ph-shopping-bag" aria-hidden="true"></i> Add Curator’s Pick (${window.RG.formatPrice(prod.price)})
              </button>
              <a href="product.html?id=${encodeURIComponent(prod.id)}" class="btn btn-ghost-light">
                Inspect Provenance Passport →
              </a>
            </div>
          </div>
          <div class="founder-pick-visual">
            <a href="product.html?id=${encodeURIComponent(prod.id)}" class="founder-pick-img-wrap">
              <img src="${esc(prod.images[0])}" data-fallback="${esc(prod.fallbackImage)}" alt="${esc(prod.name)}" width="420" height="480" loading="lazy">
              <span class="founder-pick-badge">★ Curator’s Personal Pick · Save PKR 1,000</span>
            </a>
          </div>
        </div>
      `;
    };

    renderPick();
    window.RG.Store.subscribe(renderPick);
  },

  /* ── 6. COMPLETE 4-STEP AUTHENTICITY PROMISE SECTION ── */
  initAuthenticityPromiseSection() {
    const grid = document.getElementById('authenticity-steps-grid');
    const steps = window.RG.AUTHENTICITY_PROMISE_STEPS || [];
    if (!grid || !steps.length) return;
    const esc = window.RG.escapeHtml;
    grid.innerHTML = steps.map(s => `
      <div class="auth-step-card">
        <span class="auth-step-num">Step ${esc(s.step)}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.description)}</p>
      </div>
    `).join('');
  },

  /* ── 7. CULTURAL JOURNAL GRID ── */
  initJournalSection() {
    const grid = document.getElementById('journal-grid');
    const articles = window.RG.JOURNAL_ARTICLES || [];
    if (!grid || !articles.length) return;
    const esc = window.RG.escapeHtml;
    const maxArticles = grid.dataset.maxArticles ? parseInt(grid.dataset.maxArticles, 10) : articles.length;

    grid.innerHTML = articles.slice(0, maxArticles).map(article => `
      <article class="journal-card">
        <div class="journal-img">
          <img src="${esc(article.image || 'assets/images/hero-mountain-textiles.webp')}" alt="${esc(article.title)}" width="400" height="260" loading="lazy">
          <span class="journal-category-tag">${esc(article.category)}</span>
        </div>
        <div class="journal-content">
          <div class="journal-meta">
            <span>${esc(article.date)}</span>
            <span>·</span>
            <span>${esc(article.readingTime)}</span>
            <span>·</span>
            <span>${esc(article.author)}</span>
          </div>
          <h3>${esc(article.title)}</h3>
          <p class="journal-excerpt">${esc(article.excerpt)}</p>
          <button type="button" class="read-more" data-open-modal="journal" data-modal-param="${esc(article.id)}">
            Read Full Essay <i class="ph ph-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </article>
    `).join('');
  },

  /* ── 8. RECENTLY VIEWED SECTION ── */
  initRecentlyViewedSection() {
    const section = document.getElementById('recently-viewed-section');
    if (!section) return;

    const renderRecent = () => {
      const ids = window.RG.Store.state.recentlyViewed || [];
      const items = ids.map(id => (window.RG.PRODUCTS || []).find(p => p.id === id)).filter(Boolean);
      if (!items.length) {
        section.hidden = true;
        return;
      }
      section.hidden = false;
      section.innerHTML = `
        <div class="container">
          <span class="eyebrow">Your Archive Trail</span>
          <h2 class="section-title" style="text-align:left;font-size:var(--fs-2xl);margin-bottom:20px">Recently Viewed Pieces</h2>
          <div class="product-grid product-grid--4">
            ${items.map(p => window.RG.Filters.renderProductCard(p)).join('')}
          </div>
        </div>
      `;
    };

    renderRecent();
    window.RG.Store.subscribe(renderRecent);
  },

  /* ── 9. DEDICATED SHAREABLE PRODUCT DETAIL PAGE (`product.html?id=...`) ── */
  initProductDetailPage() {
    const pdpRoot = document.getElementById('pdp-root');
    if (!pdpRoot || !window.RG.PRODUCTS) return;

    const params = new URLSearchParams(window.location.search);
    const hashId = window.location.hash.replace(/^#product\//, '').trim();
    const explicitQuery = params.get('id') || hashId;
    let isInvalidRequestedId = false;
    let product;

    if (explicitQuery) {
      const found = window.RG.PRODUCTS.find(p => p.id === explicitQuery);
      if (found) {
        product = found;
      } else {
        isInvalidRequestedId = true;
        product = window.RG.PRODUCTS[0];
      }
    } else {
      product = window.RG.PRODUCTS[0];
    }

    window.RG.UI.recordRecentlyViewed(product.id);

    // Update document title, meta description & breadcrumb
    document.title = `${product.name} (${product.region}) | ReGongches Heritage Archive`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `${product.name} from ${product.region}, Gilgit-Baltistan (${window.RG.formatPkr(product.price)}). ${product.shortStory}`);
    }
    const bcCurrent = document.getElementById('pdp-breadcrumb-current');
    if (bcCurrent) bcCurrent.textContent = product.name;
    const bcCat = document.getElementById('pdp-breadcrumb-category');
    if (bcCat) {
      bcCat.textContent = product.category;
      bcCat.href = `shop.html?category=${encodeURIComponent(product.category)}`;
    }

    // Dynamic Canonical & Open Graph / Twitter Card for shareable product URLs
    const shareUrl = `https://regongches.store/product.html?id=${encodeURIComponent(product.id)}`;
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', shareUrl);

    const setMeta = (attr, key, val) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };
    setMeta('property', 'og:title', `${product.name} | ReGongches Heritage Archive`);
    setMeta('property', 'og:description', product.shortStory);
    setMeta('property', 'og:url', shareUrl);
    if (product.images?.[0]) {
      setMeta('property', 'og:image', new URL(product.images[0], window.location.href).href);
    }
    setMeta('name', 'twitter:title', `${product.name} | ReGongches`);
    setMeta('name', 'twitter:description', product.shortStory);

    // Inject Product & BreadcrumbList JSON-LD in PKR
    let ldScript = document.getElementById('pdp-jsonld');
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.type = 'application/ld+json';
      ldScript.id = 'pdp-jsonld';
      document.head.appendChild(ldScript);
    }
    const schemaObj = {
      '@context': 'https://schema.org/',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://regongches.store/'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: product.category,
              item: `https://regongches.store/shop.html?category=${encodeURIComponent(product.category)}`
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: product.name,
              item: shareUrl
            }
          ]
        },
        {
          '@type': 'Product',
          name: product.name,
          sku: product.sku,
          description: product.shortStory,
          category: product.category,
          brand: { '@type': 'Brand', name: 'ReGongches' },
          countryOfOrigin: 'PK',
          material: product.materials,
          image: [new URL(product.images[0], window.location.href).href],
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(product.rating || 4.9),
            reviewCount: String(product.reviewCount || 24)
          },
          offers: {
            '@type': 'Offer',
            url: shareUrl,
            priceCurrency: 'PKR',
            price: String(product.price),
            availability: product.status === 'Low Stock'
              ? 'https://schema.org/LimitedAvailability'
              : 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition'
          }
        }
      ]
    };
    ldScript.textContent = JSON.stringify(schemaObj, null, 2);

    let selectedColor = product.colors?.[0]?.label || '';
    let selectedSize = product.sizes?.[0] || 'One Size';
    let qty = 1;
    let activeImgIdx = 0;

    const gallery = [
      product.images?.[0] || product.fallbackImage,
      product.images?.[1] || product.fallbackImage,
      product.images?.[2] || product.fallbackImage
    ];
    const alts = product.imageAlts || [
      `${product.name} — primary studio view`,
      `${product.name} — macro weave and motif detail`,
      `${product.name} — archival gift box and numbered origin card`
    ];
    const thumbLabels = ['01 · Garment View', '02 · Weave & Motif', '03 · Archival Box'];

    let selectedCity = 'Islamabad';

    const renderPdp = () => {
      const esc = window.RG.escapeHtml;
      const wished = window.RG.Wishlist.isWishlisted(product.id);
      const compared = window.RG.Store.state.compare.includes(product.id);
      const waInquiryUrl = `${window.RG.CONFIG.contact.whatsappBaseUrl}?text=${encodeURIComponent(`Assalam-o-Alaikum ReGongches Studio, I am viewing ${product.name} (${product.sku}) and would like sizing/provenance advice.`)}`;
      const cityInfo = window.RG.CONFIG.shipping.cities[selectedCity] || window.RG.CONFIG.shipping.cities['Other'];
      const isCodEligible = product.price <= window.RG.CONFIG.payment.codLimitPkr;

      pdpRoot.innerHTML = `
        ${isInvalidRequestedId ? `
          <div class="pdp-not-found-banner" role="alert">
            <i class="ph ph-warning-circle" aria-hidden="true"></i>
            <div class="pdp-not-found-body">
              <strong>Archive Record Not Found:</strong>
              <span>No piece matching ID "<em>${esc(explicitQuery)}</em>" was found in our heritage ledger. Displaying our featured piece "<strong>${esc(product.name)}</strong>" from ${esc(product.region)} below.</span>
            </div>
            <a href="shop.html" class="btn btn-secondary btn-sm">Explore Archive →</a>
          </div>
        ` : ''}
        <div class="pdp-layout">
          <!-- Left: 3-Angle Gallery with Hover/Tap Zoom Loupe -->
          <div class="pdp-gallery-col">
            <div class="pdp-main-stage" id="pdp-zoom-stage" tabindex="0" role="button" aria-label="Hover or tap to zoom textile weave on ${esc(product.name)}">
              <img src="${esc(gallery[activeImgIdx])}" data-fallback="${esc(product.fallbackImage)}" alt="${esc(alts[activeImgIdx])}" id="pdp-main-img" width="600" height="750">
              <span class="pdp-zoom-badge"><i class="ph ph-magnifying-glass-plus" aria-hidden="true"></i> Hover or tap to inspect weave</span>
            </div>
            <div class="pdp-thumbs-row" role="tablist" aria-label="Product gallery angles">
              ${gallery.map((src, idx) => `
                <button type="button" class="pdp-thumb-btn ${idx === activeImgIdx ? 'is-active' : ''}" role="tab" aria-selected="${idx === activeImgIdx}" data-pdp-angle="${idx}">
                  <img src="${esc(src)}" data-fallback="${esc(product.fallbackImage)}" alt="${esc(alts[idx])}" width="96" height="120" loading="lazy">
                  <span>${esc(thumbLabels[idx])}</span>
                </button>
              `).join('')}
            </div>

            <!-- Provenance Passport Card -->
            <div class="pdp-provenance-passport" aria-label="Verified Provenance Passport">
              <div class="passport-header">
                <i class="ph ph-seal-check" aria-hidden="true"></i>
                <div>
                  <span class="eyebrow">ReGongches Archival Record</span>
                  <h3>Verified Provenance Passport · ${esc(product.sku)}</h3>
                </div>
              </div>
              <div class="passport-grid">
                <div><strong>District of Origin</strong><span>${esc(product.region)}</span></div>
                <div><strong>Village / Workshop</strong><span>${esc(product.originVillage)}</span></div>
                <div><strong>Artisan Collective</strong><span>${esc(product.artisanName)}</span></div>
                <div><strong>Craft Technique</strong><span>${esc(product.craftTechnique)}</span></div>
                <div><strong>Weight &amp; Grade</strong><span>${esc(product.weight)}</span></div>
                <div><strong>Thermal Rating</strong><span>${esc(product.warmthLevel)}</span></div>
              </div>
            </div>
          </div>

          <!-- Right: Product Details, Options & Accordions -->
          <div class="pdp-info-col">
            <div class="qv-badges">
              <span class="badge badge--region">${esc(product.region)}</span>
              ${product.handmade ? `<span class="badge badge--handmade">${esc(product.handmadeLabel)}</span>` : ''}
              ${product.isNew ? `<span class="badge badge--new">New Season</span>` : ''}
              ${product.isBestseller ? `<span class="badge badge--bestseller">Collector Favourite</span>` : ''}
            </div>

            <h1 class="pdp-title">${esc(product.name)}</h1>

            <div class="pdp-rating-sku-row">
              <span class="qv-rating-pill"><i class="ph-fill ph-star" aria-hidden="true"></i> ${(product.rating || 4.9).toFixed(1)} (${product.reviewCount} collector reviews)</span>
              <span class="pdp-sku">SKU: <code>${esc(product.sku)}</code></span>
            </div>

            <div class="pdp-price-block">
              <span class="pdp-price">${window.RG.formatPrice(product.price)}</span>
              ${product.compareAtPrice ? `<del class="pdp-compare">${window.RG.formatPrice(product.compareAtPrice)}</del>` : ''}
              ${window.RG.Store.state.currency !== 'PKR' ? `<small class="pdp-pkr-note">Charged in PKR: ${window.RG.formatPkr(product.price)}</small>` : ''}
            </div>

            <p class="pdp-lead-status">
              <i class="ph ph-clock-countdown" aria-hidden="true"></i>
              <strong>${esc(product.status)}:</strong> ${esc(product.leadTime)}
            </p>

            <ul class="qv-highlights">
              ${(product.highlights || []).map(h => `<li>${esc(h)}</li>`).join('')}
            </ul>

            <!-- Colour Swatches -->
            ${product.colors?.length ? `
              <div class="qv-option-group">
                <p class="qv-option-label">Colour Palette: <strong id="pdp-color-label">${esc(selectedColor)}</strong></p>
                <div class="qv-color-swatches" role="group" aria-label="Choose colour palette">
                  ${product.colors.map(c => `
                    <button type="button" class="color-swatch ${c.label === selectedColor ? 'is-selected' : ''}"
                      style="background:${esc(c.hex)}"
                      title="${esc(c.label)}"
                      aria-label="${esc(c.label)}"
                      aria-pressed="${c.label === selectedColor}"
                      data-pdp-color="${esc(c.label)}"></button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Size Selector + Size Guide Trigger -->
            ${product.sizes?.length ? `
              <div class="qv-option-group">
                <div class="qv-size-header">
                  <p class="qv-option-label">Size / Dimensions: <strong id="pdp-size-label">${esc(selectedSize)}</strong></p>
                  <button type="button" class="qv-size-guide" data-open-modal="size-care">
                    <i class="ph ph-ruler" aria-hidden="true"></i> Size &amp; Fit Guide (cm / in)
                  </button>
                </div>
                <div class="qv-size-buttons" role="group" aria-label="Choose size">
                  ${product.sizes.map(s => `
                    <button type="button" class="size-btn ${s === selectedSize ? 'is-selected' : ''}"
                      aria-pressed="${s === selectedSize}"
                      data-pdp-size="${esc(s)}">${esc(s)}</button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Quantity, Add to Bag & Buy Now -->
            <div class="pdp-cta-row">
              <div class="qty-stepper" role="group" aria-label="Quantity">
                <button type="button" class="qty-btn" id="pdp-qty-dec" aria-label="Decrease quantity">−</button>
                <span class="qty-val" id="pdp-qty-val" aria-live="polite">${qty}</span>
                <button type="button" class="qty-btn" id="pdp-qty-inc" aria-label="Increase quantity">+</button>
              </div>
              <button type="button" class="btn btn-primary btn-lg pdp-add-btn" id="pdp-add-btn">
                <i class="ph ph-shopping-bag" aria-hidden="true"></i> Add to Heritage Bag
              </button>
              <button type="button" class="btn btn-gold btn-lg pdp-buy-btn" id="pdp-buy-btn">
                Buy Now
              </button>
            </div>

            <!-- Utility Bar -->
            <div class="qv-utility-bar">
              <button type="button" class="qv-util-btn ${wished ? 'is-active' : ''}" data-wishlist-id="${esc(product.id)}">
                <i class="ph${wished ? '-fill' : ''} ph-heart" aria-hidden="true"></i>
                <span>${wished ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
              </button>
              <button type="button" class="qv-util-btn ${compared ? 'is-active' : ''}" data-compare-id="${esc(product.id)}">
                <i class="ph ph-scales" aria-hidden="true"></i>
                <span>${compared ? 'In Compare Tray' : 'Compare Piece'}</span>
              </button>
              <button type="button" class="qv-util-btn" id="pdp-copy-link-btn">
                <i class="ph ph-share-network" aria-hidden="true"></i>
                <span>Share Link</span>
              </button>
            </div>

            <!-- Trust Micro-Row -->
            <div class="qv-shipping-note">
              <i class="ph ph-shield-check" aria-hidden="true"></i>
              <span>Cash on Delivery (up to PKR 25,000) · Free delivery over PKR 8,000 · Numbered Origin &amp; Story Card · 14-day exchange</span>
            </div>

            <!-- Pakistani City Delivery & COD Estimator -->
            <div class="pdp-delivery-calc" role="region" aria-label="City delivery and COD calculator">
              <div class="pdp-calc-header">
                <i class="ph ph-truck" aria-hidden="true"></i>
                <label for="pdp-city-select"><strong>Check Delivery &amp; COD for Your City:</strong></label>
              </div>
              <div class="pdp-calc-row">
                <select id="pdp-city-select" class="pdp-city-select" aria-label="Select destination city">
                  ${Object.keys(window.RG.CONFIG.shipping.cities).map(c => `
                    <option value="${esc(c)}" ${c === selectedCity ? 'selected' : ''}>${esc(c)}</option>
                  `).join('')}
                </select>
              </div>
              <div class="pdp-calc-results" id="pdp-calc-results">
                <div class="pdp-calc-item">
                  <i class="ph ph-clock" aria-hidden="true"></i>
                  <span><strong>Transit ETA:</strong> <span id="pdp-est-days">${esc(cityInfo.days)}</span></span>
                </div>
                <div class="pdp-calc-item">
                  <i class="ph ph-currency-circle-dollar" aria-hidden="true"></i>
                  <span><strong>Courier Rate:</strong> <span id="pdp-est-fee">${product.price >= 8000 ? '<strong class="text-green">FREE Tracked Delivery</strong> (Order ≥ PKR 8,000)' : `PKR ${cityInfo.fee} (FREE over PKR 8,000)`}</span></span>
                </div>
                <div class="pdp-calc-item">
                  <i class="ph ph-check-circle" aria-hidden="true"></i>
                  <span><strong>Payment:</strong> <span id="pdp-est-cod">${isCodEligible ? 'Cash on Delivery eligible nationwide' : 'Exceeds PKR 25,000 COD limit (Direct Bank / Raast required)'}</span></span>
                </div>
              </div>
            </div>

            <!-- Detailed Accordions -->
            <div class="qv-accordions">
              <details class="qv-accordion" open>
                <summary>Cultural Story &amp; Artisan Lineage <i class="ph ph-caret-down" aria-hidden="true"></i></summary>
                <div class="qv-accordion-body">
                  <p>${esc(product.shortStory)}</p>
                  ${product.artisanNote ? `<p class="mt-2"><strong>Workshop Note:</strong> ${esc(product.artisanNote)}</p>` : ''}
                </div>
              </details>
              <details class="qv-accordion">
                <summary>Materials &amp; Loom Construction <i class="ph ph-caret-down" aria-hidden="true"></i></summary>
                <div class="qv-accordion-body">
                  <p>${esc(product.materials)}</p>
                  <p class="mt-2"><strong>Craft Technique:</strong> ${esc(product.craftTechnique)}</p>
                </div>
              </details>
              <details class="qv-accordion">
                <summary>Care &amp; Highland Preservation Protocol <i class="ph ph-caret-down" aria-hidden="true"></i></summary>
                <div class="qv-accordion-body"><p>${esc(product.care)}</p></div>
              </details>
              <details class="qv-accordion">
                <summary>Nationwide Shipping &amp; 14-Day Exchange Policy <i class="ph ph-caret-down" aria-hidden="true"></i></summary>
                <div class="qv-accordion-body">
                  <p>Dispatches from our Gilgit studio with tracked courier delivery: 1–2 business days in Gilgit-Baltistan, 2–4 business days in Islamabad, Rawalpindi, Lahore, Karachi &amp; Peshawar. Complimentary shipping on orders of PKR 8,000+. Unused items with original provenance tags may be exchanged within 14 days.</p>
                </div>
              </details>
            </div>

            <a href="${waInquiryUrl}" target="_blank" rel="noopener noreferrer" class="qv-whatsapp-link">
              <i class="ph ph-whatsapp-logo" aria-hidden="true"></i> Ask our Gilgit studio concierge about this piece on WhatsApp
            </a>
          </div>
        </div>
      `;

      // Bind PDP interactions
      document.getElementById('pdp-city-select')?.addEventListener('change', (e) => {
        selectedCity = e.target.value;
        const cData = window.RG.CONFIG.shipping.cities[selectedCity] || window.RG.CONFIG.shipping.cities['Other'];
        const daysEl = document.getElementById('pdp-est-days');
        const feeEl = document.getElementById('pdp-est-fee');
        const codEl = document.getElementById('pdp-est-cod');
        if (daysEl) daysEl.textContent = cData.days;
        if (feeEl) {
          feeEl.innerHTML = product.price >= 8000
            ? '<strong class="text-green">FREE Tracked Delivery</strong> (Order ≥ PKR 8,000)'
            : `PKR ${cData.fee} (FREE over PKR 8,000)`;
        }
        if (codEl) {
          codEl.textContent = product.price <= window.RG.CONFIG.payment.codLimitPkr
            ? 'Cash on Delivery eligible nationwide'
            : 'Exceeds PKR 25,000 COD limit (Direct Bank / Raast required)';
        }
      });
      pdpRoot.querySelectorAll('[data-pdp-angle]').forEach(btn => {
        btn.addEventListener('click', () => {
          activeImgIdx = parseInt(btn.dataset.pdpAngle, 10);
          renderPdp();
        });
      });

      const zoomStage = document.getElementById('pdp-zoom-stage');
      const mainImg = document.getElementById('pdp-main-img');
      if (zoomStage && mainImg) {
        zoomStage.addEventListener('mousemove', (e) => {
          if (window.matchMedia('(pointer: coarse)').matches) return;
          const rect = zoomStage.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          mainImg.style.transformOrigin = `${x}% ${y}%`;
          zoomStage.classList.add('is-zoomed');
        });
        zoomStage.addEventListener('mouseleave', () => {
          zoomStage.classList.remove('is-zoomed');
          mainImg.style.transformOrigin = 'center center';
        });
        // Tap/click zoom toggle for mobile & keyboard
        zoomStage.addEventListener('click', () => {
          zoomStage.classList.toggle('is-zoomed');
        });
      }

      pdpRoot.querySelectorAll('[data-pdp-color]').forEach(sw => {
        sw.addEventListener('click', () => {
          selectedColor = sw.dataset.pdpColor;
          renderPdp();
        });
      });

      pdpRoot.querySelectorAll('[data-pdp-size]').forEach(b => {
        b.addEventListener('click', () => {
          selectedSize = b.dataset.pdpSize;
          renderPdp();
        });
      });

      document.getElementById('pdp-qty-inc')?.addEventListener('click', () => {
        qty = Math.min(10, qty + 1);
        const el = document.getElementById('pdp-qty-val');
        if (el) el.textContent = qty;
      });
      document.getElementById('pdp-qty-dec')?.addEventListener('click', () => {
        qty = Math.max(1, qty - 1);
        const el = document.getElementById('pdp-qty-val');
        if (el) el.textContent = qty;
      });

      document.getElementById('pdp-add-btn')?.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        window.RG.Cart.add(product, qty, selectedSize, selectedColor);
        if (btn && !btn.classList.contains('btn-added-state')) {
          const origHtml = btn.innerHTML;
          btn.classList.add('btn-added-state');
          btn.innerHTML = '<i class="ph-bold ph-check" aria-hidden="true"></i> Added to Bag';
          setTimeout(() => {
            btn.classList.remove('btn-added-state');
            btn.innerHTML = origHtml;
            window.RG.UI.openCartDrawer();
          }, 600);
        } else {
          window.RG.UI.openCartDrawer();
        }
      });
      document.getElementById('pdp-buy-btn')?.addEventListener('click', () => {
        window.RG.Cart.add(product, qty, selectedSize, selectedColor, true);
        window.RG.Checkout.open();
      });
      document.getElementById('pdp-copy-link-btn')?.addEventListener('click', () => {
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(window.location.href).catch(() => {});
        window.RG.Toast.show('Product URL copied to clipboard!', 'success');
      });

      // Universal Sticky Add-to-Cart Bar (Desktop & Mobile, Aimé Leon Dore style)
      let stickyBar = document.getElementById('pdp-sticky-bar');
      if (!stickyBar) {
        stickyBar = document.createElement('div');
        stickyBar.id = 'pdp-sticky-bar';
        stickyBar.className = 'pdp-sticky-bar';
        stickyBar.setAttribute('role', 'region');
        stickyBar.setAttribute('aria-label', 'Floating quick purchase bar');
        document.body.appendChild(stickyBar);
      }
      stickyBar.innerHTML = `
        <div class="sticky-bar-left">
          <img src="${esc(gallery[0])}" alt="" class="sticky-bar-thumb" width="44" height="55" loading="lazy">
          <div class="sticky-bar-meta">
            <h4 class="sticky-bar-title">${esc(product.name)}</h4>
            <p class="sticky-bar-sub">${esc(product.region)} · <span id="sticky-bar-size">${esc(selectedSize)}</span></p>
          </div>
        </div>
        <div class="sticky-bar-right">
          <span class="sticky-bar-price">${window.RG.formatPrice(product.price)}</span>
          <button type="button" class="btn btn-primary btn-sm" id="sticky-bar-add-btn">
            <i class="ph ph-shopping-bag" aria-hidden="true"></i> Add to Bag
          </button>
        </div>
      `;

      document.getElementById('sticky-bar-add-btn')?.addEventListener('click', (e) => {
        const sBtn = e.currentTarget;
        window.RG.Cart.add(product, qty, selectedSize, selectedColor);
        if (sBtn && !sBtn.classList.contains('btn-added-state')) {
          const sOrig = sBtn.innerHTML;
          sBtn.classList.add('btn-added-state');
          sBtn.innerHTML = '<i class="ph-bold ph-check" aria-hidden="true"></i> Added';
          setTimeout(() => {
            sBtn.classList.remove('btn-added-state');
            sBtn.innerHTML = sOrig;
            window.RG.UI.openCartDrawer();
          }, 600);
        } else {
          window.RG.UI.openCartDrawer();
        }
      });

      // Coordinate with viewport scroll: reveal when main add-to-cart box scrolls off-screen
      const mainCta = document.getElementById('pdp-add-btn');
      const checkStickyScroll = () => {
        if (!mainCta) return;
        const rect = mainCta.getBoundingClientRect();
        const pastBuyBox = rect.bottom < 80;
        stickyBar.classList.toggle('is-visible', pastBuyBox);
      };
      window.addEventListener('scroll', checkStickyScroll, { passive: true });

      // Keep legacy pdp-sticky-mobile-bar hidden or synced
      const oldMobileBar = document.getElementById('pdp-sticky-mobile-bar');
      if (oldMobileBar) oldMobileBar.hidden = true;
    };

    renderPdp();

    // Render "Complete the Look" complementary pieces
    const relatedGrid = document.getElementById('pdp-complete-look-grid');
    if (relatedGrid) {
      const renderCompleteLook = () => {
        const pairings = window.RG.PRODUCTS
          .filter(p => p.id !== product.id && (p.region === product.region || p.category !== product.category))
          .slice(0, 4);
        relatedGrid.innerHTML = pairings.map(p => window.RG.Filters.renderProductCard(p)).join('');
      };
      renderCompleteLook();
      window.RG.Store.subscribe(() => {
        renderPdp();
        renderCompleteLook();
      });
    }
  },

  /* ── 10. CONTACT PAGE FORM VALIDATION & WHATSAPP HAND-OFF ── */
  initContactPage() {
    const form = document.getElementById('studio-contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cf-name')?.value.trim() || '';
      const phone = document.getElementById('cf-phone')?.value.trim() || '';
      const email = document.getElementById('cf-email')?.value.trim() || '';
      const topic = document.getElementById('cf-topic')?.value || 'General Inquiry';
      const msg = document.getElementById('cf-message')?.value.trim() || '';

      let ok = true;
      const setErr = (id, errId, errText) => {
        const el = document.getElementById(id);
        const err = document.getElementById(errId);
        if (el) el.classList.toggle('is-error', Boolean(errText));
        if (err) err.textContent = errText;
        if (errText) ok = false;
      };

      setErr('cf-name', 'cf-name-error', name.length >= 2 ? '' : 'Please enter your name.');
      setErr('cf-phone', 'cf-phone-error', phone.length >= 8 ? '' : 'Please enter a valid phone or WhatsApp number.');
      setErr('cf-message', 'cf-message-error', msg.length >= 10 ? '' : 'Please enter your message (at least 10 characters).');

      if (!ok) return;

      const waMsg = [
        `✦ *ReGongches Studio Concierge Inquiry* ✦`,
        `• Name: ${name}`,
        `• Phone: ${phone}`,
        email ? `• Email: ${email}` : null,
        `• Topic: ${topic}`,
        `• Message: ${msg}`
      ].filter(Boolean).join('\n');

      const waUrl = `${window.RG.CONFIG.contact.whatsappBaseUrl}?text=${encodeURIComponent(waMsg)}`;
      const mailtoUrl = `mailto:${window.RG.CONFIG.contact.email}?subject=${encodeURIComponent(`[Concierge] ${topic} - ${name}`)}&body=${encodeURIComponent(waMsg.replace(/[*✦•]/g, ''))}`;

      const statusWrap = document.getElementById('cf-status-wrap');
      const waActionBtn = document.getElementById('cf-wa-action-btn');
      const emailActionBtn = document.getElementById('cf-email-action-btn');

      if (statusWrap) {
        statusWrap.hidden = false;
        if (waActionBtn) waActionBtn.href = waUrl;
        if (emailActionBtn) emailActionBtn.href = mailtoUrl;
      }

      window.RG.Toast.show('Thank you! Opening WhatsApp to connect you directly with our Gilgit studio concierge.', 'success', 5000);
      try { window.open(waUrl, '_blank', 'noopener,noreferrer'); } catch {}
      form.reset();
    });
  },

  /* ── 11. STANDALONE SUPPORTING & POLICY PAGES ── */
  initStandalonePages() {
    // 1. Standalone Order Tracker Page
    const trackerForm = document.getElementById('tracker-lookup-form');
    const isStandaloneTracker = trackerForm && !trackerForm.closest('.modal-overlay');
    if (isStandaloneTracker) {
      const urlParams = new URLSearchParams(window.location.search);
      const queryRef = urlParams.get('ref') || urlParams.get('id');
      const savedOrders = window.RG.SafeStorage?.get(window.RG.CONFIG?.storageKeys?.orders, []) || [];
      const defaultRef = queryRef || savedOrders[0]?.id || window.RG.CONFIG?.orderHandoff?.demoOrderRef || 'RG-DEMO101';
      const input = document.getElementById('tracker-input');
      if (input && !input.value) input.value = defaultRef;
      window.RG.UI?.renderTrackerResult(defaultRef);
      window.RG.UI?.renderSavedOrdersList();
    }

    // 2. Standalone Size Guide Page
    const sizeContainer = document.getElementById('size-tables-container');
    const isStandaloneSize = sizeContainer && !sizeContainer.closest('.modal-overlay');
    if (isStandaloneSize) {
      window.RG.UI?.renderSizeGuideTables();
    }

    // Print Size Guide Cheat Sheet
    const printBtn = document.getElementById('btn-print-size-guide');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }

    // 3. Standalone Privacy Page - Clear Browser Data Button
    const clearBtn = document.getElementById('btn-clear-browser-data');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (!confirm('Are you sure you want to clear your local bag, wishlist, and saved order history from this browser?')) return;
        const keys = window.RG.CONFIG?.storageKeys || {};
        if (keys.cart) window.RG.SafeStorage.remove(keys.cart);
        if (keys.wishlist) window.RG.SafeStorage.remove(keys.wishlist);
        if (keys.orders) window.RG.SafeStorage.remove(keys.orders);
        if (keys.currency) window.RG.SafeStorage.remove(keys.currency);
        if (keys.announcement) window.RG.SafeStorage.remove(keys.announcement);
        window.RG.Store?.init();
        window.RG.Cart?.renderCartUI();
        window.RG.Wishlist?.renderWishlistUI();
        window.RG.Toast?.show('All browser storage for ReGongches has been cleared.', 'info');
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

window.RG.App = App;
