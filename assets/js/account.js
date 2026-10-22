/* ==========================================================================
   ReGongches My Account & Loyalty Controller (assets/js/account.js)
   Demo login/register, Orders, Tracking Timeline, Addresses, Mountain Points
   ========================================================================== */
(function (window, document) {
  'use strict';

  const USER_KEY = 'rg_demo_user_v1';

  const RGAccount = {
    init() {
      const container = document.getElementById('rg-account-container');
      if (!container) return;

      container.querySelectorAll('[data-rg-acc-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-rg-acc-tab');
          container.querySelectorAll('[data-rg-acc-li]').forEach((li) => {
            li.classList.toggle('is-active', li.getAttribute('data-rg-acc-li') === target);
          });
          container.querySelectorAll('[data-rg-acc-panel]').forEach((p) => {
            p.hidden = p.getAttribute('data-rg-acc-panel') !== target;
          });
        });
      });

      this.renderOrders();
      this.bindAuthDemo();
      this.bindOrderTracker();
    },

    renderOrders() {
      const tbody = document.getElementById('rg-account-orders-tbody');
      if (!tbody) return;
      const orders = (window.RG.checkout && window.RG.checkout.getSavedOrders()) || [];
      const fmt = window.RG.data.formatPKR;

      if (!orders.length) {
        tbody.innerHTML = `
          <tr>
            <td><strong>RG-202647 (Sample)</strong></td>
            <td>2026-10-18</td>
            <td><span class="rg-badge rg-badge--verified">Quality Checked</span></td>
            <td>PKR 6,800 (2 items)</td>
            <td><a href="order-confirmation.html?order=RG-202647" class="rg-btn rg-btn--outline rg-btn--sm">View Receipt</a></td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = orders.map((o) => `
        <tr>
          <td><strong>${o.orderNumber}</strong></td>
          <td>${o.date}</td>
          <td><span class="rg-badge rg-badge--verified">${o.status}</span></td>
          <td>${fmt(o.summary.total)}</td>
          <td><a href="order-confirmation.html?order=${o.orderNumber}" class="rg-btn rg-btn--outline rg-btn--sm">View Receipt</a></td>
        </tr>
      `).join('');
    },

    bindAuthDemo() {
      const form = document.getElementById('rg-demo-login-form');
      if (!form) return;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.elements.demo_name ? form.elements.demo_name.value : 'Areeba Khan';
        try {
          window.localStorage.setItem(USER_KEY, JSON.stringify({ name }));
        } catch (err) {}
        const greeting = document.getElementById('rg-account-greeting');
        if (greeting) greeting.textContent = `Welcome back, ${name} (Demo Session Active)`;
        window.RG.ui.toast(`Signed in as ${name} (Demo localStorage session).`);
      });
    },

    bindOrderTracker() {
      const trackBtn = document.getElementById('rg-track-order-btn');
      const resultBox = document.getElementById('rg-track-order-result');
      if (!trackBtn || !resultBox) return;
      trackBtn.addEventListener('click', () => {
        resultBox.hidden = false;
        window.RG.ui.toast('Order tracking timeline updated.');
      });
    }
  };

  window.RG = window.RG || {};
  window.RG.account = RGAccount;
})(window, document);
