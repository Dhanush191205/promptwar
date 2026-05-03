/**
 * @fileoverview Service Worker for Election Explorer
 * @description Provides offline caching via Google Workbox patterns,
 * enabling Progressive Web App (PWA) functionality with
 * Cache-First strategy for static assets and Network-First for API calls.
 * @version 1.0.0
 */

'use strict';

/** @const {string} CACHE_NAME - Versioned cache identifier */
var CACHE_NAME = 'election-explorer-v2';

/** @const {string[]} PRECACHE_URLS - Core assets to cache on install */
var PRECACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/data.js',
  '/firebase-config.js'
];

/**
 * Install event — precaches core static assets.
 * Uses waitUntil to ensure all assets are cached before activation.
 */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.info('[SW] Precaching core assets');
      return cache.addAll(PRECACHE_URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

/**
 * Activate event — cleans up old caches when a new SW version activates.
 */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) {
            console.info('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/**
 * Fetch event — implements a stale-while-revalidate strategy.
 * Serves from cache immediately, then updates cache from network.
 * Google Analytics and Firebase requests always go to network.
 */
self.addEventListener('fetch', function (event) {
  var url = event.request.url;

  // Skip caching for analytics, Firebase, and external API calls
  if (url.indexOf('google-analytics') !== -1 ||
      url.indexOf('googletagmanager') !== -1 ||
      url.indexOf('firestore.googleapis') !== -1 ||
      url.indexOf('translate.google') !== -1 ||
      url.indexOf('firebase') !== -1) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request).then(function (cachedResponse) {
        var networkFetch = fetch(event.request).then(function (networkResponse) {
          // Only cache successful same-origin responses
          if (networkResponse && networkResponse.status === 200 &&
              networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(function () {
          // Network failed — return cached or offline fallback
          return cachedResponse;
        });

        // Return cached version immediately, update in background
        return cachedResponse || networkFetch;
      });
    })
  );
});
