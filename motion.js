/**
 * ReGongches — Threads of Mountain Heritage
 * Editorial Motion, Scroll Reveals, Desktop Hero Video & Reduced-Motion Guard (motion.js)
 * ============================================================================
 * Inspired by Scrolltide patterns:
 *  - Subtle word-by-word hero headline reveal
 *  - Desktop-only hero video playback (`assets/video/hero-loom.mp4`) with mobile/slow-connection
 *    and `prefers-reduced-motion` poster fallback
 *  - IntersectionObserver scroll reveals (`[data-reveal]`, `[data-reveal-stagger]`)
 *  - Pointer drag-to-scroll for Lookbook & curated horizontal rails
 *  - All animations strictly use `transform` and `opacity` and turn off completely
 *    under `prefers-reduced-motion: reduce`.
 */

'use strict';

window.RG = window.RG || {};

const Motion = {
  isReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  },

  isSlowOrMobileConnection() {
    const isMobileViewport = window.matchMedia && window.matchMedia('(max-width: 1023px)').matches;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = Boolean(conn?.saveData);
    const slowNet = ['slow-2g', '2g', '3g'].includes(conn?.effectiveType || '');
    return isMobileViewport || saveData || slowNet;
  },

  init() {
    this.initPreloader();
    this.initHeroVideo();
    this.initHeroReveal();
    this.initScrollReveals();
    this.initDragScrollRails();
    this.initSubtleParallax();
  },

  initPreloader() {
    const loader = document.getElementById('preloader');
    if (!loader) return;
    if (this.isReducedMotion() || window.RG.SafeStorage.getSession('rg-preloader-shown', false)) {
      loader.classList.add('is-done');
      loader.hidden = true;
      return;
    }
    setTimeout(() => {
      loader.classList.add('is-done');
      window.RG.SafeStorage.setSession('rg-preloader-shown', true);
      setTimeout(() => { loader.hidden = true; }, 450);
    }, 380);
  },

  /**
   * Renames & manages hero video (`assets/video/hero-loom.mp4`):
   * Plays muted autoplay playsinline ONLY on desktop when reduced-motion is false
   * and connection is fast. Otherwise shows the still poster image (`hero-mountain-textiles.webp`).
   */
  initHeroVideo() {
    const video = document.querySelector('.hero-bg-video');
    if (!video) return;

    if (this.isReducedMotion() || this.isSlowOrMobileConnection()) {
      try {
        video.pause();
        video.removeAttribute('autoplay');
        video.style.display = 'none';
      } catch {}
      return;
    }

    video.style.display = 'block';
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        video.style.display = 'none';
      });
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        try { video.pause(); } catch {}
      } else if (!this.isReducedMotion() && !this.isSlowOrMobileConnection()) {
        try { video.play().catch(() => {}); } catch {}
      }
    });
  },

  initHeroReveal() {
    const hero = document.getElementById('hero');
    const title = document.querySelector('.hero-title');
    if (!hero) return;

    if (this.isReducedMotion()) {
      hero.classList.add('hero-animated');
      document.querySelectorAll('[data-hero-animate]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    if (title && !title.dataset.splitDone) {
      title.dataset.splitDone = '1';
      const parts = [];
      title.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.textContent.split(/(\s+)/).forEach(token => {
            if (token.trim()) parts.push(`<span class="word">${window.RG.escapeHtml(token.trim())}</span>`);
            else if (token) parts.push(' ');
          });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          parts.push(`<em><span class="word">${window.RG.escapeHtml(node.textContent.trim())}</span></em>`);
        }
      });
      title.innerHTML = parts.join('');
      title.querySelectorAll('.word').forEach((w, idx) => {
        w.style.transitionDelay = `${100 + idx * 55}ms`;
      });
    }

    requestAnimationFrame(() => {
      hero.classList.add('hero-animated');
    });
  },

  initScrollReveals() {
    const targets = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
    if (!targets.length) return;

    if (this.isReducedMotion() || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.hasAttribute('data-reveal-stagger')) {
          [...el.children].slice(0, 10).forEach((child, i) => {
            child.style.setProperty('--reveal-index', String(i));
          });
        }
        el.classList.add('is-visible');
        obs.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => obs.observe(el));
  },

  initDragScrollRails() {
    const rails = document.querySelectorAll('.horizontal-rail, #reviews-carousel, .social-gallery, .filter-chips');
    rails.forEach(rail => {
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      rail.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch' || e.target.closest('button, a')) return;
        isDown = true;
        startX = e.pageX - rail.offsetLeft;
        scrollLeft = rail.scrollLeft;
        rail.classList.add('is-dragging');
      });

      rail.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        const x = e.pageX - rail.offsetLeft;
        rail.scrollLeft = scrollLeft - (x - startX) * 1.25;
      });

      const stop = () => {
        isDown = false;
        rail.classList.remove('is-dragging');
      };
      rail.addEventListener('pointerup', stop);
      rail.addEventListener('pointerleave', stop);
    });
  },

  initSubtleParallax() {
    if (this.isReducedMotion()) return;
    const heroContent = document.getElementById('hero-content');
    const hero = document.getElementById('hero');
    if (!heroContent || !hero) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (window.innerWidth >= 1024) {
          const y = window.scrollY;
          const h = hero.offsetHeight || 760;
          if (y <= h) {
            heroContent.style.transform = `translate3d(0, ${(y * 0.16).toFixed(1)}px, 0)`;
          }
        } else {
          heroContent.style.transform = '';
        }
        ticking = false;
      });
    }, { passive: true });
  }
};

window.RG.Motion = Motion;
