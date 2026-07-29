# Web Design 2026 - Hồ sơ mời tài trợ

Website proposal dạng "slide cuộn" (mỗi section = 1 trang) cho CLB Lập Trình Trên Thiết Bị Di Động - Khoa CNTT - Trường Đại học Mở TP.HCM. Không dùng framework/build tool, HTML/CSS/JS thuần, các trang được nạp động và mỗi section gộp chung html+css+js+data+ảnh riêng trong 1 thư mục.

## Công nghệ sử dụng

Toàn bộ là HTML/CSS/JS thuần (vanilla), không React/Vue, không bundler/build step. Chỉ vài thư viện load qua CDN:

- **[marked.js](https://github.com/markedjs/marked)** - render các file `.md` (đoạn văn dài) thành HTML
- **[Bootstrap Icons](https://icons.getbootstrap.com/)** - icon dùng khắp nơi (`<i class="bi bi-...">`)
- **[animate.css](https://animate.style/)** - hiệu ứng khi cuộn tới (`data-animate="ten-hieu-ung"`)
- **Google Fonts** - `Be Vietnam Pro` (chữ thường) và `JetBrains Mono` (số liệu/mono)
- **JS Modules (ESM)** - mỗi section là 1 module `export default async function init...(root, data)`, nạp bằng `import()` động trong `js/init.js`

Không cần `npm install` gì cả - chỉ cần 1 static server để `fetch()` hoạt động (xem bên dưới).

## Chạy thử local

Các trang được nạp bằng `fetch()` nên **phải chạy qua HTTP server**, không mở trực tiếp `index.html` bằng `file://`:

```bash
npx serve webdesign2026
```

hoặc dùng extension **Live Server** trong VS Code, mở `webdesign2026/index.html`.

## Cấu trúc thư mục

Xem chi tiết quy ước tổ chức file, cách thêm section mới và chuẩn commit tại [CONTRIBUTING.md](CONTRIBUTING.md).

- `webdesign2026/css/color.css` - biến màu (1 bảng màu duy nhất)
- `webdesign2026/css/style.css` - reset, typography, utility class, component dùng CHUNG (bao gồm overlay loading)
- `webdesign2026/js/init.js` - nạp các section theo thứ tự
- `webdesign2026/js/app.js` - đánh số trang, animation, thanh tiến trình cuộn, zoom, nút In PDF, lưu/khôi phục vị trí cuộn
- `webdesign2026/js/lightbox.js` - overlay xem ảnh phóng to, dùng CHUNG cho mọi section (xem hướng dẫn dùng trong [CONTRIBUTING.md](CONTRIBUTING.md))
- `webdesign2026/js/loading-overlay.js` - overlay chờ tải trang (spinner + % tiến trình), tự ẩn khi mọi request/ảnh đã tải xong
- `webdesign2026/data/info.json` - dữ liệu CHUNG (site, titlePage, letter, footer)
- `webdesign2026/sections/ten-section/` - 1 thư mục = 1 section = 1 trang, gồm đủ `.html`, `.css`, `.js`, data riêng (`.json`/`.md`) và `img/` của section đó

## Tính năng

- Giao diện cố định khung 1920x1358 (đúng tỉ lệ 1 tờ A4 nằm ngang), có nút zoom +/- (nhớ mức zoom qua localStorage) — không responsive, xem trên màn hình nhỏ hơn thì zoom out hoặc cuộn ngang
- Overlay chờ tải trang ngay khi vào web, hiện % tiến trình thật (theo dõi cả fetch HTML/JSON/markdown lẫn ảnh), tự ẩn khi tải xong hẳn
- Nạp trang tuần tự bằng `fetch()`, giữ đúng thứ tự khai báo trong `init.js`
- Animation khi cuộn (dùng animate.css qua `IntersectionObserver`), chỉ chạy sau khi toàn bộ nội dung (kể cả markdown) đã tải xong
- Đánh số trang tự động theo thứ tự các khối `.page` trong DOM
- Nút "In PDF" (hiện khi hover góc dưới phải), Ctrl+P, hoặc menu in của trình duyệt đều dùng `window.print()` (`@media print` trong `css/style.css`) — chữ là text thật, chọn/copy được, xuất đúng khổ A4 ngang, lấp đầy trang. Trước khi in, JS tự reset zoom màn hình về nguyên bản rồi khôi phục lại sau (nghe sự kiện `beforeprint`/`afterprint`)
- Tự lưu vị trí cuộn (`sessionStorage`) — F5 lại trang thì cuộn về đúng chỗ cũ, kể cả khi ảnh tải xong làm chiều cao trang thay đổi
- Overlay xem ảnh phóng to (`js/lightbox.js`) — bấm vào ảnh có gắn `data-lightbox` để xem to hơn, zoom (lăn chuột/nút +-), kéo khi đã zoom, chuyển ảnh trước/sau nếu 1 dự án có nhiều ảnh; dùng chung được cho mọi section

## Sửa nội dung chữ, số liệu

**Không sửa trực tiếp trong HTML.** Mỗi section lấy nội dung từ:

- `sections/ten-section/*.json` - dữ liệu có cấu trúc (tiêu đề, danh sách, số liệu...). Sửa giá trị trong file này, load lại trang là thấy ngay, không cần đụng `.js`.
- `sections/ten-section/*.md` - đoạn văn dài (thư ngỏ, giới thiệu...), viết markdown thường (`**in đậm**`, xuống dòng cách 1 dòng trống = qua đoạn mới).
- `data/info.json` - dữ liệu dùng CHUNG nhiều section (tên trường, tên CLB, footer...).

Muốn biết 1 đoạn chữ trên trang nằm ở field nào trong JSON: mở `sections/ten-section/ten-section.js`, tìm hàm `render...` tương ứng để biết field JSON nào map vào phần tử đó.

## Đổi màu sắc / giao diện

Toàn bộ màu sắc nằm trong **1 file duy nhất**: `webdesign2026/css/color.css`, khai báo dạng CSS variable (`--color-...`). Đổi giá trị ở đây là đổi màu toàn site, không cần sửa từng section:

- `--color-primary` / `--color-primary-dark` / `--color-primary-light` - màu nhấn chính (cam), dùng cho tiêu đề, nút, icon, border nhấn
- `--color-surface` / `--color-surface-2` / `--color-surface-alt` - màu nền của `.page` và các card/box
- `--color-text` / `--color-text-muted` / `--color-text-subtle` - màu chữ theo mức độ nổi bật
- `--color-border` / `--color-shadow` / `--color-shadow-strong` - viền và đổ bóng

Muốn đổi font chữ: sửa link Google Fonts trong `index.html` (`<link ... family=Be+Vietnam+Pro...>`) và các khai báo `font-family` trong `css/style.css`.

Style riêng từng section (bố cục, kích thước, animation) nằm trong `sections/ten-section/ten-section.css`, không ảnh hưởng section khác.

## Tạo 1 hồ sơ proposal mới (ví dụ cho mùa giải sau)

Dự án này gắn với 1 mùa giải cụ thể (Web Design 2026). Muốn tái sử dụng cho mùa sau:

1. Copy nguyên thư mục `webdesign2026/` sang thư mục mới (ví dụ `webdesign2027/`), giữ nguyên cấu trúc bên trong.
2. Sửa `data/info.json` - đổi tên cuộc thi, năm, thông tin trường/CLB dùng chung.
3. Sửa lần lượt từng `sections/ten-section/*.json` (và `.md`) - nội dung, số liệu, ảnh của mùa mới. Không cần sửa `.js`/`.css` nếu bố cục giữ nguyên.
4. Thay ảnh trong từng `sections/ten-section/img/` bằng ảnh thật của mùa mới (xem mục bên dưới).
5. Section nào không còn cần (hoặc cần thêm mới) thì bỏ/thêm dòng tương ứng trong `js/init.js` (mảng `SECTIONS`) và link CSS trong `index.html` - xem hướng dẫn chi tiết thêm section mới tại [CONTRIBUTING.md](CONTRIBUTING.md#thêm-1-section-trang-mới).
6. Đổi `<title>`, mô tả OG/Twitter và favicon trong `index.html` nếu cần.

## Thay ảnh/logo

Ảnh/logo nằm trong `sections/ten-section/img/`. Thay file cùng tên (hoặc đổi đường dẫn trong `data/info.json` / `sections/ten-section/*.json`) khi có ảnh chính thức.
