/**
 * ReGongches — Main Storefront Engine (Upgraded Premium Edition)
 * ─────────────────────────────────────────────────────────────────────────────
 * Modules:
 *  STATE & UTILS       — Runtime state, currency formatting, HTML escaping
 *  STORAGE & TOAST     — Persistent localStorage & accessible notifications
 *  THEME               — Ivory Daylight ↔ Karakoram Night Mode toggle
 *  ANNOUNCEMENT        — Rotating ticker + 1-click promo code copy
 *  HEADER & NAV        — Sticky glass header, mobile drawer, mega menus, tab bar
 *  SEARCH              — Full-screen live search overlay (/) + recent searches
 *  CATALOGUE           — 16-item grid, multi-facet filters, inline search, swatch preview
 *  LOOKBOOK            — Interactive "Shop the Mountain Lookbook" hotspot stage
 *  COMPARE             — Floating comparison tray & side-by-side matrix modal
 *  QUICK VIEW          — Hover-zoom loupe, provenance passport, Buy Now, share
 *  CART & PROMO ENGINE — Tiered rewards bar, promo codes, gift wrap, upsells
 *  WISHLIST            — Saved wishlist drawer & heart state sync
 *  CHECKOUT & INVOICE  — 4-step checkout, city shipping estimator, printable invoice
 *  TRACKER & MODALS    — 5-stage Order Tracker, Journal Reader, Size Guide, Artisans/FAQ
 *  REVIEWS             — Carousel + interactive customer review submission
 */

'use strict';

/* ══════════════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════════════ */
const STATE = {
  cart:             [],
  wishlist:         [],
  compare:          [],
  orders:           [],
  userReviews:      [],
  recentSearches:   [],
  recentlyViewed:   [],
  currency:         'PKR',
  theme:            'light',
  activePromo:      null,
  activeFilters:    { category: '', region: '', priceRange: '', status: '', sort: 'featured', badge: '', search: '' },
  cardColorMap:     {},
  gridCols:         3,
  quickViewProduct: null,
  qvQty:            1,
  qvSelectedSize:   '',
  qvSelectedColor:  '',
  activeLookbookIdx:0,
  activeHotspotIdx: 0,
  sizeUnit:         'cm',
  checkoutStep:     1,
  checkoutData:     {},
  lastPlacedOrder:  null,
  annPaused:        false,
  annIdx:           0,
};

const CURRENCY_RATES   = { PKR: 1, USD: 0.0036, GBP: 0.0028, AED: 0.013 };
const CURRENCY_SYMBOLS = { PKR: 'PKR ', USD: '$', GBP: '£', AED: 'AED ' };

/* ══════════════════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════════════════ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function formatPrice(pkr, currency = STATE.currency) {
  const rate = CURRENCY_RATES[currency] || 1;
  const sym  = CURRENCY_SYMBOLS[currency] || 'PKR ';
  const val  = pkr * rate;
  if (currency === 'PKR') return `PKR ${Math.round(val).toLocaleString('en-PK')}`;
  return `${sym}${val.toFixed(2)}`;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return escapeHtml(text).replace(re, '<mark>$1</mark>');
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function getFallbackImg(product) {
  return product?.fallbackImage || product?.images?.[1] || product?.images?.[0] || '';
}

/* ══════════════════════════════════════════════════════════════
   STORAGE
══════════════════════════════════════════════════════════════ */
const Storage = {
  get(key, def = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
    catch { return def; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
  getSession(key, def = null) {
    try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : def; }
    catch { return def; }
  },
  setSession(key, val) {
    try { sessionStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
};

/* ══════════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════════ */
const Toast = (() => {
  const container = () => $('#toast-container');

  function show(msg, type = 'info', duration = 4000) {
    const c = container();
    if (!c) return;
    const icons = {
      success: 'ph-check-circle',
      error:   'ph-x-circle',
      info:    'ph-info',
      cart:    'ph-shopping-bag'
    };
    const icon = icons[type] || icons.info;
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.setAttribute('role', 'status');
    t.innerHTML = `
      <i class="ph ${icon}" aria-hidden="true"></i>
      <span class="toast-msg">${escapeHtml(msg)}</span>
      <button class="toast-close" aria-label="Dismiss notification"><i class="ph ph-x"></i></button>`;
    c.appendChild(t);
    const remove = () => {
      t.classList.add('is-leaving');
      t.addEventListener('animationend', () => t.remove(), { once: true });
    };
    t.querySelector('.toast-close')?.addEventListener('click', remove);
    if (duration > 0) setTimeout(remove, duration);
    return remove;
  }

  return { show };
})();
window.Toast = Toast;

/* ══════════════════════════════════════════════════════════════
   SCROLL LOCK & FOCUS TRAP
══════════════════════════════════════════════════════════════ */
let lockCount = 0;
function lockScroll()   { lockCount++; document.body.classList.add('scroll-locked'); }
function unlockScroll() { lockCount = Math.max(0, lockCount - 1); if (!lockCount) document.body.classList.remove('scroll-locked'); }

function trapFocus(el) {
  if (!el) return () => {};
  const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const first = () => el.querySelectorAll(focusable)[0];
  const last  = () => { const all = el.querySelectorAll(focusable); return all[all.length - 1]; };

  function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) { if (document.activeElement === first()) { e.preventDefault(); last()?.focus(); } }
    else            { if (document.activeElement === last())  { e.preventDefault(); first()?.focus(); } }
  }
  el.addEventListener('keydown', handler);
  setTimeout(() => first()?.focus(), 50);
  return () => el.removeEventListener('keydown', handler);
}

/* ══════════════════════════════════════════════════════════════
   THEME TOGGLE (DAYLIGHT ↔ KARAKORAM NIGHT MODE)
══════════════════════════════════════════════════════════════ */
function initTheme() {
  const saved = Storage.get(typeof THEME_KEY !== 'undefined' ? THEME_KEY : 'regongches-theme', 'light');
  applyTheme(saved);

  $('#theme-toggle-btn')?.addEventListener('click', () => {
    const next = STATE.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    Storage.set(typeof THEME_KEY !== 'undefined' ? THEME_KEY : 'regongches-theme', next);
    Toast.show(next === 'dark' ? 'Karakoram Night Mode enabled' : 'Ivory Daylight Mode enabled', 'info', 2200);
  });
}

function applyTheme(theme) {
  STATE.theme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', STATE.theme);
  const icon = $('#theme-toggle-icon');
  if (icon) {
    icon.className = STATE.theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
  }
}

/* ══════════════════════════════════════════════════════════════
   ANNOUNCEMENT BAR & PROMO COPY
══════════════════════════════════════════════════════════════ */
function initAnnouncement() {
  const bar     = $('#announcement-bar');
  const slides  = $$('.ann-slide', bar);
  const prev    = $('#ann-prev');
  const next    = $('#ann-next');
  const dismiss = $('#ann-dismiss');
  if (!bar || !slides.length) return;

  if (Storage.getSession('ann-dismissed')) { bar.classList.add('is-dismissed'); return; }

  let timer;
  function show(idx) {
    slides[STATE.annIdx]?.classList.remove('active');
    STATE.annIdx = (idx + slides.length) % slides.length;
    slides[STATE.annIdx]?.classList.add('active');
  }
  function start() {
    timer = setInterval(() => { if (!STATE.annPaused) show(STATE.annIdx + 1); }, 4500);
  }

  prev?.addEventListener('click', () => show(STATE.annIdx - 1));
  next?.addEventListener('click', () => show(STATE.annIdx + 1));
  bar.addEventListener('mouseenter', () => { STATE.annPaused = true; });
  bar.addEventListener('mouseleave', () => { STATE.annPaused = false; });
  dismiss?.addEventListener('click', () => {
    bar.classList.add('is-dismissed');
    Storage.setSession('ann-dismissed', true);
    clearInterval(timer);
  });

  // 1-click promo copy & auto-apply
  bar.querySelectorAll('[data-copy-promo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.dataset.copyPromo;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(code).catch(() => {});
      }
      applyPromoCode(code, true);
    });
  });

  slides[0]?.classList.add('active');
  start();
}

/* ══════════════════════════════════════════════════════════════
   HEADER, MOBILE DRAWER & MEGA MENU
══════════════════════════════════════════════════════════════ */
function initHeader() {
  const header = $('#header');
  const hero   = $('#hero');
  if (!header) return;

  let lastY = 0;
  let frame = 0;

  function onScroll() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const y = window.scrollY;
      const scrolled = header.classList.contains('is-scrolled');
      header.classList.toggle('is-scrolled', scrolled ? y > 40 : y > 80);
      if (hero) {
        const heroBottom = hero.offsetTop + hero.offsetHeight - 80;
        header.classList.toggle('is-hero-top', y < heroBottom && y < 60);
      }
      if (window.matchMedia('(max-width: 768px)').matches && Math.abs(y - lastY) > 10) {
        header.classList.toggle('is-hidden-on-scroll', y > lastY && y > 120);
        lastY = y;
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const yearEl = $('#copyright-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initMobileDrawer() {
  const drawerEl   = $('#mobile-nav-drawer');
  const openBtn    = $('#mobile-menu-btn');
  const closeBtn   = $('#mobile-drawer-close');
  const backdrop   = $('#mobile-backdrop');
  const accordions = $$('.mobile-accordion-btn');
  if (!drawerEl) return;

  const regionList = $('#mobile-region-list');
  if (regionList && typeof REGIONS !== 'undefined') {
    regionList.innerHTML = REGIONS.map(r =>
      `<li><a href="#catalogue" data-filter-region="${escapeHtml(r.name)}" class="mobile-sub-link">${escapeHtml(r.name)} <small style="opacity:.55">— ${escapeHtml(r.descriptor)}</small></a></li>`
    ).join('');
  }

  let releaseTrapped;
  function open() {
    drawerEl.classList.add('is-open');
    backdrop?.classList.add('is-visible');
    drawerEl.setAttribute('aria-hidden', 'false');
    openBtn?.setAttribute('aria-expanded', 'true');
    lockScroll();
    releaseTrapped = trapFocus(drawerEl);
  }
  function close() {
    drawerEl.classList.remove('is-open');
    backdrop?.classList.remove('is-visible');
    drawerEl.setAttribute('aria-hidden', 'true');
    openBtn?.setAttribute('aria-expanded', 'false');
    unlockScroll();
    releaseTrapped?.();
    openBtn?.focus();
  }

  openBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawerEl.classList.contains('is-open')) close(); });

  accordions.forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      btn.nextElementSibling?.classList.toggle('is-open', !expanded);
    });
  });

  drawerEl.addEventListener('click', e => {
    if (e.target.closest('a[href]') || e.target.closest('[data-open-modal]')) {
      close();
    }
  });
}

function initMegaMenu() {
  const regionPanelList = $('#region-panel-list');
  if (regionPanelList && typeof REGIONS !== 'undefined') {
    regionPanelList.innerHTML = REGIONS.map(r => `
      <a href="#catalogue" data-filter-region="${escapeHtml(r.name)}" class="region-panel-link">
        <span class="region-panel-name">${escapeHtml(r.name)} <small style="color:var(--c-gold);font-weight:600">(${escapeHtml(r.artisanCount || '')})</small></span>
        <span class="region-panel-desc">${escapeHtml(r.descriptor)}</span>
      </a>`
    ).join('');
  }

  const items = [
    { triggerId: 'shop-trigger',   menuId: 'mega-menu' },
    { triggerId: 'region-trigger', menuId: 'region-mega' },
  ];

  items.forEach(({ triggerId, menuId }) => {
    const trigger = $(`#${triggerId}`);
    const menu    = $(`#${menuId}`);
    const parent  = trigger?.closest('.has-mega');
    if (!trigger || !menu) return;

    let openTimer, closeTimer;
    function open() {
      clearTimeout(closeTimer);
      openTimer = setTimeout(() => {
        menu.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }, 120);
    }
    function close() {
      clearTimeout(openTimer);
      closeTimer = setTimeout(() => {
        menu.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }, 100);
    }

    parent?.addEventListener('mouseenter', open);
    parent?.addEventListener('mouseleave', close);
    trigger.addEventListener('click', () => {
      const isOpen = menu.classList.contains('is-open');
      isOpen ? close() : open();
    });
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Escape') { close(); trigger.focus(); }
    });
    document.addEventListener('click', e => {
      if (!parent?.contains(e.target)) close();
    });
    menu.addEventListener('click', e => {
      if (e.target.closest('a') || e.target.closest('[data-open-modal]')) close();
    });
  });
}

function initTabBar() {
  const tabBar = $('#mobile-tab-bar');
  if (!tabBar) return;

  let lastScrollY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    tabBar.classList.toggle('hide-bar', y > lastScrollY && y > 100);
    lastScrollY = y;
  }, { passive: true });

  $('#search-tab-btn')?.addEventListener('click', () => window.openSearch?.());
  $('#wishlist-tab-btn')?.addEventListener('click', () => window.openWishlist?.());
  $('#cart-tab-btn')?.addEventListener('click', () => window.openCart?.());
}

/* ══════════════════════════════════════════════════════════════
   SEARCH OVERLAY
══════════════════════════════════════════════════════════════ */
function initSearch() {
  const overlay    = $('#search-overlay');
  const backdrop   = $('#search-backdrop');
  const openBtn    = $('#search-btn');
  const closeBtn   = $('#search-close');
  const input      = $('#search-input');
  const clearBtn   = $('#search-clear');
  const results    = $('#search-results');
  const popular    = $('#search-popular');
  const chips      = $('#search-popular-chips');
  const recentWrap = $('#search-recent-wrap');
  const recentC    = $('#search-recent-chips');
  if (!overlay) return;

  let releaseTrapped;

  function openSearch() {
    overlay.classList.add('is-open');
    backdrop?.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
    lockScroll();
    releaseTrapped = trapFocus(overlay);
    input?.focus();
    renderRecentSearches();
  }
  function closeSearch() {
    overlay.classList.remove('is-open');
    backdrop?.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
    unlockScroll();
    releaseTrapped?.();
    openBtn?.focus();
  }

  window.openSearch = openSearch;

  openBtn?.addEventListener('click', openSearch);
  closeBtn?.addEventListener('click', closeSearch);
  backdrop?.addEventListener('click', closeSearch);
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !overlay.classList.contains('is-open') &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeSearch();
  });

  const doSearch = debounce(query => {
    if (!query.trim()) {
      results.hidden = true;
      popular.hidden = false;
      return;
    }
    popular.hidden = true;
    results.hidden = false;
    const q = query.trim().toLowerCase();
    const matches = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []).filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.artisanName || '').toLowerCase().includes(q) ||
      (p.materials || '').toLowerCase().includes(q)
    );

    if (!matches.length) {
      results.innerHTML = `<div class="search-no-results"><i class="ph ph-magnifying-glass-minus"></i><p>No heritage pieces found for "<strong>${escapeHtml(query)}</strong>"</p></div>`;
      return;
    }

    results.innerHTML = `
      <p class="search-label">${matches.length} heritage piece${matches.length !== 1 ? 's' : ''} found</p>
      <div class="search-result-grid">
        ${matches.slice(0, 8).map(p => {
          const fallback = getFallbackImg(p);
          return `
          <div class="search-result-card" tabindex="0" role="button" data-product-id="${escapeHtml(p.id)}" aria-label="View ${escapeHtml(p.name)}">
            <div class="search-result-img">
              <img src="${escapeHtml(p.images[0])}" data-fallback="${escapeHtml(fallback)}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async" width="180" height="135"
                onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback;}">
            </div>
            <div class="search-result-body">
              <p class="search-result-name">${highlight(p.name, query)}</p>
              <p style="font-size:.7rem;opacity:.65">${escapeHtml(p.region)} · ★ ${p.rating || '4.9'}</p>
              <p class="search-result-price">${formatPrice(p.price)}</p>
            </div>
          </div>`;
        }).join('')}
      </div>`;

    results.querySelectorAll('.search-result-card').forEach(card => {
      const activate = () => {
        const prod = PRODUCTS.find(p => p.id === card.dataset.productId);
        if (prod) { closeSearch(); openQuickView(prod); }
      };
      card.addEventListener('click', activate);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') activate(); });
    });
  }, 180);

  input?.addEventListener('input', () => {
    const q = input.value;
    if (clearBtn) clearBtn.hidden = !q;
    doSearch(q);
  });
  clearBtn?.addEventListener('click', () => {
    input.value = '';
    clearBtn.hidden = true;
    input.focus();
    doSearch('');
  });

  chips?.addEventListener('click', e => {
    const chip = e.target.closest('.search-chip');
    if (!chip) return;
    input.value = chip.dataset.query;
    if (clearBtn) clearBtn.hidden = false;
    doSearch(chip.dataset.query);
    addRecentSearch(chip.dataset.query);
  });

  function addRecentSearch(q) {
    STATE.recentSearches = [q, ...STATE.recentSearches.filter(s => s !== q)].slice(0, 5);
    Storage.set(RECENT_SEARCHES_KEY, STATE.recentSearches);
    renderRecentSearches();
  }
  function renderRecentSearches() {
    if (!recentC || !recentWrap) return;
    const recents = Storage.get(RECENT_SEARCHES_KEY, []);
    STATE.recentSearches = recents;
    if (!recents.length) { recentWrap.hidden = true; return; }
    recentWrap.hidden = false;
    recentC.innerHTML = recents.map(s =>
      `<button class="search-chip" data-query="${escapeHtml(s)}">${escapeHtml(s)}</button>`
    ).join('');
    recentC.querySelectorAll('.search-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        input.value = chip.dataset.query;
        if (clearBtn) clearBtn.hidden = false;
        doSearch(chip.dataset.query);
      });
    });
  }

  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) addRecentSearch(input.value.trim());
  });
}

/* ══════════════════════════════════════════════════════════════
   CURRENCY SELECTOR
══════════════════════════════════════════════════════════════ */
function initCurrency() {
  const wrapper  = $('.currency-wrapper');
  const btn      = $('#currency-btn');
  const dropdown = $('#currency-dropdown');
  const label    = $('#currency-label');
  if (!wrapper) return;

  STATE.currency = Storage.get(CURRENCY_KEY, 'PKR');
  if (label) label.textContent = STATE.currency;

  btn?.addEventListener('click', () => {
    const open = wrapper.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove('is-open');
      btn?.setAttribute('aria-expanded', 'false');
    }
  });
  dropdown?.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      STATE.currency = li.dataset.currency;
      if (label) label.textContent = STATE.currency;
      dropdown.querySelectorAll('li').forEach(item => item.setAttribute('aria-selected', String(item === li)));
      Storage.set(CURRENCY_KEY, STATE.currency);
      wrapper.classList.remove('is-open');
      btn?.setAttribute('aria-expanded', 'false');
      window.renderCatalogue?.();
      renderLookbook();
      updateCartUI();
      $$('[data-pkr-price]').forEach(el => {
        const pkr = parseInt(el.dataset.pkrPrice, 10);
        if (pkr) el.firstChild.textContent = formatPrice(pkr) + ' ';
      });
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   REVEAL ANIMATIONS & SCROLL PROGRESS
══════════════════════════════════════════════════════════════ */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.hasAttribute('data-reveal-stagger')) {
          [...entry.target.children].slice(0, 8).forEach((child, index) => {
            child.style.setProperty('--reveal-index', index);
          });
        }
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  $$('[data-reveal], [data-reveal-stagger]').forEach(el => observer.observe(el));
}

function initScrollProgress() {
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);

  let frame = 0;
  const update = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    });
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

function initHero() {
  const content = $('#hero-content');
  if (!content) return;
  setTimeout(() => content.classList.add('hero-animated'), 100);
}

function initPremiumMotion() {
  const hero = $('#hero');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let frame = 0;
  hero.addEventListener('pointermove', event => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 5;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      hero.style.setProperty('--hero-x', x.toFixed(2));
      hero.style.setProperty('--hero-y', y.toFixed(2));
    });
  });

  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--hero-x', '0');
    hero.style.setProperty('--hero-y', '0');
  });
}

/* ══════════════════════════════════════════════════════════════
   CATALOGUE — Rendering, Multi-Facet Filtering, Swatches & Compare
══════════════════════════════════════════════════════════════ */
function initCatalogue() {
  if (typeof PRODUCTS === 'undefined') return;

  STATE.gridCols = Storage.get('regongches-grid-cols', 3);

  const grid        = $('#product-grid');
  const skeleton    = $('#skeleton-grid');
  const empty       = $('#catalogue-empty');
  const countEl     = $('#result-count');
  const appliedEl   = $('#applied-filters');
  const catChips    = $$('[data-filter-category]', $('#category-filter-chips'));
  const searchInput = $('#catalogue-search-input');
  const regionSel   = $('#region-filter');
  const priceSel    = $('#price-filter');
  const statusSel   = $('#status-filter');
  const sortSel     = $('#sort-select');
  const densityBtns = $$('.density-btn');
  const clearAllBtn = $('#clear-all-filters');
  const viewAllBtn  = $('#view-all-btn');
  if (!grid) return;

  setTimeout(() => {
    if (skeleton) skeleton.style.display = 'none';
    renderCatalogue();
  }, 280);

  catChips.forEach(chip => {
    chip.addEventListener('click', () => {
      catChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      STATE.activeFilters.category = chip.dataset.filterCategory || '';
      STATE.activeFilters.badge = '';
      renderCatalogue();
    });
  });

  searchInput?.addEventListener('input', debounce(() => {
    STATE.activeFilters.search = searchInput.value.trim();
    renderCatalogue();
  }, 160));

  regionSel?.addEventListener('change', () => { STATE.activeFilters.region     = regionSel.value; renderCatalogue(); });
  priceSel?.addEventListener('change',  () => { STATE.activeFilters.priceRange = priceSel.value;  renderCatalogue(); });
  statusSel?.addEventListener('change', () => { STATE.activeFilters.status     = statusSel.value; renderCatalogue(); });
  sortSel?.addEventListener('change',   () => { STATE.activeFilters.sort       = sortSel.value;   renderCatalogue(); });

  densityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      densityBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      const cols = parseInt(btn.dataset.cols, 10);
      STATE.gridCols = cols;
      Storage.set('regongches-grid-cols', cols);
      grid.className = `product-grid product-grid--${cols}`;
    });
  });

  clearAllBtn?.addEventListener('click', clearAllFilters);
  viewAllBtn?.addEventListener('click', () => {
    clearAllFilters();
    $('#catalogue')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Global delegation for category / region / badge filter links
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-filter-category],[data-filter-region],[data-filter-badge]');
    if (!link || !link.getAttribute('href')?.includes('#catalogue')) return;
    e.preventDefault();

    if (link.dataset.filterCategory !== undefined) STATE.activeFilters.category = link.dataset.filterCategory;
    if (link.dataset.filterRegion   !== undefined) STATE.activeFilters.region   = link.dataset.filterRegion;
    if (link.dataset.filterBadge    !== undefined) STATE.activeFilters.badge    = link.dataset.filterBadge;

    catChips.forEach(c => c.classList.toggle('active', c.dataset.filterCategory === STATE.activeFilters.category));
    if (regionSel && link.dataset.filterRegion !== undefined) regionSel.value = STATE.activeFilters.region;

    renderCatalogue();
    $('#catalogue')?.scrollIntoView({ behavior: 'smooth' });
  });

  function clearAllFilters() {
    STATE.activeFilters = { category: '', region: '', priceRange: '', status: '', sort: 'featured', badge: '', search: '' };
    catChips.forEach(c => c.classList.toggle('active', c.dataset.filterCategory === ''));
    if (searchInput) searchInput.value = '';
    if (regionSel)   regionSel.value   = '';
    if (priceSel)    priceSel.value    = '';
    if (statusSel)   statusSel.value   = '';
    if (sortSel)     sortSel.value     = 'featured';
    renderCatalogue();
  }

  window.renderCatalogue = renderCatalogue;
  function renderCatalogue() {
    if (!grid) return;
    let products = [...PRODUCTS];

    const { category, region, priceRange, status, sort, badge, search } = STATE.activeFilters;
    if (category) products = products.filter(p => p.category === category);
    if (region)   products = products.filter(p => p.region   === region);
    if (status)   products = products.filter(p => p.status   === status);
    if (badge === 'new')        products = products.filter(p => p.isNew);
    if (badge === 'bestseller') products = products.filter(p => p.isBestseller);

    if (priceRange === 'under-2500') products = products.filter(p => p.price < 2500);
    if (priceRange === '2500-6500')  products = products.filter(p => p.price >= 2500 && p.price <= 6500);
    if (priceRange === 'over-6500')  products = products.filter(p => p.price > 6500);

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.materials || '').toLowerCase().includes(q) ||
        (p.artisanName || '').toLowerCase().includes(q)
      );
    }

    if (sort === 'newest')      products.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    if (sort === 'rating-desc') products.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8) || (b.reviewCount || 0) - (a.reviewCount || 0));
    if (sort === 'price-asc')   products.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc')  products.sort((a, b) => b.price - a.price);
    if (sort === 'featured')    products.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller));

    if (countEl) {
      countEl.textContent = `Showing ${products.length} of ${PRODUCTS.length} verified heritage piece${products.length !== 1 ? 's' : ''}`;
    }

    renderAppliedFilters();

    if (!products.length) {
      grid.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    grid.className = `product-grid product-grid--${STATE.gridCols}`;
    grid.innerHTML = products.map(p => renderProductCard(p)).join('');
    bindCardEvents(grid);
  }

  function renderAppliedFilters() {
    if (!appliedEl) return;
    const { category, region, priceRange, status, badge, search } = STATE.activeFilters;
    const chips = [];
    if (category)   chips.push({ label: `Category: ${category}`,   key: 'category' });
    if (region)     chips.push({ label: `Region: ${region}`,       key: 'region' });
    if (priceRange) chips.push({ label: `Price: ${priceRange}`,    key: 'priceRange' });
    if (status)     chips.push({ label: `Status: ${status}`,       key: 'status' });
    if (badge)      chips.push({ label: `Filter: ${badge}`,        key: 'badge' });
    if (search)     chips.push({ label: `Keyword: "${search}"`,    key: 'search' });

    if (!chips.length) { appliedEl.hidden = true; return; }
    appliedEl.hidden = false;
    appliedEl.innerHTML = chips.map(chip => `
      <div class="applied-chip">
        ${escapeHtml(chip.label)}
        <button class="applied-chip-remove" data-filter-key="${chip.key}" aria-label="Remove filter ${escapeHtml(chip.label)}">
          <i class="ph ph-x" aria-hidden="true"></i>
        </button>
      </div>
    `).join('') + `<button class="clear-all-btn" type="button">Reset all</button>`;

    appliedEl.querySelectorAll('.applied-chip-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.filterKey;
        STATE.activeFilters[key] = '';
        if (key === 'category')   catChips.forEach(c => c.classList.toggle('active', c.dataset.filterCategory === ''));
        if (key === 'region'     && regionSel)   regionSel.value   = '';
        if (key === 'priceRange' && priceSel)    priceSel.value    = '';
        if (key === 'status'     && statusSel)   statusSel.value   = '';
        if (key === 'search'     && searchInput) searchInput.value = '';
        renderCatalogue();
      });
    });
    appliedEl.querySelector('.clear-all-btn')?.addEventListener('click', clearAllFilters);
  }
}

/* ── Product card HTML ── */
function renderProductCard(p) {
  const wished   = (STATE.wishlist || []).some(w => w.id === p.id);
  const compared = (STATE.compare  || []).includes(p.id);
  const statusClass = {
    'Available':     'card-status--available',
    'Made-to-Order': 'card-status--made-to-order',
    'Low Stock':     'card-status--low-stock',
  }[p.status] || '';

  const imgSrc   = p.images?.[0] || getFallbackImg(p);
  const imgHov   = p.images?.[1] || getFallbackImg(p);
  const fallback = getFallbackImg(p);
  const activeColor = STATE.cardColorMap[p.id] || p.colors?.[0]?.label || '';

  const swatchesHtml = (p.colors && p.colors.length)
    ? `<div class="card-swatches-row" role="group" aria-label="Available colour palettes">
        ${p.colors.map(c => `
          <button type="button" class="card-mini-swatch ${c.label === activeColor ? 'is-active' : ''}"
            style="background:${escapeHtml(c.hex)}"
            title="${escapeHtml(c.label)}"
            aria-label="Select colour ${escapeHtml(c.label)}"
            data-swatch-product="${escapeHtml(p.id)}"
            data-swatch-color="${escapeHtml(c.label)}"></button>
        `).join('')}
        <span class="card-swatch-label">${escapeHtml(activeColor)}</span>
       </div>`
    : '';

  return `
    <div class="product-card" role="listitem" data-product-id="${escapeHtml(p.id)}">
      <div class="card-img-wrap">
        <img class="card-img" src="${escapeHtml(imgSrc)}" data-fallback="${escapeHtml(fallback)}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async" width="400" height="500"
             onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback;}">
        <img class="card-img-hover" src="${escapeHtml(imgHov)}" alt="" aria-hidden="true" loading="lazy" decoding="async" width="400" height="500"
             onerror="this.style.display='none'">
        <div class="card-badges">
          <span class="badge badge--region">${escapeHtml(p.region)}</span>
          ${p.handmade ? `<span class="badge badge--handmade">${escapeHtml(p.handmadeLabel)}</span>` : ''}
          ${p.isNew        ? `<span class="badge badge--new">New</span>` : ''}
          ${p.isBestseller ? `<span class="badge badge--bestseller">Bestseller</span>` : ''}
        </div>
        <button type="button" class="card-wishlist-btn ${wished ? 'is-wishlisted' : ''}"
          aria-label="${wished ? 'Remove from wishlist' : 'Add to wishlist'}"
          title="Save to Wishlist"
          data-wishlist-id="${escapeHtml(p.id)}">
          <i class="ph${wished ? '-fill' : ''} ph-heart" aria-hidden="true"></i>
        </button>
        <button type="button" class="card-compare-btn ${compared ? 'is-compared' : ''}"
          aria-label="Compare ${escapeHtml(p.name)}"
          title="Compare side-by-side"
          data-compare-id="${escapeHtml(p.id)}">
          <i class="ph ph-scales" aria-hidden="true"></i>
        </button>
        <button type="button" class="card-quick-add" data-quickadd-id="${escapeHtml(p.id)}" aria-label="Quick add ${escapeHtml(p.name)} to cart">
          <i class="ph ph-shopping-bag" aria-hidden="true"></i> Quick Add
        </button>
      </div>
      <div class="card-body">
        <div class="card-top-meta">
          <p class="card-region-line">${escapeHtml(p.region)} · ${p.handmade ? escapeHtml(p.handmadeLabel) : 'Textile'}</p>
          <span class="card-rating-inline" aria-label="Rated ${p.rating || 4.9} out of 5">
            <i class="ph-fill ph-star" aria-hidden="true"></i> ${ (p.rating || 4.9).toFixed(1) } <span>(${p.reviewCount || 18})</span>
          </span>
        </div>
        <h3 class="card-name">
          <button type="button" class="qv-trigger" data-product-id="${escapeHtml(p.id)}" style="background:none;border:none;cursor:pointer;text-align:left;font:inherit;font-family:var(--f-heading);font-size:inherit;line-height:inherit;padding:0;width:100%">
            ${escapeHtml(p.name)}
          </button>
        </h3>
        ${swatchesHtml}
        <div class="card-price-row">
          <span class="card-price">${formatPrice(p.price)}</span>
          ${p.compareAtPrice ? `<span class="card-compare">${formatPrice(p.compareAtPrice)}</span>` : ''}
          <span class="card-status ${statusClass}" aria-label="Availability: ${escapeHtml(p.status)}">${escapeHtml(p.status)}</span>
        </div>
        <div class="card-meta-bottom">
          <p class="card-verified">
            <i class="ph ph-seal-check" aria-hidden="true"></i> Verified origin
          </p>
          <span class="card-sku-tag">${escapeHtml(p.sku || '')}</span>
        </div>
      </div>
    </div>`;
}

function bindCardEvents(container) {
  if (!container) return;

  // Clicking card image or title opens Quick View
  container.querySelectorAll('.product-card').forEach(card => {
    const productId = card.dataset.productId;
    card.addEventListener('click', e => {
      if (e.target.closest('button') && !e.target.closest('.qv-trigger')) return;
      const prod = PRODUCTS.find(p => p.id === productId);
      if (prod) openQuickView(prod);
    });
  });

  // Mini colour swatches on card
  container.querySelectorAll('[data-swatch-product]').forEach(sw => {
    sw.addEventListener('click', e => {
      e.stopPropagation();
      const pid   = sw.dataset.swatchProduct;
      const color = sw.dataset.swatchColor;
      STATE.cardColorMap[pid] = color;
      const row = sw.closest('.card-swatches-row');
      row?.querySelectorAll('.card-mini-swatch').forEach(b => b.classList.toggle('is-active', b === sw));
      const lbl = row?.querySelector('.card-swatch-label');
      if (lbl) lbl.textContent = color;
    });
  });

  // Quick add
  container.querySelectorAll('[data-quickadd-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const prod = PRODUCTS.find(p => p.id === btn.dataset.quickaddId);
      if (!prod) return;
      const chosenColor = STATE.cardColorMap[prod.id] || prod.colors?.[0]?.label || '';
      Cart.add(prod, 1, prod.sizes?.[0] || 'One Size', chosenColor);
    });
  });

  // Wishlist
  container.querySelectorAll('[data-wishlist-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      Wishlist.toggle(btn.dataset.wishlistId, btn);
    });
  });

  // Compare
  container.querySelectorAll('[data-compare-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      Compare.toggle(btn.dataset.compareId);
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   INTERACTIVE LOOKBOOK ("SHOP THE MOUNTAIN LOOKBOOK")
══════════════════════════════════════════════════════════════ */
function initLookbook() {
  if (typeof LOOKBOOK_ENSEMBLES === 'undefined') return;
  renderLookbook();
}

function renderLookbook() {
  const tabsEl  = $('#lookbook-tabs');
  const stageEl = $('#lookbook-stage');
  if (!tabsEl || !stageEl || typeof LOOKBOOK_ENSEMBLES === 'undefined') return;

  const ensemble = LOOKBOOK_ENSEMBLES[STATE.activeLookbookIdx] || LOOKBOOK_ENSEMBLES[0];

  tabsEl.innerHTML = LOOKBOOK_ENSEMBLES.map((ens, idx) => `
    <button type="button" class="lookbook-tab-btn ${idx === STATE.activeLookbookIdx ? 'is-active' : ''}"
      role="tab" aria-selected="${idx === STATE.activeLookbookIdx}" data-lookbook-idx="${idx}">
      ${escapeHtml(ens.title)} (${escapeHtml(ens.region)})
    </button>
  `).join('');

  tabsEl.querySelectorAll('.lookbook-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      STATE.activeLookbookIdx = parseInt(btn.dataset.lookbookIdx, 10);
      STATE.activeHotspotIdx  = 0;
      renderLookbook();
    });
  });

  const hotspotPinsHtml = ensemble.hotspots.map((hs, idx) => `
    <button type="button" class="lookbook-hotspot ${idx === STATE.activeHotspotIdx ? 'is-active' : ''}"
      style="left:${hs.x}%; top:${hs.y}%;"
      data-hotspot-idx="${idx}"
      aria-label="Inspect ${escapeHtml(hs.label)}">
      ${idx + 1}
    </button>
  `).join('');

  const piecesHtml = ensemble.hotspots.map((hs, idx) => {
    const prod = PRODUCTS.find(p => p.id === hs.productId);
    if (!prod) return '';
    const fallback = getFallbackImg(prod);
    return `
      <div class="lookbook-piece-item ${idx === STATE.activeHotspotIdx ? 'is-highlighted' : ''}" data-piece-idx="${idx}" data-product-id="${escapeHtml(prod.id)}">
        <div class="lookbook-piece-thumb">
          <img src="${escapeHtml(prod.images[0])}" data-fallback="${escapeHtml(fallback)}" alt="${escapeHtml(prod.name)}"
               onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback;}">
        </div>
        <div>
          <span style="font-size:.68rem;font-weight:700;color:var(--c-gold);text-transform:uppercase">Pin 0${idx + 1} · ${escapeHtml(prod.region)}</span>
          <h4 style="font-size:var(--fs-base);margin:2px 0">${escapeHtml(prod.name)}</h4>
          <p style="font-size:var(--fs-xs);opacity:.7">${escapeHtml(hs.note)}</p>
          <strong style="font-size:var(--fs-sm);color:var(--c-maroon)">${formatPrice(prod.price)}</strong>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <button type="button" class="btn btn-primary btn-sm" data-lb-add="${escapeHtml(prod.id)}">Add</button>
          <button type="button" class="btn btn-secondary btn-sm" data-lb-qv="${escapeHtml(prod.id)}">View</button>
        </div>
      </div>
    `;
  }).join('');

  stageEl.innerHTML = `
    <div class="lookbook-canvas" aria-label="${escapeHtml(ensemble.title)} interactive figure">
      <svg viewBox="0 0 400 520" class="lookbook-canvas-art" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="360" height="480" rx="16" fill="rgba(255,255,255,0.04)" stroke="#C59A3D" stroke-width="1" opacity="0.5"/>
        <!-- Editorial Silhouette Figure -->
        <circle cx="200" cy="105" r="44" fill="#D8C4A8" opacity="0.25" stroke="#C59A3D" stroke-width="1.5"/>
        <!-- Pakol / Cap Crown -->
        <path d="M148,96 C148,58 252,58 252,96 Z" fill="#C8B89A" stroke="#C59A3D" stroke-width="2"/>
        <rect x="142" y="90" width="116" height="22" rx="11" fill="#D8C4A8" stroke="#C59A3D" stroke-width="2"/>
        <!-- Draped Shawl & Waistcoat Torso -->
        <path d="M115,165 L285,165 L305,425 L95,425 Z" fill="#2D5A3D" opacity="0.82" stroke="#C59A3D" stroke-width="2"/>
        <path d="M98,175 L195,165 L165,395 L88,370 Z" fill="#F7F1E7" opacity="0.9" stroke="#C59A3D" stroke-width="2"/>
        <!-- Embroidered Border on Shawl -->
        <rect x="92" y="340" width="76" height="18" fill="#7A263A"/>
        <!-- Woven Belt Sash -->
        <rect x="122" y="310" width="156" height="18" rx="4" fill="#7A263A" stroke="#C59A3D" stroke-width="1.5"/>
        <text x="200" y="472" text-anchor="middle" fill="#C59A3D" font-family="Georgia, serif" font-size="14" font-style="italic">${escapeHtml(ensemble.title)}</text>
      </svg>
      ${hotspotPinsHtml}
    </div>
    <div class="lookbook-details">
      <div>
        <span class="eyebrow">${escapeHtml(ensemble.eyebrow)}</span>
        <h3 style="font-size:var(--fs-2xl);margin-bottom:8px">${escapeHtml(ensemble.title)}</h3>
        <p style="font-size:var(--fs-sm);opacity:.78;line-height:1.65">${escapeHtml(ensemble.subtitle)}</p>
        <div class="lookbook-piece-list">
          ${piecesHtml}
        </div>
      </div>
      <div class="lookbook-bundle-footer">
        <div>
          <span style="font-size:var(--fs-xs);text-transform:uppercase;letter-spacing:.08em;opacity:.65;display:block">Complete 4-Piece Ensemble</span>
          <strong style="font-size:var(--fs-xl);color:var(--c-maroon)">${formatPrice(ensemble.totalPrice)}</strong>
          <span style="font-size:var(--fs-xs);color:var(--c-status-available);font-weight:700;display:block">Use code HUNZA15 for 15% Bundle Discount</span>
        </div>
        <button type="button" class="btn btn-gold" id="add-entire-look-btn">
          <i class="ph ph-shopping-bag" aria-hidden="true"></i> Add All 4 Pieces to Bag
        </button>
      </div>
    </div>
  `;

  stageEl.querySelectorAll('.lookbook-hotspot').forEach(pin => {
    pin.addEventListener('click', () => {
      STATE.activeHotspotIdx = parseInt(pin.dataset.hotspotIdx, 10);
      renderLookbook();
    });
  });

  stageEl.querySelectorAll('[data-lb-add]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const prod = PRODUCTS.find(p => p.id === btn.dataset.lbAdd);
      if (prod) Cart.add(prod, 1, prod.sizes?.[0] || 'One Size', prod.colors?.[0]?.label || '');
    });
  });

  stageEl.querySelectorAll('[data-lb-qv]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const prod = PRODUCTS.find(p => p.id === btn.dataset.lbQv);
      if (prod) openQuickView(prod);
    });
  });

  $('#add-entire-look-btn')?.addEventListener('click', () => {
    ensemble.hotspots.forEach(hs => {
      const prod = PRODUCTS.find(p => p.id === hs.productId);
      if (prod) Cart.add(prod, 1, prod.sizes?.[0] || 'One Size', prod.colors?.[0]?.label || '', true);
    });
    applyPromoCode('HUNZA15', true);
    openCart();
    Toast.show(`Added all 4 pieces from "${ensemble.title}" with 15% bundle discount!`, 'cart', 4500);
  });
}

/* ══════════════════════════════════════════════════════════════
   PRODUCT COMPARISON ENGINE (UP TO 3 ITEMS)
══════════════════════════════════════════════════════════════ */
const Compare = (() => {
  function load() { STATE.compare = Storage.get(COMPARE_KEY, []); }
  function save() { Storage.set(COMPARE_KEY, STATE.compare); }

  function toggle(productId) {
    const idx = STATE.compare.indexOf(productId);
    if (idx !== -1) {
      STATE.compare.splice(idx, 1);
      Toast.show('Removed from comparison tray', 'info', 2200);
    } else {
      if (STATE.compare.length >= 3) {
        Toast.show('You can compare up to 3 pieces at a time.', 'error', 3000);
        return;
      }
      STATE.compare.push(productId);
      Toast.show('Added to comparison tray', 'success', 2200);
    }
    save();
    updateCompareUI();
  }

  function clear() {
    STATE.compare = [];
    save();
    updateCompareUI();
  }

  return { load, save, toggle, clear };
})();

function updateCompareUI() {
  const bar        = $('#compare-float-bar');
  const countEl    = $('#compare-bar-count');
  const inlineBtn  = $('#open-compare-modal-btn');
  const inlineCnt  = $('#compare-inline-count');
  const slotsEl    = $('#compare-float-slots');

  const cnt = STATE.compare.length;
  if (countEl)   countEl.textContent   = cnt;
  if (inlineCnt) inlineCnt.textContent = cnt;
  if (bar)       bar.hidden            = cnt === 0;
  if (inlineBtn) inlineBtn.hidden      = cnt === 0;

  $$('[data-compare-id]').forEach(btn => {
    btn.classList.toggle('is-compared', STATE.compare.includes(btn.dataset.compareId));
  });

  if (slotsEl) {
    slotsEl.innerHTML = STATE.compare.map(id => {
      const p = PRODUCTS.find(x => x.id === id);
      if (!p) return '';
      return `
        <span class="compare-slot-pill">
          ${escapeHtml(p.name)}
          <button type="button" data-remove-compare="${escapeHtml(p.id)}" aria-label="Remove ${escapeHtml(p.name)}"><i class="ph ph-x"></i></button>
        </span>
      `;
    }).join('');
    slotsEl.querySelectorAll('[data-remove-compare]').forEach(b => {
      b.addEventListener('click', () => Compare.toggle(b.dataset.removeCompare));
    });
  }
}

function openCompareModal() {
  const overlay = $('#compare-modal-overlay');
  const wrap    = $('#compare-table-wrap');
  if (!overlay || !wrap) return;

  const items = STATE.compare.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
  if (!items.length) {
    Toast.show('Select at least 1 product to compare.', 'info');
    return;
  }

  wrap.innerHTML = `
    <table class="compare-table">
      <thead>
        <tr>
          <th>Attribute</th>
          ${items.map(p => `
            <td>
              <img src="${escapeHtml(p.images[0])}" data-fallback="${escapeHtml(getFallbackImg(p))}" alt="${escapeHtml(p.name)}"
                   style="width:90px;height:110px;object-fit:cover;border-radius:6px;margin-bottom:8px"
                   onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback;}">
              <strong style="display:block;font-family:var(--f-heading);font-size:1.05rem">${escapeHtml(p.name)}</strong>
              <span style="color:var(--c-maroon);font-weight:700">${formatPrice(p.price)}</span>
            </td>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        <tr><th>Verified Origin</th>${items.map(p => `<td><strong>${escapeHtml(p.region)}</strong><br><small>${escapeHtml(p.originVillage || '')}</small></td>`).join('')}</tr>
        <tr><th>Rating</th>${items.map(p => `<td>★ ${(p.rating || 4.9).toFixed(1)} (${p.reviewCount || 20} reviews)</td>`).join('')}</tr>
        <tr><th>Craft Technique</th>${items.map(p => `<td>${escapeHtml(p.craftTechnique || p.handmadeLabel)}</td>`).join('')}</tr>
        <tr><th>Artisan Guild</th>${items.map(p => `<td>${escapeHtml(p.artisanName || 'Verified GB Collective')}</td>`).join('')}</tr>
        <tr><th>Materials</th>${items.map(p => `<td>${escapeHtml(p.materials)}</td>`).join('')}</tr>
        <tr><th>Weight &amp; Warmth</th>${items.map(p => `<td>${escapeHtml(p.weight || 'Standard')} · ${escapeHtml(p.warmthLevel || 'All-Season')}</td>`).join('')}</tr>
        <tr><th>Dispatch Lead Time</th>${items.map(p => `<td>${escapeHtml(p.leadTime || p.status)}</td>`).join('')}</tr>
        <tr><th>Action</th>${items.map(p => `
          <td>
            <button type="button" class="btn btn-primary btn-sm" data-cmp-add="${escapeHtml(p.id)}">Add to Bag</button>
          </td>
        `).join('')}</tr>
      </tbody>
    </table>
  `;

  wrap.querySelectorAll('[data-cmp-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prod = PRODUCTS.find(p => p.id === btn.dataset.cmpAdd);
      if (prod) {
        Cart.add(prod, 1, prod.sizes?.[0] || 'One Size', prod.colors?.[0]?.label || '');
        closeCompareModal();
      }
    });
  });

  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  lockScroll();
}

function closeCompareModal() {
  const overlay = $('#compare-modal-overlay');
  overlay?.classList.remove('is-open');
  overlay?.setAttribute('aria-hidden', 'true');
  unlockScroll();
}

function initCompare() {
  Compare.load();
  updateCompareUI();
  $('#compare-open-btn')?.addEventListener('click', openCompareModal);
  $('#open-compare-modal-btn')?.addEventListener('click', openCompareModal);
  $('#compare-clear-btn')?.addEventListener('click', () => Compare.clear());
  $('#compare-modal-close')?.addEventListener('click', closeCompareModal);
  $('#compare-modal-overlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeCompareModal(); });
}

/* ══════════════════════════════════════════════════════════════
   QUICK VIEW MODAL (FIXED LISTENER BUG + ZOOM LENS + BUY NOW)
══════════════════════════════════════════════════════════════ */
let releaseQVTrap;

function openQuickView(product) {
  STATE.quickViewProduct = product;
  STATE.qvQty            = 1;
  STATE.qvSelectedColor  = STATE.cardColorMap[product.id] || product.colors?.[0]?.label || '';
  STATE.qvSelectedSize   = product.sizes?.[0] || 'One Size';

  const overlay = $('#quickview-overlay');
  if (!overlay) return;

  addRecentlyViewed(product);

  // Badges
  const badges = $('#qv-badges');
  if (badges) badges.innerHTML = `
    <span class="badge badge--region">${escapeHtml(product.region)}</span>
    ${product.handmade ? `<span class="badge badge--handmade">${escapeHtml(product.handmadeLabel)}</span>` : ''}
    ${product.isNew ? `<span class="badge badge--new">New</span>` : ''}
    ${product.sku ? `<span class="badge" style="background:var(--c-sand-lt);color:var(--c-charcoal)">${escapeHtml(product.sku)}</span>` : ''}`;

  const nameEl   = $('#qv-product-name'); if (nameEl) nameEl.textContent = product.name;
  const regionEl = $('#qv-region-line');  if (regionEl) regionEl.textContent = `${product.region} District · ${product.originVillage || product.handmadeLabel}`;

  const ratingPill = $('#qv-rating-pill');
  if (ratingPill) {
    ratingPill.innerHTML = `<i class="ph-fill ph-star"></i> ${(product.rating || 4.9).toFixed(1)} (${product.reviewCount || 24} reviews)`;
  }

  const priceRow = $('#qv-price-row');
  if (priceRow) priceRow.innerHTML = `
    <span class="qv-price">${formatPrice(product.price)}</span>
    ${product.compareAtPrice ? `<span class="qv-compare">${formatPrice(product.compareAtPrice)}</span>` : ''}`;

  const statusEl = $('#qv-status');
  if (statusEl) {
    const cls = { 'Available': 'card-status--available', 'Made-to-Order': 'card-status--made-to-order', 'Low Stock': 'card-status--low-stock' }[product.status] || '';
    statusEl.innerHTML = `<span class="card-status ${cls}">${escapeHtml(product.status)} · ${escapeHtml(product.leadTime || 'Tracked Dispatch')}</span>`;
  }

  // Highlights
  const hlEl = $('#qv-highlights');
  if (hlEl) {
    if (product.highlights?.length) {
      hlEl.hidden = false;
      hlEl.innerHTML = product.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('');
    } else {
      hlEl.hidden = true;
    }
  }

  // Provenance Passport
  const provCard = $('#qv-provenance-card');
  if (provCard) {
    provCard.innerHTML = `
      <div class="qv-prov-item"><strong>Origin Valley</strong><span>${escapeHtml(product.originVillage || product.region)}</span></div>
      <div class="qv-prov-item"><strong>Craft Technique</strong><span>${escapeHtml(product.craftTechnique || product.handmadeLabel)}</span></div>
      <div class="qv-prov-item"><strong>Artisan Collective</strong><span>${escapeHtml(product.artisanName || 'Gilgit-Baltistan Guild')}</span></div>
      <div class="qv-prov-item"><strong>Weight &amp; Warmth</strong><span>${escapeHtml(product.weight || 'Pure Highland Wool')}</span></div>
    `;
  }

  // Gallery & 3-angle thumbnails
  const mainImg  = $('#qv-main-img');
  const thumbs   = $('#qv-thumbs');
  const fallback = getFallbackImg(product);
  const gallerySources = [
    product.images?.[0] || fallback,
    product.images?.[1] || fallback,
    product.images?.[2] || fallback
  ];

  if (mainImg) {
    mainImg.style.display = '';
    mainImg.dataset.fallback = fallback;
    mainImg.onerror = function () {
      if (this.dataset.fallback && this.src !== this.dataset.fallback) {
        this.src = this.dataset.fallback;
      }
    };
    mainImg.src = gallerySources[0];
    mainImg.alt = product.name;
  }

  if (thumbs) {
    const thumbLabels = ['Garment View', 'Weave & Motif', 'Origin Box'];
    thumbs.innerHTML = gallerySources.map((src, i) => `
      <button type="button" class="qv-thumb ${i === 0 ? 'active' : ''}" aria-label="${thumbLabels[i] || `View ${i + 1}`}" data-img="${escapeHtml(src)}" title="${thumbLabels[i] || ''}">
        <img src="${escapeHtml(src)}" data-fallback="${escapeHtml(fallback)}" alt="" loading="lazy" decoding="async" width="60" height="60"
          onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback;}">
      </button>`).join('');

    thumbs.querySelectorAll('.qv-thumb').forEach(t => {
      t.addEventListener('click', () => {
        thumbs.querySelectorAll('.qv-thumb').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        if (mainImg) mainImg.src = t.dataset.img;
      });
    });
  }

  // Colors
  const colorWrap     = $('#qv-colors-wrap');
  const colorSwatches = $('#qv-color-swatches');
  const selColorLabel = $('#qv-selected-color');
  if (colorSwatches && product.colors?.length) {
    colorWrap.style.display = '';
    colorSwatches.innerHTML = product.colors.map(c => `
      <button type="button" class="color-swatch ${c.label === STATE.qvSelectedColor ? 'is-selected' : ''}"
        style="background:${escapeHtml(c.hex)}"
        title="${escapeHtml(c.label)}"
        aria-label="${escapeHtml(c.label)}"
        data-color-label="${escapeHtml(c.label)}">
      </button>`).join('');
    if (selColorLabel) selColorLabel.textContent = STATE.qvSelectedColor;
    colorSwatches.querySelectorAll('.color-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        colorSwatches.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('is-selected'));
        sw.classList.add('is-selected');
        STATE.qvSelectedColor = sw.dataset.colorLabel;
        if (selColorLabel) selColorLabel.textContent = STATE.qvSelectedColor;
      });
    });
  } else if (colorWrap) {
    colorWrap.style.display = 'none';
  }

  // Sizes
  const sizeWrap     = $('#qv-sizes-wrap');
  const sizeBtns     = $('#qv-size-buttons');
  const selSizeLabel = $('#qv-selected-size');
  if (sizeBtns && product.sizes?.length) {
    sizeWrap.style.display = '';
    sizeBtns.innerHTML = product.sizes.map(s => `
      <button type="button" class="size-btn ${s === STATE.qvSelectedSize ? 'is-selected' : ''}"
        aria-pressed="${s === STATE.qvSelectedSize}"
        data-size="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('');
    if (selSizeLabel) selSizeLabel.textContent = STATE.qvSelectedSize;
    sizeBtns.querySelectorAll('.size-btn').forEach(b => {
      b.addEventListener('click', () => {
        sizeBtns.querySelectorAll('.size-btn').forEach(x => { x.classList.remove('is-selected'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('is-selected');
        b.setAttribute('aria-pressed', 'true');
        STATE.qvSelectedSize = b.dataset.size;
        if (selSizeLabel) selSizeLabel.textContent = STATE.qvSelectedSize;
      });
    });
  } else if (sizeWrap) {
    sizeWrap.style.display = 'none';
  }

  const qtyVal = $('#qv-qty-val');
  if (qtyVal) qtyVal.textContent = STATE.qvQty;

  // Accordions content
  const matEl   = $('#qv-materials'); if (matEl)   matEl.textContent = product.materials || '';
  const careEl  = $('#qv-care');      if (careEl)  careEl.textContent = product.care || '';
  const storyEl = $('#qv-story');
  if (storyEl) {
    storyEl.innerHTML = `<p>${escapeHtml(product.shortStory || '')}</p>
      ${product.artisanNote ? `<p style="margin-top:8px;color:var(--c-blue);font-weight:600"><i class="ph ph-hands-clapping"></i> ${escapeHtml(product.artisanNote)}</p>` : ''}`;
  }

  const waLink = $('#qv-whatsapp-link');
  if (waLink) {
    const msg = `Hi ReGongches, I'd like to ask about: ${product.name} (${product.sku || product.region}) — ${formatPrice(product.price)}`;
    waLink.href = `https://wa.me/923001234567?text=${encodeURIComponent(msg)}`;
  }

  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  lockScroll();
  releaseQVTrap = trapFocus(overlay);
}

function closeQuickView() {
  const overlay = $('#quickview-overlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  unlockScroll();
  releaseQVTrap?.();
}

function initQuickView() {
  $('#quickview-close')?.addEventListener('click', closeQuickView);
  $('#quickview-overlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeQuickView(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#quickview-overlay')?.classList.contains('is-open')) closeQuickView(); });

  // Bind quantity buttons ONCE (fixes listener-stacking bug!)
  $('#qv-qty-inc')?.addEventListener('click', () => {
    STATE.qvQty = Math.min(STATE.qvQty + 1, 10);
    const el = $('#qv-qty-val');
    if (el) el.textContent = STATE.qvQty;
  });
  $('#qv-qty-dec')?.addEventListener('click', () => {
    STATE.qvQty = Math.max(STATE.qvQty - 1, 1);
    const el = $('#qv-qty-val');
    if (el) el.textContent = STATE.qvQty;
  });

  // Add to Cart button bound ONCE
  $('#qv-add-btn')?.addEventListener('click', () => {
    const p = STATE.quickViewProduct;
    if (!p) return;
    Cart.add(p, STATE.qvQty, STATE.qvSelectedSize, STATE.qvSelectedColor);
    setTimeout(closeQuickView, 320);
  });

  // Instant Buy Now button
  $('#qv-buy-now-btn')?.addEventListener('click', () => {
    const p = STATE.quickViewProduct;
    if (!p) return;
    Cart.add(p, STATE.qvQty, STATE.qvSelectedSize, STATE.qvSelectedColor, true);
    closeQuickView();
    openCheckout();
  });

  // Utility buttons inside Quick View
  $('#qv-compare-btn')?.addEventListener('click', () => {
    if (STATE.quickViewProduct) Compare.toggle(STATE.quickViewProduct.id);
  });
  $('#qv-wishlist-btn')?.addEventListener('click', () => {
    if (STATE.quickViewProduct) Wishlist.toggle(STATE.quickViewProduct.id);
  });
  $('#qv-share-btn')?.addEventListener('click', () => {
    if (!STATE.quickViewProduct) return;
    const url = `${window.location.origin}${window.location.pathname}#catalogue?product=${STATE.quickViewProduct.id}`;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).catch(() => {});
    Toast.show(`Link copied for "${STATE.quickViewProduct.name}"`, 'success', 2500);
  });

  // Interactive Zoom Lens on Main Image
  const zoomWrap = $('#qv-zoom-container');
  const mainImg  = $('#qv-main-img');
  if (zoomWrap && mainImg) {
    zoomWrap.addEventListener('mousemove', e => {
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
}

/* ══════════════════════════════════════════════════════════════
   CART & PROMO CODE ENGINE
══════════════════════════════════════════════════════════════ */
const Cart = (() => {
  function load()  { STATE.cart = Storage.get(CART_KEY, []); }
  function save()  { Storage.set(CART_KEY, STATE.cart); }
  function total() { return STATE.cart.reduce((s, i) => s + i.price * i.qty, 0); }
  function count() { return STATE.cart.reduce((s, i) => s + i.qty, 0); }

  function getDiscountAmount(rawSubtotal = total()) {
    const promo = STATE.activePromo;
    if (!promo || typeof PROMO_CODES === 'undefined' || !PROMO_CODES[promo]) return 0;
    const rule = PROMO_CODES[promo];
    if (rawSubtotal < (rule.minOrder || 0)) return 0;
    if (rule.type === 'percent') return Math.round(rawSubtotal * (rule.value / 100));
    return 0;
  }

  function add(product, qty = 1, size = '', color = '', silentToast = false) {
    const key = `${product.id}__${size}__${color}`;
    const existing = STATE.cart.find(i => i.key === key);
    if (existing) { existing.qty += qty; }
    else {
      STATE.cart.push({
        key,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || getFallbackImg(product),
        fallback: getFallbackImg(product),
        category: product.category,
        size, color, qty
      });
    }
    save();
    updateCartUI();
    if (!silentToast) Toast.show(`"${product.name}" added to your bag`, 'cart');
    const badge = $('#cart-badge');
    badge?.classList.remove('bounce', 'is-popping');
    void badge?.offsetWidth;
    badge?.classList.add('is-popping');
    badge?.addEventListener('animationend', () => badge.classList.remove('is-popping'), { once: true });
  }

  function remove(key) {
    const idx = STATE.cart.findIndex(i => i.key === key);
    if (idx === -1) return;
    const removed = STATE.cart.splice(idx, 1)[0];
    save();
    updateCartUI();
    showUndoBar(removed);
  }

  function updateQty(key, delta) {
    const item = STATE.cart.find(i => i.key === key);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    save();
    updateCartUI();
  }

  function showUndoBar(item) {
    const wrap = $('#cart-items-wrap');
    if (!wrap) return;
    const bar = document.createElement('div');
    bar.className = 'cart-undo-bar';
    bar.innerHTML = `<span>Removed "${escapeHtml(item.name)}"</span>
      <button type="button" class="cart-undo-btn">Undo</button>`;
    wrap.prepend(bar);
    const timer = setTimeout(() => bar.remove(), 5000);
    bar.querySelector('.cart-undo-btn')?.addEventListener('click', () => {
      clearTimeout(timer);
      STATE.cart.unshift(item);
      save();
      bar.remove();
      updateCartUI();
    });
  }

  return { load, save, add, remove, updateQty, total, count, getDiscountAmount };
})();

function applyPromoCode(rawCode, silentIfEmpty = false) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code || typeof PROMO_CODES === 'undefined' || !PROMO_CODES[code]) {
    if (!silentIfEmpty) Toast.show('Invalid promo code. Try HERITAGE10, HUNZA15, or FREESHIP.', 'error');
    return false;
  }
  const rule = PROMO_CODES[code];
  const rawSub = Cart.total();
  if (rawSub > 0 && rawSub < rule.minOrder) {
    Toast.show(`Code ${code} requires a minimum order of ${formatPrice(rule.minOrder)}.`, 'info');
  } else {
    Toast.show(`Promo code ${code} (${rule.label}) applied!`, 'success');
  }
  STATE.activePromo = code;
  const input = $('#cart-promo-input');
  if (input) input.value = code;
  updateCartUI();
  return true;
}

function updateCartUI() {
  const countBadge  = $('#cart-badge');
  const tabBadge    = $('#tab-cart-badge');
  const rawSubEl    = $('#cart-raw-subtotal');
  const discRow     = $('#cart-discount-row');
  const discLabel   = $('#cart-discount-label');
  const discVal     = $('#cart-discount-val');
  const giftRow     = $('#cart-giftwrap-row');
  const giftVal     = $('#cart-giftwrap-val');
  const subtotalEl  = $('#cart-subtotal-val');
  const activePromo = $('#cart-active-promo');
  const wrap        = $('#cart-items-wrap');
  const freeBar     = $('#fdbar-fill');
  const freeLabel   = $('#fdbar-label');

  const cnt      = Cart.count();
  const rawTot   = Cart.total();
  const discount = Cart.getDiscountAmount(rawTot);
  const giftWrap = $('#gift-wrap-toggle')?.checked ? GIFT_WRAP_PRICE : 0;
  const netTot   = Math.max(0, rawTot - discount) + giftWrap;

  if (countBadge) countBadge.textContent = cnt;
  if (tabBadge)   tabBadge.textContent   = cnt;
  if (rawSubEl)   rawSubEl.textContent   = formatPrice(rawTot);
  if (subtotalEl) subtotalEl.textContent = formatPrice(netTot);

  if (discRow && discVal && discLabel) {
    if (discount > 0 && STATE.activePromo) {
      discRow.hidden = false;
      discLabel.textContent = `Promo (${STATE.activePromo})`;
      discVal.textContent   = `−${formatPrice(discount)}`;
    } else if (STATE.activePromo === 'FREESHIP') {
      discRow.hidden = false;
      discLabel.textContent = `Promo (FREESHIP)`;
      discVal.textContent   = `Free Delivery`;
    } else {
      discRow.hidden = true;
    }
  }

  if (giftRow && giftVal) {
    giftRow.hidden = !giftWrap;
    giftVal.textContent = formatPrice(GIFT_WRAP_PRICE);
  }

  if (activePromo) {
    if (STATE.activePromo && PROMO_CODES?.[STATE.activePromo]) {
      activePromo.hidden = false;
      activePromo.innerHTML = `
        <span><i class="ph ph-tag"></i> ${escapeHtml(PROMO_CODES[STATE.activePromo].label)}</span>
        <button type="button" id="remove-promo-btn" aria-label="Remove promo code"><i class="ph ph-x"></i></button>
      `;
      activePromo.querySelector('#remove-promo-btn')?.addEventListener('click', () => {
        STATE.activePromo = null;
        if ($('#cart-promo-input')) $('#cart-promo-input').value = '';
        updateCartUI();
      });
    } else {
      activePromo.hidden = true;
    }
  }

  // Two-tier reward bar (PKR 8,000 Free Delivery -> PKR 15,000 Free Cedar Sachet & Story Booklet)
  const giftTarget = typeof FREE_GIFT_THRESHOLD !== 'undefined' ? FREE_GIFT_THRESHOLD : 15000;
  if (freeBar && freeLabel) {
    if (rawTot < FREE_DELIVERY_THRESHOLD) {
      const pct = Math.min(100, (rawTot / FREE_DELIVERY_THRESHOLD) * 100);
      freeBar.style.width = `${pct}%`;
      freeLabel.textContent = `Add ${formatPrice(FREE_DELIVERY_THRESHOLD - rawTot)} more for complimentary nationwide delivery`;
    } else if (rawTot < giftTarget) {
      const pct = Math.min(100, (rawTot / giftTarget) * 100);
      freeBar.style.width = `${pct}%`;
      freeLabel.textContent = `✓ Free Delivery unlocked! Add ${formatPrice(giftTarget - rawTot)} for a complimentary Cedar Sachet & Story Booklet`;
    } else {
      freeBar.style.width = '100%';
      freeLabel.textContent = '★ Both unlocked: Complimentary Delivery + Free Cedar Sachet & Story Booklet!';
    }
  }

  if (!wrap) return;
  if (!STATE.cart.length) {
    wrap.innerHTML = `<div class="cart-empty-msg">
      <i class="ph ph-shopping-bag" aria-hidden="true"></i>
      <p>Your heritage bag is empty.</p>
      <p style="font-size:.85rem;margin-top:.5rem;opacity:.65">Explore our Gilgit-Baltistan archive or curated lookbook to begin.</p>
    </div>`;
    renderCartUpsell();
    return;
  }

  wrap.innerHTML = STATE.cart.map(item => {
    const prod = PRODUCTS.find(p => p.id === item.id);
    const fb   = item.fallback || getFallbackImg(prod);
    return `
      <div class="cart-item" data-cart-key="${escapeHtml(item.key)}">
        <div class="cart-item-img">
          <img src="${escapeHtml(item.image || fb)}" data-fallback="${escapeHtml(fb)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" width="70" height="88"
               onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback;}">
        </div>
        <div>
          <p class="cart-item-name">${escapeHtml(item.name)}</p>
          <p class="cart-item-variant">${[item.size, item.color].filter(Boolean).join(' · ')}</p>
          <div class="cart-item-controls">
            <button type="button" class="cart-qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
            <span class="cart-qty-val">${item.qty}</span>
            <button type="button" class="cart-qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="cart-remove-btn" data-action="remove" aria-label="Remove ${escapeHtml(item.name)} from cart">Remove</button>
        </div>
        <div>
          <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
        </div>
      </div>`;
  }).join('');

  wrap.querySelectorAll('.cart-item').forEach(el => {
    const key = el.dataset.cartKey;
    el.querySelector('[data-action="inc"]')?.addEventListener('click', () => Cart.updateQty(key, +1));
    el.querySelector('[data-action="dec"]')?.addEventListener('click', () => Cart.updateQty(key, -1));
    el.querySelector('[data-action="remove"]')?.addEventListener('click', () => Cart.remove(key));
  });

  renderCartUpsell();
}

function renderCartUpsell() {
  const grid = $('#cart-upsell-grid');
  const wrap = $('#cart-upsell');
  if (!grid || typeof PRODUCTS === 'undefined') return;
  const inCart = STATE.cart.map(i => i.id);
  const suggestions = PRODUCTS.filter(p => !inCart.includes(p.id)).slice(0, 2);
  if (!suggestions.length) {
    if (wrap) wrap.style.display = 'none';
    return;
  }
  if (wrap) wrap.style.display = '';
  grid.innerHTML = suggestions.map(p => {
    const fb = getFallbackImg(p);
    return `<div class="upsell-card" data-quickadd-id="${escapeHtml(p.id)}" role="button" tabindex="0" aria-label="Add ${escapeHtml(p.name)} to cart">
      <div class="upsell-img">
        <img src="${escapeHtml(p.images?.[0] || fb)}" data-fallback="${escapeHtml(fb)}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async" width="120" height="90"
          onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback;}">
      </div>
      <div class="upsell-body">
        <p class="upsell-name">${escapeHtml(p.name)}</p>
        <p class="upsell-price">${formatPrice(p.price)} · + Add</p>
      </div>
    </div>`;
  }).join('');
  grid.querySelectorAll('.upsell-card').forEach(card => {
    const act = () => {
      const prod = PRODUCTS.find(p => p.id === card.dataset.quickaddId);
      if (prod) Cart.add(prod, 1, prod.sizes?.[0] || '', prod.colors?.[0]?.label || '');
    };
    card.addEventListener('click', act);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') act(); });
  });
}

let cartReleaseTrap;
function openCart() {
  const drawer   = $('#cart-drawer');
  const backdrop = $('#drawer-backdrop');
  if (!drawer) return;
  drawer.classList.add('is-open');
  backdrop?.classList.add('is-visible');
  drawer.setAttribute('aria-hidden', 'false');
  lockScroll();
  cartReleaseTrap = trapFocus(drawer);
  updateCartUI();
}
function closeCart() {
  const drawer   = $('#cart-drawer');
  const backdrop = $('#drawer-backdrop');
  drawer?.classList.remove('is-open');
  backdrop?.classList.remove('is-visible');
  drawer?.setAttribute('aria-hidden', 'true');
  unlockScroll();
  cartReleaseTrap?.();
  $('#cart-btn')?.focus();
}

function initCart() {
  Cart.load();
  updateCartUI();

  $('#cart-btn')?.addEventListener('click', openCart);
  $('#cart-close')?.addEventListener('click', closeCart);
  $('#drawer-backdrop')?.addEventListener('click', () => { closeCart(); closeWishlist(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if ($('#cart-drawer')?.classList.contains('is-open'))     closeCart();
      if ($('#wishlist-drawer')?.classList.contains('is-open')) closeWishlist();
    }
  });

  $('#gift-wrap-toggle')?.addEventListener('change', () => updateCartUI());

  $('#cart-promo-apply')?.addEventListener('click', () => {
    applyPromoCode($('#cart-promo-input')?.value);
  });
  $('#cart-promo-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyPromoCode($('#cart-promo-input')?.value);
    }
  });
  $$('[data-apply-code]').forEach(btn => {
    btn.addEventListener('click', () => applyPromoCode(btn.dataset.applyCode));
  });

  $('#checkout-btn')?.addEventListener('click', () => {
    if (!STATE.cart.length) { Toast.show('Your bag is empty', 'error'); return; }
    closeCart();
    openCheckout();
  });
}

/* ══════════════════════════════════════════════════════════════
   WISHLIST
══════════════════════════════════════════════════════════════ */
const Wishlist = (() => {
  function load() { STATE.wishlist = Storage.get(WISHLIST_KEY, []); }
  function save() { Storage.set(WISHLIST_KEY, STATE.wishlist); }

  function toggle(productId) {
    const idx = STATE.wishlist.findIndex(w => w.id === productId);
    const product = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === productId) : null;
    if (idx !== -1) {
      STATE.wishlist.splice(idx, 1);
      Toast.show('Removed from wishlist', 'info');
    } else if (product) {
      STATE.wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || getFallbackImg(product),
        fallback: getFallbackImg(product)
      });
      Toast.show(`"${product.name}" saved to wishlist`, 'success');
    }
    save();
    updateWishlistBadge();
    $$(`[data-wishlist-id="${productId}"]`).forEach(b => updateWishlistBtn(productId, b));
  }

  function updateWishlistBtn(id, btn) {
    const buttons = btn ? [btn] : $$(`[data-wishlist-id="${id}"]`);
    const wished = STATE.wishlist.some(w => w.id === id);
    buttons.forEach(b => {
      b.classList.toggle('is-wishlisted', wished);
      b.setAttribute('aria-label', wished ? 'Remove from wishlist' : 'Add to wishlist');
      const icon = b.querySelector('i');
      if (icon) icon.className = `ph${wished ? '-fill' : ''} ph-heart`;
    });
  }

  return { load, save, toggle, updateWishlistBtn };
})();

function updateWishlistBadge() {
  const badge = $('#wishlist-count');
  if (!badge) return;
  const cnt = STATE.wishlist.length;
  badge.textContent = cnt;
  badge.hidden = cnt === 0;
}

let wishlistReleaseTrap;
function openWishlist() {
  const drawer   = $('#wishlist-drawer');
  const backdrop = $('#drawer-backdrop');
  if (!drawer) return;
  renderWishlistItems();
  drawer.classList.add('is-open');
  backdrop?.classList.add('is-visible');
  drawer.setAttribute('aria-hidden', 'false');
  lockScroll();
  wishlistReleaseTrap = trapFocus(drawer);
}
function closeWishlist() {
  const drawer   = $('#wishlist-drawer');
  const backdrop = $('#drawer-backdrop');
  drawer?.classList.remove('is-open');
  backdrop?.classList.remove('is-visible');
  drawer?.setAttribute('aria-hidden', 'true');
  unlockScroll();
  wishlistReleaseTrap?.();
  $('#wishlist-btn')?.focus();
}

function renderWishlistItems() {
  const wrap = $('#wishlist-items-wrap');
  if (!wrap) return;
  if (!STATE.wishlist.length) {
    wrap.innerHTML = `<div class="wishlist-empty"><i class="ph ph-heart" aria-hidden="true"></i><p>Your wishlist is empty.</p></div>`;
    return;
  }
  wrap.innerHTML = STATE.wishlist.map(item => {
    const prod = PRODUCTS.find(p => p.id === item.id);
    const fb   = item.fallback || getFallbackImg(prod);
    return `
      <div class="wishlist-item" data-wishlist-key="${escapeHtml(item.id)}">
        <div class="wishlist-item-img">
          <img src="${escapeHtml(item.image || fb)}" data-fallback="${escapeHtml(fb)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" width="64" height="80"
            onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback;}">
        </div>
        <div>
          <p class="wishlist-item-name">${escapeHtml(item.name)}</p>
          <p class="wishlist-item-price">${formatPrice(item.price)}</p>
          <button type="button" class="wishlist-add-cart-btn" data-wishlist-cart="${escapeHtml(item.id)}">Move to Bag</button>
        </div>
        <button type="button" class="wishlist-remove-btn" aria-label="Remove ${escapeHtml(item.name)} from wishlist" data-wishlist-remove="${escapeHtml(item.id)}">
          <i class="ph ph-x" aria-hidden="true"></i>
        </button>
      </div>`;
  }).join('');

  wrap.querySelectorAll('[data-wishlist-remove]').forEach(btn => {
    btn.addEventListener('click', () => { Wishlist.toggle(btn.dataset.wishlistRemove); renderWishlistItems(); });
  });
  wrap.querySelectorAll('[data-wishlist-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prod = PRODUCTS.find(p => p.id === btn.dataset.wishlistCart);
      if (prod) {
        Cart.add(prod, 1, prod.sizes?.[0] || '', prod.colors?.[0]?.label || '');
        closeWishlist();
        openCart();
      }
    });
  });
}

function initWishlist() {
  Wishlist.load();
  updateWishlistBadge();
  $('#wishlist-btn')?.addEventListener('click', openWishlist);
  $('#wishlist-close')?.addEventListener('click', closeWishlist);
}

/* ══════════════════════════════════════════════════════════════
   RECENTLY VIEWED
══════════════════════════════════════════════════════════════ */
function addRecentlyViewed(product) {
  STATE.recentlyViewed = [product, ...STATE.recentlyViewed.filter(p => p.id !== product.id)].slice(0, 4);
  Storage.set(RECENTLY_VIEWED_KEY, STATE.recentlyViewed.map(p => p.id));
  renderRecentlyViewed();
}

function renderRecentlyViewed() {
  const section = $('#recently-viewed-section');
  if (!section || STATE.recentlyViewed.length < 1) return;
  section.hidden = false;
  section.innerHTML = `
    <div class="container">
      <span class="eyebrow">Your Browsing Trail</span>
      <h2 class="section-title" style="text-align:left;font-size:var(--fs-2xl)">Recently Viewed Pieces</h2>
      <div class="recently-viewed-grid product-grid product-grid--4">
        ${STATE.recentlyViewed.map(p => renderProductCard(p)).join('')}
      </div>
    </div>`;
  bindCardEvents(section);
}

/* ══════════════════════════════════════════════════════════════
   CHECKOUT MODAL (WITH CITY SHIPPING ESTIMATOR & PRINT INVOICE)
══════════════════════════════════════════════════════════════ */
let checkoutReleaseTrap;

function openCheckout() {
  const overlay = $('#checkout-overlay');
  if (!overlay) return;
  STATE.checkoutStep = 1;
  goToCheckoutStep(1);
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  lockScroll();
  checkoutReleaseTrap = trapFocus(overlay);
}

function closeCheckout() {
  const overlay = $('#checkout-overlay');
  overlay?.classList.remove('is-open');
  overlay?.setAttribute('aria-hidden', 'true');
  unlockScroll();
  checkoutReleaseTrap?.();
}

function goToCheckoutStep(n) {
  for (let i = 1; i <= 4; i++) {
    const step = $(`#checkout-step-${i}`);
    if (step) step.hidden = i !== n;
  }
  STATE.checkoutStep = n;

  $$('.cp-step').forEach(s => {
    const sNum = parseInt(s.dataset.step, 10);
    s.classList.toggle('active', sNum === n);
    s.classList.toggle('done',   sNum < n);
    s.setAttribute('aria-current', sNum === n ? 'step' : 'false');
  });
  $$('.cp-line').forEach((l, i) => l.classList.toggle('done', i + 1 < n));

  if (n === 3) renderOrderReview();
  setTimeout(() => {
    $(`#checkout-step-${n} input, #checkout-step-${n} select`)?.focus();
  }, 80);
}

function getCityShipping(city) {
  const rateObj = (typeof CITY_SHIPPING_RATES !== 'undefined' && CITY_SHIPPING_RATES[city])
    ? CITY_SHIPPING_RATES[city]
    : { days: '3–5 business days (Tracked Courier)', fee: 250 };
  const rawSub = Cart.total();
  const isFree = rawSub >= FREE_DELIVERY_THRESHOLD || STATE.activePromo === 'FREESHIP';
  return {
    days: rateObj.days,
    fee:  isFree ? 0 : rateObj.fee
  };
}

function validateStep1() {
  const fields = [
    { id: 'co-name',    errId: 'co-name-error',    label: 'Full Name',        rule: v => v.trim().length >= 2 },
    { id: 'co-phone',   errId: 'co-phone-error',   label: 'Phone',            rule: v => /^\d{9,11}$/.test(v.replace(/[\s-]/g,'')) },
    { id: 'co-city',    errId: 'co-city-error',    label: 'Destination City', rule: v => v !== '' },
    { id: 'co-address', errId: 'co-address-error', label: 'Delivery Address', rule: v => v.trim().length >= 8 },
  ];
  let valid = true;
  fields.forEach(f => {
    const el  = $(`#${f.id}`);
    const err = $(`#${f.errId}`);
    if (!el || !err) return;
    const ok = f.rule(el.value);
    el.classList.toggle('is-error', !ok);
    err.textContent = ok ? '' : `Please enter a valid ${f.label}.`;
    if (!ok && valid) { valid = false; el.focus(); }
  });
  if (valid) {
    STATE.checkoutData.name    = $('#co-name')?.value.trim();
    STATE.checkoutData.phone   = $('#co-phone')?.value.trim();
    STATE.checkoutData.email   = $('#co-email')?.value.trim();
    STATE.checkoutData.city    = $('#co-city')?.value;
    STATE.checkoutData.address = $('#co-address')?.value.trim();
  }
  return valid;
}

function renderOrderReview() {
  const itemsEl   = $('#order-review-items');
  const summaryEl = $('#order-review-summary');
  if (!itemsEl || !summaryEl) return;

  itemsEl.innerHTML = STATE.cart.map(item => {
    const prod = PRODUCTS.find(p => p.id === item.id);
    const fb   = item.fallback || getFallbackImg(prod);
    return `
      <div class="order-review-item">
        <div class="order-review-img">
          <img src="${escapeHtml(item.image || fb)}" data-fallback="${escapeHtml(fb)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" width="56" height="70"
            onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback;}">
        </div>
        <div>
          <p style="font-weight:600">${escapeHtml(item.name)}</p>
          <p style="font-size:.8rem;opacity:.6">${[item.size, item.color].filter(Boolean).join(' · ')} × ${item.qty}</p>
        </div>
        <span style="font-weight:700">${formatPrice(item.price * item.qty)}</span>
      </div>`;
  }).join('');

  const subtotal = Cart.total();
  const discount = Cart.getDiscountAmount(subtotal);
  const giftwrap = $('#gift-wrap-toggle')?.checked ? GIFT_WRAP_PRICE : 0;
  const shipInfo = getCityShipping(STATE.checkoutData.city);
  const total    = Math.max(0, subtotal - discount) + giftwrap + shipInfo.fee;
  const method   = document.querySelector('input[name="payment"]:checked')?.value || 'COD';

  summaryEl.innerHTML = `
    <div class="order-review-row"><span>Items Subtotal</span><span>${formatPrice(subtotal)}</span></div>
    ${discount > 0 ? `<div class="order-review-row" style="color:var(--c-status-available);font-weight:600"><span>Promo Discount (${escapeHtml(STATE.activePromo)})</span><span>−${formatPrice(discount)}</span></div>` : ''}
    ${giftwrap ? `<div class="order-review-row"><span>Archival Gift Wrapping</span><span>${formatPrice(giftwrap)}</span></div>` : ''}
    <div class="order-review-row"><span>Tracked Delivery (${escapeHtml(STATE.checkoutData.city || 'Pakistan')})</span><span>${shipInfo.fee === 0 ? 'Complimentary' : formatPrice(shipInfo.fee)}</span></div>
    <div class="order-review-row"><span>Estimated Transit</span><span>${escapeHtml(shipInfo.days)}</span></div>
    <div class="order-review-row"><span>Payment Method</span><span>${escapeHtml(method)}</span></div>
    <div class="order-review-row"><span>Recipient</span><span>${escapeHtml(STATE.checkoutData.name)} (+92 ${escapeHtml(STATE.checkoutData.phone)})</span></div>
    <div class="order-review-row total"><span>Grand Total</span><span>${formatPrice(total)}</span></div>`;
}

function placeOrder() {
  const orderId  = `RG-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const subtotal = Cart.total();
  const discount = Cart.getDiscountAmount(subtotal);
  const giftwrap = $('#gift-wrap-toggle')?.checked ? GIFT_WRAP_PRICE : 0;
  const shipInfo = getCityShipping(STATE.checkoutData.city);
  const total    = Math.max(0, subtotal - discount) + giftwrap + shipInfo.fee;
  const method   = document.querySelector('input[name="payment"]:checked')?.value || 'COD';
  const note     = $('#order-note')?.value.trim() || '';

  const orderRecord = {
    id:        orderId,
    date:      new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }),
    customer:  STATE.checkoutData.name,
    phone:     `+92 ${STATE.checkoutData.phone}`,
    city:      STATE.checkoutData.city,
    address:   STATE.checkoutData.address,
    payment:   method,
    items:     STATE.cart.map(i => ({ name: i.name, qty: i.qty, size: i.size, color: i.color, price: i.price })),
    totalPkr:  total,
    eta:       shipInfo.days,
    note,
    stage:     2 // 1: Confirmed, 2: Gilgit Studio Quality Audit, 3: Dispatched, 4: In Transit, 5: Out for Delivery
  };

  STATE.orders = [orderRecord, ...Storage.get(ORDERS_KEY, [])].slice(0, 15);
  Storage.set(ORDERS_KEY, STATE.orders);
  STATE.lastPlacedOrder = orderRecord;

  STATE.cart = [];
  Cart.save();
  updateCartUI();

  const numEl = $('#order-num');
  if (numEl) numEl.innerHTML = `Official Order Reference: <strong>${escapeHtml(orderId)}</strong>`;

  const invCard = $('#order-invoice-card');
  if (invCard) {
    invCard.innerHTML = `
      <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(0,0,0,.1);padding-bottom:8px;margin-bottom:8px">
        <strong>ReGongches Heritage Invoice</strong>
        <span>${escapeHtml(orderRecord.date)}</span>
      </div>
      <p><strong>Deliver To:</strong> ${escapeHtml(orderRecord.customer)} · ${escapeHtml(orderRecord.phone)}</p>
      <p><strong>Address:</strong> ${escapeHtml(orderRecord.address)}, ${escapeHtml(orderRecord.city)}</p>
      <p><strong>Payment:</strong> ${escapeHtml(orderRecord.payment)} · <strong>Transit:</strong> ${escapeHtml(orderRecord.eta)}</p>
      <div style="margin-top:8px;padding-top:8px;border-top:1px dashed rgba(0,0,0,.12)">
        ${orderRecord.items.map(it => `<div>• ${escapeHtml(it.name)} (${escapeHtml(it.size)}) × ${it.qty} — ${formatPrice(it.price * it.qty)}</div>`).join('')}
      </div>
      <div style="margin-top:8px;font-weight:700;font-size:var(--fs-sm);color:var(--c-maroon)">Total Due: ${formatPrice(orderRecord.totalPkr)}</div>
    `;
  }

  const waBtn = $('#order-whatsapp-btn');
  if (waBtn) {
    const msg = `Hi ReGongches, I placed order ${orderId}. Name: ${orderRecord.customer}, City: ${orderRecord.city}, Total: PKR ${orderRecord.totalPkr.toLocaleString()}`;
    waBtn.href = `https://wa.me/923001234567?text=${encodeURIComponent(msg)}`;
  }

  goToCheckoutStep(4);
}

function initCheckout() {
  $('#co-city')?.addEventListener('change', e => {
    const city   = e.target.value;
    const banner = $('#co-city-estimate-banner');
    const text   = $('#co-city-estimate-text');
    if (!city || !banner || !text) { if (banner) banner.hidden = true; return; }
    const info = getCityShipping(city);
    banner.hidden = false;
    text.textContent = `${city}: Estimated delivery in ${info.days} · Shipping fee: ${info.fee === 0 ? 'Complimentary' : formatPrice(info.fee)}`;
  });

  $('#co-step1-next')?.addEventListener('click', () => { if (validateStep1()) goToCheckoutStep(2); });
  $('#co-step2-back')?.addEventListener('click', () => goToCheckoutStep(1));
  $('#co-step2-next')?.addEventListener('click', () => goToCheckoutStep(3));
  $('#co-step3-back')?.addEventListener('click', () => goToCheckoutStep(2));
  $('#co-place-order')?.addEventListener('click', placeOrder);
  $('#order-close-btn')?.addEventListener('click', closeCheckout);
  $('#checkout-close')?.addEventListener('click', closeCheckout);
  $('#checkout-overlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeCheckout(); });

  $('#print-invoice-btn')?.addEventListener('click', () => window.print());
  $('#track-this-order-btn')?.addEventListener('click', () => {
    const ref = STATE.lastPlacedOrder?.id || 'RG-DEMO101';
    closeCheckout();
    openModalByType('tracker', ref);
  });
}

/* ══════════════════════════════════════════════════════════════
   CUSTOM ORDER MODAL & GIFT CARDS
══════════════════════════════════════════════════════════════ */
let customOrderReleaseTrap;

function openCustomOrder() {
  const overlay = $('#custom-order-overlay');
  if (!overlay) return;
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  lockScroll();
  customOrderReleaseTrap = trapFocus(overlay);
}
function closeCustomOrder() {
  const overlay = $('#custom-order-overlay');
  overlay?.classList.remove('is-open');
  overlay?.setAttribute('aria-hidden', 'true');
  unlockScroll();
  customOrderReleaseTrap?.();
}

function initCustomOrder() {
  $$('#custom-order-btn, #custom-gift-btn').forEach(btn => btn?.addEventListener('click', openCustomOrder));
  $('#custom-order-close')?.addEventListener('click', closeCustomOrder);
  $('#custom-order-overlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeCustomOrder(); });

  $('#custom-order-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const fields = [
      { id: 'cof-occasion', errId: 'cof-occasion-error', rule: v => v !== '' },
      { id: 'cof-item',     errId: 'cof-item-error',     rule: v => v.trim().length >= 3 },
      { id: 'cof-phone',    errId: 'cof-phone-error',    rule: v => v.trim().length >= 8 },
    ];
    let valid = true;
    fields.forEach(f => {
      const el = $(`#${f.id}`); const err = $(`#${f.errId}`);
      if (!el || !err) return;
      const ok = f.rule(el.value);
      el.classList.toggle('is-error', !ok);
      err.textContent = ok ? '' : 'This field is required.';
      if (!ok && valid) { valid = false; el.focus(); }
    });
    if (!valid) return;
    closeCustomOrder();
    Toast.show('Bespoke inquiry received! Our Gilgit studio will contact you on WhatsApp within 1–2 business days.', 'success', 5500);
    e.target.reset();
  });

  // Gift card quick actions
  $$('.gift-add-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const prod = PRODUCTS.find(p => p.id === btn.dataset.quickaddId);
      if (prod) Cart.add(prod, 1, prod.sizes?.[0] || 'One Size', prod.colors?.[0]?.label || '');
    });
  });
  $$('.gift-qv-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const prod = PRODUCTS.find(p => p.id === btn.dataset.productId);
      if (prod) openQuickView(prod);
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   CULTURAL JOURNAL & ARTICLE READER MODAL
══════════════════════════════════════════════════════════════ */
function initJournal() {
  if (typeof JOURNAL_ARTICLES === 'undefined') return;
  const grid = $('#journal-grid');
  if (!grid) return;

  grid.innerHTML = JOURNAL_ARTICLES.map(article => {
    const cssClass = `journal-img-css--${(article.category || 'craft').toLowerCase()}`;
    return `
      <article class="journal-card" tabindex="0" role="button" data-article-id="${escapeHtml(article.id)}" aria-label="Read article: ${escapeHtml(article.title)}">
        <div class="journal-img">
          <div class="journal-img-css ${cssClass}"></div>
          <span class="journal-category-tag">${escapeHtml(article.category)}</span>
        </div>
        <div class="journal-content">
          <div class="journal-meta">
            <span>${escapeHtml(article.date)}</span>
            <span>·</span>
            <span>${escapeHtml(article.readingTime)}</span>
          </div>
          <h3>${escapeHtml(article.title)}</h3>
          <p class="journal-excerpt">${escapeHtml(article.excerpt)}</p>
          <span class="read-more">Read Full Essay <i class="ph ph-arrow-right" aria-hidden="true"></i></span>
        </div>
      </article>`;
  }).join('');

  grid.querySelectorAll('.journal-card').forEach(card => {
    const open = () => openJournalArticle(card.dataset.articleId);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });

  $('#journal-modal-close')?.addEventListener('click', closeJournalModal);
  $('#journal-modal-overlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeJournalModal(); });
}

function openJournalArticle(articleId) {
  const article = JOURNAL_ARTICLES.find(a => a.id === articleId);
  const overlay = $('#journal-modal-overlay');
  const content = $('#journal-reader-content');
  if (!article || !overlay || !content) return;

  const relatedProds = (article.relatedProductIds || [])
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean);

  content.innerHTML = `
    <span class="eyebrow">${escapeHtml(article.category)} · Cultural Journal</span>
    <h2 id="journal-modal-title" style="font-size:var(--fs-2xl)">${escapeHtml(article.title)}</h2>
    <div class="journal-reader-meta">
      <span><i class="ph ph-calendar"></i> ${escapeHtml(article.date)}</span>
      <span><i class="ph ph-clock"></i> ${escapeHtml(article.readingTime)}</span>
      <span><i class="ph ph-pen-nib"></i> ${escapeHtml(article.author || 'ReGongches Editorial')}</span>
    </div>
    ${article.pullQuote ? `<blockquote class="journal-reader-quote">"${escapeHtml(article.pullQuote)}"</blockquote>` : ''}
    <div class="journal-reader-body">
      ${article.body || `<p>${escapeHtml(article.excerpt)}</p>`}
    </div>
    ${relatedProds.length ? `
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(0,0,0,.1)">
        <h3 style="font-size:var(--fs-lg);margin-bottom:12px">Featured Heritage Pieces in This Essay</h3>
        <div class="region-mini-products">
          ${relatedProds.map(p => `
            <div class="region-mini-card" data-reader-product="${escapeHtml(p.id)}">
              <img src="${escapeHtml(p.images[0])}" data-fallback="${escapeHtml(getFallbackImg(p))}" alt="${escapeHtml(p.name)}"
                   onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback;}">
              <div>
                <strong>${escapeHtml(p.name)}</strong>
                <span>${formatPrice(p.price)} · Inspect →</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;

  content.querySelectorAll('[data-reader-product]').forEach(card => {
    card.addEventListener('click', () => {
      const prod = PRODUCTS.find(p => p.id === card.dataset.readerProduct);
      if (prod) { closeJournalModal(); openQuickView(prod); }
    });
  });

  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  lockScroll();
}

function closeJournalModal() {
  const overlay = $('#journal-modal-overlay');
  overlay?.classList.remove('is-open');
  overlay?.setAttribute('aria-hidden', 'true');
  unlockScroll();
}

/* ══════════════════════════════════════════════════════════════
   REGION EXPLORER (WITH LIVE REGIONAL PRODUCT CARDS)
══════════════════════════════════════════════════════════════ */
function initRegions() {
  if (typeof REGIONS === 'undefined') return;

  const tabsEl   = $('#region-tabs');
  const panelsEl = $('#region-panels');
  if (tabsEl && panelsEl) {
    tabsEl.innerHTML = REGIONS.map((r, i) => `
      <button type="button" class="region-tab-btn ${i === 0 ? 'is-active' : ''}"
        role="tab" aria-selected="${i === 0}" aria-controls="region-panel-${i}"
        id="region-tab-${i}" data-tab="${i}">
        <span>${escapeHtml(r.name)}</span>
        <i class="ph ph-caret-right" aria-hidden="true"></i>
      </button>`).join('');

    panelsEl.innerHTML = REGIONS.map((r, i) => {
      const regProducts = PRODUCTS.filter(p => p.region === r.name).slice(0, 3);
      return `
      <div class="region-panel ${i === 0 ? 'is-active' : ''}" id="region-panel-${i}"
        role="tabpanel" aria-labelledby="region-tab-${i}">
        <div class="region-meta-chips">
          ${r.altitude ? `<span class="region-meta-chip"><i class="ph ph-mountains"></i> ${escapeHtml(r.altitude)}</span>` : ''}
          ${r.artisanCount ? `<span class="region-meta-chip"><i class="ph ph-users-three"></i> ${escapeHtml(r.artisanCount)}</span>` : ''}
          ${r.signatureMotif ? `<span class="region-meta-chip"><i class="ph ph-sparkle"></i> ${escapeHtml(r.signatureMotif)}</span>` : ''}
        </div>
        <p class="region-panel-crafts">${escapeHtml(r.crafts)}</p>
        <h3>${escapeHtml(r.name)} District</h3>
        <p>${escapeHtml(r.description)}</p>
        ${regProducts.length ? `
          <div class="region-mini-products">
            ${regProducts.map(p => `
              <div class="region-mini-card" data-reg-product="${escapeHtml(p.id)}">
                <img src="${escapeHtml(p.images[0])}" data-fallback="${escapeHtml(getFallbackImg(p))}" alt="${escapeHtml(p.name)}"
                     onerror="if(this.dataset.fallback && this.src!==this.dataset.fallback){this.src=this.dataset.fallback;}">
                <div>
                  <strong>${escapeHtml(p.name)}</strong>
                  <span>${formatPrice(p.price)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        <a href="#catalogue" data-filter-region="${escapeHtml(r.name)}" class="btn btn-primary">
          Filter All ${escapeHtml(r.name)} Pieces <i class="ph ph-arrow-right" aria-hidden="true"></i>
        </a>
      </div>`;
    }).join('');

    tabsEl.querySelectorAll('.region-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsEl.querySelectorAll('.region-tab-btn').forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
        panelsEl.querySelectorAll('.region-panel').forEach(p => p.classList.remove('is-active'));
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        panelsEl.querySelector(`#region-panel-${btn.dataset.tab}`)?.classList.add('is-active');
      });
    });

    panelsEl.querySelectorAll('[data-reg-product]').forEach(card => {
      card.addEventListener('click', () => {
        const prod = PRODUCTS.find(p => p.id === card.dataset.regProduct);
        if (prod) openQuickView(prod);
      });
    });
  }

  const pillsEl = $('#region-pills');
  if (pillsEl) {
    pillsEl.innerHTML = REGIONS.map(r => `
      <a href="#catalogue" class="region-pill" data-filter-region="${escapeHtml(r.name)}">${escapeHtml(r.name)}</a>`
    ).join('');
  }
}

/* ══════════════════════════════════════════════════════════════
   MODALS: SIZE GUIDE, ORDER TRACKER, ARTISANS & FAQ
══════════════════════════════════════════════════════════════ */
function initInteractiveModals() {
  // Global delegation for [data-open-modal]
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-open-modal]');
    if (!trigger) return;
    e.preventDefault();
    openModalByType(trigger.dataset.openModal);
  });

  // Size & Care Modal
  $('#size-care-close')?.addEventListener('click', () => closeModalEl('#size-care-modal-overlay'));
  $('#size-care-modal-overlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModalEl('#size-care-modal-overlay'); });

  $$('.unit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.unit-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.sizeUnit = btn.dataset.unit;
      renderSizeGuideTables();
    });
  });

  $('#fit-chest-input')?.addEventListener('input', e => {
    const val = parseFloat(e.target.value);
    const res = $('#fit-finder-result');
    if (!res) return;
    if (!val || val < 75 || val > 140) {
      res.textContent = 'Enter chest between 80–135 cm';
      return;
    }
    let rec = 'XL';
    if (val <= 96) rec = 'S';
    else if (val <= 103) rec = 'M';
    else if (val <= 110) rec = 'L';
    res.textContent = `Recommended ReGongches Size: ${rec} (Comfortable Highland Fit)`;
  });

  // Order Tracker Modal
  $('#tracker-modal-close')?.addEventListener('click', () => closeModalEl('#tracker-modal-overlay'));
  $('#tracker-modal-overlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModalEl('#tracker-modal-overlay'); });

  $('#tracker-lookup-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const ref = $('#tracker-input')?.value.trim().toUpperCase();
    if (ref) renderTrackerLookup(ref);
  });
  $('#tracker-demo-btn')?.addEventListener('click', () => {
    if ($('#tracker-input')) $('#tracker-input').value = 'RG-DEMO101';
    renderTrackerLookup('RG-DEMO101');
  });

  // Info Modal (Artisans & FAQ)
  $('#info-modal-close')?.addEventListener('click', () => closeModalEl('#info-modal-overlay'));
  $('#info-modal-overlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModalEl('#info-modal-overlay'); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      ['#size-care-modal-overlay', '#tracker-modal-overlay', '#info-modal-overlay', '#journal-modal-overlay', '#compare-modal-overlay'].forEach(sel => {
        if ($(sel)?.classList.contains('is-open')) closeModalEl(sel);
      });
    }
  });
}

function closeModalEl(sel) {
  const el = $(sel);
  if (!el) return;
  el.classList.remove('is-open');
  el.setAttribute('aria-hidden', 'true');
  unlockScroll();
}

function openModalByType(type, param = '') {
  if ($('#quickview-overlay')?.classList.contains('is-open')) closeQuickView();

  if (type === 'size-care') {
    renderSizeGuideTables();
    const ov = $('#size-care-modal-overlay');
    ov?.classList.add('is-open');
    ov?.setAttribute('aria-hidden', 'false');
    lockScroll();
  } else if (type === 'tracker') {
    renderSavedOrdersList();
    const initialRef = param || STATE.orders?.[0]?.id || 'RG-DEMO101';
    if ($('#tracker-input')) $('#tracker-input').value = initialRef;
    renderTrackerLookup(initialRef);
    const ov = $('#tracker-modal-overlay');
    ov?.classList.add('is-open');
    ov?.setAttribute('aria-hidden', 'false');
    lockScroll();
  } else if (type === 'artisans' || type === 'faq') {
    renderInfoModal(type);
    const ov = $('#info-modal-overlay');
    ov?.classList.add('is-open');
    ov?.setAttribute('aria-hidden', 'false');
    lockScroll();
  }
}

function renderSizeGuideTables() {
  const container = $('#size-tables-container');
  if (!container || typeof SIZE_GUIDE_DATA === 'undefined') return;

  container.innerHTML = Object.values(SIZE_GUIDE_DATA).map(sec => {
    const rows = STATE.sizeUnit === 'in' ? sec.rowsIn : sec.rowsCm;
    return `
      <div class="size-table-block">
        <h3>${escapeHtml(sec.title)}</h3>
        <p>${escapeHtml(sec.note)}</p>
        <table class="size-table">
          <thead>
            <tr>${sec.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr>${r.map((cell, i) => i === 0 ? `<td><strong>${escapeHtml(cell)}</strong></td>` : `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }).join('');
}

function renderTrackerLookup(ref) {
  const area = $('#tracker-result-area');
  if (!area) return;

  const saved = Storage.get(ORDERS_KEY, []);
  let order = saved.find(o => o.id.toUpperCase() === ref.toUpperCase());

  if (!order && ref.toUpperCase() === 'RG-DEMO101') {
    order = {
      id: 'RG-DEMO101',
      date: '12 Oct 2026',
      customer: 'Sample Collector (Islamabad)',
      city: 'Islamabad',
      payment: 'Cash on Delivery (COD)',
      eta: '2–3 business days (Air/Road Hub)',
      totalPkr: 7500,
      stage: 3,
      items: [{ name: 'Traditional Cap & Shawl Gift Set', qty: 1, size: 'Cap: L/XL + Shawl: One Size' }]
    };
  }

  if (!order) {
    area.innerHTML = `<div class="tracker-card"><p>No shipment found with reference <strong>${escapeHtml(ref)}</strong>. Click "Load Sample Dispatch" or place an order in checkout to test live tracking.</p></div>`;
    return;
  }

  const stages = [
    { num: 1, icon: 'ph-check-circle',        label: 'Order Confirmed' },
    { num: 2, icon: 'ph-seal-check',          label: 'Workshop Quality Audit' },
    { num: 3, icon: 'ph-package',             label: 'Dispatched (Gilgit Hub)' },
    { num: 4, icon: 'ph-airplane-in-flight',  label: 'In Transit to ' + order.city },
    { num: 5, icon: 'ph-house-line',          label: 'Out for Delivery' }
  ];

  area.innerHTML = `
    <div class="tracker-card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div>
          <span class="eyebrow">Active Dispatch</span>
          <h3 style="font-size:var(--fs-xl)">Reference: ${escapeHtml(order.id)}</h3>
          <p style="font-size:var(--fs-xs);opacity:.75">Placed on ${escapeHtml(order.date)} · Destination: <strong>${escapeHtml(order.city)}</strong> · ETA: ${escapeHtml(order.eta)}</p>
        </div>
        <span class="badge badge--handmade">Total: ${formatPrice(order.totalPkr)}</span>
      </div>
      <div class="tracker-timeline">
        ${stages.map(st => `
          <div class="tracker-stage ${st.num < order.stage ? 'is-complete' : ''} ${st.num === order.stage ? 'is-current' : ''}">
            <i class="ph ${st.icon}"></i>
            <strong>0${st.num}. ${escapeHtml(st.label)}</strong>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderSavedOrdersList() {
  const listEl = $('#saved-orders-list');
  if (!listEl) return;
  const saved = Storage.get(ORDERS_KEY, []);
  STATE.orders = saved;
  if (!saved.length) {
    listEl.innerHTML = `<p style="font-size:var(--fs-sm);opacity:.65">No orders placed from this browser yet. Complete a demo checkout or click "Load Sample Dispatch" above.</p>`;
    return;
  }
  listEl.innerHTML = saved.map(o => `
    <div class="saved-order-card">
      <div>
        <strong>${escapeHtml(o.id)}</strong> · <span>${escapeHtml(o.date)}</span>
        <div style="font-size:var(--fs-xs);opacity:.7">${escapeHtml(o.city)} · ${o.items?.length || 1} item(s) · ${formatPrice(o.totalPkr)}</div>
      </div>
      <button type="button" class="btn btn-secondary btn-sm" data-inspect-order="${escapeHtml(o.id)}">Inspect Status</button>
    </div>
  `).join('');

  listEl.querySelectorAll('[data-inspect-order]').forEach(btn => {
    btn.addEventListener('click', () => {
      if ($('#tracker-input')) $('#tracker-input').value = btn.dataset.inspectOrder;
      renderTrackerLookup(btn.dataset.inspectOrder);
    });
  });
}

function renderInfoModal(activeTab = 'artisans') {
  const content = $('#info-modal-content');
  if (!content) return;

  content.innerHTML = `
    <div class="lookbook-tabs" style="justify-content:flex-start;margin-bottom:20px">
      <button type="button" class="lookbook-tab-btn ${activeTab === 'artisans' ? 'is-active' : ''}" data-info-tab="artisans">
        Artisans &amp; 4-Step Authenticity Promise
      </button>
      <button type="button" class="lookbook-tab-btn ${activeTab === 'faq' ? 'is-active' : ''}" data-info-tab="faq">
        FAQs, Shipping Rates &amp; Exchange Policy
      </button>
    </div>
    <div id="info-tab-body"></div>
  `;

  content.querySelectorAll('[data-info-tab]').forEach(btn => {
    btn.addEventListener('click', () => renderInfoModal(btn.dataset.infoTab));
  });

  const body = content.querySelector('#info-tab-body');
  if (!body) return;

  if (activeTab === 'artisans') {
    body.innerHTML = `
      <span class="eyebrow">Verified Provenance</span>
      <h2 id="info-modal-title" style="font-size:var(--fs-2xl);margin-bottom:8px">Meet the Artisans &amp; Our Authenticity Promise</h2>
      <p style="font-size:var(--fs-sm);opacity:.78;line-height:1.7">Every ReGongches piece is commissioned directly from documented guilds across the 7 districts of Gilgit-Baltistan with the makers’ full credit and fair-trade compensation.</p>
      <div class="artisan-profile-grid">
        ${(typeof ARTISANS !== 'undefined' ? ARTISANS : []).map(a => `
          <div class="artisan-profile-card">
            <div class="artisan-profile-meta">${escapeHtml(a.region)} · ${escapeHtml(a.members)}</div>
            <h4>${escapeHtml(a.name)}</h4>
            <p style="font-size:var(--fs-xs);font-weight:600;opacity:.8">${escapeHtml(a.specialty)}</p>
            <blockquote class="artisan-profile-quote">"${escapeHtml(a.quote)}"</blockquote>
            <p style="font-size:var(--fs-xs);opacity:.75;line-height:1.6">${escapeHtml(a.story)}</p>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    body.innerHTML = `
      <span class="eyebrow">Customer Care &amp; Policies</span>
      <h2 id="info-modal-title" style="font-size:var(--fs-2xl);margin-bottom:12px">Frequently Asked Questions &amp; Policies</h2>
      <div class="qv-accordions">
        ${(typeof FAQS !== 'undefined' ? FAQS : []).map((f, idx) => `
          <details class="qv-accordion" ${idx === 0 ? 'open' : ''}>
            <summary><span><strong style="color:var(--c-blue)">[${escapeHtml(f.category)}]</strong> ${escapeHtml(f.q)}</span> <i class="ph ph-caret-down"></i></summary>
            <div class="qv-accordion-body">${escapeHtml(f.a)}</div>
          </details>
        `).join('')}
      </div>
    `;
  }
}

/* ══════════════════════════════════════════════════════════════
   REVIEWS CAROUSEL & INTERACTIVE REVIEW SUBMISSION
══════════════════════════════════════════════════════════════ */
function initReviews() {
  const carousel = $('#reviews-carousel');
  const prevBtn  = $('#reviews-prev');
  const nextBtn  = $('#reviews-next');
  const dotsEl   = $('#reviews-dots');
  const toggleBtn= $('#toggle-write-review-btn');
  const cancelBtn= $('#cancel-write-review-btn');
  const form     = $('#write-review-form');
  const prodSel  = $('#rv-product');
  if (!carousel) return;

  // Populate product dropdown in Write-a-Review form
  if (prodSel && typeof PRODUCTS !== 'undefined') {
    prodSel.innerHTML = PRODUCTS.map(p => `<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)} (${escapeHtml(p.region)})</option>`).join('');
  }

  // Load any saved user reviews from localStorage
  STATE.userReviews = Storage.get(REVIEWS_KEY, []);
  STATE.userReviews.forEach(r => prependReviewSlide(r));

  let current = 0;
  function getSlides() { return carousel.querySelectorAll('.review-card'); }

  function renderDots() {
    const slides = getSlides();
    if (!dotsEl) return;
    dotsEl.innerHTML = [...slides].map((_, i) => `
      <button type="button" class="carousel-dot ${i === current ? 'active' : ''}" data-idx="${i}" aria-label="Go to review ${i + 1}"></button>`
    ).join('');
    dotsEl.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', () => goTo(parseInt(dot.dataset.idx, 10)));
    });
  }

  function goTo(idx) {
    const slides = getSlides();
    current = Math.max(0, Math.min(idx, slides.length - 1));
    slides[current]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    dotsEl?.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function prependReviewSlide(rev) {
    const starsHtml = '<i class="ph-fill ph-star" aria-hidden="true"></i>'.repeat(rev.rating || 5);
    const card = document.createElement('div');
    card.className = 'review-card';
    card.setAttribute('role', 'group');
    card.innerHTML = `
      <div class="stars" aria-label="${rev.rating || 5} out of 5 stars">${starsHtml}</div>
      <blockquote class="review-text"><p>"${escapeHtml(rev.comment)}"</p></blockquote>
      <footer class="review-meta">
        <strong>${escapeHtml(rev.name)}</strong>
        <span>Purchased: ${escapeHtml(rev.product)}</span>
        <span class="verified-badge"><i class="ph ph-seal-check" aria-hidden="true"></i> Verified collector review</span>
      </footer>
    `;
    carousel.prepend(card);
  }

  renderDots();
  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  toggleBtn?.addEventListener('click', () => {
    if (form) form.hidden = !form.hidden;
  });
  cancelBtn?.addEventListener('click', () => {
    if (form) form.hidden = true;
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name    = $('#rv-name')?.value.trim();
    const product = $('#rv-product')?.value;
    const rating  = parseInt($('#rv-rating')?.value || '5', 10);
    const comment = $('#rv-comment')?.value.trim();
    if (!name || !comment) {
      Toast.show('Please enter your name and review comment.', 'error');
      return;
    }
    const newRev = { name, product, rating, comment, date: 'Oct 2026' };
    STATE.userReviews = [newRev, ...STATE.userReviews];
    Storage.set(REVIEWS_KEY, STATE.userReviews);
    prependReviewSlide(newRev);
    renderDots();
    goTo(0);
    form.reset();
    form.hidden = true;
    Toast.show('Thank you! Your review has been published to the archive.', 'success');
  });
}

/* ══════════════════════════════════════════════════════════════
   SOCIAL GALLERY, NEWSLETTER, EXIT-INTENT & COOKIE BAR
══════════════════════════════════════════════════════════════ */
function initSocialGallery() {
  $$('.social-tile[data-product-id]').forEach(tile => {
    tile.addEventListener('click', () => {
      const prod = PRODUCTS.find(p => p.id === tile.dataset.productId);
      if (prod) openQuickView(prod);
    });
  });
}

function initNewsletter() {
  const form       = $('#newsletter-form');
  const wrap       = $('#newsletter-form-wrap');
  const success    = $('#newsletter-success');
  const emailInput = $('#newsletter-email');
  const errEl      = $('#newsletter-error');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = emailInput?.value?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (errEl) errEl.textContent = 'Please enter a valid email address.';
      emailInput?.classList.add('is-error');
      emailInput?.focus();
      return;
    }
    if (errEl) errEl.textContent = '';
    emailInput?.classList.remove('is-error');
    if (wrap) wrap.hidden = true;
    if (success) success.hidden = false;
    Storage.set('newsletter-joined', true);
    applyPromoCode('HERITAGE10', true);
  });
}

function initExitIntent() {
  const overlay  = $('#exit-modal-overlay');
  const closeBtn = $('#exit-modal-close');
  const skipBtn  = $('#exit-modal-skip');
  const exitForm = $('#exit-newsletter-form');
  if (!overlay) return;

  if (Storage.getSession('exit-shown') || Storage.get('newsletter-joined')) return;

  let shown = false;
  let releaseExit;

  function showModal() {
    if (shown) return;
    shown = true;
    Storage.setSession('exit-shown', true);
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    releaseExit = trapFocus(overlay);
  }
  function hideModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    releaseExit?.();
  }

  document.addEventListener('mouseleave', e => {
    if (e.clientY < 0) showModal();
  });

  closeBtn?.addEventListener('click', hideModal);
  skipBtn?.addEventListener('click',  hideModal);
  overlay.addEventListener('click', e => { if (e.target === e.currentTarget) hideModal(); });

  exitForm?.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#exit-email')?.value?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    hideModal();
    Storage.set('newsletter-joined', true);
    applyPromoCode('HERITAGE10', true);
  });
}

function initCookieBar() {
  const bar       = $('#cookie-bar');
  const acceptBtn = $('#cookie-accept');
  const closeBtn  = $('#cookie-close');
  if (!bar) return;

  if (Storage.get('cookie-accepted')) return;

  bar.hidden = false;
  acceptBtn?.addEventListener('click', () => { bar.hidden = true; Storage.set('cookie-accepted', true); });
  closeBtn?.addEventListener('click',  () => { bar.hidden = true; });
}

function initMisc() {
  const backBtn = $('#back-to-top');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      backBtn.hidden = window.scrollY < 600;
    }, { passive: true });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}

/* ══════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  window.openCart      = openCart;
  window.closeCart     = closeCart;
  window.openWishlist  = openWishlist;
  window.closeWishlist = closeWishlist;

  initTheme();
  initAnnouncement();
  initHeader();
  initMobileDrawer();
  initMegaMenu();
  initTabBar();
  initSearch();
  initCurrency();
  initReveal();
  initScrollProgress();
  initHero();
  initPremiumMotion();
  initCatalogue();
  initLookbook();
  initCompare();
  initQuickView();
  initCart();
  initWishlist();
  initCheckout();
  initCustomOrder();
  initJournal();
  initRegions();
  initInteractiveModals();
  initReviews();
  initSocialGallery();
  initNewsletter();
  initExitIntent();
  initCookieBar();
  initMisc();
});
