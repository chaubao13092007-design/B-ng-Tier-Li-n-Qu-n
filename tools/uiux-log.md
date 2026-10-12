# Nhật ký cải thiện giao diện (UI/UX)

Việc định kỳ mỗi Thứ Bảy (7:45 giờ Việt Nam) đọc tệp này trước khi làm, rồi thêm một mục mới ở cuối.
Mỗi mục: ngày, đã sửa gì và vì sao, đã kiểm tra gì, ý tưởng để lần sau.

## Đã chốt, không làm ngược lại
- Phong cách lấy cảm hứng Bugatti: nền đen tuyền, chữ in hoa giãn rộng, góc vuông, đường kẻ mảnh, chuyển động chậm.
- Tên tướng không xuống dòng trên thẻ (chủ web yêu cầu). Tên dài trên điện thoại thu chữ nhẹ (lớp `.card.ln`).
- Hover chỉ đặt trong `@media (hover:hover)` (tránh nút "dính" màu sau khi chạm trên điện thoại).
- Thanh dính (tìm kiếm, chọn đường) và hàng tên đường dùng nền đặc `var(--bg)`, không để trong suốt.
- Thẻ tướng hiện ngay khi cuộn tới; không dùng lại hiệu ứng bật lên lần lượt (từng làm bảng mờ hơn 1 giây).
- Mỗi bảng chi tiết có build riêng theo đường từ nguồn server Việt; đi rừng luôn có đồ rừng + Trừng Trị.
- Danh sách chỉnh tay và đường phụ trong mục Cách xếp tự sinh từ dữ liệu, không viết tay.

## 2026-10-12 (làm tay cùng chủ web)
- Sửa nút dính màu sau khi chạm trên điện thoại; thanh dính nền đặc; thẻ tướng hiện ngay.
- Điện thoại: ảnh tướng 70px → tối đa 88px, 3 thẻ lấp đủ hàng.
- Bảng lọc điện thoại: nút "Xem N tướng". Máy tính: nút "Xem bảng tier" ở đầu trang. Ô tìm kiếm: mũi tên xuống nhảy tới thẻ đầu tiên.
- Thêm vùng `<main>`, tăng tương phản chữ phụ/vàng/xanh; axe-core sạch ở 1440/390, sáng/tối.
- Ý tưởng để lần sau:
  - Bảng chi tiết trên máy tính: chữ tên đồ trong phần build khá nhỏ (12.5px), cân nhắc tăng nhẹ.
  - Cột Tà Thần (42 tướng) dài hơn hẳn các cột khác trên máy tính, xem có cách đỡ trống ở cột ngắn.

## 2026-10-12 (lần 2, làm tay theo yêu cầu chủ web)
- Điện thoại: danh sách "Thay đổi theo bản" chỉ hiện 6 dòng đầu, nút "Xem thêm N thay đổi" / "Thu gọn" (bớt ~850px cuộn). Máy tính hiện đủ.
- Sửa lỗi gạch chân tên tướng trong danh sách thay đổi trên điện thoại bị lệch xuống dòng dưới (do vùng chạm nới rộng lần trước): dùng text-decoration thay border.
- Nhãn đầu trang "Tướng · 11/10" → "Tướng được xếp".
- Kiểm tra: 148 bảng chi tiết ở 1440/390, CSP không vi phạm, axe-core sạch.
- Ý tưởng để lần sau:
  - Bảng chi tiết trên máy tính: chữ tên đồ trong phần build khá nhỏ (12.5px), cân nhắc tăng nhẹ.
  - Cột Tà Thần (42 tướng) dài hơn hẳn các cột khác trên máy tính, xem có cách đỡ trống ở cột ngắn.
