/* mmBoard — 브라우저가 /sw.js 를 요청할 때 500 나지 않도록 최소 SW */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
