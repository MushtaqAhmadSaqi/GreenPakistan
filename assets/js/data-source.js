/* ==========================================================================
   ReGongches Data Source Adapter (assets/js/data-source.js)
   Isolates data reads so static window.RG_DATA can be swapped with
   WooCommerce Store API (/wp-json/wc/store/v1/products) during WP conversion.
   ========================================================================== */
(function (window) {
  'use strict';

  const RGDataSource = {
    mode: 'static', // Change to 'wc-store-api' in WordPress theme
    wcEndpoint: '/wp-json/wc/store/v1/products',

    getConfig() {
      return (window.RG_DATA && window.RG_DATA.config) || {};
    },

    getProducts() {
      return (window.RG_DATA && window.RG_DATA.products) || [];
    },

    getProductById(idOrSlug) {
      const list = this.getProducts();
      if (!idOrSlug) return list[0] || null;
      return list.find(
        (p) => String(p.id) === String(idOrSlug) || p.slug === String(idOrSlug)
      ) || list[0] || null;
    },

    getArtisans() {
      return (window.RG_DATA && window.RG_DATA.artisans) || [];
    },

    getArtisanById(id) {
      const list = this.getArtisans();
      if (!id) return list[0] || null;
      return list.find((a) => a.id === id) || list[0] || null;
    },

    getRegions() {
      return (window.RG_DATA && window.RG_DATA.regions) || [];
    },

    getRegionById(id) {
      const list = this.getRegions();
      if (!id) return list[0] || null;
      return list.find((r) => r.id.toLowerCase() === String(id).toLowerCase()) || list[0] || null;
    },

    getReviews(productId) {
      const list = (window.RG_DATA && window.RG_DATA.reviews) || [];
      if (!productId) return list;
      const filtered = list.filter((r) => String(r.productId) === String(productId));
      return filtered.length ? filtered : list.slice(0, 4);
    },

    getJournalPosts() {
      return (window.RG_DATA && window.RG_DATA.journal) || [];
    },

    getJournalPostById(id) {
      const list = this.getJournalPosts();
      if (!id) return list[0] || null;
      return list.find((j) => j.id === id) || list[0] || null;
    },

    formatPKR(amount) {
      const num = Number(amount) || 0;
      try {
        return 'PKR ' + new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(num);
      } catch (e) {
        return 'PKR ' + num.toLocaleString();
      }
    }
  };

  window.RG = window.RG || {};
  window.RG.data = RGDataSource;
})(window);
