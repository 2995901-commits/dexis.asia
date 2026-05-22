/* Unified flow scene v3 — DEXIS as a sober digital executive, not a pipeline.
 *
 * Owner POV scenario per Codex+Claude joint design (log entries 21:22 + 21:35):
 *   Title-card stays sticky on top. Owner's morning question opens the scene.
 *   DEXIS appears first; sources wait dim; DEXIS activates them by management
 *   question, not in tech order. Inference ladder shows fact → risk → action
 *   for each observation. Final cards emerge from DEXIS-side and carry
 *   source-of-confidence lines. Impact line closes with measurable effect.
 *
 *   0.0–2.0s   Title-card + question «Что требует внимания сегодня?»
 *   2.0–2.6s   DEXIS appears centre-right
 *   2.6–6.6s   Sources activate one by one, dim → on
 *   6.6–7.4s   Speech 1: «Собираю свежие данные»
 *   7.4–17.4s  Speech 2: «Провожу анализ» + 4 inference lines
 *  17.4–18.4s  Speech 3: «Готово — три решения для отделов»
 *  18.4–22.4s  Final cards emerge from DEXIS-side
 *  22.4–26.0s  Impact line: «Утренний бриф готов · 3 решения · 2 риска · ₸4.8M»
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

  // Left-side source list
  const cardW = 190;
  const cardH = 44;
  const cardX = 50 + cardW / 2; // centre at x=145
  const listGap = 10;
  const listTop = 86; // leaves room for title strip on top

  const sources = [
    { id: '1c',     name: '1С',                  metric: 'Выручка · обязательства' },
    { id: 'bank',   name: 'Halyk Bank',          metric: 'Остаток ₸94M' },
    { id: 'crm',    name: 'Bitrix24',            metric: 'Сделки · дебиторка' },
    { id: 'excel',  name: 'Excel поставщиков',   metric: 'Прайс-листы и условия' },
    { id: 'esf',    name: 'ИС ЭСФ',              metric: 'Счета-фактуры' },
  ];

  sources.forEach((s, i) => {
    s.x = cardX;
    s.y = listTop + i * (cardH + listGap) + cardH / 2;
    s.rightEdge = { x: cardX + cardW / 2, y: s.y };
  });

  // DEXIS — centre-right
  const dexisR = 38;
  const dexisX = 540;
  const dexisY = listTop + (sources.length * (cardH + listGap) - listGap) / 2;

  // 4 inference observations: dept · fact · kpi · action
  const inferences = [
    { dept: 'Финансы',    fact: 'Кассовый разрыв через 3 дня',           kpi: '₸4.2M штраф',  action: 'План оплат' },
    { dept: 'Маржа',      fact: 'Поставщик поднял цену',                 kpi: '−1.4 п.п.',    action: 'Пересмотр поставщиков' },
    { dept: 'Дебиторка',  fact: 'ТОО «Х» — 17 дней просрочки',           kpi: '₸42M риск',    action: 'Реструктуризация' },
    { dept: 'Закупки',    fact: 'Альтернативный поставщик даёт −4%',     kpi: '₸4.8M экономия', action: 'Запросить КП' },
  ];

  // Final 3 cards with source-of-confidence
  const finalCards = [
    {
      dept: 'Финансовый отдел',
      urgency: 'высокая',
      urgencyMod: 'high',
      meta: 'Денежный поток',
      context: 'Остаток ₸94M, обязательства ₸67M. Штраф ₸4.2M (3 дня).',
      action: 'Подготовить план оплат с приоритетом по штрафам.',
      source: 'Halyk Bank · 1С',
    },
    {
      dept: 'Коммерческий отдел',
      urgency: 'средняя',
      urgencyMod: 'mid',
      meta: 'Дебиторка',
      context: 'ТОО «Х» — ₸42M, просрочка 17 дней. Топ-10 клиентов.',
      action: 'Согласовать реструктуризацию на 30 дней.',
      source: 'Bitrix24 · 1С',
    },
    {
      dept: 'Закупки',
      urgency: 'низкая',
      urgencyMod: 'low',
      meta: 'Поставщик',
      context: 'АО «Х» +8% за квартал. АО «Y» −4% при том же качестве.',
      action: 'Запросить КП у АО «Y» на квартальный объём.',
      source: 'Excel поставщиков · ИС ЭСФ',
    },
  ];

  // -- Build DOM ------------------------------------------------
  // Sticky title strip + question (HTML overlays)
  const titleStrip = document.createElement('div');
  titleStrip.className = 'motion-title';
  titleStrip.innerHTML = '<span class="motion-title__day">Понедельник, 8:00</span><span class="motion-title__sep">·</span><span class="motion-title__brand">Утренний бриф DEXIS</span>';

  const questionEl = document.createElement('p');
  questionEl.className = 'motion-question';
  questionEl.textContent = 'Что требует внимания сегодня?';

  // SVG canvas
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('aria-hidden', 'true');
  const linksLayer = document.createElementNS(svgNS, 'g');
  const dotsLayer = document.createElementNS(svgNS, 'g');
  const cardsLayer = document.createElementNS(svgNS, 'g');
  const dexisLayer = document.createElementNS(svgNS, 'g');
  svg.append(linksLayer, dotsLayer, cardsLayer, dexisLayer);

  // Source cards (start dim, activate on connection)
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
    name.setAttribute('x', -cardW / 2 + 12);
    name.setAttribute('y', -3);
    name.textContent = s.name;
    g.appendChild(name);

    const metric = document.createElementNS(svgNS, 'text');
    metric.setAttribute('class', 'motion-card__metric');
    metric.setAttribute('x', -cardW / 2 + 12);
    metric.setAttribute('y', 13);
    metric.textContent = s.metric;
    g.appendChild(metric);

    cardsLayer.appendChild(g);
    s.el = g;
  });

  // DEXIS group: outer circle + rotating arc + label
  const dexisG = document.createElementNS(svgNS, 'g');

  const dexisCircle = document.createElementNS(svgNS, 'circle');
  dexisCircle.setAttribute('class', 'motion-dexis-circle');
  dexisCircle.setAttribute('r', dexisR);
  dexisG.appendChild(dexisCircle);

  // Thin rotating arc inside the circle — «processing» signal
  const dexisArcGroup = document.createElementNS(svgNS, 'g');
  dexisArcGroup.classList.add('motion-dexis-arc');
  const dexisArc = document.createElementNS(svgNS, 'path');
  dexisArc.setAttribute('class', 'motion-dexis-arc__path');
  const arcR = dexisR - 12;
  // 270° arc starting at top
  dexisArc.setAttribute('d', `M 0,${-arcR} A ${arcR},${arcR} 0 1 1 ${-arcR},0`);
  dexisArc.setAttribute('fill', 'none');
  dexisArcGroup.appendChild(dexisArc);
  dexisG.appendChild(dexisArcGroup);

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
    line.setAttribute('x2', s.rightEdge.x);
    line.setAttribute('y2', s.rightEdge.y);
    linksLayer.appendChild(line);
    s.link = line;
  });

  // Right-side speech + inference panel
  const sidePanel = document.createElement('div');
  sidePanel.className = 'motion-side';

  const speechEl = document.createElement('p');
  speechEl.className = 'motion-speech';
  sidePanel.appendChild(speechEl);

  const inferenceList = document.createElement('div');
  inferenceList.className = 'motion-inference-list';
  inferences.forEach((item, i) => {
    const row = document.createElement('p');
    row.className = 'motion-inference';
    row.dataset.idx = i;
    row.innerHTML = `<span class="motion-inference__dept">${item.dept}</span><span class="motion-inference__sep">—</span><span class="motion-inference__fact">${item.fact}</span><span class="motion-inference__kpi">${item.kpi}</span><span class="motion-inference__arrow">→</span><span class="motion-inference__action">${item.action}</span>`;
    inferenceList.appendChild(row);
  });
  sidePanel.appendChild(inferenceList);

  // Final compact cards with source-of-confidence
  const finalEl = document.createElement('div');
  finalEl.className = 'flow-final';
  finalEl.innerHTML = `
    <div class="flow-final__summary" data-final-summary>
      <span>Утренний бриф собственника</span>
      <strong>3 решения · 2 риска · 90 секунд</strong>
    </div>
    <div class="flow-final__cards">
      ${finalCards.map(c => `
        <article class="flow-card" data-final-card>
          <p class="flow-card__dept">${c.dept}</p>
          <p class="flow-card__urgency flow-card__urgency--${c.urgencyMod}">${c.urgency} срочность</p>
          <p class="flow-card__meta">${c.meta}</p>
          <p class="flow-card__value">${c.context}</p>
          <p class="flow-card__action">${c.action}</p>
          <p class="flow-card__source">Источник: ${c.source}</p>
        </article>
      `).join('')}
    </div>
    <p class="flow-final__impact" data-final-impact>Потенциальный эффект текущего цикла: ₸4.8M</p>
  `;

  scene.append(titleStrip, questionEl, svg, sidePanel, finalEl);

  // -- Helpers --------------------------------------------------
  function setSpeech(text) { speechEl.textContent = text; }

  // Low-frequency particle stream emitter per link
  const streamHandles = new Map();
  function startStream(s) {
    if (streamHandles.has(s.id)) return;
    function emit() {
      const dot = document.createElementNS(svgNS, 'circle');
      dot.setAttribute('class', 'motion-pulse');
      dot.setAttribute('r', '2.5');
      dot.setAttribute('cx', s.rightEdge.x);
      dot.setAttribute('cy', s.rightEdge.y);
      dotsLayer.appendChild(dot);
      gsap.fromTo(dot,
        { attr: { cx: s.rightEdge.x, cy: s.rightEdge.y }, opacity: 0.6 },
        { attr: { cx: dexisX - dexisR, cy: dexisY }, opacity: 0, duration: 1.3, ease: 'none',
          onComplete: () => dot.remove() }
      );
    }
    emit();
    const handle = setInterval(emit, 800 + Math.random() * 300);
    streamHandles.set(s.id, handle);
  }
  function stopAllStreams() {
    streamHandles.forEach(h => clearInterval(h));
    streamHandles.clear();
  }

  // DEXIS arc continuous rotation
  let arcSpin;
  function startArc() {
    arcSpin = gsap.to(dexisArcGroup, { rotation: 360, duration: 5.5, repeat: -1, ease: 'none', svgOrigin: `${dexisX} ${dexisY}` });
  }
  function stopArc() {
    if (arcSpin) { arcSpin.kill(); arcSpin = null; }
    gsap.set(dexisArcGroup, { rotation: 0, svgOrigin: `${dexisX} ${dexisY}` });
  }

  // -- Reset & timeline ----------------------------------------
  function resetScene() {
    stopAllStreams();
    stopArc();
    dotsLayer.innerHTML = '';

    sources.forEach(s => {
      gsap.set(s.el, { x: s.x, y: s.y, svgOrigin: '0 0' });
      s.el.classList.remove('motion-card--active');
      gsap.set(s.link, {
        attr: { x1: s.rightEdge.x, y1: s.rightEdge.y, x2: s.rightEdge.x, y2: s.rightEdge.y },
        opacity: 0,
      });
    });
    gsap.set(dexisG, { x: dexisX, y: dexisY, scale: 0, svgOrigin: '0 0' });
    gsap.set(dexisArcGroup, { opacity: 0 });
    gsap.set(titleStrip, { opacity: 0, y: -8 });
    gsap.set(questionEl, { opacity: 0 });
    gsap.set(speechEl, { opacity: 0 });
    inferenceList.querySelectorAll('.motion-inference').forEach(el => gsap.set(el, { opacity: 0, y: 6 }));
    gsap.set(finalEl, { opacity: 0 });
    gsap.set(finalEl.querySelector('[data-final-summary]'), { opacity: 0, y: 10 });
    gsap.set(finalEl.querySelectorAll('[data-final-card]'), { opacity: 0, scale: 0.6, x: 80, y: -40 });
    gsap.set(finalEl.querySelector('[data-final-impact]'), { opacity: 0, y: 8 });
  }

  let tl;

  function buildTimeline() {
    tl = gsap.timeline({
      paused: true,
      onComplete: () => { if (restartWrap) restartWrap.hidden = false; },
    });

    // ─── INTRO — title-card + owner question (0–2s) ──────────
    tl.to(titleStrip, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);
    tl.to(questionEl, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.4);
    tl.to(questionEl, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 2.0);

    // ─── ACT 1 — DEXIS arrives first (2.0–2.6s) ──────────────
    tl.to(dexisG, { scale: 1, duration: 0.55, ease: 'back.out(1.4)' }, 2.0);
    tl.to(dexisArcGroup, { opacity: 1, duration: 0.4 }, 2.4);
    tl.add(() => startArc(), 2.5);

    // ─── ACT 2 — sources activate one by one (2.6–6.6s) ──────
    sources.forEach((s, i) => {
      const t = 2.6 + i * 0.8;
      // Light up the source card
      tl.add(() => s.el.classList.add('motion-card--active'), t);
      // Draw link
      tl.to(s.link, {
        attr: { x2: dexisX - dexisR, y2: dexisY },
        opacity: 0.55,
        duration: 0.45,
        ease: 'power2.out',
      }, t);
      // Start particle stream on this link
      tl.add(() => startStream(s), t + 0.35);
    });

    // ─── ACT 3 — speech 1 «Собираю свежие данные» (6.6–7.4s)
    tl.to(speechEl, {
      opacity: 1, duration: 0.4,
      onStart: () => setSpeech('Собираю свежие данные'),
    }, 6.6);

    // ─── ACT 4 — speech 2 «Провожу анализ» + 4 inferences (7.4–17.4s)
    tl.to(speechEl, {
      opacity: 1, duration: 0.4,
      onStart: () => setSpeech('Провожу анализ'),
    }, 7.4);

    const infEls = inferenceList.querySelectorAll('.motion-inference');
    const infStart = 8.2;
    const infPer = 2.2;
    infEls.forEach((el, i) => {
      const t = infStart + i * infPer;
      tl.to(el, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, t);
      if (i < infEls.length - 1) {
        tl.to(el, { opacity: 0.4, duration: 0.4 }, t + infPer - 0.2);
      }
    });

    // ─── ACT 5 — speech 3 «Готово…» (17.4–18.4s) ─────────────
    tl.to(speechEl, {
      opacity: 1, duration: 0.4,
      onStart: () => setSpeech('Готово — три решения для отделов'),
    }, 17.4);

    // ─── ACT 6 — fade scene, cards emerge from DEXIS-side (18.4–22.4s)
    tl.add(() => stopAllStreams(), 18.4);
    tl.to([...sources.map(s => s.el), ...sources.map(s => s.link), dexisG, sidePanel],
      { opacity: 0, duration: 0.6, ease: 'power2.in' }, 18.4);

    tl.to(finalEl, { opacity: 1, duration: 0.3 }, 19.0);
    tl.to(finalEl.querySelector('[data-final-summary]'), {
      opacity: 1, y: 0, duration: 0.45, ease: 'power2.out',
    }, 19.1);
    tl.to(finalEl.querySelectorAll('[data-final-card]'), {
      opacity: 1, scale: 1, x: 0, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.18,
    }, 19.5);

    // ─── ACT 7 — impact line (22.4–26s) ──────────────────────
    tl.to(finalEl.querySelector('[data-final-impact]'), {
      opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
      onStart: () => {
        const el = finalEl.querySelector('[data-final-impact]');
        if (el) el.textContent = 'Утренний бриф готов · 3 решения · 2 риска · ₸4.8M потенциального эффекта';
      },
    }, 22.6);
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
