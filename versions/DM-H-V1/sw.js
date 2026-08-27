/* offline cache for the encrypted page — build fOpNz2Sm */
const CACHE = 'cardsort-review-fOpNz2Sm';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];
const clean = async res => { const h = new Headers(res.headers); h.delete('Vary'); return new Response(await res.blob(), { status: res.status, headers: h }); };
self.addEventListener('install', e => e.waitUntil((async () => {
  const c = await caches.open(CACHE);
  await Promise.all(FILES.map(async f => { try { const r = await fetch(f, { cache: 'reload' }); if (r.ok) await c.put(f.endsWith('/') || f.endsWith('index.html') ? f : new URL(f, self.location.href).href, await clean(r)); } catch {} }));
  await self.skipWaiting();
})()));
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith('cardsort-review-') && k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const key = req.mode === 'navigate' ? './index.html' : url.origin + url.pathname;
    try {
      // Always revalidate with the server so a new publish shows up on the next launch
      // (GitHub Pages sends max-age=600, which would otherwise serve a stale copy).
      const res = await fetch(req.mode === 'navigate' ? new Request(req, { cache: 'no-cache' }) : req, req.mode === 'navigate' ? undefined : { cache: 'no-cache' });
      if (res.ok) { const c = await caches.open(CACHE); c.put(key, await clean(res.clone())); }
      return res;
    } catch {
      const cached = await caches.match(key, { ignoreVary: true }) || (req.mode === 'navigate' && await caches.match('./index.html', { ignoreVary: true }));
      return cached || new Response('', { status: 503, statusText: 'Offline' });
    }
  })());
});
