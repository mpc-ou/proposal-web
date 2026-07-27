# Web Design 2026 - Hồ sơ mời tài trợ

Website proposal dạng "slide cuộn" (mỗi section = 1 trang) cho CLB Lập Trình Trên Thiết Bị Di Động - Khoa CNTT - Trường Đại học Mở TP.HCM. Không dùng framework/build tool, HTML/CSS/JS thuần, các trang được nạp động và mỗi section gộp chung html+css+js+data+ảnh riêng trong 1 thư mục.

## Chạy thử local

Các trang được nạp bằng `fetch()` nên **phải chạy qua HTTP server**, không mở trực tiếp `index.html` bằng `file://`:

```bash
npx serve webdesign2026
```

hoặc dùng extension **Live Server** trong VS Code, mở `webdesign2026/index.html`.

## Cấu trúc thư mục

Xem chi tiết quy ước tổ chức file, cách thêm section mới và chuẩn commit tại [CONTRIBUTING.md](CONTRIBUTING.md).

- `webdesign2026/css/color.css` - biến màu (1 bảng màu duy nhất)
- `webdesign2026/css/style.css` - reset, typography, utility class, component dùng CHUNG
- `webdesign2026/js/init.js` - nạp các section theo thứ tự
- `webdesign2026/js/app.js` - đánh số trang, animation, thanh tiến trình cuộn, zoom, nút In PDF, lưu/khôi phục vị trí cuộn
- `webdesign2026/js/lightbox.js` - overlay xem ảnh phóng to, dùng CHUNG cho mọi section (xem hướng dẫn dùng trong [CONTRIBUTING.md](CONTRIBUTING.md))
- `webdesign2026/data/info.json` - dữ liệu CHUNG (site, titlePage, letter, footer)
- `webdesign2026/sections/ten-section/` - 1 thư mục = 1 section = 1 trang, gồm đủ `.html`, `.css`, `.js`, data riêng (`.json`/`.md`) và `img/` của section đó

## Tính năng

- Giao diện cố định khung 1920x1358 (đúng tỉ lệ 1 tờ A4 nằm ngang), có nút zoom +/- (nhớ mức zoom qua localStorage) — không responsive, xem trên màn hình nhỏ hơn thì zoom out hoặc cuộn ngang
- Nạp trang tuần tự bằng `fetch()`, giữ đúng thứ tự khai báo trong `init.js`
- Animation khi cuộn (dùng animate.css qua `IntersectionObserver`), chỉ chạy sau khi toàn bộ nội dung (kể cả markdown) đã tải xong
- Đánh số trang tự động theo thứ tự các khối `.page` trong DOM
- Nút "In PDF" (hiện khi hover góc dưới phải), Ctrl+P, hoặc menu in của trình duyệt đều dùng `window.print()` (`@media print` trong `css/style.css`) — chữ là text thật, chọn/copy được, xuất đúng khổ A4 ngang, lấp đầy trang. Trước khi in, JS tự reset zoom màn hình về nguyên bản rồi khôi phục lại sau (nghe sự kiện `beforeprint`/`afterprint`)
- Tự lưu vị trí cuộn (`sessionStorage`) — F5 lại trang thì cuộn về đúng chỗ cũ, kể cả khi ảnh tải xong làm chiều cao trang thay đổi
- Overlay xem ảnh phóng to (`js/lightbox.js`) — bấm vào ảnh có gắn `data-lightbox` để xem to hơn, zoom (lăn chuột/nút +-), kéo khi đã zoom, chuyển ảnh trước/sau nếu 1 dự án có nhiều ảnh; dùng chung được cho mọi section

## Thay ảnh/logo

Ảnh/logo nằm trong `sections/ten-section/img/`. Thay file cùng tên (hoặc đổi đường dẫn trong `data/info.json` / `sections/ten-section/*.json`) khi có ảnh chính thức.
