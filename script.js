/* ═══════════════════════════════════════════════════════════
   ReGongches – Threads of Mountain Heritage
   E-Commerce Prototype · SP25-BAI-047 · Mushtaq Ahmad
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── PRODUCT DATA ───────────────────────────────────────── */
const PRODUCTS = [
  {
    id: 1, name: 'Traditional Gilgiti Cap',
    region: 'Gilgit District', category: 'Caps',
    price: 1800, compareAt: null,
    badge: 'Handmade', badgeClass: 'badge-handmade',
    img: 'gilgiti_cap.png', emoji: '🎩',
    craft: 'Hand-embroidered · Wool blend',
    description: 'Authentic Gilgiti cap featuring hand-stitched geometric embroidery in gold and maroon thread. Made by local artisans using traditional techniques passed down through generations. Each cap is slightly unique — a mark of true craftsmanship.',
    material: 'Wool blend · Cotton lining',
    status: 'Ready',
    dispatch: '2–4 working days',
  },
  {
    id: 2, name: 'Embroidered Woollen Shawl',
    region: 'Hunza Valley', category: 'Shawls',
    price: 5000, compareAt: null,
    badge: 'Handwoven', badgeClass: 'badge-handmade',
    img: 'embroidered_shawl.png', emoji: '🧣',
    craft: 'Handwoven · Pure wool',
    description: 'A stunning handwoven shawl from Hunza Valley, crafted by a women\'s collective preserving traditional weaving heritage. Features intricate geometric embroidery motifs in antique gold thread on a rich maroon wool base. Warm, elegant and culturally meaningful.',
    material: 'Pure sheep wool · Natural dyes',
    status: 'Ready',
    dispatch: '3–5 working days',
  },
  {
    id: 3, name: 'Traditional Embroidered Waistcoat',
    region: 'Skardu, Baltistan', category: 'Waistcoats',
    price: 6500, compareAt: null,
    badge: 'Handmade', badgeClass: 'badge-handmade',
    img: 'traditional_waistcoat.png', emoji: '🧥',
    craft: 'Hand-tailored · Embroidered',
    description: 'A beautifully crafted traditional waistcoat from a family tailoring unit in Skardu. Features traditional Baltistani embroidery patterns along the borders and chest. Made from quality wool with careful hand-finishing at every seam.',
    material: 'Wool · Satin lining · Gold thread embroidery',
    status: 'Ready',
    dispatch: '4–7 working days',
  },
  {
    id: 4, name: 'Embroidered Heritage Handbag',
    region: 'Gilgit District', category: 'Accessories',
    price: 2200, compareAt: 2800,
    badge: 'Handmade', badgeClass: 'badge-handmade',
    img: 'embroidered_bag.png', emoji: '👜',
    craft: 'Hand-embroidered · Textile',
    description: 'A handcrafted textile handbag featuring the rich geometric embroidery tradition of Gilgit-Baltistan. Compact and practical, with a secure clasp and shoulder strap. Each piece is individually embroidered — no two are exactly alike.',
    material: 'Heavy cotton canvas · Gold thread · Wool embroidery',
    status: 'Ready',
    dispatch: '2–4 working days',
  },
  {
    id: 5, name: 'Heritage Mountain Gift Set',
    region: 'Gilgit-Baltistan', category: 'Gifts',
    price: 5500, compareAt: null,
    badge: 'Gift Ready', badgeClass: 'badge-new',
    img: 'heritage_gift_set.png', emoji: '🎁',
    craft: 'Curated set · Premium packaging',
    description: 'A thoughtfully curated heritage gift set featuring a traditional Gilgiti cap, a silk embroidered scarf, and a decorative pouch — all in premium gift packaging with an authenticity card and cultural story. Perfect for gifting at weddings, Eid, or cultural events.',
    material: 'Silk scarf · Wool cap · Embroidered pouch · Authenticity card',
    status: 'Ready',
    dispatch: '3–5 working days',
  },
  {
    id: 6, name: 'Baltistani Embroidered Dress',
    region: 'Baltistan', category: 'Dresses',
    price: 8500, compareAt: null,
    badge: 'Custom', badgeClass: 'badge-custom',
    img: null, emoji: '👘',
    craft: 'Hand-tailored · Custom sizing',
    description: 'A traditional embroidered dress from Baltistan, crafted by skilled local tailors. Features the iconic mountain geometric embroidery on the neckline, cuffs and hem. Available in standard and custom sizes — please contact us for custom orders.',
    material: 'Cotton blend · Embroidered silk panels · Machine washable',
    status: 'Made to Order',
    dispatch: '7–14 working days',
  },
  {
    id: 7, name: 'Handwoven Wool Scarf',
    region: 'Hunza Valley', category: 'Shawls',
    price: 2500, compareAt: 3000,
    badge: 'Handwoven', badgeClass: 'badge-handmade',
    img: null, emoji: '🧶',
    craft: 'Handwoven · Natural wool',
    description: 'A warm, lightweight handwoven scarf from Hunza Valley. Made on traditional wooden looms by women artisans using locally sourced wool. Beautifully soft with subtle geometric patterns woven into the fabric. A versatile everyday heritage piece.',
    material: 'Natural sheep wool · Plant-based dyes',
    status: 'Ready',
    dispatch: '2–4 working days',
  },
  {
    id: 8, name: 'Gilgiti Embroidered Cushion Cover',
    region: 'Gilgit District', category: 'Home',
    price: 1400, compareAt: null,
    badge: 'Handmade', badgeClass: 'badge-handmade',
    img: null, emoji: '🛋️',
    craft: 'Hand-embroidered · Home textile',
    description: 'A beautiful embroidered cushion cover featuring traditional Gilgiti geometric patterns. Bring the aesthetic of mountain heritage into your home. Made from durable cotton canvas with careful hand-embroidery on the front panel.',
    material: 'Cotton canvas · Polyester fill insert not included · Zip closure',
    status: 'Ready',
    dispatch: '2–3 working days',
  },
  {
    id: 9, name: 'Baltistani Woollen Cap',
    region: 'Skardu, Baltistan', category: 'Caps',
    price: 1600, compareAt: null,
    badge: 'Handmade', badgeClass: 'badge-handmade',
    img: null, emoji: '🧢',
    craft: 'Hand-knitted · Pure wool',
    description: 'A traditional Baltistani cap hand-knitted from pure wool. Warm, sturdy and deeply rooted in the textile tradition of the Skardu region. Features a distinctive banded colour pattern traditional to the Baltistan area.',
    material: 'Pure sheep wool · Hand-knitted',
    status: 'Ready',
    dispatch: '2–4 working days',
  },
  {
    id: 10, name: 'Mountain Embroidered Waistcoat (Women)',
    region: 'Gilgit District', category: 'Waistcoats',
    price: 5800, compareAt: null,
    badge: 'New Arrival', badgeClass: 'badge-new',
    img: null, emoji: '🧥',
    craft: 'Hand-embroidered · Tailored',
    description: 'A traditional women\'s waistcoat from Gilgit, featuring rich floral and geometric embroidery on a rich deep blue base. Tailored for a contemporary fit while preserving traditional embroidery aesthetics. Available in standard sizes S–XL.',
    material: 'Wool blend · Silk lining · Gold and silver thread',
    status: 'Ready',
    dispatch: '4–6 working days',
  },
  {
    id: 11, name: 'Embroidered Table Runner',
    region: 'Hunza Valley', category: 'Home',
    price: 1800, compareAt: null,
    badge: 'Handmade', badgeClass: 'badge-handmade',
    img: null, emoji: '🏠',
    craft: 'Hand-embroidered · Home textile',
    description: 'A stunning embroidered table runner from Hunza, featuring traditional mountain geometric patterns in rich jewel tones. Made from natural cotton with hand-embroidered panels at each end. A beautiful addition to any dining space.',
    material: 'Natural cotton · Hand-embroidered · Machine washable on gentle',
    status: 'Ready',
    dispatch: '2–3 working days',
  },
  {
    id: 12, name: 'Eid Festival Heritage Set (Deluxe)',
    region: 'Gilgit-Baltistan', category: 'Gifts',
    price: 9500, compareAt: null,
    badge: 'Limited', badgeClass: 'badge-custom',
    img: null, emoji: '✨',
    craft: 'Curated deluxe set',
    description: 'Our most comprehensive gift set — a deluxe Eid collection featuring a traditional Gilgiti cap, an embroidered shawl, a decorative embroidered pouch, an artisan story booklet and premium mountain-themed packaging. The ultimate cultural gift for any occasion.',
    material: 'Multiple handmade pieces · Premium packaging · Authenticity documentation',
    status: 'Ready',
    dispatch: '5–7 working days',
  },
];

/* ─── STATE ──────────────────────────────────────────────── */
let cart = JSON.parse(localStorage.getItem('rg_cart') || '[]');
let favorites = new Set(JSON.parse(localStorage.getItem('rg_fav') || '[]'));
let activeCategory = 'All';
let sortMode = 'featured';
let listView = false;
let searchQuery = '';

/* ─── DOM REFS ───────────────────────────────────────────── */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ─── SCROLL PROGRESS ────────────────────────────────────── */
const scrollBar = $('#scrollProgress');
function updateScrollProgress() {
  const total  = document.body.scrollHeight - window.innerHeight;
  const filled = total > 0 ? window.scrollY / total : 0;
  scrollBar.style.transform = `scaleX(${filled})`;
}

/* ─── HEADER SCROLL ──────────────────────────────────────── */
const header = $('#siteHeader');
function handleHeaderScroll() {
  header.classList.toggle('scrolled', window.scrollY > 40);
  updateScrollProgress();
}
window.addEventListener('scroll', handleHeaderScroll, { passive: true });

/* ─── SCROLL REVEAL ──────────────────────────────────────── */
const observer = new IntersectionObserver(
  (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
  { threshold: 0.09, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.storefront').forEach(el => observer.observe(el));

/* ─── ANNOUNCEMENT CLOSE ─────────────────────────────────── */
$('#annClose')?.addEventListener('click', () => {
  const ann = $('#announcement');
  if (ann) { ann.style.display = 'none'; }
});

/* ─── NIGHT MODE ─────────────────────────────────────────── */
const themeBtn  = $('#themeToggle');
const themeIcon = $('#themeIcon');
let night = localStorage.getItem('rg_dark') === 'true';
applyTheme();
themeBtn.addEventListener('click', () => {
  night = !night;
  applyTheme();
  localStorage.setItem('rg_dark', night);
  themeBtn.setAttribute('aria-pressed', night);
});
function applyTheme() {
  document.body.classList.toggle('night-mode', night);
  themeIcon.textContent = night ? '☀' : '◐';
}

/* ─── CATEGORY FILTERS ───────────────────────────────────── */
$$('.cat-card').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.cat-card').forEach(b => {
      b.classList.remove('cat-active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('cat-active');
    btn.setAttribute('aria-pressed', 'true');
    activeCategory = btn.dataset.cat;
    renderProducts();
    // scroll to shop
    $('#shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ─── SEARCH ─────────────────────────────────────────────── */
$('#search').addEventListener('input', (e) => {
  searchQuery = e.target.value.trim().toLowerCase();
  renderProducts();
});

/* ─── SORT ───────────────────────────────────────────────── */
$('#sort').addEventListener('change', (e) => {
  sortMode = e.target.value;
  renderProducts();
});

/* ─── VIEW TOGGLE ────────────────────────────────────────── */
const viewBtn  = $('#viewToggle');
const grid     = $('#productGrid');
viewBtn.addEventListener('click', () => {
  listView = !listView;
  grid.classList.toggle('product-grid--list', listView);
  viewBtn.textContent = listView ? '⊟ List' : '⊞ Grid';
  viewBtn.setAttribute('aria-pressed', listView);
});

/* ─── FILTER & SORT PRODUCTS ─────────────────────────────── */
function getFilteredProducts() {
  let items = PRODUCTS.filter(p => {
    const matchCat  = activeCategory === 'All' || p.category === activeCategory;
    const matchQ    = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery)   ||
      p.region.toLowerCase().includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery) ||
      p.craft.toLowerCase().includes(searchQuery);
    return matchCat && matchQ;
  });

  switch (sortMode) {
    case 'low':  items.sort((a,b) => a.price - b.price);  break;
    case 'high': items.sort((a,b) => b.price - a.price);  break;
    case 'name': items.sort((a,b) => a.name.localeCompare(b.name)); break;
    default:     break; // featured = original order
  }
  return items;
}

/* ─── RENDER PRODUCTS ────────────────────────────────────── */
function renderProducts() {
  const items   = getFilteredProducts();
  const status  = $('#resultsCount');
  status.textContent = `${items.length} product${items.length !== 1 ? 's' : ''} shown.`;

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <span>🔍</span>
        <p>No products found for <strong>"${searchQuery || activeCategory}"</strong>.</p>
        <p>Try a different search or category.</p>
      </div>`;
    return;
  }

  grid.innerHTML = items.map((p, i) => buildCard(p, i)).join('');

  // Attach card events
  $$('.add-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(+btn.dataset.id);
    });
  });
  $$('.favorite-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(+btn.dataset.id, btn);
    });
  });
  $$('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(+btn.dataset.id);
    });
  });
}

function buildCard(p, i) {
  const isFav = favorites.has(p.id);
  const artEl = p.img
    ? `<img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">`
    + `<div class="product-art-svg" style="display:none">${p.emoji}</div>`
    : `<div class="product-art-svg">${p.emoji}</div>`;

  const oldPrice = p.compareAt
    ? `<span class="price-old">PKR ${p.compareAt.toLocaleString()}</span>` : '';

  return `
    <article class="product-card" style="animation-delay:${i * 0.06}s" data-id="${p.id}">
      <div class="product-art">
        ${artEl}
        ${p.badge ? `<span class="product-badge ${p.badgeClass}">${p.badge}</span>` : ''}
        <button class="favorite-button ${isFav ? 'is-favorite' : ''}"
          data-id="${p.id}" aria-label="${isFav ? 'Remove from' : 'Add to'} favourites" title="Favourite">
          ${isFav ? '♥' : '♡'}
        </button>
      </div>
      <div class="product-info">
        <span class="product-region">${p.region}</span>
        <h3>${p.name}</h3>
        <span class="product-craft">${p.craft}</span>
        <button class="quick-view-btn" data-id="${p.id}" aria-label="Quick view ${p.name}">
          Quick view ↗
        </button>
        <div class="product-bottom">
          <div>
            <span class="price">PKR ${p.price.toLocaleString()}</span>${oldPrice}
          </div>
          <button class="add-button" data-id="${p.id}" aria-label="Add ${p.name} to bag" title="Add to bag">+</button>
        </div>
      </div>
    </article>`;
}

/* ─── FAVOURITES ─────────────────────────────────────────── */
function toggleFavorite(id, btn) {
  if (favorites.has(id)) {
    favorites.delete(id);
    btn.classList.remove('is-favorite');
    btn.textContent = '♡';
    btn.setAttribute('aria-label', 'Add to favourites');
  } else {
    favorites.add(id);
    btn.classList.add('is-favorite');
    btn.textContent = '♥';
    btn.setAttribute('aria-label', 'Remove from favourites');
  }
  localStorage.setItem('rg_fav', JSON.stringify([...favorites]));
}

/* ─── CART ───────────────────────────────────────────────── */
function saveCart() { localStorage.setItem('rg_cart', JSON.stringify(cart)); }

function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(x => x.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: p.id, name: p.name, price: p.price, emoji: p.emoji, img: p.img, region: p.region, qty: 1 });
  }
  saveCart();
  updateCartCount();
  flashAddBtn(id);
  // Flash cart button
  const cartBtn = $('#openCart');
  cartBtn.style.transform = 'scale(1.15)';
  setTimeout(() => { cartBtn.style.transform = ''; }, 300);
}

function flashAddBtn(id) {
  const btn = document.querySelector(`.add-button[data-id="${id}"]`);
  if (!btn) return;
  btn.classList.add('added');
  btn.textContent = '✓';
  setTimeout(() => { btn.classList.remove('added'); btn.textContent = '+'; }, 1200);
}

function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  $('#cartCount').textContent = total;
}

function renderCart() {
  const body = $('#cartBody');
  const footer = $('#cartFooter');

  if (cart.length === 0) {
    body.innerHTML = `<p class="cart-empty">Your bag is empty.<br/><small>Add some mountain heritage! 🏔️</small></p>`;
    footer.hidden = true;
    return;
  }

  body.innerHTML = cart.map(item => {
    const artEl = item.img
      ? `<img class="cart-item-img" src="${item.img}" alt="${item.name}" onerror="this.outerHTML='<div class=\\'cart-item-img\\'>' + item.emoji + '</div>'">`
      : `<div class="cart-item-img">${item.emoji}</div>`;
    return `
      <div class="cart-item" data-id="${item.id}">
        ${artEl}
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-region">${item.region}</div>
          <div class="cart-item-actions">
            <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
            <button class="remove-btn" data-id="${item.id}">Remove</button>
          </div>
        </div>
        <div class="cart-item-price">PKR ${(item.price * item.qty).toLocaleString()}</div>
      </div>`;
  }).join('');

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  $('#cartTotal').textContent = `PKR ${total.toLocaleString()}`;
  footer.hidden = false;

  // qty/remove events
  $$('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id  = +btn.dataset.id;
      const act = btn.dataset.action;
      const item = cart.find(x => x.id === id);
      if (!item) return;
      if (act === 'inc') { item.qty += 1; }
      else if (act === 'dec') {
        item.qty -= 1;
        if (item.qty <= 0) { cart = cart.filter(x => x.id !== id); }
      }
      saveCart(); updateCartCount(); renderCart();
    });
  });
  $$('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      cart = cart.filter(x => x.id !== +btn.dataset.id);
      saveCart(); updateCartCount(); renderCart();
    });
  });
}

// Open/close cart
$('#openCart').addEventListener('click', () => {
  renderCart();
  const overlay = $('#cartOverlay');
  overlay.hidden = false;
  document.body.classList.add('modal-open');
  setTimeout(() => $('#closeCart')?.focus(), 50);
});
$('#closeCart').addEventListener('click', closeCart);
$('#cartOverlay').addEventListener('click', (e) => {
  if (e.target === $('#cartOverlay')) closeCart();
});
function closeCart() {
  $('#cartOverlay').hidden = true;
  document.body.classList.remove('modal-open');
}

$('#checkoutBtn').addEventListener('click', () => {
  alert('🏔️ ReGongches · Academic Prototype\n\nThank you for your interest! This is a student demonstration — no payment will be processed.\n\nIn the live store, you would proceed to checkout with:\n• Cash on Delivery\n• Bank Transfer\n• Easypaisa / JazzCash\n\nYour total: PKR ' + cart.reduce((s,i) => s + i.price * i.qty, 0).toLocaleString());
});

/* ─── QUICK VIEW MODAL ───────────────────────────────────── */
function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  const artEl = p.img
    ? `<img class="modal-img" src="${p.img}" alt="${p.name}" onerror="this.outerHTML='<div class=\\'modal-img-placeholder\\'>${p.emoji}</div>'">`
    : `<div class="modal-img-placeholder">${p.emoji}</div>`;

  const oldPrice = p.compareAt
    ? `<small class="price-old" style="display:block;margin-top:4px">Was PKR ${p.compareAt.toLocaleString()}</small>` : '';

  $('#modalContent').innerHTML = `
    <div class="modal-product">
      ${artEl}
      <div class="modal-info">
        <span class="product-region">${p.region}</span>
        <h3>${p.name}</h3>
        <span class="price">PKR ${p.price.toLocaleString()}</span>
        ${oldPrice}
        <p>${p.description}</p>
        <div class="modal-meta">
          <span>🧵 ${p.material}</span>
          <span>📦 ${p.status}</span>
          <span>🚚 ${p.dispatch}</span>
          ${p.badge ? `<span>✦ ${p.badge}</span>` : ''}
        </div>
        <button class="btn btn-primary modal-add-btn" data-id="${p.id}">Add to Bag +</button>
      </div>
    </div>`;

  const overlay = $('#modalOverlay');
  overlay.hidden = false;
  document.body.classList.add('modal-open');
  setTimeout(() => $('#closeModal')?.focus(), 50);

  // Attach add button
  overlay.querySelector('.modal-add-btn').addEventListener('click', () => {
    addToCart(p.id);
    closeModal();
  });
}

$('#closeModal').addEventListener('click', closeModal);
$('#modalOverlay').addEventListener('click', (e) => {
  if (e.target === $('#modalOverlay')) closeModal();
});
function closeModal() {
  $('#modalOverlay').hidden = true;
  document.body.classList.remove('modal-open');
}

/* ─── KEYBOARD ESC ───────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('#cartOverlay').hidden)  closeCart();
  if (!$('#modalOverlay').hidden) closeModal();
});

/* ─── NEWSLETTER ─────────────────────────────────────────── */
$('#newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const status = $('#emailStatus');
  status.textContent = '✦ Thank you! You\'ve joined the Threads of the North campaign. (Demo only — no data is stored.)';
  e.target.reset();
  setTimeout(() => { status.textContent = ''; }, 6000);
});

/* ─── PRINT ──────────────────────────────────────────────── */
$('#printPlan')?.addEventListener('click', () => window.print());

/* ─── INIT ───────────────────────────────────────────────── */
updateCartCount();
renderProducts();

// Re-observe any dynamically added storefront elements
setTimeout(() => {
  document.querySelectorAll('.storefront').forEach(el => observer.observe(el));
}, 100);
