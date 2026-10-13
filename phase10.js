/**
 * ReGongches — Phase 10: Motion, Transitions & Premium UI/UX
 * ─────────────────────────────────────────────────────────────────────────────
 * Fully self-contained. Runs AFTER main script.js.
 * All animation uses transform/opacity only (GPU-composited).
 * Every scroll/resize handler uses passive listeners + rAF throttling.
 * Respects prefers-reduced-motion throughout.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ── HELPERS ── */
const p10$ = (sel, ctx = document) => ctx.querySelector(sel);
const p10$$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ══════════════════════════════════════════════════════════════
   10.3 PRELOADER
══════════════════════════════════════════════════════════════ */
function initPreloader() {
  const preloader = p10$('#preloader');
  if (!preloader) return;

  // Skip if cached (sessionStorage flag) or reduced-motion
  if (
    sessionStorage.getItem('p10-preloader-shown') ||
    reducedMotion()
  ) {
    preloader.classList.add('is-done');
    startHeroSequence();
    return;
  }

  // Dismiss after ≤1s
  const dismiss = () => {
    preloader.classList.add('is-done');
    sessionStorage.setItem('p10-preloader-shown', '1');
    startHeroSequence();
  };

  // Fade out after 900ms (never longer than 1s total)
  setTimeout(dismiss, 900);
}

/* ══════════════════════════════════════════════════════════════
   10.3 HERO ENTRANCE SEQUENCE
══════════════════════════════════════════════════════════════ */
function splitTitleWords() {
  const title = p10$('.hero-title');
  if (!title) return;

  // Wrap each word in a span (preserve em tags)
  const words = [];
  title.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/(\s+)/).forEach(part => {
        if (part.trim()) words.push({ type: 'text', content: part.trim() });
        else if (part) words.push({ type: 'space', content: part });
      });
    } else if (node.nodeName === 'EM') {
      words.push({ type: 'em', content: node.textContent.trim() });
    }
  });

  title.innerHTML = words
    .map(w => {
      if (w.type === 'space') return ' ';
      if (w.type === 'em') return `<em><span class="word">${w.content}</span></em>`;
      return `<span class="word">${w.content}</span>`;
    })
    .join('');
}

function startHeroSequence() {
  if (reducedMotion()) {
    // Immediately visible
    p10$$('[data-hero-animate]').forEach(el => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    p10$$('.hero-title .word').forEach(w => {
      w.style.opacity = 1;
      w.style.transform = 'none';
    });
    return;
  }

  const heroEl = p10$('#hero');
  if (heroEl) heroEl.classList.add('hero-animated'); // enables Ken Burns

  const delays = {
    eyebrow: 0,
    rule: 100,
    text: 500,
    buttons: 650,
    scrollCue: 1000,
  };

  // Apply animation delays to hero elements via inline style
  const eyebrow = p10$('.hero-eyebrow[data-hero-animate]');
  const rule    = p10$('.hero-rule[data-hero-animate]');
  const text    = p10$('.hero-text[data-hero-animate]');
  const buttons = p10$('.hero-buttons[data-hero-animate]');

  if (eyebrow) eyebrow.style.animationDelay = `${delays.eyebrow}ms`;
  if (rule)    rule.style.animationDelay    = `${delays.rule}ms`;
  if (text)    text.style.animationDelay    = `${delays.text}ms`;
  if (buttons) buttons.style.animationDelay = `${delays.buttons}ms`;

  // Title words stagger: 150ms base + 70ms each
  p10$$('.hero-title .word').forEach((w, i) => {
    w.style.animationDelay = `${150 + i * 70}ms`;
  });
}

/* ══════════════════════════════════════════════════════════════
   10.4 ENHANCED REVEAL OBSERVER
   (supplements existing initReveal in script.js)
══════════════════════════════════════════════════════════════ */
function initRevealEnhanced() {
  // Set --i CSS custom property for stagger children
  const staggerParents = p10$$('[data-reveal-stagger]');
  staggerParents.forEach(parent => {
    [...parent.children].forEach((child, i) => {
      child.style.setProperty('--i', Math.min(i, 7));
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   10.4 PARALLAX — hero content at 0.3× speed
   Desktop only (≥1024px), uses rAF, never background-attachment:fixed
══════════════════════════════════════════════════════════════ */
function initParallax() {
  if (reducedMotion()) return;

  const heroContent = p10$('#hero-content');
  if (!heroContent) return;

  let rAF = 0;

  function update() {
    rAF = 0;
    if (window.innerWidth < 1024) return;
    const y = window.scrollY;
    const max = p10$('#hero')?.offsetHeight || 800;
    if (y > max) return;

    const offset = y * 0.3;
    const opacity = Math.max(0, 1 - y / (max * 0.8));
    heroContent.style.transform = `translate3d(0, ${offset}px, 0)`;
    heroContent.style.opacity = opacity;
  }

  window.addEventListener('scroll', () => {
    if (!rAF) rAF = requestAnimationFrame(update);
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════════
   10.4 PAGE VISIBILITY — pause Ken Burns / marquee when tab hidden
══════════════════════════════════════════════════════════════ */
function initVisibilityPause() {
  document.addEventListener('visibilitychange', () => {
    const hero = p10$('#hero');
    if (!hero) return;
    if (document.hidden) {
      hero.style.animationPlayState = 'paused';
    } else {
      hero.style.animationPlayState = '';
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   10.5 HAMBURGER MORPH
══════════════════════════════════════════════════════════════ */
function initHamburgerMorph() {
  const btn = p10$('#mobile-menu-btn');
  if (!btn) return;

  // Mirror open/close state from existing drawer logic
  const observer = new MutationObserver(() => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.classList.toggle('is-open', expanded);
  });
  observer.observe(btn, { attributes: true, attributeFilter: ['aria-expanded'] });
}

/* ══════════════════════════════════════════════════════════════
   10.5 NAV SCROLL-SPY + SLIDING INDICATOR
══════════════════════════════════════════════════════════════ */
function initScrollSpy() {
  const sections = p10$$('section[id], div[id].value-bar');
  const navLinks = p10$$('.desktop-nav .nav-link[href]');
  if (!sections.length || !navLinks.length) return;

  let rAF = 0;

  function update() {
    rAF = 0;
    const y = window.scrollY + 120;
    let activeId = '';

    sections.forEach(section => {
      if (y >= section.offsetTop) activeId = section.id;
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const isActive = href === `#${activeId}`;
      link.classList.toggle('active', isActive);
    });
  }

  window.addEventListener('scroll', () => {
    if (!rAF) rAF = requestAnimationFrame(update);
  }, { passive: true });
  update();
}

/* ══════════════════════════════════════════════════════════════
   10.6 FLIP PRODUCT GRID
   Called when renderCatalogue runs — patches the function
══════════════════════════════════════════════════════════════ */
function initFLIPGrid() {
  const grid = p10$('#product-grid');
  if (!grid) return;

  // Patch renderCatalogue to record positions first
  const origRender = window.renderCatalogue;
  if (!origRender) return;

  window.renderCatalogue = function () {
    if (reducedMotion()) { origRender(); return; }

    // Record "First" positions
    const first = new Map();
    [...grid.children].forEach(el => {
      const id = el.dataset.productId;
      if (id) first.set(id, el.getBoundingClientRect());
    });

    // Execute the render (DOM mutates)
    origRender();

    // Play: animate from old to new position
    [...grid.children].forEach(el => {
      const id = el.dataset.productId;
      if (!id || !first.has(id)) {
        // New card: fade+rise in
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
        requestAnimationFrame(() => {
          el.style.transition = `opacity 350ms cubic-bezier(0.16,1,0.3,1), transform 350ms cubic-bezier(0.16,1,0.3,1)`;
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
        return;
      }

      const last = el.getBoundingClientRect();
      const prev = first.get(id);
      const dx = prev.left - last.left;
      const dy = prev.top - last.top;

      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

      // Invert
      el.style.transition = 'none';
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      // Play
      requestAnimationFrame(() => {
        el.style.transition = `transform 450ms cubic-bezier(0.16,1,0.3,1)`;
        el.style.transform = 'none';
      });
    });
  };
}

/* ══════════════════════════════════════════════════════════════
   10.6 FLY-TO-CART ANIMATION
══════════════════════════════════════════════════════════════ */
function flyToCart(sourceEl) {
  if (reducedMotion()) return;

  const cartBtn = p10$('#cart-btn, #cart-tab-btn');
  if (!cartBtn || !sourceEl) return;

  const srcRect = sourceEl.getBoundingClientRect();
  const dstRect = cartBtn.getBoundingClientRect();

  // Clone the image or card thumbnail
  const img = sourceEl.querySelector('img.card-img') || sourceEl.querySelector('img');
  if (!img) return;

  const clone = document.createElement('div');
  clone.className = 'fly-to-cart-clone';
  clone.style.cssText = `
    left: ${srcRect.left}px;
    top: ${srcRect.top}px;
    width: ${srcRect.width}px;
    height: ${srcRect.height}px;
    background: url("${img.currentSrc || img.src}") center/cover;
  `;
  document.body.appendChild(clone);

  const dstX = dstRect.left + dstRect.width / 2 - srcRect.left - srcRect.width / 2;
  const dstY = dstRect.top  + dstRect.height / 2 - srcRect.top  - srcRect.height / 2;

  clone.animate(
    [
      { transform: 'translate3d(0,0,0) scale(1)',        opacity: 1 },
      { transform: `translate3d(${dstX}px,${dstY}px,0) scale(0.15)`, opacity: 0.6, offset: 0.85 },
      { transform: `translate3d(${dstX}px,${dstY}px,0) scale(0.08)`, opacity: 0 },
    ],
    { duration: 600, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards' }
  ).finished.then(() => clone.remove());
}

/* ══════════════════════════════════════════════════════════════
   10.5 CART BADGE POP (replaces old bounce class)
══════════════════════════════════════════════════════════════ */
function popCartBadge() {
  const badge = p10$('#cart-badge');
  if (!badge) return;
  badge.classList.remove('is-popping', 'bounce');
  void badge.offsetWidth; // reflow
  badge.classList.add('is-popping');
  badge.addEventListener('animationend', () => badge.classList.remove('is-popping'), { once: true });
}

/* ══════════════════════════════════════════════════════════════
   10.6 ADD-TO-CART STATE MACHINE
   Upgrades the quick-add buttons with loading → success states
══════════════════════════════════════════════════════════════ */
function upgradeATCButtons() {
  // Upgrade the QV add button and any .card-quick-add buttons
  function upgradeBtn(btn) {
    if (btn.dataset.atcUpgraded) return;
    btn.dataset.atcUpgraded = '1';
    btn.classList.add('btn-atc');

    const label = btn.innerHTML;
    btn.innerHTML = `
      <span class="atc-label">${label}</span>
      <span class="atc-loading" aria-hidden="true">
        <span class="atc-spinner"></span>
      </span>
      <span class="atc-success" aria-hidden="true">
        <svg class="atc-check" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
          <polyline points="4 12 10 18 20 6"/>
        </svg>
        Added
      </span>`;

    const origClick = btn.onclick;
    btn.onclick = null;

    btn.addEventListener('click', e => {
      if (btn.classList.contains('is-loading') || btn.classList.contains('is-success')) {
        e.stopPropagation();
        return;
      }
      // Fly to cart from the card
      const card = btn.closest('.product-card');
      if (card) flyToCart(card);

      btn.classList.add('is-loading');
      btn.setAttribute('aria-busy', 'true');

      // Simulate 400ms loading (real add happens in Cart.add)
      setTimeout(() => {
        btn.classList.remove('is-loading');
        btn.classList.add('is-success');
        btn.setAttribute('aria-busy', 'false');
        popCartBadge();

        // Return to idle after 1800ms
        setTimeout(() => {
          btn.classList.remove('is-success');
        }, 1800);
      }, 400);

      // Delegate to original click handler
      if (origClick) origClick.call(btn, e);
    }, true);
  }

  // Observe DOM for new buttons (catalogue re-renders)
  const mo = new MutationObserver(() => {
    p10$$('.card-quick-add').forEach(upgradeBtn);
    const qvAdd = p10$('#qv-add-btn');
    if (qvAdd) upgradeBtn(qvAdd);
  });
  mo.observe(document.body, { childList: true, subtree: true });
  p10$$('.card-quick-add').forEach(upgradeBtn);
}

/* ══════════════════════════════════════════════════════════════
   10.6 WISHLIST HEART BURST — gold particle spray
══════════════════════════════════════════════════════════════ */
function initWishlistBurst() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-wishlist-id]');
    if (!btn) return;
    const wished = btn.classList.contains('is-wishlisted') ||
                   btn.nextElementSibling?.classList?.contains('is-wishlisted');

    // Only burst on ADD (after toggle; check icon)
    setTimeout(() => {
      const icon = btn.querySelector('i');
      const isNowWished = icon?.className?.includes('-fill') ||
                          btn.classList.contains('is-wishlisted');
      if (!isNowWished || reducedMotion()) return;

      btn.classList.add('is-animating');
      btn.addEventListener('animationend', () => btn.classList.remove('is-animating'), { once: true });

      // Spray 6 particles
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angles = [0, 60, 120, 180, 240, 300];

      angles.forEach(angle => {
        const rad = (angle * Math.PI) / 180;
        const dist = 22 + Math.random() * 12;
        const tx = `translate(${(Math.cos(rad) * dist).toFixed(1)}px, ${(Math.sin(rad) * dist).toFixed(1)}px)`;

        const p = document.createElement('span');
        p.className = 'heart-particle';
        p.style.cssText = `
          left: ${cx - 2.5}px;
          top:  ${cy - 2.5}px;
          position: fixed;
          --tx: ${tx};
        `;
        document.body.appendChild(p);
        p.addEventListener('animationend', () => p.remove(), { once: true });
      });
    }, 50);
  });
}

/* ══════════════════════════════════════════════════════════════
   10.6 IMAGE BLUR-UP — applied to all lazy-loaded images
══════════════════════════════════════════════════════════════ */
function initImageBlurUp() {
  function applyBlurUp(img) {
    if (img.dataset.blurUpApplied) return;
    img.dataset.blurUpApplied = '1';
    img.setAttribute('data-blur-up', '');
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('is-loaded');
    } else {
      img.addEventListener('load', () => {
        requestAnimationFrame(() => img.classList.add('is-loaded'));
      }, { once: true });
      img.addEventListener('error', () => {
        img.classList.add('is-loaded'); // don't stay invisible on error
      }, { once: true });
    }
  }

  // Apply to all existing product card images and future ones
  const mo = new MutationObserver(() => {
    p10$$('.card-img, .card-img-hover, .qv-main-img').forEach(applyBlurUp);
  });
  mo.observe(document.body, { childList: true, subtree: true });
  p10$$('.card-img, .card-img-hover').forEach(applyBlurUp);
}

/* ══════════════════════════════════════════════════════════════
   10.7 TOAST PROGRESS DRAIN + HOVER-PAUSE
══════════════════════════════════════════════════════════════ */
function initToastProgress() {
  // Observe toast container for new toasts
  const container = p10$('#toast-container');
  if (!container) return;

  const mo = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1 || !node.classList?.contains('toast')) return;
        if (reducedMotion()) return;

        const duration = 3500; // matches auto-dismiss
        const progress = document.createElement('div');
        progress.className = 'toast-progress';
        progress.style.animationDuration = `${duration}ms`;
        node.appendChild(progress);
      });
    });
  });
  mo.observe(container, { childList: true });
}

/* ══════════════════════════════════════════════════════════════
   10.7 DRAWER SWIPE-TO-CLOSE (touch)
══════════════════════════════════════════════════════════════ */
function initSwipeClose() {
  function addSwipe(drawerId, closeFn) {
    const drawer = p10$(`#${drawerId}`);
    if (!drawer || !closeFn) return;

    let startX = 0, currentX = 0, dragging = false;

    drawer.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      dragging = true;
      drawer.style.transition = 'none';
    }, { passive: true });

    drawer.addEventListener('touchmove', e => {
      if (!dragging) return;
      currentX = e.touches[0].clientX;
      const delta = currentX - startX;
      if (delta > 0) {
        drawer.style.transform = `translateX(${delta}px)`;
      }
    }, { passive: true });

    drawer.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      const delta = currentX - startX;
      drawer.style.transition = '';

      if (delta > 80) {
        closeFn();
      } else {
        drawer.style.transform = ''; // spring back
      }
      startX = 0; currentX = 0;
    });
  }

  // Hook once script.js has set up the close functions (they're globals)
  setTimeout(() => {
    addSwipe('cart-drawer', window.closeCart);
    addSwipe('wishlist-drawer', window.closeWishlist);
    addSwipe('mobile-nav-drawer', () => p10$('#mobile-drawer-close')?.click());
  }, 200);
}

/* ══════════════════════════════════════════════════════════════
   10.9 CURSOR DOT FOLLOWER (desktop ≥1024px)
   lerp smoothing factor: 0.15
══════════════════════════════════════════════════════════════ */
function initCursorDot() {
  if (reducedMotion()) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.innerWidth < 1024) return;

  const dot = p10$('#cursor-dot');
  if (!dot) return;

  let mx = 0, my = 0, cx = 0, cy = 0, rAF = 0;
  const lerp = (a, b, t) => a + (b - a) * t;

  function loop() {
    cx = lerp(cx, mx, 0.15);
    cy = lerp(cy, my, 0.15);
    dot.style.left = `${cx}px`;
    dot.style.top  = `${cy}px`;
    rAF = requestAnimationFrame(loop);
  }

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    if (!rAF) rAF = requestAnimationFrame(loop);
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    cancelAnimationFrame(rAF);
    rAF = 0;
  });

  // Expand on product images and gallery tiles
  document.addEventListener('mouseover', e => {
    const over = e.target.closest('.card-img-wrap, .qv-main-img, .journal-img, .cat-img');
    if (over) {
      dot.classList.add('is-expanded');
      dot.textContent = 'View';
    } else {
      dot.classList.remove('is-expanded');
      dot.textContent = '';
    }
  });

  loop();
}

/* ══════════════════════════════════════════════════════════════
   10.8 BACK-TO-TOP with is-visible class
══════════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = p10$('#back-to-top');
  if (!btn) return;

  let rAF = 0;
  function update() {
    rAF = 0;
    btn.classList.toggle('is-visible', window.scrollY > 600);
  }
  window.addEventListener('scroll', () => {
    if (!rAF) rAF = requestAnimationFrame(update);
  }, { passive: true });
  update();

  btn.addEventListener('click', () => {
    if (reducedMotion()) { window.scrollTo({ top: 0 }); return; }
    // Smooth scroll with easing (JS fallback for Safari)
    const start = window.scrollY;
    const duration = 600;
    const startTime = performance.now();

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start * (1 - easeInOut(progress)));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

/* ══════════════════════════════════════════════════════════════
   10.9 OFFLINE TOAST
══════════════════════════════════════════════════════════════ */
function initOfflineToast() {
  if (!window.Toast) return; // depends on Toast from script.js

  window.addEventListener('online',  () => Toast.show('You\'re back online.', 'success'));
  window.addEventListener('offline', () => Toast.show('You appear to be offline — cart is saved locally.', 'error', 0));
}

/* ══════════════════════════════════════════════════════════════
   10.5 HEADER HYSTERESIS (add at 80px, remove at 40px)
══════════════════════════════════════════════════════════════ */
function patchHeaderHysteresis() {
  // The header scroll logic in script.js already has basic hysteresis.
  // This just ensures the hide-on-mobile uses a 10px delta threshold.
  // Already implemented in initHeader() — no additional work needed.
}

/* ══════════════════════════════════════════════════════════════
   FREE DELIVERY BAR — animate scaleX + gold shimmer on threshold
══════════════════════════════════════════════════════════════ */
function patchFreeDeliveryBar() {
  const bar = p10$('#fdbar-fill');
  if (!bar) return;

  const mo = new MutationObserver(() => {
    const w = parseFloat(bar.style.width) || 0;
    bar.classList.toggle('is-reached', w >= 100);
  });
  mo.observe(bar, { attributes: true, attributeFilter: ['style'] });
}

/* ══════════════════════════════════════════════════════════════
   SCROLL PROGRESS — already created by script.js, keep alive
══════════════════════════════════════════════════════════════ */
function ensureScrollProgress() {
  // script.js already calls initScrollProgress(). Nothing extra needed.
}

/* ══════════════════════════════════════════════════════════════
   INIT — wait for DOMContentLoaded (or run immediately if ready)
══════════════════════════════════════════════════════════════ */
function p10Init() {
  // Split hero title words first (before preloader hides them)
  splitTitleWords();

  // Preloader
  initPreloader();

  // Enhanced stagger
  initRevealEnhanced();

  // Parallax
  initParallax();

  // Page Visibility pause
  initVisibilityPause();

  // Hamburger morph
  initHamburgerMorph();

  // Scroll-spy
  initScrollSpy();

  // FLIP grid
  initFLIPGrid();

  // ATC state machine
  upgradeATCButtons();

  // Wishlist burst
  initWishlistBurst();

  // Image blur-up
  initImageBlurUp();

  // Toast progress
  initToastProgress();

  // Swipe to close
  initSwipeClose();

  // Cursor dot
  initCursorDot();

  // Back-to-top
  initBackToTop();

  // Offline toast
  initOfflineToast();

  // Free delivery bar
  patchFreeDeliveryBar();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', p10Init);
} else {
  p10Init();
}
