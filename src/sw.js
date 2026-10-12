const CACHE_PREFIX = 'dong-studio'
const PRECACHE = `${CACHE_PREFIX}-precache-v1`
const RUNTIME = `${CACHE_PREFIX}-runtime-v1`
const assets = self.__WB_MANIFEST.map((entry) => typeof entry === 'string' ? entry : entry.url)

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PRECACHE).then((cache) => cache.addAll(assets)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && ![PRECACHE, RUNTIME].includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone()
          caches.open(RUNTIME).then((cache) => cache.put(event.request, copy))
          return response
        })
        .catch(async () => (await caches.match(event.request)) || (await caches.match('./index.html')) || Response.error()),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone()
        caches.open(RUNTIME).then((cache) => cache.put(event.request, copy))
      }
      return response
    })),
  )
})
