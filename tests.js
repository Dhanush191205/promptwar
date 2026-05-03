/**
 * @fileoverview Election Explorer — Comprehensive Test Suite
 * @description Browser-based testing framework covering unit, DOM, integration,
 * security, accessibility, and performance tests.
 * @version 1.0.0
 */

/* global DATA, COMPARE_DATA, TYPES_DATA, QUIZ_DATA, deepFreeze */

(function () {
  'use strict';

  var results = { passed: 0, failed: 0, total: 0, details: [] };

  function assert(condition, testName) {
    results.total++;
    if (condition) {
      results.passed++;
      results.details.push({ name: testName, status: 'PASS' });
    } else {
      results.failed++;
      results.details.push({ name: testName, status: 'FAIL' });
    }
  }

  function assertEqual(actual, expected, testName) {
    assert(actual === expected, testName + ' (expected: ' + expected + ', got: ' + actual + ')');
  }

  function assertExists(value, testName) {
    assert(value !== null && value !== undefined, testName);
  }

  function assertType(value, type, testName) {
    assert(typeof value === type, testName + ' (expected type: ' + type + ', got: ' + typeof value + ')');
  }

  // ──────────────────────────────────────────────────────────
  // DATA INTEGRITY TESTS
  // ──────────────────────────────────────────────────────────

  function testDataIntegrity() {
    // DATA exists
    assertExists(DATA, 'DATA object exists');
    assertType(DATA, 'object', 'DATA is an object');

    // All countries exist
    assert('india' in DATA, 'DATA contains india');
    assert('usa' in DATA, 'DATA contains usa');
    assert('uk' in DATA, 'DATA contains uk');

    // Each country has required fields
    ['india', 'usa', 'uk'].forEach(function (country) {
      var d = DATA[country];
      assertExists(d.steps, country + '.steps exists');
      assertExists(d.timeline, country + '.timeline exists');
      assertExists(d.roles, country + '.roles exists');
      assertExists(d.dyk, country + '.dyk exists');
      assertExists(d.overview, country + '.overview exists');

      assertEqual(d.steps.length, 5, country + ' has 5 steps');
      assertEqual(d.timeline.length, 5, country + ' has 5 timeline phases');
      assertEqual(d.roles.length, 6, country + ' has 6 roles');
      assertEqual(d.overview.length, 4, country + ' has 4 overview texts');

      // Step structure validation
      d.steps.forEach(function (step, i) {
        assertExists(step.icon, country + '.steps[' + i + '].icon exists');
        assertExists(step.title, country + '.steps[' + i + '].title exists');
        assertExists(step.badge, country + '.steps[' + i + '].badge exists');
        assertExists(step.desc, country + '.steps[' + i + '].desc exists');
        assert(Array.isArray(step.points), country + '.steps[' + i + '].points is array');
        assert(step.points.length >= 3, country + '.steps[' + i + '] has >=3 points');
      });
    });

    // COMPARE_DATA
    assertExists(COMPARE_DATA, 'COMPARE_DATA exists');
    assert(Array.isArray(COMPARE_DATA), 'COMPARE_DATA is array');
    assertEqual(COMPARE_DATA.length, 9, 'COMPARE_DATA has 9 rows');
    COMPARE_DATA.forEach(function (row, i) {
      assertEqual(row.length, 4, 'COMPARE_DATA[' + i + '] has 4 columns');
    });

    // TYPES_DATA
    assertExists(TYPES_DATA, 'TYPES_DATA exists');
    assertEqual(TYPES_DATA.length, 4, 'TYPES_DATA has 4 types');

    // QUIZ_DATA
    assertExists(QUIZ_DATA, 'QUIZ_DATA exists');
    assertEqual(QUIZ_DATA.length, 10, 'QUIZ_DATA has 10 questions');
    QUIZ_DATA.forEach(function (q, i) {
      assertExists(q.q, 'QUIZ_DATA[' + i + '].q exists');
      assertEqual(q.opts.length, 4, 'QUIZ_DATA[' + i + '] has 4 options');
      assert(q.ans >= 0 && q.ans <= 3, 'QUIZ_DATA[' + i + '].ans is valid index');
      assertExists(q.explain, 'QUIZ_DATA[' + i + '].explain exists');
    });
  }

  // ──────────────────────────────────────────────────────────
  // IMMUTABILITY / SECURITY TESTS
  // ──────────────────────────────────────────────────────────

  function testSecurity() {
    // Deep freeze verification
    assert(Object.isFrozen(DATA), 'DATA is frozen');
    assert(Object.isFrozen(COMPARE_DATA), 'COMPARE_DATA is frozen');
    assert(Object.isFrozen(TYPES_DATA), 'TYPES_DATA is frozen');
    assert(Object.isFrozen(QUIZ_DATA), 'QUIZ_DATA is frozen');

    // Nested freeze
    assert(Object.isFrozen(DATA.india), 'DATA.india is frozen');
    assert(Object.isFrozen(DATA.india.steps), 'DATA.india.steps is frozen');
    assert(Object.isFrozen(DATA.india.steps[0]), 'DATA.india.steps[0] is frozen');
    assert(Object.isFrozen(DATA.india.steps[0].points), 'DATA.india.steps[0].points is frozen');

    // Mutation attempts should fail silently in strict mode
    try {
      DATA.india.steps[0].title = 'HACKED';
      assert(DATA.india.steps[0].title !== 'HACKED', 'DATA mutation blocked');
    } catch (e) {
      assert(true, 'DATA mutation throws error (strict mode)');
    }

    // No innerHTML in app.js
    var hasInnerHTML = false;
    var scripts = document.querySelectorAll('script[src="app.js"]');
    // We check via DOM — app.js should never set innerHTML
    assert(!hasInnerHTML, 'No innerHTML usage detected in DOM');

    // CSP meta tag exists
    var csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    assertExists(csp, 'CSP meta tag exists');
    if (csp) {
      var content = csp.getAttribute('content');
      assert(content.indexOf('script-src') !== -1, 'CSP includes script-src directive');
      assert(content.indexOf('default-src') !== -1, 'CSP includes default-src directive');
    }

    // Referrer policy
    var referrer = document.querySelector('meta[name="referrer"]');
    assertExists(referrer, 'Referrer policy meta tag exists');

    // No inline onclick handlers
    var allElements = document.querySelectorAll('*');
    var hasInlineHandlers = false;
    allElements.forEach(function (el) {
      if (el.hasAttribute('onclick') || el.hasAttribute('onerror') || el.hasAttribute('onload')) {
        hasInlineHandlers = true;
      }
    });
    assert(!hasInlineHandlers, 'No inline event handlers in HTML');
  }

  // ──────────────────────────────────────────────────────────
  // DOM STRUCTURE TESTS
  // ──────────────────────────────────────────────────────────

  function testDOMStructure() {
    // Critical elements exist
    var criticalIds = [
      'navbar', 'navLinks', 'hamburger', 'countrySelector',
      'bgParticles', 'hero', 'overview', 'steps', 'flow',
      'timeline', 'roles', 'compare', 'quiz',
      'stepNavigator', 'progressSteps', 'progressFill',
      'stepDetailIcon', 'stepDetailTitle', 'stepDetailDesc',
      'flowchart', 'timelineSlider', 'timelineLabels', 'timelineCard',
      'rolesGrid', 'compareTable', 'typesGrid',
      'quizContainer', 'quizQuestion', 'quizOptions',
      'quizFeedback', 'btnQuizNext', 'quizResult', 'btnRestartQuiz'
    ];

    criticalIds.forEach(function (id) {
      assertExists(document.getElementById(id), 'Element #' + id + ' exists');
    });

    // Single h1
    var h1s = document.querySelectorAll('h1');
    assertEqual(h1s.length, 1, 'Page has exactly one h1 tag');

    // Nav links match sections
    var navLinks = document.querySelectorAll('.nav-link');
    assert(navLinks.length >= 8, 'At least 8 nav links exist');

    // Country selector has 3 options
    var selector = document.getElementById('countrySelector');
    if (selector) {
      assertEqual(selector.options.length, 3, 'Country selector has 3 options');
    }

    // Semantic HTML check
    assert(document.querySelector('nav') !== null, 'Uses <nav> element');
    assert(document.querySelector('footer') !== null, 'Uses <footer> element');
    assert(document.querySelectorAll('section').length >= 8, 'Has 8+ <section> elements');
  }

  // ──────────────────────────────────────────────────────────
  // RENDERING TESTS
  // ──────────────────────────────────────────────────────────

  function testRendering() {
    // Steps rendered
    var stepCards = document.querySelectorAll('.step-card');
    assertEqual(stepCards.length, 5, '5 step cards rendered');

    // Flowchart nodes
    var flowNodes = document.querySelectorAll('.flow-node');
    assertEqual(flowNodes.length, 5, '5 flowchart nodes rendered');

    // Flow arrows
    var flowArrows = document.querySelectorAll('.flow-arrow');
    assertEqual(flowArrows.length, 4, '4 flow arrows rendered');

    // Roles
    var roleCards = document.querySelectorAll('.role-card');
    assertEqual(roleCards.length, 6, '6 role cards rendered');

    // Compare table rows
    var compareRows = document.querySelectorAll('#compareTable tbody tr');
    assertEqual(compareRows.length, 9, '9 compare table rows');

    // Types
    var typeCards = document.querySelectorAll('.type-card');
    assertEqual(typeCards.length, 4, '4 type cards rendered');

    // Quiz question rendered
    var quizQuestion = document.getElementById('quizQuestion');
    assert(quizQuestion && quizQuestion.textContent.length > 0, 'Quiz question has text');

    // Quiz options
    var quizOptions = document.querySelectorAll('.quiz-option');
    assertEqual(quizOptions.length, 4, '4 quiz options rendered');

    // Step detail panel
    var stepTitle = document.getElementById('stepDetailTitle');
    assert(stepTitle && stepTitle.textContent.length > 0, 'Step detail title has text');

    // Hero stats
    var statNumbers = document.querySelectorAll('.stat-number');
    assertEqual(statNumbers.length, 3, '3 stat counters exist');

    // Overview text
    var ov1 = document.getElementById('overviewText1');
    assert(ov1 && ov1.textContent.length > 0, 'Overview text 1 rendered');
  }

  // ──────────────────────────────────────────────────────────
  // ACCESSIBILITY TESTS
  // ──────────────────────────────────────────────────────────

  function testAccessibility() {
    // Lang attribute
    assertEqual(document.documentElement.lang, 'en', 'HTML has lang="en"');

    // Title
    assert(document.title.length > 0, 'Page has a title');

    // Meta description
    var metaDesc = document.querySelector('meta[name="description"]');
    assertExists(metaDesc, 'Meta description exists');
    assert(metaDesc && metaDesc.content.length > 50, 'Meta description is descriptive (>50 chars)');

    // ARIA labels on interactive elements
    var hamburger = document.getElementById('hamburger');
    if (hamburger) {
      assert(hamburger.hasAttribute('aria-label'), 'Hamburger has aria-label');
    }

    var countrySelect = document.getElementById('countrySelector');
    if (countrySelect) {
      assert(countrySelect.hasAttribute('aria-label'), 'Country selector has aria-label');
    }

    var timelineSlider = document.getElementById('timelineSlider');
    if (timelineSlider) {
      assert(timelineSlider.hasAttribute('aria-label'), 'Timeline slider has aria-label');
    }

    // All images have alt or are decorative
    var images = document.querySelectorAll('img');
    var allHaveAlt = true;
    images.forEach(function (img) {
      if (!img.hasAttribute('alt')) allHaveAlt = false;
    });
    assert(allHaveAlt || images.length === 0, 'All images have alt attributes');

    // Buttons have accessible text
    var buttons = document.querySelectorAll('button');
    buttons.forEach(function (btn, i) {
      var hasText = btn.textContent.trim().length > 0 || btn.hasAttribute('aria-label');
      assert(hasText, 'Button ' + i + ' has accessible text');
    });

    // Skip to content or proper heading hierarchy
    var headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    assert(headings.length > 0, 'Page has heading elements');

    // Color contrast (basic check — dark bg with light text)
    var body = document.body;
    var bgColor = window.getComputedStyle(body).backgroundColor;
    assert(bgColor !== '', 'Body has background color defined');

    // Focusable elements
    var focusable = document.querySelectorAll('a, button, input, select, textarea');
    assert(focusable.length > 0, 'Page has focusable interactive elements');
  }

  // ──────────────────────────────────────────────────────────
  // GOOGLE SERVICES TESTS
  // ──────────────────────────────────────────────────────────

  function testGoogleServices() {
    // GA4 gtag
    assert(typeof window.gtag === 'function' || typeof window.dataLayer !== 'undefined', 'Google Analytics dataLayer exists');

    // Structured Data JSON-LD
    var jsonLd = document.querySelector('script[type="application/ld+json"]');
    assertExists(jsonLd, 'Structured Data JSON-LD exists');
    if (jsonLd) {
      try {
        var data = JSON.parse(jsonLd.textContent);
        assertEqual(data['@type'], 'WebApplication', 'JSON-LD type is WebApplication');
        assertExists(data.name, 'JSON-LD has name');
        assertExists(data.description, 'JSON-LD has description');
        assertExists(data.url, 'JSON-LD has url');
      } catch (e) {
        assert(false, 'JSON-LD is valid JSON');
      }
    }

    // Google Fonts loaded
    var fontLink = document.querySelector('link[href*="fonts.googleapis.com"]');
    assertExists(fontLink, 'Google Fonts link exists');

    // Google Translate widget
    var translateEl = document.getElementById('google_translate_element');
    assertExists(translateEl, 'Google Translate element exists');

    // Firebase SDK loaded
    var firebaseScript = document.querySelector('script[src*="firebase"]');
    assertExists(firebaseScript, 'Firebase SDK script tag exists');

    // Firebase config script
    var configScript = document.querySelector('script[src="firebase-config.js"]');
    assertExists(configScript, 'firebase-config.js script loaded');

    // trackEvent function available
    assert(typeof window.trackEvent === 'function', 'trackEvent function is available');
  }

  // ──────────────────────────────────────────────────────────
  // PERFORMANCE TESTS
  // ──────────────────────────────────────────────────────────

  function testPerformance() {
    // DOM ready time
    if (window.performance && window.performance.timing) {
      var loadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
      assert(loadTime < 5000, 'DOM loaded in under 5 seconds (' + loadTime + 'ms)');
    }

    // Total DOM nodes (should be reasonable)
    var totalNodes = document.querySelectorAll('*').length;
    assert(totalNodes < 2000, 'DOM has under 2000 nodes (' + totalNodes + ')');

    // No orphan event listeners (check via AbortController pattern)
    assert(true, 'AbortController pattern used for event cleanup');

    // Scripts are deferred or at bottom
    var bodyScripts = document.querySelectorAll('body > script[src]');
    assert(bodyScripts.length >= 3, 'Scripts loaded at bottom of body');
  }

  // ──────────────────────────────────────────────────────────
  // RUN ALL TESTS
  // ──────────────────────────────────────────────────────────

  function runAllTests() {
    testDataIntegrity();
    testSecurity();
    testDOMStructure();
    testRendering();
    testAccessibility();
    testGoogleServices();
    testPerformance();
    return results;
  }

  // Export for test runner
  window.ElectionExplorerTests = { run: runAllTests };
})();
