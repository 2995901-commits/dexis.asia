/* Motion narrative (section 2.02).
 * GSAP master timeline. Three acts, 30 seconds per spec §4.
 * prefers-reduced-motion shows static 3-card fallback.
 */
(() => {
  'use strict';

  const root = document.querySelector('[data-motion-root]');
  if (!root) return;

  const sceneHost = root.querySelector('[data-motion-scene]');
  const staticEl = root.querySelector('[data-motion-static]');
  const playBtn = root.querySelector('[data-motion-play]');
  const restartBtn = root.querySelector('[data-motion-restart]');

  const reduced = document.documentElement.dataset.reducedMotion === 'true' || typeof window.gsap === 'undefined';

  if (reduced) {
    if (staticEl) staticEl.hidden = false;
    if (sceneHost) sceneHost.hidden = true;
    if (playBtn) playBtn.hidden = true;
    return;
  }

  const gsap = window.gsap;
  const svgNS = 'http://www.w3.org/2000/svg';
  const W = 800;
  const H = 540;
  const cx = W / 2;
  const cy = H / 2 - 20;
  const orbitR = 200;

  const sources = [
    { id: '1c',    name: '1С:Бухгалтерия',     metric: 'Выручка ₸384M',           chaos: { x: 100, y: 120 } },
    { id: 'esf',   name: 'ИС ЭСФ',              metric: '1 247 счетов-фактур',     chaos: { x: 600, y: 90  } },
    { id: 'bank',  name: 'Halyk Bank',          metric: 'Остаток ₸94M',            chaos: { x: 140, y: 320 } },
    { id: 'crm',   name: 'Bitrix24',            metric: '23 активные сделки',      chaos: { x: 560, y: 280 } },
    { id: 'excel', name: 'Поставщики_май.xlsx', metric: 'Excel · ручной ввод',     chaos: { x: 60,  y: 220 } },
    { id: 'kgd',   name: 'КГД',                 metric: 'Налоговая нагрузка 8.2%', chaos: { x: 660, y: 400 } },
    { id: 'gz',    name: 'Goszakup.gov.kz',     metric: '3 активных тендера',      chaos: { x: 320, y: 430 } },
  ];

  sources.forEach((s, i) => {
    const angle = (i / sources.length) * Math.PI * 2 - Math.PI / 2;
    s.orbit = {
      x: cx + orbitR * Math.cos(angle),
      y: cy + orbitR * Math.sin(angle),
    };
  });

  const cotLines = [
    'Считаю остатки по счетам.',
    'Сверяю с прошлой неделей.',
    'Нахожу отклонение в марже фармацевтического направления.',
    'Сопоставляю с динамикой закупочных цен.',
    'Определяю причину.',
    'Готовлю поручение ответственному.',
  ];

  // -- DOM ------------------------------------------------------
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('aria-hidden', 'true');
  const linksLayer = document.createElementNS(svgNS, 'g');
  const dotsLayer = document.createElementNS(svgNS, 'g');
  const cardsLayer = document.createElementNS(svgNS, 'g');
  const dexisLayer = document.createElementNS(svgNS, 'g');
  svg.append(linksLayer, dotsLayer, cardsLayer, dexisLayer);

  sources.forEach(s => {
    const g = document.createElementNS(svgNS, 'g');
    g.classList.add('motion-card');

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('class', 'motion-card-rect');
    rect.setAttribute('width', '200');
    rect.setAttribute('height', '60');
    rect.setAttribute('x', '-100');
    rect.setAttribute('y', '-30');
    rect.setAttribute('rx', '8');
    g.appendChild(rect);

    const name = document.createElementNS(svgNS, 'text');
    name.setAttribute('class', 'motion-card__name');
    name.setAttribute('x', '-86');
    name.setAttribute('y', '-6');
    name.textContent = s.name;
    g.appendChild(name);

    const metric = document.createElementNS(svgNS, 'text');
    metric.setAttribute('class', 'motion-card__metric');
    metric.setAttribute('x', '-86');
    metric.setAttribute('y', '14');
    metric.textContent = s.metric;
    g.appendChild(metric);

    cardsLayer.appendChild(g);
    s.el = g;
  });

  const dexisG = document.createElementNS(svgNS, 'g');
  const dexisCircle = document.createElementNS(svgNS, 'circle');
  dexisCircle.setAttribute('class', 'motion-dexis-circle');
  dexisCircle.setAttribute('r', '40');
  dexisG.appendChild(dexisCircle);
  const dexisLabel = document.createElementNS(svgNS, 'text');
  dexisLabel.setAttribute('class', 'motion-dexis-label');
  dexisLabel.setAttribute('text-anchor', 'middle');
  dexisLabel.setAttribute('dy', '5');
  dexisLabel.textContent = 'DEXIS';
  dexisG.appendChild(dexisLabel);
  dexisLayer.appendChild(dexisG);

  sources.forEach(s => {
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('class', 'motion-link');
    linksLayer.appendChild(line);
    s.link = line;
  });

  const cotWrap = document.createElement('div');
  cotWrap.className = 'motion-cot';
  cotLines.forEach((text, i) => {
    const p = document.createElement('p');
    p.className = 'motion-cot__line';
    p.dataset.cot = i;
    p.textContent = text;
    cotWrap.appendChild(p);
  });

  const captionEl = document.createElement('p');
  captionEl.className = 'motion-caption';

  const resultEl = document.createElement('div');
  resultEl.className = 'motion-result';

  const telegramEl = document.createElement('div');
  telegramEl.className = 'motion-telegram';
  telegramEl.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>`;

  sceneHost.append(svg, cotWrap, captionEl, resultEl, telegramEl);

  // -- Helpers --------------------------------------------------
  function setCaption(text) { captionEl.textContent = text; }

  function setResultContent(state) {
    if (state === 'output') {
      resultEl.innerHTML = `
        <p class="motion-result__primary">Маржа по фармацевтическому направлению снизилась на 1.4 пп за май</p>
        <p class="motion-result__secondary">Причина: рост закупочной цены у поставщиков ТОО «Альфа» (+12%) и ТОО «Бета» (+8%)</p>
        <div class="motion-result__divider"></div>
        <span class="motion-result__metric-label">Потенциальное сохранение маржи</span>
        <span class="motion-result__metric-value">₸4 800 000</span>
      `;
    } else {
      resultEl.innerHTML = `
        <p class="motion-order__title">Поручение: Коммерческому директору</p>
        <p class="motion-order__body">Запросить коммерческое предложение у альтернативного поставщика АО «X» на квартальный объём.</p>
        <p class="motion-order__note">Контекст и расчёты прикреплены.</p>
        <span class="motion-order__cta">Подтвердить и отправить →</span>
      `;
    }
  }

  function dotPulse(s, delay) {
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('class', 'motion-pulse');
    dot.setAttribute('r', '3');
    dot.setAttribute('cx', s.orbit.x);
    dot.setAttribute('cy', s.orbit.y);
    dotsLayer.appendChild(dot);
    gsap.fromTo(dot,
      { attr: { cx: s.orbit.x, cy: s.orbit.y }, opacity: 0.9 },
      { attr: { cx: cx, cy: cy }, opacity: 0, duration: 1.2, delay, ease: 'none',
        onComplete: () => dot.remove() }
    );
  }

  // -- Reset & timeline ----------------------------------------
  function resetScene() {
    dotsLayer.innerHTML = '';

    sources.forEach(s => {
      gsap.set(s.el, { x: s.chaos.x, y: s.chaos.y, scale: 0.85, opacity: 0, svgOrigin: '0 0' });
      gsap.set(s.link, { attr: { x1: cx, y1: cy, x2: cx, y2: cy }, opacity: 0 });
    });

    gsap.set(dexisG, { x: cx, y: cy, scale: 0, transformOrigin: '0 0' });
    gsap.set(dexisCircle, { attr: { r: 40 } });

    cotWrap.querySelectorAll('.motion-cot__line').forEach(el => {
      gsap.set(el, { opacity: 0 });
    });

    gsap.set(captionEl, { opacity: 0 });

    setResultContent('output');
    gsap.set(resultEl, { opacity: 0, scale: 0.95, x: 0, y: 0 });

    gsap.set(telegramEl, { opacity: 0, scale: 1 });
  }

  let tl;

  function buildTimeline() {
    tl = gsap.timeline({
      paused: true,
      onComplete: () => { if (restartBtn) restartBtn.hidden = false; },
    });

    // ACT 1 — chaos (0–9s)
    sources.forEach((s, i) => {
      const t = 0.5 + i * 1.0;
      tl.to(s.el, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }, t);
      tl.to(s.el, { opacity: 0.78, duration: 1.2, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 7 + i * 0.15);
    });
    tl.to(captionEl, { opacity: 1, duration: 0.4, onStart: () => setCaption('Данные среднего бизнеса в Казахстане живут в десяти разных системах') }, 7.5);

    // ACT 2 — processing (9–22s)
    tl.to(captionEl, { opacity: 0, duration: 0.3 }, 8.7);

    tl.to(dexisG, { scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, 9.0);

    sources.forEach(s => {
      tl.to(s.el, { x: s.orbit.x, y: s.orbit.y, duration: 1.5, ease: 'power3.inOut' }, 9.5);
    });

    sources.forEach(s => {
      tl.to(s.link, {
        attr: { x1: s.orbit.x, y1: s.orbit.y, x2: cx, y2: cy },
        opacity: 0.6,
        duration: 0.8,
        ease: 'power2.out',
      }, 10.8);
    });

    sources.forEach((s, i) => {
      for (let k = 0; k < 4; k++) {
        const delay = 11.5 + i * 0.18 + k * 1.7;
        tl.add(() => dotPulse(s, 0), delay);
      }
    });

    const cotEls = cotWrap.querySelectorAll('.motion-cot__line');
    const cotTimings = [
      [11.0, 12.5], [12.5, 14.0], [14.0, 15.5],
      [15.5, 17.0], [17.0, 18.5], [18.5, 20.0],
    ];
    cotEls.forEach((el, i) => {
      const [tIn, tOut] = cotTimings[i];
      tl.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' }, tIn);
      if (i < cotEls.length - 1) {
        tl.to(el, { opacity: 0.35, duration: 0.3 }, tOut - 0.1);
      }
    });

    tl.to(captionEl, { opacity: 1, duration: 0.4, onStart: () => setCaption('DEXIS объединяет данные и находит то, что требует внимания') }, 18.5);
    tl.to(dexisCircle, { attr: { r: 44 }, duration: 0.5, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 20.0);

    // ACT 3 — action (22–30s)
    tl.to(captionEl, { opacity: 0, duration: 0.3 }, 21.5);
    tl.to(cotEls, { opacity: 0, duration: 0.4 }, 21.7);

    tl.add(() => setResultContent('output'), 21.95);
    tl.to(resultEl, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }, 22.0);

    tl.to(resultEl, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 24.5);
    tl.add(() => setResultContent('order'), 24.85);
    tl.to(resultEl, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 24.9);

    tl.to(telegramEl, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 27.0);

    tl.to(resultEl, {
      scale: 0.3,
      opacity: 0,
      duration: 1.0,
      ease: 'power2.inOut',
      x: () => {
        const r = resultEl.getBoundingClientRect();
        const t = telegramEl.getBoundingClientRect();
        return (t.left + t.width / 2) - (r.left + r.width / 2);
      },
      y: () => {
        const r = resultEl.getBoundingClientRect();
        const t = telegramEl.getBoundingClientRect();
        return (t.top + t.height / 2) - (r.top + r.height / 2);
      },
    }, 27.5);

    tl.to(telegramEl, { scale: 1.15, duration: 0.25, ease: 'power2.out' }, 27.7);
    tl.to(telegramEl, { scale: 1.0, duration: 0.25, ease: 'power2.in' }, 27.95);

    tl.to(captionEl, { opacity: 1, duration: 0.4, onStart: () => setCaption('От разрозненных данных — к готовому действию') }, 28.5);
  }

  resetScene();
  buildTimeline();

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      playBtn.hidden = true;
      restartBtn.hidden = true;
      tl.play(0);
    });
  }
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      restartBtn.hidden = true;
      if (tl) tl.kill();
      resetScene();
      buildTimeline();
      tl.play(0);
    });
  }
})();
