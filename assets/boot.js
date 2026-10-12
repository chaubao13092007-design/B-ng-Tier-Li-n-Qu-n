/* Chạy sớm trong <head>. Tách khỏi HTML để chính sách bảo mật (CSP) không phải cho phép mã nội tuyến.
   1. Google Analytics G-5WRPCM36GN (tắt chia sẻ dữ liệu quảng cáo của Google).
   2. Chống nhúng web vào khung (iframe) của trang khác để lừa bấm: nếu bị nhúng thì ẩn trang và thử mở ra ngoài.
   3. Bật font Google sau khi tải xong (thay cho onload nội tuyến). */
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "G-5WRPCM36GN", { allow_google_signals: false, allow_ad_personalization_signals: false });

(function () {
  if (window.self === window.top) return;
  var html = document.documentElement;
  html.classList.add("framed");
  try { window.top.location.replace(window.location.href); } catch (e) {}
  // Trình duyệt thường chặn tự chuyển trang từ khung: hiện một link để người xem tự mở web ở tab riêng
  document.addEventListener("DOMContentLoaded", function () {
    var a = document.createElement("a");
    a.className = "framed-go"; a.href = window.location.href; a.target = "_top"; a.rel = "noopener";
    a.textContent = "Mở Bảng Tier Liên Quân";
    html.appendChild(a);
  });
})();

(function () {
  var l = document.getElementById("fontcss");
  if (!l) return;
  var on = function () { l.media = "all"; };
  if (l.sheet) on(); else l.addEventListener("load", on);
})();
