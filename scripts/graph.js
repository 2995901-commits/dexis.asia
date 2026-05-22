/* Sources graph (section 2, approach).
 * D3 v7 force-directed graph: DEXIS centre + 7 primary sources + 4 pending.
 * Drag-and-return via force simulation; hover/focus shows source tooltip;
 * mobile (<768px) freezes nodes to a static radial grid and disables drag.
 */
(() => {
  'use strict';

  const root = document.querySelector('[data-graph-root]');
  if (!root || typeof window.d3 === 'undefined') return;

  const canvas = root.querySelector('[data-graph-canvas]');
  const tooltip = root.querySelector('[data-graph-tooltip]');
  const toggle = root.querySelector('[data-graph-toggle]');

  const primarySources = [
    {
      id: '1c',
      name: '1С',
      label: 'Конфигурации 1С',
      detail: 'Бухгалтерия, Управление торговлей, УНФ, Комплексная автоматизация. Подтягивает остатки, проводки, движение по складам, расчёты с контрагентами.',
    },
    {
      id: 'esf',
      name: 'ИС ЭСФ',
      label: 'Электронные счета-фактуры',
      detail: 'Информационная система ЭСФ Республики Казахстан. Подтягивает счета-фактуры, отгрузки, движения по контрагентам.',
    },
    {
      id: 'tax',
      name: 'Налоговые системы РК',
      label: 'СОНО + КГД',
      detail: 'Кабинет налогоплательщика КГД и портал СОНО. Подтягивает декларации, налоговую нагрузку, обязательства, статусы по контрагентам.',
    },
    {
      id: 'crm',
      name: 'CRM',
      label: 'Bitrix24, amoCRM',
      detail: 'Сделки, лиды, контакты, история коммуникаций. Подтягивает воронку, активность менеджеров, конверсии по этапам.',
    },
    {
      id: 'bank',
      name: 'Банк-клиенты',
      label: 'Halyk, Каспи Business, Forte',
      detail: 'Подтягивает остатки на счетах, входящие и исходящие платежи, прогноз кассового потока на ближайшие недели.',
    },
    {
      id: 'sheets',
      name: 'Таблицы',
      label: 'Excel, Google Sheets',
      detail: 'Ручные операционные таблицы — поставщики, прайс-листы, оперативные планы. Подтягивает данные, которых нет в учётных системах.',
    },
    {
      id: 'gz',
      name: 'Госзакупки',
      label: 'goszakup.gov.kz',
      detail: 'Тендеры, заявки, контракты, графики поставок. Подтягивает активные тендеры по интересам компании и статусы выигранных лотов.',
    },
  ];

  const pendingSources = [
    {
      id: 'stat',
      name: 'Stat.gov.kz',
      label: 'Бюро национальной статистики',
      detail: 'Отраслевая статистика, демография регионов, индексы цен. В разработке.',
    },
    {
      id: 'nbk',
      name: 'Национальный Банк РК',
      label: 'Курсы и регуляторные данные',
      detail: 'Курсы валют, ставки рефинансирования, регуляторные обновления. В разработке.',
    },
    {
      id: 'wa',
      name: 'WhatsApp Business',
      label: 'Бизнес-коммуникации',
      detail: 'Входящие обращения клиентов, история переписки, статусы сделок. В разработке.',
    },
    {
      id: 'erp',
      name: 'ERP-системы',
      label: 'SAP, 1С:ERP',
      detail: 'Крупные ERP-внедрения с многоконтурным учётом. В разработке.',
    },
  ];

  const dexisNode = {
    id: 'dexis',
    name: 'DEXIS',
    radius: 48,
    group: 'dexis',
  };

  const primaryNodes = primarySources.map(s => ({
    ...s,
    radius: 38,
    group: 'source',
  }));

  const pendingNodes = pendingSources.map(s => ({
    ...s,
    radius: 28,
    group: 'pending',
  }));

  const primaryLinks = primaryNodes.map(n => ({ source: 'dexis', target: n.id, group: 'source' }));
  const pendingLinks = pendingNodes.map(n => ({ source: 'dexis', target: n.id, group: 'pending' }));

  const reduced = document.documentElement.dataset.reducedMotion === 'true';
  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

  let width = canvas.clientWidth || 800;
  let height = canvas.clientHeight || 520;
  let pendingVisible = false;
  let simulation;
  let nodeSel;
  let linkSel;

  const svg = window.d3.select(canvas)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('role', 'img')
    .attr('aria-label', 'Граф источников данных, к которым подключается DEXIS');

  const linkLayer = svg.append('g').attr('class', 'graph-links');
  const nodeLayer = svg.append('g').attr('class', 'graph-nodes');

  function radialSeed(nodes, ringRadius) {
    const cx = width / 2;
    const cy = height / 2;
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
      n.x = cx + ringRadius * Math.cos(angle);
      n.y = cy + ringRadius * Math.sin(angle);
      n.homeX = n.x;
      n.homeY = n.y;
    });
  }

  function activeNodes() {
    return pendingVisible
      ? [dexisNode, ...primaryNodes, ...pendingNodes]
      : [dexisNode, ...primaryNodes];
  }

  function activeLinks() {
    return pendingVisible
      ? [...primaryLinks, ...pendingLinks]
      : [...primaryLinks];
  }

  dexisNode.x = width / 2;
  dexisNode.y = height / 2;
  dexisNode.fx = width / 2;
  dexisNode.fy = height / 2;

  radialSeed(primaryNodes, Math.min(width, height) * 0.32);
  radialSeed(pendingNodes, Math.min(width, height) * 0.46);

  function render() {
    const nodes = activeNodes();
    const links = activeLinks();

    linkSel = linkLayer.selectAll('line').data(links, d => `${d.source.id || d.source}-${d.target.id || d.target}`);
    linkSel.exit().remove();
    linkSel = linkSel.enter().append('line')
      .attr('class', d => `graph-link ${d.group === 'pending' ? 'graph-link--pending' : ''}`)
      .merge(linkSel);

    nodeSel = nodeLayer.selectAll('g.graph-node').data(nodes, d => d.id);
    nodeSel.exit().remove();
    const nodeEnter = nodeSel.enter().append('g')
      .attr('class', d => `graph-node graph-node--${d.group}`)
      .attr('tabindex', d => d.group === 'dexis' ? -1 : 0)
      .attr('role', d => d.group === 'dexis' ? 'img' : 'button')
      .attr('aria-label', d => d.group === 'dexis' ? 'DEXIS — центральный узел' : `${d.name}. ${d.label}`);

    nodeEnter.append('circle').attr('r', d => d.radius);
    nodeEnter.append('text')
      .attr('dy', d => d.group === 'dexis' ? 5 : 4)
      .attr('text-anchor', 'middle')
      .text(d => d.name);

    nodeSel = nodeEnter.merge(nodeSel);

    nodeSel
      .on('mouseenter', (event, d) => onActivate(event.currentTarget, d))
      .on('mouseleave', () => onDeactivate())
      .on('focus', (event, d) => onActivate(event.currentTarget, d))
      .on('blur', () => onDeactivate());

    if (!isMobile() && !reduced) {
      nodeSel.filter(d => d.group !== 'dexis').call(
        window.d3.drag()
          .on('start', dragStart)
          .on('drag', dragged)
          .on('end', dragEnd)
      );
    }

    if (simulation) simulation.stop();

    if (isMobile() || reduced) {
      // Static radial grid — no force simulation.
      nodes.forEach(n => {
        if (n.group === 'dexis') return;
        n.fx = n.homeX;
        n.fy = n.homeY;
      });
      tickStatic();
    } else {
      simulation = window.d3.forceSimulation(nodes)
        .force('link', window.d3.forceLink(links).id(d => d.id).distance(d => d.group === 'pending' ? 180 : 150).strength(0.6))
        .force('charge', window.d3.forceManyBody().strength(-420))
        .force('center', window.d3.forceCenter(width / 2, height / 2))
        .force('collide', window.d3.forceCollide().radius(d => d.radius + 14))
        .force('radial', window.d3.forceRadial(d => {
          if (d.group === 'dexis') return 0;
          return d.group === 'pending' ? Math.min(width, height) * 0.42 : Math.min(width, height) * 0.30;
        }, width / 2, height / 2).strength(0.4))
        .on('tick', tick);
    }
  }

  function tick() {
    linkSel
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    nodeSel.attr('transform', d => `translate(${d.x},${d.y})`);
  }

  function tickStatic() {
    linkSel
      .attr('x1', d => (typeof d.source === 'object' ? d.source : findNode(d.source)).x)
      .attr('y1', d => (typeof d.source === 'object' ? d.source : findNode(d.source)).y)
      .attr('x2', d => (typeof d.target === 'object' ? d.target : findNode(d.target)).x)
      .attr('y2', d => (typeof d.target === 'object' ? d.target : findNode(d.target)).y);
    nodeSel.attr('transform', d => `translate(${d.x},${d.y})`);
  }

  function findNode(id) {
    return activeNodes().find(n => n.id === id);
  }

  function dragStart(event, d) {
    if (!event.active && simulation) simulation.alphaTarget(0.25).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragEnd(event, d) {
    if (!event.active && simulation) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function onActivate(el, d) {
    if (d.group === 'dexis') return;
    window.d3.select(el).classed('is-active', true);
    linkSel
      .filter(link => (link.source.id || link.source) === d.id || (link.target.id || link.target) === d.id)
      .classed('is-active', true);
    showTooltip(el, d);
  }

  function onDeactivate() {
    nodeSel.classed('is-active', false);
    linkSel.classed('is-active', false);
    hideTooltip();
  }

  function showTooltip(el, d) {
    if (!tooltip) return;
    tooltip.innerHTML = '';
    const label = document.createElement('span');
    label.className = 'graph-tooltip__label';
    label.textContent = d.group === 'pending' ? 'Источник в разработке' : 'Источник';
    const title = document.createElement('span');
    title.className = 'graph-tooltip__title';
    title.textContent = d.name;
    const body = document.createElement('span');
    body.textContent = d.detail;
    tooltip.append(label, title, body);

    tooltip.hidden = false;
    requestAnimationFrame(() => tooltip.classList.add('is-visible'));

    const rect = el.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const ttWidth = tooltip.offsetWidth;
    const ttHeight = tooltip.offsetHeight;
    let left = rect.left - rootRect.left + rect.width / 2 - ttWidth / 2;
    let top = rect.top - rootRect.top - ttHeight - 14;
    if (top < 8) top = rect.bottom - rootRect.top + 14;
    if (left < 8) left = 8;
    if (left + ttWidth > rootRect.width - 8) left = rootRect.width - ttWidth - 8;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function hideTooltip() {
    if (!tooltip) return;
    tooltip.classList.remove('is-visible');
    setTimeout(() => { if (!tooltip.classList.contains('is-visible')) tooltip.hidden = true; }, 200);
  }

  function handleResize() {
    const newWidth = canvas.clientWidth || width;
    const newHeight = canvas.clientHeight || height;
    if (newWidth === width && newHeight === height) return;
    width = newWidth;
    height = newHeight;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    dexisNode.fx = width / 2;
    dexisNode.fy = height / 2;
    radialSeed(primaryNodes, Math.min(width, height) * 0.32);
    radialSeed(pendingNodes, Math.min(width, height) * 0.46);
    render();
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      pendingVisible = !pendingVisible;
      toggle.setAttribute('aria-expanded', pendingVisible ? 'true' : 'false');
      toggle.textContent = pendingVisible ? 'Скрыть дополнительные' : 'Показать все источники';
      render();
    });
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 200);
  });

  render();
})();
