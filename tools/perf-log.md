# Nhật ký hiệu năng

Việc định kỳ mỗi Chủ nhật (9:47 giờ Việt Nam) đọc tệp này trước khi làm, đo lại, rồi thêm một mục mới ở cuối.
Cách đo chuẩn (từ 12/10/2026): `python3 tools/perf/serve.py 8770 &` (máy chủ cục bộ có nén gzip như GitHub Pages) rồi
`NODE_PATH=$(npm root -g) node tools/perf/measure.js http://localhost:8770/ 5` (lấy trung vị 5 lần). Playwright + CDP, tắt bộ nhớ đệm.
Không tính Google Fonts và Google Analytics (môi trường chạy không vào được hai dịch vụ này).
- Điện thoại: 390×844, DPR 3, CPU chậm 4 lần, mạng 1,6 Mbps / độ trễ 150 ms.
- Máy tính: 1440×900, không giới hạn.
- Chỉ số: LCP, CLS, TBT (tổng phần long task vượt 50 ms, đo tới 3 giây sau khi bảng có thẻ), thời gian tới khi bảng có thẻ tướng,
  thời gian mở bảng chi tiết tướng đầu tiên, dung lượng tải và số yêu cầu lần đầu.

## 2026-10-12 — số đo gốc đầu tiên (máy chủ không nén, 1 lần đo, chỉ để tham khảo)
| Thiết bị | LCP | CLS | TBT | Bảng có thẻ | Mở bảng chi tiết | Tải lần đầu | Yêu cầu |
|---|---|---|---|---|---|---|---|
| Điện thoại (giả lập chậm) | 856 ms | 0,002 | 919 ms | 3141 ms | 801 ms | 347 kB | 29 |
| Máy tính | 100 ms | 0,009 | 87 ms | 514 ms | 201 ms | 347 kB | 29 |

Kích thước thư mục: p/ 800 KB, s/ 3,5 MB (ảnh bìa, tải dần), b/ 380 KB, assets/ 136 KB.
Ý tưởng để lần sau: TBT trên điện thoại khá cao (919 ms), xem phần nào chạy lâu lúc mở trang (vẽ thiên hà WebGL, dựng bảng, fixTextZoom);
mở bảng chi tiết trên điện thoại mất ~0,8 giây.

## 2026-10-12 — lần tối ưu đầu tiên (làm tay cùng chủ web, đo bằng tools/perf, trung vị 3–5 lần)
| Điện thoại (giả lập chậm) | Trước | Sau |
|---|---|---|
| Bảng tier có thẻ tướng | 1879 ms | 1146 ms |
| Tải tới lúc bảng hiện | 150 kB / 17 yêu cầu | 55 kB / 5 yêu cầu |
| TBT | 352 ms | 256 ms |
| LCP / CLS | 500 ms / 0 | 484 ms / 0 |
Máy tính không đổi đáng kể (bảng hiện ~0,5 giây, LCP ~0,1 giây).
- assets/builds.js (dữ liệu build) chuyển xuống sau app.js và tải async: bảng tier không phải chờ nó.
  Mở bảng chi tiết trước khi build tải xong thì hiện "Đang tải build…" rồi tự hiện build (`waitBuilds` trong app.js).
- Ảnh nền sân khấu (kể cả slide đầu) và ảnh tướng hạng 2–3 không tải lúc mở trang nữa; tải khi người xem bắt đầu cuộn,
  khi sân khấu cách màn hình 150px, hoặc 2,5 giây sau khi trang tải xong.
- Thêm tools/perf/serve.py và tools/perf/measure.js để các tuần sau đo cùng một cách.
Ý tưởng để lần sau: TBT trên điện thoại phần lớn là vẽ thiên hà WebGL (trong môi trường đo không có GPU nên bị phóng đại);
mở bảng chi tiết ~0,5–0,7 giây trên điện thoại chậm (dựng HTML + ảnh bìa 960px), xem có giảm được không.
