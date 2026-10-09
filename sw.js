// Mineage service worker: caches everything after the first visit so the app works offline.
const V = "mineage-v2";
const CORE = ["./", "./index.html", "./manifest.json", "./face-api.js", "./human.js",
  "./age_gender_model.json", "./age_gender_model.bin",
  "./blazeface.json", "./blazeface.bin",
  "./facemesh.json", "./facemesh.bin",
  "./faceres.json", "./faceres.bin"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  if (r.mode === "navigate") {      // صفحه: اول شبکه، اگر نبود از کش
    e.respondWith(fetch(r).then(res => { const cl = res.clone(); caches.open(V).then(c => c.put(r, cl)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
    if (res.ok) { const cl = res.clone(); caches.open(V).then(c => c.put(r, cl)); }
    return res;
  })));
});
