/* Unified flow scene (section 2 — «Как работает DEXIS»).
 * Auto-plays on first viewport entry. Universal copy (no industry specifics).
 *
 *  0.0–1.6s  Intro caption «Каждое утро бизнес работает с разрозненными данными»
 *  1.6–7.0s  Seven source cards appear in a left-side column, one by one
 *  7.4–8.0s  DEXIS centre appears on the right
 *  8.0–13s   Sequential link draw from each source to DEXIS («чик-чик-чик»)
 * 13.0–21s   «Ход анализа», six lines below DEXIS
 * 21.0–23s   Transition caption «Выявил паттерны — предлагаю решение»
 * 23.0–30s   Three compact cards appear inside the scene (no full-screen mock-up)
 *
 * prefers-reduced-motion shows static 3-item fallback.
 */
(() => {
  'use strict';

  const root = document.querySelector('[data-flow-root]');
  if (!root) return;

  const scene = root.querySelector('[data-flow-scene]');
  const staticEl = root.querySelector('[data-motion-static]');
  const restartWrap = root.querySelector('[data-flow-restart]');
  const restartBtn = root.querySelector('[data-flow-restart-btn]');

  const reduced = document.documentElement.dataset.reducedMotion === 'true' || typeof window.gsap === 'undefined';

  if (reduced) {
    if (staticEl) staticEl.hidden = false;
    if (scene) scene.hidden = true;
    return;
  }

  const gsap = window.gsap;
  const svgNS = 'http://www.w3.org/2000/svg';
  const W = 800;
  const H = 520;

  // Source list — left column
  const cardW = 200;
  const cardH = 46;
  const cardX = 60 + cardW / 2; // center of card on x=160 (so x range 60..260)
  const listGap = 10;
  const listTop = 36;

  const sources = [
    { id: '1c',    name: '1С',                    metric: 'Выручка ₸384M' },
    { id: 'esf',   name: 'ИС ЭСФ',                metric: '1 247 счетов-фактур' },
    { id: 'bank',  name: 'Halyk Bank',            metric: 'Остаток ₸94M' },
    { id: 'crm',   name: 'Bitrix24',              metric: '23 активные сделки' },
    { id: 'excel', name: 'Поставщики_май.xlsx',   metric: 'Excel · ручной ввод' },
    { id: 'kgd',   name: 'КГД',                   metric: 'Налоговая нагрузка 8.2%' },
    { id: 'gz',    name: 'Goszakup.gov.kz',       metric: '3 активных тендера' },
  ];

  sources.forEach((s, i) => {
    s.x = cardX;
    s.y = listTop + i * (cardH + listGap) + cardH / 2;
    s.rightEdge = { x: cardX + cardW / 2, y: s.y };
  });

  // DEXIS — right side, vertical centre of source list
  const dexisR = 40;
  const dexisX = 600;
  const dexisY = listTop + (sources.length * (cardH + listGap) - listGap) / 2;

  const cotLines = [
    'Считаю остатки по счетам.',
    'Сверяю с прошлой неделей.',
    'Нахожу отклонение в марже основного направления.',
    'Сопоставляю с динамикой закупочных цен.',
    'Определяю причину.',
    'Готовлю поручения ответственным.',
  ];

  const finalCards = [
    {
      dept: 'Финансовый отдел',
      urgency: 'высокая',
      urgencyMod: 'high',
      meta: 'Денежный поток',
      context: 'Остаток ₸94M, обязательства за неделю ₸67M. Среди них штраф ₸4.2M по поставке (до срока 3 дня).',
      action: 'Подготовить план оплат с приоритетом по штрафам.',
    },
    {
      dept: 'Коммерческий отдел',
      urgency: 'средняя',
      urgencyMod: 'mid',
      meta: 'Дебиторка',
      context: 'ТОО «Х» — задолженность ₸42M, просрочка 17 дней. Оборот за год ₸380M (топ-10).',
      action: 'Согласовать реструктуризацию на 30 дней.',
    },
    {
      dept: 'Закупки',
      urgency: 'низкая',
      urgencyMod: 'low',
      meta: 'Поставщик',
      context: 'АО «Х» поднял цену +8% за квартал. АО «Y» предлагает −4% при том же качестве.',
      action: 'Запросить КП у АО «Y» на квартальный объём.',
    },
  ];

  // -- Build DOM ------------------------------------------------
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('aria-hidden', 'true');
  const linksLayer = document.createElementNS(svgNS, 'g');
  const cardsLayer = document.createElementNS(svgNS, 'g');
  const dexisLayer = document.createElementNS(svgNS, 'g');
  svg.append(linksLayer, cardsLayer, dexisLayer);

  // Source cards as <g> with rect + 2 texts; positioned via gsap.set (x/y)
  sources.forEach(s => {
    const g = document.createElementNS(svgNS, 'g');
    g.classList.add('motion-card');

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('class', 'motion-card-rect');
    rect.setAttribute('width', cardW);
    rect.setAttribute('height', cardH);
    rect.setAttribute('x', -cardW / 2);
    rect.setAttribute('y', -cardH / 2);
    rect.setAttribute('rx', '8');
    g.appendChild(rect);

    const name = document.createElementNS(svgNS, 'text');
    name.setAttribute('class', 'motion-card__name');
    name.setAttribute('x', -cardW / 2 + 14);
    name.setAttribute('y', -3);
    name.textContent = s.name;
    g.appendChild(name);

    const metric = document.createElementNS(svgNS, 'text');
    metric.setAttribute('class', 'motion-card__metric');
    metric.setAttribute('x', -cardW / 2 + 14);
    metric.setAttribute('y', 15);
    metric.textContent = s.metric;
    g.appendChild(metric);

    cardsLayer.appendChild(g);
    s.el = g;
  });

  // DEXIS group
  const dexisG = document.createElementNS(svgNS, 'g');
  const dexisCircle = document.createElementNS(svgNS, 'circle');
  dexisCircle.setAttribute('class', 'motion-dexis-circle');
  dexisCircle.setAttribute('r', dexisR);
  dexisG.appendChild(dexisCircle);
  const dexisLabel = document.createElementNS(svgNS, 'text');
  dexisLabel.setAttribute('class', 'motion-dexis-label');
  dexisLabel.setAttribute('text-anchor', 'middle');
  dexisLabel.setAttribute('dy', '5');
  dexisLabel.textContent = 'DEXIS';
  dexisG.appendChild(dexisLabel);
  dexisLayer.appendChild(dexisG);

  // Links — one per source, drawn from source.right toward DEXIS.left
  sources.forEach(s => {
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('class', 'motion-link');
    line.setAttribute('x1', s.rightEdge.x);
    line.setAttribute('y1', s.rightEdge.y);
    line.setAttribute('x2', s.rightEdge.x); // start collapsed
    line.setAttribute('y2', s.rightEdge.y);
    linksLayer.appendChild(line);
    s.link = line;
  });

  // Chain-of-thought lines
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

  // Final compact cards
  const finalEl = document.createElement('div');
  finalEl.className = 'flow-final';
  finalEl.innerHTML = finalCards.map(c => `
    <article class="flow-card" data-final-card>
      <p class="flow-card__dept">${c.dept}</p>
      <p class="flow-card__urgency flow-card__urgency--${c.urgencyMod}">${c.urgency} срочность</p>
      <p class="flow-card__meta">${c.meta}</p>
      <p class="flow-card__value">${c.context}</p>
      <p class="flow-card__action">${c.action}</p>
    </article>
  `).join('');

  scene.append(svg, cotWrap, captionEl, finalEl);

  // -- Helpers --------------------------------------------------
  function setCaption(text) { captionEl.textContent = text; }

  // -- Reset & timeline ----------------------------------------
  function resetScene() {
    sources.forEach(s => {
      gsap.set(s.el, { x: s.x, y: s.y, opacity: 0, scale: 0.92, svgOrigin: '0 0' });
      gsap.set(s.link, {
        attr: { x1: s.rightEdge.x, y1: s.rightEdge.y, x2: s.rightEdge.x, y2: s.rightEdge.y },
        opacity: 0,
      });
    });
    gsap.set(dexisG, { x: dexisX, y: dexisY, scale: 0, svgOrigin: '0 0' });
    gsap.set(dexisCircle, { attr: { r: dexisR } });
    cotWrap.querySelectorAll('.motion-cot__line').forEach(el => gsap.set(el, { opacity: 0 }));
    gsap.set(captionEl, { opacity: 0 });
    gsap.set(finalEl, { opacity: 0 });
    gsap.set(finalEl.querySelectorAll('[data-final-card]'), { opacity: 0, y: 16 });
  }

  let tl;

  function buildTimeline() {
    tl = gsap.timeline({
      paused: true,
      onComplete: () => { if (restartWrap) restartWrap.hidden = false; },
    });

    // ─── INTRO (0.0–1.6s) ────────────────────────────────────
    tl.to(captionEl, {
      opacity: 1, duration: 0.4,
      onStart: () => setCaption('Каждое утро бизнес работает с разрозненными данными'),
    }, 0);
    tl.to(captionEl, { opacity: 0, duration: 0.3 }, 1.6);

    // ─── ACT 1 — sources as a left-side list (1.6–7.0s) ──────
    sources.forEach((s, i) => {
      tl.to(s.el, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 1.6 + i * 0.55);
    });

    // ─── ACT 2 — DEXIS appears (7.4–8.0s) ────────────────────
    tl.to(dexisG, { scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, 7.4);

    // ─── ACT 2b — sequential link draw «чик-чик-чик» (8–13s) ─
    sources.forEach((s, i) => {
      const t = 8.0 + i * 0.65;
      tl.to(s.link, {
        attr: { x2: dexisX - dexisR, y2: dexisY },
        opacity: 0.6,
        duration: 0.45,
        ease: 'power2.out',
      }, t);
      // Brief flash at the line tip to signal "connection made"
      tl.to(s.link, { opacity: 1, duration: 0.1, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t + 0.45);
    });

    // ─── ACT 3 — chain-of-thought (13–21s) ───────────────────
    const cotEls = cotWrap.querySelectorAll('.motion-cot__line');
    const cotStart = 13.0;
    const cotPer = 1.3;
    cotEls.forEach((el, i) => {
      const tIn = cotStart + i * cotPer;
      tl.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' }, tIn);
      if (i < cotEls.length - 1) {
        tl.to(el, { opacity: 0.35, duration: 0.3 }, tIn + cotPer - 0.1);
      }
    });

    // ─── TRANSITION — caption «Выявил паттерны…» (21–23s) ────
    tl.to(captionEl, {
      opacity: 1, duration: 0.4,
      onStart: () => setCaption('Выявил паттерны — предлагаю решение'),
    }, 21.0);

    // ─── ACT 4 — fade everything, reveal three cards (23–30s) ─
    tl.to([...sources.map(s => s.el), ...sources.map(s => s.link), dexisG, cotWrap],
      { opacity: 0, duration: 0.6, ease: 'power2.in' }, 22.6);
    tl.to(captionEl, { opacity: 0, duration: 0.4 }, 23.2);

    tl.to(finalEl, { opacity: 1, duration: 0.3 }, 23.4);
    tl.to(finalEl.querySelectorAll('[data-final-card]'), {
      opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.18,
    }, 23.6);

    tl.to(captionEl, {
      opacity: 1, duration: 0.4,
      onStart: () => setCaption('Готовые поручения для каждого отдела'),
    }, 27.8);
  }

  // -- Init & triggers ------------------------------------------
  resetScene();
  buildTimeline();

  let played = false;
  function play() {
    if (played) return;
    played = true;
    tl.play(0);
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          play();
          io.disconnect();
        }
      });
    }, { threshold: 0.35 });
    io.observe(root);
  } else {
    play();
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      if (restartWrap) restartWrap.hidden = true;
      if (tl) tl.kill();
      resetScene();
      buildTimeline();
      played = true;
      tl.play(0);
    });
  }
})();
