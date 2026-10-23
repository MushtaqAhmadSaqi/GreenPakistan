/* ==========================================================================
   ReGongches Cart, Checkout & Order Confirmation Module (assets/js/checkout.js)
   Pakistani phone validation (03XX-XXXXXXX), COD rules, demo order storage.
   ========================================================================== */
(function (window, document) {
  'use strict';

  const ORDERS_KEY = 'rg_demo_orders_v1';

  function getOrders() {
    try {
      return JSON.parse(window.localStorage.getItem(ORDERS_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveOrder(order) {
    try {
      const list = [order, ...getOrders()];
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  const RGCheckout = {
    init() {
      this.initCartPage();
      this.initCheckoutPage();
      this.initOrderConfirmationPage();
      window.addEventListener('rg:cart:updated', () => {
        this.initCartPage();
        this.renderCheckoutSummary();
      });
    },

    initCartPage() {
      const wrap = document.getElementById('rg-cart-page-container');
      if (!wrap) return;

      const summary = window.RG.cart.getSummary();
      const fmt = window.RG.data.formatPKR;

      if (summary.items.length === 0) {
        wrap.innerHTML = `
          <div style="text-align:center;padding:var(--space-12);background:var(--bg-elevated);border:1px solid var(--rg-border);border-radius:var(--radius-card);">
            <h2>Your cart is empty, for now. Start with our most-loved pieces from Gilgit and Hunza, or explore by valley.</h2>
            <p style="margin-inline:auto;color:var(--text-secondary);">Explore authentic caps, hand-loomed shawls, and heritage gifts from Gilgit-Baltistan.</p>
            <a href="shop.html" class="rg-btn rg-btn--primary">Explore the Collection</a>
          </div>
        `;
        return;
      }

      wrap.innerHTML = `
        <div class="rg-shipping-bar" style="margin-block-end:24px;">
          <div>
            ${summary.freeShippingRemaining > 0
              ? `Add <strong>${fmt(summary.freeShippingRemaining)}</strong> more for free delivery across Pakistan.`
              : `<strong style="color:var(--rg-success);">You've unlocked free nationwide delivery.</strong>`}
          </div>
          <div class="rg-shipping-bar__track"><div class="rg-shipping-bar__fill" style="width:${summary.freeShippingProgress}%"></div></div>
        </div>

        <div style="display:grid;grid-template-columns:1fr;gap:32px;align-items:start;" class="rg-cart-page-grid">
          <form class="woocommerce-cart-form" onsubmit="return false;">
            <table class="shop_table shop_table_responsive cart woocommerce-cart-form__contents">
              <thead>
                <tr>
                  <th>Product & Origin</th>
                  <th>Variant</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${summary.items.map((item) => `
                  <tr class="woocommerce-cart-form__cart-item cart_item">
                    <td>
                      <div style="display:flex;align-items:center;gap:14px;">
                        <img src="${item.image}" alt="${item.name}" width="64" height="80" style="width:64px;height:80px;object-fit:cover;border-radius:4px;">
                        <div>
                          <a href="product.html?id=${item.productId}" style="font-weight:700;">${item.name}</a>
                          <div style="font-size:12px;color:var(--text-secondary);">Origin: ${item.region} · ${item.craft_type}</div>
                          ${item.customNote ? `<div style="font-size:11px;color:var(--rg-warning);">Custom Note: ${item.customNote}</div>` : ''}
                        </div>
                      </div>
                    </td>
                    <td style="font-size:var(--text-xs);">
                      <div>Size: <strong>${item.size}</strong></div>
                      <div>Colour: <strong>${item.colour.replace(/\s*\(#[0-9A-Fa-f]{6}\)/, '')}</strong></div>
                    </td>
                    <td>${fmt(item.price)}</td>
                    <td>
                      <div class="quantity" style="height:36px;">
                        <button type="button" style="width:30px;height:34px;" data-rg-cart-dec="${item.key}">−</button>
                        <input type="number" class="qty" value="${item.qty}" readonly style="width:36px;height:34px;">
                        <button type="button" style="width:30px;height:34px;" data-rg-cart-inc="${item.key}">+</button>
                      </div>
                    </td>
                    <td><strong>${fmt(item.price * item.qty)}</strong></td>
                    <td>
                      <button type="button" class="rg-btn rg-btn--outline rg-btn--sm" data-rg-cart-remove="${item.key}" aria-label="Remove item">Remove</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin-block-start:20px;">
              <div style="background:var(--bg-elevated);padding:16px;border-radius:var(--radius-card);border:1px solid var(--rg-border);">
                <label style="font-weight:600;font-size:var(--text-sm);display:flex;align-items:center;gap:8px;cursor:pointer;">
                  <input type="checkbox" data-rg-giftwrap-toggle ${summary.giftWrap ? 'checked' : ''}>
                  Add Heritage Gift Wrap & Printed Origin Card (+PKR 300)
                </label>
                <textarea id="rg-cart-order-note" rows="2" placeholder="Optional gift message or delivery instructions..." style="width:100%;margin-block-start:10px;padding:8px;border:1px solid var(--rg-border-strong);">${summary.orderNote}</textarea>
              </div>

              <div style="background:var(--bg-elevated);padding:16px;border-radius:var(--radius-card);border:1px solid var(--rg-border);">
                <label for="rg-coupon-input" style="font-weight:600;font-size:var(--text-sm);display:block;margin-block-end:8px;">
                  Promo / Launch Code (Try <code>THREADS10</code> or <code>WELCOME</code>)
                </label>
                <div style="display:flex;gap:8px;">
                  <input type="text" id="rg-coupon-input" value="${summary.couponCode}" placeholder="Enter coupon code" style="flex:1;padding:8px 12px;border:1px solid var(--rg-border-strong);">
                  <button type="button" class="rg-btn rg-btn--secondary rg-btn--sm" id="rg-apply-coupon-btn">Apply</button>
                </div>
              </div>
            </div>
          </form>

          <div class="cart_totals">
            <h3 style="margin-block-end:16px;">Order Summary</h3>
            <div style="display:grid;gap:10px;font-size:var(--text-sm);border-block-end:1px solid var(--rg-border);padding-block-end:16px;margin-block-end:16px;">
              <div style="display:flex;justify-content:space-between;"><span>Subtotal (${summary.count} items)</span><strong>${fmt(summary.subtotal)}</strong></div>
              ${summary.discount > 0 ? `<div style="display:flex;justify-content:space-between;color:var(--rg-success);"><span>Discount (${summary.couponCode})</span><strong>− ${fmt(summary.discount)}</strong></div>` : ''}
              ${summary.giftWrapCost > 0 ? `<div style="display:flex;justify-content:space-between;"><span>Heritage Gift Wrap</span><strong>${fmt(summary.giftWrapCost)}</strong></div>` : ''}
              <div style="display:flex;justify-content:space-between;"><span>Tracked Delivery</span><strong>${summary.delivery === 0 ? 'FREE' : fmt(summary.delivery)}</strong></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-lg);font-weight:700;margin-block-end:20px;">
              <span>Total</span>
              <span>${fmt(summary.total)}</span>
            </div>
            <div class="wc-proceed-to-checkout">
              <a href="checkout.html" class="checkout-button button alt wc-forward rg-btn rg-btn--primary" style="width:100%;">
                Proceed to Checkout
              </a>
            </div>
          </div>
        </div>
      `;

      const couponBtn = document.getElementById('rg-apply-coupon-btn');
      const couponInp = document.getElementById('rg-coupon-input');
      if (couponBtn && couponInp) {
        couponBtn.addEventListener('click', () => {
          const res = window.RG.cart.applyCoupon(couponInp.value);
          window.RG.ui.toast(res.message);
        });
      }
      const noteEl = document.getElementById('rg-cart-order-note');
      if (noteEl) {
        noteEl.addEventListener('change', () => window.RG.cart.setOrderNote(noteEl.value));
      }
    },

    renderCheckoutSummary() {
      const box = document.getElementById('rg-checkout-order-review');
      if (!box) return;
      const summary = window.RG.cart.getSummary();
      const fmt = window.RG.data.formatPKR;

      const codInput = document.querySelector('input[name="payment_method"][value="cod"]');
      const mtoBanner = document.getElementById('rg-checkout-mto-notice');
      if (summary.hasMadeToOrder) {
        if (mtoBanner) mtoBanner.hidden = false;
        if (codInput) {
          codInput.disabled = true;
          if (codInput.checked) {
            const bankInput = document.querySelector('input[name="payment_method"][value="bacs"]');
            if (bankInput) bankInput.checked = true;
          }
        }
      } else {
        if (mtoBanner) mtoBanner.hidden = true;
        if (codInput) codInput.disabled = false;
      }

      box.innerHTML = `
        <div style="display:grid;gap:10px;margin-block-end:16px;">
          ${summary.items.map((i) => `
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);">
              <span>${i.qty} × ${i.name} <small style="color:var(--text-secondary);">(${i.size})</small></span>
              <strong>${fmt(i.price * i.qty)}</strong>
            </div>
          `).join('')}
        </div>
        <hr class="rg-stitch-line" style="margin-block:12px;">
        <div style="display:grid;gap:8px;font-size:var(--text-sm);">
          <div style="display:flex;justify-content:space-between;"><span>Subtotal</span><span>${fmt(summary.subtotal)}</span></div>
          ${summary.discount > 0 ? `<div style="display:flex;justify-content:space-between;color:var(--rg-success);"><span>Promo (${summary.couponCode})</span><span>− ${fmt(summary.discount)}</span></div>` : ''}
          ${summary.giftWrapCost > 0 ? `<div style="display:flex;justify-content:space-between;"><span>Heritage Gift Wrap</span><span>${fmt(summary.giftWrapCost)}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;"><span>Tracked Courier</span><span>${summary.delivery === 0 ? 'FREE' : fmt(summary.delivery)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:var(--text-lg);font-weight:700;padding-block-start:10px;border-block-start:1px solid var(--rg-border);">
            <span>Total Payable</span><span>${fmt(summary.total)}</span>
          </div>
        </div>
      `;
    },

    initCheckoutPage() {
      const form = document.getElementById('rg-checkout-form');
      if (!form) return;

      // Ensure demo items if user visits checkout directly with empty cart
      if (window.RG.cart.getSummary().count === 0) {
        window.RG.cart.addItem(1, 1);
      }
      this.renderCheckoutSummary();

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        const phoneInput = form.elements.billing_phone;
        const phoneErr = document.getElementById('rg-phone-error');
        const pkPhoneRegex = /^03\d{2}-?\d{7}$/;

        form.querySelectorAll('[required]').forEach((field) => {
          field.classList.remove('is-invalid');
          if (!String(field.value || '').trim()) {
            field.classList.add('is-invalid');
            valid = false;
          }
        });

        if (phoneInput && !pkPhoneRegex.test(String(phoneInput.value || '').trim())) {
          phoneInput.classList.add('is-invalid');
          if (phoneErr) phoneErr.textContent = 'Enter a Pakistani mobile number like 0312-3456789.';
          valid = false;
        } else if (phoneErr) {
          phoneErr.textContent = '';
        }

        if (!valid) {
          window.RG.ui.toast('Please check the highlighted delivery fields.');
          return;
        }

        const summary = window.RG.cart.getSummary();
        const orderNumber = 'RG-' + Math.floor(100000 + Math.random() * 900000);
        const order = {
          orderNumber,
          date: new Date().toISOString().slice(0, 10),
          status: 'Confirmed',
          customer: {
            name: form.elements.billing_full_name.value.trim(),
            phone: form.elements.billing_phone.value.trim(),
            email: form.elements.billing_email.value.trim(),
            province: form.elements.billing_state.value,
            city: form.elements.billing_city.value.trim(),
            address: form.elements.billing_address_1.value.trim(),
            landmark: form.elements.billing_landmark ? form.elements.billing_landmark.value.trim() : ''
          },
          paymentMethod: form.elements.payment_method.value,
          summary
        };

        saveOrder(order);
        window.RG.cart.clear();
        window.location.href = `order-confirmation.html?order=${orderNumber}`;
      });
    },

    initOrderConfirmationPage() {
      const box = document.getElementById('rg-order-confirmation-box');
      if (!box) return;

      const orders = getOrders();
      const params = new URLSearchParams(window.location.search);
      const ordId = params.get('order');
      const order = orders.find((o) => o.orderNumber === ordId) || orders[0] || {
        orderNumber: 'RG-202647',
        date: '2026-10-22',
        status: 'Confirmed',
        customer: { name: 'Mushtaq Ahmad (Demo)', phone: '0300-1234567', city: 'Islamabad', province: 'Islamabad Capital Territory', address: 'COMSATS University Road, Park Road' },
        paymentMethod: 'Cash on Delivery (COD)',
        summary: {
          items: [{ name: 'Traditional Gilgiti Cap (Hand-Woven Patti)', size: '56 cm (M)', qty: 1, price: 1800, region: 'Gilgit' }],
          total: 2050
        }
      };

      const fmt = window.RG.data.formatPKR;
      const cfg = window.RG.data.getConfig();
      const firstName = String(order.customer.name || '').split(' ')[0] || 'Valued Customer';
      const waMsg = encodeURIComponent(`Assalam-o-Alaikum ReGongches! Please confirm my order ${order.orderNumber} (${fmt(order.summary.total)}) for ${order.customer.name} in ${order.customer.city}.`);

      box.innerHTML = `
        <div class="woocommerce-message">
          <span><strong>Thank you, ${firstName}. Order ${order.orderNumber} is confirmed.</strong> We'll message you on WhatsApp when it's quality-checked and dispatched. (Demo store: no payment is taken and no order is sent.)</span>
          <button type="button" class="rg-btn rg-btn--outline rg-btn--sm no-print" data-rg-print-receipt="1">Print Receipt</button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;background:var(--bg-elevated);padding:20px;border-radius:var(--radius-card);border:1px solid var(--rg-border);margin-block-end:24px;">
          <div><span style="font-size:12px;color:var(--text-secondary);display:block;">Order Number</span><strong>${order.orderNumber}</strong></div>
          <div><span style="font-size:12px;color:var(--text-secondary);display:block;">Date</span><strong>${order.date}</strong></div>
          <div><span style="font-size:12px;color:var(--text-secondary);display:block;">Destination</span><strong>${order.customer.city}, ${order.customer.province}</strong></div>
          <div><span style="font-size:12px;color:var(--text-secondary);display:block;">Payment Method</span><strong style="text-transform:uppercase;">${order.paymentMethod}</strong></div>
          <div><span style="font-size:12px;color:var(--text-secondary);display:block;">Total</span><strong>${fmt(order.summary.total)}</strong></div>
        </div>

        <div style="background:var(--bg-elevated);padding:24px;border-radius:var(--radius-card);border:1px solid var(--rg-border);margin-block-end:24px;">
          <h3 style="margin-block-end:12px;">Items & Origin Summary</h3>
          <div style="display:grid;gap:10px;">
            ${order.summary.items.map((i) => `
              <div style="display:flex;justify-content:space-between;padding-block:8px;border-block-end:1px solid var(--rg-border);">
                <span><strong>${i.qty} × ${i.name}</strong> (${i.size}) — Origin: ${i.region || 'Gilgit-Baltistan'}</span>
                <strong>${fmt(i.price * i.qty)}</strong>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="no-print" style="display:flex;flex-wrap:wrap;gap:12px;">
          <a href="https://wa.me/${cfg.whatsappNumber}?text=${waMsg}" target="_blank" rel="noopener" class="rg-btn rg-btn--primary" style="background:#1E7E48;border-color:#1E7E48;">
            Confirm Order on WhatsApp
          </a>
          <a href="account.html" class="rg-btn rg-btn--secondary">Track Order in My Account</a>
          <a href="shop.html" class="rg-btn rg-btn--outline">Continue Shopping</a>
        </div>
      `;
    },

    getSavedOrders() {
      return getOrders();
    }
  };

  window.RG = window.RG || {};
  window.RG.checkout = RGCheckout;
})(window, document);
