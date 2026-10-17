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
- `manifest.webmanifest`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — cài web như ứng dụng trên điện thoại.
- `sw.js` — bộ nhớ đệm: ảnh lưu lâu, trang và dữ liệu luôn lấy bản mới. **Nếu thay ảnh trong `p/` hoặc `s/` mà giữ nguyên tên tệp, tăng `V` trong `sw.js`.**
- `404.html` — trang báo link sai.
- Bảo mật: `index.html` và `404.html` có thẻ `Content-Security-Policy` (chỉ cho chạy mã của web và Google Analytics, font Google).
  Không viết mã `<script>` nội tuyến hay thuộc tính `onclick=`/`onload=` trong HTML — đặt vào tệp JS. Thêm dịch vụ ngoài mới thì phải thêm tên miền vào CSP.
  `assets/boot.js` (nạp trong `<head>`): khởi tạo Google Analytics, chống nhúng web vào iframe, bật font. Đổi `?v=` của nó cùng các script cuối trang.
  Khi kiểm tra bằng Playwright mà cần chèn script (ví dụ axe-core), tạo context với `bypassCSP: true`.
  Dữ liệu đọc từ bộ nhớ trình duyệt (bảng Tự xếp) được lọc lại trước khi dùng (`loadMine`). `.well-known/security.txt` hết hạn 2027-10-12, nhớ gia hạn.
- Google Analytics `G-5WRPCM36GN` khởi tạo trong `assets/boot.js`, gắn ở `<head>` của `index.html` và `404.html`. Sự kiện riêng: `xem_tuong`, `tai_anh`, `chia_se`, `doi_che_do` (hàm `track` trong `assets/app.js`).
- Link riêng từng tướng: `…/#tuong-<key>-<đường>` (ví dụ `#tuong-zata-mid`) tự mở bảng chi tiết.
- `assets/builds.js` — build tham khảo (đồ, bảng ngọc, phép bổ trợ) hiện trong bảng chi tiết khi bấm vào tướng. **Tạo tự động, đừng sửa tay.**
  Không có thẻ `<script>` cho builds.js trong HTML: `app.js` tự tải nó 1,2 giây sau khi trang tải xong (hoặc ngay khi mở bảng chi tiết),
  dùng cùng số `?v=` với `app.js`. Bảng chi tiết hiện "Đang tải build…" rồi tự hiện build. Khi kiểm tra bằng Playwright, chờ `typeof BUILDS !== "undefined"`.
  `BINFO` (giá, chỉ số, nội tại từng món, lấy từ avix-data bản Việt) hiện trong hộp thông tin khi trỏ/chạm vào món đồ hoặc phép bổ trợ.
  Món nào bản cập nhật Garena đã đổi mà avix-data chưa cập nhật thì sửa trong `FIXSTAT`/`FIXPAS` ở `emit.py` (hiện có Giáp Thống Khổ theo bản 29/09).
  Mỗi ô tướng (tướng + đường) có build riêng `BUILDS["<key>@<đường>"]`, ghi trong `tools/builds/vn.txt`, nguồn tiếng Việt cho server VN
  (chủ yếu https://aov-builds.com/tuong/<tên>/; danh sách tên ở https://aov-builds.com/tuong/). Nguồn có nhiều build cho một đường thì lấy build ghi đầu tiên.
  Ảnh đồ/ngọc/phép ở `b/`, tên Việt và ảnh từ AoV-IndeX (`github.com/AoV-IndeX/avix-data`, `avix-assets`).
  Cập nhật: sửa `vn.txt` theo nguồn → clone hai repo AoV-IndeX vào `/tmp/ext/avix-data`, `/tmp/ext/avix`
  → `python3 tools/builds/compile.py && python3 tools/builds/emit.py && node tools/builds/check.js`.
  `compile.py` dừng nếu tên đồ/ngọc/phép lạ, ngọc mỗi màu không đủ 10 viên, build `@jg` thiếu đồ rừng (Kiếm Truy Hồn, Gươm Loki,
  Rìu Leviathan, Cung Bão Tố) hoặc Trừng Trị, build đi đường có đồ rừng. `check.js` báo ô tướng nào chưa có build hoặc Trợ thủ thiếu đồ trợ thủ.
  Khi thêm tướng hoặc đường phụ mới phải thêm build `@<đường>` vào `vn.txt`. Build chỉ cập nhật khi chủ web yêu cầu, lịch tự cập nhật không đụng tới.
  Phép có dấu `*` trong `vn.txt` (ví dụ `Trừng Trị*` của Taara đi Tà Thần) là phương án chủ web thêm, không có ở trang nguồn — giữ nguyên khi cập nhật.
  `tools/builds/raw.txt` là build cũ của ROV META (server Thái), không còn hiện trên web.
  Phù hiệu: dòng `ENCH: <nhánh chính>: a, b, c | <nhánh>: d, e` trong mỗi khối của `vn.txt` (cùng trang nguồn với build; ưu tiên bộ ghi cho
  đúng đường, không có thì bộ ghi đầu tiên). Nguồn build không có phù hiệu thì lấy trang AOV-Builds của tướng và ghi `ENCH_SRC: <link>`.
  `compile.py` kiểm luật game: nhánh chính đủ cấp I–III; 2 phù hiệu phụ cấp I/II ở nhánh khác (cùng một nhánh thì phải khác cấp).
  `emit.py` xuất `BENCH` (tên, nhánh, cấp, mô tả từ avix-data `vi/enchantments.json`), `BENCHB` (tên 4 nhánh) và ảnh `b/e-<id>.webp`.
  `tools/builds/ench_raw.txt` là bản ghi thô các bộ phù hiệu đọc từ trang nguồn ngày 17/10/2026 (để tra lại).
- `assets/skills.js` — Bộ chiêu thức (dưới phần "Vì sao tier" trong bảng chi tiết). **Tạo tự động, đừng sửa tay**:
  sửa `tools/skills/garena.json` rồi chạy `python3 tools/skills/emit.py`. Mỗi tướng: `[[tên chiêu, link ảnh, tóm tắt], …]` theo thứ tự
  trang Học viện Garena `https://lienquan.garena.vn/hoc-vien/tuong-skin/d/<slug>/` (nội tại → chiêu 1 → chiêu 2 → chiêu cuối; danh sách slug ở
  `/hoc-vien/tuong-skin/`; slug đặc biệt: Edras `11596`, Flowborn Rồng `flowborn`, Flowborn Giữa `flowborn-2`).
  Tóm tắt là lời viết lại ngắn (tối đa ~30 chữ), **không chép nguyên văn** mô tả của Garena; web có link tới trang gốc.
  Ảnh chiêu lấy thẳng từ máy chủ Garena (chủ web đồng ý ngày 13/10/2026, `https://lienquan.garena.vn` có trong CSP `img-src` của `index.html`, gửi không kèm referrer); ảnh lỗi thì hiện chữ cái đầu.
  `app.js` chỉ tải skills.js (~37 kB nén) khi người xem chạm vào thẻ tướng hoặc mở bảng chi tiết (`loadSkills`/`waitSkills`). Khi kiểm tra bằng Playwright, chờ `typeof SKILLS !== "undefined"`.
  Trang Garena thiếu mô tả: Bright (3 chiêu), Elsu không có ảnh, chiêu 2 của Richter không có tên; Yue chiêu 1 và 2 Garena ghi mô tả giống nhau.
  Tướng mới: thêm vào `garena.json` rồi chạy lại emit.py.
- Danh sách "Chỉnh tay của người biên tập" và "Đường phụ" trong mục Cách xếp và nguồn được `assets/app.js` tự sinh từ `MANUAL`/`SECONDARY`, không cần sửa chữ trong `index.html`.
- Kiểu hover chỉ đặt trong `@media (hover:hover)` để điện thoại không bị dính trạng thái sau khi chạm. Thanh dính và hàng tên đường dùng nền đặc `var(--bg)`.
- Việc định kỳ mỗi Thứ Bảy cải thiện giao diện ghi nhật ký ở `tools/uiux-log.md` (đọc trước khi sửa giao diện; mục "Đã chốt" không làm ngược lại).
- Việc định kỳ mỗi Chủ nhật tối ưu hiệu năng ghi số đo và việc đã làm ở `tools/perf-log.md`; đo bằng `tools/perf/serve.py` + `tools/perf/measure.js` để so được giữa các tuần.
- Đầu `assets/app.js` có hàm `fixTextZoom`: bù lại việc trình duyệt trong Messenger/Facebook trên Android phóng to chữ theo cỡ chữ điện thoại (chữ bị cụm, chồng nhau). Giữ nguyên. Thêm `?tz` vào link để xem tỉ lệ đo được.

## Dữ liệu trong `assets/data.js`
- `SRC.aog` — ĐTDV mùa hiện tại, mỗi tướng: `[tỉ lệ thắng %, pick % số trận, cấm % số trận, số pick, số cấm]`.
  `SRC.aogGames` = tổng số trận. Nguồn: Liquipedia `honorofkings/Arena_of_Glory/<năm>/<mùa>/Statistics`
  (trang này thường chặn bằng bước xác minh người dùng — không được vượt; nếu không đọc được thì giữ số cũ).
- `SRC.prev` / `SRC.prevGames` — mùa trước, cùng định dạng.
- `SRC.rpl` — RoV Pro League (Thái Lan): `[tỉ lệ thắng % hoặc null, pick %, cấm %]`. Nguồn: https://rovmeta.com/stats
- `SRC.rm` — tier list rank cộng đồng (`S+`/`S`/`A`/`B`/`C`). Từ 15/10/2026 **chủ web tự tổng hợp** từ @darkiaov9126 và @blvkhanhhy
  (ghi chú ngay trên khối `rm`). Không thay bằng số của rovmeta.com hay nguồn khác, kể cả trong lịch tự cập nhật, trừ khi chủ web yêu cầu.
  Tướng chưa có trong `rm` (ví dụ tướng mới) thì để trống, không tự thêm.
- Tên quốc tế → tên Việt: Riktor = Richter, Zanis = Triệu Vân, Wukong = Ngộ Không, Lu Bu = Lữ Bố,
  Diao Chan = Điêu Thuyền, Jinnar = Jinna, Terri = Teeri, Sinestra = Sinestrea.
- `RAW` — `[đường, lớp, tier báo VN, "Tên1,Tên2"]`. Đường: `top` Tà Thần, `jg` Rừng, `mid` Giữa, `ad` Rồng, `sp` Trợ thủ.
- `P` — thay đổi của bản cập nhật gần nhất: `key: ["up"|"down"|"mix"|"new", "ghi chú", true nếu đã chỉnh tier báo VN theo bản này]`.
  Key có thể kèm đường khi thay đổi chỉ áp cho một dạng (ví dụ `"flowborn-ad"`). `PATCH` (ngay trên `P`) là ngày bản, hiện ở chữ "bản …" trong bảng chi tiết.
  `"new"` = tướng mới hoặc làm lại bộ kỹ năng.
  Khi có bản cập nhật Garena mới (https://lienquan.garena.vn/category/cap-nhat/), thay toàn bộ `P` bằng thay đổi mới, đổi `PATCH`,
  và theo cách tính đã ghi: tướng bị giảm sức mạnh hạ 1 bậc báo VN trong `RAW`, tướng tier D được tăng rõ lên 1 bậc (đánh dấu `true`).
- `MANUAL` — **chỉnh tay của chủ web. Không bao giờ xoá hay sửa** trừ khi chủ web yêu cầu.
- `SECONDARY` và các dòng bỏ/đổi đường phía dưới — cũng là quyết định của chủ web, giữ nguyên.

## Quy tắc khi cập nhật
1. Chỉ dùng số liệu đọc được từ nguồn. Không đoán, không bịa số.
2. Giữ nguyên `MANUAL`, `SECONDARY`, các dòng bỏ đường.
3. Cập nhật ngày "Cập nhật …" và tên mùa/bản trong `index.html` (tìm `17/10/2026`, `S4 2026`, `Vết Nứt Thời Không`, `15/10`)
   và `<lastmod>` trong `sitemap.xml` khi có thay đổi thật.
4. Tướng mới: thêm vào `RAW`, tạo `p/<key>.webp` (176×176, WebP chất lượng 72) và `s/<key>.webp` (rộng 960, chất lượng 60),
   rồi thêm key vào `P_KEYS`/`S_KEYS` ở đầu `assets/app.js`.
   Thêm luôn build `@<đường>` vào `tools/builds/vn.txt` (nguồn chưa có thì lấy bài hướng dẫn tiếng Việt khác, ghi `NOTE`) và bộ chiêu vào `tools/skills/garena.json`.
   Chủ web đổi đường tướng trong `RAW` thì cũng phải có build cho đường mới (`node tools/builds/check.js` báo thiếu).
5. Kiểm tra trước khi đẩy: `node --check assets/data.js && node --check assets/app.js`, rồi mở `index.html`
   bằng Playwright (Chromium có sẵn) ở 1440px và 390px: không lỗi JS, có 5 slide, bảng có thẻ tướng, không tràn ngang.
6. Mỗi lần sửa `assets/data.js`, `assets/builds.js`, `assets/app.js` hoặc `assets/boot.js`, đổi số `?v=` ở các thẻ `<script>` của `index.html` (dùng ngày giờ, ví dụ `?v=202610150846`) để trình duyệt người xem tải bản mới.
7. Commit tiếng Việt, mô tả ngắn những gì đổi (tướng nào lên/xuống tier và vì sao). Đẩy thẳng lên `main`.
