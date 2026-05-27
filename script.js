const pauseButton = document.querySelector("[data-action='pause']");
const replayButton = document.querySelector("[data-action='replay']");
const sources = [...document.querySelectorAll("[data-source]")];
const analysisItems = [...document.querySelectorAll("[data-analysis]")];
const workerState = document.querySelector("[data-worker-state]");
const output = document.querySelector("[data-decision-output]");
const streams = document.querySelector(".data-streams");
const outputStreams = document.querySelector(".output-streams");
const mobileDataFlow = document.querySelector(".mobile-data-flow");
const mobileOutputFlow = document.querySelector(".mobile-output-flow");
const thinkingPanel = document.querySelector("[data-thinking-panel]");
const processTitle = document.querySelector("[data-process-title]");
const processCaption = document.querySelector("[data-process-caption]");
const stage = document.querySelector("[data-work-stage]");
const workSection = document.querySelector("#work");

let timer = null;
let running = false;
let hasStarted = false;
let step = 0;

const states = [
  {
    worker: "Собираю данные",
    process: "Принимаю данные из источников",
    caption: "DEXIS постоянно подключён к 1С, банку, CRM, складу, закупкам, задачам и файлам.",
    phase: "thinking"
  },
  {
    worker: "Собираю данные",
    process: "Связываю фрагменты",
    caption: "Финансы, продажи, склад и закупки показывают свои части реальности. DEXIS связывает их в одну управленческую цепочку.",
    phase: "thinking"
  },
  {
    worker: "Сверяю отклонения",
    process: "Ищу влияние между отделами",
    caption: "Система смотрит не на отдельный факт, а на связь между оплатой клиента, закупочной ценой, резервом склада и сроком поставки.",
    phase: "thinking"
  },
  {
    worker: "Сверяю с планом",
    process: "Считаю последствия",
    caption: "DEXIS оценивает, что будет при задержке решения: как изменятся маржа, срок поставки и обязательство перед клиентом.",
    phase: "thinking"
  },
  {
    worker: "Сравниваю сценарии",
    process: "Готовлю варианты решения",
    caption: "Система сравнивает варианты: ждать оплату, менять условия или связать финансы, коммерцию, склад и закупки в один план.",
    phase: "thinking"
  },
  {
    worker: "Вывод: связь",
    process: "Связь между отделами найдена",
    caption: "Оплата, закупочная цена, резерв склада и обещанный срок поставки влияют на одно решение.",
    phase: "result",
    reveal: 0
  },
  {
    worker: "Вывод: последствия",
    process: "Последствия рассчитаны",
    caption: "Если принять решение по одному фрагменту, можно потерять маржу или сорвать срок поставки.",
    phase: "result",
    reveal: 1
  },
  {
    worker: "Вывод: сценарии",
    process: "Сценарии сравнены",
    caption: "DEXIS сравнил ожидание оплаты, изменение условий и связанный план по ответственным отделам.",
    phase: "result",
    reveal: 2
  },
  {
    worker: "Решение готово",
    process: "Решение руководителя подготовлено",
    caption: "Предложен план: уточнить дату оплаты, пересчитать маржу и подтвердить доступный остаток под поставку.",
    phase: "result",
    reveal: 3
  },
  {
    worker: "Рекомендации готовы",
    process: "Поручения и контроль готовы",
    caption: "DEXIS превратил выбранный сценарий в задачи для финансов, коммерции, закупок и контроль на завтра.",
    phase: "final",
    reveal: 3
  }
];

function paint(nextStep) {
  step = nextStep % states.length;
  const state = states[step];
  workerState.textContent = state.worker;
  processTitle.textContent = state.process;
  processCaption.textContent = state.caption;

  sources.forEach((item, index) => {
    item.classList.toggle("active", index <= Math.min(step + 1, sources.length - 1));
  });

  streams?.classList.toggle("is-running", running && step < states.length - 1);
  mobileDataFlow?.classList.toggle("is-running", running && step < states.length - 1);
  outputStreams?.classList.toggle("is-running", running && (state.phase === "result" || state.phase === "final"));
  mobileOutputFlow?.classList.toggle("is-running", running && (state.phase === "result" || state.phase === "final"));
  thinkingPanel?.classList.toggle("is-done", state.phase !== "thinking");

  analysisItems.forEach((item, index) => {
    const shouldReveal = typeof state.reveal === "number" && index <= state.reveal;
    const shouldActivate = typeof state.reveal === "number" && index === state.reveal && state.phase !== "final";
    item.classList.toggle("is-revealed", shouldReveal);
    item.classList.toggle("active", shouldActivate);
  });

  output.classList.toggle("ready", state.phase === "final");
}

function renderIdle() {
  step = 0;
  const state = states[0];
  workerState.textContent = state.worker;
  processTitle.textContent = state.process;
  processCaption.textContent = state.caption;
  sources.forEach((item) => item.classList.remove("active"));
  analysisItems.forEach((item) => item.classList.remove("active", "is-revealed"));
  streams?.classList.remove("is-running");
  mobileDataFlow?.classList.remove("is-running");
  outputStreams?.classList.remove("is-running");
  mobileOutputFlow?.classList.remove("is-running");
  thinkingPanel?.classList.remove("is-done");
  output.classList.remove("ready");
}

function schedule() {
  clearInterval(timer);
  if (!running) return;
  timer = setInterval(() => {
    if (step >= states.length - 1) {
      clearInterval(timer);
      return;
    }
    paint(step + 1);
  }, 2800);
}

pauseButton.addEventListener("click", () => {
  if (!hasStarted) {
    hasStarted = true;
    running = true;
    pauseButton.textContent = "Пауза";
    paint(0);
    schedule();
    return;
  }

  hasStarted = true;
  running = !running;
  pauseButton.textContent = running ? "Пауза" : "Продолжить";
  paint(step);
  schedule();
});

replayButton.addEventListener("click", () => {
  hasStarted = true;
  running = true;
  pauseButton.textContent = "Пауза";
  paint(0);
  schedule();
});

renderIdle();
pauseButton.textContent = "Пауза";

function startWhenReady() {
  if (hasStarted) return;
  const target = workSection || stage;
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const enteredView = rect.top < window.innerHeight * 0.72 && rect.bottom > window.innerHeight * 0.12;

  if (!enteredView) return;
  hasStarted = true;
  running = true;
  pauseButton.textContent = "Пауза";
  paint(0);
  schedule();
}

// v22: H1 word-stagger entry — оборачиваем каждое слово в span.h1-word,
// затем добавляем .is-revealed на h1 для запуска CSS-анимации.
(function setupHeroH1Stagger() {
  const h1 = document.querySelector(".hero h1");
  if (!h1) return;
  const text = h1.innerHTML;
  // Разбиваем по пробелам, сохраняя &nbsp; entities как часть слова
  const words = text.split(/(\s+)/);
  h1.innerHTML = words
    .map((w) => (w.trim() ? `<span class="h1-word">${w}</span>` : w))
    .join("");
  window.requestAnimationFrame(() => {
    setTimeout(() => h1.classList.add("is-revealed"), 100);
  });
})();

// v22: Magnetic cursor — primary CTAs slightly follow cursor when hovered.
// strength 0.22 — заметно, но не cartoonish.
(function setupMagneticCTAs() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(hover: none)").matches) return; // skip touch devices
  const STRENGTH = 0.22;
  const RADIUS = 90;
  const targets = document.querySelectorAll(".nav-action, .offer-cta, .contact-submit");
  targets.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < RADIUS + Math.max(rect.width, rect.height) / 2) {
        el.style.setProperty("--mx", `${dx * STRENGTH}px`);
        el.style.setProperty("--my", `${dy * STRENGTH}px`);
      }
    });
    el.addEventListener("mouseleave", () => {
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    });
  });
})();

// v22: connections-graph — запуск sequential entry через 600ms после load,
// чтобы граф уже начал отрисовываться когда пользователь видит hero (без scroll).
(function setupConnectionsGraph() {
  const cg = document.querySelector(".connections-graph");
  if (!cg) return;
  // Если prefers-reduced-motion — добавляем сразу (CSS подхватит)
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cg.classList.add("is-running");
    return;
  }
  // Иначе — небольшая пауза для драматического entry после load
  window.requestAnimationFrame(() => {
    setTimeout(() => cg.classList.add("is-running"), 350);
  });
})();

// v22: scroll-reveal stagger через IntersectionObserver
// Все [data-reveal] элементы получают .is-visible когда входят в viewport
// Stagger через CSS var --reveal-delay на дочерних элементах parent'а с data-reveal-group
(function setupScrollReveal() {
  if (!("IntersectionObserver" in window)) {
    // Старые браузеры — показываем сразу
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
    return;
  }

  // Назначаем stagger delay для дочерних [data-reveal] внутри data-reveal-group
  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    const children = group.querySelectorAll("[data-reveal]");
    children.forEach((child, index) => {
      child.style.setProperty("--reveal-delay", `${index * 90}ms`);
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));
})();

// v22: single IntersectionObserver + 1 scroll fallback for legacy browsers.
// Заменил 8 fallback (scroll/resize/4×setTimeout/setInterval/clearInterval) → 1 observer.
if ("IntersectionObserver" in window && workSection) {
  const startObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      startWhenReady();
      startObserver.disconnect();
    }
  }, { threshold: 0.2 });
  startObserver.observe(workSection);
} else {
  // Fallback для очень старых браузеров
  const onScroll = () => {
    startWhenReady();
    if (hasStarted) window.removeEventListener("scroll", onScroll);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
}
