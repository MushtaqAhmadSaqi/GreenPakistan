/* Behaviour shared by the dedicated storefront pages. */
'use strict';

const pageCurrency = value => `PKR ${Number(value || 0).toLocaleString('en-PK')}`;
const pageCart = JSON.parse(localStorage.getItem('regongches-cart') || '[]');

function updatePageCart() {
  document.querySelectorAll('[data-page-cart-count]').forEach(el => {
    el.textContent = pageCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  });
}

function addPageProduct(product) {
  const item = pageCart.find(entry => entry.id === product.id);
  if (item) item.quantity = (item.quantity || 1) + 1;
  else pageCart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
  localStorage.setItem('regongches-cart', JSON.stringify(pageCart));
  updatePageCart();
  const toast = document.querySelector('.page-toast');
  if (toast) {
    toast.textContent = `${product.name} added to your bag`;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 2400);
  }
}

function productCard(product) {
  const image = product.images?.[0] || product.fallbackImage;
  return `<article class="page-product-card">
    <a class="page-product-image" href="shop.html?product=${encodeURIComponent(product.id)}">
      <img src="${image}" alt="${product.name}" loading="lazy">
    </a>
    <div class="page-product-info">
      <small>${product.region || 'Gilgit-Baltistan'} · ${product.category}</small>
      <h3>${product.name}</h3>
      <div class="page-product-meta">
        <span class="page-product-price">${pageCurrency(product.price)}</span>
        <button class="page-add" type="button" data-product-id="${product.id}">Add to bag</button>
      </div>
    </div>
  </article>`;
}

function renderShop() {
  const grid = document.querySelector('[data-page-product-grid]');
  if (!grid || typeof PRODUCTS === 'undefined') return;
  const search = document.querySelector('[data-page-search]');
  const category = document.querySelector('[data-page-category]');
  const buttons = [...document.querySelectorAll('[data-page-filter]')];
  let active = '';
  const render = () => {
    const query = (search?.value || '').toLowerCase().trim();
    const selected = category?.value || active;
    const filtered = PRODUCTS.filter(product => {
      const matchesText = !query || `${product.name} ${product.region} ${product.category}`.toLowerCase().includes(query);
      const matchesCategory = !selected || product.category === selected;
      const matchesBadge = !active || (active === 'New' ? product.isNew : product.isBestseller);
      return matchesText && matchesCategory && matchesBadge;
    });
    grid.innerHTML = filtered.map(productCard).join('');
    document.querySelector('[data-page-result-count]').textContent = `${filtered.length} pieces`;
    grid.querySelectorAll('[data-product-id]').forEach(button => {
      button.addEventListener('click', () => addPageProduct(PRODUCTS.find(product => product.id === button.dataset.productId)));
    });
  };
  search?.addEventListener('input', render);
  category?.addEventListener('change', render);
  buttons.forEach(button => button.addEventListener('click', () => {
    active = active === button.dataset.pageFilter ? '' : button.dataset.pageFilter;
    buttons.forEach(item => item.classList.toggle('is-active', item === button && active));
    if (category) category.value = '';
    render();
  }));
  render();
}

document.addEventListener('DOMContentLoaded', () => {
  updatePageCart();
  document.querySelector('[data-page-menu]')?.addEventListener('click', () => document.querySelector('.page-links')?.classList.toggle('is-open'));
  document.querySelector('[data-page-year]').textContent = new Date().getFullYear();
  renderShop();
});
