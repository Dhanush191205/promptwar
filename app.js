/**
 * @fileoverview Election Explorer — Application Logic
 * @description Core application module handling UI rendering, user interactions,
 * quiz mechanics, and analytics integration. Uses safe DOM APIs exclusively
 * (no innerHTML) to prevent XSS. Wrapped in an IIFE for scope isolation.
 * @module app
 * @version 2.0.0
 * @license MIT
 * @author Dhanush191205
 */

'use strict';

/* global DATA, COMPARE_DATA, TYPES_DATA, QUIZ_DATA, trackEvent, saveQuizResult */

(function () {
  // ──────────────────────────────────────────────────────────
  // Constants
  // ──────────────────────────────────────────────────────────

  /** @const {number} PARTICLE_COUNT - Number of background particles */
  var PARTICLE_COUNT = 20;

  /** @const {number} SCROLL_THRESHOLD - Pixels before navbar style changes */
  var SCROLL_THRESHOLD = 50;

  /** @const {number} NAV_OFFSET - Pixel offset for active nav calculation */
  var NAV_OFFSET = 150;

  /** @const {number} COUNTER_SPEED - Milliseconds between counter increments */
  var COUNTER_SPEED = 40;

  /** @const {number} COUNTER_STEPS - Number of increments for stat counters */
  var COUNTER_STEPS = 30;

  /** @const {number} SCROLL_ANIM_THRESHOLD - IntersectionObserver threshold */
  var SCROLL_ANIM_THRESHOLD = 0.1;

  /** @const {string[]} ALLOWED_COUNTRIES - Whitelisted country keys */
  var ALLOWED_COUNTRIES = ['india', 'usa', 'uk'];

  /** @const {string[]} SECTION_IDS - All navigable section identifiers */
  var SECTION_IDS = ['hero', 'overview', 'steps', 'flow', 'timeline', 'roles', 'compare', 'quiz'];

  /** @const {string[]} TIMELINE_COLORS - Color palette for timeline bars */
  var TIMELINE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#06b6d4', '#22d3ee'];

  /** @const {number[]} TIMELINE_WIDTHS - Flex widths for timeline bars */
  var TIMELINE_WIDTHS = [15, 30, 20, 15, 20];

  /** @const {string} ANIMATABLE_SELECTOR - CSS selector for scroll-animated elements */
  var ANIMATABLE_SELECTOR = '.overview-card,.step-card,.role-card,.type-card,.summary-card,.flow-node,.did-you-know';

  // ──────────────────────────────────────────────────────────
  // DOM Utilities
  // ──────────────────────────────────────────────────────────

  /**
   * Creates a DOM element with attributes and optional text content.
   * Uses safe APIs only — never sets innerHTML.
   * @param {string} tag - HTML tag name
   * @param {Object} [attrs] - Attribute key-value pairs
   * @param {string} [textContent] - Text content for the element
   * @returns {HTMLElement} The created element
   */
  function createEl(tag, attrs, textContent) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var key in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue;
        var value = attrs[key];
        if (key === 'className') el.className = value;
        else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
        else if (key.startsWith('data-')) el.setAttribute(key, value);
        else el[key] = value;
      }
    }
    if (textContent !== undefined) el.textContent = textContent;
    return el;
  }

  /**
   * Removes all child nodes from an element safely.
   * @param {HTMLElement} el - Parent element to clear
   */
  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  /**
   * Safely retrieves a DOM element by ID with null check.
   * @param {string} id - Element ID
   * @returns {HTMLElement|null}
   */
  function getEl(id) {
    return document.getElementById(id);
  }

  // ──────────────────────────────────────────────────────────
  // Input Validation
  // ──────────────────────────────────────────────────────────

  /**
   * Validates and sanitizes a country key against the whitelist.
   * @param {string} value - Country key to validate
   * @returns {string} Validated country key or 'india' as safe default
   */
  function sanitizeCountry(value) {
    return ALLOWED_COUNTRIES.indexOf(value) !== -1 ? value : 'india';
  }

  // ──────────────────────────────────────────────────────────
  // Application State
  // ──────────────────────────────────────────────────────────

  /** @type {string} Currently selected country */
  var currentCountry = 'india';
  /** @type {number} Currently selected step index */
  var currentStep = 0;
  /** @type {number} Current quiz question index */
  var quizIndex = 0;
  /** @type {number} Quiz correct answers count */
  var quizScore = 0;
  /** @type {boolean} Whether current quiz question has been answered */
  var quizAnswered = false;

  /** @type {AbortController|null} Controller for step detail button listeners */
  var stepDetailAbort = null;
  /** @type {AbortController|null} Controller for quiz next button listener */
  var quizNextAbort = null;
  /** @type {AbortController|null} Controller for quiz restart button listener */
  var quizRestartAbort = null;

  // ──────────────────────────────────────────────────────────
  // Initialization
  // ──────────────────────────────────────────────────────────

  /**
   * Main entry point. Initializes all modules on DOM ready.
   */
  document.addEventListener('DOMContentLoaded', function () {
    try {
      createParticles();
      initNavbar();
      initCountrySelector();
      initScrollAnimations();
      initStatCounters();
      renderAll();
      initQuiz();
      trackEvent('app_loaded', { version: '2.0.0' });
    } catch (err) {
      console.error('[App] Initialization error:', err);
    }
  });

  // ──────────────────────────────────────────────────────────
  // Background Particles
  // ──────────────────────────────────────────────────────────

  /**
   * Creates floating particle elements for the background animation.
   * Particles have randomized size, position, and animation timing.
   */
  function createParticles() {
    var container = getEl('bgParticles');
    if (!container) return;
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var p = document.createElement('div');
      p.className = 'particle';
      var size = Math.random() * 6 + 3;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = (Math.random() * 100) + '%';
      p.style.top = (Math.random() * 100) + '%';
      p.style.animationDuration = (15 + Math.random() * 15) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      container.appendChild(p);
    }
  }

  // ──────────────────────────────────────────────────────────
  // Navigation
  // ──────────────────────────────────────────────────────────

  /**
   * Initializes navbar scroll behavior, hamburger menu toggle,
   * and nav link click handlers.
   */
  function initNavbar() {
    var navbar = getEl('navbar');
    var hamburger = getEl('hamburger');
    var navLinks = getEl('navLinks');
    if (!navbar || !hamburger || !navLinks) return;

    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
      updateActiveNav();
    });

    hamburger.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });
  }

  /**
   * Updates the active navigation link based on scroll position.
   * Highlights the nav link corresponding to the visible section.
   */
  function updateActiveNav() {
    var scrollPos = window.scrollY + NAV_OFFSET;
    SECTION_IDS.forEach(function (id) {
      var el = getEl(id);
      if (!el) return;
      var link = document.querySelector('.nav-link[data-section="' + id + '"]');
      if (!link) return;
      if (el.offsetTop <= scrollPos && el.offsetTop + el.offsetHeight > scrollPos) {
        document.querySelectorAll('.nav-link').forEach(function (l) {
          l.classList.remove('active');
        });
        link.classList.add('active');
      }
    });
  }

  // ──────────────────────────────────────────────────────────
  // Country Selector
  // ──────────────────────────────────────────────────────────

  /**
   * Initializes the country selector dropdown with change tracking.
   * Validates input against whitelist before updating state.
   */
  function initCountrySelector() {
    var selector = getEl('countrySelector');
    if (!selector) return;
    selector.addEventListener('change', function (e) {
      var newCountry = sanitizeCountry(e.target.value);
      currentCountry = newCountry;
      currentStep = 0;
      renderAll();
      trackEvent('country_changed', { country: newCountry });
    });
  }

  // ──────────────────────────────────────────────────────────
  // Scroll Animations
  // ──────────────────────────────────────────────────────────

  /**
   * Sets up IntersectionObserver for scroll-triggered animations.
   * Elements matching ANIMATABLE_SELECTOR get a fade-in effect.
   */
  function initScrollAnimations() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: SCROLL_ANIM_THRESHOLD });

    document.querySelectorAll(ANIMATABLE_SELECTOR).forEach(function (el) {
      el.classList.add('animate-in');
      observer.observe(el);
    });
  }

  // ──────────────────────────────────────────────────────────
  // Stat Counters
  // ──────────────────────────────────────────────────────────

  /**
   * Initializes animated number counters in the hero section.
   * Counts up from 0 to the data-target value when visible.
   */
  function initStatCounters() {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          document.querySelectorAll('.stat-number').forEach(function (el) {
            var target = parseInt(el.dataset.target, 10);
            if (isNaN(target) || target < 0) return;
            var current = 0;
            var step = Math.ceil(target / COUNTER_STEPS);
            var timer = setInterval(function () {
              current += step;
              if (current >= target) { current = target; clearInterval(timer); }
              el.textContent = current;
            }, COUNTER_SPEED);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    var statsEl = document.querySelector('.hero-stats');
    if (statsEl) observer.observe(statsEl);
  }

  // ──────────────────────────────────────────────────────────
  // Master Render
  // ──────────────────────────────────────────────────────────

  /**
   * Re-renders all dynamic sections based on current country.
   * Called on init and whenever the country selector changes.
   */
  function renderAll() {
    var d = DATA[currentCountry];
    if (!d) return;

    try {
      renderOverview(d);
      renderSteps(d);
      renderStepDetail(d);
      renderFlowchart(d);
      renderTimeline(d);
      renderRoles(d);
      renderCompare();
      renderTypes();
      setTimeout(function () { initScrollAnimations(); }, 100);
    } catch (err) {
      console.error('[App] Render error:', err);
    }
  }

  // ──────────────────────────────────────────────────────────
  // Overview Section
  // ──────────────────────────────────────────────────────────

  /**
   * Renders overview card text and "Did You Know" fact.
   * @param {Object} d - Country data object
   */
  function renderOverview(d) {
    if (!d.overview) return;
    d.overview.forEach(function (text, i) {
      var el = getEl('overviewText' + (i + 1));
      if (el) el.textContent = text;
    });
    var dykEl = getEl('dykText');
    if (dykEl) dykEl.textContent = d.dyk;
  }

  // ──────────────────────────────────────────────────────────
  // Steps Section
  // ──────────────────────────────────────────────────────────

  /**
   * Renders the step navigator cards and progress track.
   * @param {Object} d - Country data object
   */
  function renderSteps(d) {
    var nav = getEl('stepNavigator');
    var progSteps = getEl('progressSteps');
    if (!nav || !progSteps) return;
    clearChildren(nav);
    clearChildren(progSteps);

    d.steps.forEach(function (step, i) {
      var card = createEl('div', { className: 'step-card' + (i === currentStep ? ' active' : '') });
      card.appendChild(createEl('div', { className: 'step-card-icon' }, step.icon));
      card.appendChild(createEl('div', { className: 'step-card-num' }, 'Step ' + (i + 1)));
      card.appendChild(createEl('div', { className: 'step-card-title' }, step.title));
      card.addEventListener('click', function () {
        currentStep = i;
        renderSteps(d);
        renderStepDetail(d);
        trackEvent('step_clicked', { step_name: step.title, step_index: i });
      });
      nav.appendChild(card);

      var dot = createEl('div', {
        className: 'progress-dot' + (i <= currentStep ? ' active' : '') + (i < currentStep ? ' completed' : '')
      });
      dot.addEventListener('click', function () {
        currentStep = i;
        renderSteps(d);
        renderStepDetail(d);
      });
      progSteps.appendChild(dot);
    });

    var progressFill = getEl('progressFill');
    if (progressFill) {
      progressFill.style.width = ((currentStep / (d.steps.length - 1)) * 100) + '%';
    }
  }

  /**
   * Renders the detail panel for the currently selected step.
   * Uses AbortController to prevent event listener accumulation.
   * @param {Object} d - Country data object
   */
  function renderStepDetail(d) {
    var step = d.steps[currentStep];
    if (!step) return;

    var iconEl = getEl('stepDetailIcon');
    var titleEl = getEl('stepDetailTitle');
    var badgeEl = getEl('stepDetailBadge');
    var descEl = getEl('stepDetailDesc');
    var pointsEl = getEl('stepDetailPoints');
    var prevBtn = getEl('btnPrevStep');
    var nextBtn = getEl('btnNextStep');

    if (iconEl) iconEl.textContent = step.icon;
    if (titleEl) titleEl.textContent = step.title;
    if (badgeEl) badgeEl.textContent = step.badge;
    if (descEl) descEl.textContent = step.desc;

    if (pointsEl) {
      clearChildren(pointsEl);
      step.points.forEach(function (p) {
        pointsEl.appendChild(createEl('div', { className: 'step-point' }, p));
      });
    }

    if (stepDetailAbort) stepDetailAbort.abort();
    stepDetailAbort = new AbortController();

    if (prevBtn) {
      prevBtn.disabled = currentStep === 0;
      prevBtn.addEventListener('click', function () {
        if (currentStep > 0) { currentStep--; renderSteps(d); renderStepDetail(d); }
      }, { signal: stepDetailAbort.signal });
    }
    if (nextBtn) {
      nextBtn.disabled = currentStep === d.steps.length - 1;
      nextBtn.addEventListener('click', function () {
        if (currentStep < d.steps.length - 1) { currentStep++; renderSteps(d); renderStepDetail(d); }
      }, { signal: stepDetailAbort.signal });
    }
  }

  // ──────────────────────────────────────────────────────────
  // Flowchart
  // ──────────────────────────────────────────────────────────

  /**
   * Renders the visual flowchart showing step connections.
   * @param {Object} d - Country data object
   */
  function renderFlowchart(d) {
    var el = getEl('flowchart');
    if (!el) return;
    clearChildren(el);

    d.steps.forEach(function (step, i) {
      var node = createEl('div', { className: 'flow-node' });
      node.appendChild(createEl('div', { className: 'flow-node-icon' }, step.icon));
      node.appendChild(createEl('div', { className: 'flow-node-title' }, step.title));
      el.appendChild(node);
      if (i < d.steps.length - 1) {
        el.appendChild(createEl('div', { className: 'flow-arrow' }, '\u2192'));
      }
    });
  }

  // ──────────────────────────────────────────────────────────
  // Timeline
  // ──────────────────────────────────────────────────────────

  /**
   * Renders the interactive timeline with slider control.
   * @param {Object} d - Country data object
   */
  function renderTimeline(d) {
    var slider = getEl('timelineSlider');
    var labels = getEl('timelineLabels');
    if (!slider || !labels) return;

    slider.max = d.timeline.length - 1;
    slider.value = 0;
    clearChildren(labels);

    d.timeline.forEach(function (t, i) {
      var labelText = t.title.split(' ').slice(0, 2).join(' ');
      labels.appendChild(createEl('span', { className: 'timeline-label' + (i === 0 ? ' active' : '') }, labelText));
    });

    updateTimelineCard(d, 0);
    renderTimelineBars(d, 0);

    slider.oninput = function () {
      var val = parseInt(slider.value, 10);
      if (isNaN(val) || val < 0 || val >= d.timeline.length) return;
      updateTimelineCard(d, val);
      renderTimelineBars(d, val);
      labels.querySelectorAll('.timeline-label').forEach(function (l, i) {
        l.classList.toggle('active', i === val);
      });
    };
  }

  /**
   * Updates the timeline detail card for a given phase index.
   * @param {Object} d - Country data object
   * @param {number} index - Timeline phase index
   */
  function updateTimelineCard(d, index) {
    var t = d.timeline[index];
    if (!t) return;
    var card = getEl('timelineCard');
    if (!card) return;
    clearChildren(card);
    card.appendChild(createEl('h3', {}, t.title));
    card.appendChild(createEl('div', { className: 'tl-days' }, '\uD83D\uDCC5 ' + t.days));
    card.appendChild(createEl('p', {}, t.desc));
  }

  /**
   * Renders the colored timeline progress bars.
   * @param {Object} d - Country data object
   * @param {number} activeIndex - Currently active phase index
   */
  function renderTimelineBars(d, activeIndex) {
    var el = getEl('timelineVisual');
    if (!el) return;
    clearChildren(el);

    d.timeline.forEach(function (_, i) {
      var bar = createEl('div', { className: 'tl-bar' });
      bar.style.flex = TIMELINE_WIDTHS[i];
      bar.style.background = TIMELINE_COLORS[i];
      bar.style.opacity = i === activeIndex ? '1' : '0.35';
      el.appendChild(bar);
    });
  }

  // ──────────────────────────────────────────────────────────
  // Roles
  // ──────────────────────────────────────────────────────────

  /**
   * Renders the key roles grid cards.
   * @param {Object} d - Country data object
   */
  function renderRoles(d) {
    var grid = getEl('rolesGrid');
    if (!grid) return;
    clearChildren(grid);

    d.roles.forEach(function (r) {
      var card = createEl('div', { className: 'role-card' });
      card.appendChild(createEl('div', { className: 'role-icon' }, r.icon));
      card.appendChild(createEl('h3', {}, r.title));
      card.appendChild(createEl('p', {}, r.desc));
      grid.appendChild(card);
    });
  }

  // ──────────────────────────────────────────────────────────
  // Compare Table
  // ──────────────────────────────────────────────────────────

  /**
   * Renders the comparison table body from COMPARE_DATA.
   */
  function renderCompare() {
    var tbody = document.querySelector('#compareTable tbody');
    if (!tbody) return;
    clearChildren(tbody);

    COMPARE_DATA.forEach(function (row) {
      var tr = document.createElement('tr');
      row.forEach(function (cell, i) {
        var td = document.createElement('td');
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

  // ──────────────────────────────────────────────────────────
  // Election Types
  // ──────────────────────────────────────────────────────────

  /**
   * Renders the election types grid cards from TYPES_DATA.
   */
  function renderTypes() {
    var grid = getEl('typesGrid');
    if (!grid) return;
    clearChildren(grid);

    TYPES_DATA.forEach(function (t) {
      var card = createEl('div', { className: 'type-card' });
      card.appendChild(createEl('h3', {}, t.icon + ' ' + t.title));
      card.appendChild(createEl('p', {}, t.desc));
      grid.appendChild(card);
    });
  }

  // ──────────────────────────────────────────────────────────
  // Quiz Engine
  // ──────────────────────────────────────────────────────────

  /**
   * Initializes or resets the quiz to question 1.
   * Cleans up previous event listeners via AbortController.
   */
  function initQuiz() {
    quizIndex = 0;
    quizScore = 0;
    quizAnswered = false;

    var container = getEl('quizContainer');
    var result = getEl('quizResult');
    if (container) container.style.display = '';
    if (result) result.style.display = 'none';

    renderQuizQuestion();

    if (quizNextAbort) quizNextAbort.abort();
    if (quizRestartAbort) quizRestartAbort.abort();
    quizNextAbort = new AbortController();
    quizRestartAbort = new AbortController();

    var nextBtn = getEl('btnQuizNext');
    var restartBtn = getEl('btnRestartQuiz');
    if (nextBtn) nextBtn.addEventListener('click', nextQuizQuestion, { signal: quizNextAbort.signal });
    if (restartBtn) restartBtn.addEventListener('click', initQuiz, { signal: quizRestartAbort.signal });
  }

  /**
   * Renders the current quiz question and its answer options.
   * Resets feedback and disables the Next button until answered.
   */
  function renderQuizQuestion() {
    if (quizIndex < 0 || quizIndex >= QUIZ_DATA.length) return;
    var q = QUIZ_DATA[quizIndex];

    var progressText = getEl('quizProgressText');
    var progressFill = getEl('quizProgressFill');
    var questionEl = getEl('quizQuestion');
    var optsEl = getEl('quizOptions');
    var fb = getEl('quizFeedback');
    var nextBtn = getEl('btnQuizNext');

    if (progressText) progressText.textContent = 'Question ' + (quizIndex + 1) + ' of ' + QUIZ_DATA.length;
    if (progressFill) progressFill.style.width = ((quizIndex / QUIZ_DATA.length) * 100) + '%';
    if (questionEl) questionEl.textContent = q.q;

    if (optsEl) {
      clearChildren(optsEl);
      q.opts.forEach(function (opt, i) {
        var btn = createEl('button', { className: 'quiz-option', 'data-index': String(i) }, opt);
        btn.addEventListener('click', function () { handleQuizAnswer(i); });
        optsEl.appendChild(btn);
      });
    }

    if (fb) { fb.className = 'quiz-feedback'; fb.textContent = ''; }
    if (nextBtn) nextBtn.disabled = true;
    quizAnswered = false;
  }

  /**
   * Handles a quiz answer selection. Validates input, updates UI,
   * and tracks the event in Google Analytics.
   * @param {number} selected - Index of the selected answer (0-3)
   */
  function handleQuizAnswer(selected) {
    if (quizAnswered) return;
    if (selected < 0 || selected >= QUIZ_DATA[quizIndex].opts.length) return;
    quizAnswered = true;

    var q = QUIZ_DATA[quizIndex];
    var correct = selected === q.ans;
    if (correct) quizScore++;

    var btns = document.querySelectorAll('.quiz-option');
    btns.forEach(function (btn, i) {
      if (i === q.ans) btn.classList.add('correct');
      if (i === selected && !correct) btn.classList.add('wrong');
      btn.style.pointerEvents = 'none';
    });

    var fb = getEl('quizFeedback');
    if (fb) {
      fb.className = 'quiz-feedback show ' + (correct ? 'correct' : 'wrong');
      fb.textContent = (correct ? '\u2705 Correct! ' : '\u274C Incorrect. ') + q.explain;
    }

    var nextBtn = getEl('btnQuizNext');
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = quizIndex === QUIZ_DATA.length - 1 ? 'See Results \uD83C\uDF89' : 'Next Question \u2192';
    }

    trackEvent('quiz_answer', {
      question_index: quizIndex,
      is_correct: correct,
      selected_option: selected
    });
  }

  /**
   * Advances to the next quiz question or shows results.
   */
  function nextQuizQuestion() {
    quizIndex++;
    if (quizIndex >= QUIZ_DATA.length) {
      showQuizResults();
    } else {
      renderQuizQuestion();
    }
  }

  /**
   * Displays quiz results with score, feedback message, and saves
   * the result to Firebase Firestore for the leaderboard.
   */
  function showQuizResults() {
    var container = getEl('quizContainer');
    if (container) container.style.display = 'none';
    var resultEl = getEl('quizResult');
    if (resultEl) resultEl.style.display = '';

    var pct = Math.round((quizScore / QUIZ_DATA.length) * 100);
    var icon, title, text;

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

    var iconEl = getEl('resultIcon');
    var titleEl = getEl('resultTitle');
    var textEl = getEl('resultText');
    var scoreEl = getEl('resultScore');

    if (iconEl) iconEl.textContent = icon;
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
    if (scoreEl) scoreEl.textContent = quizScore + ' / ' + QUIZ_DATA.length;

    trackEvent('quiz_completed', { score: quizScore, total: QUIZ_DATA.length, percentage: pct });
    saveQuizResult(quizScore, QUIZ_DATA.length, currentCountry);
  }

})();
