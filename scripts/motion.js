/* Unified flow scene (section 2 — «Как работает DEXIS»).
 * Auto-plays on first viewport entry. Universal copy (no industry specifics).
 *
 *  0.0–3.2s   Owner POV caption: Monday morning, three urgent questions
 *  3.0–6.8s   Five familiar source cards appear in a left-side column
 *  7.0–11.0s  DEXIS and links compress scattered systems into one view
 * 11.0–18.0s  Business observations with restrained KPI emphasis
 * 18.0–24.0s  Morning brief, three assignments, impact line
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
    { id: 'bank',  name: 'Halyk Bank',            metric: 'Остаток ₸94M' },
    { id: 'crm',   name: 'Bitrix24',              metric: '23 активные сделки' },
    { id: 'excel', name: 'Поставщики_май.xlsx',   metric: 'Excel · ручной ввод' },
    { id: 'esf',   name: 'ИС ЭСФ',                metric: '1 247 счетов-фактур' },
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
    { text: 'Кассовый разрыв через 3 дня.', kpi: '₸4.2M' },
    { text: 'Маржа основного направления сжалась за неделю.', kpi: '−1.4 п.п.' },
    { text: 'Дебиторка ТОО «Х» вышла из контроля.', kpi: '17 дней' },
    { text: 'Альтернативный поставщик даёт квартальную экономию.', kpi: '₸4.8M' },
    { text: 'Приоритеты на день готовы к подтверждению.', kpi: '3 решения' },
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

  // Business observation lines
  const cotWrap = document.createElement('div');
  cotWrap.className = 'motion-cot';
  cotLines.forEach((item, i) => {
    const p = document.createElement('p');
    p.className = 'motion-cot__line';
    p.dataset.cot = i;
    p.textContent = item.text;
    cotWrap.appendChild(p);
  });

  const kpiFlash = document.createElement('div');
  kpiFlash.className = 'motion-kpi-flash';

  const captionEl = document.createElement('p');
  captionEl.className = 'motion-caption';

  // Final compact cards
  const finalEl = document.createElement('div');
  finalEl.className = 'flow-final';
  finalEl.innerHTML = `
    <div class="flow-final__summary" data-final-summary>
      <span>Утренний бриф собственника</span>
      <strong>3 решения · 90 секунд</strong>
    </div>
    <div class="flow-final__cards">
      ${finalCards.map(c => `
    <article class="flow-card" data-final-card>
      <p class="flow-card__dept">${c.dept}</p>
      <p class="flow-card__urgency flow-card__urgency--${c.urgencyMod}">${c.urgency} срочность</p>
      <p class="flow-card__meta">${c.meta}</p>
      <p class="flow-card__value">${c.context}</p>
      <p class="flow-card__action">${c.action}</p>
    </article>
      `).join('')}
    </div>
    <p class="flow-final__impact" data-final-impact>Потенциальный эффект текущего цикла: ₸4.8M</p>
  `;

  scene.append(svg, cotWrap, kpiFlash, captionEl, finalEl);

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
    gsap.set(kpiFlash, { opacity: 0, y: 8 });
    gsap.set(captionEl, { opacity: 0 });
    gsap.set(finalEl, { opacity: 0 });
    gsap.set(finalEl.querySelector('[data-final-summary]'), { opacity: 0, y: 10 });
    gsap.set(finalEl.querySelectorAll('[data-final-card]'), { opacity: 0, y: 16 });
    gsap.set(finalEl.querySelector('[data-final-impact]'), { opacity: 0, y: 8 });
  }

  let tl;

  function buildTimeline() {
    tl = gsap.timeline({
      paused: true,
      onComplete: () => { if (restartWrap) restartWrap.hidden = false; },
    });

    // ─── INTRO — owner POV (0.0–3.2s) ────────────────────────
    tl.to(captionEl, {
      opacity: 1, duration: 0.4,
      onStart: () => setCaption('Понедельник, 8:00. Что главное сегодня: деньги, риски или поручения?'),
    }, 0);
    tl.to(captionEl, { opacity: 0, duration: 0.3 }, 3.0);

    // ─── ACT 1 — familiar systems, one focal beat at a time (3–6.8s)
    sources.forEach((s, i) => {
      tl.to(s.el, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }, 3.0 + i * 0.45);
    });

    // ─── ACT 2 — DEXIS appears and consolidates sources (7–11s)
    tl.to(dexisG, { scale: 1, duration: 0.55, ease: 'back.out(1.4)' }, 7.0);

    sources.forEach((s, i) => {
      const t = 7.7 + i * 0.45;
      tl.to(s.link, {
        attr: { x2: dexisX - dexisR, y2: dexisY },
        opacity: 0.6,
        duration: 0.38,
        ease: 'power2.out',
      }, t);
      tl.to(s.link, { opacity: 1, duration: 0.1, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t + 0.45);
    });

    // ─── ACT 3 — business observations with restrained KPI emphasis (11–18s)
    const cotEls = cotWrap.querySelectorAll('.motion-cot__line');
    const cotStart = 11.0;
    const cotPer = 1.25;
    cotEls.forEach((el, i) => {
      const tIn = cotStart + i * cotPer;
      tl.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' }, tIn);
      tl.to(kpiFlash, {
        opacity: 1,
        y: 0,
        duration: 0.22,
        onStart: () => { kpiFlash.textContent = cotLines[i].kpi; },
      }, tIn + 0.15);
      tl.to(kpiFlash, { opacity: 0, y: -6, duration: 0.45 }, tIn + 0.72);
      if (i < cotEls.length - 1) {
        tl.to(el, { opacity: 0.35, duration: 0.3 }, tIn + cotPer - 0.1);
      }
    });

    // ─── TRANSITION — brief reveal setup (18–19s) ────────────
    tl.to(captionEl, {
      opacity: 1, duration: 0.4,
      onStart: () => setCaption('DEXIS выделил главное и подготовил решения для отделов.'),
    }, 18.0);

    // ─── ACT 4 — morning brief, three assignments, impact (19–24s)
    tl.to([...sources.map(s => s.el), ...sources.map(s => s.link), dexisG, cotWrap, kpiFlash],
      { opacity: 0, duration: 0.6, ease: 'power2.in' }, 18.6);
    tl.to(captionEl, { opacity: 0, duration: 0.35 }, 19.0);

    tl.to(finalEl, { opacity: 1, duration: 0.3 }, 19.2);
    tl.to(finalEl.querySelector('[data-final-summary]'), {
      opacity: 1, y: 0, duration: 0.45, ease: 'power2.out',
    }, 19.3);
    tl.to(finalEl.querySelectorAll('[data-final-card]'), {
      opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.18,
    }, 19.8);
    tl.to(finalEl.querySelector('[data-final-impact]'), {
      opacity: 1, y: 0, duration: 0.45, ease: 'power2.out',
    }, 21.4);

    tl.to(captionEl, {
      opacity: 1, duration: 0.4,
      onStart: () => setCaption('Утро без хаоса. Управление начинается с трёх решений.'),
    }, 22.8);
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
