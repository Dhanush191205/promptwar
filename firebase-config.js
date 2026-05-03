/**
 * @fileoverview Firebase & Google Analytics Configuration
 * @description Initializes Firebase services (Firestore, Analytics) and
 * Google Analytics 4 for the Election Explorer application.
 * @module firebase-config
 * @version 1.0.0
 */

'use strict';

/* global firebase, gtag */

// ──────────────────────────────────────────────────────────────
// Google Analytics 4 — Event Helpers
// ──────────────────────────────────────────────────────────────

/**
 * Safely sends a Google Analytics 4 event.
 * @param {string} eventName - GA4 event name
 * @param {Object} [params={}] - Event parameters
 */
function trackEvent(eventName, params) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params || {});
    }
  } catch (_) { /* Analytics should never break the app */ }
}

// ──────────────────────────────────────────────────────────────
// Firebase Configuration
// ──────────────────────────────────────────────────────────────

/** @type {Object} Firebase project configuration */
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyDemoKeyReplace",
  authDomain: "election-explorer.firebaseapp.com",
  projectId: "election-explorer",
  storageBucket: "election-explorer.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};

/** @type {Object|null} Firestore database reference */
var db = null;

/**
 * Initializes Firebase app and Firestore.
 * Called after Firebase SDK loads.
 */
function initFirebase() {
  try {
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length === 0) {
      firebase.initializeApp(FIREBASE_CONFIG);
      if (firebase.analytics) {
        firebase.analytics();
      }
      if (firebase.firestore) {
        db = firebase.firestore();
      }
      console.info('[Firebase] Initialized successfully');
    }
  } catch (err) {
    console.warn('[Firebase] Init skipped:', err.message);
  }
}

// ──────────────────────────────────────────────────────────────
// Firestore Operations
// ──────────────────────────────────────────────────────────────

/**
 * Saves a quiz result to Firestore.
 * @param {number} score - Number of correct answers
 * @param {number} total - Total number of questions
 * @param {string} country - Country context when quiz was taken
 * @returns {Promise<void>}
 */
function saveQuizResult(score, total, country) {
  if (!db) return Promise.resolve();
  try {
    return db.collection('quiz_results').add({
      score: score,
      total: total,
      percentage: Math.round((score / total) * 100),
      country: country,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: navigator.userAgent.substring(0, 100)
    }).then(function () {
      console.info('[Firestore] Quiz result saved');
    }).catch(function (err) {
      console.warn('[Firestore] Save failed:', err.message);
    });
  } catch (_) {
    return Promise.resolve();
  }
}

/**
 * Fetches the top 10 quiz scores from Firestore.
 * @returns {Promise<Array>} Array of score documents
 */
function getTopScores() {
  if (!db) return Promise.resolve([]);
  try {
    return db.collection('quiz_results')
      .orderBy('percentage', 'desc')
      .limit(10)
      .get()
      .then(function (snapshot) {
        var scores = [];
        snapshot.forEach(function (doc) { scores.push(doc.data()); });
        return scores;
      })
      .catch(function () { return []; });
  } catch (_) {
    return Promise.resolve([]);
  }
}

// ──────────────────────────────────────────────────────────────
// Section View Tracking
// ──────────────────────────────────────────────────────────────

/**
 * Sets up IntersectionObserver to track section views in GA4.
 */
function initSectionTracking() {
  var sections = ['hero', 'overview', 'steps', 'flow', 'timeline', 'roles', 'compare', 'quiz'];
  var tracked = {};

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !tracked[entry.target.id]) {
        tracked[entry.target.id] = true;
        trackEvent('section_view', {
          section_name: entry.target.id,
          event_category: 'engagement'
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// Initialize Firebase when SDK is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    initFirebase();
    initSectionTracking();
  });
} else {
  initFirebase();
  initSectionTracking();
}
