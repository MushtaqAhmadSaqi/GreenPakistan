/**
 * ReGongches — Threads of Mountain Heritage
 * Accessible UI Controller: Header, Mega Menu, Modals, Drawers, Search, Reviews & Sequenced Notices (ui.js)
 * ============================================================================
 * Zero inline onclick/onerror handlers. All interactions use event delegation
 * and WCAG 2.2 AA keyboard navigation (Escape closes, focus trap, focus return).
 */

'use strict';

window.RG = window.RG || {};

/* ── 1. ACCESSIBLE TOAST NOTIFICATIONS ───────────────────────────────────── */
const Toast = {
  show(message, type = 'info', duration = 3800) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: 'ph-check-circle',
      error:   'ph-warning-circle',
      info:    'ph-info',
      cart:    'ph-shopping-bag'
    };
    const iconClass = icons[type] || icons.info;
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <i class="ph ${iconClass}" aria-hidden="true"></i>
      <span class="toast-msg">${window.RG.escapeHtml(message)}</span>
      <button type="button" class="toast-close" aria-label="Dismiss notification">
        <i class="ph ph-x" aria-hidden="true"></i>
      </button>
    `;
    container.appendChild(toast);

    const dismiss = () => {
      if (toast.classList.contains('is-leaving')) return;
      toast.classList.add('is-leaving');
      setTimeout(() => toast.remove(), 260);
    };

    toast.querySelector('.toast-close')?.addEventListener('click', dismiss);
    if (duration > 0) setTimeout(dismiss, duration);
  }
};

/* ── 2. MAIN UI CONTROLLER ───────────────────────────────────────────────── */
const UI = {
  scrollLockCount: 0,
  lastFocusedElement: null,
  quickViewProduct: null,
  qvQty: 1,
  qvSelectedSize: '',
  qvSelectedColor: '',
  sizeUnit: 'cm',

  get cfg() {
    return window.RG.CONFIG || window.CONFIG;
  },

  init() {
    this.initGlobalImageFallback();
    this.initTheme();
    this.initAnnouncementBar();
    this.initHeaderAndMenus();
    this.initFooterAccordionsAndConfig();
    this.initSearchOverlay();
    this.initCurrencySwitcher();
    this.initDrawers();
    this.initQuickViewModal();
    this.initUtilityModals();
    this.initReviews();
    this.initSequencedNotices();
    this.initBackToTopAndFloatingWhatsApp();
    this.initGlobalDelegation();
  },

  /* Global image error fallback listener (replaces inline onerror attributes!) */
  initGlobalImageFallback() {
    document.addEventListener('error', (e) => {
      const img = e.target;
      if (!img || img.tagName !== 'IMG') return;
      const fallback = img.dataset.fallback;
      if (fallback && img.src !== fallback) {
        img.src = fallback;
        return;
      }
      if (img.classList.contains('logo-img--light') && window.RG.BRAND_LOGO_LIGHT_SVG && img.src !== window.RG.BRAND_LOGO_LIGHT_SVG) {
        img.src = window.RG.BRAND_LOGO_LIGHT_SVG;
      } else if (img.classList.contains('logo-img') && window.RG.BRAND_LOGO_DARK_SVG && img.src !== window.RG.BRAND_LOGO_DARK_SVG) {
        img.src = window.RG.BRAND_LOGO_DARK_SVG;
      }
    }, true);
  },

  lockScroll() {
    this.scrollLockCount++;
    document.body.classList.add('scroll-locked');
  },

  unlockScroll() {
    this.scrollLockCount = Math.max(0, this.scrollLockCount - 1);
    if (this.scrollLockCount === 0) {
      document.body.classList.remove('scroll-locked');
    }
  },

  trapFocus(containerEl, returnTrigger = null) {
    if (!containerEl) return () => {};
    const triggerEl = returnTrigger || document.activeElement;
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusable = () => [...containerEl.querySelectorAll(selector)].filter(el => !el.hidden && el.offsetParent !== null);

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const list = getFocusable();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    containerEl.addEventListener('keydown', onKeyDown);
    setTimeout(() => {
      const list = getFocusable();
      if (list.length) list[0].focus();
    }, 40);

    return () => {
      containerEl.removeEventListener('keydown', onKeyDown);
      if (triggerEl && typeof triggerEl.focus === 'function') {
        try { triggerEl.focus(); } catch {}
      }
    };
  },

  /* ── THEME SWITCHER (Ivory Daylight ↔ Karakoram Night Mode) ── */
  initTheme() {
    const apply = (theme) => {
      const next = theme === 'dark' ? 'dark' : 'light';
      window.RG.Store.state.theme = next;
      document.documentElement.setAttribute('data-theme', next);
      document.querySelectorAll('#theme-toggle-icon, [data-theme-icon]').forEach(icon => {
        icon.className = next === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
      });
      document.querySelectorAll('#theme-toggle-btn, [data-theme-toggle]').forEach(btn => {
        btn.setAttribute('aria-label', next === 'dark' ? 'Switch to Ivory Daylight theme' : 'Switch to Karakoram Night Mode');
        btn.setAttribute('aria-pressed', String(next === 'dark'));
      });
    };

    apply(window.RG.Store.state.theme);

    document.querySelectorAll('#theme-toggle-btn, [data-theme-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = window.RG.Store.state.theme === 'dark' ? 'light' : 'dark';
        apply(next);
        window.RG.SafeStorage.set(this.cfg.storageKeys.theme, next);
        Toast.show(next === 'dark' ? 'Karakoram Night Mode enabled' : 'Ivory Daylight Mode enabled', 'info', 2200);
      });
    });
  },

  /* ── SINGLE SLIM, ROTATING, DISMISSIBLE ANNOUNCEMENT BAR ── */
  initAnnouncementBar() {
    const bar = document.getElementById('announcement-bar');
    if (!bar) return;

    const keys = this.cfg.storageKeys;
    if (window.RG.SafeStorage.getSession(keys.announcementDismissed, false)) {
      bar.hidden = true;
      document.documentElement.style.setProperty('--ann-bar-h', '0px');
      return;
    }

    const track = document.getElementById('ann-track');
    const slidesData = this.cfg.announcements || [];
    if (track && slidesData.length) {
      track.innerHTML = slidesData.map((s, i) => `
        <div class="ann-slide ${i === 0 ? 'active' : ''}" role="group" aria-roledescription="slide" aria-label="Announcement ${i + 1} of ${slidesData.length}">
          <span>${window.RG.escapeHtml(s.text)}</span>
          ${s.promoCode ? `<button type="button" class="ann-promo-copy" data-copy-promo="${window.RG.escapeHtml(s.promoCode)}"><strong>${window.RG.escapeHtml(s.actionLabel || s.promoCode)}</strong></button>` : ''}
        </div>
      `).join('');
    }

    const slides = [...bar.querySelectorAll('.ann-slide')];
    if (!slides.length) return;

    let currentIdx = 0;
    let paused = false;
    let timer = null;
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const showSlide = (idx) => {
      slides[currentIdx]?.classList.remove('active');
      currentIdx = (idx + slides.length) % slides.length;
      slides[currentIdx]?.classList.add('active');
    };

    const startRotation = () => {
      if (reducedMotion || slides.length <= 1) return;
      clearInterval(timer);
      timer = setInterval(() => {
        if (!paused) showSlide(currentIdx + 1);
      }, 5200);
    };

    document.getElementById('ann-prev')?.addEventListener('click', () => showSlide(currentIdx - 1));
    document.getElementById('ann-next')?.addEventListener('click', () => showSlide(currentIdx + 1));

    // Pause on hover AND keyboard focus
    bar.addEventListener('mouseenter', () => { paused = true; });
    bar.addEventListener('mouseleave', () => { paused = false; });
    bar.addEventListener('focusin', () => { paused = true; });
    bar.addEventListener('focusout', () => { paused = false; });

    document.getElementById('ann-dismiss')?.addEventListener('click', () => {
      clearInterval(timer);
      bar.hidden = true;
      document.documentElement.style.setProperty('--ann-bar-h', '0px');
      window.RG.SafeStorage.setSession(keys.announcementDismissed, true);
    });

    startRotation();
  },

  /* ── HEADER, MEGA MENU & MOBILE DRAWER (No duplicate nav items!) ── */
  initHeaderAndMenus() {
    const header = document.getElementById('header');
    if (header) {
      let lastY = window.scrollY;
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          header.classList.toggle('is-scrolled', y > 48);
          if (Math.abs(y - lastY) > 12) {
            header.classList.toggle('is-hidden-on-scroll', y > lastY && y > 180);
            lastY = y;
          }
          ticking = false;
        });
      }, { passive: true });
    }

    // Populate Mega Menu Region Panel & Mobile Region Accordion
    const regions = window.RG.REGIONS || [];
    const esc = window.RG.escapeHtml;
    const regionPanelList = document.getElementById('region-panel-list');
    if (regionPanelList && regions.length) {
      regionPanelList.innerHTML = regions.map(r => `
        <a href="shop.html?region=${encodeURIComponent(r.name)}" data-filter-region="${esc(r.name)}" class="region-panel-link">
          <span class="region-panel-name">${esc(r.name)} <small>(${esc(r.artisanCount)})</small></span>
          <span class="region-panel-desc">${esc(r.descriptor)}</span>
        </a>
      `).join('');
    }

    const mobileRegionList = document.getElementById('mobile-region-list');
    if (mobileRegionList && regions.length) {
      mobileRegionList.innerHTML = regions.map(r => `
        <li>
          <a href="shop.html?region=${encodeURIComponent(r.name)}" data-filter-region="${esc(r.name)}" class="mobile-sub-link">
            <span>${esc(r.name)}</span>
            <small>${esc(r.artisanCount)}</small>
          </a>
        </li>
      `).join('');
    }

    // Desktop Mega Menu triggers
    const megaPairs = [
      { triggerId: 'shop-trigger', menuId: 'mega-menu' },
      { triggerId: 'region-trigger', menuId: 'region-mega' }
    ];

    megaPairs.forEach(({ triggerId, menuId }) => {
      const trigger = document.getElementById(triggerId);
      const menu = document.getElementById(menuId);
      const parent = trigger?.closest('.has-mega');
      if (!trigger || !menu || !parent) return;

      let closeTimer = null;
      const open = () => {
        clearTimeout(closeTimer);
        megaPairs.forEach(other => {
          if (other.menuId !== menuId) {
            document.getElementById(other.menuId)?.classList.remove('is-open');
            document.getElementById(other.triggerId)?.setAttribute('aria-expanded', 'false');
          }
        });
        menu.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      };
      const close = () => {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
          menu.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
        }, 110);
      };

      parent.addEventListener('mouseenter', open);
      parent.addEventListener('mouseleave', close);
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.contains('is-open');
        isOpen ? close() : open();
      });
      parent.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          menu.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      });
      menu.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('[data-open-modal]')) {
          menu.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.has-mega')) {
        megaPairs.forEach(({ triggerId, menuId }) => {
          document.getElementById(menuId)?.classList.remove('is-open');
          document.getElementById(triggerId)?.setAttribute('aria-expanded', 'false');
        });
      }
    });

    // Full-screen Mobile Navigation Drawer
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    const mobileOpenBtn = document.getElementById('mobile-menu-btn');
    const mobileCloseBtn = document.getElementById('mobile-drawer-close');
    const mobileBackdrop = document.getElementById('mobile-backdrop');

    if (mobileDrawer && mobileOpenBtn) {
      let releaseMobileTrap = null;
      const openMobile = () => {
        mobileDrawer.classList.add('is-open');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        mobileOpenBtn.setAttribute('aria-expanded', 'true');
        mobileOpenBtn.classList.add('is-open');
        mobileBackdrop?.classList.add('is-visible');
        this.lockScroll();
        releaseMobileTrap = this.trapFocus(mobileDrawer, mobileOpenBtn);
      };
      const closeMobile = () => {
        if (!mobileDrawer.classList.contains('is-open')) return;
        mobileDrawer.classList.remove('is-open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        mobileOpenBtn.setAttribute('aria-expanded', 'false');
        mobileOpenBtn.classList.remove('is-open');
        mobileBackdrop?.classList.remove('is-visible');
        this.unlockScroll();
        if (releaseMobileTrap) { releaseMobileTrap(); releaseMobileTrap = null; }
      };

      mobileOpenBtn.addEventListener('click', openMobile);
      mobileCloseBtn?.addEventListener('click', closeMobile);
      mobileBackdrop?.addEventListener('click', closeMobile);

      mobileDrawer.querySelectorAll('.mobile-accordion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const expanded = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', String(!expanded));
          btn.nextElementSibling?.classList.toggle('is-open', !expanded);
        });
      });

      mobileDrawer.addEventListener('click', (e) => {
        if (e.target.closest('a[href]') || e.target.closest('[data-open-modal]')) {
          closeMobile();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileDrawer.classList.contains('is-open')) closeMobile();
      });
    }

    // Bottom mobile tab bar actions
    document.getElementById('search-tab-btn')?.addEventListener('click', () => this.openSearch());
    document.getElementById('wishlist-tab-btn')?.addEventListener('click', () => this.openWishlistDrawer());
    document.getElementById('cart-tab-btn')?.addEventListener('click', () => this.openCartDrawer());
  },

  /* ── FOOTER ACCORDIONS (Mobile) & DYNAMIC CONFIG INJECTION ── */
  initFooterAccordionsAndConfig() {
    const c = this.cfg.contact;
    const s = this.cfg.social;

    document.querySelectorAll('[data-config-phone]').forEach(el => {
      el.textContent = c.phoneDisplay;
      if (el.tagName === 'A') el.href = `tel:${c.phoneRaw}`;
    });
    document.querySelectorAll('[data-config-whatsapp]').forEach(el => {
      if (el.tagName === 'A') {
        const msg = el.dataset.waText || 'Assalam-o-Alaikum ReGongches Studio, I would like assistance with a heritage piece.';
        el.href = `${c.whatsappBaseUrl}?text=${encodeURIComponent(msg)}`;
      }
      if (el.hasAttribute('data-config-whatsapp-text')) {
        el.textContent = c.phoneDisplay;
      }
    });
    document.querySelectorAll('[data-config-email]').forEach(el => {
      el.textContent = c.email;
      if (el.tagName === 'A') el.href = `mailto:${c.email}`;
    });
    document.querySelectorAll('[data-config-address]').forEach(el => {
      el.textContent = c.studioAddress;
    });
    document.querySelectorAll('[data-config-hours]').forEach(el => {
      el.textContent = c.supportHours;
    });
    document.querySelectorAll('#copyright-year, [data-current-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });

    // Social links from CONFIG
    document.querySelectorAll('[data-social-link]').forEach(el => {
      const key = el.dataset.socialLink;
      if (s[key]) el.href = s[key];
    });

    // Mobile footer column accordions (inspired by footer.design)
    document.querySelectorAll('.footer-col-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const col = btn.closest('.footer-col');
        if (!col) return;
        const isOpen = col.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(isOpen));
      });
    });
  },

  /* ── EXPANDING SEARCH OVERLAY (Popular, Recent & Live Product Suggestions) ── */
  initSearchOverlay() {
    const overlay = document.getElementById('search-overlay');
    const backdrop = document.getElementById('search-backdrop');
    const openBtn = document.getElementById('search-btn');
    const closeBtn = document.getElementById('search-close');
    const input = document.getElementById('search-input');
    const clearBtn = document.getElementById('search-clear');
    const popularWrap = document.getElementById('search-popular');
    const resultsWrap = document.getElementById('search-results');
    const recentWrap = document.getElementById('search-recent-wrap');
    const recentChips = document.getElementById('search-recent-chips');

    if (!overlay || !input) return;

    let releaseSearchTrap = null;

    const renderRecents = () => {
      if (!recentWrap || !recentChips) return;
      const list = window.RG.SafeStorage.get(this.cfg.storageKeys.recentSearches, []);
      if (!list.length) {
        recentWrap.hidden = true;
        return;
      }
      recentWrap.hidden = false;
      recentChips.innerHTML = list.map(q => `
        <button type="button" class="search-chip" data-search-query="${window.RG.escapeHtml(q)}">${window.RG.escapeHtml(q)}</button>
      `).join('');
    };

    const saveRecent = (q) => {
      const clean = String(q || '').trim();
      if (!clean) return;
      const key = this.cfg.storageKeys.recentSearches;
      const prev = window.RG.SafeStorage.get(key, []);
      const next = [clean, ...prev.filter(x => x.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      window.RG.SafeStorage.set(key, next);
      renderRecents();
    };

    const runQuery = (rawQ) => {
      const q = String(rawQ || '').trim();
      if (clearBtn) clearBtn.hidden = !q;
      if (!q) {
        if (popularWrap) popularWrap.hidden = false;
        if (resultsWrap) resultsWrap.hidden = true;
        return;
      }
      if (popularWrap) popularWrap.hidden = true;
      if (resultsWrap) resultsWrap.hidden = false;

      const lower = q.toLowerCase();
      const matches = (window.RG.PRODUCTS || []).filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.region.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower) ||
        (p.sku || '').toLowerCase().includes(lower) ||
        (p.materials || '').toLowerCase().includes(lower) ||
        (p.craftTechnique || '').toLowerCase().includes(lower)
      );

      if (!matches.length) {
        resultsWrap.innerHTML = `
          <div class="search-no-results">
            <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
            <p>No heritage pieces matched "<strong>${window.RG.escapeHtml(q)}</strong>". Try searching for <em>Pakol</em>, <em>Pattu</em>, <em>Hunza</em>, <em>Baltistan</em>, or <em>Gift Box</em>.</p>
          </div>
        `;
        return;
      }

      const esc = window.RG.escapeHtml;
      resultsWrap.innerHTML = `
        <div class="search-results-header">
          <p class="search-label">${matches.length} heritage piece${matches.length !== 1 ? 's' : ''} found</p>
          <a href="shop.html?q=${encodeURIComponent(q)}" class="text-action-link">View all in Shop Archive →</a>
        </div>
        <div class="search-result-grid">
          ${matches.slice(0, 8).map(p => `
            <a href="product.html?id=${encodeURIComponent(p.id)}" class="search-result-card" data-search-hit="${esc(p.id)}">
              <div class="search-result-img">
                <img src="${esc(p.images[0])}" data-fallback="${esc(p.fallbackImage)}" alt="${esc(p.name)}" width="80" height="100" loading="lazy">
              </div>
              <div class="search-result-body">
                <span class="search-result-region">${esc(p.region)} · ★ ${(p.rating || 4.9).toFixed(1)}</span>
                <p class="search-result-name">${esc(p.name)}</p>
                <p class="search-result-price">${window.RG.formatPrice(p.price)}</p>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    };

    this.openSearch = () => {
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      backdrop?.classList.add('is-visible');
      this.lockScroll();
      renderRecents();
      releaseSearchTrap = this.trapFocus(overlay, openBtn);
      setTimeout(() => input.focus(), 50);
    };

    this.closeSearch = () => {
      if (!overlay.classList.contains('is-open')) return;
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      backdrop?.classList.remove('is-visible');
      this.unlockScroll();
      if (releaseSearchTrap) { releaseSearchTrap(); releaseSearchTrap = null; }
    };

    openBtn?.addEventListener('click', () => this.openSearch());
    closeBtn?.addEventListener('click', () => this.closeSearch());
    backdrop?.addEventListener('click', () => this.closeSearch());

    input.addEventListener('input', () => runQuery(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        saveRecent(input.value.trim());
      }
    });

    clearBtn?.addEventListener('click', () => {
      input.value = '';
      runQuery('');
      input.focus();
    });

    overlay.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-search-query], [data-query]');
      if (chip) {
        const q = chip.dataset.searchQuery || chip.dataset.query || '';
        input.value = q;
        saveRecent(q);
        runQuery(q);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !overlay.classList.contains('is-open') && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        this.openSearch();
      } else if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        this.closeSearch();
      }
    });
  },

  /* ── CURRENCY SWITCHER (With "≈ approx." & "charged in PKR") ── */
  initCurrencySwitcher() {
    const wrapper = document.querySelector('.currency-wrapper');
    const btn = document.getElementById('currency-btn');
    const dropdown = document.getElementById('currency-dropdown');
    const label = document.getElementById('currency-label');
    if (!wrapper || !btn || !dropdown) return;

    const updateAllPrices = () => {
      const cur = window.RG.Store.state.currency || 'PKR';
      if (label) label.textContent = cur;
      dropdown.querySelectorAll('[data-currency]').forEach(li => {
        li.setAttribute('aria-selected', String(li.dataset.currency === cur));
      });
      document.querySelectorAll('[data-pkr-price]').forEach(el => {
        const pkr = parseInt(el.dataset.pkrPrice, 10);
        if (!isNaN(pkr)) {
          const compareDel = el.querySelector('del');
          if (compareDel && el.dataset.pkrCompare) {
            const cmpPkr = parseInt(el.dataset.pkrCompare, 10);
            el.innerHTML = `${window.RG.formatPrice(pkr)} <del class="gift-compare">${window.RG.formatPrice(cmpPkr)}</del>`;
          } else {
            el.textContent = window.RG.formatPrice(pkr);
          }
        }
      });
      window.RG.Cart.renderCartUI();
      window.RG.Wishlist.renderWishlistUI();
      window.RG.Compare.renderCompareUI();
    };

    updateAllPrices();

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });

    dropdown.querySelectorAll('[data-currency]').forEach(li => {
      li.addEventListener('click', () => {
        const cur = li.dataset.currency || 'PKR';
        window.RG.Store.state.currency = cur;
        window.RG.SafeStorage.set(this.cfg.storageKeys.currency, cur);
        wrapper.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        updateAllPrices();
        window.RG.Store.notify();
        if (cur !== 'PKR') {
          Toast.show(`Showing approximate ${cur} prices (≈). All orders are settled in PKR at checkout.`, 'info', 3400);
        } else {
          Toast.show('Currency set to PKR (Pakistani Rupee).', 'info', 2200);
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  },

  /* ── CART & WISHLIST DRAWERS ── */
  initDrawers() {
    const cartDrawer = document.getElementById('cart-drawer');
    const wishlistDrawer = document.getElementById('wishlist-drawer');
    const backdrop = document.getElementById('drawer-backdrop');

    let releaseCartTrap = null;
    let releaseWishlistTrap = null;

    this.openCartDrawer = () => {
      if (!cartDrawer) return;
      this.closeWishlistDrawer();
      window.RG.Cart.renderCartUI();
      cartDrawer.classList.add('is-open');
      cartDrawer.setAttribute('aria-hidden', 'false');
      backdrop?.classList.add('is-visible');
      this.lockScroll();
      releaseCartTrap = this.trapFocus(cartDrawer, document.getElementById('cart-btn'));
    };

    this.closeCartDrawer = () => {
      if (!cartDrawer || !cartDrawer.classList.contains('is-open')) return;
      cartDrawer.classList.remove('is-open');
      cartDrawer.setAttribute('aria-hidden', 'true');
      backdrop?.classList.remove('is-visible');
      this.unlockScroll();
      if (releaseCartTrap) { releaseCartTrap(); releaseCartTrap = null; }
    };

    this.openWishlistDrawer = () => {
      if (!wishlistDrawer) return;
      this.closeCartDrawer();
      window.RG.Wishlist.renderWishlistUI();
      wishlistDrawer.classList.add('is-open');
      wishlistDrawer.setAttribute('aria-hidden', 'false');
      backdrop?.classList.add('is-visible');
      this.lockScroll();
      releaseWishlistTrap = this.trapFocus(wishlistDrawer, document.getElementById('wishlist-btn'));
    };

    this.closeWishlistDrawer = () => {
      if (!wishlistDrawer || !wishlistDrawer.classList.contains('is-open')) return;
      wishlistDrawer.classList.remove('is-open');
      wishlistDrawer.setAttribute('aria-hidden', 'true');
      backdrop?.classList.remove('is-visible');
      this.unlockScroll();
      if (releaseWishlistTrap) { releaseWishlistTrap(); releaseWishlistTrap = null; }
    };

    document.getElementById('cart-btn')?.addEventListener('click', () => this.openCartDrawer());
    document.getElementById('cart-close')?.addEventListener('click', () => this.closeCartDrawer());
    document.getElementById('wishlist-btn')?.addEventListener('click', () => this.openWishlistDrawer());
    document.getElementById('wishlist-close')?.addEventListener('click', () => this.closeWishlistDrawer());

    backdrop?.addEventListener('click', () => {
      this.closeCartDrawer();
      this.closeWishlistDrawer();
      document.getElementById('mobile-filter-drawer')?.classList.remove('is-open');
    });

    // Cart controls inside drawer
    document.getElementById('gift-wrap-toggle')?.addEventListener('change', (e) => {
      window.RG.Cart.setGiftWrap(e.target.checked);
    });
    document.getElementById('order-note')?.addEventListener('input', (e) => {
      window.RG.Cart.setOrderNote(e.target.value);
    });
    document.getElementById('cart-promo-apply')?.addEventListener('click', () => {
      const input = document.getElementById('cart-promo-input');
      window.RG.Cart.applyPromo(input?.value || '');
    });
    document.getElementById('cart-promo-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        window.RG.Cart.applyPromo(e.target.value || '');
      }
    });
    document.getElementById('checkout-btn')?.addEventListener('click', () => {
      this.closeCartDrawer();
      window.RG.Checkout.open();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeCartDrawer();
        this.closeWishlistDrawer();
      }
    });
  },

  /* ── QUICK VIEW MODAL (Plus link to full shareable product.html) ── */
  initQuickViewModal() {
    const overlay = document.getElementById('quickview-overlay');
    if (!overlay) return;

    document.getElementById('quickview-close')?.addEventListener('click', () => this.closeQuickView());
    overlay.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeQuickView();
    });

    document.getElementById('qv-qty-inc')?.addEventListener('click', () => {
      this.qvQty = Math.min(10, this.qvQty + 1);
      const el = document.getElementById('qv-qty-val');
      if (el) el.textContent = this.qvQty;
    });
    document.getElementById('qv-qty-dec')?.addEventListener('click', () => {
      this.qvQty = Math.max(1, this.qvQty - 1);
      const el = document.getElementById('qv-qty-val');
      if (el) el.textContent = this.qvQty;
    });

    document.getElementById('qv-add-btn')?.addEventListener('click', () => {
      if (!this.quickViewProduct) return;
      window.RG.Cart.add(this.quickViewProduct, this.qvQty, this.qvSelectedSize, this.qvSelectedColor);
      this.closeQuickView();
      this.openCartDrawer();
    });

    document.getElementById('qv-buy-now-btn')?.addEventListener('click', () => {
      if (!this.quickViewProduct) return;
      window.RG.Cart.add(this.quickViewProduct, this.qvQty, this.qvSelectedSize, this.qvSelectedColor, true);
      this.closeQuickView();
      window.RG.Checkout.open();
    });

    document.getElementById('qv-compare-btn')?.addEventListener('click', () => {
      if (this.quickViewProduct) window.RG.Compare.toggle(this.quickViewProduct.id);
    });
    document.getElementById('qv-wishlist-btn')?.addEventListener('click', () => {
      if (this.quickViewProduct) window.RG.Wishlist.toggle(this.quickViewProduct.id);
    });
    document.getElementById('qv-share-btn')?.addEventListener('click', () => {
      if (!this.quickViewProduct) return;
      const url = new URL(`product.html?id=${encodeURIComponent(this.quickViewProduct.id)}`, window.location.href).href;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).catch(() => {});
      Toast.show(`Shareable product link copied!`, 'success', 2500);
    });

    // Hover-zoom loupe inside Quick View
    const zoomWrap = document.getElementById('qv-zoom-container');
    const mainImg = document.getElementById('qv-main-img');
    if (zoomWrap && mainImg) {
      zoomWrap.addEventListener('mousemove', (e) => {
        const rect = zoomWrap.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        mainImg.style.transformOrigin = `${x}% ${y}%`;
        zoomWrap.classList.add('is-zoomed');
      });
      zoomWrap.addEventListener('mouseleave', () => {
        zoomWrap.classList.remove('is-zoomed');
        mainImg.style.transformOrigin = 'center center';
      });
    }
  },

  openQuickView(product) {
    if (!product) return;
    const overlay = document.getElementById('quickview-overlay');
    if (!overlay) {
      window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
      return;
    }

    this.quickViewProduct = product;
    this.qvQty = 1;
    this.qvSelectedColor = window.RG.Store.state.cardColorMap[product.id] || product.colors?.[0]?.label || '';
    this.qvSelectedSize = product.sizes?.[0] || 'One Size';
    this.recordRecentlyViewed(product.id);

    const esc = window.RG.escapeHtml;
    const badgesEl = document.getElementById('qv-badges');
    if (badgesEl) {
      badgesEl.innerHTML = `
        <span class="badge badge--region">${esc(product.region)}</span>
        ${product.handmade ? `<span class="badge badge--handmade">${esc(product.handmadeLabel)}</span>` : ''}
        <a href="product.html?id=${encodeURIComponent(product.id)}" class="badge badge--link">Open Full Page →</a>
      `;
    }

    const nameEl = document.getElementById('qv-product-name');
    if (nameEl) nameEl.innerHTML = `<a href="product.html?id=${encodeURIComponent(product.id)}">${esc(product.name)}</a>`;

    const regionEl = document.getElementById('qv-region-line');
    if (regionEl) regionEl.textContent = `${product.region} · ${product.originVillage || product.handmadeLabel}`;

    const ratingEl = document.getElementById('qv-rating-pill');
    if (ratingEl) ratingEl.innerHTML = `<i class="ph-fill ph-star" aria-hidden="true"></i> ${(product.rating || 4.9).toFixed(1)} (${product.reviewCount || 24} reviews)`;

    const priceRow = document.getElementById('qv-price-row');
    if (priceRow) {
      priceRow.innerHTML = `
        <span class="qv-price">${window.RG.formatPrice(product.price)}</span>
        ${product.compareAtPrice ? `<del class="qv-compare">${window.RG.formatPrice(product.compareAtPrice)}</del>` : ''}
      `;
    }

    const statusEl = document.getElementById('qv-status');
    if (statusEl) {
      statusEl.innerHTML = `<span class="card-status">${esc(product.status)} · ${esc(product.leadTime || 'Tracked Dispatch')}</span>`;
    }

    const hlEl = document.getElementById('qv-highlights');
    if (hlEl) {
      hlEl.innerHTML = (product.highlights || []).map(h => `<li>${esc(h)}</li>`).join('');
    }

    const provCard = document.getElementById('qv-provenance-card');
    if (provCard) {
      provCard.innerHTML = `
        <div class="qv-prov-item"><strong>Origin Valley</strong><span>${esc(product.originVillage || product.region)}</span></div>
        <div class="qv-prov-item"><strong>Craft Technique</strong><span>${esc(product.craftTechnique || product.handmadeLabel)}</span></div>
        <div class="qv-prov-item"><strong>Artisan Guild</strong><span>${esc(product.artisanName)}</span></div>
        <div class="qv-prov-item"><strong>Weight &amp; Warmth</strong><span>${esc(product.weight)}</span></div>
      `;
    }

    const mainImg = document.getElementById('qv-main-img');
    const thumbs = document.getElementById('qv-thumbs');
    const gallery = [
      product.images?.[0] || product.fallbackImage,
      product.images?.[1] || product.fallbackImage,
      product.images?.[2] || product.fallbackImage
    ];
    const alts = product.imageAlts || [product.name, `${product.name} weave detail`, `${product.name} packaging`];

    if (mainImg) {
      mainImg.src = gallery[0];
      mainImg.dataset.fallback = product.fallbackImage;
      mainImg.alt = alts[0];
    }

    if (thumbs) {
      const labels = ['Garment View', 'Weave & Motif', 'Archival Box'];
      thumbs.innerHTML = gallery.map((src, i) => `
        <button type="button" class="qv-thumb ${i === 0 ? 'active' : ''}" data-qv-img="${esc(src)}" data-qv-alt="${esc(alts[i] || product.name)}" aria-label="${labels[i]}">
          <img src="${esc(src)}" data-fallback="${esc(product.fallbackImage)}" alt="" width="60" height="75" loading="lazy">
        </button>
      `).join('');
      thumbs.querySelectorAll('.qv-thumb').forEach(btn => {
        btn.addEventListener('click', () => {
          thumbs.querySelectorAll('.qv-thumb').forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
          if (mainImg) {
            mainImg.src = btn.dataset.qvImg;
            mainImg.alt = btn.dataset.qvAlt;
          }
        });
      });
    }

    // Swatches
    const colorSwatches = document.getElementById('qv-color-swatches');
    const selColorLabel = document.getElementById('qv-selected-color');
    if (colorSwatches && product.colors?.length) {
      if (selColorLabel) selColorLabel.textContent = this.qvSelectedColor;
      colorSwatches.innerHTML = product.colors.map(c => `
        <button type="button" class="color-swatch ${c.label === this.qvSelectedColor ? 'is-selected' : ''}"
          style="background:${esc(c.hex)}"
          title="${esc(c.label)}"
          aria-label="Select colour ${esc(c.label)}"
          data-qv-color="${esc(c.label)}"></button>
      `).join('');
      colorSwatches.querySelectorAll('[data-qv-color]').forEach(sw => {
        sw.addEventListener('click', () => {
          this.qvSelectedColor = sw.dataset.qvColor;
          if (selColorLabel) selColorLabel.textContent = this.qvSelectedColor;
          colorSwatches.querySelectorAll('.color-swatch').forEach(x => x.classList.toggle('is-selected', x === sw));
        });
      });
    }

    // Sizes
    const sizeBtns = document.getElementById('qv-size-buttons');
    const selSizeLabel = document.getElementById('qv-selected-size');
    if (sizeBtns && product.sizes?.length) {
      if (selSizeLabel) selSizeLabel.textContent = this.qvSelectedSize;
      sizeBtns.innerHTML = product.sizes.map(s => `
        <button type="button" class="size-btn ${s === this.qvSelectedSize ? 'is-selected' : ''}"
          aria-pressed="${s === this.qvSelectedSize}"
          data-qv-size="${esc(s)}">${esc(s)}</button>
      `).join('');
      sizeBtns.querySelectorAll('[data-qv-size]').forEach(b => {
        b.addEventListener('click', () => {
          this.qvSelectedSize = b.dataset.qvSize;
          if (selSizeLabel) selSizeLabel.textContent = this.qvSelectedSize;
          sizeBtns.querySelectorAll('.size-btn').forEach(x => {
            x.classList.toggle('is-selected', x === b);
            x.setAttribute('aria-pressed', String(x === b));
          });
        });
      });
    }

    const qtyVal = document.getElementById('qv-qty-val');
    if (qtyVal) qtyVal.textContent = '1';

    const storyEl = document.getElementById('qv-story');
    if (storyEl) {
      storyEl.innerHTML = `<p>${esc(product.shortStory)}</p>${product.artisanNote ? `<p class="mt-2"><strong>Artisan Note:</strong> ${esc(product.artisanNote)}</p>` : ''}`;
    }
    const matEl = document.getElementById('qv-materials');
    if (matEl) matEl.textContent = product.materials;
    const careEl = document.getElementById('qv-care');
    if (careEl) careEl.textContent = product.care;

    const waLink = document.getElementById('qv-whatsapp-link');
    if (waLink) {
      const msg = `Assalam-o-Alaikum ReGongches Studio, I have a question about ${product.name} (${product.sku}) — ${window.RG.formatPkr(product.price)}.`;
      waLink.href = `${this.cfg.contact.whatsappBaseUrl}?text=${encodeURIComponent(msg)}`;
    }

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    this.lockScroll();
    this.releaseQvTrap = this.trapFocus(overlay);
  },

  closeQuickView() {
    const overlay = document.getElementById('quickview-overlay');
    if (!overlay || !overlay.classList.contains('is-open')) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    this.unlockScroll();
    if (this.releaseQvTrap) { this.releaseQvTrap(); this.releaseQvTrap = null; }
  },

  recordRecentlyViewed(productId) {
    const key = this.cfg.storageKeys.recentlyViewed;
    const prev = window.RG.SafeStorage.get(key, []);
    const next = [productId, ...prev.filter(id => id !== productId)].slice(0, 4);
    window.RG.Store.state.recentlyViewed = next;
    window.RG.SafeStorage.set(key, next);
  },

  /* ── UTILITY MODALS: SIZE GUIDE, ORDER TRACKER, ARTISANS, FAQ, BESPOKE, COMPARE, JOURNAL ── */
  initUtilityModals() {
    const closeBindings = [
      ['size-care-close', 'size-care-modal-overlay'],
      ['tracker-modal-close', 'tracker-modal-overlay'],
      ['info-modal-close', 'info-modal-overlay'],
      ['custom-order-close', 'custom-order-overlay'],
      ['compare-modal-close', 'compare-modal-overlay'],
      ['journal-modal-close', 'journal-modal-overlay']
    ];

    closeBindings.forEach(([btnId, overlayId]) => {
      document.getElementById(btnId)?.addEventListener('click', () => this.closeModalById(overlayId));
      const ov = document.getElementById(overlayId);
      ov?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) this.closeModalById(overlayId);
      });
    });

    // Compare triggers
    document.getElementById('compare-open-btn')?.addEventListener('click', () => this.openModal('compare'));
    document.getElementById('open-compare-modal-btn')?.addEventListener('click', () => this.openModal('compare'));
    document.getElementById('compare-clear-btn')?.addEventListener('click', () => window.RG.Compare.clear());

    // Size Guide cm/in toggle & Fit Finder
    document.querySelectorAll('.unit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.sizeUnit = btn.dataset.unit || 'cm';
        this.renderSizeGuideTables();
      });
    });

    document.getElementById('fit-chest-input')?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      const res = document.getElementById('fit-finder-result');
      if (!res) return;
      if (!val || val < 75 || val > 140) {
        res.textContent = 'Enter chest measurement between 80 and 135 cm';
        return;
      }
      let rec = 'XL (116 cm Garment Chest)';
      if (val <= 95) rec = 'S (98 cm Garment Chest)';
      else if (val <= 102) rec = 'M (104 cm Garment Chest)';
      else if (val <= 108) rec = 'L (110 cm Garment Chest)';
      res.textContent = `Recommended Highland Size: ${rec}`;
    });

    // Order Tracker Form
    document.getElementById('tracker-lookup-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const ref = document.getElementById('tracker-input')?.value.trim();
      if (ref) this.renderTrackerResult(ref);
    });
    document.getElementById('tracker-demo-btn')?.addEventListener('click', () => {
      const demoRef = this.cfg.orderHandoff.demoOrderRef;
      const input = document.getElementById('tracker-input');
      if (input) input.value = demoRef;
      this.renderTrackerResult(demoRef);
    });

    // Bespoke Commission Form
    document.querySelectorAll('#custom-order-btn, #custom-gift-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openModal('custom-order'));
    });

    document.getElementById('custom-order-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const occasion = document.getElementById('cof-occasion')?.value.trim() || '';
      const item = document.getElementById('cof-item')?.value.trim() || '';
      const sizing = document.getElementById('cof-sizing')?.value.trim() || '';
      const budget = document.getElementById('cof-budget')?.value || 'Flexible';
      const date = document.getElementById('cof-date')?.value || 'Flexible';
      const phone = document.getElementById('cof-phone')?.value.trim() || '';

      let valid = true;
      const setErr = (id, errId, msg) => {
        const el = document.getElementById(id);
        const err = document.getElementById(errId);
        if (el) el.classList.toggle('is-error', Boolean(msg));
        if (err) err.textContent = msg;
        if (msg) valid = false;
      };

      setErr('cof-occasion', 'cof-occasion-error', occasion ? '' : 'Please select an occasion.');
      setErr('cof-item', 'cof-item-error', item.length >= 3 ? '' : 'Please describe the garment or gift curation.');
      setErr('cof-phone', 'cof-phone-error', phone.length >= 8 ? '' : 'Please enter a valid WhatsApp / phone number.');

      if (!valid) return;

      const waText = [
        `✦ *ReGongches Bespoke Studio Commission* ✦`,
        `• Occasion: ${occasion}`,
        `• Requested Piece: ${item}`,
        sizing ? `• Measurements / Palette: ${sizing}` : null,
        `• Budget Range: ${budget}`,
        `• Target Date: ${date}`,
        `• Client Phone: ${phone}`
      ].filter(Boolean).join('\n');

      const waUrl = `${this.cfg.contact.whatsappBaseUrl}?text=${encodeURIComponent(waText)}`;
      this.closeModalById('custom-order-overlay');
      Toast.show('Bespoke inquiry prepared! Opening WhatsApp to connect you with our Gilgit master tailors.', 'success', 5000);
      try { window.open(waUrl, '_blank', 'noopener,noreferrer'); } catch {}
      e.target.reset();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeBindings.forEach(([, ovId]) => {
          const el = document.getElementById(ovId);
          if (el?.classList.contains('is-open')) this.closeModalById(ovId);
        });
        if (document.getElementById('quickview-overlay')?.classList.contains('is-open')) {
          this.closeQuickView();
        }
      }
    });
  },

  openModal(type, param = '') {
    this.closeQuickView();
    if (type === 'size-care') {
      this.renderSizeGuideTables();
      this.openModalElement('size-care-modal-overlay');
    } else if (type === 'tracker') {
      const ref = param || window.RG.Store.state.orders?.[0]?.id || this.cfg.orderHandoff.demoOrderRef;
      const input = document.getElementById('tracker-input');
      if (input) input.value = ref;
      this.renderTrackerResult(ref);
      this.renderSavedOrdersList();
      this.openModalElement('tracker-modal-overlay');
    } else if (type === 'artisans' || type === 'faq' || type === 'shipping' || type === 'exchange' || type === 'privacy') {
      const tab = (type === 'artisans') ? 'artisans' : 'faq';
      this.renderInfoModal(tab, param);
      this.openModalElement('info-modal-overlay');
    } else if (type === 'custom-order') {
      this.openModalElement('custom-order-overlay');
    } else if (type === 'compare') {
      window.RG.Compare.renderCompareTable();
      this.openModalElement('compare-modal-overlay');
    } else if (type === 'journal') {
      this.renderJournalReaderModal(param);
      this.openModalElement('journal-modal-overlay');
    }
  },

  openModalElement(overlayId) {
    const ov = document.getElementById(overlayId);
    if (!ov) return;
    ov.classList.add('is-open');
    ov.setAttribute('aria-hidden', 'false');
    this.lockScroll();
    ov._releaseTrap = this.trapFocus(ov);
  },

  closeModalById(overlayId) {
    const ov = document.getElementById(overlayId);
    if (!ov || !ov.classList.contains('is-open')) return;
    ov.classList.remove('is-open');
    ov.setAttribute('aria-hidden', 'true');
    this.unlockScroll();
    if (ov._releaseTrap) {
      ov._releaseTrap();
      ov._releaseTrap = null;
    }
  },

  renderSizeGuideTables() {
    const container = document.getElementById('size-tables-container');
    const data = window.RG.SIZE_GUIDE_DATA;
    if (!container || !data) return;
    const esc = window.RG.escapeHtml;

    container.innerHTML = Object.values(data).map(sec => {
      const rows = this.sizeUnit === 'in' ? sec.rowsIn : sec.rowsCm;
      return `
        <div class="size-table-block">
          <h3>${esc(sec.title)}</h3>
          <p>${esc(sec.note)}</p>
          <div class="table-responsive">
            <table class="size-table">
              <thead>
                <tr>${sec.headers.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${rows.map(r => `<tr>${r.map((cell, i) => i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join('');
  },

  renderTrackerResult(ref) {
    const area = document.getElementById('tracker-result-area');
    if (!area) return;
    const esc = window.RG.escapeHtml;
    const cleanRef = String(ref || '').trim().toUpperCase();
    const savedOrders = window.RG.SafeStorage.get(this.cfg.storageKeys.orders, []);
    let order = savedOrders.find(o => o.id.toUpperCase() === cleanRef);

    if (!order && cleanRef === 'RG-DEMO101') {
      order = {
        id: 'RG-DEMO101',
        date: '14 Oct 2026',
        customer: 'Demo Collector (Islamabad)',
        city: 'Islamabad',
        payment: 'Cash on Delivery (COD)',
        eta: '2–3 business days (Air/Road Express)',
        totalPkr: 7500,
        stage: 3,
        isDemo: true,
        items: [{ name: 'Traditional Cap & Shawl Gift Set', qty: 1, size: 'Cap: L/XL + Shawl: One Size' }]
      };
    }

    if (!order) {
      area.innerHTML = `
        <div class="tracker-card">
          <p>No order found in this browser’s local history with reference <strong>${esc(cleanRef)}</strong>.</p>
          <p class="mt-2" style="font-size:var(--fs-xs);opacity:.8">Note: Our static storefront saves orders locally on the device used at checkout and dispatches live status updates via WhatsApp. Click <strong>"Load Sample Dispatch (RG-DEMO101)"</strong> above to preview the 5-stage tracker, or contact our Gilgit desk on WhatsApp with your Order ID.</p>
        </div>
      `;
      return;
    }

    const stages = [
      { num: 1, icon: 'ph-check-circle',       label: 'Order Logged' },
      { num: 2, icon: 'ph-seal-check',         label: 'Gilgit Studio Audit' },
      { num: 3, icon: 'ph-package',            label: 'Packed & Sealed' },
      { num: 4, icon: 'ph-truck',              label: `In Transit to ${order.city}` },
      { num: 5, icon: 'ph-house-line',         label: 'Delivered' }
    ];

    const waStatusUrl = `${this.cfg.contact.whatsappBaseUrl}?text=${encodeURIComponent(`Assalam-o-Alaikum ReGongches, please share a live courier tracking update for Order Reference ${order.id}.`)}`;

    area.innerHTML = `
      <div class="tracker-card">
        <div class="tracker-card-header">
          <div>
            <span class="eyebrow">${order.isDemo ? 'Interactive Demo Shipment' : 'Saved Browser Order Record'}</span>
            <h3>Reference: ${esc(order.id)}</h3>
            <p>Logged ${esc(order.date)} · Destination: <strong>${esc(order.city)}</strong> · Est: ${esc(order.eta)}</p>
          </div>
          <div class="tracker-card-badges">
            <span class="badge badge--handmade">${window.RG.formatPkr(order.totalPkr)}</span>
            <a href="${waStatusUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              <i class="ph ph-whatsapp-logo" aria-hidden="true"></i> Request Live Courier Update
            </a>
          </div>
        </div>
        <div class="tracker-timeline" role="list" aria-label="5-stage order progress">
          ${stages.map(st => `
            <div class="tracker-stage ${st.num < order.stage ? 'is-complete' : ''} ${st.num === order.stage ? 'is-current' : ''}" role="listitem">
              <i class="ph ${st.icon}" aria-hidden="true"></i>
              <strong>0${st.num}. ${esc(st.label)}</strong>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderSavedOrdersList() {
    const listEl = document.getElementById('saved-orders-list');
    if (!listEl) return;
    const saved = window.RG.SafeStorage.get(this.cfg.storageKeys.orders, []);
    if (!saved.length) {
      listEl.innerHTML = `<p class="text-muted">No orders saved on this browser yet. Orders placed on this device are stored in localStorage for quick reference alongside your WhatsApp dispatch receipt.</p>`;
      return;
    }
    const esc = window.RG.escapeHtml;
    listEl.innerHTML = saved.map(o => `
      <div class="saved-order-card">
        <div>
          <strong>${esc(o.id)}</strong> · <span>${esc(o.date)}</span>
          <div style="font-size:var(--fs-xs);opacity:.75">${esc(o.city)} · ${o.items?.length || 1} piece(s) · ${window.RG.formatPkr(o.totalPkr)}</div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" data-inspect-order="${esc(o.id)}">View Progress</button>
      </div>
    `).join('');

    listEl.querySelectorAll('[data-inspect-order]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ref = btn.dataset.inspectOrder;
        const input = document.getElementById('tracker-input');
        if (input) input.value = ref;
        this.renderTrackerResult(ref);
      });
    });
  },

  renderInfoModal(activeTab = 'artisans', searchFaqQuery = '') {
    const content = document.getElementById('info-modal-content');
    if (!content) return;
    const esc = window.RG.escapeHtml;

    content.innerHTML = `
      <div class="lookbook-tabs" role="tablist" aria-label="Information sections" style="justify-content:flex-start;margin-bottom:20px">
        <button type="button" class="lookbook-tab-btn ${activeTab === 'artisans' ? 'is-active' : ''}" role="tab" aria-selected="${activeTab === 'artisans'}" data-info-tab="artisans">
          Artisans &amp; 4-Step Authenticity Promise
        </button>
        <button type="button" class="lookbook-tab-btn ${activeTab === 'faq' ? 'is-active' : ''}" role="tab" aria-selected="${activeTab === 'faq'}" data-info-tab="faq">
          Searchable FAQs, Shipping &amp; Policies
        </button>
      </div>
      <div id="info-tab-body"></div>
    `;

    content.querySelectorAll('[data-info-tab]').forEach(btn => {
      btn.addEventListener('click', () => this.renderInfoModal(btn.dataset.infoTab, ''));
    });

    const body = content.querySelector('#info-tab-body');
    if (!body) return;

    if (activeTab === 'artisans') {
      const steps = window.RG.AUTHENTICITY_PROMISE_STEPS || [];
      const artisans = window.RG.ARTISANS || [];
      body.innerHTML = `
        <span class="eyebrow">Verified Provenance Protocol</span>
        <h2 id="info-modal-title" style="font-size:var(--fs-2xl);margin-bottom:8px">Our 4-Step Authenticity Promise &amp; Partner Guilds</h2>
        <p style="font-size:var(--fs-sm);opacity:.82;line-height:1.7;margin-bottom:20px">Every ReGongches textile is documented from loom to doorstep across the 7 districts of Gilgit-Baltistan.</p>
        <div class="authenticity-steps-grid">
          ${steps.map(s => `
            <div class="auth-step-card">
              <span class="auth-step-num">Step ${esc(s.step)}</span>
              <h4>${esc(s.title)}</h4>
              <p>${esc(s.description)}</p>
            </div>
          `).join('')}
        </div>
        <h3 style="font-size:var(--fs-xl);margin:28px 0 12px">Documented Partner Guilds</h3>
        <div class="artisan-profile-grid">
          ${artisans.map(a => `
            <div class="artisan-profile-card">
              <div class="artisan-profile-meta">${esc(a.region)} · ${esc(a.members)}</div>
              <h4>${esc(a.name)}</h4>
              <p style="font-size:var(--fs-xs);font-weight:600;opacity:.85">${esc(a.specialty)}</p>
              <blockquote class="artisan-profile-quote">"${esc(a.quote)}"</blockquote>
              <p style="font-size:var(--fs-xs);opacity:.78;line-height:1.6">${esc(a.story)}</p>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      const faqs = window.RG.FAQS || [];
      body.innerHTML = `
        <span class="eyebrow">Customer Care &amp; Policies</span>
        <h2 id="info-modal-title" style="font-size:var(--fs-2xl);margin-bottom:12px">Searchable FAQ, Shipping Rates &amp; 14-Day Exchange Policy</h2>
        <div class="faq-search-bar mb-3">
          <label for="faq-modal-search" class="sr-only">Search FAQs and policies</label>
          <input type="search" id="faq-modal-search" class="inline-search-input" placeholder="Search shipping, COD limit, exchanges, pattu care, privacy…" value="${esc(searchFaqQuery)}" style="width:100%">
        </div>
        <div class="qv-accordions" id="faq-modal-list"></div>
      `;

      const listEl = body.querySelector('#faq-modal-list');
      const searchInput = body.querySelector('#faq-modal-search');
      const renderFaqItems = (q) => {
        const lower = String(q || '').toLowerCase().trim();
        const filtered = faqs.filter(f =>
          !lower ||
          f.q.toLowerCase().includes(lower) ||
          f.a.toLowerCase().includes(lower) ||
          f.category.toLowerCase().includes(lower)
        );
        if (!filtered.length) {
          listEl.innerHTML = `<p class="p-3">No FAQ matched "<strong>${esc(q)}</strong>". Chat with our concierge on WhatsApp for immediate help.</p>`;
          return;
        }
        listEl.innerHTML = filtered.map((f, idx) => `
          <details class="qv-accordion" ${idx === 0 || lower ? 'open' : ''}>
            <summary>
              <span><strong style="color:var(--c-blue)">[${esc(f.category)}]</strong> ${esc(f.q)}</span>
              <i class="ph ph-caret-down" aria-hidden="true"></i>
            </summary>
            <div class="qv-accordion-body">${esc(f.a)}</div>
          </details>
        `).join('');
      };

      renderFaqItems(searchFaqQuery);
      searchInput?.addEventListener('input', (e) => renderFaqItems(e.target.value));
    }
  },

  renderJournalReaderModal(articleId) {
    const articles = window.RG.JOURNAL_ARTICLES || [];
    const article = articles.find(a => a.id === articleId) || articles[0];
    const content = document.getElementById('journal-reader-content');
    if (!article || !content) return;

    const esc = window.RG.escapeHtml;
    const relatedProds = (article.relatedProductIds || [])
      .map(id => (window.RG.PRODUCTS || []).find(p => p.id === id))
      .filter(Boolean);

    content.innerHTML = `
      <span class="eyebrow">${esc(article.category)} · Cultural Journal</span>
      <h2 id="journal-modal-title" style="font-size:var(--fs-2xl)">${esc(article.title)}</h2>
      <div class="journal-reader-meta">
        <span><i class="ph ph-calendar" aria-hidden="true"></i> ${esc(article.date)}</span>
        <span><i class="ph ph-clock" aria-hidden="true"></i> ${esc(article.readingTime)}</span>
        <span><i class="ph ph-pen-nib" aria-hidden="true"></i> By ${esc(article.author)}</span>
      </div>
      ${article.pullQuote ? `<blockquote class="journal-reader-quote">"${esc(article.pullQuote)}"</blockquote>` : ''}
      <div class="journal-reader-body">${article.body}</div>
      ${relatedProds.length ? `
        <div class="journal-related-box">
          <h3>Heritage Pieces Mentioned in This Essay</h3>
          <div class="region-mini-products">
            ${relatedProds.map(p => `
              <a href="product.html?id=${encodeURIComponent(p.id)}" class="region-mini-card">
                <img src="${esc(p.images[0])}" data-fallback="${esc(p.fallbackImage)}" alt="${esc(p.name)}" width="52" height="65" loading="lazy">
                <div>
                  <strong>${esc(p.name)}</strong>
                  <span>${esc(p.region)} · ${window.RG.formatPrice(p.price)}</span>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  },

  /* ── HONEST REVIEWS ENGINE (Curated = Verified; User localStorage = Pending Moderation) ── */
  initReviews() {
    const carousel = document.getElementById('reviews-carousel');
    const toggleBtn = document.getElementById('toggle-write-review-btn');
    const cancelBtn = document.getElementById('cancel-write-review-btn');
    const form = document.getElementById('write-review-form');
    const prodSelect = document.getElementById('rv-product');
    if (!carousel) return;

    const esc = window.RG.escapeHtml;
    if (prodSelect && window.RG.PRODUCTS) {
      prodSelect.innerHTML = window.RG.PRODUCTS.map(p =>
        `<option value="${esc(p.name)}">${esc(p.name)} (${esc(p.region)})</option>`
      ).join('');
    }

    const renderAllReviews = () => {
      const curated = window.RG.CURATED_REVIEWS || [];
      const userSubmitted = window.RG.SafeStorage.get(this.cfg.storageKeys.userReviews, []);

      // User's own localStorage reviews shown ONLY to the author, clearly marked "Pending moderation"
      const userHtml = userSubmitted.map(r => `
        <article class="review-card review-card--pending" role="group" aria-roledescription="slide">
          <div class="review-card-top">
            <div class="stars" aria-label="${r.rating || 5} out of 5 stars">${'★'.repeat(r.rating || 5)}</div>
            <span class="pending-moderation-badge" title="Saved in your browser while awaiting studio moderation">
              <i class="ph ph-clock" aria-hidden="true"></i> Pending moderation (your submission)
            </span>
          </div>
          <blockquote class="review-text"><p>"${esc(r.comment)}"</p></blockquote>
          <footer class="review-meta">
            <strong>${esc(r.name)} · ${esc(r.city || 'Pakistan')}</strong>
            <span>Piece: ${esc(r.product)} · ${esc(r.date || 'Oct 2026')}</span>
          </footer>
        </article>
      `).join('');

      // Curated verified reviews from data/products.js
      const curatedHtml = curated.map(r => `
        <article class="review-card" role="group" aria-roledescription="slide">
          <div class="review-card-top">
            <div class="stars" aria-label="${r.rating} out of 5 stars">${'★'.repeat(r.rating)}</div>
            <span class="verified-badge">
              <i class="ph ph-user" aria-hidden="true"></i> Collector review
            </span>
          </div>
          <blockquote class="review-text"><p>"${esc(r.comment)}"</p></blockquote>
          <footer class="review-meta">
            <strong>${esc(r.name)} · ${esc(r.city)}</strong>
            <span>Purchased: ${esc(r.product)}</span>
            <small class="review-platform-date">${esc(r.date)} · ${esc(r.platform)}</small>
          </footer>
        </article>
      `).join('');

      carousel.innerHTML = userHtml + curatedHtml;
    };

    renderAllReviews();

    document.getElementById('reviews-prev')?.addEventListener('click', () => {
      carousel.scrollBy({ left: -340, behavior: 'smooth' });
    });
    document.getElementById('reviews-next')?.addEventListener('click', () => {
      carousel.scrollBy({ left: 340, behavior: 'smooth' });
    });

    toggleBtn?.addEventListener('click', () => {
      if (form) form.hidden = !form.hidden;
    });
    cancelBtn?.addEventListener('click', () => {
      if (form) form.hidden = true;
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('rv-name')?.value.trim() || '';
      const city = document.getElementById('rv-city')?.value.trim() || 'Pakistan';
      const product = document.getElementById('rv-product')?.value || '';
      const rating = parseInt(document.getElementById('rv-rating')?.value || '5', 10);
      const comment = document.getElementById('rv-comment')?.value.trim() || '';

      if (!name || !comment) {
        Toast.show('Please enter your name and review comment.', 'error');
        return;
      }

      const newRev = {
        name,
        city,
        product,
        rating,
        comment,
        date: new Date().toLocaleDateString('en-PK', { month: 'short', year: 'numeric' }),
        status: 'pending_moderation'
      };

      const key = this.cfg.storageKeys.userReviews;
      const existing = window.RG.SafeStorage.get(key, []);
      window.RG.SafeStorage.set(key, [newRev, ...existing]);
      renderAllReviews();
      form.reset();
      form.hidden = true;
      Toast.show('Review submitted! It is visible to you marked "Pending moderation" until verified by our studio.', 'success', 4800);
    });
  },

  /* ── SEQUENCED NOTIFICATIONS (Storage Notice First -> Newsletter 30s / 50% scroll / Exit Intent) ── */
  initSequencedNotices() {
    const keys = this.cfg.storageKeys;
    const popupCfg = this.cfg.popups;

    // 1. Storage Notice First (small bottom bar)
    const cookieBar = document.getElementById('cookie-bar');
    const storageAccepted = Boolean(window.RG.SafeStorage.get(keys.storageNoticeAccepted, false));

    if (cookieBar && !storageAccepted) {
      cookieBar.hidden = false;
      const dismissStorage = () => {
        cookieBar.hidden = true;
        window.RG.SafeStorage.set(keys.storageNoticeAccepted, true);
      };
      document.getElementById('cookie-accept')?.addEventListener('click', dismissStorage);
      document.getElementById('cookie-close')?.addEventListener('click', dismissStorage);
    }

    // 2. Newsletter Section inline form
    const inlineForm = document.getElementById('newsletter-form');
    inlineForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      const errEl = document.getElementById('newsletter-error');
      const email = (emailInput?.value || '').trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (errEl) errEl.textContent = 'Please enter a valid email address.';
        emailInput?.classList.add('is-error');
        return;
      }
      if (errEl) errEl.textContent = '';
      emailInput?.classList.remove('is-error');

      // P0-3 FIX: Only show success if a newsletter endpoint is configured.
      // Currently no newsletter service is set up. Show honest message instead.
      const successEl = document.getElementById('newsletter-success');
      const formWrapEl = document.getElementById('newsletter-form-wrap');
      // Check if a newsletter endpoint has been configured (future: add CONFIG.newsletterEndpoint)
      const newsletterEndpoint = (window.RG?.CONFIG?.newsletterEndpoint || '').trim();
      if (newsletterEndpoint) {
        // POST to configured endpoint
        fetch(newsletterEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        }).then(res => {
          if (res.ok) {
            formWrapEl?.setAttribute('hidden', '');
            if (successEl) successEl.removeAttribute('hidden');
            window.RG.SafeStorage.set(keys.newsletterSubscribed, true);
            this.suppressNewsletterForDays(popupCfg.newsletterCooldownDays);
            window.RG.Cart.applyPromo('HERITAGE10', true);
          } else {
            if (errEl) errEl.textContent = 'Sign-up temporarily unavailable. Please try again later.';
          }
        }).catch(() => {
          if (errEl) errEl.textContent = 'Unable to connect. Please try again later.';
        });
      } else {
        // No backend configured — honest degradation
        formWrapEl?.setAttribute('hidden', '');
        if (successEl) {
          successEl.removeAttribute('hidden');
          // Override success message to be honest
          const msgEl = successEl.querySelector('p, .newsletter-success-text');
          if (msgEl) {
            msgEl.textContent = 'Thank you for your interest! Our newsletter is coming soon. Follow us on Instagram @regongches for seasonal releases and artisan stories.';
          }
        }
        window.RG.SafeStorage.set(keys.newsletterSubscribed, true);
        this.suppressNewsletterForDays(popupCfg.newsletterCooldownDays);
        // Still apply welcome code as goodwill even without backend
        window.RG.Cart.applyPromo('HERITAGE10', true);
      }
    });

    // 3. Newsletter Popup (NEVER on first mobile page view, NEVER for 14 days once dismissed,
    //    NEVER while storage bar or another modal is open, ONLY after 30s OR 50% scroll OR exit intent)
    const exitOverlay = document.getElementById('exit-modal-overlay');
    if (!exitOverlay) return;

    const now = Date.now();
    const dismissedUntil = Number(window.RG.SafeStorage.get(keys.newsletterDismissedUntil, 0));
    const alreadySubscribed = Boolean(window.RG.SafeStorage.get(keys.newsletterSubscribed, false));

    if (alreadySubscribed || now < dismissedUntil) return;

    const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    const seenMobileFirstView = Boolean(window.RG.SafeStorage.getSession(keys.mobileFirstViewSeen, false));

    if (isMobile && popupCfg.disableNewsletterOnFirstMobileView && !seenMobileFirstView) {
      window.RG.SafeStorage.setSession(keys.mobileFirstViewSeen, true);
      return; // Never show on the first page view on mobile!
    }

    let newsletterShown = false;
    let releaseExitTrap = null;

    const canShowNewsletterNow = () => {
      if (newsletterShown) return false;
      // Do not show simultaneously with the storage notice!
      if (cookieBar && !cookieBar.hidden) return false;
      // Do not show if any other modal or drawer is open
      if (document.querySelector('.modal-overlay.is-open, .cart-drawer.is-open, .wishlist-drawer.is-open, .mobile-drawer.is-open, .search-overlay.is-open')) {
        return false;
      }
      return true;
    };

    const showNewsletterPopup = () => {
      if (!canShowNewsletterNow()) return;
      newsletterShown = true;
      this.suppressNewsletterForDays(popupCfg.newsletterCooldownDays);
      exitOverlay.classList.add('is-open');
      exitOverlay.setAttribute('aria-hidden', 'false');
      this.lockScroll();
      releaseExitTrap = this.trapFocus(exitOverlay);
    };

    const closeNewsletterPopup = () => {
      if (!exitOverlay.classList.contains('is-open')) return;
      exitOverlay.classList.remove('is-open');
      exitOverlay.setAttribute('aria-hidden', 'true');
      this.unlockScroll();
      this.suppressNewsletterForDays(popupCfg.newsletterCooldownDays);
      if (releaseExitTrap) { releaseExitTrap(); releaseExitTrap = null; }
    };

    // Trigger A: 30+ seconds on page
    setTimeout(() => {
      showNewsletterPopup();
    }, popupCfg.newsletterDelayMs || 30000);

    // Trigger B: 50% scroll depth (only after at least 8 seconds of reading)
    let pageLoadTime = Date.now();
    const onScrollCheck = () => {
      if (newsletterShown) {
        window.removeEventListener('scroll', onScrollCheck);
        return;
      }
      if (Date.now() - pageLoadTime < 8000) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 200 && (window.scrollY / maxScroll) >= (popupCfg.newsletterScrollThreshold || 0.5)) {
        showNewsletterPopup();
      }
    };
    window.addEventListener('scroll', onScrollCheck, { passive: true });

    // Trigger C: Desktop exit intent
    if (!isMobile) {
      document.addEventListener('mouseleave', (e) => {
        if (e.clientY <= 0 && (Date.now() - pageLoadTime > 5000)) {
          showNewsletterPopup();
        }
      });
    }

    document.getElementById('exit-modal-close')?.addEventListener('click', closeNewsletterPopup);
    document.getElementById('exit-modal-skip')?.addEventListener('click', closeNewsletterPopup);
    exitOverlay.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeNewsletterPopup();
    });

    document.getElementById('exit-newsletter-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('exit-email')?.value.trim() || '';
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Toast.show('Please enter a valid email address.', 'error');
        return;
      }
      window.RG.SafeStorage.set(keys.newsletterSubscribed, true);
      closeNewsletterPopup();
      window.RG.Cart.applyPromo('HERITAGE10', true);
      Toast.show('Thank you! Welcome code HERITAGE10 (10% off) has been applied to your cart.', 'success', 5000);
    });
  },

  suppressNewsletterForDays(days = 14) {
    const until = Date.now() + days * 24 * 60 * 60 * 1000;
    window.RG.SafeStorage.set(this.cfg.storageKeys.newsletterDismissedUntil, until);
  },

  /* ── BACK TO TOP & FLOATING WHATSAPP (Coordinates with Sticky Mobile ATC) ── */
  initBackToTopAndFloatingWhatsApp() {
    const backBtn = document.getElementById('back-to-top');
    const waFloat = document.getElementById('whatsapp-float');

    if (waFloat) {
      const msg = 'Assalam-o-Alaikum ReGongches Studio, I would like assistance choosing a Gilgit-Baltistan heritage piece.';
      waFloat.href = `${this.cfg.contact.whatsappBaseUrl}?text=${encodeURIComponent(msg)}`;
    }

    if (backBtn) {
      window.addEventListener('scroll', () => {
        const visible = window.scrollY > 520;
        backBtn.hidden = !visible;
        backBtn.classList.toggle('is-visible', visible);
      }, { passive: true });

      backBtn.addEventListener('click', () => {
        const rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: rm ? 'auto' : 'smooth' });
      });
    }
  },

  /* ── GLOBAL EVENT DELEGATION (Zero inline onclicks!) ── */
  initGlobalDelegation() {
    document.addEventListener('click', (e) => {
      // 1. Copy/Apply promo code from Announcement Bar
      const promoBtn = e.target.closest('[data-copy-promo]');
      if (promoBtn) {
        const code = promoBtn.dataset.copyPromo;
        if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code).catch(() => {});
        window.RG.Cart.applyPromo(code, true);
        return;
      }

      // 2. Colour swatch selection on product cards
      const swatchBtn = e.target.closest('[data-swatch-product]');
      if (swatchBtn) {
        e.preventDefault();
        e.stopPropagation();
        const pid = swatchBtn.dataset.swatchProduct;
        const color = swatchBtn.dataset.swatchColor;
        window.RG.Store.state.cardColorMap[pid] = color;
        const row = swatchBtn.closest('.card-swatches-row');
        row?.querySelectorAll('.card-mini-swatch').forEach(b => {
          b.classList.toggle('is-active', b === swatchBtn);
          b.setAttribute('aria-pressed', String(b === swatchBtn));
        });
        const lbl = row?.querySelector('.card-swatch-label');
        if (lbl) lbl.textContent = color;
        return;
      }

      // 3. Quick Add to Cart
      const quickAddBtn = e.target.closest('[data-quickadd-id]');
      if (quickAddBtn) {
        e.preventDefault();
        e.stopPropagation();
        const pid = quickAddBtn.dataset.quickaddId;
        const prod = (window.RG.PRODUCTS || []).find(p => p.id === pid);
        if (prod) {
          const color = window.RG.Store.state.cardColorMap[prod.id] || prod.colors?.[0]?.label || '';
          window.RG.Cart.add(prod, 1, prod.sizes?.[0] || 'One Size', color);
        }
        return;
      }

      // 4. Quick View Modal trigger
      const qvBtn = e.target.closest('[data-quickview-id], .gift-qv-btn[data-product-id], .social-tile[data-product-id]');
      if (qvBtn) {
        e.preventDefault();
        e.stopPropagation();
        const pid = qvBtn.dataset.quickviewId || qvBtn.dataset.productId;
        const prod = (window.RG.PRODUCTS || []).find(p => p.id === pid);
        if (prod) this.openQuickView(prod);
        return;
      }

      // 5. Wishlist toggle
      const wishBtn = e.target.closest('[data-wishlist-id]');
      if (wishBtn) {
        e.preventDefault();
        e.stopPropagation();
        window.RG.Wishlist.toggle(wishBtn.dataset.wishlistId);
        return;
      }

      // 6. Wishlist drawer actions
      const wishMove = e.target.closest('[data-wishlist-move]');
      if (wishMove) {
        const prod = (window.RG.PRODUCTS || []).find(p => p.id === wishMove.dataset.wishlistMove);
        if (prod) {
          window.RG.Cart.add(prod, 1, prod.sizes?.[0] || 'One Size', prod.colors?.[0]?.label || '');
          this.closeWishlistDrawer();
          this.openCartDrawer();
        }
        return;
      }
      const wishRem = e.target.closest('[data-wishlist-remove]');
      if (wishRem) {
        window.RG.Wishlist.toggle(wishRem.dataset.wishlistRemove);
        return;
      }

      // 7. Compare toggle & remove
      const cmpBtn = e.target.closest('[data-compare-id]');
      if (cmpBtn) {
        e.preventDefault();
        e.stopPropagation();
        window.RG.Compare.toggle(cmpBtn.dataset.compareId);
        return;
      }
      const cmpRem = e.target.closest('[data-compare-remove]');
      if (cmpRem) {
        window.RG.Compare.toggle(cmpRem.dataset.compareRemove);
        window.RG.Compare.renderCompareTable();
        return;
      }

      // 8. Cart item quantity & remove actions
      const cartAct = e.target.closest('[data-cart-action]');
      if (cartAct) {
        const action = cartAct.dataset.cartAction;
        const key = cartAct.dataset.cartKey;
        if (action === 'inc') window.RG.Cart.updateQty(key, +1);
        else if (action === 'dec') window.RG.Cart.updateQty(key, -1);
        else if (action === 'remove') window.RG.Cart.remove(key);
        else if (action === 'remove-promo') window.RG.Cart.removePromo();
        return;
      }

      // 9. Open Utility Modals
      const modalTrigger = e.target.closest('[data-open-modal]');
      if (modalTrigger) {
        e.preventDefault();
        this.openModal(modalTrigger.dataset.openModal, modalTrigger.dataset.modalParam || '');
        return;
      }
    });
  }
};

window.RG.Toast = Toast;
window.RG.UI = UI;
window.Toast = Toast;
