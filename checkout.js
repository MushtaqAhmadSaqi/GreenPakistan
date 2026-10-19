/**
 * ReGongches — Threads of Mountain Heritage
 * 3-Step Checkout Engine, COD Limit Enforcer, Printable Invoice & Static Order Hand-Off (checkout.js)
 * ============================================================================
 * Features:
 *  - Unified 3-Step Checkout Progress (1. Delivery -> 2. Payment -> 3. Review & Confirm)
 *    followed by Order Request screen (NOT "Confirmed" — static site cannot guarantee order receipt).
 *  - 13-City Shipping Estimator with automatic free shipping at PKR 8,000 or FREESHIP.
 *  - Pakistani Phone Validation (+92 3XX XXXXXXX or 03XX XXXXXXX) & Address Validation.
 *  - Strict COD Limit Enforcement (PKR 25,000): disables COD above PKR 25,000 with clear explanation.
 *  - Always displays exact PKR totals at checkout alongside any foreign currency approximation.
 *  - Placeholder IBAN/phone detection: blocks display of unconfigured test values.
 *  - Static-Hosting Order Hand-Off (REQUIRES CONFIGURATION BEFORE LAUNCH):
 *      (a) Pre-filled WhatsApp Studio Dispatch message (auto-opened + 1-click button)
 *      (b) Configurable Formspree / Google Apps Script webhook POST (`CONFIG.orderHandoff.endpointUrl`)
 *      (c) Local Browser Order History persistence (`localStorage`) — honestly labelled, not live tracking
 *
 * ⚠️ LAUNCH BLOCKERS:
 *  - Set CONFIG.orderHandoff.endpointUrl before going live.
 *  - Replace all [REPLACE BEFORE LAUNCH] values in config.js.
 */

'use strict';

window.RG = window.RG || {};

const Checkout = {
  currentStep: 1,
  formData: {
    name: '',
    phone: '',
    email: '',
    city: 'Islamabad',
    address: '',
    paymentMethod: 'COD'
  },
  lastOrder: null,

  get cfg() {
    return window.RG.CONFIG || window.CONFIG;
  },

  init() {
    const citySelect = document.getElementById('co-city');
    if (citySelect) {
      // Populate cities from CONFIG if needed
      const cities = Object.keys(this.cfg.shipping.cities);
      citySelect.innerHTML = `<option value="">Select destination city</option>` +
        cities.map(c => `<option value="${window.RG.escapeHtml(c)}" ${c === 'Islamabad' ? 'selected' : ''}>${window.RG.escapeHtml(c)}</option>`).join('');
      citySelect.addEventListener('change', () => {
        const selected = citySelect.value || 'Islamabad';
        window.RG.Store.state.selectedCity = selected;
        this.formData.city = selected;
        this.updateCityShippingBanner();
      });
    }

    // Populate Bank & Wallet details dynamically from CONFIG (never hard-coded!)
    this.populatePaymentInstructions();

    // Payment radio listener
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (!radio.disabled && radio.checked) {
          this.formData.paymentMethod = radio.value;
        }
      });
    });

    // Step navigation buttons
    document.getElementById('co-step1-next')?.addEventListener('click', () => {
      if (this.validateStep1()) this.goToStep(2);
    });
    document.getElementById('co-step2-back')?.addEventListener('click', () => this.goToStep(1));
    document.getElementById('co-step2-next')?.addEventListener('click', () => {
      if (this.validateStep2()) this.goToStep(3);
    });
    document.getElementById('co-step3-back')?.addEventListener('click', () => this.goToStep(2));
    document.getElementById('co-place-order')?.addEventListener('click', () => this.completeOrder());

    // Post-order actions
    document.getElementById('print-invoice-btn')?.addEventListener('click', () => window.print());
    document.getElementById('copy-order-summary-btn')?.addEventListener('click', () => {
      if (!this.lastOrder) return;
      const text = this.buildOrderSummaryText(this.lastOrder);
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
      window.RG.Toast?.show('Order summary copied to clipboard.', 'success');
    });
    document.getElementById('track-this-order-btn')?.addEventListener('click', () => {
      const ref = this.lastOrder?.id || this.cfg.orderHandoff.demoOrderRef;
      this.close();
      window.RG.UI?.openModal('tracker', ref);
    });
    document.getElementById('order-close-btn')?.addEventListener('click', () => this.close());
    document.getElementById('checkout-close')?.addEventListener('click', () => this.close());
    document.getElementById('checkout-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.close();
    });
  },

  /**
   * Detects whether config values are still the default [REPLACE BEFORE LAUNCH] placeholders.
   * Returns true if the value appears to be a placeholder that should not be shown to customers.
   */
  isPlaceholder(value, type = 'generic') {
    if (!value || typeof value !== 'string') return true;
    const v = value.trim();
    // Known placeholder IBAN
    if (type === 'iban' && v === 'PK36 MEZN 0001 2345 6789 0102') return true;
    // Known placeholder phones
    if ((type === 'phone' || type === 'wallet') && (v === '0300-1234567' || v === '+923001234567' || v.includes('123 4567'))) return true;
    // Known placeholder WhatsApp
    if (type === 'whatsapp' && v === '923001234567') return true;
    // Generic placeholder text
    if (v.includes('[REPLACE') || v.includes('PLACEHOLDER') || v.includes('123 4567')) return true;
    return false;
  },

  populatePaymentInstructions() {
    const bankBox = document.getElementById('bank-instructions-box');
    if (bankBox) {
      const b = this.cfg.payment.bank;
      const ibanIsPlaceholder = this.isPlaceholder(b.iban, 'iban');
      if (ibanIsPlaceholder) {
        bankBox.innerHTML = `
          <span class="payment-placeholder-warning">
            <strong>⚠️ Bank transfer details not yet configured.</strong><br>
            Please contact us on WhatsApp to arrange payment.
          </span>
        `;
      } else {
        bankBox.innerHTML = `
          <span><strong>Bank:</strong> ${window.RG.escapeHtml(b.bankName)}</span>
          <span><strong>Account Title:</strong> ${window.RG.escapeHtml(b.accountTitle)}</span>
          <span><strong>IBAN:</strong> <code>${window.RG.escapeHtml(b.iban)}</code></span>
          <span><strong>Branch:</strong> ${window.RG.escapeHtml(b.branch)}</span>
        `;
      }
    }
    const walletBox = document.getElementById('wallet-instructions-box');
    if (walletBox) {
      const w = this.cfg.payment.wallet;
      const walletIsPlaceholder = this.isPlaceholder(w.number, 'wallet');
      if (walletIsPlaceholder) {
        walletBox.innerHTML = `
          <span class="payment-placeholder-warning">
            <strong>⚠️ Wallet details not yet configured.</strong><br>
            Please contact us on WhatsApp to arrange payment.
          </span>
        `;
      } else {
        walletBox.innerHTML = `
          <span><strong>Services:</strong> ${window.RG.escapeHtml(w.providers)}</span>
          <span><strong>Account Title:</strong> ${window.RG.escapeHtml(w.accountTitle)}</span>
          <span><strong>Wallet Number:</strong> <code>${window.RG.escapeHtml(w.number)}</code></span>
        `;
      }
    }
  },

  open() {
    const totals = window.RG.Cart.getTotals();
    if (totals.isEmpty) {
      window.RG.Toast?.show('Your heritage bag is empty. Add a piece before checking out.', 'error');
      return;
    }
    const overlay = document.getElementById('checkout-overlay');
    if (!overlay) return;

    this.populatePaymentInstructions();
    this.updateCityShippingBanner();
    this.goToStep(1);

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    window.RG.UI?.lockScroll();
    this.releaseTrap = window.RG.UI?.trapFocus(overlay);
  },

  close() {
    const overlay = document.getElementById('checkout-overlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    window.RG.UI?.unlockScroll();
    if (this.releaseTrap) {
      this.releaseTrap();
      this.releaseTrap = null;
    }
  },

  updateCityShippingBanner() {
    const citySelect = document.getElementById('co-city');
    const banner = document.getElementById('co-city-estimate-banner');
    const textEl = document.getElementById('co-city-estimate-text');
    const city = citySelect?.value || '';
    if (!city || !banner || !textEl) {
      if (banner) banner.hidden = true;
      return;
    }
    const totals = window.RG.Cart.getTotals(city);
    banner.hidden = false;
    const feeLabel = totals.shippingFee === 0
      ? 'Complimentary Tracked Shipping'
      : window.RG.formatDualCheckoutPrice(totals.shippingFee);
    textEl.textContent = `${city}: Estimated delivery in ${totals.shippingDays} · Courier Fee: ${feeLabel}`;
  },

  /**
   * Enforces the PKR 25,000 Cash on Delivery limit on Step 2.
   */
  enforceCodLimit() {
    const totals = window.RG.Cart.getTotals(this.formData.city);
    const codRadio = document.getElementById('pay-cod');
    const codOptionCard = codRadio?.closest('.payment-option');
    const codWarning = document.getElementById('cod-limit-warning');
    const bankRadio = document.getElementById('pay-bank');

    if (!codRadio) return;

    if (!totals.codAllowed) {
      codRadio.disabled = true;
      codOptionCard?.classList.add('is-disabled');
      if (codRadio.checked && bankRadio) {
        bankRadio.checked = true;
        this.formData.paymentMethod = bankRadio.value;
      }
      if (codWarning) {
        codWarning.hidden = false;
        codWarning.innerHTML = `
          <i class="ph ph-warning-circle" aria-hidden="true"></i>
          <div>
            <strong>Cash on Delivery Unavailable Above ${window.RG.formatPkr(totals.codLimit)}</strong>
            <p>Your order total is <strong>${window.RG.formatPkr(totals.grandTotalPkr)}</strong>, which exceeds our courier Cash on Delivery limit of ${window.RG.formatPkr(totals.codLimit)}. Please use Direct Bank Transfer (IBAN) or JazzCash / EasyPaisa below.</p>
          </div>
        `;
      }
    } else {
      codRadio.disabled = false;
      codOptionCard?.classList.remove('is-disabled');
      if (codWarning) codWarning.hidden = true;
    }
  },

  goToStep(stepNumber) {
    this.currentStep = stepNumber;
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById(`checkout-step-${i}`);
      if (el) el.hidden = (i !== stepNumber);
    }

    const progressWrap = document.getElementById('checkout-progress');
    if (progressWrap) {
      progressWrap.hidden = (stepNumber === 4);
      progressWrap.querySelectorAll('.cp-step').forEach(stepEl => {
        const sNum = parseInt(stepEl.dataset.step, 10);
        stepEl.classList.toggle('active', sNum === stepNumber);
        stepEl.classList.toggle('done', sNum < stepNumber);
        if (sNum === stepNumber) {
          stepEl.setAttribute('aria-current', 'step');
        } else {
          stepEl.removeAttribute('aria-current');
        }
      });
      progressWrap.querySelectorAll('.cp-line').forEach((line, idx) => {
        line.classList.toggle('done', idx + 1 < stepNumber);
      });
    }

    if (stepNumber === 2) {
      this.enforceCodLimit();
    }
    if (stepNumber === 3) {
      this.renderStep3Review();
    }

    setTimeout(() => {
      const firstInput = document.querySelector(`#checkout-step-${stepNumber} input:not([disabled]), #checkout-step-${stepNumber} select:not([disabled]), #checkout-step-${stepNumber} button:not([disabled])`);
      firstInput?.focus();
    }, 60);
  },

  /**
   * Normalizes and validates Pakistani mobile numbers (+92 3XX XXXXXXX or 03XX XXXXXXX).
   */
  normalizePakistaniPhone(raw) {
    const digits = String(raw || '').replace(/[\s\-()]/g, '');
    if (/^\+923\d{9}$/.test(digits)) return '+92 ' + digits.slice(3, 6) + ' ' + digits.slice(6);
    if (/^923\d{9}$/.test(digits)) return '+92 ' + digits.slice(2, 5) + ' ' + digits.slice(5);
    if (/^03\d{9}$/.test(digits)) return '+92 ' + digits.slice(1, 4) + ' ' + digits.slice(4);
    if (/^3\d{9}$/.test(digits)) return '+92 ' + digits.slice(0, 3) + ' ' + digits.slice(3);
    return null;
  },

  validateStep1() {
    const nameEl = document.getElementById('co-name');
    const phoneEl = document.getElementById('co-phone');
    const emailEl = document.getElementById('co-email');
    const cityEl = document.getElementById('co-city');
    const addrEl = document.getElementById('co-address');

    const setFieldError = (inputEl, errId, msg) => {
      const errEl = document.getElementById(errId);
      const hasErr = Boolean(msg);
      if (inputEl) {
        inputEl.classList.toggle('is-error', hasErr);
        inputEl.setAttribute('aria-invalid', String(hasErr));
      }
      if (errEl) errEl.textContent = msg || '';
      return !hasErr;
    };

    let valid = true;
    let firstInvalid = null;

    const nameVal = (nameEl?.value || '').trim();
    if (!setFieldError(nameEl, 'co-name-error', nameVal.length >= 2 ? '' : 'Please enter your full recipient name (at least 2 characters).')) {
      valid = false;
      firstInvalid = firstInvalid || nameEl;
    }

    const normalizedPhone = this.normalizePakistaniPhone(phoneEl?.value || '');
    if (!setFieldError(phoneEl, 'co-phone-error', normalizedPhone ? '' : 'Enter a valid Pakistani mobile number (e.g. 300 1234567 or 0300 1234567).')) {
      valid = false;
      firstInvalid = firstInvalid || phoneEl;
    }

    const emailVal = (emailEl?.value || '').trim();
    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      if (!setFieldError(emailEl, 'co-email-error', 'Please enter a valid email address or leave optional field blank.')) {
        valid = false;
        firstInvalid = firstInvalid || emailEl;
      }
    } else {
      setFieldError(emailEl, 'co-email-error', '');
    }

    const cityVal = (cityEl?.value || '').trim();
    if (!setFieldError(cityEl, 'co-city-error', cityVal ? '' : 'Please select your destination city for courier estimation.')) {
      valid = false;
      firstInvalid = firstInvalid || cityEl;
    }

    const addrVal = (addrEl?.value || '').trim();
    if (!setFieldError(addrEl, 'co-address-error', addrVal.length >= 10 ? '' : 'Please provide a complete street address, sector/area, and nearest landmark (min 10 characters).')) {
      valid = false;
      firstInvalid = firstInvalid || addrEl;
    }

    if (!valid) {
      firstInvalid?.focus();
      return false;
    }

    this.formData.name = nameVal;
    this.formData.phone = normalizedPhone;
    this.formData.email = emailVal;
    this.formData.city = cityVal;
    this.formData.address = addrVal;
    window.RG.Store.state.selectedCity = cityVal;
    return true;
  },

  validateStep2() {
    this.enforceCodLimit();
    const checked = document.querySelector('input[name="payment"]:checked');
    if (!checked || checked.disabled) {
      window.RG.Toast?.show('Please select an eligible payment method.', 'error');
      return false;
    }
    this.formData.paymentMethod = checked.value;
    return true;
  },

  renderStep3Review() {
    const itemsEl = document.getElementById('order-review-items');
    const summaryEl = document.getElementById('order-review-summary');
    if (!itemsEl || !summaryEl) return;

    const totals = window.RG.Cart.getTotals(this.formData.city);
    const esc = window.RG.escapeHtml;

    itemsEl.innerHTML = window.RG.Store.state.cart.map(item => `
      <div class="order-review-item">
        <div class="order-review-img">
          <img src="${esc(item.image)}" data-fallback="${esc(item.fallback)}" alt="${esc(item.name)}" width="56" height="70" loading="lazy">
        </div>
        <div class="order-review-info">
          <p class="order-review-name">${esc(item.name)}</p>
          <p class="order-review-meta">${esc([item.region, item.size, item.color].filter(Boolean).join(' · '))} × ${item.qty}</p>
        </div>
        <div class="order-review-price">
          <strong>${window.RG.formatDualCheckoutPrice(item.price * item.qty)}</strong>
        </div>
      </div>
    `).join('');

    summaryEl.innerHTML = `
      <div class="order-review-row">
        <span>Items Subtotal (${totals.itemCount} piece${totals.itemCount !== 1 ? 's' : ''})</span>
        <span>${window.RG.formatDualCheckoutPrice(totals.rawSubtotal)}</span>
      </div>
      ${totals.discountPkr > 0 ? `
        <div class="order-review-row is-discount">
          <span>Promo Discount (${esc(totals.promoEval.code)})</span>
          <span>−${window.RG.formatDualCheckoutPrice(totals.discountPkr)}</span>
        </div>
      ` : ''}
      ${totals.giftWrapFee > 0 ? `
        <div class="order-review-row">
          <span>Archival Gift Box &amp; Wax Seal</span>
          <span>${window.RG.formatDualCheckoutPrice(totals.giftWrapFee)}</span>
        </div>
      ` : ''}
      ${totals.qualifiesFreeGift ? `
        <div class="order-review-row is-discount">
          <span>Tier 2 Collector Privilege</span>
          <span>Complimentary Cedar Sachet &amp; Story Booklet</span>
        </div>
      ` : ''}
      <div class="order-review-row">
        <span>Tracked Courier (${esc(this.formData.city)} · ${esc(totals.shippingDays)})</span>
        <span>${totals.shippingFee === 0 ? 'Complimentary' : window.RG.formatDualCheckoutPrice(totals.shippingFee)}</span>
      </div>
      <div class="order-review-row">
        <span>Recipient &amp; Contact</span>
        <span>${esc(this.formData.name)} · ${esc(this.formData.phone)}</span>
      </div>
      <div class="order-review-row">
        <span>Delivery Address</span>
        <span>${esc(this.formData.address)}, ${esc(this.formData.city)}</span>
      </div>
      <div class="order-review-row">
        <span>Payment Method</span>
        <span><strong>${esc(this.formData.paymentMethod)}</strong></span>
      </div>
      ${window.RG.Store.state.orderNote ? `
        <div class="order-review-row">
          <span>Gift / Tailoring Note</span>
          <span>"${esc(window.RG.Store.state.orderNote)}"</span>
        </div>
      ` : ''}
      <div class="order-review-row total">
        <span>Total Payable (Settled in PKR)</span>
        <span>${window.RG.formatDualCheckoutPrice(totals.grandTotalPkr)}</span>
      </div>
    `;
  },

  buildOrderSummaryText(order) {
    const lines = [
      `✦ *ReGongches Official Heritage Order* ✦`,
      `Order Reference: *${order.id}*`,
      `Date: ${order.date}`,
      ``,
      `*Customer & Delivery Details:*`,
      `• Name: ${order.customer}`,
      `• Phone: ${order.phone}`,
      order.email ? `• Email: ${order.email}` : null,
      `• City: ${order.city} (${order.eta})`,
      `• Address: ${order.address}`,
      `• Payment Method: ${order.payment}`,
      ``,
      `*Ordered Heritage Pieces:*`,
      ...order.items.map((it, idx) => `${idx + 1}. ${it.name} [${[it.size, it.color].filter(Boolean).join(', ')}] × ${it.qty} = PKR ${(it.price * it.qty).toLocaleString('en-PK')}`),
      ``,
      `*Financial Summary (PKR):*`,
      `• Items Subtotal: PKR ${order.subtotalPkr.toLocaleString('en-PK')}`,
      order.discountPkr > 0 ? `• Promo Discount (${order.promoCode}): -PKR ${order.discountPkr.toLocaleString('en-PK')}` : null,
      order.giftWrapPkr > 0 ? `• Archival Gift Wrapping: PKR ${order.giftWrapPkr.toLocaleString('en-PK')}` : null,
      order.freeGiftUnlocked ? `• Collector Bonus: Free Himalayan Cedar Sachet & Story Booklet` : null,
      `• Tracked Shipping (${order.city}): ${order.shippingPkr === 0 ? 'Complimentary' : `PKR ${order.shippingPkr.toLocaleString('en-PK')}`}`,
      `• *GRAND TOTAL: PKR ${order.totalPkr.toLocaleString('en-PK')}*`,
      order.note ? `\n*Note / Gift Message:* ${order.note}` : null
    ].filter(Boolean);
    return lines.join('\n');
  },

  async completeOrder() {
    const totals = window.RG.Cart.getTotals(this.formData.city);
    if (totals.isEmpty) return;

    const orderId = `RG-${Date.now().toString(36).slice(-3).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const orderRecord = {
      id: orderId,
      date: new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }),
      timestamp: new Date().toISOString(),
      customer: this.formData.name,
      phone: this.formData.phone,
      email: this.formData.email || '',
      city: this.formData.city,
      address: this.formData.address,
      payment: this.formData.paymentMethod,
      items: window.RG.Store.state.cart.map(i => ({
        id: i.id,
        sku: i.sku,
        name: i.name,
        region: i.region,
        qty: i.qty,
        size: i.size,
        color: i.color,
        price: i.price
      })),
      subtotalPkr: totals.rawSubtotal,
      discountPkr: totals.discountPkr,
      promoCode: totals.promoEval.valid ? totals.promoEval.code : null,
      giftWrapPkr: totals.giftWrapFee,
      shippingPkr: totals.shippingFee,
      freeGiftUnlocked: totals.qualifiesFreeGift,
      totalPkr: totals.grandTotalPkr,
      eta: totals.shippingDays,
      note: window.RG.Store.state.orderNote || '',
      stage: 2
    };

    // 1. Save to local device Order Tracker (honestly labelled)
    const keys = this.cfg.storageKeys;
    const existingOrders = window.RG.SafeStorage.get(keys.orders, []);
    window.RG.Store.state.orders = [orderRecord, ...existingOrders].slice(0, 20);
    window.RG.SafeStorage.set(keys.orders, window.RG.Store.state.orders);
    this.lastOrder = orderRecord;

    // 2. Build WhatsApp Handoff URL
    const summaryText = this.buildOrderSummaryText(orderRecord);
    const waUrl = `https://wa.me/${this.cfg.contact.whatsappNumber}?text=${encodeURIComponent(summaryText)}`;

    // 3. Optional Formspree / Google Apps Script Webhook POST
    const endpointUrl = (this.cfg.orderHandoff.endpointUrl || '').trim();
    const webhookStatusEl = document.getElementById('order-webhook-status');
    if (endpointUrl) {
      if (webhookStatusEl) {
        webhookStatusEl.hidden = false;
        webhookStatusEl.textContent = 'Transmitting order to studio endpoint…';
      }
      try {
        const res = await fetch(endpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(orderRecord)
        });
        if (webhookStatusEl) {
          webhookStatusEl.textContent = res.ok
            ? '✓ Order automatically logged to ReGongches Studio server.'
            : 'Studio server busy — please click "Send Order via WhatsApp" below to confirm dispatch.';
        }
      } catch {
        if (webhookStatusEl) {
          webhookStatusEl.textContent = 'Offline/static mode — please confirm your order via WhatsApp below.';
        }
      }
    } else if (webhookStatusEl) {
      webhookStatusEl.hidden = false;
      webhookStatusEl.textContent = '\u26a0\ufe0f Order endpoint not configured - your request is saved in this browser only. Please send via WhatsApp below to notify our studio. Your order is NOT confirmed until acknowledged.';
    }

    // 4. Clear cart & render confirmation screen
    window.RG.Cart.clear();
    this.renderStep4Confirmation(orderRecord, waUrl);
    this.goToStep(4);

    // 5. Auto-open WhatsApp in a new tab if enabled
    if (this.cfg.orderHandoff.autoOpenWhatsAppOnSubmit) {
      try {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } catch {}
    }
  },

  renderStep4Confirmation(order, waUrl) {
    const esc = window.RG.escapeHtml;
    const numEl = document.getElementById('order-num');
    if (numEl) {
      // HONEST LANGUAGE: This is a request, not a confirmed order, until WhatsApp/webhook is acknowledged
      const endpointConfigured = Boolean((this.cfg.orderHandoff.endpointUrl || '').trim());
      const statusLabel = endpointConfigured
        ? 'Order Request Submitted'
        : 'Order Request Prepared — Action Required';
      numEl.innerHTML = `${esc(statusLabel)}: <strong>${esc(order.id)}</strong>`;
    }

    const waBtn = document.getElementById('order-whatsapp-btn');
    if (waBtn) {
      waBtn.href = waUrl;
    }

    const invCard = document.getElementById('order-invoice-card');
    if (invCard) {
      invCard.innerHTML = `
        <div class="invoice-header">
          <div>
            <strong>${esc(this.cfg.brand.name)} — ${esc(this.cfg.brand.tagline)}</strong>
            <p>${esc(this.cfg.contact.studioAddress)}</p>
          </div>
          <div class="invoice-meta-right">
            <span>Invoice Ref: <strong>${esc(order.id)}</strong></span>
            <span>Date: ${esc(order.date)}</span>
          </div>
        </div>
        <div class="invoice-grid">
          <div>
            <strong>Recipient:</strong> ${esc(order.customer)}<br>
            <strong>Phone:</strong> ${esc(order.phone)}${order.email ? `<br><strong>Email:</strong> ${esc(order.email)}` : ''}
          </div>
          <div>
            <strong>Destination:</strong> ${esc(order.address)}, ${esc(order.city)}<br>
            <strong>Payment:</strong> ${esc(order.payment)}<br>
            <strong>Estimated Transit:</strong> ${esc(order.eta)}
          </div>
        </div>
        <table class="invoice-items-table">
          <thead>
            <tr>
              <th>Piece &amp; Provenance</th>
              <th>Variant</th>
              <th>Qty</th>
              <th>Total (PKR)</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(it => `
              <tr>
                <td><strong>${esc(it.name)}</strong> <small>(${esc(it.region || 'GB')})</small></td>
                <td>${esc([it.size, it.color].filter(Boolean).join(' · '))}</td>
                <td>${it.qty}</td>
                <td>${window.RG.formatPkr(it.price * it.qty)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="invoice-totals">
          <div><span>Items Subtotal:</span> <span>${window.RG.formatPkr(order.subtotalPkr)}</span></div>
          ${order.discountPkr > 0 ? `<div><span>Promo (${esc(order.promoCode)}):</span> <span>−${window.RG.formatPkr(order.discountPkr)}</span></div>` : ''}
          ${order.giftWrapPkr > 0 ? `<div><span>Archival Gift Wrapping:</span> <span>${window.RG.formatPkr(order.giftWrapPkr)}</span></div>` : ''}
          ${order.freeGiftUnlocked ? `<div><span>Tier 2 Collector Gift:</span> <span>Free Cedar Sachet &amp; Story Booklet</span></div>` : ''}
          <div><span>Tracked Shipping (${esc(order.city)}):</span> <span>${order.shippingPkr === 0 ? 'Complimentary' : window.RG.formatPkr(order.shippingPkr)}</span></div>
          <div class="invoice-grand-total"><span>Grand Total (PKR):</span> <strong>${window.RG.formatPkr(order.totalPkr)}</strong></div>
        </div>
        ${order.note ? `<p class="invoice-note"><strong>Customer Gift / Tailoring Note:</strong> "${esc(order.note)}"</p>` : ''}
      `;
    }
  }
};

window.RG.Checkout = Checkout;
