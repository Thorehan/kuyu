// Servis çalışanı: Kuyu'yu telefona kurulabilir ve internetsiz açılabilir yapar (Pofi'deki yapının sade hâli).
// Kod (html, js, css, manifest) her zaman önce ağdan, tarayıcı önbelleğini atlayarak alınır; böylece güncellemeden
// sonra eski ve yeni dosyalar karışmaz. Ağ yoksa son kaydedilen sürüm açılır.
// Görseller önbellekten gelir (değişmezler; değişirse adları değişir).
// Liste elle tutulur; tools/kontrol.js index.html'in yüklediği her dosyanın burada ve diskte olduğunu denetler.
// Her kod dosyası önbellekte TEK kayıt tutar (?v= etiketi atılır, hep en son alınan sürüm). Sayfa açılışları
// index.html kaydına yazılır. Böylece internetsiz açılış en son sürümü açar ve önbellek her sürümde şişmez.
// v1'de her ?v= ayrı kaydediliyordu ve internetsizken en ESKİ kayıt açılıyordu; v2 eskisini silerek başlar.
const CODE = 'kuyu-code-v2';
const MEDIA = 'kuyu-media-v1';

const CORE = [
  './', 'index.html', 'manifest.webmanifest',
  'css/kuyu.css', 'css/ekranlar.css',
  'js/engine.js', 'js/levels.js', 'js/gen.js', 'js/gorevler.js', 'js/ekonomi.js', 'js/istatistik.js', 'js/game.js', 'js/screens.js',
];
const CORE_MEDIA = [
  'assets/funday-morning-logo.webp',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/maskable-512.png', 'assets/icons/apple-180.png',
];

// Bir dosya alınamazsa kurulum durmaz (o dosya ilk kullanıldığında yine önbelleğe girer).
async function precache() {
  const base = new URL('./', location.href);
  const code = await caches.open(CODE), media = await caches.open(MEDIA);
  await Promise.all([
    ...CORE.map(async p => {
      const url = new URL(p, base).href;
      try { const r = await fetch(url, { cache: 'no-cache' }); if (r.ok && r.status === 200) await code.put(url, r); } catch (e) { /* ağ yok */ }
    }),
    ...CORE_MEDIA.map(async p => {
      const url = new URL(p, base).href;
      try { if (await media.match(url)) return; const r = await fetch(url); if (r.ok && r.status === 200) await media.put(url, r); } catch (e) { /* ağ yok */ }
    }),
  ]);
}

self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(precache()); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (![CODE, MEDIA].includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

const isMedia = url => /\/assets\/.*\.(webp|png|jpg|svg)$/.test(url.pathname);

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // yazı tipleri tarayıcıya kalsın
  if (isMedia(url)) {
    e.respondWith((async () => {
      const cache = await caches.open(MEDIA);
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok && res.status === 200) cache.put(req, res.clone()).catch(() => {});
      return res;
    })());
    return;
  }
  // Önbellek anahtarı: sorgu (?v=, ?bolum=, ?mod=) atılmış adres; sayfa açılışları index.html.
  const key = req.mode === 'navigate' ? new URL('index.html', location.href).href : url.origin + url.pathname;
  e.respondWith((async () => {
    const cache = await caches.open(CODE);
    try {
      const res = await fetch(req, { cache: 'no-cache' });
      if (res.ok && res.status === 200) cache.put(key, res.clone()).catch(() => {});
      return res;
    } catch (err) {
      // ağ yok: son kaydedilen (en yeni) dosya açılır
      const hit = await cache.match(key);
      if (hit) return hit;
      throw err;
    }
  })());
});
