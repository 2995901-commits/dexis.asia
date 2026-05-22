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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateHeroTitle, { once: true });
  } else {
    animateHeroTitle();
  }
})();
