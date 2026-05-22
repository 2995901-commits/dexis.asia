(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.dataset.reducedMotion = reduced ? 'true' : 'false';

  // ─── Yandex Metrika ───────────────────────────────────────────
  // Set the counter ID when the user provides it; counter loads only when set.
  const METRIKA_ID = null;

  function loadMetrika() {
    if (!METRIKA_ID) return;
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j=0;j<document.scripts.length;j++) {if (document.scripts[j].src===r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
      (window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(METRIKA_ID, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  }

  // ─── Hero title letter animation ──────────────────────────────
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

  // ─── Scroll-triggered reveal for blocks marked with data-orders-observe ─
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

  // ─── Cookies banner ──────────────────────────────────────────
  // Storage-free per project rule: banner reappears on each page load,
  // dismiss only hides it for the current session in-memory.
  function setupCookiesBanner() {
    const banner = document.querySelector('[data-cookies-banner]');
    if (!banner) return;
    banner.hidden = false;
    const dismiss = banner.querySelector('[data-cookies-dismiss]');
    if (dismiss) {
      dismiss.addEventListener('click', () => { banner.hidden = true; });
    }
  }

  // ─── Boot ────────────────────────────────────────────────────
  function init() {
    animateHeroTitle();
    observeOnView();
    setupCookiesBanner();
    loadMetrika();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
