(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.dataset.reducedMotion = reduced ? 'true' : 'false';

  function animateHeroTitle() {
    const el = document.querySelector('.js-letter-anim');
    if (!el || reduced) return;

    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';

    let i = 0;
    for (const ch of text) {
      const span = document.createElement('span');
      span.className = 'char';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--i', i);
      span.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(span);
      i++;
    }
    el.classList.add('hero-title--anim');
  }

  function observeOnView() {
    const targets = document.querySelectorAll('[data-orders-observe]');
    if (!targets.length) return;

    if (reduced || typeof IntersectionObserver === 'undefined') {
      targets.forEach(t => t.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

    targets.forEach(t => io.observe(t));
  }

  function init() {
    animateHeroTitle();
    observeOnView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
