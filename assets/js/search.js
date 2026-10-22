/* ==========================================================================
   ReGongches Instant Search & Index Module (assets/js/search.js)
   Searches products, categories, regions, and journal posts with recent chips
   ========================================================================== */
(function (window) {
  'use strict';

  const RECENT_KEY = 'rg_recent_searches_v1';
  const POPULAR_CHIPS = ['Gilgiti cap', 'Pakol', 'woollen shawl', 'waistcoat', 'gift set'];

  function getRecent() {
    try {
      return JSON.parse(window.localStorage.getItem(RECENT_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function addRecent(term) {
    const clean = String(term || '').trim();
    if (!clean) return;
    try {
      const list = [clean, ...getRecent().filter((x) => x.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  const RGSearch = {
    getPopularChips() {
      return POPULAR_CHIPS;
    },

    getRecentSearches() {
      return getRecent();
    },

    saveSearchTerm(term) {
      addRecent(term);
    },

    query(rawTerm) {
      const q = String(rawTerm || '').trim().toLowerCase();
      if (!q) {
        return { products: [], categories: [], regions: [], journal: [] };
      }

      const products = window.RG.data.getProducts().filter((p) => {
        const hay = `${p.name} ${p.region} ${p.district} ${p.categories.join(' ')} ${(p.tags || []).join(' ')} ${p.short_description} ${p.technique}`.toLowerCase();
        return hay.includes(q);
      });

      const allCats = [
        'Traditional Dresses', 'Caps & Headwear', 'Shawls & Scarves',
        'Waistcoats & Outerwear', 'Textile Accessories', 'Home Textiles',
        'Heritage Gifts', 'Custom & Festive Wear'
      ];
      const categories = allCats.filter((c) => c.toLowerCase().includes(q));

      const regions = window.RG.data.getRegions().filter((r) =>
        `${r.name} ${r.shortDescription} ${r.signatureCrafts.join(' ')}`.toLowerCase().includes(q)
      );

      const journal = window.RG.data.getJournalPosts().filter((j) =>
        `${j.title} ${j.category} ${j.excerpt}`.toLowerCase().includes(q)
      );

      return { products, categories, regions, journal };
    }
  };

  window.RG = window.RG || {};
  window.RG.search = RGSearch;
})(window);
