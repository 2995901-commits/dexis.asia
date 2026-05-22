(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.dataset.reducedMotion = reduced ? 'true' : 'false';

  // Per-screen behaviors attach below as sections come online.
})();
