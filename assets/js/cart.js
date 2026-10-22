/* ==========================================================================
   ReGongches Cart Store Module (assets/js/cart.js)
   Persisted in localStorage, emits 'rg:cart:updated', syncs across tabs.
   NOTE: Becomes obsolete once WooCommerce native cart/session runs.
   ========================================================================== */
(function (window) {
  'use strict';

  const STORAGE_KEY = 'rg_cart_v1';

  function safeGetStorage(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function safeSetStorage(key, val) {
    try {
      window.localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      /* ignore quota/sandbox errors */
    }
  }

  const defaultState = {
    items: [],
    couponCode: '',
    giftWrap: false,
    giftNote: '',
    orderNote: ''
  };

  let state = Object.assign({}, defaultState, safeGetStorage(STORAGE_KEY, defaultState));
  let lastRemovedItem = null;

  const RGCart = {
    getState() {
      return state;
    },

    save() {
      safeSetStorage(STORAGE_KEY, state);
      window.dispatchEvent(new CustomEvent('rg:cart:updated', { detail: this.getSummary() }));
    },

    addItem(productId, qty = 1, options = {}) {
      const product = window.RG.data.getProductById(productId);
      if (!product) return null;

      const size = options.size || (product.attributes && product.attributes.size && product.attributes.size[0]) || 'Standard';
      const colour = options.colour || (product.attributes && product.attributes.colour && product.attributes.colour[0]) || 'Default';
      const customNote = options.customNote || '';
      const key = `${product.id}__${size}__${colour}__${customNote}`;

      const existing = state.items.find((item) => item.key === key);
      if (existing) {
        existing.qty = Math.min(99, existing.qty + Number(qty || 1));
      } else {
        state.items.push({
          key,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          regular_price: product.regular_price,
          image: product.images && product.images[0] ? product.images[0].src : '',
          region: product.region,
          availability: product.availability,
          craft_type: product.craft_type,
          dispatch_days: product.dispatch_days,
          size,
          colour,
          customNote,
          qty: Math.max(1, Number(qty || 1))
        });
      }
      this.save();
      return product;
    },

    updateQty(key, qty) {
      const num = Number(qty);
      if (num <= 0) {
        return this.removeItem(key);
      }
      const item = state.items.find((i) => i.key === key);
      if (item) {
        item.qty = Math.min(99, num);
        this.save();
      }
    },

    updateVariant(key, newSize, newColour) {
      const item = state.items.find((i) => i.key === key);
      if (!item) return;
      if (newSize) item.size = newSize;
      if (newColour) item.colour = newColour;
      this.save();
    },

    removeItem(key) {
      const idx = state.items.findIndex((i) => i.key === key);
      if (idx > -1) {
        lastRemovedItem = state.items[idx];
        state.items.splice(idx, 1);
        this.save();
      }
      return lastRemovedItem;
    },

    undoRemove() {
      if (lastRemovedItem) {
        state.items.push(lastRemovedItem);
        const restored = lastRemovedItem;
        lastRemovedItem = null;
        this.save();
        return restored;
      }
      return null;
    },

    setGiftWrap(enabled, note) {
      state.giftWrap = Boolean(enabled);
      if (typeof note === 'string') state.giftNote = note;
      this.save();
    },

    setOrderNote(note) {
      state.orderNote = String(note || '');
      this.save();
    },

    applyCoupon(code) {
      const clean = String(code || '').trim().toUpperCase();
      const coupons = (window.RG.data.getConfig().coupons) || {};
      if (!clean) {
        state.couponCode = '';
        this.save();
        return { valid: true, message: 'Coupon removed.' };
      }
      if (coupons[clean]) {
        state.couponCode = clean;
        this.save();
        return { valid: true, message: `Applied ${clean}: ${coupons[clean].label}` };
      }
      return { valid: false, message: 'Invalid coupon code. Try THREADS10 or WELCOME.' };
    },

    clear() {
      state.items = [];
      state.couponCode = '';
      state.giftWrap = false;
      state.giftNote = '';
      state.orderNote = '';
      this.save();
    },

    getSummary() {
      const cfg = window.RG.data.getConfig();
      const threshold = cfg.freeDeliveryThreshold || 5000;
      const baseShipping = cfg.standardDeliveryFee || 250;
      const wrapFee = cfg.giftWrapFee || 300;
      const coupons = cfg.coupons || {};

      const count = state.items.reduce((acc, i) => acc + Number(i.qty || 0), 0);
      const subtotal = state.items.reduce((acc, i) => acc + (Number(i.price) * Number(i.qty)), 0);

      let discount = 0;
      let couponLabel = '';
      if (state.couponCode && coupons[state.couponCode] && subtotal > 0) {
        const c = coupons[state.couponCode];
        couponLabel = c.label;
        discount = c.type === 'percent' ? Math.round(subtotal * (c.value / 100)) : c.value;
        discount = Math.min(subtotal, discount);
      }

      const giftWrapCost = (state.giftWrap && count > 0) ? wrapFee : 0;
      const afterDiscount = Math.max(0, subtotal - discount);
      const freeShippingRemaining = Math.max(0, threshold - afterDiscount);
      const freeShippingProgress = Math.min(100, Math.round((afterDiscount / threshold) * 100));
      const delivery = (count === 0 || afterDiscount >= threshold) ? 0 : baseShipping;
      const total = afterDiscount + giftWrapCost + delivery;
      const hasMadeToOrder = state.items.some((i) => i.availability === 'made-to-order' || Boolean(i.customNote));

      return {
        items: state.items,
        count,
        subtotal,
        discount,
        couponCode: state.couponCode,
        couponLabel,
        giftWrap: state.giftWrap,
        giftNote: state.giftNote,
        orderNote: state.orderNote,
        giftWrapCost,
        delivery,
        total,
        threshold,
        freeShippingRemaining,
        freeShippingProgress,
        hasMadeToOrder
      };
    }
  };

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      state = Object.assign({}, defaultState, safeGetStorage(STORAGE_KEY, defaultState));
      window.dispatchEvent(new CustomEvent('rg:cart:updated', { detail: RGCart.getSummary() }));
    }
  });

  window.RG = window.RG || {};
  window.RG.cart = RGCart;
})(window);
