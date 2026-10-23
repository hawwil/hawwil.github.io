// حوّل - تشغيل بدون إنترنت. غيّر رقم النسخة بالسطر الجاي عند كل تحديث (1.2 ثم 1.3 ...).
var V = 'hawwil-1.22';
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-v3-192.png', 'icon-v3-512.png', 'apple-touch-icon-v3.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) {
    return Promise.all(FILES.map(function (f) { return c.add(new Request(f, { cache: 'reload' })).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    var old = ks.filter(function (k) { return k !== V && k.indexOf('hawwil-') === 0; });
    return Promise.all(old.map(function (k) { return caches.delete(k); })).then(function () {
      return self.clients.claim();
    }).then(function () {
      if (!old.length) return;
      return self.clients.matchAll().then(function (cs) { cs.forEach(function (c) { c.postMessage({ type: 'updated' }); }); });
    });
  }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(r).then(function (res) {
      if (res && res.ok) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
