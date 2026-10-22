/* ==========================================================================
   ReGongches Catalogue Filter, Sort & URL Sync Engine (assets/js/filters.js)
   Pure functions over window.RG.data.getProducts() with history.replaceState
   ========================================================================== */
(function (window, document) {
  'use strict';

  const RGFilters = {
    state: {
      cat: '',
      region: '',
      size: '',
      colour: '',
      material: '',
      maxPrice: 25000,
      craft: '',
      availability: '',
      occasion: '',
      dispatch: '',
      q: '',
      sort: 'featured',
      columns: '3',
      limit: 12
    },

    init() {
      const grid = document.getElementById('rg-shop-products-grid');
      if (!grid) return;

      this.readFromUrl();
      this.bindControls();
      this.render();

      window.addEventListener('popstate', () => {
        this.readFromUrl();
        this.render();
      });
    },

    readFromUrl() {
      const params = new URLSearchParams(window.location.search);
      this.state.cat = params.get('cat') || document.body.getAttribute('data-default-cat') || '';
      this.state.region = params.get('region') || document.body.getAttribute('data-default-region') || '';
      this.state.size = params.get('size') || '';
      this.state.colour = params.get('colour') || '';
      this.state.material = params.get('material') || '';
      this.state.maxPrice = Number(params.get('maxPrice')) || 25000;
      this.state.craft = params.get('craft') || '';
      this.state.availability = params.get('availability') || '';
      this.state.occasion = params.get('occasion') || '';
      this.state.dispatch = params.get('dispatch') || '';
      this.state.q = params.get('q') || '';
      this.state.sort = params.get('sort') || 'featured';
    },

    syncToUrl() {
      const params = new URLSearchParams();
      ['cat', 'region', 'size', 'colour', 'material', 'craft', 'availability', 'occasion', 'dispatch', 'q'].forEach((k) => {
        if (this.state[k]) params.set(k, this.state[k]);
      });
      if (this.state.maxPrice < 25000) params.set('maxPrice', String(this.state.maxPrice));
      if (this.state.sort && this.state.sort !== 'featured') params.set('sort', this.state.sort);

      const qs = params.toString();
      const newUrl = window.location.pathname + (qs ? `?${qs}` : '');
      try {
        window.history.replaceState({}, '', newUrl);
      } catch (e) {}
    },

    updateRegionHeaderIfPresent() {
      const regionBanner = document.getElementById('rg-region-dynamic-header');
      if (!regionBanner) return;
      const reg = window.RG.data.getRegionById(this.state.region || 'hunza');
      if (!reg) return;

      const titleEl = document.getElementById('rg-archive-title');
      const descEl = document.getElementById('rg-archive-desc');
      const noteEl = document.getElementById('rg-region-cultural-note');
      if (titleEl) titleEl.textContent = `${reg.name} Valley Craft & Attire (${reg.elevation})`;
      if (descEl) descEl.textContent = reg.shortDescription;
      if (noteEl) noteEl.textContent = reg.culturalNote;
    },

    updateCategoryHeaderIfPresent() {
      const catHeader = document.getElementById('rg-category-dynamic-header');
      if (!catHeader || !this.state.cat) return;
      const titleEl = document.getElementById('rg-archive-title');
      if (titleEl) titleEl.textContent = this.state.cat;
    },

    getFilteredProducts() {
      const all = window.RG.data.getProducts();
      const s = this.state;

      const filtered = all.filter((p) => {
        if (s.cat && !p.categories.some((c) => c.toLowerCase().includes(s.cat.toLowerCase()))) return false;
        if (s.region && p.region.toLowerCase() !== s.region.toLowerCase()) return false;
        if (s.size && !(p.attributes.size || []).some((sz) => sz.toLowerCase().includes(s.size.toLowerCase()))) return false;
        if (s.colour && !(p.attributes.colour || []).some((cl) => cl.toLowerCase().includes(s.colour.toLowerCase()))) return false;
        if (s.material && !(p.attributes.material || []).some((m) => m.toLowerCase().includes(s.material.toLowerCase()))) return false;
        if (p.price > s.maxPrice) return false;
        if (s.craft && p.craft_type !== s.craft) return false;
        if (s.availability && p.availability !== s.availability) return false;
        if (s.occasion && !(p.occasions || []).some((o) => o.toLowerCase() === s.occasion.toLowerCase())) return false;
        if (s.dispatch) {
          const maxD = p.dispatch_days ? p.dispatch_days[1] : 2;
          if (s.dispatch === '1-2' && maxD > 2) return false;
          if (s.dispatch === '3-7' && (maxD < 3 || maxD > 7)) return false;
          if (s.dispatch === '14-28' && maxD < 10) return false;
        }
        if (s.q) {
          const hay = `${p.name} ${p.region} ${p.categories.join(' ')} ${(p.tags || []).join(' ')} ${p.short_description}`.toLowerCase();
          if (!hay.includes(s.q.toLowerCase())) return false;
        }
        return true;
      });

      filtered.sort((a, b) => {
        if (s.sort === 'price-asc') return a.price - b.price;
        if (s.sort === 'price-desc') return b.price - a.price;
        if (s.sort === 'rating') return b.rating - a.rating;
        if (s.sort === 'newest') return String(b.date_added).localeCompare(String(a.date_added));
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });

      return filtered;
    },

    bindControls() {
      const form = document.getElementById('rg-filter-form');
      if (form) {
        form.addEventListener('change', (e) => {
          const t = e.target;
          if (t.name && Object.prototype.hasOwnProperty.call(this.state, t.name)) {
            this.state[t.name] = t.type === 'range' ? Number(t.value) : t.value;
            this.state.limit = 12;
            this.syncToUrl();
            this.render();
          }
        });
        form.addEventListener('input', (e) => {
          if (e.target.name === 'maxPrice') {
            this.state.maxPrice = Number(e.target.value);
            const lbl = document.getElementById('rg-price-range-label');
            if (lbl) lbl.textContent = window.RG.data.formatPKR(this.state.maxPrice);
            this.syncToUrl();
            this.render();
          }
        });
      }

      const sortSel = document.getElementById('rg-sort-select');
      if (sortSel) {
        sortSel.value = this.state.sort;
        sortSel.addEventListener('change', () => {
          this.state.sort = sortSel.value;
          this.syncToUrl();
          this.render();
        });
      }

      document.querySelectorAll('[data-rg-grid-cols]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const cols = btn.getAttribute('data-rg-grid-cols');
          this.state.columns = cols;
          const grid = document.getElementById('rg-shop-products-grid');
          if (grid) grid.setAttribute('data-columns', cols);
          document.querySelectorAll('[data-rg-grid-cols]').forEach((b) => b.classList.toggle('rg-btn--secondary', b === btn));
        });
      });

      const loadMoreBtn = document.getElementById('rg-load-more-btn');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
          this.state.limit += 12;
          this.render();
        });
      }
    },

    clearAll() {
      this.state = {
        cat: '', region: '', size: '', colour: '', material: '',
        maxPrice: 25000, craft: '', availability: '', occasion: '',
        dispatch: '', q: '', sort: 'featured', columns: this.state.columns, limit: 12
      };
      const form = document.getElementById('rg-filter-form');
      if (form) form.reset();
      this.syncToUrl();
      this.render();
    },

    render() {
      this.updateRegionHeaderIfPresent();
      this.updateCategoryHeaderIfPresent();

      const grid = document.getElementById('rg-shop-products-grid');
      if (!grid) return;

      const form = document.getElementById('rg-filter-form');
      if (form) {
        ['cat', 'region', 'size', 'colour', 'material', 'craft', 'availability', 'occasion', 'dispatch'].forEach((k) => {
          const el = form.elements[k];
          if (el) el.value = this.state[k];
        });
        const priceEl = form.elements.maxPrice;
        if (priceEl) priceEl.value = this.state.maxPrice;
        const lbl = document.getElementById('rg-price-range-label');
        if (lbl) lbl.textContent = window.RG.data.formatPKR(this.state.maxPrice);
      }

      const matched = this.getFilteredProducts();
      const visible = matched.slice(0, this.state.limit);

      document.querySelectorAll('[data-rg-result-count]').forEach((el) => {
        el.textContent = `Showing ${visible.length} of ${matched.length} authentic products`;
      });

      const chipsWrap = document.getElementById('rg-active-filter-chips');
      if (chipsWrap) {
        const activeEntries = [];
        const labels = {
          cat: 'Category', region: 'Region', size: 'Size', colour: 'Colour',
          material: 'Material', craft: 'Craft', availability: 'Availability',
          occasion: 'Occasion', dispatch: 'Dispatch', q: 'Search'
        };
        Object.keys(labels).forEach((k) => {
          if (this.state[k]) activeEntries.push({ key: k, label: `${labels[k]}: ${this.state[k]}` });
        });
        if (this.state.maxPrice < 25000) {
          activeEntries.push({ key: 'maxPrice', label: `Max: ${window.RG.data.formatPKR(this.state.maxPrice)}` });
        }

        if (activeEntries.length) {
          chipsWrap.innerHTML = activeEntries.map((item) => `
            <button type="button" class="rg-chip" data-rg-remove-filter="${item.key}">
              ${item.label} <span aria-hidden="true">✕</span>
            </button>
          `).join('') + `<button type="button" class="rg-btn rg-btn--outline rg-btn--sm" id="rg-clear-all-filters">Clear all</button>`;

          chipsWrap.querySelectorAll('[data-rg-remove-filter]').forEach((btn) => {
            btn.addEventListener('click', () => {
              const key = btn.getAttribute('data-rg-remove-filter');
              this.state[key] = key === 'maxPrice' ? 25000 : '';
              this.syncToUrl();
              this.render();
            });
          });
          const clearBtn = document.getElementById('rg-clear-all-filters');
          if (clearBtn) clearBtn.addEventListener('click', () => this.clearAll());
        } else {
          chipsWrap.innerHTML = '';
        }
      }

      if (matched.length === 0) {
        grid.innerHTML = `
          <li style="grid-column:1/-1;background:var(--bg-elevated);padding:var(--space-10);border-radius:var(--radius-card);text-align:center;border:1px solid var(--rg-border);">
            <h3 style="margin-block-end:8px;">No pieces match all these filters. Try removing one, or clear all filters to see all 25 products.</h3>
            <p style="color:var(--text-secondary);margin-inline:auto;margin-block-end:16px;">Try broadening your price range, clearing a region filter, or requesting a custom-measured custom piece.</p>
            <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
              <button type="button" class="rg-btn rg-btn--primary" id="rg-empty-reset-btn">Reset All Filters</button>
              <a href="custom-orders.html" class="rg-btn rg-btn--outline">Request Custom Order</a>
            </div>
          </li>
        `;
        const resetBtn = document.getElementById('rg-empty-reset-btn');
        if (resetBtn) resetBtn.addEventListener('click', () => this.clearAll());
      } else {
        grid.innerHTML = visible.map((p) => window.RG.ui.renderProductCard(p)).join('');
      }

      const loadMoreBtn = document.getElementById('rg-load-more-btn');
      if (loadMoreBtn) {
        loadMoreBtn.hidden = visible.length >= matched.length;
      }
    }
  };

  window.RG = window.RG || {};
  window.RG.filters = RGFilters;
})(window, document);
