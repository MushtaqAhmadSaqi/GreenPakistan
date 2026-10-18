/**
 * ReGongches — Threads of Mountain Heritage
 * Multi-Facet Catalogue Filtering, URL Query Sync, Mobile Filter Drawer & Card Renderer (filters.js)
 * ============================================================================
 * Features:
 *  - Filters by Category, Region (7 districts), Price Range, Availability, Colour & Keyword Search.
 *  - Syncs filter state to the URL query string (?category=...&region=...&price=...&status=...&color=...&q=...&sort=...)
 *    so filtered views on shop.html and index.html can be bookmarked and shared.
 *  - Mobile Filter Bottom-Sheet Drawer with live "Apply (n results)" button.
 *  - Grid (2/3/4 columns) & List view toggle.
 *  - Interactive colour swatch preview on cards, Quick View trigger, Quick Add, Wishlist & Compare.
 */

'use strict';

window.RG = window.RG || {};

const Filters = {
  state: {
    category: '',
    region: '',
    priceRange: '',
    status: '',
    color: '',
    badge: '',
    search: '',
    sort: 'featured',
    viewMode: 'grid-3' // 'grid-2', 'grid-3', 'grid-4', 'list'
  },

  init() {
    this.readFromUrl();
    const savedView = window.RG.SafeStorage.get('regongches-view-mode', null);
    if (savedView && !new URLSearchParams(window.location.search).has('view')) {
      this.state.viewMode = savedView;
    }

    this.bindFilterControls();
    this.bindMobileFilterDrawer();

    // Hide skeleton & render catalogue
    const skeleton = document.getElementById('skeleton-grid');
    if (skeleton) {
      setTimeout(() => {
        skeleton.hidden = true;
        skeleton.style.display = 'none';
        this.render();
      }, 180);
    } else {
      this.render();
    }

    // Re-render when currency or wishlist/compare state changes
    window.RG.Store.subscribe(() => {
      this.render(false);
    });
  },

  readFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('category')) this.state.category = params.get('category') || '';
    if (params.has('region'))   this.state.region = params.get('region') || '';
    if (params.has('price'))    this.state.priceRange = params.get('price') || '';
    if (params.has('status'))   this.state.status = params.get('status') || '';
    if (params.has('color'))    this.state.color = params.get('color') || '';
    if (params.has('badge'))    this.state.badge = params.get('badge') || '';
    if (params.has('q'))        this.state.search = params.get('q') || '';
    if (params.has('sort'))     this.state.sort = params.get('sort') || 'featured';
    if (params.has('view'))     this.state.viewMode = params.get('view') || 'grid-3';
  },

  syncToUrl() {
    if (!document.getElementById('product-grid')) return;
    const params = new URLSearchParams();
    if (this.state.category)   params.set('category', this.state.category);
    if (this.state.region)     params.set('region', this.state.region);
    if (this.state.priceRange) params.set('price', this.state.priceRange);
    if (this.state.status)     params.set('status', this.state.status);
    if (this.state.color)      params.set('color', this.state.color);
    if (this.state.badge)      params.set('badge', this.state.badge);
    if (this.state.search)     params.set('q', this.state.search);
    if (this.state.sort && this.state.sort !== 'featured') params.set('sort', this.state.sort);

    const qs = params.toString();
    const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
    try {
      window.history.replaceState(null, '', newUrl);
    } catch {}
  },

  matchesRegion(productRegion, filterRegion) {
    if (!filterRegion) return true;
    const pReg = (productRegion || '').toLowerCase();
    const fReg = filterRegion.toLowerCase();
    if (pReg === fReg) return true;
    if ((fReg.includes('baltistan') || fReg.includes('skardu')) && (pReg.includes('baltistan') || pReg.includes('skardu'))) {
      return true;
    }
    return false;
  },

  getFilteredProducts(overrideState = null) {
    const st = overrideState || this.state;
    const all = [...(window.RG.PRODUCTS || [])];

    let list = all.filter(p => {
      if (st.category && p.category !== st.category) return false;
      if (st.region && !this.matchesRegion(p.region, st.region)) return false;
      if (st.status && p.status !== st.status) return false;
      if (st.badge === 'new' && !p.isNew) return false;
      if (st.badge === 'bestseller' && !p.isBestseller) return false;

      if (st.priceRange === 'under-2500' && p.price >= 2500) return false;
      if (st.priceRange === 'under-5000' && p.price >= 5000) return false;
      if (st.priceRange === '2500-6500' && (p.price < 2500 || p.price > 6500)) return false;
      if (st.priceRange === 'over-6500' && p.price <= 6500) return false;

      if (st.color) {
        const cQuery = st.color.toLowerCase();
        const hasColor = (p.colors || []).some(c => c.label.toLowerCase().includes(cQuery));
        if (!hasColor) return false;
      }

      if (st.search) {
        const q = st.search.toLowerCase().trim();
        const haystack = [
          p.name,
          p.sku,
          p.region,
          p.category,
          p.originVillage,
          p.craftTechnique,
          p.artisanName,
          p.materials,
          ...(p.colors || []).map(c => c.label)
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (st.sort === 'newest') {
      list.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    } else if (st.sort === 'rating-desc') {
      list.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8) || (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (st.sort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (st.sort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else {
      list.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller));
    }

    return list;
  },

  bindFilterControls() {
    // Category chips
    document.querySelectorAll('#category-filter-chips [data-filter-category]').forEach(chip => {
      chip.addEventListener('click', () => {
        this.state.category = chip.dataset.filterCategory || '';
        this.state.badge = '';
        this.syncControlsWithState();
        this.render();
      });
    });

    // Search input
    const searchInput = document.getElementById('catalogue-search-input');
    let debounceTimer;
    searchInput?.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.state.search = searchInput.value.trim();
        this.render();
      }, 150);
    });

    // Selects
    const bindSelect = (id, key) => {
      const el = document.getElementById(id);
      el?.addEventListener('change', () => {
        this.state[key] = el.value;
        this.syncControlsWithState();
        this.render();
      });
    };
    bindSelect('region-filter', 'region');
    bindSelect('price-filter', 'priceRange');
    bindSelect('status-filter', 'status');
    bindSelect('color-filter', 'color');
    bindSelect('sort-select', 'sort');

    // View mode buttons (Grid 2 / Grid 3 / Grid 4 / List)
    document.querySelectorAll('[data-view-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.viewMode = btn.dataset.viewMode;
        window.RG.SafeStorage.set('regongches-view-mode', this.state.viewMode);
        this.syncControlsWithState();
        this.render(false);
      });
    });

    // Reset all buttons
    document.getElementById('clear-all-filters')?.addEventListener('click', () => this.resetAll());
    document.getElementById('view-all-btn')?.addEventListener('click', () => {
      this.resetAll();
      document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Global delegated filter links (e.g. mega menu or region explorer links on same page)
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-filter-category], [data-filter-region], [data-filter-badge], [data-filter-price]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const hasCatalogueOnPage = Boolean(document.getElementById('product-grid'));

      // If catalogue is on current page and link points to #catalogue or current page
      if (hasCatalogueOnPage && (href.startsWith('#') || href === '' || href.includes(window.location.pathname.split('/').pop() || 'index.html'))) {
        e.preventDefault();
        if (link.dataset.filterCategory !== undefined) this.state.category = link.dataset.filterCategory;
        if (link.dataset.filterRegion !== undefined)   this.state.region = link.dataset.filterRegion;
        if (link.dataset.filterBadge !== undefined)    this.state.badge = link.dataset.filterBadge;
        if (link.dataset.filterPrice !== undefined)    this.state.priceRange = link.dataset.filterPrice;
        this.syncControlsWithState();
        this.render();
        document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
      }
    });

    this.syncControlsWithState();
  },

  bindMobileFilterDrawer() {
    const openBtn = document.getElementById('mobile-filter-open-btn');
    const drawer = document.getElementById('mobile-filter-drawer');
    const closeBtn = document.getElementById('mobile-filter-close');
    const applyBtn = document.getElementById('mobile-filter-apply-btn');
    const resetBtn = document.getElementById('mobile-filter-reset-btn');
    const backdrop = document.getElementById('drawer-backdrop');
    if (!drawer) return;

    const updateDraftCount = () => {
      const draft = {
        ...this.state,
        category: document.getElementById('mf-category')?.value ?? this.state.category,
        region: document.getElementById('mf-region')?.value ?? this.state.region,
        priceRange: document.getElementById('mf-price')?.value ?? this.state.priceRange,
        status: document.getElementById('mf-status')?.value ?? this.state.status,
        color: document.getElementById('mf-color')?.value ?? this.state.color,
        sort: document.getElementById('mf-sort')?.value ?? this.state.sort
      };
      const matches = this.getFilteredProducts(draft);
      if (applyBtn) {
        applyBtn.textContent = `Apply Filters (${matches.length} piece${matches.length !== 1 ? 's' : ''})`;
      }
    };

    const openDrawer = () => {
      const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
      setVal('mf-category', this.state.category);
      setVal('mf-region', this.state.region);
      setVal('mf-price', this.state.priceRange);
      setVal('mf-status', this.state.status);
      setVal('mf-color', this.state.color);
      setVal('mf-sort', this.state.sort);
      updateDraftCount();

      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      backdrop?.classList.add('is-visible');
      window.RG.UI?.lockScroll();
    };

    const closeDrawer = () => {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      backdrop?.classList.remove('is-visible');
      window.RG.UI?.unlockScroll();
    };

    openBtn?.addEventListener('click', openDrawer);
    closeBtn?.addEventListener('click', closeDrawer);

    drawer.querySelectorAll('select, input').forEach(el => {
      el.addEventListener('change', updateDraftCount);
    });

    applyBtn?.addEventListener('click', () => {
      this.state.category = document.getElementById('mf-category')?.value || '';
      this.state.region = document.getElementById('mf-region')?.value || '';
      this.state.priceRange = document.getElementById('mf-price')?.value || '';
      this.state.status = document.getElementById('mf-status')?.value || '';
      this.state.color = document.getElementById('mf-color')?.value || '';
      this.state.sort = document.getElementById('mf-sort')?.value || 'featured';
      this.syncControlsWithState();
      this.render();
      closeDrawer();
    });

    resetBtn?.addEventListener('click', () => {
      this.resetAll();
      closeDrawer();
    });
  },

  syncControlsWithState() {
    document.querySelectorAll('#category-filter-chips [data-filter-category]').forEach(chip => {
      const active = (chip.dataset.filterCategory || '') === this.state.category;
      chip.classList.toggle('active', active);
      chip.setAttribute('aria-pressed', String(active));
    });

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    setVal('catalogue-search-input', this.state.search);
    setVal('region-filter', this.state.region);
    setVal('price-filter', this.state.priceRange);
    setVal('status-filter', this.state.status);
    setVal('color-filter', this.state.color);
    setVal('sort-select', this.state.sort);

    document.querySelectorAll('[data-view-mode]').forEach(btn => {
      const active = btn.dataset.viewMode === this.state.viewMode;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  },

  resetAll() {
    this.state = {
      ...this.state,
      category: '',
      region: '',
      priceRange: '',
      status: '',
      color: '',
      badge: '',
      search: '',
      sort: 'featured'
    };
    this.syncControlsWithState();
    this.render();
  },

  render(updateUrl = true) {
    if (updateUrl) this.syncToUrl();

    const grid = document.getElementById('product-grid');
    const emptyEl = document.getElementById('catalogue-empty');
    const countEl = document.getElementById('result-count');
    const appliedEl = document.getElementById('applied-filters');
    if (!grid) return;

    const products = this.getFilteredProducts();
    const totalCount = (window.RG.PRODUCTS || []).length;

    if (countEl) {
      countEl.textContent = `Showing ${products.length} of ${totalCount} verified heritage piece${products.length !== 1 ? 's' : ''}`;
    }

    this.renderAppliedChips(appliedEl);

    if (!products.length) {
      grid.innerHTML = '';
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;

    const viewClass = {
      'grid-2': 'product-grid product-grid--2',
      'grid-3': 'product-grid product-grid--3',
      'grid-4': 'product-grid product-grid--4',
      'list':   'product-grid product-grid--list'
    }[this.state.viewMode] || 'product-grid product-grid--3';

    grid.className = viewClass;
    grid.innerHTML = products.map(p => this.renderProductCard(p)).join('');
  },

  renderAppliedChips(container) {
    if (!container) return;
    const chips = [];
    const priceLabels = {
      'under-2500': 'Under PKR 2,500',
      'under-5000': 'Under PKR 5,000',
      '2500-6500':  'PKR 2,500 – 6,500',
      'over-6500':  'Above PKR 6,500'
    };

    if (this.state.category)   chips.push({ key: 'category', label: `Category: ${this.state.category}` });
    if (this.state.region)     chips.push({ key: 'region', label: `District: ${this.state.region}` });
    if (this.state.priceRange) chips.push({ key: 'priceRange', label: `Price: ${priceLabels[this.state.priceRange] || this.state.priceRange}` });
    if (this.state.status)     chips.push({ key: 'status', label: `Availability: ${this.state.status}` });
    if (this.state.color)      chips.push({ key: 'color', label: `Colour: ${this.state.color}` });
    if (this.state.badge)      chips.push({ key: 'badge', label: `Collection: ${this.state.badge === 'new' ? 'New Arrivals' : 'Bestsellers'}` });
    if (this.state.search)     chips.push({ key: 'search', label: `Search: "${this.state.search}"` });

    if (!chips.length) {
      container.hidden = true;
      container.innerHTML = '';
      return;
    }

    const esc = window.RG.escapeHtml;
    container.hidden = false;
    container.innerHTML = chips.map(c => `
      <span class="applied-chip">
        ${esc(c.label)}
        <button type="button" class="applied-chip-remove" data-remove-filter="${esc(c.key)}" aria-label="Remove filter ${esc(c.label)}">
          <i class="ph ph-x" aria-hidden="true"></i>
        </button>
      </span>
    `).join('') + `<button type="button" class="clear-all-btn" data-reset-all-filters="1">Clear all filters</button>`;

    container.querySelectorAll('[data-remove-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.removeFilter;
        this.state[key] = '';
        this.syncControlsWithState();
        this.render();
      });
    });
    container.querySelector('[data-reset-all-filters]')?.addEventListener('click', () => this.resetAll());
  },

  renderProductCard(p) {
    const esc = window.RG.escapeHtml;
    const wished = window.RG.Wishlist.isWishlisted(p.id);
    const compared = window.RG.Store.state.compare.includes(p.id);
    const statusClass = {
      'Available':     'card-status--available',
      'Made-to-Order': 'card-status--made-to-order',
      'Low Stock':     'card-status--low-stock'
    }[p.status] || '';

    const imgSrc = p.images?.[0] || p.fallbackImage;
    const imgHov = p.images?.[1] || p.fallbackImage;
    const altMain = p.imageAlts?.[0] || `${p.name} — authentic ${p.region} heritage craft`;
    const activeColor = window.RG.Store.state.cardColorMap[p.id] || p.colors?.[0]?.label || '';

    const swatchesHtml = (p.colors && p.colors.length)
      ? `<div class="card-swatches-row" role="group" aria-label="Colour options for ${esc(p.name)}">
          ${p.colors.map(c => `
            <button type="button" class="card-mini-swatch ${c.label === activeColor ? 'is-active' : ''}"
              style="background:${esc(c.hex)}"
              title="${esc(c.label)}"
              aria-label="Preview colour ${esc(c.label)}"
              aria-pressed="${c.label === activeColor}"
              data-swatch-product="${esc(p.id)}"
              data-swatch-color="${esc(c.label)}"></button>
          `).join('')}
          <span class="card-swatch-label">${esc(activeColor)}</span>
        </div>`
      : '';

    return `
      <article class="product-card" role="listitem" data-product-id="${esc(p.id)}">
        <div class="card-img-wrap">
          <a href="product.html?id=${encodeURIComponent(p.id)}" class="card-img-link" aria-label="View details for ${esc(p.name)}">
            <img class="card-img" src="${esc(imgSrc)}" data-fallback="${esc(p.fallbackImage)}" alt="${esc(altMain)}" loading="lazy" decoding="async" width="400" height="500">
            <img class="card-img-hover" src="${esc(imgHov)}" alt="" aria-hidden="true" loading="lazy" decoding="async" width="400" height="500">
          </a>
          <div class="card-badges">
            <span class="badge badge--region">${esc(p.region)}</span>
            ${p.handmade ? `<span class="badge badge--handmade">${esc(p.handmadeLabel)}</span>` : ''}
            ${p.isNew ? `<span class="badge badge--new">New</span>` : ''}
            ${p.isBestseller ? `<span class="badge badge--bestseller">Bestseller</span>` : ''}
          </div>
          <button type="button" class="card-wishlist-btn ${wished ? 'is-wishlisted' : ''}"
            aria-label="${wished ? 'Remove from wishlist' : 'Save to wishlist'}"
            aria-pressed="${wished}"
            title="Save to Wishlist"
            data-wishlist-id="${esc(p.id)}">
            <i class="ph${wished ? '-fill' : ''} ph-heart" aria-hidden="true"></i>
          </button>
          <button type="button" class="card-compare-btn ${compared ? 'is-compared' : ''}"
            aria-label="Compare ${esc(p.name)}"
            aria-pressed="${compared}"
            title="Compare side-by-side"
            data-compare-id="${esc(p.id)}">
            <i class="ph ph-scales" aria-hidden="true"></i>
          </button>
          <div class="card-hover-actions">
            <button type="button" class="card-quick-add" data-quickadd-id="${esc(p.id)}" aria-label="Quick add ${esc(p.name)} to bag">
              <i class="ph ph-shopping-bag" aria-hidden="true"></i> Add to Bag
            </button>
            <button type="button" class="card-qv-btn" data-quickview-id="${esc(p.id)}" aria-label="Quick view ${esc(p.name)}">
              <i class="ph ph-eye" aria-hidden="true"></i> Quick View
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="card-top-meta">
            <p class="card-region-line">${esc(p.region)} · ${esc(p.originVillage || p.handmadeLabel)}</p>
            <span class="card-rating-inline" aria-label="Rated ${(p.rating || 4.9).toFixed(1)} out of 5 from ${p.reviewCount || 18} reviews">
              <i class="ph-fill ph-star" aria-hidden="true"></i> ${(p.rating || 4.9).toFixed(1)} <span>(${p.reviewCount || 18})</span>
            </span>
          </div>
          <h3 class="card-name">
            <a href="product.html?id=${encodeURIComponent(p.id)}" class="card-title-link">${esc(p.name)}</a>
          </h3>
          <p class="card-list-story">${esc(p.shortStory || '')}</p>
          ${swatchesHtml}
          <div class="card-price-row">
            <span class="card-price" data-pkr-price="${p.price}">${window.RG.formatPrice(p.price)}</span>
            ${p.compareAtPrice ? `<del class="card-compare">${window.RG.formatPrice(p.compareAtPrice)}</del>` : ''}
            <span class="card-status ${statusClass}">${esc(p.status)}</span>
          </div>
          <div class="card-meta-bottom">
            <span class="card-verified">
              <i class="ph ph-seal-check" aria-hidden="true"></i> Numbered Origin Card
            </span>
            <a href="product.html?id=${encodeURIComponent(p.id)}" class="card-sku-tag">Inspect →</a>
          </div>
        </div>
      </article>
    `;
  }
};

window.RG.Filters = Filters;
