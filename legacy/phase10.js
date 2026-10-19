/**
 * ReGongches — Phase 10 v2: Premium Motion & Interactions
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs AFTER main script.js. Every animation uses transform/opacity only.
 * All scroll/resize handlers: passive + rAF-throttled.
 * Full prefers-reduced-motion support throughout.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * NEW in v2:
 *  • 3-D product card tilt (gyroscopic, springs back)
 *  • Magnetic hover on primary CTAs
 *  • Ink-wave click ripple on all buttons
 *  • Cart-drawer item stagger on open
 *  • Region tab panel cross-fade
 *  • Desktop drag-to-scroll for carousels & social gallery
 *  • Feature number count-up on scroll reveal
 *  • Filter-chip animated sliding pill indicator
 *  • FLIP grid (double-rAF fix for Chrome)
 *  • Improved cursor-dot with speed-based opacity
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ── HELPERS ──────────────────────────────────────────────────────────────── */
const p10$  = (sel, ctx = document) => ctx.querySelector(sel);
const p10$$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const rm    = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lerp  = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ══════════════════════════════════════════════════════════════════════════════
   §1  PRELOADER
══════════════════════════════════════════════════════════════════════════════ */
function initPreloader() {
  const loader = p10$('#preloader');
  if (!loader) return;

  if (sessionStorage.getItem('p10-shown') || rm()) {
    loader.classList.add('is-done');
    startHeroSequence();
    return;
  }

  setTimeout(() => {
    loader.classList.add('is-done');
    sessionStorage.setItem('p10-shown', '1');
    startHeroSequence();
  }, 950);
}

/* ══════════════════════════════════════════════════════════════════════════════
   §2  HERO ENTRANCE SEQUENCE
══════════════════════════════════════════════════════════════════════════════ */
function splitTitleWords() {
  const title = p10$('.hero-title');
  if (!title) return;
  const frag = [];
  title.childNodes.forEach(n => {
    if (n.nodeType === Node.TEXT_NODE) {
      n.textContent.split(/(\s+)/).forEach(p => {
        if (p.trim()) frag.push(`<span class="word">${p.trim()}</span>`);
        else if (p) frag.push(' ');
      });
    } else if (n.nodeName === 'EM') {
      frag.push(`<em><span class="word">${n.textContent.trim()}</span></em>`);
    }
  });
  title.innerHTML = frag.join('');
}

function startHeroSequence() {
  if (rm()) {
    p10$$('[data-hero-animate], .hero-title .word').forEach(el => {
      el.style.opacity = 1;
      el.style.transform = 'none';
      el.style.animation = 'none';
    });
    return;
  }
  p10$('#hero')?.classList.add('hero-animated');

  const delays = { eyebrow: 0, rule: 120, text: 520, buttons: 680 };
  const map = {
    '.hero-eyebrow[data-hero-animate]': 'eyebrow',
    '.hero-rule[data-hero-animate]':    'rule',
    '.hero-text[data-hero-animate]':    'text',
    '.hero-buttons[data-hero-animate]': 'buttons',
  };
  Object.entries(map).forEach(([sel, key]) => {
    const el = p10$(sel);
    if (el) el.style.animationDelay = `${delays[key]}ms`;
  });
  p10$$('.hero-title .word').forEach((w, i) => {
    w.style.animationDelay = `${160 + i * 65}ms`;
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
   §3  3-D PRODUCT CARD TILT
   gyroscopic tilt up to ±8° — GPU via transform, springs back on leave
══════════════════════════════════════════════════════════════════════════════ */
function initCardTilt() {
  if (rm()) return;
  if (window.matchMedia('(pointer: coarse)').matches) return; // no tilt on touch

  const MAX_DEG = 8;
  const SCALE   = 1.03;

  function onMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const rotX = clamp(-dy * MAX_DEG, -MAX_DEG, MAX_DEG);
    const rotY = clamp( dx * MAX_DEG, -MAX_DEG, MAX_DEG);

    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${SCALE},${SCALE},${SCALE})`;

    // Parallax gloss highlight
    const gloss = card._gloss;
    if (gloss) {
      const gx = 50 + dx * 30;
      const gy = 50 + dy * 30;
      gloss.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.14) 0%, transparent 65%)`;
    }
  }

  function onLeave(e) {
    const card = e.currentTarget;
    card.style.transition = `transform 500ms cubic-bezier(0.16,1,0.3,1)`;
    card.style.transform  = '';
    const gloss = card._gloss;
    if (gloss) gloss.style.background = '';
    // Reset so the next mousemove isn't interrupted
    card.addEventListener('transitionend', () => {
      card.style.transition = '';
    }, { once: true });
  }

  function attachTilt(card) {
    if (card.dataset.tiltAttached) return;
    card.dataset.tiltAttached = '1';
    card.style.transformStyle = 'preserve-3d';
    card.style.willChange     = 'transform';

    // Gloss overlay (sits on top of everything, pointer-events: none)
    const gloss = document.createElement('div');
    gloss.style.cssText = `
      position:absolute;inset:0;border-radius:inherit;
      pointer-events:none;z-index:10;
      transition:background 150ms ease;
    `;
    card.appendChild(gloss);
    card._gloss = gloss;

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  }

  // Initial cards + future DOM additions
  const mo = new MutationObserver(() => {
    p10$$('.product-card').forEach(attachTilt);
  });
  mo.observe(p10$('#product-grid') || document.body, { childList: true, subtree: true });
  p10$$('.product-card').forEach(attachTilt);
  p10$$('.category-card, .gift-card, .journal-card').forEach(attachTilt);
}

/* ══════════════════════════════════════════════════════════════════════════════
   §4  MAGNETIC BUTTON HOVER
   CTAs shift toward the cursor by up to 8px
══════════════════════════════════════════════════════════════════════════════ */
function initMagneticButtons() {
  if (rm()) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const STRENGTH = 0.35; // 0 = none, 1 = full follow

  function attach(btn) {
    if (btn.dataset.magnet) return;
    btn.dataset.magnet = '1';

    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * STRENGTH;
      const dy = (e.clientY - cy) * STRENGTH;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 450ms cubic-bezier(0.16,1,0.3,1)';
      btn.style.transform  = '';
      btn.addEventListener('transitionend', () => {
        btn.style.transition = '';
      }, { once: true });
    });
  }

  // Apply to gold and primary hero CTAs only (not every button — too much)
  p10$$('.btn-gold, .hero-buttons .btn').forEach(attach);

  // Watch for dynamically inserted ones
  const mo = new MutationObserver(() => {
    p10$$('.btn-gold, .hero-buttons .btn').forEach(attach);
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

/* ══════════════════════════════════════════════════════════════════════════════
   §5  INK-WAVE RIPPLE ON BUTTON CLICK
══════════════════════════════════════════════════════════════════════════════ */
function initRipple() {
  document.addEventListener('pointerdown', e => {
    const btn = e.target.closest('.btn, .filter-chip, .carousel-arrow, .density-btn');
    if (!btn || rm()) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const r = Math.sqrt(Math.max(x, rect.width - x) ** 2 + Math.max(y, rect.height - y) ** 2);

    const ripple = document.createElement('span');
    ripple.className = 'p10-ripple';
    ripple.style.cssText = `
      position:absolute;
      left:${x - r}px; top:${y - r}px;
      width:${r * 2}px; height:${r * 2}px;
      border-radius:50%;
      background:rgba(255,255,255,0.25);
      transform:scale(0);
      animation: p10-ripple-anim 550ms cubic-bezier(0.16,1,0.3,1) forwards;
      pointer-events:none;
    `;
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
   §6  CART DRAWER — ITEM STAGGER ON OPEN
══════════════════════════════════════════════════════════════════════════════ */
function initCartItemStagger() {
  const cartDrawer = p10$('#cart-drawer');
  if (!cartDrawer || rm()) return;

  const mo = new MutationObserver(() => {
    const isOpen = cartDrawer.classList.contains('is-open');
    if (!isOpen) return;

    // Stagger each cart item
    const items = p10$$('.cart-item', cartDrawer);
    items.forEach((item, i) => {
      item.style.opacity   = '0';
      item.style.transform = 'translateY(14px)';
      item.style.transition = 'none';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          item.style.transition = `opacity 380ms cubic-bezier(0.16,1,0.3,1) ${i * 60}ms,
                                   transform 380ms cubic-bezier(0.16,1,0.3,1) ${i * 60}ms`;
          item.style.opacity   = '1';
          item.style.transform = 'none';
        });
      });
    });
  });

  mo.observe(cartDrawer, { attributes: true, attributeFilter: ['class'] });

  // Also stagger when cart contents update while open
  const cartList = p10$('#cart-items-wrap');
  if (cartList) {
    const listMo = new MutationObserver(() => {
      if (!cartDrawer.classList.contains('is-open')) return;
      const items = p10$$('.cart-item', cartList);
      items.forEach((item, i) => {
        item.style.opacity   = '0';
        item.style.transform = 'translateY(10px)';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            item.style.transition = `opacity 300ms cubic-bezier(0.16,1,0.3,1) ${i * 50}ms,
                                     transform 300ms cubic-bezier(0.16,1,0.3,1) ${i * 50}ms`;
            item.style.opacity   = '1';
            item.style.transform = 'none';
          });
        });
      });
    });
    listMo.observe(cartList, { childList: true });
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   §7  REGION TAB CROSS-FADE
   Patches the region tab logic to crossfade between panels
══════════════════════════════════════════════════════════════════════════════ */
function initRegionCrossfade() {
  const tabsEl   = p10$('#region-tabs');
  const panelsEl = p10$('#region-panels');
  if (!tabsEl || !panelsEl || rm()) return;

  // Wait until JS has rendered the tabs
  const mo = new MutationObserver(() => {
    if (!tabsEl.children.length) return;
    mo.disconnect();

    tabsEl.querySelectorAll('.region-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPanel = panelsEl.querySelector(`#region-panel-${btn.dataset.tab}`);
        if (!targetPanel) return;

        // Fade out current
        const current = panelsEl.querySelector('.region-panel.is-active');
        if (current && current !== targetPanel) {
          current.style.transition = 'opacity 200ms ease, transform 200ms ease';
          current.style.opacity    = '0';
          current.style.transform  = 'translateY(6px)';
          setTimeout(() => {
            current.classList.remove('is-active');
            current.style.cssText = '';
          }, 200);
        }

        // Fade in target
        targetPanel.style.opacity   = '0';
        targetPanel.style.transform = 'translateY(-6px)';
        targetPanel.style.transition = 'none';
        targetPanel.classList.add('is-active');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            targetPanel.style.transition = 'opacity 300ms cubic-bezier(0.16,1,0.3,1), transform 300ms cubic-bezier(0.16,1,0.3,1)';
            targetPanel.style.opacity   = '1';
            targetPanel.style.transform = 'none';
          });
        });
      });
    });
  });
  mo.observe(tabsEl, { childList: true });
}

/* ══════════════════════════════════════════════════════════════════════════════
   §8  DESKTOP DRAG-TO-SCROLL
   Allows pointer-dragging scrollable rows on desktop
══════════════════════════════════════════════════════════════════════════════ */
function initDragScroll() {
  const SELECTORS = [
    '#reviews-carousel',
    '.social-gallery',
    '.value-bar-inner',
    '#region-pills',
    '.filter-chips',
  ];

  SELECTORS.forEach(sel => {
    const el = p10$(sel);
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    el.addEventListener('pointerdown', e => {
      // Only left-button drag on non-touch
      if (e.pointerType === 'touch') return;
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none';
    });

    el.addEventListener('pointermove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x    = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.4;
      el.scrollLeft = scrollLeft - walk;
    });

    const stopDrag = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = '';
      el.style.userSelect = '';
    };

    el.addEventListener('pointerup',    stopDrag);
    el.addEventListener('pointerleave', stopDrag);

    // Prevent click after drag
    el.addEventListener('click', e => {
      if (Math.abs(el.scrollLeft - scrollLeft) > 4) e.stopPropagation();
    }, true);
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
   §9  COUNT-UP NUMBERS (feature-num / step-number spans)
══════════════════════════════════════════════════════════════════════════════ */
function initCountUp() {
  if (rm()) return;

  // Targets: feature-num (01–04) and stat-number if any
  const targets = p10$$('.feature-num, .stat-number');
  if (!targets.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);

      const el  = entry.target;
      const raw = el.textContent.trim();
      // Only animate pure numeric or zero-padded (e.g. "01", "04", "1200")
      if (!/^\d+$/.test(raw)) return;

      const end = parseInt(raw, 10);
      const pad = raw.length; // preserve leading zeros
      const dur = 800;
      const start = performance.now();

      function easeOut(t) { return 1 - (1 - t) ** 3; }

      function tick(now) {
        const progress = Math.min((now - start) / dur, 1);
        const val = Math.round(easeOut(progress) * end);
        el.textContent = String(val).padStart(pad, '0');
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });

  targets.forEach(t => obs.observe(t));
}

/* ══════════════════════════════════════════════════════════════════════════════
   §10  FILTER CHIP SLIDING PILL INDICATOR
   Animated gold underline slides between active filter chips
══════════════════════════════════════════════════════════════════════════════ */
function initFilterChipIndicator() {
  const wrap = p10$('#category-filter-chips');
  if (!wrap || rm()) return;

  // Create the sliding pill element
  const pill = document.createElement('div');
  pill.className = 'p10-filter-pill';
  pill.style.cssText = `
    position:absolute;
    bottom:0; left:0;
    height:2px;
    background:var(--c-gold);
    border-radius:2px;
    transition: left 300ms cubic-bezier(0.16,1,0.3,1), width 300ms cubic-bezier(0.16,1,0.3,1);
    pointer-events:none;
  `;

  // Wrap needs relative positioning
  wrap.style.position = 'relative';
  wrap.appendChild(pill);

  function movePill() {
    const active = wrap.querySelector('.filter-chip.active');
    if (!active) { pill.style.opacity = '0'; return; }
    const wrapRect   = wrap.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    pill.style.opacity = '1';
    pill.style.left  = `${activeRect.left - wrapRect.left + wrap.scrollLeft}px`;
    pill.style.width = `${activeRect.width}px`;
  }

  // Move on click
  wrap.addEventListener('click', e => {
    if (e.target.closest('.filter-chip')) {
      // Allow script.js to update .active first
      requestAnimationFrame(movePill);
    }
  });

  // Also observe class changes (in case programmatic activation)
  const mo = new MutationObserver(movePill);
  mo.observe(wrap, { subtree: true, attributeFilter: ['class'], attributes: true });
  movePill();
}

/* ══════════════════════════════════════════════════════════════════════════════
   §11  FLIP PRODUCT GRID (double-rAF fix)
══════════════════════════════════════════════════════════════════════════════ */
function initFLIPGrid() {
  const grid = p10$('#product-grid');
  if (!grid) return;

  const origRender = window.renderCatalogue;
  if (typeof origRender !== 'function') return;

  window.renderCatalogue = function () {
    if (rm()) { origRender(); return; }

    // FIRST: snapshot current rects
    const first = new Map();
    [...grid.children].forEach(el => {
      const id = el.dataset.productId;
      if (id) first.set(id, el.getBoundingClientRect());
    });

    // RENDER
    origRender();

    // LAST + INVERT + PLAY (double rAF = wait for paint)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        [...grid.children].forEach(el => {
          const id = el.dataset.productId;
          if (!id || !first.has(id)) {
            // Entering card
            el.style.transition = 'none';
            el.style.opacity    = '0';
            el.style.transform  = 'translateY(18px)';
            requestAnimationFrame(() => {
              el.style.transition = 'opacity 400ms cubic-bezier(0.16,1,0.3,1), transform 400ms cubic-bezier(0.16,1,0.3,1)';
              el.style.opacity    = '1';
              el.style.transform  = 'none';
            });
            return;
          }

          const last = el.getBoundingClientRect();
          const prev = first.get(id);
          const dx   = prev.left - last.left;
          const dy   = prev.top  - last.top;
          if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

          el.style.transition = 'none';
          el.style.transform  = `translate3d(${dx}px,${dy}px,0)`;
          requestAnimationFrame(() => {
            el.style.transition = 'transform 480ms cubic-bezier(0.16,1,0.3,1)';
            el.style.transform  = 'none';
          });
        });
      });
    });
  };
}

/* ══════════════════════════════════════════════════════════════════════════════
   §12  FLY-TO-CART
══════════════════════════════════════════════════════════════════════════════ */
function flyToCart(sourceEl) {
  if (rm()) return;
  const cartBtn = p10$('#cart-btn') || p10$('#cart-tab-btn');
  if (!cartBtn || !sourceEl) return;

  const img = sourceEl.querySelector('img.card-img') || sourceEl.querySelector('img');
  if (!img) return;

  const srcRect = sourceEl.getBoundingClientRect();
  const dstRect = cartBtn.getBoundingClientRect();

  const clone = document.createElement('div');
  clone.className = 'fly-to-cart-clone';
  clone.style.cssText = `
    left:${srcRect.left}px; top:${srcRect.top}px;
    width:${srcRect.width}px; height:${srcRect.height}px;
    background:url("${img.currentSrc || img.src}") center/cover;
  `;
  document.body.appendChild(clone);

  const dx = dstRect.left + dstRect.width  / 2 - srcRect.left - srcRect.width  / 2;
  const dy = dstRect.top  + dstRect.height / 2 - srcRect.top  - srcRect.height / 2;

  clone.animate(
    [
      { transform: 'translate3d(0,0,0) scale(1)',                     opacity: 1 },
      { transform: `translate3d(${dx}px,${dy}px,0) scale(0.12)`,     opacity: 0.7, offset: 0.88 },
      { transform: `translate3d(${dx}px,${dy}px,0) scale(0.06)`,     opacity: 0 },
    ],
    { duration: 620, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards' }
  ).finished.then(() => clone.remove());
}

/* ══════════════════════════════════════════════════════════════════════════════
   §13  CART BADGE POP
══════════════════════════════════════════════════════════════════════════════ */
function popCartBadge() {
  const badge = p10$('#cart-badge');
  if (!badge) return;
  badge.classList.remove('is-popping');
  void badge.offsetWidth;
  badge.classList.add('is-popping');
  badge.addEventListener('animationend', () => badge.classList.remove('is-popping'), { once: true });
}

/* ══════════════════════════════════════════════════════════════════════════════
   §14  ADD-TO-CART STATE MACHINE
══════════════════════════════════════════════════════════════════════════════ */
function upgradeATCButtons() {
  function upgrade(btn) {
    if (btn.dataset.atcUpgraded) return;
    btn.dataset.atcUpgraded = '1';
    btn.classList.add('btn-atc');

    const label = btn.innerHTML;
    btn.innerHTML = `
      <span class="atc-label">${label}</span>
      <span class="atc-loading" aria-hidden="true"><span class="atc-spinner"></span></span>
      <span class="atc-success" aria-hidden="true">
        <svg class="atc-check" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 12 10 18 20 6"/>
        </svg>
        Added
      </span>`;

    const origClick = btn.onclick;
    btn.onclick = null;

    btn.addEventListener('click', e => {
      if (btn.classList.contains('is-loading') || btn.classList.contains('is-success')) {
        e.stopPropagation(); return;
      }
      const card = btn.closest('.product-card');
      if (card) flyToCart(card);

      btn.classList.add('is-loading');
      btn.setAttribute('aria-busy', 'true');

      setTimeout(() => {
        btn.classList.remove('is-loading');
        btn.classList.add('is-success');
        btn.setAttribute('aria-busy', 'false');
        popCartBadge();
        setTimeout(() => btn.classList.remove('is-success'), 1800);
      }, 400);

      if (origClick) origClick.call(btn, e);
    }, true);
  }

  const mo = new MutationObserver(() => {
    p10$$('.card-quick-add').forEach(upgrade);
  });
  mo.observe(document.body, { childList: true, subtree: true });
  p10$$('.card-quick-add').forEach(upgrade);
}

/* ══════════════════════════════════════════════════════════════════════════════
   §15  WISHLIST HEART BURST
══════════════════════════════════════════════════════════════════════════════ */
function initWishlistBurst() {
  const COLOURS = ['var(--c-gold)', '#e05a5a', '#f59e0b', '#a78bfa'];
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-wishlist-id]');
    if (!btn) return;
    setTimeout(() => {
      const icon = btn.querySelector('i');
      const wished = icon?.className?.includes('-fill') || btn.classList.contains('is-wishlisted');
      if (!wished || rm()) return;

      btn.classList.add('is-animating');
      btn.addEventListener('animationend', () => btn.classList.remove('is-animating'), { once: true });

      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;

      [0, 45, 90, 135, 180, 225, 270, 315].forEach((angle, i) => {
        const rad  = (angle * Math.PI) / 180;
        const dist = 20 + Math.random() * 16;
        const tx   = `translate(${(Math.cos(rad) * dist).toFixed(1)}px, ${(Math.sin(rad) * dist).toFixed(1)}px)`;
        const size = 4 + Math.random() * 4;

        const p = document.createElement('span');
        p.className = 'heart-particle';
        p.style.cssText = `
          left:${cx - size/2}px; top:${cy - size/2}px;
          width:${size}px; height:${size}px;
          background:${COLOURS[i % COLOURS.length]};
          position:fixed; border-radius:50%;
          pointer-events:none; z-index:9999;
          opacity:0;
          animation: particle-burst ${450 + i * 30}ms cubic-bezier(0.16,1,0.3,1) forwards;
          --tx: ${tx};
        `;
        document.body.appendChild(p);
        p.addEventListener('animationend', () => p.remove(), { once: true });
      });
    }, 50);
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
   §16  IMAGE BLUR-UP
══════════════════════════════════════════════════════════════════════════════ */
function initImageBlurUp() {
  function apply(img) {
    if (img.dataset.blurUpApplied) return;
    img.dataset.blurUpApplied = '1';
    img.setAttribute('data-blur-up', '');
    const done = () => requestAnimationFrame(() => img.classList.add('is-loaded'));
    if (img.complete && img.naturalWidth > 0) done();
    else {
      img.addEventListener('load',  done,                   { once: true });
      img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
    }
  }

  const mo = new MutationObserver(() =>
    p10$$('.card-img, .card-img-hover, .qv-main-img').forEach(apply)
  );
  mo.observe(document.body, { childList: true, subtree: true });
  p10$$('.card-img, .card-img-hover').forEach(apply);
}

/* ══════════════════════════════════════════════════════════════════════════════
   §17  TOAST PROGRESS DRAIN
══════════════════════════════════════════════════════════════════════════════ */
function initToastProgress() {
  const container = p10$('#toast-container');
  if (!container) return;

  new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1 || !node.classList?.contains('toast')) return;
        if (rm()) return;
        const bar = document.createElement('div');
        bar.className = 'toast-progress';
        bar.style.animationDuration = '3500ms';
        node.appendChild(bar);
      });
    });
  }).observe(container, { childList: true });
}

/* ══════════════════════════════════════════════════════════════════════════════
   §18  SWIPE-TO-CLOSE DRAWERS
══════════════════════════════════════════════════════════════════════════════ */
function initSwipeClose() {
  function addSwipe(drawerId, closeFn) {
    const drawer = p10$(`#${drawerId}`);
    if (!drawer || !closeFn) return;

    let sx = 0, cx = 0, active = false;

    drawer.addEventListener('touchstart', e => {
      sx = e.touches[0].clientX;
      active = true;
      drawer.style.transition = 'none';
    }, { passive: true });

    drawer.addEventListener('touchmove', e => {
      if (!active) return;
      cx = e.touches[0].clientX;
      const d = cx - sx;
      if (d > 0) drawer.style.transform = `translateX(${d}px)`;
    }, { passive: true });

    drawer.addEventListener('touchend', () => {
      if (!active) return;
      active = false;
      drawer.style.transition = '';
      const d = cx - sx;
      if (d > 80) closeFn();
      else drawer.style.transform = '';
      sx = cx = 0;
    });
  }

  setTimeout(() => {
    addSwipe('cart-drawer',     window.closeCart);
    addSwipe('wishlist-drawer', window.closeWishlist);
    addSwipe('mobile-nav-drawer', () => p10$('#mobile-drawer-close')?.click());
  }, 300);
}

/* ══════════════════════════════════════════════════════════════════════════════
   §19  CURSOR DOT — speed-based opacity, expanded on images
══════════════════════════════════════════════════════════════════════════════ */
function initCursorDot() {
  if (rm()) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.innerWidth < 1024) return;

  const dot = p10$('#cursor-dot');
  if (!dot) return;

  let mx = 0, my = 0, cx = 0, cy = 0, rafId = 0;
  let px = 0, py = 0; // previous for velocity

  function loop() {
    cx = lerp(cx, mx, 0.18);
    cy = lerp(cy, my, 0.18);
    dot.style.left = `${cx}px`;
    dot.style.top  = `${cy}px`;

    // Speed-based opacity: faster = more visible
    const speed = Math.sqrt((cx - px) ** 2 + (cy - py) ** 2);
    dot.style.opacity = String(clamp(0.4 + speed * 0.06, 0.4, 0.85));
    px = cx; py = cy;

    rafId = requestAnimationFrame(loop);
  }

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!rafId) rafId = requestAnimationFrame(loop);
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    cancelAnimationFrame(rafId);
    rafId = 0;
  });

  document.addEventListener('mouseover', e => {
    const isMedia = e.target.closest('.card-img-wrap, .qv-main-img, .journal-img, .cat-img, .social-tile, .gift-img');
    const isBtn   = e.target.closest('.btn, .filter-chip, .carousel-arrow');
    if (isMedia) {
      dot.classList.add('is-expanded');
      dot.textContent = 'View';
    } else if (isBtn) {
      dot.classList.remove('is-expanded');
      dot.style.transform = 'translate(-50%,-50%) scale(1.6)';
      dot.addEventListener('mouseleave', () => {
        dot.style.transform = '';
      }, { once: true });
    } else {
      dot.classList.remove('is-expanded');
      dot.textContent = '';
      dot.style.transform = '';
    }
  });

  loop();
}

/* ══════════════════════════════════════════════════════════════════════════════
   §20  BACK-TO-TOP — eased JS scroll
══════════════════════════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = p10$('#back-to-top');
  if (!btn) return;

  let rafId = 0;
  const update = () => {
    rafId = 0;
    btn.classList.toggle('is-visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', () => { if (!rafId) rafId = requestAnimationFrame(update); }, { passive: true });
  update();

  btn.addEventListener('click', () => {
    if (rm()) { window.scrollTo({ top: 0 }); return; }
    const start = window.scrollY;
    const t0    = performance.now();
    const dur   = 700;
    const ease  = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const step  = now => {
      const p = Math.min((now - t0) / dur, 1);
      window.scrollTo(0, start * (1 - ease(p)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
   §21  SCROLL-SPY
══════════════════════════════════════════════════════════════════════════════ */
function initScrollSpy() {
  const sections = p10$$('section[id]');
  const links    = p10$$('.desktop-nav .nav-link[href]');
  if (!sections.length || !links.length) return;

  let rafId = 0;
  const update = () => {
    rafId = 0;
    const y = window.scrollY + 130;
    let activeId = '';
    sections.forEach(s => { if (y >= s.offsetTop) activeId = s.id; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${activeId}`));
  };
  window.addEventListener('scroll', () => { if (!rafId) rafId = requestAnimationFrame(update); }, { passive: true });
  update();
}

/* ══════════════════════════════════════════════════════════════════════════════
   §22  HAMBURGER MORPH
══════════════════════════════════════════════════════════════════════════════ */
function initHamburgerMorph() {
  const btn = p10$('#mobile-menu-btn');
  if (!btn) return;
  new MutationObserver(() => {
    btn.classList.toggle('is-open', btn.getAttribute('aria-expanded') === 'true');
  }).observe(btn, { attributes: true, attributeFilter: ['aria-expanded'] });
}

/* ══════════════════════════════════════════════════════════════════════════════
   §23  PARALLAX — hero content at 0.25× scroll
══════════════════════════════════════════════════════════════════════════════ */
function initParallax() {
  if (rm()) return;
  const content = p10$('#hero-content');
  if (!content) return;
  let rafId = 0;
  const update = () => {
    rafId = 0;
    if (window.innerWidth < 1024) return;
    const y   = window.scrollY;
    const max = p10$('#hero')?.offsetHeight || 800;
    if (y > max) return;
    content.style.transform = `translate3d(0,${y * 0.25}px,0)`;
    content.style.opacity   = String(Math.max(0, 1 - y / (max * 0.75)));
  };
  window.addEventListener('scroll', () => { if (!rafId) rafId = requestAnimationFrame(update); }, { passive: true });
}

/* ══════════════════════════════════════════════════════════════════════════════
   §24  PAGE VISIBILITY — pause Ken Burns
══════════════════════════════════════════════════════════════════════════════ */
function initVisibilityPause() {
  document.addEventListener('visibilitychange', () => {
    const hero = p10$('#hero');
    if (hero) hero.style.animationPlayState = document.hidden ? 'paused' : '';
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
   §25  STAGGER INDEX SETUP
══════════════════════════════════════════════════════════════════════════════ */
function initRevealStagger() {
  p10$$('[data-reveal-stagger]').forEach(parent => {
    [...parent.children].forEach((child, i) => {
      child.style.setProperty('--i', Math.min(i, 7));
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
   §26  FREE DELIVERY BAR
══════════════════════════════════════════════════════════════════════════════ */
function initFreeDeliveryBar() {
  const bar = p10$('#fdbar-fill');
  if (!bar) return;
  new MutationObserver(() => {
    const w = parseFloat(bar.style.width) || 0;
    bar.classList.toggle('is-reached', w >= 100);
  }).observe(bar, { attributes: true, attributeFilter: ['style'] });
}

/* ══════════════════════════════════════════════════════════════════════════════
   §27  OFFLINE TOAST
══════════════════════════════════════════════════════════════════════════════ */
function initOfflineToast() {
  if (!window.Toast) return;
  window.addEventListener('online',  () => Toast.show('You\'re back online.', 'success'));
  window.addEventListener('offline', () => Toast.show('You appear to be offline — cart saved locally.', 'error', 0));
}

/* ══════════════════════════════════════════════════════════════════════════════
   §28  RIPPLE KEYFRAME INJECTION
══════════════════════════════════════════════════════════════════════════════ */
function injectRippleKeyframe() {
  if (p10$('#p10-ripple-style')) return;
  const style = document.createElement('style');
  style.id = 'p10-ripple-style';
  style.textContent = `
    @keyframes p10-ripple-anim {
      to { transform: scale(1); opacity: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      @keyframes p10-ripple-anim { to { opacity: 0; } }
    }
  `;
  document.head.appendChild(style);
}

/* ══════════════════════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════════════════════ */
function p10Init() {
  injectRippleKeyframe();
  splitTitleWords();
  initPreloader();
  initRevealStagger();
  initParallax();
  initVisibilityPause();
  initHamburgerMorph();
  initScrollSpy();
  initFLIPGrid();
  initCardTilt();
  initMagneticButtons();
  initRipple();
  initCartItemStagger();
  initRegionCrossfade();
  initDragScroll();
  initCountUp();
  initFilterChipIndicator();
  upgradeATCButtons();
  initWishlistBurst();
  initImageBlurUp();
  initToastProgress();
  initSwipeClose();
  initCursorDot();
  initBackToTop();
  initFreeDeliveryBar();
  initOfflineToast();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', p10Init);
} else {
  p10Init();
}
