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
  // Wraps each word in <span class="word"> (white-space: nowrap) and each
  // character in <span class="char"> inside. Regular spaces between words
  // remain as text nodes so the browser can wrap by them.
  function animateHeroTitle() {
    const el = document.querySelector('.js-letter-anim');
    if (!el || reduced) return;

    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';

    const words = text.split(' ');
    let charIdx = 0;
    words.forEach((word, wi) => {
      if (wi > 0) el.appendChild(document.createTextNode(' '));
      const wordEl = document.createElement('span');
      wordEl.className = 'word';
      for (const ch of word) {
        const span = document.createElement('span');
        span.className = 'char';
        span.setAttribute('aria-hidden', 'true');
        span.style.setProperty('--i', charIdx);
        span.textContent = ch;
        wordEl.appendChild(span);
        charIdx++;
      }
      el.appendChild(wordEl);
    });
    el.classList.add('hero-title--anim');
  }

  // ─── Boot ────────────────────────────────────────────────────
  function init() {
    animateHeroTitle();
    loadMetrika();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
