// ===== SECURITY: IIFE to avoid global scope pollution =====
'use strict';
(function () {
  // ===== HELPER: Safe text element creation =====
  function createEl(tag, attrs, textContent) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [key, value] of Object.entries(attrs)) {
        if (key === 'className') el.className = value;
        else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
        else if (key.startsWith('data-')) el.setAttribute(key, value);
        else el[key] = value;
      }
    }
    if (textContent !== undefined) el.textContent = textContent;
    return el;
  }

  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  // Allowed country keys — whitelist for input validation
  const ALLOWED_COUNTRIES = ['india', 'usa', 'uk'];

  function sanitizeCountry(value) {
    if (ALLOWED_COUNTRIES.includes(value)) return value;
    return 'india'; // safe default
  }

  // ===== APP STATE =====
  let currentCountry = 'india';
  let currentStep = 0;
  let quizIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;

  // Abort controllers for manageable event cleanup
  let stepDetailAbort = null;
  let quizNextAbort = null;
  let quizRestartAbort = null;

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initNavbar();
    initCountrySelector();
    initScrollAnimations();
    initStatCounters();
    renderAll();
    initQuiz();
  });

  // ===== PARTICLES =====
  function createParticles() {
    const container = document.getElementById('bgParticles');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 6 + 3;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = (Math.random() * 100) + '%';
      p.style.top = (Math.random() * 100) + '%';
      p.style.animationDuration = (15 + Math.random() * 15) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      container.appendChild(p);
    }
  }

  // ===== NAVBAR =====
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (!navbar || !hamburger || !navLinks) return;

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
      updateActiveNav();
    });

    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  function updateActiveNav() {
    const sections = ['hero', 'overview', 'steps', 'flow', 'timeline', 'roles', 'compare', 'quiz'];
    const scrollPos = window.scrollY + 150;
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const link = document.querySelector('.nav-link[data-section="' + id + '"]');
      if (!link) return;
      if (el.offsetTop <= scrollPos && el.offsetTop + el.offsetHeight > scrollPos) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }

  // ===== COUNTRY SELECTOR =====
  function initCountrySelector() {
    const selector = document.getElementById('countrySelector');
    if (!selector) return;
    selector.addEventListener('change', (e) => {
      currentCountry = sanitizeCountry(e.target.value);
      currentStep = 0;
      renderAll();
    });
  }

  // ===== SCROLL ANIMATIONS =====
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.overview-card,.step-card,.role-card,.type-card,.summary-card,.flow-node,.did-you-know').forEach(el => {
      el.classList.add('animate-in');
      observer.observe(el);
    });
  }

  // ===== STAT COUNTERS =====
  function initStatCounters() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.stat-number').forEach(el => {
            const target = parseInt(el.dataset.target, 10);
            if (isNaN(target) || target < 0) return;
            let current = 0;
            const step = Math.ceil(target / 30);
            const timer = setInterval(() => {
              current += step;
              if (current >= target) { current = target; clearInterval(timer); }
              el.textContent = current;
            }, 40);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    const statsEl = document.querySelector('.hero-stats');
    if (statsEl) observer.observe(statsEl);
  }

  // ===== RENDER ALL =====
  function renderAll() {
    const d = DATA[currentCountry];
    if (!d) return;
    renderOverview(d);
    renderSteps(d);
    renderStepDetail(d);
    renderFlowchart(d);
    renderTimeline(d);
    renderRoles(d);
    renderCompare();
    renderTypes();
    // Re-init scroll animations for new elements
    setTimeout(() => initScrollAnimations(), 100);
  }

  // ===== OVERVIEW =====
  function renderOverview(d) {
    if (!d.overview) return;
    d.overview.forEach((text, i) => {
      const el = document.getElementById('overviewText' + (i + 1));
      if (el) el.textContent = text;
    });
    const dykEl = document.getElementById('dykText');
    if (dykEl) dykEl.textContent = d.dyk;
  }

  // ===== STEPS =====
  function renderSteps(d) {
    const nav = document.getElementById('stepNavigator');
    const progSteps = document.getElementById('progressSteps');
    if (!nav || !progSteps) return;
    clearChildren(nav);
    clearChildren(progSteps);

    d.steps.forEach((step, i) => {
      // Step card — built with safe DOM APIs
      const card = createEl('div', { className: 'step-card' + (i === currentStep ? ' active' : '') });

      const iconDiv = createEl('div', { className: 'step-card-icon' }, step.icon);
      const numDiv = createEl('div', { className: 'step-card-num' }, 'Step ' + (i + 1));
      const titleDiv = createEl('div', { className: 'step-card-title' }, step.title);

      card.appendChild(iconDiv);
      card.appendChild(numDiv);
      card.appendChild(titleDiv);

      card.addEventListener('click', () => {
        currentStep = i;
        renderSteps(d);
        renderStepDetail(d);
      });
      nav.appendChild(card);

      // Progress dot
      const dot = createEl('div', {
        className: 'progress-dot' + (i <= currentStep ? ' active' : '') + (i < currentStep ? ' completed' : '')
      });
      dot.addEventListener('click', () => {
        currentStep = i;
        renderSteps(d);
        renderStepDetail(d);
      });
      progSteps.appendChild(dot);
    });

    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      progressFill.style.width = ((currentStep / (d.steps.length - 1)) * 100) + '%';
    }
  }

  function renderStepDetail(d) {
    const step = d.steps[currentStep];
    if (!step) return;

    const iconEl = document.getElementById('stepDetailIcon');
    const titleEl = document.getElementById('stepDetailTitle');
    const badgeEl = document.getElementById('stepDetailBadge');
    const descEl = document.getElementById('stepDetailDesc');
    const pointsEl = document.getElementById('stepDetailPoints');
    const prevBtn = document.getElementById('btnPrevStep');
    const nextBtn = document.getElementById('btnNextStep');

    if (iconEl) iconEl.textContent = step.icon;
    if (titleEl) titleEl.textContent = step.title;
    if (badgeEl) badgeEl.textContent = step.badge;
    if (descEl) descEl.textContent = step.desc;

    if (pointsEl) {
      clearChildren(pointsEl);
      step.points.forEach(p => {
        const pointDiv = createEl('div', { className: 'step-point' }, p);
        pointsEl.appendChild(pointDiv);
      });
    }

    // Cleanup previous event listeners to prevent accumulation
    if (stepDetailAbort) stepDetailAbort.abort();
    stepDetailAbort = new AbortController();

    if (prevBtn) {
      prevBtn.disabled = currentStep === 0;
      prevBtn.addEventListener('click', () => {
        if (currentStep > 0) { currentStep--; renderSteps(d); renderStepDetail(d); }
      }, { signal: stepDetailAbort.signal });
    }
    if (nextBtn) {
      nextBtn.disabled = currentStep === d.steps.length - 1;
      nextBtn.addEventListener('click', () => {
        if (currentStep < d.steps.length - 1) { currentStep++; renderSteps(d); renderStepDetail(d); }
      }, { signal: stepDetailAbort.signal });
    }
  }

  // ===== FLOWCHART =====
  function renderFlowchart(d) {
    const el = document.getElementById('flowchart');
    if (!el) return;
    clearChildren(el);

    d.steps.forEach((step, i) => {
      const node = createEl('div', { className: 'flow-node' });
      const nodeIcon = createEl('div', { className: 'flow-node-icon' }, step.icon);
      const nodeTitle = createEl('div', { className: 'flow-node-title' }, step.title);
      node.appendChild(nodeIcon);
      node.appendChild(nodeTitle);
      el.appendChild(node);

      if (i < d.steps.length - 1) {
        const arrow = createEl('div', { className: 'flow-arrow' }, '\u2192');
        el.appendChild(arrow);
      }
    });
  }

  // ===== TIMELINE =====
  function renderTimeline(d) {
    const slider = document.getElementById('timelineSlider');
    const labels = document.getElementById('timelineLabels');
    if (!slider || !labels) return;

    slider.max = d.timeline.length - 1;
    slider.value = 0;

    clearChildren(labels);
    d.timeline.forEach((t, i) => {
      const labelText = t.title.split(' ').slice(0, 2).join(' ');
      const span = createEl('span', { className: 'timeline-label' + (i === 0 ? ' active' : '') }, labelText);
      labels.appendChild(span);
    });

    updateTimelineCard(d, 0);
    renderTimelineBars(d, 0);

    slider.oninput = () => {
      const val = parseInt(slider.value, 10);
      if (isNaN(val) || val < 0 || val >= d.timeline.length) return;
      updateTimelineCard(d, val);
      renderTimelineBars(d, val);
      labels.querySelectorAll('.timeline-label').forEach((l, i) => l.classList.toggle('active', i === val));
    };
  }

  function updateTimelineCard(d, index) {
    const t = d.timeline[index];
    if (!t) return;
    const card = document.getElementById('timelineCard');
    if (!card) return;
    clearChildren(card);

    const h3 = createEl('h3', {}, t.title);
    const daysDiv = createEl('div', { className: 'tl-days' }, '\uD83D\uDCC5 ' + t.days);
    const p = createEl('p', {}, t.desc);

    card.appendChild(h3);
    card.appendChild(daysDiv);
    card.appendChild(p);
  }

  function renderTimelineBars(d, activeIndex) {
    const el = document.getElementById('timelineVisual');
    if (!el) return;
    clearChildren(el);

    const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#06b6d4', '#22d3ee'];
    const widths = [15, 30, 20, 15, 20];

    d.timeline.forEach((_, i) => {
      const bar = createEl('div', { className: 'tl-bar' });
      bar.style.flex = widths[i];
      bar.style.background = colors[i];
      bar.style.opacity = i === activeIndex ? '1' : '0.35';
      el.appendChild(bar);
    });
  }

  // ===== ROLES =====
  function renderRoles(d) {
    const grid = document.getElementById('rolesGrid');
    if (!grid) return;
    clearChildren(grid);

    d.roles.forEach(r => {
      const card = createEl('div', { className: 'role-card' });
      const icon = createEl('div', { className: 'role-icon' }, r.icon);
      const h3 = createEl('h3', {}, r.title);
      const p = createEl('p', {}, r.desc);
      card.appendChild(icon);
      card.appendChild(h3);
      card.appendChild(p);
      grid.appendChild(card);
    });
  }

  // ===== COMPARE =====
  function renderCompare() {
    const tbody = document.querySelector('#compareTable tbody');
    if (!tbody) return;
    clearChildren(tbody);

    COMPARE_DATA.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach((cell, i) => {
        const td = document.createElement('td');
        td.textContent = cell;
        if (i === 0) {
          td.style.fontWeight = '600';
          td.style.color = 'var(--text-primary)';
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  // ===== TYPES =====
  function renderTypes() {
    const grid = document.getElementById('typesGrid');
    if (!grid) return;
    clearChildren(grid);

    TYPES_DATA.forEach(t => {
      const card = createEl('div', { className: 'type-card' });
      const h3 = createEl('h3', {}, t.icon + ' ' + t.title);
      const p = createEl('p', {}, t.desc);
      card.appendChild(h3);
      card.appendChild(p);
      grid.appendChild(card);
    });
  }

  // ===== QUIZ =====
  function initQuiz() {
    quizIndex = 0;
    quizScore = 0;
    quizAnswered = false;

    const container = document.getElementById('quizContainer');
    const result = document.getElementById('quizResult');
    if (container) container.style.display = '';
    if (result) result.style.display = 'none';

    renderQuizQuestion();

    // Cleanup previous listeners to prevent accumulation on restart
    if (quizNextAbort) quizNextAbort.abort();
    if (quizRestartAbort) quizRestartAbort.abort();
    quizNextAbort = new AbortController();
    quizRestartAbort = new AbortController();

    const nextBtn = document.getElementById('btnQuizNext');
    const restartBtn = document.getElementById('btnRestartQuiz');
    if (nextBtn) nextBtn.addEventListener('click', nextQuizQuestion, { signal: quizNextAbort.signal });
    if (restartBtn) restartBtn.addEventListener('click', initQuiz, { signal: quizRestartAbort.signal });
  }

  function renderQuizQuestion() {
    if (quizIndex < 0 || quizIndex >= QUIZ_DATA.length) return;
    const q = QUIZ_DATA[quizIndex];

    const progressText = document.getElementById('quizProgressText');
    const progressFill = document.getElementById('quizProgressFill');
    const questionEl = document.getElementById('quizQuestion');
    const optsEl = document.getElementById('quizOptions');
    const fb = document.getElementById('quizFeedback');
    const nextBtn = document.getElementById('btnQuizNext');

    if (progressText) progressText.textContent = 'Question ' + (quizIndex + 1) + ' of ' + QUIZ_DATA.length;
    if (progressFill) progressFill.style.width = ((quizIndex / QUIZ_DATA.length) * 100) + '%';
    if (questionEl) questionEl.textContent = q.q;

    if (optsEl) {
      clearChildren(optsEl);
      q.opts.forEach((opt, i) => {
        const btn = createEl('button', { className: 'quiz-option', 'data-index': String(i) }, opt);
        btn.addEventListener('click', () => handleQuizAnswer(i));
        optsEl.appendChild(btn);
      });
    }

    if (fb) {
      fb.className = 'quiz-feedback';
      fb.textContent = '';
    }

    if (nextBtn) nextBtn.disabled = true;
    quizAnswered = false;
  }

  function handleQuizAnswer(selected) {
    if (quizAnswered) return;
    if (selected < 0 || selected >= QUIZ_DATA[quizIndex].opts.length) return;
    quizAnswered = true;
    const q = QUIZ_DATA[quizIndex];
    const correct = selected === q.ans;
    if (correct) quizScore++;

    const btns = document.querySelectorAll('.quiz-option');
    btns.forEach((btn, i) => {
      if (i === q.ans) btn.classList.add('correct');
      if (i === selected && !correct) btn.classList.add('wrong');
      btn.style.pointerEvents = 'none';
    });

    const fb = document.getElementById('quizFeedback');
    if (fb) {
      fb.className = 'quiz-feedback show ' + (correct ? 'correct' : 'wrong');
      fb.textContent = (correct ? '\u2705 Correct! ' : '\u274C Incorrect. ') + q.explain;
    }

    const nextBtn = document.getElementById('btnQuizNext');
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = quizIndex === QUIZ_DATA.length - 1 ? 'See Results \uD83C\uDF89' : 'Next Question \u2192';
    }
  }

  function nextQuizQuestion() {
    quizIndex++;
    if (quizIndex >= QUIZ_DATA.length) {
      showQuizResults();
    } else {
      renderQuizQuestion();
    }
  }

  function showQuizResults() {
    const container = document.getElementById('quizContainer');
    if (container) container.style.display = 'none';
    const resultEl = document.getElementById('quizResult');
    if (resultEl) resultEl.style.display = '';

    const pct = Math.round((quizScore / QUIZ_DATA.length) * 100);
    let icon, title, text;
    if (pct >= 80) {
      icon = '\uD83C\uDFC6'; title = 'Outstanding!';
      text = 'You\'re an election expert! Democracy is safe with you.';
    } else if (pct >= 50) {
      icon = '\uD83D\uDC4F'; title = 'Good Job!';
      text = 'You know your elections well. A little more learning and you\'ll be an expert!';
    } else {
      icon = '\uD83D\uDCDA'; title = 'Keep Learning!';
      text = 'Elections are complex \u2014 review the process above and try again!';
    }

    const iconEl = document.getElementById('resultIcon');
    const titleEl = document.getElementById('resultTitle');
    const textEl = document.getElementById('resultText');
    const scoreEl = document.getElementById('resultScore');

    if (iconEl) iconEl.textContent = icon;
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
    if (scoreEl) scoreEl.textContent = quizScore + ' / ' + QUIZ_DATA.length;
  }
})();
