/* Bộ nhớ đệm cho web: ảnh tướng lưu lâu (tải 1 lần), trang và dữ liệu luôn lấy bản mới, mất mạng thì dùng bản đã lưu.
   Khi thay ảnh trong p/ hoặc s/ có cùng tên tệp, tăng V để người xem nhận ảnh mới. */
const V = "v1";
const IMG = "img-" + V, PAGES = "pages-" + V;
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== IMG && k !== PAGES) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener("fetch", e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== "GET" || u.origin !== location.origin) return;
  if (/\/(p|s)\/[^/]+\.webp$/.test(u.pathname) || /\.(png|jpg|svg)$/.test(u.pathname)) {
    e.respondWith(caches.open(IMG).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const r = await fetch(req);
      if (r.ok) c.put(req, r.clone());
      return r;
    }));
    return;
  }
  e.respondWith((async () => {
    try {
      const r = await fetch(req);
      if (r.ok) (await caches.open(PAGES)).put(req, r.clone());
      return r;
    } catch (err) {
      return (await caches.match(req, { ignoreSearch: true })) || Response.error();
    }
  })());
});
