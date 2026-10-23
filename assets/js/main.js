/* ==========================================================================
   ReGongches Main Application Bootstrapper (assets/js/main.js)
   Initialises global header/footer interactions, theme presets, search,
   mini-cart, compare tray, gift finder quiz, cap size finder, hotspots,
   before/after craft slider, reading progress, and page controllers.
   ========================================================================== */
(function (window, document) {
  'use strict';

  const THEME_KEY = 'rg_theme_preset_v1';
  const ANN_KEY = 'rg_announcement_dismissed_v1';
  const VISITED_KEY = 'rg_first_visit_done_v1';

  function initThemePresets() {
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get('theme');
    let saved = null;
    try {
      saved = window.localStorage.getItem(THEME_KEY);
    } catch (e) {}

    const active = urlTheme || saved || 'heritage';
    document.documentElement.setAttribute('data-theme', active);

    const switcher = document.getElementById('rg-style-switcher');
    if (switcher) {
      if (params.get('styles') === '1') {
        switcher.hidden = false;
      }
      switcher.querySelectorAll('[data-rg-theme-set]').forEach((btn) => {
        btn.classList.toggle('is-active', btn.getAttribute('data-rg-theme-set') === active);
        btn.addEventListener('click', () => {
          const next = btn.getAttribute('data-rg-theme-set');
          document.documentElement.setAttribute('data-theme', next);
          try { window.localStorage.setItem(THEME_KEY, next); } catch (e) {}
          switcher.querySelectorAll('[data-rg-theme-set]').forEach((b) => b.classList.toggle('is-active', b === btn));
          window.RG.ui.toast(`Switched theme preset to "${next}"`);
        });
      });
    }
  }

  function initFirstVisitLoader() {
    const loader = document.getElementById('rg-first-visit-loader');
    if (!loader) return;
    let visited = false;
    try { visited = Boolean(window.sessionStorage.getItem(VISITED_KEY)); } catch (e) {}
    if (visited) {
      loader.remove();
      return;
    }
    try { window.sessionStorage.setItem(VISITED_KEY, '1'); } catch (e) {}
    const dismiss = () => { if (loader.parentNode) loader.remove(); };
    loader.addEventListener('click', dismiss);
    setTimeout(dismiss, 850);
  }

  function initAnnouncementBar() {
    const bar = document.getElementById('rg-announcement-bar');
    const textEl = document.getElementById('rg-announcement-text');
    const closeBtn = document.getElementById('rg-announcement-close');
    if (!bar) return;

    try {
      if (window.localStorage.getItem(ANN_KEY) === '1') {
        bar.hidden = true;
        return;
      }
    } catch (e) {}

    const msgs = (window.RG.data.getConfig().announcements) || [];
    if (textEl && msgs.length > 1) {
      let idx = 0;
      setInterval(() => {
        idx = (idx + 1) % msgs.length;
        textEl.textContent = msgs[idx];
      }, 4500);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        bar.hidden = true;
        try { window.localStorage.setItem(ANN_KEY, '1'); } catch (e) {}
      });
    }
  }

  function initStickyHeaderAndMenus() {
    const header = document.querySelector('.site-header');
    const backToTop = document.getElementById('rg-back-to-top');
    const readingBar = document.getElementById('rg-reading-progress');
    let lastY = window.scrollY;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (header) {
        header.classList.toggle('is-scrolled', y > 40);
        if (y > 220 && y > lastY + 8) {
          header.classList.add('is-hidden');
        } else if (y < lastY - 8 || y <= 80) {
          header.classList.remove('is-hidden');
        }
      }
      if (backToTop) {
        backToTop.classList.toggle('is-visible', y > 450);
      }
      if (readingBar) {
        const docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const pct = Math.min(100, Math.max(0, (y / docH) * 100));
        readingBar.style.width = `${pct}%`;
      }
      lastY = y;
    }, { passive: true });

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    document.querySelectorAll('.menu-item-has-children').forEach((item) => {
      const toggleBtn = item.querySelector('[data-rg-mega-toggle]');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const open = item.classList.toggle('is-open');
          toggleBtn.setAttribute('aria-expanded', String(open));
        });
      }
    });

    document.querySelectorAll('[data-district]').forEach((path) => {
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');
      const showPreview = () => {
        const id = path.getAttribute('data-district');
        const reg = window.RG.data.getRegionById(id);
        if (!reg) return;
        document.querySelectorAll('[data-rg-map-preview]').forEach((box) => {
          box.innerHTML = `
            <span class="rg-badge rg-badge--handmade">${reg.division} · ${reg.elevation}</span>
            <h4 style="margin-block:6px 4px;">${reg.name} District (${reg.productCount} pieces)</h4>
            <p style="font-size:var(--text-xs);color:var(--text-secondary);margin-block-end:8px;">${reg.shortDescription}</p>
            <a href="region.html?region=${reg.id}" class="rg-btn rg-btn--primary rg-btn--sm">Explore ${reg.name} →</a>
          `;
        });
      };
      path.addEventListener('focus', showPreview);
      path.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const id = path.getAttribute('data-district');
          window.location.href = `region.html?region=${id}`;
        }
      });
      path.addEventListener('mouseenter', () => {
        const id = path.getAttribute('data-district');
        const reg = window.RG.data.getRegionById(id);
        if (!reg) return;
        document.querySelectorAll('[data-rg-map-preview]').forEach((box) => {
          box.innerHTML = `
            <span class="rg-badge rg-badge--handmade">${reg.division} · ${reg.elevation}</span>
            <h4 style="margin-block:6px 4px;">${reg.name} District (${reg.productCount} pieces)</h4>
            <p style="font-size:var(--text-xs);color:var(--text-secondary);margin-block-end:8px;">${reg.shortDescription}</p>
            <a href="region.html?region=${reg.id}" class="rg-btn rg-btn--primary rg-btn--sm">Explore ${reg.name} →</a>
          `;
        });
      });
      path.addEventListener('click', () => {
        const id = path.getAttribute('data-district');
        if (window.navigateToRoute) {
          window.navigateToRoute(`region.html?region=${id}`);
        } else {
          window.location.href = `region.html?region=${id}`;
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.menu-item-has-children.is-open').forEach((m) => m.classList.remove('is-open'));
        window.RG.ui.closeAllOverlays();
      }
    });
  }

  function initSearchOverlay() {
    const overlay = document.getElementById('rg-search-overlay');
    const input = document.getElementById('rg-search-input');
    const resultsBox = document.getElementById('rg-search-results');
    if (!overlay || !input || !resultsBox) return;

    let activeIndex = -1;

    const renderInstant = (term) => {
      activeIndex = -1;
      const res = window.RG.search.query(term);
      const fmt = window.RG.data.formatPKR;
      const recentList = window.RG.search.getRecentSearches();
      const popularChips = ['Gilgiti cap', 'Hunza shawl', 'Pattu waistcoat', 'Skardu cap', 'Heritage gift set'];

      if (!term.trim()) {
        resultsBox.innerHTML = `
          <div style="padding-block-start:14px;display:grid;gap:12px;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="font-size:12px;color:var(--text-secondary);font-weight:600;">Popular searches:</span>
              ${popularChips.map((c) => `<button type="button" class="rg-chip" data-rg-search-chip="${c}">${c}</button>`).join('')}
            </div>
            ${recentList.length ? `
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span style="font-size:12px;color:var(--text-secondary);font-weight:600;">Recent:</span>
                ${recentList.map((r) => `<button type="button" class="rg-chip" data-rg-search-chip="${r}">${r}</button>`).join('')}
              </div>
            ` : ''}
          </div>
        `;
        return;
      }

      if (!res.products.length && !res.journal.length && !res.regions.length && !(res.artisans && res.artisans.length)) {
        resultsBox.innerHTML = `<p style="padding-block:16px;color:var(--text-secondary);">We couldn't find '${term}'. Try 'cap', 'shawl' or 'waistcoat', or ask us on WhatsApp. We may have it in the workshop.</p>`;
        return;
      }

      const hi = (txt) => (window.RG.search.highlight ? window.RG.search.highlight(txt, term) : txt);
      resultsBox.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;padding-block-start:20px;">
          <div>
            <h4 style="font-size:var(--text-xs);text-transform:uppercase;margin-block-end:10px;">Matching Products (${res.products.length})</h4>
            <div style="display:grid;gap:10px;" id="rg-search-product-list">
              ${res.products.slice(0, 5).map((p, idx) => `
                <a href="product.html?id=${p.id}" class="rg-search-item" data-search-idx="${idx}" style="display:flex;align-items:center;gap:10px;padding:8px;background:var(--bg-secondary);border-radius:4px;text-decoration:none;transition:background 120ms;">
                  <img src="${p.images[0].src}" alt="${p.name}" width="44" height="54" style="width:44px;height:54px;object-fit:cover;border-radius:2px;">
                  <div>
                    <strong style="font-size:var(--text-xs);display:block;color:var(--text-primary);">${hi(p.name)}</strong>
                    <span style="font-size:11px;color:var(--text-secondary);">${hi(p.region)} · ${fmt(p.price)}</span>
                  </div>
                </a>
              `).join('')}
            </div>
          </div>
          <div>
            <h4 style="font-size:var(--text-xs);text-transform:uppercase;margin-block-end:10px;">Regions, Artisans &amp; Journal</h4>
            <div style="display:grid;gap:8px;">
              ${res.regions.slice(0, 3).map((r) => `<a href="region.html?region=${r.id}" class="rg-chip">Region: ${hi(r.name)} (${r.productCount})</a>`).join('')}
              ${(res.artisans || []).slice(0, 2).map((a) => `<a href="artisan.html?id=${a.id}" class="rg-chip">Artisan: ${hi(a.name)}</a>`).join('')}
              ${res.journal.slice(0, 3).map((j) => `<a href="journal-post.html?id=${j.id}" class="rg-search-item" style="font-size:var(--text-xs);font-weight:600;display:block;padding:4px 0;color:var(--text-primary);">📖 ${hi(j.title)}</a>`).join('')}
            </div>
          </div>
        </div>
      `;
    };

    input.addEventListener('input', () => renderInstant(input.value));

    // Keyboard Arrow navigation (ArrowDown / ArrowUp + Enter)
    input.addEventListener('keydown', (e) => {
      const items = resultsBox.querySelectorAll('.rg-search-item');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        items.forEach((it, i) => it.classList.toggle('is-focused', i === activeIndex));
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        items.forEach((it, i) => it.classList.toggle('is-focused', i === activeIndex));
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && items[activeIndex]) {
          e.preventDefault();
          window.location.href = items[activeIndex].href;
        }
      }
    });

    overlay.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-rg-search-chip]');
      if (chip) {
        input.value = chip.getAttribute('data-rg-search-chip');
        window.RG.search.saveSearchTerm(input.value);
        renderInstant(input.value);
        input.focus();
      }
    });
  }

  function initCapSizeSlider() {
    document.querySelectorAll('[data-rg-cap-slider]').forEach((slider) => {
      const wrap = slider.closest('.rg-cap-size-finder') || slider.parentElement;
      let unit = 'cm';

      const updateOut = () => {
        let cmVal = Number(slider.value);
        if (unit === 'in') {
          cmVal = Math.round(Number(slider.value) * 2.54);
        }
        const inches = (cmVal / 2.54).toFixed(1);

        let rec = 'Medium (M — 56–57 cm)';
        let bandScale = 140;
        if (cmVal <= 55.4) {
          rec = 'Small (S — 54–55 cm)';
          bandScale = 125;
        } else if (cmVal <= 57.4) {
          rec = 'Medium (M — 56–57 cm)';
          bandScale = 140;
        } else if (cmVal <= 59.4) {
          rec = 'Large (L — 58–59 cm)';
          bandScale = 155;
        } else {
          rec = 'Extra Large (XL — 60–61 cm)';
          bandScale = 170;
        }

        const out = document.getElementById(slider.getAttribute('data-rg-cap-slider'));
        if (out) {
          out.innerHTML = `
            <div style="margin-block-end:8px;">
              Circumference: <strong>${cmVal} cm (${inches} in)</strong> → Recommended Size: <span class="rg-badge rg-badge--verified" style="font-size:13px;">${rec}</span>
            </div>
            <div class="rg-headband-visual" aria-hidden="true">
              <div class="rg-headband-ring" style="width:${bandScale}px;">
                <span>${cmVal} cm</span>
              </div>
            </div>
            <details style="font-size:12px;color:var(--text-secondary);margin-block-start:10px;background:var(--bg-secondary);padding:8px 12px;border-radius:var(--radius-editorial);">
              <summary style="cursor:pointer;font-weight:600;color:var(--brand-primary);">I don't have a measuring tape</summary>
              <p style="margin-block:6px 0;">
                Wrap a phone charging cable, string, or ribbon 1 cm above your eyebrows. Mark where it meets, then lay it flat against a 30 cm school ruler or use a 1000 PKR banknote (which measures exactly 13.2 cm in length) to calculate your head circumference.
              </p>
            </details>
          `;
        }
      };

      slider.addEventListener('input', updateOut);
      updateOut();
    });
  }

  function initBeforeAfterSliders() {
    document.querySelectorAll('[data-rg-ba-slider]').forEach((wrap) => {
      const range = wrap.querySelector('input[type="range"]');
      const beforeLayer = wrap.querySelector('.rg-ba-slider__before');
      const handle = wrap.querySelector('.rg-ba-slider__handle');
      if (!range || !beforeLayer) return;
      const sync = () => {
        const val = `${range.value}%`;
        beforeLayer.style.width = val;
        if (handle) handle.style.insetInlineStart = val;
      };
      range.addEventListener('input', sync);
      sync();
    });
  }

  function initGlobalDelegation() {
    document.addEventListener('click', (e) => {
      const target = e.target;

      // Add to cart button
      const addBtn = target.closest('[data-rg-add-to-cart]');
      if (addBtn) {
        e.preventDefault();
        const pid = addBtn.getAttribute('data-rg-add-to-cart');
        const prod = window.RG.cart.addItem(pid, 1);
        if (prod) {
          window.RG.ui.openDrawer('rg-minicart-drawer');
          window.RG.ui.toast(`Added "${prod.name}" to your bag.`);
        }
        return;
      }

      // Quick view button
      const qvBtn = target.closest('[data-rg-quick-view]');
      if (qvBtn) {
        e.preventDefault();
        window.RG.ui.openQuickView(qvBtn.getAttribute('data-rg-quick-view'));
        return;
      }

      // Compare toggle button
      const cmpBtn = target.closest('[data-rg-compare-toggle]');
      if (cmpBtn) {
        e.preventDefault();
        window.RG.ui.toggleCompare(cmpBtn.getAttribute('data-rg-compare-toggle'));
        return;
      }

      if (target.closest('[data-rg-open-compare-modal]')) {
        e.preventDefault();
        window.RG.ui.openCompareModal();
        return;
      }

      if (target.closest('[data-rg-clear-compare]')) {
        e.preventDefault();
        window.RG.ui.clearCompare();
        return;
      }

      // Gift Finder Quiz trigger
      if (target.closest('[data-rg-open-quiz]')) {
        e.preventDefault();
        window.RG.ui.openGiftQuizModal();
        return;
      }

      // Swatch click on product card
      const swatch = target.closest('[data-rg-swatch-img]');
      if (swatch) {
        const card = swatch.closest('li.product');
        if (card) {
          card.querySelectorAll('.rg-swatch').forEach((s) => s.classList.remove('is-selected'));
          swatch.classList.add('is-selected');
          const primaryImg = card.querySelector('.rg-product-card__img-primary');
          const newSrc = swatch.getAttribute('data-rg-swatch-img');
          if (primaryImg && newSrc) primaryImg.src = newSrc;
        }
        return;
      }

      // Hotspot pin toggle
      
      // Hotspot Direct Add to Cart
      const hsAdd = target.closest('[data-rg-add-hotspot]');
      if (hsAdd) {
        e.preventDefault();
        const pid = Number(hsAdd.getAttribute('data-rg-add-hotspot'));
        const prod = window.RG.data.getProductById(pid);
        if (prod) {
          window.RG.cart.addItem(pid, 1);
          window.RG.ui.animateFlyToCart(hsAdd);
          window.RG.ui.openDrawer('rg-minicart-drawer');
          const defaultSize = (prod.attributes && prod.attributes.size && prod.attributes.size[0]) || 'Standard';
          window.RG.ui.toast(`Added to your cart: ${prod.name}, ${defaultSize}. View cart`, { viewCart: true });
          document.querySelectorAll('[data-rg-cart-count]').forEach((b) => {
            b.classList.add('is-bouncing');
            setTimeout(() => b.classList.remove('is-bouncing'), 400);
          });
        }
        return;
      }

      const pin = target.closest('[data-rg-hotspot]');
      if (pin) {
        e.preventDefault();
        const wasOpen = pin.classList.contains('is-open');
        document.querySelectorAll('[data-rg-hotspot].is-open').forEach((p) => p.classList.remove('is-open'));
        if (!wasOpen) pin.classList.add('is-open');
        return;
      }

      // Wishlist toggle
      const wlBtn = target.closest('[data-rg-wishlist-toggle]');
      if (wlBtn) {
        e.preventDefault();
        const pid = wlBtn.getAttribute('data-rg-wishlist-toggle');
        const added = window.RG.wishlist.toggle(pid);
        const prod = window.RG.data.getProductById(pid);
        document.querySelectorAll(`[data-rg-wishlist-toggle="${pid}"]`).forEach((b) => b.classList.toggle('is-active', added));
        if (added) {
          wlBtn.classList.add('is-bursting');
          setTimeout(() => wlBtn.classList.remove('is-bursting'), 450);
          window.RG.ui.toast('Saved to your wishlist');
        } else {
          window.RG.ui.toast('Removed. Undo', {
            undo: () => {
              window.RG.wishlist.toggle(pid);
              document.querySelectorAll(`[data-rg-wishlist-toggle="${pid}"]`).forEach((b) => b.classList.add('is-active'));
              window.RG.ui.toast('Saved to your wishlist');
            }
          });
        }
        return;
      }

      // Open Size Guide Modal
      const sgBtn = target.closest('[data-rg-open-size-guide]');
      if (sgBtn) {
        e.preventDefault();
        window.RG.ui.openSizeGuideModal(sgBtn.getAttribute('data-rg-open-size-guide'));
        return;
      }

      // Size Guide Tab Switch
      const sgTab = target.closest('[data-size-tab]');
      if (sgTab) {
        window.RG.ui.openSizeGuideModal(sgTab.getAttribute('data-size-tab'));
        return;
      }

      // Open drawer / overlay triggers
      const openDrawerBtn = target.closest('[data-rg-open-drawer]');
      if (openDrawerBtn) {
        e.preventDefault();
        window.RG.ui.openDrawer(openDrawerBtn.getAttribute('data-rg-open-drawer'));
        return;
      }

      const openSearchBtn = target.closest('[data-rg-open-search]');
      if (openSearchBtn) {
        e.preventDefault();
        const ov = document.getElementById('rg-search-overlay');
        const backdrop = document.getElementById('rg-global-backdrop');
        if (ov) ov.classList.add('is-open');
        if (backdrop) backdrop.classList.add('is-open');
        const inp = document.getElementById('rg-search-overlay-input');
        if (inp) setTimeout(() => inp.focus(), 100);
        return;
      }

      if (target.closest('[data-rg-close-overlays]') || target.id === 'rg-global-backdrop') {
        window.RG.ui.closeAllOverlays();
        return;
      }

      if (target.closest('[data-rg-print-receipt]')) {
        window.print();
        return;
      }

      if (target.closest('[data-rg-toggle-styles]')) {
        const sw = document.getElementById('rg-style-switcher');
        if (sw) sw.hidden = !sw.hidden;
        return;
      }

      const inc = target.closest('[data-rg-cart-inc]');
      if (inc) {
        const key = inc.getAttribute('data-rg-cart-inc');
        const item = window.RG.cart.getState().items.find((i) => i.key === key);
        if (item) window.RG.cart.updateQty(key, item.qty + 1);
        return;
      }
      const dec = target.closest('[data-rg-cart-dec]');
      if (dec) {
        const key = dec.getAttribute('data-rg-cart-dec');
        const item = window.RG.cart.getState().items.find((i) => i.key === key);
        if (item) window.RG.cart.updateQty(key, item.qty - 1);
        return;
      }
      const rem = target.closest('[data-rg-cart-remove]');
      if (rem) {
        const removed = window.RG.cart.removeItem(rem.getAttribute('data-rg-cart-remove'));
        if (removed) {
          window.RG.ui.toast(`Removed "${removed.name}"`, {
            undo: () => window.RG.cart.undoRemove()
          });
        }
        return;
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.matches('[data-rg-giftwrap-toggle]')) {
        window.RG.cart.setGiftWrap(e.target.checked);
      }
    });
  }

  function initHomeSections() {
    const newRail = document.getElementById('rg-home-new-rail');
    if (newRail) {
      const list = window.RG.data.getProducts().filter((p) => p.is_new).slice(0, 8);
      newRail.innerHTML = list.map((p) => `<ul class="products" style="display:contents;">${window.RG.ui.renderProductCard(p)}</ul>`).join('');
    }

    const weddingGrid = document.getElementById('rg-home-wedding-grid');
    if (weddingGrid) {
      const list = window.RG.data.getProducts().filter((p) => (p.occasions || []).includes('Wedding')).slice(0, 4);
      weddingGrid.innerHTML = list.map((p) => window.RG.ui.renderProductCard(p)).join('');
    }

    const winterGrid = document.getElementById('rg-home-winter-grid');
    if (winterGrid) {
      const list = window.RG.data.getProducts().filter((p) => (p.tags || []).includes('winter warmers') || p.categories.includes('Shawls & Scarves')).slice(0, 4);
      winterGrid.innerHTML = list.map((p) => window.RG.ui.renderProductCard(p)).join('');
    }

    const under3kGrid = document.getElementById('rg-home-under3k-grid');
    if (under3kGrid) {
      const list = window.RG.data.getProducts().filter((p) => p.price <= 3000).slice(0, 4);
      under3kGrid.innerHTML = list.map((p) => window.RG.ui.renderProductCard(p)).join('');
    }

    const reviewsGrid = document.getElementById('rg-home-reviews-grid');
    if (reviewsGrid) {
      const allReviews = window.RG.data.getReviews() || [];
      const cardsHtml = allReviews.map((r) => window.RG.ui.renderReviewCard(r)).join('');
      // Duplicate for smooth continuous looping marquee
      reviewsGrid.innerHTML = cardsHtml + cardsHtml;
    }

    const journalGrid = document.getElementById('rg-home-journal-grid');
    if (journalGrid) {
      journalGrid.innerHTML = window.RG.data.getJournalPosts().slice(0, 3).map((j) => window.RG.ui.renderJournalCard(j)).join('');
    }

    const campaignGrid = document.getElementById('rg-campaign-calendar-grid');
    const campaignDetail = document.getElementById('rg-campaign-day-detail');
    if (campaignGrid) {
      const topics = [
        'Day 1: The Story of ReGongches', 'Day 2: Blocking a Gilgiti Patti Cap', 'Day 3: Hunza Counted Cross-Stitch',
        'Day 4: How to Measure Your Cap Size', 'Day 5: Washing Fleece in Glacier Water', 'Day 6: Pattu Waistcoat Tailoring',
        'Day 7: Shigar Natural Walnut Dyeing', 'Day 8: Meet Ustad Karim [Verify]', 'Day 9: Caring for Highland Wool',
        'Day 10: Styling for Campus Cultural Day', 'Day 11: Inside the Heritage Gift Box', 'Day 12: Diamond Eye Twill Weave',
        'Day 13: Ghizer Soft Pakol Craft', 'Day 14: Why Origin Verification Matters', 'Day 15: Wedding Chugha Traditions'
      ];
      let html = '';
      for (let d = 1; d <= 30; d++) {
        const unlocked = d <= 15;
        const label = topics[d - 1] || `Day ${d}: Valley Craft & Heritage Drop`;
        html += `
          <button type="button" class="rg-campaign-day ${unlocked ? 'is-unlocked' : 'is-locked'}" data-rg-campaign-day="${d}" data-rg-campaign-title="${label}">
            <span style="font-size:11px;text-transform:uppercase;color:var(--text-secondary);display:block;">Day ${d}</span>
            <strong style="font-size:12px;">${unlocked ? '✓ Revealed' : '🔒 Soon'}</strong>
          </button>
        `;
      }
      campaignGrid.innerHTML = html;
      campaignGrid.querySelectorAll('[data-rg-campaign-day]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const d = Number(btn.getAttribute('data-rg-campaign-day'));
          const title = btn.getAttribute('data-rg-campaign-title');
          if (campaignDetail) {
            campaignDetail.innerHTML = `<strong>${title}</strong> — Thirty days of clothing, craftsmanship, stories and traditions from the mountains of Gilgit-Baltistan.`;
          }
          window.RG.ui.toast(d <= 15 ? title : `Day ${d} unlocks soon in the Threads of the North campaign.`);
        });
      });
    }

    document.querySelectorAll('[data-rg-craft-step]').forEach((stepEl) => {
      stepEl.addEventListener('mouseenter', () => {
        const imgPath = stepEl.getAttribute('data-rg-craft-img');
        const preview = document.getElementById('rg-craft-story-preview-img');
        if (imgPath && preview) preview.src = imgPath;
      });
    });
  }

  function initSecondaryPages() {
    initCapSizeSlider();
    initBeforeAfterSliders();

    const wlGrid = document.getElementById('rg-wishlist-page-grid');
    if (wlGrid) {
      const renderWl = () => {
        const prods = window.RG.wishlist.getProducts();
        if (!prods.length) {
          wlGrid.innerHTML = `<li style="grid-column:1/-1;text-align:center;padding:48px 20px;background:var(--bg-elevated);border-radius:var(--radius-card);border:1px solid var(--rg-border);"><h3 style="margin-block-end:8px;">Nothing saved yet.</h3><p style="margin-inline:auto;color:var(--text-secondary);max-width:440px;margin-block-end:20px;">Tap the heart on any piece to keep it here.</p><a href="shop.html" class="rg-btn rg-btn--primary">Start with our best-loved Gilgiti caps</a></li>`;
        } else {
          wlGrid.innerHTML = prods.map((p) => window.RG.ui.renderProductCard(p)).join('');
        }
      };
      renderWl();
      window.addEventListener('rg:wishlist:updated', renderWl);
    }

    const artGrid = document.getElementById('rg-artisans-directory-grid');
    if (artGrid) {
      const renderArts = (regionFilter = '') => {
        const list = window.RG.data.getArtisans().filter((a) => !regionFilter || a.region.toLowerCase() === regionFilter.toLowerCase());
        artGrid.innerHTML = list.map((a) => window.RG.ui.renderArtisanCard(a)).join('');
      };
      renderArts();
      document.querySelectorAll('[data-rg-artisan-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          renderArts(btn.getAttribute('data-rg-artisan-filter'));
        });
      });
    }

    const singleArtBox = document.getElementById('rg-single-artisan-container');
    if (singleArtBox) {
      const params = new URLSearchParams(window.location.search);
      const art = window.RG.data.getArtisanById(params.get('id') || 'artisan-1');
      if (art) {
        document.title = `${art.name} — ReGongches Artisans`;
        const artProds = window.RG.data.getProducts().filter((p) => p.artisan_id === art.id);
        singleArtBox.innerHTML = `
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px;align-items:center;background:var(--bg-elevated);padding:32px;border-radius:var(--radius-card);border:1px solid var(--rg-border);margin-block-end:40px;">
            <img src="${art.avatar}" alt="${art.name}" style="width:220px;height:220px;border-radius:50%;object-fit:cover;border:4px solid var(--brand-accent);margin-inline:auto;">
            <div>
              <span class="rg-badge rg-badge--handmade">${art.district}</span>
              <h1 style="margin-block:8px;">${art.name}</h1>
              <p style="font-weight:600;color:var(--brand-primary);">${art.craft} · ${art.experienceYears} Years Experience</p>
              <blockquote style="font-style:italic;border-inline-start:3px solid var(--brand-accent);padding-inline-start:14px;margin-block:16px;">"${art.quote}"</blockquote>
              <p>${art.story}</p>
              <span class="rg-badge rg-badge--verified">${art.permissionStatus}</span>
            </div>
          </div>
          <h2 style="margin-block-end:20px;">Pieces Crafted by ${art.name}</h2>
          <ul class="products">${artProds.map((p) => window.RG.ui.renderProductCard(p)).join('')}</ul>
        `;
      }
    }

    const journalIndexGrid = document.getElementById('rg-journal-index-grid');
    if (journalIndexGrid) {
      const renderPosts = (cat = '') => {
        const list = window.RG.data.getJournalPosts().filter((j) => !cat || j.category.toLowerCase().includes(cat.toLowerCase()));
        journalIndexGrid.innerHTML = list.map((j) => window.RG.ui.renderJournalCard(j)).join('');
      };
      renderPosts();
      document.querySelectorAll('[data-rg-journal-cat]').forEach((btn) => {
        btn.addEventListener('click', () => renderPosts(btn.getAttribute('data-rg-journal-cat')));
      });
    }

    const singleJournalBox = document.getElementById('rg-single-journal-container');
    if (singleJournalBox) {
      const params = new URLSearchParams(window.location.search);
      const post = window.RG.data.getJournalPostById(params.get('id') || 'journal-1');
      const breadcrumbEl = document.getElementById('rg-product-breadcrumb-current');
      if (breadcrumbEl && post) breadcrumbEl.textContent = post.title;
      if (post) {
        document.title = `${post.title} — ReGongches Cultural Journal`;
        const relProds = (post.relatedProductIds || []).map((id) => window.RG.data.getProductById(id)).filter(Boolean);
        singleJournalBox.innerHTML = `
          <article class="post" style="max-width:820px;margin-inline:auto;">
            <span class="rg-badge rg-badge--handmade">${post.category}</span>
            <h1 class="entry-title" style="margin-block:12px;">${post.title}</h1>
            <p style="font-size:var(--text-xs);color:var(--text-secondary);">By ${post.author} · ${post.date} · ${post.readingTime}</p>
            <img src="${post.image}" alt="${post.title}" style="width:100%;max-height:420px;object-fit:cover;border-radius:var(--radius-card);margin-block:24px;">
            <div style="background:var(--bg-secondary);padding:16px 20px;border-radius:var(--radius-card);margin-block-end:24px;">
              <strong style="font-size:var(--text-xs);text-transform:uppercase;">Table of Contents</strong>
              <ul style="margin-block-start:8px;display:grid;gap:6px;font-size:var(--text-sm);">
                ${(post.toc || []).map((t) => `<li><a href="#${t.id}" style="color:var(--brand-primary);text-decoration:underline;">${t.label}</a></li>`).join('')}
              </ul>
            </div>
            <div class="entry-content" style="display:grid;gap:16px;">${post.content}</div>
          </article>
          <hr class="rg-stitch-line">
          <h3 style="margin-block-end:20px;">Featured Pieces from This Story</h3>
          <ul class="products">${relProds.map((p) => window.RG.ui.renderProductCard(p)).join('')}</ul>
        `;
      }
    }

    const giftBuilderForm = document.getElementById('rg-gift-builder-form');
    if (giftBuilderForm) {
      const updateGiftBuilder = () => {
        const capId = Number(giftBuilderForm.elements.gift_cap.value);
        const shawlId = Number(giftBuilderForm.elements.gift_shawl.value);
        const accId = Number(giftBuilderForm.elements.gift_acc.value);
        const boxFee = Number(giftBuilderForm.elements.gift_box.value);

        const p1 = window.RG.data.getProductById(capId);
        const p2 = window.RG.data.getProductById(shawlId);
        const p3 = window.RG.data.getProductById(accId);
        const bundleTotal = (p1 ? p1.price : 0) + (p2 ? p2.price : 0) + (p3 ? p3.price : 0) + boxFee;
        const discounted = Math.round(bundleTotal * 0.92);

        const totalEl = document.getElementById('rg-gift-builder-total');
        if (totalEl) totalEl.textContent = window.RG.data.formatPKR(discounted);
      };
      giftBuilderForm.addEventListener('change', updateGiftBuilder);
      updateGiftBuilder();

      giftBuilderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        window.RG.cart.addItem(Number(giftBuilderForm.elements.gift_cap.value), 1);
        window.RG.cart.addItem(Number(giftBuilderForm.elements.gift_shawl.value), 1);
        window.RG.cart.addItem(Number(giftBuilderForm.elements.gift_acc.value), 1);
        window.RG.cart.setGiftWrap(true, giftBuilderForm.elements.gift_message.value);
        window.RG.ui.openDrawer('rg-minicart-drawer');
        window.RG.ui.toast('Added your custom 3-piece Heritage Gift Set to your bag!');
      });
    }

    const faqSearch = document.getElementById('rg-faq-search-input');
    if (faqSearch) {
      faqSearch.addEventListener('input', () => {
        const q = faqSearch.value.trim().toLowerCase();
        document.querySelectorAll('[data-rg-faq-item]').forEach((item) => {
          const match = item.textContent.toLowerCase().includes(q);
          item.hidden = !match;
          if (q && match) item.open = true;
        });
      });
    }

    // Contact page order tracking lookup (RG-2026-0104 & RG-2026-0089)
    const contactTrackForm = document.getElementById('rg-contact-track-form');
    const contactTrackOut = document.getElementById('rg-contact-track-output');
    if (contactTrackForm && contactTrackOut) {
      contactTrackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idVal = (contactTrackForm.elements.track_id.value || '').trim().toUpperCase();
        const demoMap = {
          'RG-2026-0104': { status: 'In Transit via Leopards Tracked Courier', dest: 'Islamabad Capital Territory', items: '1 × Traditional Gilgiti Cap (56 cm) + 1 × Embroidered Shawl', eta: 'Arriving Tomorrow by 5:00 PM' },
          'RG-2026-0089': { status: 'Quality & Centimetre Verification Complete', dest: 'DHA Phase 5, Lahore', items: '1 × Executive Mountain Tribute Box', eta: 'Dispatched from Gilgit Hub — Est. 2 working days' }
        };
        const found = demoMap[idVal] || { status: 'Order Confirmed & Assigned to Artisan Guild', dest: 'Nationwide Tracked Route', items: 'Verified Heritage Order', eta: 'Standard 2–4 Working Days' };
        contactTrackOut.hidden = false;
        contactTrackOut.innerHTML = `
          <div style="padding:16px;background:var(--rg-success-bg);border-inline-start:4px solid var(--rg-success);border-radius:var(--radius-card);font-size:var(--text-sm);">
            <strong>Order ${idVal || 'RG-2026-0104'}: ${found.status}</strong><br>
            <span>Destination: ${found.dest} · Items: ${found.items}</span><br>
            <span style="color:var(--rg-success);font-weight:600;">${found.eta}</span>
          </div>
        `;
      });
    }

    document.querySelectorAll('[data-rg-demo-form]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = form.getAttribute('data-rg-demo-form') || 'Submitted successfully (Demo mode).';
        window.RG.ui.toast(msg);
        form.reset();
      });
    });
  }

  function updateWishlistBadges() {
    const count = window.RG.wishlist ? window.RG.wishlist.getIds().length : 0;
    document.querySelectorAll('[data-rg-wishlist-count]').forEach((el) => {
      el.textContent = String(count);
    });
  }

  window.RG = window.RG || {};
  window.RG.reinitPageControllers = function () {
    initHomeSections();
    if (window.RG.filters) window.RG.filters.init();
    if (window.RG.productPage) window.RG.productPage.init();
    if (window.RG.checkout) window.RG.checkout.init();
    if (window.RG.account) window.RG.account.init();
    initSecondaryPages();
    if (window.RG.motion) window.RG.motion.init();
  };

  document.addEventListener('DOMContentLoaded', () => {
    initThemePresets();
    initFirstVisitLoader();
    initAnnouncementBar();
    initStickyHeaderAndMenus();
    initSearchOverlay();
    initGlobalDelegation();

    window.RG.ui.renderMiniCart();
    window.RG.ui.renderCompareTray();
    updateWishlistBadges();
    window.addEventListener('rg:cart:updated', () => window.RG.ui.renderMiniCart());
    window.addEventListener('rg:wishlist:updated', updateWishlistBadges);

    window.RG.reinitPageControllers();
  });
})(window, document);
