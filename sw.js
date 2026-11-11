// Pergaminho — service worker v1.0.1
// Arquivos do app: rede primeiro (as atualizações do GitHub aparecem logo); sem internet, usa o que está guardado.
// Fontes do Google: guardadas na primeira vez.
const CACHE = 'pergaminho-1.0.1';
const BASICOS = ['./', 'index.html', 'supabase.min.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICOS)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.hostname.endsWith('supabase.co')) return;
  if (/fonts\.(googleapis|gstatic)\.com/.test(u.hostname)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return res; })));
  } else if (u.origin === location.origin) {
    if (u.search.includes('nc=')) return;   // verificação de versão: sempre da rede
    e.respondWith(fetch(e.request).then(res => {
      if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
  }
});
