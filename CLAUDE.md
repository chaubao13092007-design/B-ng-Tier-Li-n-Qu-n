# Bảng Tier Liên Quân — hướng dẫn cập nhật

Web tĩnh chạy trên GitHub Pages: https://tierlq.github.io/
Chủ repo giao tiếp bằng tiếng Việt, muốn sửa thẳng vào file và tự đẩy lên.

## Cấu trúc
- `index.html` — khung trang, CSS, chữ cố định (ngày cập nhật, tên mùa, phần "Cách xếp và nguồn").
- `assets/data.js` — **toàn bộ dữ liệu**: số liệu giải (`SRC`), danh sách tướng theo đường (`RAW`),
  ghi chú bản cập nhật (`P`), chỉnh tay (`MANUAL`), đường phụ (`SECONDARY`) và công thức chấm điểm.
- `assets/app.js` — giao diện và tương tác. Không cần sửa khi chỉ cập nhật số liệu.
- `p/<key>.webp` ảnh chân dung 176px, `s/<key>.webp` ảnh bìa 960px. `key` = tên tướng bỏ dấu, chữ thường,
  chỉ giữ a–z (Triệu Vân → `trieuvan`, D'Arcy → `darcy`, Flowborn có `flowborn-mid` và `flowborn-ad`).
  Nguồn ảnh: https://github.com/AoV-IndeX/avix-assets (`heroes/avatars`, `heroes/splashes`).
- `og.jpg` ảnh xem trước khi chia sẻ, `favicon.svg`, `robots.txt`, `sitemap.xml`.

## Dữ liệu trong `assets/data.js`
- `SRC.aog` — ĐTDV mùa hiện tại, mỗi tướng: `[tỉ lệ thắng %, pick % số trận, cấm % số trận, số pick, số cấm]`.
  `SRC.aogGames` = tổng số trận. Nguồn: Liquipedia `honorofkings/Arena_of_Glory/<năm>/<mùa>/Statistics`
  (trang này thường chặn bằng bước xác minh người dùng — không được vượt; nếu không đọc được thì giữ số cũ).
- `SRC.prev` / `SRC.prevGames` — mùa trước, cùng định dạng.
- `SRC.rpl` — RoV Pro League (Thái Lan): `[tỉ lệ thắng % hoặc null, pick %, cấm %]`. Nguồn: https://rovmeta.com/stats
- `SRC.rm` — tier list rank cộng đồng ROV META (`S+`/`S`/`A`/`B`/`C`). Nguồn: https://rovmeta.com/
- Tên quốc tế → tên Việt: Riktor = Richter, Zanis = Triệu Vân, Wukong = Ngộ Không, Lu Bu = Lữ Bố,
  Diao Chan = Điêu Thuyền, Jinnar = Jinna, Terri = Teeri, Sinestra = Sinestrea.
- `RAW` — `[đường, lớp, tier báo VN, "Tên1,Tên2"]`. Đường: `top` Tà Thần, `jg` Rừng, `mid` Giữa, `ad` Rồng, `sp` Trợ thủ.
- `P` — thay đổi của bản cập nhật gần nhất: `key: ["up"|"down"|"mix"|"new", "ghi chú"]`.
  Khi có bản cập nhật Garena mới (https://lienquan.garena.vn/category/cap-nhat/), thay toàn bộ `P` bằng thay đổi mới.
- `MANUAL` — **chỉnh tay của chủ web. Không bao giờ xoá hay sửa** trừ khi chủ web yêu cầu.
- `SECONDARY` và các dòng bỏ/đổi đường phía dưới — cũng là quyết định của chủ web, giữ nguyên.

## Quy tắc khi cập nhật
1. Chỉ dùng số liệu đọc được từ nguồn. Không đoán, không bịa số.
2. Giữ nguyên `MANUAL`, `SECONDARY`, các dòng bỏ đường.
3. Cập nhật ngày "Cập nhật …" và tên mùa/bản trong `index.html` (tìm `11/10/2026`, `S4 2026`, `Vết Nứt Thời Không`, `29/09`)
   và `<lastmod>` trong `sitemap.xml` khi có thay đổi thật.
4. Tướng mới: thêm vào `RAW`, tạo `p/<key>.webp` (176×176, WebP chất lượng 72) và `s/<key>.webp` (rộng 960, chất lượng 60),
   rồi thêm key vào `P_KEYS`/`S_KEYS` ở đầu `assets/app.js`.
5. Kiểm tra trước khi đẩy: `node --check assets/data.js && node --check assets/app.js`, rồi mở `index.html`
   bằng Playwright (Chromium có sẵn) ở 1440px và 390px: không lỗi JS, có 5 slide, bảng có thẻ tướng, không tràn ngang.
6. Commit tiếng Việt, mô tả ngắn những gì đổi (tướng nào lên/xuống tier và vì sao). Đẩy thẳng lên `main`.
