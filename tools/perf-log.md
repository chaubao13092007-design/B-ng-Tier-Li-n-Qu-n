# Nhật ký hiệu năng

Việc định kỳ mỗi Chủ nhật (9:47 giờ Việt Nam) đọc tệp này trước khi làm, đo lại, rồi thêm một mục mới ở cuối.
Số đo lấy trên máy chủ cục bộ (python3 -m http.server), không tính Google Fonts và Google Analytics (môi trường chạy không vào được hai dịch vụ này).
Cách đo chuẩn: Playwright + CDP, tắt bộ nhớ đệm.
- Điện thoại: 390×844, DPR 3, CPU chậm 4 lần, mạng 1,6 Mbps / độ trễ 150 ms.
- Máy tính: 1440×900, không giới hạn.
- Chỉ số: LCP, CLS, TBT (tổng phần long task vượt 50 ms, đo tới 3 giây sau khi bảng có thẻ), thời gian tới khi bảng có thẻ tướng,
  thời gian mở bảng chi tiết tướng đầu tiên, dung lượng tải và số yêu cầu lần đầu.

## 2026-10-12 — số đo gốc (làm tay cùng chủ web, chưa tối ưu gì)
| Thiết bị | LCP | CLS | TBT | Bảng có thẻ | Mở bảng chi tiết | Tải lần đầu | Yêu cầu |
|---|---|---|---|---|---|---|---|
| Điện thoại (giả lập chậm) | 856 ms | 0,002 | 919 ms | 3141 ms | 801 ms | 347 kB | 29 |
| Máy tính | 100 ms | 0,009 | 87 ms | 514 ms | 201 ms | 347 kB | 29 |

Kích thước thư mục: p/ 800 KB, s/ 3,5 MB (ảnh bìa, tải dần), b/ 380 KB, assets/ 136 KB.
Ý tưởng để lần sau: TBT trên điện thoại khá cao (919 ms), xem phần nào chạy lâu lúc mở trang (vẽ thiên hà WebGL, dựng bảng, fixTextZoom);
mở bảng chi tiết trên điện thoại mất ~0,8 giây.
