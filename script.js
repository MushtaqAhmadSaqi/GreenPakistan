/**
 * ReGongches — Main Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Architecture (no bundler, file:// safe):
 *
 *  STATE         — runtime state object
 *  UTILS         — pure helper functions
 *  STORAGE       — localStorage read/write
 *  TOAST         — toast notification system
 *  SCROLL LOCK   — body scroll management
 *  FOCUS TRAP    — keyboard focus management for modals
 *  ANNOUNCEMENT  — announcement bar
 *  HEADER        — sticky header, hero-transparent, scroll-spy
 *  MOBILE DRAWER — slide-in nav drawer
 *  MEGA MENU     — desktop hover/keyboard mega menus
 *  MOBILE TAB    — bottom tab bar hide-on-scroll
 *  SEARCH        — full-screen search overlay (live results)
 *  CURRENCY      — currency selector
 *  REVEAL        — IntersectionObserver scroll reveals
 *  HERO          — entrance animation
 *  CATALOGUE     — product grid rendering, filtering, sorting
 *  QUICK VIEW    — product quick-view modal
 *  CART          — cart drawer, localStorage, free-delivery bar, checkout
 *  WISHLIST      — wishlist drawer, localStorage
 *  CHECKOUT      — 4-step checkout modal
 *  CUSTOM ORDER  — custom order modal & form
 *  JOURNAL       — journal article grid rendering
 *  REGION        — region explorer
 *  REVIEWS       — carousel prev/next/dots
 *  NEWSLETTER    — form + exit-intent modal
 *  COOKIE        — cookie/privacy notice
 *  MISC          — back-to-top, copyright year, category/footer links
 *  INIT          — DOMContentLoaded entry point
 */

'use strict';

/* ══════════════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════════════ */
const STATE = {
  cart:           [],
  wishlist:       [],
  recentSearches: [],
  recentlyViewed: [],
  currency:       'PKR',
  activeFilters:  { category: '', region: '', status: '', sort: 'featured', badge: '' },
  gridCols:       3,
  quickViewProduct: null,
  checkoutStep:   1,
  checkoutData:   {},
  annPaused:      false,
  annIdx:         0,
};

/* Currency display rates (display only — charged in PKR) */
const CURRENCY_RATES = { PKR: 1, USD: 0.0036, GBP: 0.0028, AED: 0.013 };
const CURRENCY_SYMBOLS = { PKR: 'PKR ', USD: '$', GBP: '£', AED: 'AED ' };

/* ══════════════════════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function formatPrice(pkr, currency = STATE.currency) {
  const rate = CURRENCY_RATES[currency] || 1;
  const sym  = CURRENCY_SYMBOLS[currency] || 'PKR ';
  const val  = pkr * rate;
  if (currency === 'PKR') return `PKR ${Math.round(val).toLocaleString('en-PK')}`;
  return `${sym}${val.toFixed(2)}`;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function qs(el) { return el || document.createElement('div'); } // null guard

function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return escapeHtml(text).replace(re, '<mark>$1</mark>');
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
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
    const c = container(); if (!c) return;
    const icons = { success: 'ph-check-circle', error: 'ph-x-circle', info: 'ph-info', cart: 'ph-shopping-bag' };
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
    t.querySelector('.toast-close').addEventListener('click', remove);
    if (duration > 0) setTimeout(remove, duration);
    return remove;
  }

  return { show };
})();

/* ══════════════════════════════════════════════════════════════
   SCROLL LOCK
══════════════════════════════════════════════════════════════ */
let lockCount = 0;
function lockScroll()   { lockCount++; document.body.classList.add('scroll-locked'); }
function unlockScroll() { lockCount = Math.max(0, lockCount - 1); if (!lockCount) document.body.classList.remove('scroll-locked'); }

/* ══════════════════════════════════════════════════════════════
   FOCUS TRAP
══════════════════════════════════════════════════════════════ */
function trapFocus(el) {
  const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const first = () => el.querySelectorAll(focusable)[0];
  const last  = () => { const all = el.querySelectorAll(focusable); return all[all.length - 1]; };

  function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) { if (document.activeElement === first()) { e.preventDefault(); last()?.focus(); } }
    else            { if (document.activeElement === last())  { e.preventDefault(); first()?.focus(); } }
  }
  el.addEventListener('keydown', handler);
  first()?.focus();
  return () => el.removeEventListener('keydown', handler);
}

/* ══════════════════════════════════════════════════════════════
   ANNOUNCEMENT BAR
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

  slides[0]?.classList.add('active');
  start();
}

/* ══════════════════════════════════════════════════════════════
   HEADER
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

  // Copyright year
  const yearEl = $('#copyright-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ══════════════════════════════════════════════════════════════
   MOBILE DRAWER
══════════════════════════════════════════════════════════════ */
function initMobileDrawer() {
  const drawerEl   = $('#mobile-nav-drawer');
  const openBtn    = $('#mobile-menu-btn');
  const closeBtn   = $('#mobile-drawer-close');
  const backdrop   = $('#mobile-backdrop');
  const accordions = $$('.mobile-accordion-btn');
  if (!drawerEl) return;

  // Populate region list
  const regionList = $('#mobile-region-list');
  if (regionList && typeof REGIONS !== 'undefined') {
    regionList.innerHTML = REGIONS.map(r =>
      `<li><a href="#catalogue" data-filter-region="${escapeHtml(r.name)}" class="mobile-sub-link">${escapeHtml(r.name)} <small style="opacity:.55">— ${escapeHtml(r.descriptor)}</small></a></li>`
    ).join('');
  }

  let releaseTrapped;

  function open() {
    drawerEl.classList.add('is-open');
    backdrop.classList.add('is-visible');
    drawerEl.setAttribute('aria-hidden', 'false');
    openBtn?.setAttribute('aria-expanded', 'true');
    lockScroll();
    releaseTrapped = trapFocus(drawerEl);
  }
  function close() {
    drawerEl.classList.remove('is-open');
    backdrop.classList.remove('is-visible');
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

  // Close drawer on internal link click
  drawerEl.addEventListener('click', e => {
    if (e.target.matches('a[href]') || e.target.closest('a[href]')) {
      close();
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   MEGA MENU
══════════════════════════════════════════════════════════════ */
function initMegaMenu() {
  // Populate region panel
  const regionPanelList = $('#region-panel-list');
  if (regionPanelList && typeof REGIONS !== 'undefined') {
    regionPanelList.innerHTML = REGIONS.map(r => `
      <a href="#catalogue" data-filter-region="${escapeHtml(r.name)}" class="region-panel-link">
        <span class="region-panel-name">${escapeHtml(r.name)}</span>
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
      }, 150);
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
  });
}

/* ══════════════════════════════════════════════════════════════
   MOBILE BOTTOM TAB BAR
══════════════════════════════════════════════════════════════ */
function initTabBar() {
  const tabBar = $('#mobile-tab-bar');
  if (!tabBar) return;

  let lastScrollY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    tabBar.classList.toggle('hide-bar', y > lastScrollY && y > 100);
    lastScrollY = y;
  }, { passive: true });

  $('#search-tab-btn')?.addEventListener('click', () => openSearch());
  $('#wishlist-tab-btn')?.addEventListener('click', () => openWishlist());
  $('#cart-tab-btn')?.addEventListener('click', () => openCart());
}

/* ══════════════════════════════════════════════════════════════
   SEARCH OVERLAY
══════════════════════════════════════════════════════════════ */
function initSearch() {
  const overlay   = $('#search-overlay');
  const backdrop  = $('#search-backdrop');
  const openBtn   = $('#search-btn');
  const closeBtn  = $('#search-close');
  const input     = $('#search-input');
  const clearBtn  = $('#search-clear');
  const results   = $('#search-results');
  const popular   = $('#search-popular');
  const chips     = $('#search-popular-chips');
  const recentWrap= $('#search-recent-wrap');
  const recentC   = $('#search-recent-chips');
  if (!overlay) return;

  let releaseTrapped;

  function openSearch() {
    overlay.classList.add('is-open');
    backdrop.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
    lockScroll();
    releaseTrapped = trapFocus(overlay);
    input?.focus();
    renderRecentSearches();
  }
  function closeSearch() {
    overlay.classList.remove('is-open');
    backdrop.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
    unlockScroll();
    releaseTrapped?.();
    openBtn?.focus();
  }

  // Expose globally for tab bar
  window.openSearch = openSearch;

  openBtn?.addEventListener('click', openSearch);
  closeBtn?.addEventListener('click', closeSearch);
  backdrop?.addEventListener('click', closeSearch);
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !overlay.classList.contains('is-open') && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault(); openSearch();
    }
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeSearch();
  });

  // Live search
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
      (p.materials || '').toLowerCase().includes(q)
    );

    if (!matches.length) {
      results.innerHTML = `<div class="search-no-results"><i class="ph ph-magnifying-glass-minus"></i><p>No products found for "<strong>${escapeHtml(query)}</strong>"</p></div>`;
      return;
    }

    results.innerHTML = `
      <p class="search-label">${matches.length} product${matches.length !== 1 ? 's' : ''} found</p>
      <div class="search-result-grid">
        ${matches.slice(0, 8).map(p => `
          <div class="search-result-card" tabindex="0" role="button" data-product-id="${escapeHtml(p.id)}" aria-label="View ${escapeHtml(p.name)}">
            <div class="search-result-img">
              <img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async" width="180" height="135"
                onerror="this.style.display='none'">
            </div>
            <div class="search-result-body">
              <p class="search-result-name">${highlight(p.name, query)}</p>
              <p class="search-result-price">${formatPrice(p.price)}</p>
            </div>
          </div>`).join('')}
      </div>`;

    // Click result → open quick view
    results.querySelectorAll('.search-result-card').forEach(card => {
      const activate = () => {
        const id = card.dataset.productId;
        const prod = PRODUCTS.find(p => p.id === id);
        if (prod) { closeSearch(); openQuickView(prod); }
      };
      card.addEventListener('click', activate);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') activate(); });
    });
  }, 220);

  input?.addEventListener('input', () => {
    const q = input.value;
    clearBtn.hidden = !q;
    doSearch(q);
  });
  clearBtn?.addEventListener('click', () => { input.value = ''; clearBtn.hidden = true; input.focus(); doSearch(''); });

  // Popular chips
  chips?.addEventListener('click', e => {
    const chip = e.target.closest('.search-chip');
    if (!chip) return;
    input.value = chip.dataset.query;
    clearBtn.hidden = false;
    doSearch(chip.dataset.query);
    addRecentSearch(chip.dataset.query);
  });

  // Recent searches
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
        clearBtn.hidden = false;
        doSearch(chip.dataset.query);
      });
    });
  }

  // Handle form submit (Enter key)
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) {
      addRecentSearch(input.value.trim());
    }
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
    if (!wrapper.contains(e.target)) { wrapper.classList.remove('is-open'); btn?.setAttribute('aria-expanded', 'false'); }
  });
  dropdown?.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      STATE.currency = li.dataset.currency;
      if (label) label.textContent = STATE.currency;
      Storage.set(CURRENCY_KEY, STATE.currency);
      wrapper.classList.remove('is-open');
      btn?.setAttribute('aria-expanded', 'false');
      // update all prices on page
      renderCatalogue();
      updateCartUI();
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   REVEAL ANIMATIONS
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
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

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

/* ══════════════════════════════════════════════════════════════
   HERO ENTRANCE
══════════════════════════════════════════════════════════════ */
function initHero() {
  const content = $('#hero-content');
  if (!content) return;
  // Trigger after a tiny delay so the page has painted
  setTimeout(() => content.classList.add('hero-animated'), 100);
}

/* ══════════════════════════════════════════════════════════════
   PREMIUM MOTION
══════════════════════════════════════════════════════════════ */
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
   CATALOGUE — rendering, filtering, sorting
══════════════════════════════════════════════════════════════ */
function initCatalogue() {
  if (typeof PRODUCTS === 'undefined') return;

  // Load saved preferences
  const savedCols = Storage.get('regongches-grid-cols', 3);
  STATE.gridCols = savedCols;

  const grid        = $('#product-grid');
  const skeleton    = $('#skeleton-grid');
  const empty       = $('#catalogue-empty');
  const countEl     = $('#result-count');
  const appliedEl   = $('#applied-filters');
  const catChips    = $$('[data-filter-category]', $('#category-filter-chips'));
  const regionSel   = $('#region-filter');
  const statusSel   = $('#status-filter');
  const sortSel     = $('#sort-select');
  const densityBtns = $$('.density-btn');
  const clearAllBtn = $('#clear-all-filters');
  const viewAllBtn  = $('#view-all-btn');
  if (!grid) return;

  // Skeleton shimmer for 400ms
  setTimeout(() => { if (skeleton) skeleton.style.display = 'none'; renderCatalogue(); }, 400);

  // Category chip filter
  catChips.forEach(chip => {
    chip.addEventListener('click', () => {
      catChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      STATE.activeFilters.category = chip.dataset.filterCategory || '';
      STATE.activeFilters.badge = '';
      renderCatalogue();
    });
  });

  // Region / status / sort selects
  regionSel?.addEventListener('change', () => { STATE.activeFilters.region = regionSel.value; renderCatalogue(); });
  statusSel?.addEventListener('change', () => { STATE.activeFilters.status = statusSel.value; renderCatalogue(); });
  sortSel?.addEventListener('change',   () => { STATE.activeFilters.sort   = sortSel.value;   renderCatalogue(); });

  // Grid density
  densityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      densityBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      const cols = parseInt(btn.dataset.cols);
      STATE.gridCols = cols;
      Storage.set('regongches-grid-cols', cols);
      grid.className = `product-grid product-grid--${cols}`;
    });
  });

  // Clear all
  clearAllBtn?.addEventListener('click', clearAllFilters);
  viewAllBtn?.addEventListener('click', () => {
    clearAllFilters();
    viewAllBtn.style.display = 'none';
  });

  // Category + region + badge links from around the page
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-filter-category],[data-filter-region],[data-filter-badge]');
    if (!link || !link.getAttribute('href')?.includes('#catalogue')) return;
    e.preventDefault();

    if (link.dataset.filterCategory !== undefined) STATE.activeFilters.category = link.dataset.filterCategory;
    if (link.dataset.filterRegion   !== undefined) STATE.activeFilters.region   = link.dataset.filterRegion;
    if (link.dataset.filterBadge    !== undefined) STATE.activeFilters.badge    = link.dataset.filterBadge;

    // Sync chip UI
    catChips.forEach(c => {
      const match = c.dataset.filterCategory === STATE.activeFilters.category;
      c.classList.toggle('active', match);
    });
    if (regionSel && link.dataset.filterRegion !== undefined) regionSel.value = STATE.activeFilters.region;

    renderCatalogue();
    document.querySelector('#catalogue')?.scrollIntoView({ behavior: 'smooth' });
  });

  function clearAllFilters() {
    STATE.activeFilters = { category: '', region: '', status: '', sort: 'featured', badge: '' };
    catChips.forEach(c => c.classList.toggle('active', c.dataset.filterCategory === ''));
    if (regionSel) regionSel.value = '';
    if (statusSel) statusSel.value = '';
    if (sortSel)   sortSel.value   = 'featured';
    renderCatalogue();
  }

  // Initial render (called after skeleton)
  window.renderCatalogue = renderCatalogue;
  function renderCatalogue() {
    if (!grid) return;
    let products = [...PRODUCTS];

    // Filter
    const { category, region, status, sort, badge } = STATE.activeFilters;
    if (category) products = products.filter(p => p.category === category);
    if (region)   products = products.filter(p => p.region   === region);
    if (status)   products = products.filter(p => p.status   === status);
    if (badge === 'new') products = products.filter(p => p.isNew);
    if (badge === 'bestseller') products = products.filter(p => p.isBestseller);

    // Sort
    if (sort === 'newest')      products = products.sort((a, b) => b.isNew - a.isNew);
    if (sort === 'price-asc')   products = products.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc')  products = products.sort((a, b) => b.price - a.price);
    if (sort === 'featured')    products = products.sort((a, b) => b.isBestseller - a.isBestseller);

    // Result count
    if (countEl) countEl.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;

    // Applied filters chips
    renderAppliedFilters();

    // Empty state
    if (!products.length) {
      grid.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    // Render cards
    grid.className = `product-grid product-grid--${STATE.gridCols}`;
    grid.innerHTML = products.map(p => renderProductCard(p)).join('');

    // Bind card events
    bindCardEvents(grid);
  }

  function renderAppliedFilters() {
    if (!appliedEl) return;
    const { category, region, status, badge } = STATE.activeFilters;
    const chips = [];
    if (category) chips.push({ label: `Category: ${category}`, key: 'category' });
    if (region)   chips.push({ label: `Region: ${region}`,     key: 'region' });
    if (status)   chips.push({ label: `Status: ${status}`,     key: 'status' });
    if (badge)    chips.push({ label: `New arrivals`,          key: 'badge' });

    if (!chips.length) { appliedEl.hidden = true; return; }
    appliedEl.hidden = false;
    appliedEl.innerHTML = chips.map(chip => `
      <div class="applied-chip">
        ${escapeHtml(chip.label)}
        <button class="applied-chip-remove" data-filter-key="${chip.key}" aria-label="Remove filter ${escapeHtml(chip.label)}">
          <i class="ph ph-x" aria-hidden="true"></i>
        </button>
      </div>
    `).join('') + `<button class="clear-all-btn">Clear all</button>`;

    appliedEl.querySelectorAll('.applied-chip-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        STATE.activeFilters[btn.dataset.filterKey] = '';
        if (btn.dataset.filterKey === 'category') {
          catChips.forEach(c => c.classList.toggle('active', c.dataset.filterCategory === ''));
        }
        if (btn.dataset.filterKey === 'region' && regionSel) regionSel.value = '';
        if (btn.dataset.filterKey === 'status' && statusSel) statusSel.value = '';
        renderCatalogue();
      });
    });
    appliedEl.querySelector('.clear-all-btn')?.addEventListener('click', clearAllFilters);
  }
}

/* ── Product card HTML ── */
function renderProductCard(p) {
  const wished = (STATE.wishlist || []).some(w => w.id === p.id);
  const statusClass = {
    'Available':     'card-status--available',
    'Made-to-Order': 'card-status--made-to-order',
    'Low Stock':     'card-status--low-stock',
  }[p.status] || '';

  const imgSrc  = p.images?.[0] || '';
  const imgHov  = p.images?.[1] || imgSrc;
  const catKey  = p.category?.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-') || 'clothing';
  const cssClass= `card-img-css--${catKey.split('-')[0]}`;

  const imgHtml = imgSrc
    ? `<img class="card-img" src="${escapeHtml(imgSrc)}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async" width="400" height="500"
         onerror="this.closest('.card-img-wrap').querySelector('.card-img-css').style.display='flex'; this.style.display='none'">
       <img class="card-img-hover" src="${escapeHtml(imgHov)}" alt="" aria-hidden="true" loading="lazy" decoding="async" width="400" height="500"
         onerror="this.style.display='none'">
       <div class="card-img-css ${cssClass}" style="display:none" aria-hidden="true">
         <i class="ph ph-image" aria-hidden="true"></i>${escapeHtml(p.name)}
       </div>`
    : `<div class="card-img-css ${cssClass}" aria-hidden="true"><i class="ph ph-image" aria-hidden="true"></i>${escapeHtml(p.name)}</div>`;

  return `
    <div class="product-card" role="listitem" data-product-id="${escapeHtml(p.id)}">
      <div class="card-img-wrap">
        ${imgHtml}
        <div class="card-badges">
          <span class="badge badge--region">${escapeHtml(p.region)}</span>
          ${p.handmade ? `<span class="badge badge--handmade">${escapeHtml(p.handmadeLabel)}</span>` : ''}
          ${p.isNew        ? `<span class="badge badge--new">New</span>` : ''}
          ${p.isBestseller ? `<span class="badge badge--bestseller">Bestseller</span>` : ''}
        </div>
        <button class="card-wishlist-btn ${wished ? 'is-wishlisted' : ''}"
          aria-label="${wished ? 'Remove from wishlist' : 'Add to wishlist'}"
          data-wishlist-id="${escapeHtml(p.id)}">
          <i class="ph${wished ? '-fill' : ''} ph-heart" aria-hidden="true"></i>
        </button>
        <button class="card-quick-add" data-quickadd-id="${escapeHtml(p.id)}" aria-label="Quick add ${escapeHtml(p.name)} to cart">
          <i class="ph ph-shopping-bag" aria-hidden="true"></i> Quick Add
        </button>
      </div>
      <div class="card-body">
        <p class="card-region-line">${escapeHtml(p.region)} · ${p.handmade ? escapeHtml(p.handmadeLabel) : 'Textile'}</p>
        <h3 class="card-name">
          <button class="qv-trigger" data-product-id="${escapeHtml(p.id)}" style="background:none;border:none;cursor:pointer;text-align:left;font:inherit;font-family:var(--f-heading);font-size:inherit;line-height:inherit;padding:0;width:100%">
            ${escapeHtml(p.name)}
          </button>
        </h3>
        <div class="card-price-row">
          <span class="card-price">${formatPrice(p.price)}</span>
          ${p.compareAtPrice ? `<span class="card-compare">${formatPrice(p.compareAtPrice)}</span>` : ''}
          <span class="card-status ${statusClass}" aria-label="Availability: ${escapeHtml(p.status)}">${escapeHtml(p.status)}</span>
        </div>
        <p class="card-verified">
          <i class="ph ph-seal-check" aria-hidden="true"></i> Verified origin
        </p>
      </div>
    </div>`;
}

function bindCardEvents(container) {
  // Quick view
  container.querySelectorAll('.qv-trigger, [data-product-id]').forEach(el => {
    const productId = el.dataset.productId;
    if (!productId) return;
    el.addEventListener('click', () => {
      const prod = PRODUCTS.find(p => p.id === productId);
      if (prod) openQuickView(prod);
    });
  });

  // Quick add
  container.querySelectorAll('[data-quickadd-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const prod = PRODUCTS.find(p => p.id === btn.dataset.quickaddId);
      if (!prod) return;
      Cart.add(prod, 1, prod.sizes?.[0] || 'One Size', prod.colors?.[0]?.label || '');
    });
  });

  // Wishlist
  container.querySelectorAll('[data-wishlist-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      Wishlist.toggle(btn.dataset.wishlistId, btn);
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   QUICK VIEW MODAL
══════════════════════════════════════════════════════════════ */
let releaseQVTrap;

function openQuickView(product) {
  STATE.quickViewProduct = product;
  const overlay = $('#quickview-overlay');
  if (!overlay) return;

  // Track recently viewed
  addRecentlyViewed(product);

  // Populate
  const wished = STATE.wishlist.some(w => w.id === product.id);

  // Badges
  const badges = $('#qv-badges');
  if (badges) badges.innerHTML = `
    <span class="badge badge--region">${escapeHtml(product.region)}</span>
    ${product.handmade ? `<span class="badge badge--handmade">${escapeHtml(product.handmadeLabel)}</span>` : ''}
    ${product.isNew ? `<span class="badge badge--new">New</span>` : ''}`;

  // Name, region, price
  const nameEl   = $('#qv-product-name'); if (nameEl) nameEl.textContent = product.name;
  const regionEl = $('#qv-region-line');  if (regionEl) regionEl.textContent = `${product.region} · ${product.handmadeLabel || 'Textile'}`;
  const priceRow = $('#qv-price-row');
  if (priceRow) priceRow.innerHTML = `
    <span class="qv-price">${formatPrice(product.price)}</span>
    ${product.compareAtPrice ? `<span class="qv-compare">${formatPrice(product.compareAtPrice)}</span>` : ''}`;

  const statusEl = $('#qv-status');
  if (statusEl) {
    const cls = { 'Available': 'card-status--available', 'Made-to-Order': 'card-status--made-to-order', 'Low Stock': 'card-status--low-stock' }[product.status] || '';
    statusEl.innerHTML = `<span class="card-status ${cls}">${escapeHtml(product.status)}</span>`;
  }

  // Gallery
  const mainImg = $('#qv-main-img');
  const thumbs  = $('#qv-thumbs');
  if (mainImg) {
    mainImg.src = product.images?.[0] || '';
    mainImg.alt = product.name;
    mainImg.onerror = function() { this.style.display = 'none'; };
  }
  if (thumbs) {
    thumbs.innerHTML = (product.images || []).map((src, i) => `
      <button class="qv-thumb ${i === 0 ? 'active' : ''}" aria-label="View image ${i + 1}" data-img="${escapeHtml(src)}">
        <img src="${escapeHtml(src)}" alt="" loading="lazy" decoding="async" width="60" height="60"
          onerror="this.style.display='none'">
      </button>`).join('');
    thumbs.querySelectorAll('.qv-thumb').forEach(t => {
      t.addEventListener('click', () => {
        thumbs.querySelectorAll('.qv-thumb').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        if (mainImg) { mainImg.src = t.dataset.img; mainImg.style.display = ''; }
      });
    });
  }

  // Colors
  const colorWrap   = $('#qv-colors-wrap');
  const colorSwatches = $('#qv-color-swatches');
  const selColorLabel = $('#qv-selected-color');
  let selectedColor = product.colors?.[0]?.label || '';
  if (colorSwatches && product.colors?.length) {
    colorWrap.style.display = '';
    colorSwatches.innerHTML = product.colors.map((c, i) => `
      <button class="color-swatch ${i === 0 ? 'is-selected' : ''}"
        style="background:${escapeHtml(c.hex)}"
        title="${escapeHtml(c.label)}"
        aria-label="${escapeHtml(c.label)}"
        data-color-label="${escapeHtml(c.label)}">
      </button>`).join('');
    if (selColorLabel) selColorLabel.textContent = selectedColor;
    colorSwatches.querySelectorAll('.color-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        colorSwatches.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('is-selected'));
        sw.classList.add('is-selected');
        selectedColor = sw.dataset.colorLabel;
        if (selColorLabel) selColorLabel.textContent = selectedColor;
      });
    });
  } else if (colorWrap) { colorWrap.style.display = 'none'; }

  // Sizes
  const sizeWrap    = $('#qv-sizes-wrap');
  const sizeBtns    = $('#qv-size-buttons');
  const selSizeLabel= $('#qv-selected-size');
  let selectedSize  = product.sizes?.[0] || '';
  if (sizeBtns && product.sizes?.length) {
    sizeWrap.style.display = '';
    sizeBtns.innerHTML = product.sizes.map((s, i) => `
      <button class="size-btn ${i === 0 ? 'is-selected' : ''}"
        aria-pressed="${i === 0 ? 'true' : 'false'}"
        data-size="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('');
    if (selSizeLabel) selSizeLabel.textContent = selectedSize;
    sizeBtns.querySelectorAll('.size-btn').forEach(b => {
      b.addEventListener('click', () => {
        sizeBtns.querySelectorAll('.size-btn').forEach(x => { x.classList.remove('is-selected'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('is-selected');
        b.setAttribute('aria-pressed', 'true');
        selectedSize = b.dataset.size;
        if (selSizeLabel) selSizeLabel.textContent = selectedSize;
      });
    });
  } else if (sizeWrap) { sizeWrap.style.display = 'none'; }

  // Qty stepper
  let qty = 1;
  const qtyVal = $('#qv-qty-val');
  $('#qv-qty-inc')?.addEventListener('click', () => { qty = Math.min(qty + 1, 10); if (qtyVal) qtyVal.textContent = qty; });
  $('#qv-qty-dec')?.addEventListener('click', () => { qty = Math.max(qty - 1, 1);  if (qtyVal) qtyVal.textContent = qty; });
  if (qtyVal) qtyVal.textContent = qty;

  // Add to cart btn
  const addBtn = $('#qv-add-btn');
  if (addBtn) {
    addBtn.onclick = () => {
      Cart.add(product, qty, selectedSize, selectedColor);
      closeQuickView();
    };
  }

  // Accordions content
  const matEl   = $('#qv-materials'); if (matEl) matEl.textContent = product.materials || 'Information pending review.';
  const careEl  = $('#qv-care');      if (careEl)  careEl.textContent = product.care || 'Care information pending review.';
  const storyEl = $('#qv-story');     if (storyEl) storyEl.textContent = product.shortStory || 'Cultural context pending review.';

  // WhatsApp link
  const waLink = $('#qv-whatsapp-link');
  if (waLink) {
    const msg = `Hi ReGongches, I'd like to ask about the product: ${product.name} (${product.region})`;
    waLink.href = `https://wa.me/923001234567?text=${encodeURIComponent(msg)}`;
  }

  // Open overlay
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
}

/* ══════════════════════════════════════════════════════════════
   CART
══════════════════════════════════════════════════════════════ */
const Cart = (() => {

  function load()   { STATE.cart = Storage.get(CART_KEY, []); }
  function save()   { Storage.set(CART_KEY, STATE.cart); }
  function total()  { return STATE.cart.reduce((s, i) => s + i.price * i.qty, 0); }
  function count()  { return STATE.cart.reduce((s, i) => s + i.qty, 0); }

  function add(product, qty = 1, size = '', color = '') {
    const key = `${product.id}__${size}__${color}`;
    const existing = STATE.cart.find(i => i.key === key);
    if (existing) { existing.qty += qty; }
    else {
      STATE.cart.push({
        key,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        category: product.category,
        size, color, qty
      });
    }
    save();
    updateCartUI();
    Toast.show(`"${product.name}" added to cart`, 'cart');
    // Animate badge
    const badge = $('#cart-badge');
    badge?.classList.remove('bounce');
    void badge?.offsetWidth;
    badge?.classList.add('bounce');
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
      <button class="cart-undo-btn">Undo</button>`;
    wrap.prepend(bar);
    const timer = setTimeout(() => bar.remove(), 5000);
    bar.querySelector('.cart-undo-btn').addEventListener('click', () => {
      clearTimeout(timer);
      STATE.cart.unshift(item);
      save();
      bar.remove();
      updateCartUI();
    });
  }

  return { load, save, add, remove, updateQty, total, count };
})();

function updateCartUI() {
  const countBadge = $('#cart-badge');
  const tabBadge   = $('#tab-cart-badge');
  const subtotalEl = $('#cart-subtotal-val');
  const wrap       = $('#cart-items-wrap');
  const freeBar    = $('#fdbar-fill');
  const freeLabel  = $('#fdbar-label');

  const cnt = Cart.count();
  const tot = Cart.total();
  if (countBadge) countBadge.textContent = cnt;
  if (tabBadge)   tabBadge.textContent   = cnt;
  if (subtotalEl) subtotalEl.textContent  = formatPrice(tot);

  // Free delivery bar
  const threshold = FREE_DELIVERY_THRESHOLD;
  const pct = Math.min(100, (tot / threshold) * 100);
  if (freeBar)  freeBar.style.width = `${pct}%`;
  if (freeLabel) {
    if (tot >= threshold) freeLabel.textContent = '🎉 You have free delivery!';
    else freeLabel.textContent = `Add ${formatPrice(threshold - tot)} more for free delivery`;
  }

  // Cart items
  if (!wrap) return;
  if (!STATE.cart.length) {
    wrap.innerHTML = `<div class="cart-empty-msg">
      <i class="ph ph-shopping-bag" aria-hidden="true"></i>
      <p>Your cart is empty.</p>
      <p style="font-size:.85rem;margin-top:.5rem;opacity:.65">Add products from the shop to get started.</p>
    </div>`;
    return;
  }

  wrap.innerHTML = STATE.cart.map(item => {
    const catKey = (item.category || 'clothing').toLowerCase().replace(/\s*&\s*/g,'-').replace(/\s+/g,'-');
    const cssClass = `card-img-css--${catKey.split('-')[0]}`;
    const imgHtml = item.image
      ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" width="70" height="88"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`
      : '';
    return `
      <div class="cart-item" data-cart-key="${escapeHtml(item.key)}">
        <div class="cart-item-img">
          ${imgHtml}
          <div class="cart-item-css-img ${cssClass}" style="${item.image ? 'display:none' : ''}">
            <i class="ph ph-image" aria-hidden="true"></i>
          </div>
        </div>
        <div>
          <p class="cart-item-name">${escapeHtml(item.name)}</p>
          <p class="cart-item-variant">${[item.size, item.color].filter(Boolean).join(' · ')}</p>
          <div class="cart-item-controls">
            <button class="cart-qty-btn" data-action="dec" aria-label="Decrease quantity">−</button>
            <span class="cart-qty-val">${item.qty}</span>
            <button class="cart-qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
          </div>
          <button class="cart-remove-btn" data-action="remove" aria-label="Remove ${escapeHtml(item.name)} from cart">Remove</button>
        </div>
        <div>
          <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
        </div>
      </div>`;
  }).join('');

  // Bind item controls
  wrap.querySelectorAll('.cart-item').forEach(el => {
    const key = el.dataset.cartKey;
    el.querySelector('[data-action="inc"]')?.addEventListener('click', () => Cart.updateQty(key, +1));
    el.querySelector('[data-action="dec"]')?.addEventListener('click', () => Cart.updateQty(key, -1));
    el.querySelector('[data-action="remove"]')?.addEventListener('click', () => Cart.remove(key));
  });

  // Upsell strip
  renderCartUpsell();
}

function renderCartUpsell() {
  const grid = $('#cart-upsell-grid');
  if (!grid || typeof PRODUCTS === 'undefined') return;
  const inCart = STATE.cart.map(i => i.id);
  const suggestions = PRODUCTS.filter(p => !inCart.includes(p.id)).slice(0, 2);
  if (!suggestions.length) { $('#cart-upsell').style.display = 'none'; return; }
  grid.innerHTML = suggestions.map(p => {
    const catKey = (p.category || 'clothing').toLowerCase().replace(/\s*&\s*/g,'-').replace(/\s+/g,'-');
    return `<div class="upsell-card" data-quickadd-id="${escapeHtml(p.id)}" role="button" tabindex="0" aria-label="Add ${escapeHtml(p.name)} to cart">
      <div class="upsell-img ${`card-img-css--${catKey.split('-')[0]}`}">
        <img src="${escapeHtml(p.images?.[0] || '')}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async" width="120" height="90"
          onerror="this.style.display='none'">
      </div>
      <div class="upsell-body">
        <p class="upsell-name">${escapeHtml(p.name)}</p>
        <p class="upsell-price">${formatPrice(p.price)}</p>
      </div>
    </div>`;
  }).join('');
  grid.querySelectorAll('.upsell-card').forEach(card => {
    const act = () => { const prod = PRODUCTS.find(p => p.id === card.dataset.quickaddId); if (prod) Cart.add(prod, 1, prod.sizes?.[0] || '', prod.colors?.[0]?.label || ''); };
    card.addEventListener('click', act);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') act(); });
  });
}

let cartReleaseTrap;
function openCart() {
  const drawer  = $('#cart-drawer');
  const backdrop= $('#drawer-backdrop');
  if (!drawer) return;
  drawer.classList.add('is-open');
  backdrop.classList.add('is-visible');
  drawer.setAttribute('aria-hidden', 'false');
  lockScroll();
  cartReleaseTrap = trapFocus(drawer);
  updateCartUI();
}
function closeCart() {
  const drawer  = $('#cart-drawer');
  const backdrop= $('#drawer-backdrop');
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
      if ($('#cart-drawer')?.classList.contains('is-open'))    closeCart();
      if ($('#wishlist-drawer')?.classList.contains('is-open')) closeWishlist();
    }
  });

  // Gift wrap
  $('#gift-wrap-toggle')?.addEventListener('change', e => {
    const sub = $('#cart-subtotal-val');
    if (sub) {
      const tot = Cart.total() + (e.target.checked ? GIFT_WRAP_PRICE : 0);
      sub.textContent = formatPrice(tot);
    }
  });

  // Checkout button → open checkout modal
  $('#checkout-btn')?.addEventListener('click', () => {
    if (!STATE.cart.length) { Toast.show('Your cart is empty', 'error'); return; }
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

  function toggle(productId, btnEl) {
    const idx = STATE.wishlist.findIndex(w => w.id === productId);
    const product = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === productId) : null;
    if (idx !== -1) {
      STATE.wishlist.splice(idx, 1);
      Toast.show('Removed from wishlist', 'info');
    } else {
      if (product) STATE.wishlist.push({ id: product.id, name: product.name, price: product.price, image: product.images?.[0] || '' });
      Toast.show('Added to wishlist', 'success');
    }
    save();
    updateWishlistBadge();
    updateWishlistBtn(productId);
    // Update all heart buttons for this product in the catalogue
    $$(`[data-wishlist-id="${productId}"]`).forEach(b => updateWishlistBtn(productId, b));
  }

  function updateWishlistBtn(id, btn) {
    const buttons = btn ? [btn] : $$(`[data-wishlist-id="${id}"]`);
    const wished = STATE.wishlist.some(w => w.id === id);
    buttons.forEach(b => {
      b.classList.toggle('is-wishlisted', wished);
      b.setAttribute('aria-label', wished ? 'Remove from wishlist' : 'Add to wishlist');
      const icon = b.querySelector('i');
      if (icon) {
        icon.className = `ph${wished ? '-fill' : ''} ph-heart`;
      }
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
  const drawer  = $('#wishlist-drawer');
  const backdrop= $('#drawer-backdrop');
  if (!drawer) return;
  renderWishlistItems();
  drawer.classList.add('is-open');
  backdrop.classList.add('is-visible');
  drawer.setAttribute('aria-hidden', 'false');
  lockScroll();
  wishlistReleaseTrap = trapFocus(drawer);
}
function closeWishlist() {
  const drawer  = $('#wishlist-drawer');
  const backdrop= $('#drawer-backdrop');
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
  wrap.innerHTML = STATE.wishlist.map(item => `
    <div class="wishlist-item" data-wishlist-key="${escapeHtml(item.id)}">
      <div class="wishlist-item-img">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" width="64" height="80"
          onerror="this.style.display='none'">
      </div>
      <div>
        <p class="wishlist-item-name">${escapeHtml(item.name)}</p>
        <p class="wishlist-item-price">${formatPrice(item.price)}</p>
        <button class="wishlist-add-cart-btn" data-wishlist-cart="${escapeHtml(item.id)}">Add to Cart</button>
      </div>
      <button class="wishlist-remove-btn" aria-label="Remove ${escapeHtml(item.name)} from wishlist" data-wishlist-remove="${escapeHtml(item.id)}">
        <i class="ph ph-x" aria-hidden="true"></i>
      </button>
    </div>`).join('');

  wrap.querySelectorAll('[data-wishlist-remove]').forEach(btn => {
    btn.addEventListener('click', () => { Wishlist.toggle(btn.dataset.wishlistRemove); renderWishlistItems(); });
  });
  wrap.querySelectorAll('[data-wishlist-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prod = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === btn.dataset.wishlistCart) : null;
      if (prod) { Cart.add(prod, 1, prod.sizes?.[0] || '', prod.colors?.[0]?.label || ''); closeWishlist(); openCart(); }
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
      <h2 class="section-title" style="text-align:left;font-size:var(--fs-2xl)">Recently Viewed</h2>
      <div class="recently-viewed-grid product-grid product-grid--4">
        ${STATE.recentlyViewed.map(p => renderProductCard(p)).join('')}
      </div>
    </div>`;
  bindCardEvents(section);
}

/* ══════════════════════════════════════════════════════════════
   CHECKOUT MODAL
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

  // Update progress
  $$('.cp-step').forEach(s => {
    const sNum = parseInt(s.dataset.step);
    s.classList.toggle('active', sNum === n);
    s.classList.toggle('done',   sNum < n);
    s.setAttribute('aria-current', sNum === n ? 'step' : 'false');
  });
  $$('.cp-line').forEach((l, i) => l.classList.toggle('done', i + 1 < n));

  const title = $('#checkout-title');
  if (title && n === 1) title.textContent = 'Contact & Delivery';

  // Populate review step
  if (n === 3) renderOrderReview();

  // Focus first input in step
  setTimeout(() => {
    $(`#checkout-step-${n} input, #checkout-step-${n} select`)?.focus();
  }, 100);
}

function validateStep1() {
  const fields = [
    { id: 'co-name',    errId: 'co-name-error',    label: 'Full Name',         rule: v => v.trim().length >= 2 },
    { id: 'co-phone',   errId: 'co-phone-error',   label: 'Phone',             rule: v => /^\d{10,11}$/.test(v.replace(/\s/g,'')) },
    { id: 'co-city',    errId: 'co-city-error',    label: 'City',              rule: v => v !== '' },
    { id: 'co-address', errId: 'co-address-error', label: 'Delivery Address',  rule: v => v.trim().length >= 10 },
  ];
  let valid = true;
  fields.forEach(f => {
    const el  = $(`#${f.id}`);
    const err = $(`#${f.errId}`);
    if (!el || !err) return;
    const ok = f.rule(el.value);
    el.classList.toggle('is-error', !ok);
    err.textContent = ok ? '' : `Please enter a valid ${f.label}.`;
    if (!ok) { valid = false; el.focus(); }
  });
  if (valid) {
    STATE.checkoutData.name    = $('#co-name')?.value;
    STATE.checkoutData.phone   = $('#co-phone')?.value;
    STATE.checkoutData.city    = $('#co-city')?.value;
    STATE.checkoutData.address = $('#co-address')?.value;
  }
  return valid;
}

function renderOrderReview() {
  const itemsEl   = $('#order-review-items');
  const summaryEl = $('#order-review-summary');
  if (!itemsEl || !summaryEl) return;

  itemsEl.innerHTML = STATE.cart.map(item => `
    <div class="order-review-item">
      <div class="order-review-img">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async" width="56" height="70"
          onerror="this.style.display='none'">
      </div>
      <div>
        <p style="font-weight:600">${escapeHtml(item.name)}</p>
        <p style="font-size:.8rem;opacity:.6">${[item.size,item.color].filter(Boolean).join(' · ')} × ${item.qty}</p>
      </div>
      <span style="font-weight:700">${formatPrice(item.price * item.qty)}</span>
    </div>`).join('');

  const giftwrap = $('#gift-wrap-toggle')?.checked ? GIFT_WRAP_PRICE : 0;
  const subtotal = Cart.total();
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 200;
  const total    = subtotal + giftwrap + delivery;
  const method   = document.querySelector('input[name="payment"]:checked')?.value || 'COD';
  const payLabel = { COD: 'Cash on Delivery', Bank: 'Bank Transfer', Digital: 'Digital Wallet' }[method] || method;

  summaryEl.innerHTML = `
    <div class="order-review-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
    ${giftwrap ? `<div class="order-review-row"><span>Gift wrapping</span><span>${formatPrice(giftwrap)}</span></div>` : ''}
    <div class="order-review-row"><span>Delivery</span><span>${delivery === 0 ? 'Free' : formatPrice(delivery)}</span></div>
    <div class="order-review-row"><span>Payment method</span><span>${escapeHtml(payLabel)}</span></div>
    <div class="order-review-row"><span>Delivery to</span><span>${escapeHtml(STATE.checkoutData.city || '')} — ${escapeHtml(STATE.checkoutData.name || '')}</span></div>
    <div class="order-review-row total"><span>Total</span><span>${formatPrice(total)}</span></div>`;
}

function placeOrder() {
  const orderId = `RG-${Date.now().toString(36).toUpperCase()}`;
  STATE.cart = [];
  Cart.save();
  updateCartUI();

  const numEl = $('#order-num');
  if (numEl) numEl.textContent = `Demo order reference: ${orderId}`;

  const waBtn = $('#order-whatsapp-btn');
  if (waBtn) {
    const msg = `Hi ReGongches, I just placed a demo order. Reference: ${orderId}. Name: ${STATE.checkoutData.name || 'N/A'}, Phone: ${STATE.checkoutData.phone || 'N/A'}, City: ${STATE.checkoutData.city || 'N/A'}`;
    waBtn.href = `https://wa.me/923001234567?text=${encodeURIComponent(msg)}`;
  }
  goToCheckoutStep(4);
}

function initCheckout() {
  // Navigation buttons
  $('#co-step1-next')?.addEventListener('click', () => { if (validateStep1()) goToCheckoutStep(2); });
  $('#co-step2-back')?.addEventListener('click', () => goToCheckoutStep(1));
  $('#co-step2-next')?.addEventListener('click', () => goToCheckoutStep(3));
  $('#co-step3-back')?.addEventListener('click', () => goToCheckoutStep(2));
  $('#co-place-order')?.addEventListener('click', placeOrder);
  $('#order-close-btn')?.addEventListener('click', closeCheckout);
  $('#checkout-close')?.addEventListener('click', closeCheckout);
  $('#checkout-overlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeCheckout(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#checkout-overlay')?.classList.contains('is-open')) closeCheckout(); });

  // Inline validation on blur
  ['co-name','co-phone','co-city','co-address'].forEach(id => {
    const el = $(`#${id}`);
    el?.addEventListener('blur', () => el.classList.toggle('is-error', !el.value.trim()));
  });
}

/* ══════════════════════════════════════════════════════════════
   CUSTOM ORDER MODAL
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
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#custom-order-overlay')?.classList.contains('is-open')) closeCustomOrder(); });

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
      if (!ok) { valid = false; el.focus(); }
    });
    if (!valid) return;
    closeCustomOrder();
    Toast.show('Your custom order request has been submitted. We\'ll contact you within 1–2 business days.', 'success', 6000);
    e.target.reset();
  });
}

/* ══════════════════════════════════════════════════════════════
   JOURNAL
══════════════════════════════════════════════════════════════ */
function initJournal() {
  if (typeof JOURNAL_ARTICLES === 'undefined') return;
  const grid = $('#journal-grid');
  if (!grid) return;

  const categoryColor = { Craft: 'var(--c-blue)', Care: '#2d5a3d', Culture: 'var(--c-maroon)' };

  grid.innerHTML = JOURNAL_ARTICLES.map((article, i) => {
    const cssClass = `journal-img-css--${(article.category || 'craft').toLowerCase()}`;
    return `
      <article class="journal-card">
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
          <a href="#" class="read-more">Read Article <i class="ph ph-arrow-right" aria-hidden="true"></i></a>
        </div>
      </article>`;
  }).join('');
}

/* ══════════════════════════════════════════════════════════════
   REGION EXPLORER
══════════════════════════════════════════════════════════════ */
function initRegions() {
  if (typeof REGIONS === 'undefined') return;

  // Desktop explorer
  const tabsEl   = $('#region-tabs');
  const panelsEl = $('#region-panels');
  if (tabsEl && panelsEl) {
    tabsEl.innerHTML = REGIONS.map((r, i) => `
      <button class="region-tab-btn ${i === 0 ? 'is-active' : ''}"
        role="tab" aria-selected="${i === 0}" aria-controls="region-panel-${i}"
        id="region-tab-${i}" data-tab="${i}">
        ${escapeHtml(r.name)} <i class="ph ph-caret-right" aria-hidden="true"></i>
      </button>`).join('');

    panelsEl.innerHTML = REGIONS.map((r, i) => `
      <div class="region-panel ${i === 0 ? 'is-active' : ''}" id="region-panel-${i}"
        role="tabpanel" aria-labelledby="region-tab-${i}">
        <div class="region-panel-img"></div>
        <p class="region-panel-crafts">${escapeHtml(r.crafts)}</p>
        <h3>${escapeHtml(r.name)}</h3>
        <p>${escapeHtml(r.description)}</p>
        <a href="#catalogue" data-filter-region="${escapeHtml(r.name)}" class="btn btn-primary">
          Shop ${escapeHtml(r.name)} <i class="ph ph-arrow-right" aria-hidden="true"></i>
        </a>
      </div>`).join('');

    tabsEl.querySelectorAll('.region-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsEl.querySelectorAll('.region-tab-btn').forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
        panelsEl.querySelectorAll('.region-panel').forEach(p => p.classList.remove('is-active'));
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        panelsEl.querySelector(`#region-panel-${btn.dataset.tab}`)?.classList.add('is-active');
      });
    });
  }

  // Mobile pills
  const pillsEl = $('#region-pills');
  if (pillsEl) {
    pillsEl.innerHTML = REGIONS.map(r => `
      <a href="#catalogue" class="region-pill" data-filter-region="${escapeHtml(r.name)}">${escapeHtml(r.name)}</a>`
    ).join('');
  }
}

/* ══════════════════════════════════════════════════════════════
   REVIEWS CAROUSEL
══════════════════════════════════════════════════════════════ */
function initReviews() {
  const carousel = $('#reviews-carousel');
  const prevBtn  = $('#reviews-prev');
  const nextBtn  = $('#reviews-next');
  const dotsEl   = $('#reviews-dots');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.review-card');
  let current = 0;

  // Create dots
  if (dotsEl) {
    dotsEl.innerHTML = [...slides].map((_, i) => `
      <button class="carousel-dot ${i === 0 ? 'active' : ''}" data-idx="${i}" aria-label="Go to review ${i + 1}"></button>`
    ).join('');
    dotsEl.querySelectorAll('.carousel-dot').forEach(dot => {
      dot.addEventListener('click', () => goTo(parseInt(dot.dataset.idx)));
    });
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, slides.length - 1));
    slides[current]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    dotsEl?.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  // Keyboard
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight'){ e.preventDefault(); goTo(current + 1); }
  });
}

/* ══════════════════════════════════════════════════════════════
   NEWSLETTER & EXIT-INTENT
══════════════════════════════════════════════════════════════ */
function initNewsletter() {
  const form      = $('#newsletter-form');
  const wrap      = $('#newsletter-form-wrap');
  const success   = $('#newsletter-success');
  const emailInput= $('#newsletter-email');
  const errEl     = $('#newsletter-error');
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
    Toast.show('Welcome to the ReGongches community!', 'success');
  });

  // Account button (no alert)
  $('#account-btn')?.addEventListener('click', () => {
    Toast.show('Account sign-in will be available at launch.', 'info');
  });
}

function initExitIntent() {
  const overlay  = $('#exit-modal-overlay');
  const modal    = $('#exit-modal');
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

  // Trigger on mouse leaving the viewport (desktop only)
  document.addEventListener('mouseleave', e => {
    if (e.clientY < 0) showModal();
  });
  // Trigger after 45s on mobile
  setTimeout(showModal, 45000);

  closeBtn?.addEventListener('click', hideModal);
  skipBtn?.addEventListener('click',  hideModal);
  overlay.addEventListener('click', e => { if (e.target === e.currentTarget) hideModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) hideModal(); });

  exitForm?.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#exit-email')?.value?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    hideModal();
    Storage.set('newsletter-joined', true);
    Toast.show('Welcome! Check your inbox soon.', 'success');
  });
}

/* ══════════════════════════════════════════════════════════════
   COOKIE BAR
══════════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════════
   BACK TO TOP & MISC
══════════════════════════════════════════════════════════════ */
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
  // Expose openCart/openWishlist/openSearch to global scope for tab bar buttons
  window.openCart     = openCart;
  window.openWishlist = openWishlist;

  // Run all module initialisers in order
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
  initQuickView();
  initCart();
  initWishlist();
  initCheckout();
  initCustomOrder();
  initJournal();
  initRegions();
  initReviews();
  initNewsletter();
  initExitIntent();
  initCookieBar();
  initMisc();
});
