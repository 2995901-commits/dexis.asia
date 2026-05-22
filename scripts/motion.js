/* Unified flow scene (section 2 — «Как работает DEXIS»).
 * Auto-plays on first viewport entry. Three acts in one scene:
 *   1. Sources appear in chaos (0–7s)
 *   2. DEXIS processes data, chain-of-thought visible (7–22s)
 *   3. Final frame: morning brief mock-up with three orders (22–30s)
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
  const H = 600;
  const cx = W / 2;
  const cy = H / 2 - 30;
  const orbitR = 210;

  const sources = [
    { id: '1c',    name: '1С:Бухгалтерия',     metric: 'Выручка ₸384M',           chaos: { x: 110, y: 120 } },
    { id: 'esf',   name: 'ИС ЭСФ',              metric: '1 247 счетов-фактур',     chaos: { x: 620, y: 90  } },
    { id: 'bank',  name: 'Halyk Bank',          metric: 'Остаток ₸94M',            chaos: { x: 140, y: 340 } },
    { id: 'crm',   name: 'Bitrix24',            metric: '23 активные сделки',      chaos: { x: 580, y: 300 } },
    { id: 'excel', name: 'Поставщики_май.xlsx', metric: 'Excel · ручной ввод',     chaos: { x: 70,  y: 230 } },
    { id: 'kgd',   name: 'КГД',                 metric: 'Налоговая нагрузка 8.2%', chaos: { x: 670, y: 440 } },
    { id: 'gz',    name: 'Goszakup.gov.kz',     metric: '3 активных тендера',      chaos: { x: 320, y: 470 } },
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
    'Готовлю поручения ответственным.',
  ];

  const tasks = [
    {
      dept: 'Финансовый отдел',
      urgency: 'высокая',
      urgencyMod: 'high',
      type: 'Управление денежным потоком',
      owner: 'Финансовый директор',
      context: 'На счетах ₸94M. Срочные обязательства за неделю — ₸67M. Свободный остаток для распределения — ₸27M. Среди обязательств — штраф по поставке от 14.05 (₸4.2M, до срока 3 дня).',
      action: 'Подготовить план оплат на неделю с приоритетом по штрафным обязательствам и ключевым поставщикам.',
    },
    {
      dept: 'Коммерческий отдел',
      urgency: 'средняя',
      urgencyMod: 'mid',
      type: 'Дебиторская задолженность',
      owner: 'Коммерческий директор',
      context: 'Клиент ТОО «Х». Задолженность ₸42M, просрочка 17 дней. За 12 месяцев клиент сделал оборот ₸380M (входит в топ-10).',
      action: 'Согласовать с клиентом план реструктуризации с продлением графика на 30 дней. Скрипт разговора — в приложенном файле.',
    },
    {
      dept: 'Закупки',
      urgency: 'низкая',
      urgencyMod: 'low',
      type: 'Поставщик',
      owner: 'Директор по закупкам',
      context: 'Цена закупки у поставщика АО «Х» выросла на +8% за квартал. Альтернативный поставщик АО «Y» предлагает −4% при сопоставимом качестве, подтверждённом тремя успешными поставками в 2025 году.',
      action: 'Запросить коммерческое предложение у АО «Y» на квартальный объём.',
    },
  ];

  // -- Build DOM ------------------------------------------------
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
  dexisCircle.setAttribute('r', '44');
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

  // Morning brief mock-up
  const briefEl = document.createElement('article');
  briefEl.className = 'morning-brief';
  briefEl.setAttribute('aria-label', 'Утренний бриф DEXIS — пример');
  briefEl.innerHTML = `
    <header class="morning-brief__head">
      <span class="morning-brief__brand">DEXIS · Утренний бриф</span>
      <time class="morning-brief__time">Сегодня, 8:00</time>
    </header>
    <ol class="morning-brief__tasks">
      ${tasks.map(t => `
        <li class="morning-brief__task">
          <header class="morning-brief__task-head">
            <span class="morning-brief__dept">${t.dept}</span>
            <span class="morning-brief__urgency morning-brief__urgency--${t.urgencyMod}">${t.urgency} срочность</span>
          </header>
          <dl class="morning-brief__meta">
            <dt>Тип</dt><dd>${t.type}</dd>
            <dt>Ответственный</dt><dd>${t.owner}</dd>
          </dl>
          <div class="morning-brief__section">
            <span class="morning-brief__label">Контекст</span>
            <p>${t.context}</p>
          </div>
          <div class="morning-brief__section">
            <span class="morning-brief__label">Предлагаемое действие</span>
            <p>${t.action}</p>
          </div>
        </li>
      `).join('')}
    </ol>
  `;

  scene.append(svg, cotWrap, captionEl, briefEl);

  // -- Helpers --------------------------------------------------
  function setCaption(text) { captionEl.textContent = text; }

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
    gsap.set(dexisG, { x: cx, y: cy, scale: 0, svgOrigin: '0 0' });
    gsap.set(dexisCircle, { attr: { r: 44 } });
    cotWrap.querySelectorAll('.motion-cot__line').forEach(el => gsap.set(el, { opacity: 0 }));
    gsap.set(captionEl, { opacity: 0 });
    gsap.set(briefEl, { opacity: 0, scale: 0.96 });
  }

  let tl;

  function buildTimeline() {
    tl = gsap.timeline({
      paused: true,
      onComplete: () => { if (restartWrap) restartWrap.hidden = false; },
    });

    // ─── ACT 1 — Sources appear in chaos (0–7s) ──────────────
    sources.forEach((s, i) => {
      tl.to(s.el, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 0.5 + i * 0.8);
    });
    tl.to(captionEl, {
      opacity: 1, duration: 0.4,
      onStart: () => setCaption('Данные среднего бизнеса в Казахстане живут в десяти разных системах'),
    }, 6.4);

    // ─── ACT 2 — DEXIS processes (7–22s) ─────────────────────
    tl.to(captionEl, { opacity: 0, duration: 0.3 }, 7.6);
    tl.to(dexisG, { scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, 7.8);
    sources.forEach(s => {
      tl.to(s.el, { x: s.orbit.x, y: s.orbit.y, duration: 1.5, ease: 'power3.inOut' }, 8.2);
    });
    sources.forEach(s => {
      tl.to(s.link, {
        attr: { x1: s.orbit.x, y1: s.orbit.y, x2: cx, y2: cy },
        opacity: 0.6, duration: 0.8, ease: 'power2.out',
      }, 9.5);
    });
    sources.forEach((s, i) => {
      for (let k = 0; k < 4; k++) {
        const delay = 10.5 + i * 0.18 + k * 1.6;
        tl.add(() => dotPulse(s, 0), delay);
      }
    });

    const cotEls = cotWrap.querySelectorAll('.motion-cot__line');
    const cotTimings = [
      [10.5, 12.0], [12.0, 13.5], [13.5, 15.0],
      [15.0, 16.5], [16.5, 18.0], [18.0, 20.0],
    ];
    cotEls.forEach((el, i) => {
      const [tIn, tOut] = cotTimings[i];
      tl.to(el, { opacity: 1, duration: 0.4, ease: 'power2.out' }, tIn);
      if (i < cotEls.length - 1) {
        tl.to(el, { opacity: 0.35, duration: 0.3 }, tOut - 0.1);
      }
    });

    tl.to(captionEl, {
      opacity: 1, duration: 0.4,
      onStart: () => setCaption('DEXIS объединяет данные и собирает поручения для каждого отдела'),
    }, 19.0);
    tl.to(dexisCircle, { attr: { r: 48 }, duration: 0.5, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 20.0);

    // ─── ACT 3 — Morning brief mock-up (22–30s) ──────────────
    tl.to(captionEl, { opacity: 0, duration: 0.3 }, 21.4);
    tl.to(cotEls, { opacity: 0, duration: 0.4 }, 21.6);
    tl.to([...sources.map(s => s.el), ...sources.map(s => s.link), dexisG], {
      opacity: 0, duration: 0.8, ease: 'power2.in',
    }, 22.0);
    tl.to(briefEl, { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.4)' }, 22.6);
    tl.to(captionEl, {
      opacity: 1, duration: 0.4,
      onStart: () => setCaption('От разрозненных данных — к готовому действию'),
    }, 28.2);
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
    // Fallback: play immediately
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
