/**
 * ReGongches — Threads of Mountain Heritage
 * Central Storefront Configuration (config.js)
 * ============================================================================
 * SINGLE SOURCE OF TRUTH for all business, contact, banking, shipping,
 * promotional, currency, and order-handoff settings.
 *
 * ⚠️ REPLACE BEFORE LAUNCH:
 * Search for "[REPLACE BEFORE LAUNCH]" in this file and update your live
 * phone/WhatsApp number, bank IBAN, mobile wallet number, and optional
 * Formspree / Google Apps Script order webhook endpoint before going live.
 */

const CONFIG = {
  brand: {
    name: 'ReGongches',
    tagline: 'Threads of Mountain Heritage',
    legalName: 'ReGongches Heritage Crafts',
    domain: 'https://regongches.store',
    foundedYear: 2024,
    originRegion: 'Gilgit-Baltistan, Pakistan',
    districts: [
      'Gilgit',
      'Hunza',
      'Nagar',
      'Ghizer',
      'Baltistan (Skardu)',
      'Diamer',
      'Astore'
    ]
  },

  /* ⚠️ [REPLACE BEFORE LAUNCH] — Store Contact & Concierge Details */
  contact: {
    phoneDisplay: '+92 300 123 4567',        // [REPLACE BEFORE LAUNCH] Display phone number
    phoneRaw: '+923001234567',               // [REPLACE BEFORE LAUNCH] E.164 tel: link number
    whatsappNumber: '923001234567',          // [REPLACE BEFORE LAUNCH] Digits only (country code + number, no +)
    whatsappBaseUrl: 'https://wa.me/923001234567',
    email: 'hello@regongches.store',         // [REPLACE BEFORE LAUNCH] Customer care email
    conciergeEmail: 'concierge@regongches.store',
    studioAddress: 'Jutial & Old Bazaar Heritage Studio, Gilgit, Gilgit-Baltistan, Pakistan', // [REPLACE BEFORE LAUNCH]
    supportHours: 'Mon–Sat · 9:00 AM – 6:00 PM (PKT)',
    mapCoordinates: { lat: 35.9208, lng: 74.3080, label: 'Gilgit Heritage Studio & Dispatch Hub' }
  },

  /* ⚠️ [REPLACE BEFORE LAUNCH] — Payment & Banking Details */
  payment: {
    codLimitPkr: 25000, // Orders above PKR 25,000 automatically disable COD and require Bank/Wallet or 50% advance
    customOrderAdvancePercent: 50,
    bank: {
      bankName: 'Meezan Bank / Karakoram Cooperative Bank', // [REPLACE BEFORE LAUNCH]
      accountTitle: 'ReGongches Heritage Crafts',           // [REPLACE BEFORE LAUNCH]
      iban: 'PK36 MEZN 0001 2345 6789 0102',                // [REPLACE BEFORE LAUNCH]
      branch: 'Gilgit Main Commercial Branch'               // [REPLACE BEFORE LAUNCH]
    },
    wallet: {
      providers: 'JazzCash / EasyPaisa (Raast Enabled)',
      accountTitle: 'ReGongches Official',                  // [REPLACE BEFORE LAUNCH]
      number: '0300-1234567'                                // [REPLACE BEFORE LAUNCH]
    }
  },

  /* ⚠️ [REPLACE BEFORE LAUNCH] — Static-Hosting Order Hand-Off Endpoint
   * How to connect so you receive every order automatically by email/sheet:
   *  Option A (Formspree): Create a free form at https://formspree.io, copy your
   *    endpoint URL (e.g. "https://formspree.io/f/xabcdefg") into `endpointUrl` below.
   *  Option B (Google Apps Script): Deploy a Web App script that appends rows to a
   *    Google Sheet and emails you, then paste the `https://script.google.com/macros/s/.../exec`
   *    URL into `endpointUrl` below.
   *  Note: Even when `endpointUrl` is blank, clicking "Complete Order" automatically
   *  prepares and opens a pre-filled WhatsApp order dispatch message to `contact.whatsappNumber`.
   */
  orderHandoff: {
    endpointUrl: '', // [REPLACE BEFORE LAUNCH] e.g. 'https://formspree.io/f/YOUR_FORM_ID'
    autoOpenWhatsAppOnSubmit: true,
    demoOrderRef: 'RG-DEMO101'
  },

  /* Shipping & Two-Tier Cart Rewards */
  shipping: {
    freeDeliveryThreshold: 8000, // Tier 1: Complimentary Nationwide Tracked Delivery
    freeGiftThreshold: 15000,    // Tier 2: Free Himalayan Cedar Sachet & Illustrated Story Booklet
    freeGiftLabel: 'Complimentary Himalayan Cedar Sachet & 16-Page Story Booklet',
    giftWrapPrice: 350,          // Added ONLY when user ticks the archival gift wrap checkbox & cart > 0
    defaultShippingFee: 250,
    defaultTransitDays: '2–4 business days (Tracked Courier)',
    cities: {
      'Gilgit':     { days: '1–2 business days (Local GB Studio Hub)', fee: 150 },
      'Hunza':      { days: '1–2 business days (Local GB Studio Hub)', fee: 150 },
      'Skardu':     { days: '2–3 business days (Baltistan Express)',   fee: 200 },
      'Islamabad':  { days: '2–3 business days (Air/Road Express)',    fee: 250 },
      'Rawalpindi': { days: '2–3 business days (Air/Road Express)',    fee: 250 },
      'Lahore':     { days: '2–4 business days (Tracked Courier)',     fee: 250 },
      'Karachi':    { days: '3–4 business days (Tracked Air Courier)', fee: 300 },
      'Peshawar':   { days: '2–4 business days (Tracked Courier)',     fee: 250 },
      'Faisalabad': { days: '3–5 business days (Tracked Courier)',     fee: 250 },
      'Multan':     { days: '3–5 business days (Tracked Courier)',     fee: 280 },
      'Sialkot':    { days: '3–5 business days (Tracked Courier)',     fee: 250 },
      'Quetta':     { days: '4–6 business days (Tracked Courier)',     fee: 320 },
      'Other':      { days: '5–8 business days (Nationwide Post/Courier)', fee: 300 }
    }
  },

  /* Promo Code Rules (Non-Stacking) */
  promos: {
    allowStacking: false,
    codes: {
      HERITAGE10: {
        code: 'HERITAGE10',
        type: 'percent',
        value: 10,
        minOrder: 0,
        label: '10% Off Heritage Welcome Offer',
        description: '10% off any order'
      },
      HUNZA15: {
        code: 'HUNZA15',
        type: 'percent',
        value: 15,
        minOrder: 10000,
        label: '15% Off Collector Order (Min. PKR 10,000)',
        description: '15% off orders of PKR 10,000 or more'
      },
      FREESHIP: {
        code: 'FREESHIP',
        type: 'shipping',
        value: 100,
        minOrder: 0,
        label: 'Complimentary Nationwide Tracked Delivery',
        description: 'Waives standard courier fee on any order'
      }
    }
  },

  /* Currency Switcher Configuration (Charged in PKR) */
  currency: {
    base: 'PKR',
    chargedNotice: 'All orders are processed and settled in PKR.',
    rates: {
      PKR: 1,
      USD: 0.0036,
      GBP: 0.0028,
      AED: 0.013
    },
    symbols: {
      PKR: 'PKR ',
      USD: '$',
      GBP: '£',
      AED: 'AED '
    },
    labels: {
      PKR: 'PKR — Pakistani Rupee',
      USD: 'USD — US Dollar (approx., charged in PKR)',
      GBP: 'GBP — British Pound (approx., charged in PKR)',
      AED: 'AED — UAE Dirham (approx., charged in PKR)'
    }
  },

  /* Social Links — ⚠️ [REPLACE BEFORE LAUNCH] */
  social: {
    instagram: 'https://instagram.com/regongches',
    facebook: 'https://facebook.com/regongches',
    tiktok: 'https://tiktok.com/@regongches',
    pinterest: 'https://pinterest.com/regongches',
    hashtag: '#ThreadsOfTheNorth',
    handle: '@regongches'
  },

  /* Announcement Bar Slides (Single Slim Bar) */
  announcements: [
    {
      text: 'Authentic hand-loomed clothing & pattu textiles from the 7 districts of Gilgit-Baltistan · ',
      actionLabel: 'Use code HERITAGE10 for 10% off',
      promoCode: 'HERITAGE10'
    },
    {
      text: 'Complimentary nationwide tracked delivery on orders over PKR 8,000 · Cash on Delivery up to PKR 25,000',
      actionLabel: null,
      promoCode: null
    },
    {
      text: 'Collector’s Privilege: Orders over PKR 15,000 include a complimentary Himalayan Cedar Sachet & Story Booklet',
      actionLabel: null,
      promoCode: null
    },
    {
      text: 'Planning a winter or wedding ensemble? Orders above PKR 10,000 qualify for 15% off · ',
      actionLabel: 'Apply HUNZA15',
      promoCode: 'HUNZA15'
    }
  ],

  /* Sequenced Popups & Storage Keys */
  popups: {
    newsletterDelayMs: 30000,       // Wait at least 30 seconds before time-triggered newsletter modal
    newsletterScrollThreshold: 0.5, // Or 50% page scroll depth
    newsletterCooldownDays: 14,     // Never show again for 14 days once dismissed or subscribed
    disableNewsletterOnFirstMobileView: true
  },

  storageKeys: {
    cart: 'regongches-cart',
    wishlist: 'regongches-wishlist',
    compare: 'regongches-compare',
    orders: 'regongches-orders',
    userReviews: 'regongches-user-reviews',
    theme: 'regongches-theme',
    currency: 'regongches-currency',
    giftWrap: 'regongches-giftwrap',
    orderNote: 'regongches-ordernote',
    activePromo: 'regongches-promo',
    recentSearches: 'regongches-recent-searches',
    recentlyViewed: 'regongches-recently-viewed',
    storageNoticeAccepted: 'regongches-storage-accepted',
    newsletterDismissedUntil: 'regongches-newsletter-dismissed-until',
    newsletterSubscribed: 'regongches-newsletter-subscribed',
    mobileFirstViewSeen: 'regongches-mobile-first-view-seen',
    announcementDismissed: 'regongches-ann-dismissed'
  }
};

window.RG = window.RG || {};
window.RG.CONFIG = CONFIG;
window.CONFIG = CONFIG;
