"use strict";

/* Sample catalogue. Prices and descriptions require supplier validation. */
const products = [
      {
        id: "p1",
        name: "Leafy Desk Plant",
        category: "Plants",
        price: 950,
        art: "plant",
        color: "#e7ecdd",
        badge: "A little desk greenery",
        description:
          "Concept listing for a potted desk plant. Exact species, pot dimensions, light needs, and relevant safety information must be confirmed before sale.",
      },
      {
        id: "p2",
        name: "Kitchen Herb Pot",
        category: "Plants",
        price: 650,
        art: "herb",
        color: "#eee9d8",
        badge: "Kitchen garden idea",
        description:
          "A proposed starter herb in a reusable pot. Confirm the variety, growing conditions, and supplier care instructions before listing.",
      },
      {
        id: "p3",
        name: "Regional Tree Sapling",
        category: "Plants",
        price: 450,
        art: "tree",
        color: "#e2eadc",
        badge: "Grow beyond your home",
        description:
          "A sapling selected for the customer's region and planting space. Species, mature size, planting permissions, and site suitability require confirmation.",
      },
      {
        id: "p4",
        name: "Everyday Cotton Tote",
        category: "Reusables",
        price: 700,
        art: "tote",
        color: "#f0e6d8",
        badge: "Bring it. Use it again.",
        description:
          "Proposed cotton shopping bag for repeated use. Confirm fibre composition, dimensions, load capacity, and washing instructions with the supplier.",
      },
      {
        id: "p5",
        name: "Reusable Steel Bottle",
        category: "Reusables",
        price: 1600,
        art: "bottle",
        color: "#e3e9e3",
        badge: "Refill your routine",
        description:
          "Concept for a reusable stainless-steel bottle. Capacity, food-contact suitability, lid materials, and cleaning instructions require verification.",
      },
      {
        id: "p6",
        name: "Bamboo-Handle Brush",
        category: "Reusables",
        price: 250,
        art: "brush",
        color: "#eee7d8",
        badge: "Material transparency",
        description:
          "Proposed toothbrush with a bamboo handle. Bristles may be synthetic; do not assume the whole item is biodegradable. Confirm materials and disposal guidance.",
      },
      {
        id: "p7",
        name: "Balcony Grow Kit",
        category: "Grow kits",
        price: 1200,
        art: "kit",
        color: "#e8e8d8",
        badge: "Start something small",
        description:
          "Proposed bundle of seeds, growing medium, and starter containers. Final contents and season-specific sowing instructions will be confirmed before launch.",
      },
      {
        id: "p8",
        name: "Home Compost Starter",
        category: "Grow kits",
        price: 2400,
        art: "compost",
        color: "#e0e7d9",
        badge: "A new home habit",
        description:
          "Concept composting starter container and guide. Capacity, suitable inputs, ventilation, maintenance, and processing method must be specified before sale.",
      },
    ];

const money = (amount) => "PKR " + amount.toLocaleString("en-PK");
const byId = (id) => document.getElementById(id);
const STORAGE_KEY = "green-pakistan-cart-v1";
const VIEW_STORAGE_KEY = "green-pakistan-view-mode-v1";
const FAVORITES_STORAGE_KEY = "green-pakistan-favorites-v1";
const THEME_STORAGE_KEY = "green-pakistan-theme-v1";
let category = "All";
let cart = {};
let favorites = new Set();
let isListView = false;
let isNightMode = false;
let toastTimer;

/* Only known product IDs and valid integer quantities are restored. */
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (saved && typeof saved === "object" && !Array.isArray(saved)) {
    products.forEach((product) => {
      const quantity = saved[product.id];
      if (Number.isInteger(quantity) && quantity > 0 && quantity <= 99) {
        cart[product.id] = quantity;
      }
    });
  }
} catch {
  cart = {};
}

try {
  isListView = localStorage.getItem(VIEW_STORAGE_KEY) === "list";
} catch {
  isListView = false;
}

try {
  const savedFavorites = JSON.parse(
    localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]",
  );
  if (Array.isArray(savedFavorites)) {
    favorites = new Set(
      savedFavorites.filter((id) => products.some((product) => product.id === id)),
    );
  }
  isNightMode = localStorage.getItem(THEME_STORAGE_KEY) === "night";
} catch {
  favorites = new Set();
  isNightMode = false;
}

function persistFavorites() {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
  } catch {
    /* Favorites continue to work for the current page if storage is unavailable. */
  }
}

function applyTheme() {
  document.body.classList.toggle("night-mode", isNightMode);
  const button = byId("themeToggle");
  button.setAttribute("aria-pressed", String(isNightMode));
  button.querySelector(".theme-label").textContent = isNightMode
    ? "Day mode"
    : "Night mode";
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isNightMode ? "night" : "day");
  } catch {
    /* Theme still works for the current page if storage is unavailable. */
  }
}

function persistViewMode() {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, isListView ? "list" : "grid");
  } catch {
    /* View mode still works if browser storage is unavailable. */
  }
}

function updateViewModeButton() {
  const button = byId("viewToggle");
  if (!button) return;
  button.textContent = isListView ? "View: List" : "View: Grid";
  button.setAttribute("aria-pressed", String(isListView));
  button.setAttribute(
    "aria-label",
    isListView ? "Switch to grid view" : "Switch to list view",
  );
}

function applyViewMode() {
  byId("productGrid").classList.toggle("product-grid--list", isListView);
  updateViewModeButton();
  persistViewMode();
}

function toggleViewMode() {
  isListView = !isListView;
  applyViewMode();
  toast(isListView ? "List view enabled" : "Grid view enabled");
}

function bindViewToggle() {
  const button = byId("viewToggle");
  if (!button) return;
  button.addEventListener("click", toggleViewMode);
}

function initializeViewMode() {
  bindViewToggle();
  applyViewMode();
}

function persistCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* Cart continues to work if browser storage is unavailable. */
  }
}

function toast(message) {
  const element = byId("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("show"), 2400);
}

function updatePageChrome() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  byId("scrollProgress").style.transform = `scaleX(${progress})`;
  document.querySelector(".site-header").classList.toggle("scrolled", window.scrollY > 12);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".storefront:not(.hero)").forEach((section) => {
  revealObserver.observe(section);
});
window.addEventListener("scroll", updatePageChrome, { passive: true });
updatePageChrome();

function renderProducts() {
  const term = byId("search").value.trim().toLowerCase();
  let visible = products.filter((product) => {
    const categoryMatch =
      category === "All" || product.category === category;
    const searchable = `${product.name} ${product.category} ${product.description}`;
    return categoryMatch && searchable.toLowerCase().includes(term);
  });

  const sort = byId("sort").value;
  if (sort === "low") visible.sort((a, b) => a.price - b.price);
  if (sort === "high") visible.sort((a, b) => b.price - a.price);
  if (sort === "name")
    visible.sort((a, b) => a.name.localeCompare(b.name));

  /*
Only trusted, hardcoded catalogue values enter this template.
Search input is never interpolated into HTML.
*/
  byId("productGrid").innerHTML = visible.length
    ? visible
        .map(
          (product, index) => `
<article class="product-card" style="animation-delay: ${index * 0.08}s">
  <div class="product-art" style="background:${product.color}">
    <span class="product-badge">${product.badge}</span>
    <button class="favorite-button ${favorites.has(product.id) ? "is-favorite" : ""}"
            data-favorite="${product.id}" aria-pressed="${favorites.has(product.id)}"
            aria-label="${favorites.has(product.id) ? "Remove" : "Save"} ${product.name} ${favorites.has(product.id) ? "from" : "to"} favorites">♡</button>
    <svg role="img" aria-label="Illustration of ${product.name}"
         viewBox="0 0 300 300">
      <use href="#${product.art}"></use>
    </svg>
  </div>
  <div class="product-info">
    <span class="product-category">${product.category}</span>
    <h3>${product.name}</h3>
    <button class="quick-view-button" data-preview="${product.id}">Quick view <span>↗</span></button>
    <details>
      <summary>Product information</summary>
      <p>${product.description}</p>
    </details>
    <div class="product-bottom">
      <span class="price">${money(product.price)}</span>
      <button class="add-button" data-add="${product.id}"
              aria-label="Add ${product.name} to bag">+</button>
    </div>
  </div>
</article>
`
        )
        .join("")
    : '<p class="no-results">No products found. Try another search or category.</p>';

  byId("resultsCount").textContent =
    `${visible.length} product${visible.length === 1 ? "" : "s"} found`;
}

function calculateCart() {
  const count = Object.values(cart).reduce(
    (sum, quantity) => sum + quantity,
    0,
  );
  const subtotal = products.reduce(
    (sum, product) => sum + product.price * (cart[product.id] || 0),
    0,
  );
  const shipping = subtotal === 0 || subtotal >= 3000 ? 0 : 250;
  return { count, subtotal, shipping, total: subtotal + shipping };
}

function updateCart() {
  const totals = calculateCart();
  byId("cartCount").textContent = totals.count;
  byId("openCart").setAttribute(
    "aria-label",
    `Open shopping bag, ${totals.count} items`,
  );

  const items = products.filter((product) => cart[product.id]);

  byId("cartItems").innerHTML = items.length
    ? items
        .map(
          (product) => `
<div class="cart-item">
  <div class="cart-thumb">
    <svg aria-hidden="true"><use href="#${product.art}"></use></svg>
  </div>
  <div>
    <strong>${product.name}</strong>
    <small>${money(product.price)} each</small>
    <div class="quantity">
      <button data-change="${product.id}" data-delta="-1"
              aria-label="Decrease quantity of ${product.name}">−</button>
      <span aria-label="Quantity">${cart[product.id]}</span>
      <button data-change="${product.id}" data-delta="1"
              ${cart[product.id] >= 99 ? "disabled" : ""}
              aria-label="Increase quantity of ${product.name}">+</button>
    </div>
  </div>
  <div>
    <strong>${money(product.price * cart[product.id])}</strong>
    <button class="remove" data-remove="${product.id}"
            aria-label="Remove ${product.name} from bag">Remove</button>
  </div>
</div>
`,
        )
        .join("")
    : '<p style="padding:28px 0">Your bag is waiting for its first green addition.</p>';

  byId("subtotal").textContent = money(totals.subtotal);
  byId("shipping").textContent =
    totals.subtotal > 0 && totals.shipping === 0
      ? "Free (demo)"
      : money(totals.shipping);
  byId("total").textContent = money(totals.total);
  byId("checkoutButton").disabled = totals.count === 0;
  byId("checkoutMessage").textContent = "";
  persistCart();
}

byId("productGrid").addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    const id = favoriteButton.dataset.favorite;
    if (favorites.has(id)) {
      favorites.delete(id);
      toast("Removed from favorites");
    } else {
      favorites.add(id);
      toast("Saved to favorites");
    }
    persistFavorites();
    renderProducts();
    return;
  }
  const previewButton = event.target.closest("[data-preview]");
  if (previewButton) {
    openQuickView(previewButton.dataset.preview);
    return;
  }
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const id = button.dataset.add;
  const product = products.find((item) => item.id === id);
  if (!product) return;

  if ((cart[id] || 0) >= 99) {
    toast("Maximum demo quantity: 99 per product.");
    return;
  }
  cart[id] = (cart[id] || 0) + 1;
  updateCart();
  button.classList.add("added");
  setTimeout(() => button.classList.remove("added"), 380);
  toast(`${product.name} added to your bag`);
});

function openQuickView(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  const quickView = byId("quickViewDialog");
  byId("quickViewContent").innerHTML = `
    <div class="quick-view-art" style="background:${product.color}">
      <svg aria-hidden="true" viewBox="0 0 300 300"><use href="#${product.art}"></use></svg>
    </div>
    <div class="quick-view-copy">
      <span class="product-category">${product.category}</span>
      <h2 id="quickViewTitle">${product.name}</h2>
      <p>${product.description}</p>
      <div class="quick-view-actions">
        <strong class="price">${money(product.price)}</strong>
        <button class="btn" data-quick-add="${product.id}">Add to bag <span>+</span></button>
      </div>
    </div>`;
  quickView.showModal();
}

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    category = button.dataset.category;
    document.querySelectorAll(".filter").forEach((filter) => {
      const selected = filter === button;
      filter.classList.toggle("active", selected);
      filter.setAttribute("aria-pressed", String(selected));
    });
    renderProducts();
  });
});

byId("search").addEventListener("input", renderProducts);
byId("sort").addEventListener("change", renderProducts);
byId("themeToggle").addEventListener("click", () => {
  isNightMode = !isNightMode;
  applyTheme();
  toast(isNightMode ? "Night mode enabled" : "Day mode enabled");
});

const dialog = byId("cartDialog");
const quickViewDialog = byId("quickViewDialog");

byId("openCart").addEventListener("click", () => {
  updateCart();
  dialog.showModal();
  document.body.classList.add("modal-open");
});

byId("closeCart").addEventListener("click", () => dialog.close());

dialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
});

byId("closeQuickView").addEventListener("click", () => quickViewDialog.close());
quickViewDialog.addEventListener("click", (event) => {
  const bounds = quickViewDialog.getBoundingClientRect();
  if (
    event.target === quickViewDialog &&
    (event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom)
  ) {
    quickViewDialog.close();
  }
});
quickViewDialog.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quick-add]");
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.quickAdd);
  if (!product) return;
  cart[product.id] = Math.min(99, (cart[product.id] || 0) + 1);
  updateCart();
  quickViewDialog.close();
  toast(`${product.name} added to your bag`);
});

dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (
    event.target === dialog &&
    (event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom)
  ) {
    dialog.close();
  }
});

byId("cartItems").addEventListener("click", (event) => {
  const change = event.target.closest("[data-change]");
  const remove = event.target.closest("[data-remove]");
  if (!change && !remove) return;

  const id = change ? change.dataset.change : remove.dataset.remove;
  if (!products.some((product) => product.id === id)) return;

  if (change) {
    cart[id] = Math.max(
      0,
      Math.min(99, (cart[id] || 0) + Number(change.dataset.delta)),
    );
    if (cart[id] === 0) delete cart[id];
  } else {
    delete cart[id];
  }

  updateCart();

  /* Preserve a useful keyboard focus target after rebuilding cart rows. */
  const selector = change
    ? `[data-change="${id}"][data-delta="${change.dataset.delta}"]`
    : `[data-remove="${id}"]`;
  const replacement = byId("cartItems").querySelector(selector);
  if (replacement && !replacement.disabled) replacement.focus();
  else byId("closeCart").focus();
});

byId("checkoutButton").addEventListener("click", () => {
  const totals = calculateCart();
  if (!totals.count) return;
  byId("checkoutMessage").textContent =
    `Demo checkout preview: ${totals.count} item(s), illustrative total ` +
    `${money(totals.total)}. No order has been placed and no payment has ` +
    `been taken. A live store needs a secure backend and a verified payment ` +
    `or cash-on-delivery workflow.`;
});

byId("newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();
  byId("emailStatus").textContent =
    "Demo complete. You have not been subscribed; no email was saved or sent.";
  event.target.reset();
});

byId("printPlan").addEventListener("click", () => {
  document.querySelectorAll(".plan-block").forEach((block) => {
    block.open = true;
  });
  window.print();
});

byId("year").textContent = new Date().getFullYear();
applyTheme();
initializeViewMode();
renderProducts();
updateCart();
  
