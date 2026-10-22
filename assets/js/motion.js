/* ==========================================================================
   ReGongches Motion & Scroll Interaction Module (assets/js/motion.js)
   Respects prefers-reduced-motion; handles reveal-on-scroll, counters, rails
   ========================================================================== */
(function (window, document) {
  'use strict';

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const RGMotion = {
    init() {
      this.initScrollReveals();
      this.initCounters();
      this.initHorizontalRails();
      if (!prefersReducedMotion) {
        this.initHeroParallax();
      }
    },

    initScrollReveals() {
      const els = document.querySelectorAll('[data-rg-reveal]');
      if (!els.length) return;
      if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        els.forEach((el) => el.classList.add('is-revealed'));
        return;
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      els.forEach((el) => io.observe(el));
    },

    initCounters() {
      const counters = document.querySelectorAll('[data-rg-counter]');
      if (!counters.length) return;
      counters.forEach((el) => {
        const target = Number(el.getAttribute('data-rg-counter')) || 0;
        const suffix = el.getAttribute('data-rg-suffix') || '';
        if (prefersReducedMotion) {
          el.textContent = target + suffix;
          return;
        }
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 30));
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            el.textContent = target + suffix;
            clearInterval(timer);
          } else {
            el.textContent = current + suffix;
          }
        }, 35);
      });
    },

    initHorizontalRails() {
      document.querySelectorAll('[data-rg-rail-wrap]').forEach((wrap) => {
        const rail = wrap.querySelector('.rg-rail');
        const prev = wrap.querySelector('[data-rg-rail-prev]');
        const next = wrap.querySelector('[data-rg-rail-next]');
        if (!rail) return;

        if (prev) {
          prev.addEventListener('click', () => {
            rail.scrollBy({ left: -320, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
          });
        }
        if (next) {
          next.addEventListener('click', () => {
            rail.scrollBy({ left: 320, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
          });
        }
      });
    },

    initHeroParallax() {
      const hero = document.querySelector('.rg-hero');
      const threadPath = document.querySelector('.rg-hero__thread-path');
      if (!hero) return;

      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y < 900) {
          const bg = hero.querySelector('.rg-hero__bg-img');
          if (bg) bg.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(1.04)`;
        }
        if (threadPath) {
          const offset = Math.max(0, 1600 - (y * 2.2));
          threadPath.style.strokeDashoffset = String(offset * 0.15);
        }
      }, { passive: true });
    }
  };

  window.RG = window.RG || {};
  window.RG.motion = RGMotion;
})(window, document);
