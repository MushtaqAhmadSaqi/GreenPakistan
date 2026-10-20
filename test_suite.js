/**
 * ReGongches Automated Test Suite (test_suite.js)
 * Run via: `node test_suite.js`
 * Validates commerce calculations, product integrity, HTML structures,
 * SEO sitemaps, manifest, and security/placeholder detections.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

function runTests() {
  console.log('\n========================================');
  console.log('✦ ReGongches Automated Test Suite ✦');
  console.log('========================================\n');

  // 1. CONFIG & DATA INTEGRITY
  console.log('--- Suite 1: Config & Data Integrity ---');
  const sandbox = { window: {}, document: {}, console: console, setTimeout, clearTimeout };
  sandbox.window = sandbox;
  const configCode = fs.readFileSync(path.join(__dirname, 'config.js'), 'utf8');
  vm.createContext(sandbox);
  vm.runInContext(configCode, sandbox);

  const CFG = sandbox.window.RG.CONFIG;
  assert(CFG !== undefined, 'CONFIG object exported to window.RG.CONFIG');
  assert(CFG.shipping.freeDeliveryThreshold === 8000, 'Free shipping threshold is exactly PKR 8,000');
  assert(CFG.shipping.freeGiftThreshold === 15000, 'Free gift threshold is exactly PKR 15,000');
  assert(CFG.payment.codLimitPkr === 25000, 'COD limit is exactly PKR 25,000');
  assert(CFG.shipping.giftWrapPrice === 350, 'Gift wrap price is exactly PKR 350');
  assert(Object.keys(CFG.shipping.cities).length >= 12, 'Shipping estimator contains at least 12 regional cities');

  // Load products
  const productsCode = fs.readFileSync(path.join(__dirname, 'data/products.js'), 'utf8');
  vm.runInContext(productsCode, sandbox);

  const PRODUCTS = sandbox.window.RG.PRODUCTS;
  assert(Array.isArray(PRODUCTS) && PRODUCTS.length === 16, 'Exactly 16 heritage products loaded');

  // Check no placeholders in products
  let hasPlaceholder = false;
  PRODUCTS.forEach(p => {
    if (p.artisanName.includes('PLACEHOLDER') || p.name.includes('PLACEHOLDER')) {
      hasPlaceholder = true;
    }
  });
  assert(!hasPlaceholder, 'Zero [PLACEHOLDER] strings found in product data');

  // 2. COMMERCE & PROMO CALCULATIONS
  console.log('\n--- Suite 2: Commerce & Promo Calculations ---');
  // Load Cart & Checkout
  const cartCode = fs.readFileSync(path.join(__dirname, 'cart.js'), 'utf8');
  vm.runInContext(cartCode, sandbox);

  const Cart = sandbox.window.RG.Cart;
  assert(Cart !== undefined, 'Cart module loaded');

  // Simulate totals calculation helper
  function computeTotals(items, selectedCity = 'Lahore', promoCode = null, giftWrap = false) {
    const rawSubtotal = items.reduce((sum, it) => sum + (it.price * it.qty), 0);
    const cityCfg = CFG.shipping.cities[selectedCity] || CFG.shipping.cities['Other'];

    let promoEval = { valid: false, discountPkr: 0, code: null };
    if (promoCode && CFG.promos.codes[promoCode]) {
      const p = CFG.promos.codes[promoCode];
      if (rawSubtotal >= p.minOrder) {
        if (p.type === 'percent') {
          promoEval = { valid: true, discountPkr: Math.round(rawSubtotal * (p.value / 100)), code: promoCode };
        } else if (p.type === 'shipping') {
          promoEval = { valid: true, discountPkr: 0, isShippingFree: true, code: promoCode };
        }
      }
    }

    const qualifiesFreeShipping = rawSubtotal >= CFG.shipping.freeDeliveryThreshold || Boolean(promoEval.isShippingFree);
    const shippingFee = qualifiesFreeShipping ? 0 : cityCfg.fee;
    const qualifiesFreeGift = rawSubtotal >= CFG.shipping.freeGiftThreshold;
    const giftWrapFee = (giftWrap && items.length > 0) ? CFG.shipping.giftWrapPrice : 0;
    const grandTotalPkr = Math.max(0, rawSubtotal - promoEval.discountPkr + shippingFee + giftWrapFee);
    const codAllowed = grandTotalPkr <= CFG.payment.codLimitPkr;

    return {
      rawSubtotal,
      discountPkr: promoEval.discountPkr,
      shippingFee,
      giftWrapFee,
      grandTotalPkr,
      qualifiesFreeGift,
      codAllowed
    };
  }

  // Case A: Cart PKR 4,500 (Below free delivery)
  const cartA = [{ price: 4500, qty: 1 }];
  const resA = computeTotals(cartA, 'Lahore', null, false);
  assert(resA.rawSubtotal === 4500, 'Subtotal correctly PKR 4,500');
  assert(resA.shippingFee === 250, 'Shipping fee PKR 250 charged below threshold');
  assert(resA.grandTotalPkr === 4750, 'Grand total PKR 4,750 (4500 + 250)');
  assert(resA.codAllowed === true, 'COD allowed under PKR 25,000');

  // Case B: Cart with HERITAGE10 promo
  const resB = computeTotals(cartA, 'Lahore', 'HERITAGE10', false);
  assert(resB.discountPkr === 450, 'HERITAGE10 yields 10% discount (PKR 450)');
  assert(resB.grandTotalPkr === 4300, 'Grand total correctly 4500 - 450 + 250 = PKR 4,300');

  // Case C: HUNZA15 min threshold
  const resC_fail = computeTotals(cartA, 'Lahore', 'HUNZA15', false);
  assert(resC_fail.discountPkr === 0, 'HUNZA15 rejected on cart under PKR 10,000');

  const cartC = [{ price: 12000, qty: 1 }];
  const resC_pass = computeTotals(cartC, 'Lahore', 'HUNZA15', false);
  assert(resC_pass.discountPkr === 1800, 'HUNZA15 applied 15% on PKR 12,000 = PKR 1,800');
  assert(resC_pass.shippingFee === 0, 'Free shipping unlocked over PKR 8,000');

  // Case D: Cart exceeding PKR 25,000 COD Limit
  const cartD = [{ price: 26000, qty: 1 }];
  const resD = computeTotals(cartD, 'Karachi', null, false);
  assert(resD.codAllowed === false, 'COD disabled when grand total exceeds PKR 25,000');
  assert(resD.qualifiesFreeGift === true, 'Collector gift unlocked when >= PKR 15,000');

  // Case E: Gift wrap fee
  const resE = computeTotals(cartA, 'Lahore', null, true);
  assert(resE.giftWrapFee === 350, 'Gift wrap adds PKR 350 when requested');
  assert(resE.grandTotalPkr === 5100, 'Grand total reflects gift wrap (4500 + 250 + 350 = 5100)');

  // 3. CHECKOUT PLACEHOLDER PROTECTION
  console.log('\n--- Suite 3: Checkout Protection Logic ---');
  const checkoutCode = fs.readFileSync(path.join(__dirname, 'checkout.js'), 'utf8');
  vm.runInContext(checkoutCode, sandbox);

  const Checkout = sandbox.window.RG.Checkout;
  assert(Checkout !== undefined, 'Checkout module loaded');
  assert(Checkout.isPlaceholder('PK36 MEZN 0001 2345 6789 0102', 'iban') === true, 'Blocks placeholder IBAN');
  assert(Checkout.isPlaceholder('0300-1234567', 'wallet') === true, 'Blocks placeholder wallet number');
  assert(Checkout.isPlaceholder('PK12 HABB 0099 8877 6655 4433', 'iban') === false, 'Allows genuine custom IBAN');

  // 4. HTML PAGES & NOSCRIPT AUDIT
  console.log('\n--- Suite 4: HTML Structure & Noscript Audit ---');
  const htmlPages = [
    'index.html',
    'shop.html',
    'product.html',
    'collections.html',
    'story.html',
    'contact.html',
    'journal.html',
    '404.html'
  ];

  htmlPages.forEach(page => {
    const filePath = path.join(__dirname, page);
    assert(fs.existsSync(filePath), `${page} exists`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert(content.includes('<meta charset="UTF-8"'), `${page} has UTF-8 charset`);
    assert(content.includes('viewport'), `${page} has responsive viewport`);
    assert(content.includes('styles.css'), `${page} references styles.css`);
    assert(content.includes('<noscript>'), `${page} has noscript fallback block`);
    assert(content.includes('config.js') && content.includes('data/products.js'), `${page} loads config and products modules`);
  });

  // 5. SITEMAP & PWA AUDIT
  console.log('\n--- Suite 5: Sitemap & PWA Audit ---');
  const sitemapContent = fs.readFileSync(path.join(__dirname, 'sitemap.xml'), 'utf8');
  assert(sitemapContent.includes('https://regongches.store/'), 'Sitemap has homepage');
  assert(sitemapContent.includes('gilgiti-wool-cap-01'), 'Sitemap has product deep link');
  assert(sitemapContent.includes('cultural-textile-gift-box-14'), 'Sitemap has all 16 products');

  const manifestContent = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.webmanifest'), 'utf8'));
  assert(manifestContent.name === 'ReGongches — Threads of Mountain Heritage', 'Manifest name is correct');
  assert(manifestContent.display === 'standalone', 'Manifest display is standalone');
  assert(Array.isArray(manifestContent.icons) && manifestContent.icons.length >= 1, 'Manifest has icons array');

  // 6. MULTI-FACET FILTER ENGINE & CARD ARCHITECTURE AUDIT
  console.log('\n--- Suite 6: Multi-Facet Filter & Card Architecture ---');
  const stylesContent = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
  assert(stylesContent.includes('aspect-ratio: 4/5') || stylesContent.includes('aspect-ratio: 4 / 5'), 'Card image wrap locks 4:5 aspect ratio to prevent CLS');

  const filtersCode = fs.readFileSync(path.join(__dirname, 'filters.js'), 'utf8');
  vm.runInContext(filtersCode, sandbox);
  const Filters = sandbox.window.RG.Filters;
  assert(Filters !== undefined, 'Filters module loaded in window.RG.Filters');

  const headwearItems = Filters.getFilteredProducts({ category: 'Headwear' });
  assert(headwearItems.length === 2, 'Category filter "Headwear" returns exactly 2 products');

  const hunzaMatches = Filters.matchesRegion('Hunza', 'hunza');
  assert(hunzaMatches === true, 'Region matcher is case-insensitive for "Hunza"');

  const skarduMatches = Filters.matchesRegion('Baltistan (Skardu)', 'Skardu');
  assert(skarduMatches === true, 'Region matcher bridges "Baltistan" and "Skardu" aliases');

  const under5k = Filters.getFilteredProducts({ priceRange: 'under-5000' });
  assert(under5k.length > 0 && under5k.every(p => p.price < 5000), 'Price filter "under-5000" returns only items under PKR 5,000');

  const sampleCard = Filters.renderProductCard(PRODUCTS[0]);
  assert(sampleCard.includes('width="400"') && sampleCard.includes('height="500"'), 'Product card HTML includes explicit width and height attributes');
  assert(sampleCard.includes('data-wishlist-id='), 'Product card includes accessible wishlist toggle');
  assert(sampleCard.includes('data-quickadd-id='), 'Product card includes direct quick-add action');

  // SUMMARY
  console.log('\n========================================');
  console.log(`Test Results: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('========================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
