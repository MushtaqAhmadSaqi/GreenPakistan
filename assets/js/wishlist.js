/* ==========================================================================
   ReGongches Wishlist & Recently Viewed Module (assets/js/wishlist.js)
   ========================================================================== */
(function (window) {
  'use strict';

  const WL_KEY = 'rg_wishlist_v1';
  const RV_KEY = 'rg_recently_viewed_v1';

  function loadList(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveList(key, arr) {
    try {
      window.localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {}
  }

  let wishlistIds = loadList(WL_KEY);
  let recentIds = loadList(RV_KEY);

  const RGWishlist = {
    getIds() {
      return wishlistIds;
    },

    getProducts() {
      const all = window.RG.data.getProducts();
      return wishlistIds.map((id) => all.find((p) => Number(p.id) === Number(id))).filter(Boolean);
    },

    has(productId) {
      return wishlistIds.includes(Number(productId));
    },

    toggle(productId) {
      const id = Number(productId);
      const exists = this.has(id);
      if (exists) {
        wishlistIds = wishlistIds.filter((item) => item !== id);
      } else {
        wishlistIds.push(id);
      }
      saveList(WL_KEY, wishlistIds);
      window.dispatchEvent(new CustomEvent('rg:wishlist:updated', { detail: { ids: wishlistIds, added: !exists, productId: id } }));
      return !exists;
    },

    addRecentlyViewed(productId) {
      const id = Number(productId);
      if (!id) return;
      recentIds = [id, ...recentIds.filter((x) => x !== id)].slice(0, 6);
      saveList(RV_KEY, recentIds);
    },

    getRecentlyViewed(excludeId) {
      const all = window.RG.data.getProducts();
      return recentIds
        .filter((id) => Number(id) !== Number(excludeId))
        .map((id) => all.find((p) => Number(p.id) === Number(id)))
        .filter(Boolean);
    }
  };

  window.addEventListener('storage', (e) => {
    if (e.key === WL_KEY) {
      wishlistIds = loadList(WL_KEY);
      window.dispatchEvent(new CustomEvent('rg:wishlist:updated', { detail: { ids: wishlistIds } }));
    }
  });

  window.RG = window.RG || {};
  window.RG.wishlist = RGWishlist;
})(window);
