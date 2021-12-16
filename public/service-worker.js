/* eslint-disable no-undef,no-restricted-globals */
self.addEventListener('error', (e) => {
  self.clients.matchAll()
    .then((clients) => {
      if (clients && clients.length) {
        clients[0].postMessage({
          type: 'ERROR',
          msg: e.message || null,
          stack: e.error ? e.error.stack : null,
        });
      }
    });
});

self.addEventListener('unhandledrejection', (e) => {
  self.clients.matchAll()
    .then((clients) => {
      if (clients && clients.length) {
        clients[0].postMessage({
          type: 'REJECTION',
          msg: e.reason ? e.reason.message : null,
          stack: e.reason ? e.reason.stack : null,
        });
      }
    });
});

importScripts('https://g.alicdn.com/kg/workbox/3.3.0/workbox-sw.js');
workbox.setConfig({
  debug: false,
  modulePathPrefix: 'https://g.alicdn.com/kg/workbox/3.3.0/',
});
workbox.core.setCacheNameDetails({
  prefix: 'wm',
  runtime: 'runtime',
  suffix: 'v2',
  precache: 'precache',
});
workbox.skipWaiting();
workbox.clientsClaim();

const staleWhileRevalidateRegList = [
  /wealth/,
  /wealthCategory/,
  /wealthHistory/,
  /fund/,
  /insurance/,
];

workbox.routing.registerRoute(
  ({ url }) => staleWhileRevalidateRegList.filter(reg => reg.test(url) === true).length > 0,
  workbox.strategies.staleWhileRevalidate(),
);
workbox.routing.registerRoute(
  '/',
  workbox.strategies.staleWhileRevalidate(),
);
