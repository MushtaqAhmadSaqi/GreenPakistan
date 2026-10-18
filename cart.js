/**
 * ReGongches — Threads of Mountain Heritage
 * Unified State Store, Cart Engine, Promo Validator, Wishlist & Compare (cart.js)
 * ============================================================================
 * Manages:
 *  - Safe localStorage / sessionStorage access (Safari private mode resilient)
 *  - Cross-tab synchronization via window 'storage' event
 *  - Currency formatting with "≈ approx." conversion & exact PKR checkout display
 *  - Accurate Cart Maths (gift wrap only when ticked & cart > 0; empty cart state)
 *  - Non-stacking Promo Engine (HERITAGE10, HUNZA15 >= PKR 10,000, FREESHIP)
 *  - Accessible Two-Tier Progress Bar (PKR 8,000 Free Shipping / PKR 15,000 Free Gift)
 *  - Wishlist Drawer & Side-by-Side Compare Matrix (max 3 items)
 */

'use strict';

window.RG = window.RG || {};

/* ── 1. SAFE STORAGE WRAPPER (Safari Private Mode Resilient) ─────────────── */
const SafeStorage = {
  get(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  },
  getSession(key, fallback = null) {
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  setSession(key, value) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
};

/* ── 2. HTML ESCAPE & CURRENCY FORMATTERS ────────────────────────────────── */
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPkr(pkr) {
  const num = Math.round(Number(pkr) || 0);
  return `PKR ${num.toLocaleString('en-PK')}`;
}

function formatPrice(pkr, currencyOverride = null, includeApproxPrefix = true) {
  const cfg = window.RG.CONFIG || window.CONFIG;
  const currency = currencyOverride || Store.state.currency || 'PKR';
  const num = Number(pkr) || 0;
  if (currency === 'PKR' || !cfg?.currency?.rates?.[currency]) {
    return formatPkr(num);
  }
  const rate = cfg.currency.rates[currency];
  const sym = cfg.currency.symbols[currency] || `${currency} `;
  const converted = (num * rate).toFixed(2);
  return `${includeApproxPrefix ? '≈ ' : ''}${sym}${converted}`;
}

function formatDualCheckoutPrice(pkr) {
  const currency = Store.state.currency || 'PKR';
  const exactPkr = formatPkr(pkr);
  if (currency === 'PKR') return exactPkr;
  return `${exactPkr} (${formatPrice(pkr, currency, true)})`;
}

/* ── 3. CENTRAL REACTIVE STORE (Synced to localStorage & across tabs) ────── */
const Store = {
  state: {
    cart: [],
    wishlist: [],
    compare: [],
    orders: [],
    userReviews: [],
    recentSearches: [],
    recentlyViewed: [],
    currency: 'PKR',
    theme: 'light',
    activePromo: null,
    giftWrap: false,
    orderNote: '',
    cardColorMap: {},
    selectedCity: 'Islamabad'
  },
  listeners: new Set(),

  init() {
    const keys = (window.RG.CONFIG || window.CONFIG).storageKeys;
    this.state.cart = SafeStorage.get(keys.cart, []);
    this.state.wishlist = SafeStorage.get(keys.wishlist, []);
    this.state.compare = SafeStorage.get(keys.compare, []);
    this.state.orders = SafeStorage.get(keys.orders, []);
    this.state.userReviews = SafeStorage.get(keys.userReviews, []);
    this.state.recentSearches = SafeStorage.get(keys.recentSearches, []);
    this.state.recentlyViewed = SafeStorage.get(keys.recentlyViewed, []);
    this.state.currency = SafeStorage.get(keys.currency, 'PKR');
    this.state.activePromo = SafeStorage.get(keys.activePromo, null);
    this.state.giftWrap = Boolean(SafeStorage.get(keys.giftWrap, false));
    this.state.orderNote = SafeStorage.get(keys.orderNote, '');

    // Theme: respect prefers-color-scheme on first visit, then remember choice
    const savedTheme = SafeStorage.get(keys.theme, null);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.state.theme = savedTheme;
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.state.theme = prefersDark ? 'dark' : 'light';
    }

    // If cart is empty on load, ensure giftWrap is false so PKR 350 is never shown on empty bag
    if (!this.state.cart.length && this.state.giftWrap) {
      this.state.giftWrap = false;
      SafeStorage.set(keys.giftWrap, false);
    }

    // Cross-tab synchronization
    window.addEventListener('storage', (e) => {
      if (!e.key) return;
      if (e.key === keys.cart) this.state.cart = SafeStorage.get(keys.cart, []);
      if (e.key === keys.wishlist) this.state.wishlist = SafeStorage.get(keys.wishlist, []);
      if (e.key === keys.compare) this.state.compare = SafeStorage.get(keys.compare, []);
      if (e.key === keys.currency) this.state.currency = SafeStorage.get(keys.currency, 'PKR');
      if (e.key === keys.theme) {
        this.state.theme = SafeStorage.get(keys.theme, 'light');
        document.documentElement.setAttribute('data-theme', this.state.theme);
      }
      if (e.key === keys.activePromo) this.state.activePromo = SafeStorage.get(keys.activePromo, null);
      if (e.key === keys.giftWrap) this.state.giftWrap = Boolean(SafeStorage.get(keys.giftWrap, false));
      this.notify();
    });
  },

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.state); } catch (err) { console.error(err); }
    });
  }
};

/* ── 4. CART & PROMO ENGINE ──────────────────────────────────────────────── */
const Cart = {
  get keys() {
    return (window.RG.CONFIG || window.CONFIG).storageKeys;
  },
  get cfg() {
    return window.RG.CONFIG || window.CONFIG;
  },

  save() {
    if (!Store.state.cart.length) {
      Store.state.giftWrap = false;
      SafeStorage.set(this.keys.giftWrap, false);
    }
    SafeStorage.set(this.keys.cart, Store.state.cart);
    SafeStorage.set(this.keys.activePromo, Store.state.activePromo);
    SafeStorage.set(this.keys.giftWrap, Store.state.giftWrap);
    SafeStorage.set(this.keys.orderNote, Store.state.orderNote);
    Store.notify();
  },

  getItemCount() {
    return Store.state.cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  },

  getRawSubtotal() {
    return Store.state.cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
  },

  /**
   * Validates active promo code against current subtotal.
   * Codes NEVER stack. Minimum order amounts are strictly enforced.
   */
  evaluatePromo(rawSubtotal = this.getRawSubtotal()) {
    const codeKey = Store.state.activePromo;
    if (!codeKey || rawSubtotal <= 0) {
      return { valid: false, code: codeKey, discountPkr: 0, freeShipping: false, reason: null, rule: null };
    }
    const rule = this.cfg.promos.codes[codeKey];
    if (!rule) {
      return { valid: false, code: codeKey, discountPkr: 0, freeShipping: false, reason: 'Invalid promo code.', rule: null };
    }
    if (rawSubtotal < (rule.minOrder || 0)) {
      const needed = rule.minOrder - rawSubtotal;
      return {
        valid: false,
        code: codeKey,
        discountPkr: 0,
        freeShipping: false,
        reason: `Code ${codeKey} requires a minimum order of ${formatPkr(rule.minOrder)} (add ${formatPkr(needed)} more).`,
        rule
      };
    }
    if (rule.type === 'percent') {
      const discountPkr = Math.round(rawSubtotal * (rule.value / 100));
      return { valid: true, code: codeKey, discountPkr, freeShipping: false, reason: null, rule };
    }
    if (rule.type === 'shipping') {
      return { valid: true, code: codeKey, discountPkr: 0, freeShipping: true, reason: null, rule };
    }
    return { valid: false, code: codeKey, discountPkr: 0, freeShipping: false, reason: null, rule: null };
  },

  /**
   * Calculates complete cart & checkout breakdown in PKR.
   * Fixes all cart maths:
   * - Gift wrap (PKR 350) is added ONLY when checkbox is ticked AND cart is non-empty.
   * - Two-tier progress bar: PKR 8,000 = free shipping, PKR 15,000 = free cedar sachet & story booklet.
   * - COD limit check: disables COD above PKR 25,000.
   */
  getTotals(cityOverride = null) {
    const rawSubtotal = this.getRawSubtotal();
    const isEmpty = rawSubtotal === 0 || Store.state.cart.length === 0;
    const promoEval = this.evaluatePromo(rawSubtotal);
    const discountPkr = isEmpty ? 0 : promoEval.discountPkr;
    const netItemsTotal = Math.max(0, rawSubtotal - discountPkr);

    // Gift wrap ONLY added when checkbox is ticked AND cart has items
    const giftWrapFee = (!isEmpty && Store.state.giftWrap) ? this.cfg.shipping.giftWrapPrice : 0;

    // Shipping calculation
    const city = cityOverride || Store.state.selectedCity || 'Islamabad';
    const cityInfo = this.cfg.shipping.cities[city] || {
      days: this.cfg.shipping.defaultTransitDays,
      fee: this.cfg.shipping.defaultShippingFee
    };

    const freeShipThreshold = this.cfg.shipping.freeDeliveryThreshold; // 8000
    const freeGiftThreshold = this.cfg.shipping.freeGiftThreshold;     // 15000

    const qualifiesFreeShipping = !isEmpty && (rawSubtotal >= freeShipThreshold || promoEval.freeShipping);
    const qualifiesFreeGift = !isEmpty && (rawSubtotal >= freeGiftThreshold);
    const shippingFee = isEmpty ? 0 : (qualifiesFreeShipping ? 0 : cityInfo.fee);

    const cartEstimatedTotal = netItemsTotal + giftWrapFee;
    const grandTotalPkr = netItemsTotal + giftWrapFee + shippingFee;

    // COD limit (PKR 25,000)
    const codLimit = this.cfg.payment.codLimitPkr; // 25000
    const codAllowed = grandTotalPkr <= codLimit;

    // Two-tier progress bar metrics
    let progressPercent = 0;
    let progressMessage = '';
    if (isEmpty) {
      progressPercent = 0;
      progressMessage = `Complimentary nationwide delivery at ${formatPkr(freeShipThreshold)} · Free Cedar Sachet & Story Booklet at ${formatPkr(freeGiftThreshold)}`;
    } else if (rawSubtotal < freeShipThreshold) {
      progressPercent = Math.min(50, Math.round((rawSubtotal / freeShipThreshold) * 50));
      const diff = freeShipThreshold - rawSubtotal;
      progressMessage = `Add ${formatPrice(diff)} more for complimentary nationwide tracked delivery (${formatPkr(freeShipThreshold)} tier)`;
    } else if (rawSubtotal < freeGiftThreshold) {
      const span = freeGiftThreshold - freeShipThreshold;
      const intoTier2 = rawSubtotal - freeShipThreshold;
      progressPercent = Math.min(99, 50 + Math.round((intoTier2 / span) * 50));
      const diff = freeGiftThreshold - rawSubtotal;
      progressMessage = `✓ Complimentary Delivery unlocked! Add ${formatPrice(diff)} more for a free Himalayan Cedar Sachet & Story Booklet`;
    } else {
      progressPercent = 100;
      progressMessage = `★ Both collector tiers unlocked: Complimentary Tracked Delivery + Free Himalayan Cedar Sachet & Story Booklet!`;
    }

    return {
      isEmpty,
      itemCount: this.getItemCount(),
      rawSubtotal,
      discountPkr,
      netItemsTotal,
      giftWrapFee,
      shippingFee,
      shippingDays: cityInfo.days,
      city,
      cartEstimatedTotal,
      grandTotalPkr,
      qualifiesFreeShipping,
      qualifiesFreeGift,
      codAllowed,
      codLimit,
      promoEval,
      progress: {
        valueNow: Math.min(rawSubtotal, freeGiftThreshold),
        valueMin: 0,
        valueMax: freeGiftThreshold,
        percent: progressPercent,
        tier1Threshold: freeShipThreshold,
        tier2Threshold: freeGiftThreshold,
        tier1Reached: rawSubtotal >= freeShipThreshold,
        tier2Reached: rawSubtotal >= freeGiftThreshold,
        message: progressMessage
      }
    };
  },

  add(product, qty = 1, size = '', color = '', silent = false) {
    if (!product) return;
    const chosenSize = size || product.sizes?.[0] || 'One Size';
    const chosenColor = color || product.colors?.[0]?.label || '';
    const key = `${product.id}__${chosenSize}__${chosenColor}`;
    const existing = Store.state.cart.find(item => item.key === key);
    const addQty = Math.max(1, parseInt(qty, 10) || 1);

    if (existing) {
      existing.qty = Math.min(20, existing.qty + addQty);
    } else {
      Store.state.cart.push({
        key,
        id: product.id,
        sku: product.sku || '',
        name: product.name,
        region: product.region,
        price: product.price,
        image: product.images?.[0] || product.fallbackImage,
        fallback: product.fallbackImage,
        size: chosenSize,
        color: chosenColor,
        qty: addQty
      });
    }
    this.save();
    this.renderCartUI();
    if (!silent && window.RG.Toast) {
      window.RG.Toast.show(`"${product.name}" added to your bag`, 'cart');
    }
  },

  updateQty(key, delta) {
    const item = Store.state.cart.find(i => i.key === key);
    if (!item) return;
    const nextQty = item.qty + delta;
    if (nextQty <= 0) {
      this.remove(key);
      return;
    }
    item.qty = Math.min(20, nextQty);
    this.save();
    this.renderCartUI();
  },

  remove(key) {
    const idx = Store.state.cart.findIndex(i => i.key === key);
    if (idx === -1) return;
    const [removed] = Store.state.cart.splice(idx, 1);
    this.save();
    this.renderCartUI();
    this.showUndoBanner(removed);
  },

  clear() {
    Store.state.cart = [];
    Store.state.giftWrap = false;
    Store.state.orderNote = '';
    this.save();
    this.renderCartUI();
  },

  setGiftWrap(checked) {
    if (!Store.state.cart.length) {
      Store.state.giftWrap = false;
    } else {
      Store.state.giftWrap = Boolean(checked);
    }
    this.save();
    this.renderCartUI();
  },

  setOrderNote(note) {
    Store.state.orderNote = String(note || '').slice(0, 300);
    SafeStorage.set(this.keys.orderNote, Store.state.orderNote);
  },

  applyPromo(rawInput, silentIfEmpty = false) {
    const code = String(rawInput || '').trim().toUpperCase();
    const feedbackEl = document.getElementById('cart-promo-feedback');

    if (!code) {
      this.setPromoFeedback('Please enter a promotional code.', 'error');
      return false;
    }

    const rule = this.cfg.promos.codes[code];
    if (!rule) {
      this.setPromoFeedback(`"${escapeHtml(code)}" is not a valid ReGongches promo code.`, 'error');
      if (!silentIfEmpty && window.RG.Toast) {
        window.RG.Toast.show(`Invalid promo code "${code}".`, 'error');
      }
      return false;
    }

    const rawSubtotal = this.getRawSubtotal();
    const previousPromo = Store.state.activePromo;

    if (rawSubtotal > 0 && rawSubtotal < (rule.minOrder || 0)) {
      const needed = rule.minOrder - rawSubtotal;
      const msg = `Code ${code} requires a minimum order of ${formatPkr(rule.minOrder)}. Add ${formatPkr(needed)} more to activate 15% off.`;
      this.setPromoFeedback(msg, 'error');
      if (!silentIfEmpty && window.RG.Toast) {
        window.RG.Toast.show(msg, 'info');
      }
      return false;
    }

    Store.state.activePromo = code;
    this.save();
    this.renderCartUI();

    const replacedNote = (previousPromo && previousPromo !== code)
      ? ` (replaced ${previousPromo} — promo codes do not stack)`
      : '';
    const successMsg = `${code} applied: ${rule.label}${replacedNote}.`;
    this.setPromoFeedback(successMsg, 'success');
    if (window.RG.Toast) {
      window.RG.Toast.show(successMsg, 'success');
    }
    return true;
  },

  removePromo() {
    Store.state.activePromo = null;
    this.save();
    this.setPromoFeedback('', '');
    const input = document.getElementById('cart-promo-input');
    if (input) input.value = '';
    this.renderCartUI();
  },

  setPromoFeedback(msg, type = 'info') {
    const el = document.getElementById('cart-promo-feedback');
    if (!el) return;
    if (!msg) {
      el.hidden = true;
      el.textContent = '';
      el.className = 'cart-promo-feedback';
      return;
    }
    el.hidden = false;
    el.className = `cart-promo-feedback is-${type}`;
    el.textContent = msg;
  },

  showUndoBanner(removedItem) {
    const wrap = document.getElementById('cart-items-wrap');
    if (!wrap) return;
    const existing = wrap.querySelector('.cart-undo-bar');
    if (existing) existing.remove();

    const bar = document.createElement('div');
    bar.className = 'cart-undo-bar';
    bar.setAttribute('role', 'status');
    bar.innerHTML = `
      <span>Removed <strong>${escapeHtml(removedItem.name)}</strong></span>
      <button type="button" class="cart-undo-btn" data-cart-undo="1">Undo</button>
    `;
    wrap.prepend(bar);
    const timer = setTimeout(() => bar.remove(), 5000);
    bar.querySelector('[data-cart-undo]')?.addEventListener('click', () => {
      clearTimeout(timer);
      Store.state.cart.unshift(removedItem);
      this.save();
      this.renderCartUI();
    });
  },

  renderCartUI() {
    const totals = this.getTotals();

    // Update all header & mobile tab bar cart count badges
    document.querySelectorAll('#cart-badge, #tab-cart-badge, [data-cart-count]').forEach(el => {
      el.textContent = totals.itemCount;
      el.classList.toggle('has-items', totals.itemCount > 0);
    });

    // Two-tier accessible progress bar
    const progressEl = document.getElementById('free-delivery-progressbar');
    const fillEl = document.getElementById('fdbar-fill');
    const labelEl = document.getElementById('fdbar-label');
    const tier1Dot = document.getElementById('fdbar-tier1-dot');
    const tier2Dot = document.getElementById('fdbar-tier2-dot');

    if (progressEl) {
      progressEl.setAttribute('aria-valuenow', String(totals.progress.valueNow));
      progressEl.setAttribute('aria-valuemin', '0');
      progressEl.setAttribute('aria-valuemax', String(totals.progress.valueMax));
      progressEl.setAttribute('aria-valuetext', totals.progress.message);
    }
    if (fillEl) {
      fillEl.style.width = `${totals.progress.percent}%`;
      fillEl.classList.toggle('is-tier1', totals.progress.tier1Reached);
      fillEl.classList.toggle('is-tier2', totals.progress.tier2Reached);
    }
    if (labelEl) {
      labelEl.textContent = totals.progress.message;
    }
    if (tier1Dot) tier1Dot.classList.toggle('is-reached', totals.progress.tier1Reached);
    if (tier2Dot) tier2Dot.classList.toggle('is-reached', totals.progress.tier2Reached);

    const wrap = document.getElementById('cart-items-wrap');
    const footer = document.getElementById('cart-drawer-footer');
    const giftCheckbox = document.getElementById('gift-wrap-toggle');

    if (giftCheckbox) {
      giftCheckbox.checked = !totals.isEmpty && Store.state.giftWrap;
      giftCheckbox.disabled = totals.isEmpty;
    }

    if (!wrap) return;

    // Empty state: hide totals/gift-wrap footer and show curated suggestions
    if (totals.isEmpty) {
      if (footer) footer.hidden = true;
      const bag3d = window.RG.ICONS_3D?.bag || '';
      const suggested = (window.RG.PRODUCTS || []).filter(p => p.isBestseller).slice(0, 3);
      wrap.innerHTML = `
        <div class="cart-empty-state">
          ${bag3d ? `<img src="${bag3d}" alt="" width="76" height="72" class="cart-empty-3d-icon" loading="lazy">` : ''}
          <h3>Your Heritage Bag is Empty</h3>
          <p>Every ReGongches textile ships from our Gilgit studio with a numbered Origin Verification Card. Explore our most-collected pieces below:</p>
          <div class="cart-empty-suggestions">
            ${suggested.map(p => `
              <div class="cart-suggest-item">
                <img src="${escapeHtml(p.images[0])}" data-fallback="${escapeHtml(p.fallbackImage)}" alt="${escapeHtml(p.name)}" width="56" height="70" loading="lazy">
                <div class="cart-suggest-info">
                  <a href="product.html?id=${encodeURIComponent(p.id)}" class="cart-suggest-name">${escapeHtml(p.name)}</a>
                  <span>${escapeHtml(p.region)} · ${formatPrice(p.price)}</span>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" data-quickadd-id="${escapeHtml(p.id)}">+ Add</button>
              </div>
            `).join('')}
          </div>
          <a href="shop.html" class="btn btn-primary full-width mt-3">Explore the 16-Piece Archive</a>
        </div>
      `;
      return;
    }

    if (footer) footer.hidden = false;

    // Non-empty cart items list
    wrap.innerHTML = Store.state.cart.map(item => {
      const prod = (window.RG.PRODUCTS || []).find(p => p.id === item.id);
      const fb = item.fallback || prod?.fallbackImage || '';
      return `
        <div class="cart-item" data-cart-key="${escapeHtml(item.key)}">
          <a href="product.html?id=${encodeURIComponent(item.id)}" class="cart-item-img">
            <img src="${escapeHtml(item.image || fb)}" data-fallback="${escapeHtml(fb)}" alt="${escapeHtml(item.name)}" width="72" height="90" loading="lazy">
          </a>
          <div class="cart-item-body">
            <a href="product.html?id=${encodeURIComponent(item.id)}" class="cart-item-name">${escapeHtml(item.name)}</a>
            <p class="cart-item-variant">${escapeHtml([item.region, item.size, item.color].filter(Boolean).join(' · '))}</p>
            <div class="cart-item-controls">
              <div class="qty-stepper qty-stepper--sm" role="group" aria-label="Quantity for ${escapeHtml(item.name)}">
                <button type="button" class="cart-qty-btn" data-cart-action="dec" data-cart-key="${escapeHtml(item.key)}" aria-label="Decrease quantity">−</button>
                <span class="cart-qty-val" aria-live="polite">${item.qty}</span>
                <button type="button" class="cart-qty-btn" data-cart-action="inc" data-cart-key="${escapeHtml(item.key)}" aria-label="Increase quantity">+</button>
              </div>
              <button type="button" class="cart-remove-btn" data-cart-action="remove" data-cart-key="${escapeHtml(item.key)}" aria-label="Remove ${escapeHtml(item.name)} from bag">Remove</button>
            </div>
          </div>
          <div class="cart-item-price-col">
            <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
            ${item.qty > 1 ? `<small>${formatPrice(item.price)} each</small>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Update totals in footer
    const rawSubEl = document.getElementById('cart-raw-subtotal');
    const discRow = document.getElementById('cart-discount-row');
    const discLabel = document.getElementById('cart-discount-label');
    const discVal = document.getElementById('cart-discount-val');
    const giftRow = document.getElementById('cart-giftwrap-row');
    const giftVal = document.getElementById('cart-giftwrap-val');
    const freeGiftRow = document.getElementById('cart-freegift-row');
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const pkrNoteEl = document.getElementById('cart-pkr-settlement-note');
    const activePromoEl = document.getElementById('cart-active-promo');

    if (rawSubEl) rawSubEl.textContent = formatPrice(totals.rawSubtotal);

    if (discRow && discLabel && discVal) {
      if (totals.promoEval.valid && totals.discountPkr > 0) {
        discRow.hidden = false;
        discLabel.textContent = `Promo (${totals.promoEval.code} · −${totals.promoEval.rule.value}%)`;
        discVal.textContent = `−${formatPrice(totals.discountPkr)}`;
      } else if (totals.promoEval.valid && totals.promoEval.freeShipping) {
        discRow.hidden = false;
        discLabel.textContent = `Promo (${totals.promoEval.code})`;
        discVal.textContent = 'Complimentary Delivery';
      } else {
        discRow.hidden = true;
      }
    }

    // If user had HUNZA15 active and dropped below PKR 10,000, show clear notice
    if (Store.state.activePromo && !totals.promoEval.valid && totals.promoEval.reason) {
      this.setPromoFeedback(totals.promoEval.reason, 'error');
    }

    if (activePromoEl) {
      if (totals.promoEval.valid && totals.promoEval.rule) {
        activePromoEl.hidden = false;
        activePromoEl.innerHTML = `
          <span><i class="ph ph-tag" aria-hidden="true"></i> <strong>${escapeHtml(totals.promoEval.code)}</strong>: ${escapeHtml(totals.promoEval.rule.label)}</span>
          <button type="button" class="remove-promo-btn" data-cart-action="remove-promo" aria-label="Remove promo code ${escapeHtml(totals.promoEval.code)}"><i class="ph ph-x"></i></button>
        `;
      } else {
        activePromoEl.hidden = true;
      }
    }

    // Gift wrap row shown ONLY when checkbox is ticked
    if (giftRow && giftVal) {
      giftRow.hidden = totals.giftWrapFee === 0;
      giftVal.textContent = formatPrice(totals.giftWrapFee);
    }

    // Tier 2 Free Cedar Sachet & Story Booklet indicator
    if (freeGiftRow) {
      freeGiftRow.hidden = !totals.qualifiesFreeGift;
    }

    if (subtotalEl) {
      subtotalEl.textContent = formatPrice(totals.cartEstimatedTotal);
    }
    if (pkrNoteEl) {
      if (Store.state.currency !== 'PKR') {
        pkrNoteEl.hidden = false;
        pkrNoteEl.textContent = `Charged in PKR at checkout: ${formatPkr(totals.cartEstimatedTotal)} (before city shipping)`;
      } else {
        pkrNoteEl.hidden = true;
      }
    }

    this.renderCartUpsell();
  },

  renderCartUpsell() {
    const grid = document.getElementById('cart-upsell-grid');
    const wrap = document.getElementById('cart-upsell');
    if (!grid || !window.RG.PRODUCTS) return;
    const inCartIds = new Set(Store.state.cart.map(i => i.id));
    const suggestions = window.RG.PRODUCTS.filter(p => !inCartIds.has(p.id)).slice(0, 2);
    if (!suggestions.length) {
      if (wrap) wrap.hidden = true;
      return;
    }
    if (wrap) wrap.hidden = false;
    grid.innerHTML = suggestions.map(p => `
      <div class="upsell-card">
        <a href="product.html?id=${encodeURIComponent(p.id)}" class="upsell-img">
          <img src="${escapeHtml(p.images[0])}" data-fallback="${escapeHtml(p.fallbackImage)}" alt="${escapeHtml(p.name)}" width="56" height="70" loading="lazy">
        </a>
        <div class="upsell-body">
          <a href="product.html?id=${encodeURIComponent(p.id)}" class="upsell-name">${escapeHtml(p.name)}</a>
          <p class="upsell-price">${formatPrice(p.price)}</p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" data-quickadd-id="${escapeHtml(p.id)}" aria-label="Add ${escapeHtml(p.name)} to bag">+ Add</button>
      </div>
    `).join('');
  }
};

/* ── 5. WISHLIST ENGINE ──────────────────────────────────────────────────── */
const Wishlist = {
  get keys() {
    return (window.RG.CONFIG || window.CONFIG).storageKeys;
  },

  toggle(productId) {
    const products = window.RG.PRODUCTS || [];
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const idx = Store.state.wishlist.findIndex(w => w.id === productId);
    let added = false;
    if (idx !== -1) {
      Store.state.wishlist.splice(idx, 1);
      if (window.RG.Toast) window.RG.Toast.show(`Removed "${prod.name}" from wishlist`, 'info', 2400);
    } else {
      Store.state.wishlist.push({
        id: prod.id,
        name: prod.name,
        region: prod.region,
        price: prod.price,
        image: prod.images?.[0] || prod.fallbackImage,
        fallback: prod.fallbackImage
      });
      added = true;
      if (window.RG.Toast) window.RG.Toast.show(`Saved "${prod.name}" to your wishlist`, 'success', 2600);
    }

    SafeStorage.set(this.keys.wishlist, Store.state.wishlist);
    this.renderWishlistUI();
    Store.notify();
    return added;
  },

  isWishlisted(productId) {
    return Store.state.wishlist.some(w => w.id === productId);
  },

  renderWishlistUI() {
    const cnt = Store.state.wishlist.length;
    document.querySelectorAll('#wishlist-count, [data-wishlist-count]').forEach(el => {
      el.textContent = cnt;
      el.hidden = cnt === 0;
    });

    // Sync heart buttons across the DOM
    document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      const id = btn.dataset.wishlistId;
      const wished = this.isWishlisted(id);
      btn.classList.toggle('is-wishlisted', wished);
      btn.setAttribute('aria-pressed', String(wished));
      btn.setAttribute('aria-label', wished ? 'Remove from wishlist' : 'Save to wishlist');
      const icon = btn.querySelector('i');
      if (icon) icon.className = wished ? 'ph-fill ph-heart' : 'ph ph-heart';
    });

    const wrap = document.getElementById('wishlist-items-wrap');
    if (!wrap) return;

    if (!cnt) {
      wrap.innerHTML = `
        <div class="wishlist-empty">
          <i class="ph ph-heart" aria-hidden="true"></i>
          <h3>Your Saved Wishlist is Empty</h3>
          <p>Tap the heart icon on any Gilgit-Baltistan garment, shawl, or gift set to save it here for later comparison.</p>
          <a href="shop.html" class="btn btn-primary btn-sm mt-3">Browse the Archive</a>
        </div>
      `;
      return;
    }

    wrap.innerHTML = Store.state.wishlist.map(item => {
      const prod = (window.RG.PRODUCTS || []).find(p => p.id === item.id);
      const price = prod ? prod.price : item.price;
      const fb = item.fallback || prod?.fallbackImage || '';
      return `
        <div class="wishlist-item" data-wishlist-key="${escapeHtml(item.id)}">
          <a href="product.html?id=${encodeURIComponent(item.id)}" class="wishlist-item-img">
            <img src="${escapeHtml(item.image || fb)}" data-fallback="${escapeHtml(fb)}" alt="${escapeHtml(item.name)}" width="64" height="80" loading="lazy">
          </a>
          <div class="wishlist-item-body">
            <a href="product.html?id=${encodeURIComponent(item.id)}" class="wishlist-item-name">${escapeHtml(item.name)}</a>
            <p class="wishlist-item-price">${escapeHtml(item.region || 'Gilgit-Baltistan')} · ${formatPrice(price)}</p>
            <div class="wishlist-item-actions">
              <button type="button" class="btn btn-primary btn-sm" data-wishlist-move="${escapeHtml(item.id)}">Move to Bag</button>
              <a href="product.html?id=${encodeURIComponent(item.id)}" class="btn btn-secondary btn-sm">Inspect</a>
            </div>
          </div>
          <button type="button" class="wishlist-remove-btn" data-wishlist-remove="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.name)} from wishlist">
            <i class="ph ph-x" aria-hidden="true"></i>
          </button>
        </div>
      `;
    }).join('');
  }
};

/* ── 6. COMPARE ENGINE (Max 3 Pieces Side-by-Side) ───────────────────────── */
const Compare = {
  get keys() {
    return (window.RG.CONFIG || window.CONFIG).storageKeys;
  },

  toggle(productId) {
    const idx = Store.state.compare.indexOf(productId);
    if (idx !== -1) {
      Store.state.compare.splice(idx, 1);
      if (window.RG.Toast) window.RG.Toast.show('Removed from comparison tray', 'info', 2200);
    } else {
      if (Store.state.compare.length >= 3) {
        if (window.RG.Toast) window.RG.Toast.show('You can compare up to 3 heritage pieces at once.', 'error', 3000);
        return false;
      }
      Store.state.compare.push(productId);
      if (window.RG.Toast) window.RG.Toast.show('Added to side-by-side comparison tray', 'success', 2200);
    }
    SafeStorage.set(this.keys.compare, Store.state.compare);
    this.renderCompareUI();
    Store.notify();
    return true;
  },

  clear() {
    Store.state.compare = [];
    SafeStorage.set(this.keys.compare, []);
    this.renderCompareUI();
    Store.notify();
  },

  renderCompareUI() {
    const cnt = Store.state.compare.length;
    const bar = document.getElementById('compare-float-bar');
    const countEl = document.getElementById('compare-bar-count');
    const inlineBtn = document.getElementById('open-compare-modal-btn');
    const inlineCnt = document.getElementById('compare-inline-count');
    const slotsEl = document.getElementById('compare-float-slots');

    if (countEl) countEl.textContent = cnt;
    if (inlineCnt) inlineCnt.textContent = cnt;
    if (bar) bar.hidden = cnt === 0;
    if (inlineBtn) inlineBtn.hidden = cnt === 0;

    document.querySelectorAll('[data-compare-id]').forEach(btn => {
      const active = Store.state.compare.includes(btn.dataset.compareId);
      btn.classList.toggle('is-compared', active);
      btn.setAttribute('aria-pressed', String(active));
    });

    if (slotsEl) {
      slotsEl.innerHTML = Store.state.compare.map(id => {
        const p = (window.RG.PRODUCTS || []).find(x => x.id === id);
        if (!p) return '';
        return `
          <span class="compare-slot-pill">
            ${escapeHtml(p.name)}
            <button type="button" data-compare-remove="${escapeHtml(p.id)}" aria-label="Remove ${escapeHtml(p.name)} from comparison"><i class="ph ph-x"></i></button>
          </span>
        `;
      }).join('');
    }
  },

  renderCompareTable() {
    const wrap = document.getElementById('compare-table-wrap');
    if (!wrap) return;
    const items = Store.state.compare
      .map(id => (window.RG.PRODUCTS || []).find(p => p.id === id))
      .filter(Boolean);

    if (!items.length) {
      wrap.innerHTML = `<p class="p-4 text-center">Select up to 3 pieces from the archive to compare side-by-side.</p>`;
      return;
    }

    wrap.innerHTML = `
      <div class="compare-scroll-container" tabindex="0" role="region" aria-label="Side-by-side comparison matrix">
        <table class="compare-table">
          <thead>
            <tr>
              <th scope="col" class="sticky-col">Provenance Attribute</th>
              ${items.map(p => `
                <th scope="col">
                  <div class="compare-th-card">
                    <img src="${escapeHtml(p.images[0])}" data-fallback="${escapeHtml(p.fallbackImage)}" alt="${escapeHtml(p.name)}" width="84" height="105" loading="lazy">
                    <a href="product.html?id=${encodeURIComponent(p.id)}" class="compare-th-title">${escapeHtml(p.name)}</a>
                    <span class="compare-th-price">${formatPrice(p.price)}</span>
                  </div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" class="sticky-col">Origin Valley</th>
              ${items.map(p => `<td><strong>${escapeHtml(p.region)}</strong><br><small>${escapeHtml(p.originVillage || '')}</small></td>`).join('')}
            </tr>
            <tr>
              <th scope="row" class="sticky-col">Collector Rating</th>
              ${items.map(p => `<td>★ ${(p.rating || 4.9).toFixed(1)} (${p.reviewCount || 20} reviews)</td>`).join('')}
            </tr>
            <tr>
              <th scope="row" class="sticky-col">Craft Technique</th>
              ${items.map(p => `<td>${escapeHtml(p.craftTechnique || p.handmadeLabel)}</td>`).join('')}
            </tr>
            <tr>
              <th scope="row" class="sticky-col">Artisan Guild</th>
              ${items.map(p => `<td>${escapeHtml(p.artisanName || 'Verified GB Collective')}</td>`).join('')}
            </tr>
            <tr>
              <th scope="row" class="sticky-col">Material Grade</th>
              ${items.map(p => `<td>${escapeHtml(p.materials)}</td>`).join('')}
            </tr>
            <tr>
              <th scope="row" class="sticky-col">Warmth &amp; Weight</th>
              ${items.map(p => `<td>${escapeHtml(p.weight || 'Standard')} · ${escapeHtml(p.warmthLevel || 'All-Season')}</td>`).join('')}
            </tr>
            <tr>
              <th scope="row" class="sticky-col">Lead Time</th>
              ${items.map(p => `<td><span class="badge badge--status">${escapeHtml(p.status)}</span><br><small>${escapeHtml(p.leadTime || '')}</small></td>`).join('')}
            </tr>
            <tr>
              <th scope="row" class="sticky-col">Price (PKR)</th>
              ${items.map(p => `<td><strong>${formatPkr(p.price)}</strong>${Store.state.currency !== 'PKR' ? `<br><small>${formatPrice(p.price)}</small>` : ''}</td>`).join('')}
            </tr>
            <tr>
              <th scope="row" class="sticky-col">Select Piece</th>
              ${items.map(p => `
                <td>
                  <div class="compare-action-cell">
                    <button type="button" class="btn btn-primary btn-sm" data-quickadd-id="${escapeHtml(p.id)}">Add to Bag</button>
                    <button type="button" class="btn btn-ghost-dark btn-sm" data-compare-remove="${escapeHtml(p.id)}">Remove</button>
                  </div>
                </td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
};

Object.assign(window.RG, {
  SafeStorage,
  Store,
  Cart,
  Wishlist,
  Compare,
  escapeHtml,
  formatPkr,
  formatPrice,
  formatDualCheckoutPrice
});
