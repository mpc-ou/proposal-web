# Đóng góp cho dự án

Cảm ơn bạn đã đóng góp cho proposal **Web Design 2026**. Tài liệu này quy định cách tổ chức thay đổi và commit message.

## Mục lục

- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Thêm 1 section (trang) mới](#thêm-1-section-trang-mới)
- [Dùng lightbox xem ảnh phóng to](#dùng-lightbox-xem-ảnh-phóng-to)
- [Đánh số trang & mục lục điều hướng](#đánh-số-trang--mục-lục-điều-hướng)
- [Chạy thử local](#chạy-thử-local)
- [Conventional Commits 1.0.0](#conventional-commits-100)
- [Pull Request](#pull-request)

## Cấu trúc dự án

```
webdesign2026/
├── css/
│   ├── color.css                        # CHỈ chứa biến màu (:root), không có rule khác
│   └── style.css                        # Reset + typography + utility class + component dùng CHUNG
├── js/
│   ├── init.js                          # Nạp các section (theo thứ tự khai báo trong mảng SECTIONS)
│   ├── app.js                           # Config chung, đánh số trang, animation, zoom, nút In PDF, lưu vị trí cuộn
│   ├── lightbox.js                      # Overlay xem ảnh phóng to, dùng CHUNG (xem "Dùng lightbox" bên dưới)
│   └── markdown-utils.js                # Helper fetch + render markdown, dùng chung
├── data/
│   └── info.json                        # Dữ liệu CHUNG (site, titlePage, letter, footer)
├── sections/                            # 1 thư mục = 1 section = 1 "trang", gộp đủ html+css+js+data+img riêng
│   ├── title-page/
│   │   ├── title-page.html
│   │   ├── title-page.css
│   │   ├── title-page.js
│   │   └── img/                         # logo... chỉ dùng cho trang này
│   ├── open-letter-page/
│   │   ├── open-letter-page.html
│   │   ├── open-letter-page.css
│   │   ├── open-letter-page.js
│   │   └── open-letter-page.md          # đoạn văn dài (thư ngỏ)
│   └── introduction-to-school/
│       ├── introduction-to-school.html
│       ├── introduction-to-school.css
│       ├── introduction-to-school.js
│       ├── introduction-to-school.md    # đoạn văn dài (tổng quan trường)
│       ├── school.json                  # dữ liệu có cấu trúc riêng section này (stats, majors...)
│       └── img/
└── index.html
```

**Quy tắc quan trọng:** `css/`, `js/`, `data/` ở top-level CHỈ chứa file dùng chung cho toàn site. Bất cứ thứ gì (CSS, JS, data, ảnh) chỉ phục vụ riêng 1 section thì nằm trong `sections/ten-section/`, cùng thư mục với file HTML của section đó — khi sửa 1 section chỉ cần mở đúng 1 thư mục.

**Sửa nội dung (chữ, số liệu, thư ngỏ...)** thì sửa trong `data/info.json` (dữ liệu chung) hoặc trong thư mục `sections/ten-section/` (dữ liệu/markdown riêng section), không sửa trực tiếp trong HTML.

## Thêm 1 section (trang) mới

Mỗi section là 1 to A4 nằm ngang (`.page`, tỉ lệ 297:210, kích thước gốc 1920x1358px — xem `css/style.css`). Các bước thêm section mới, ví dụ tên `sponsor-benefits`:

1. **Tạo thư mục** `sections/sponsor-benefits/`.

2. **Tạo `sponsor-benefits.html`** trong thư mục đó:

   ```html
   <section id="section-sponsor-benefits">
       <div class="page page--sponsor-benefits">
           <h2 data-animate="fadeIn">Tiêu đề</h2>
           <!-- Noi dung, dung [data-ten-truong] lam hook de JS gan du lieu vao -->
       </div>
   </section>
   ```

   - KHÔNG tự viết `<span class="page-number">` — `js/app.js` tự động thêm vào mỗi `.page`. Nếu trang này không cần đánh số (như trang bìa) thì thêm `data-no-page-number` vào `.page`.
   - Muốn phần tử nào xuất hiện có animation khi cuộn tới thì thêm `data-animate="ten-hieu-ung"` (tên hiệu ứng lấy từ [animate.css](https://animate.style/), ví dụ `fadeIn`, `fadeInLeft`, `zoomIn`...).

3. **Tạo `sponsor-benefits.css`** trong cùng thư mục — style riêng cho `.page--sponsor-benefits` (bố cục bên trong page, không cần khai báo lại `.page` gốc vì đã có ở `css/style.css`).

4. **Tạo `sponsor-benefits.js`** trong cùng thư mục, export 1 hàm mặc định nhận `(root)` hoặc `(root, data)`:

   ```js
   export default async function initSponsorBenefits(root, data) {
       // Du lieu dung chung (site, titlePage, letter, footer) nam trong tham so `data`.
       // Neu section can data/markdown rieng, tu fetch ngay trong day, vi du:
       // const res = await fetch("./sections/sponsor-benefits/data.json");
   }
   ```

   **Bắt buộc `async` + `await` đầy đủ mọi `fetch`/promise bên trong:** `js/init.js` gọi tuần tự `await mod.default(wrapper, data)` cho từng section, và chỉ bắn sự kiện `sections:loaded` sau khi TẤT CẢ section đã init xong. Đánh số trang, animation cuộn, đánh số ô trang cạnh zoom, mục lục (xem [Đánh số trang & mục lục điều hướng](#đánh-số-trang--mục-lục-điều-hướng)) đều chạy dựa vào sự kiện này. Nếu hàm init của bạn quên `await` một `fetch`/promise nào đó, HTML section sẽ chưa kịp đổ dữ liệu lúc `sections:loaded` bắn ra — animation không bắt được phần tử, số trang/mục lục sai hoặc thiếu.

5. **Thêm data riêng (nếu cần)** cùng thư mục: `*.json` cho dữ liệu có cấu trúc, `*.md` cho đoạn văn dài — dùng lại `fetchMarkdown`/`renderMarkdown` từ `js/markdown-utils.js` (import bằng đường dẫn tương đối `../../js/markdown-utils.js`).

6. **Đăng ký CSS** trong `index.html`:

   ```html
   <link rel="stylesheet" href="./sections/sponsor-benefits/sponsor-benefits.css">
   ```

7. **Đăng ký section** trong `js/init.js`, thêm vào đúng vị trí (thứ tự) mong muốn trong mảng `SECTIONS`:

   ```js
   { html: "./sections/sponsor-benefits/sponsor-benefits.html", module: "../sections/sponsor-benefits/sponsor-benefits.js" },
   ```

   Lưu ý: `html` là đường dẫn cho `fetch()` (tính từ `index.html`), còn `module` là đường dẫn cho `import()` (tính từ vị trí file `js/init.js`, nên luôn có tiền tố `../`).

8. Chạy thử qua local server, kiểm tra: section load đúng thứ tự (xem console), số trang tự động đúng, animation chạy khi cuộn tới, và bấm "In PDF" (hoặc Ctrl+P) ra đủ trang không vỡ layout.

**Lưu ý khi in (PDF bị co nhỏ dồn về góc trên-trái):** class gốc đặt trên `.page` (vd `.page--sponsor-benefits`) sẽ được `app.js` gộp vào `.page__inner` lúc chạy — do đó **không khai báo lại `width`/`height` cho class đó**. `style.css` đã tự set kích thước đúng cho `.page__inner` (100% lúc xem thường, cố định 1920x1358px lúc `@media print`); vì CSS riêng của section luôn nạp SAU `style.css` trong `index.html`, một rule `width/height:100%` trùng độ đặc hiệu ở đây sẽ THẮNG rule in ở `style.css`, làm nội dung tự co theo khổ giấy rồi bị scale in đè thêm 1 lần nữa.

**Ghi chú:** 1 section không nhất thiết phải cố định 1 `.page` — có thể render nhiều `.page` liên tiếp từ 1 file data, sinh động bằng JS (xem ví dụ `sections/exhibitions/exhibitions.js`: mỗi lần tổ chức cuộc thi là 1 nhóm, mỗi nhóm được chia thành nhiều trang, mỗi trang 2 dự án). Vẫn tuân thủ quy tắc chung: JS build chuỗi HTML rồi gán 1 lần vào khối chứa (`innerHTML`), không tự đánh `page-number` (JS trong `app.js` tự thêm sau khi toàn bộ section đã load xong).

## Dùng lightbox xem ảnh phóng to

`js/lightbox.js` là overlay xem ảnh dùng CHUNG cho mọi section, không cần import hay khởi tạo gì thêm (đã được gọi 1 lần trong `app.js`). Muốn ảnh trong section của bạn bấm vào phóng to được:

1. Gắn thuộc tính `data-lightbox` lên thẻ `<img>`, giá trị là 1 mảng JSON các đường dẫn ảnh (dùng khi muốn cho chuyển ảnh trước/sau ngay trong overlay). Nếu chỉ có 1 ảnh, để mảng 1 phần tử.

   ```html
   <img
       src="./sections/ten-section/img/anh-01.png"
       alt="Mô tả ảnh"
       data-lightbox='["./sections/ten-section/img/anh-01.png", "./sections/ten-section/img/anh-02.png"]'
       data-lightbox-index="0"
   >
   ```

2. `data-lightbox-index` (tuỳ chọn, mặc định `0`) là vị trí ảnh sẽ hiện đầu tiên khi mở overlay — dùng khi ảnh đang hiện trên trang không phải phần tử đầu của mảng.

3. Khi build HTML bằng JS (như `exhibitions.js`), nhớ `JSON.stringify()` mảng ảnh rồi gán vào thuộc tính `data-lightbox` (bọc bằng dấu nháy đơn `'...'` vì `JSON.stringify` dùng dấu nháy kép).

Overlay tự lo: đóng bằng nút X/phím `Esc`/bấm ra ngoài, zoom bằng lăn chuột hoặc nút +-/double-click, kéo ảnh khi đã zoom, chuyển ảnh trước/sau bằng nút hoặc phím mũi tên (chỉ hiện khi mảng có > 1 ảnh). Không cần style hay xử lý gì thêm phía section.

## Đánh số trang & mục lục điều hướng

`js/app.js` tự lo 2 việc này sau khi tất cả section đã load xong (`sections:loaded`), không cần đụng vào code chung:

- **Đánh số trang** (`.page-number` ở góc mỗi `.page`, và ô "x / y" cạnh nút zoom góc dưới-trái) tự tính theo đúng thứ tự các `.page` có trong DOM — trang nào không cần đánh số (như trang bìa) thì thêm `data-no-page-number`.
- **Mục lục** (tab thu gọn ở cạnh phải, bấm vào mở panel) chỉ liệt kê các `.page` có gắn thuộc tính `data-toc="Nhãn hiển thị"`. Cố tình KHÔNG tự quét `h1`-`h4` để lấy tiêu đề, vì nhiều trang có thể trùng heading hoặc không có heading rõ ràng — bạn tự quyết trang nào đáng vào mục lục và nhãn hiển thị gì.

Muốn 1 trang xuất hiện trong mục lục, gắn thẳng lên `.page`:

```html
<div class="page page--sponsor-benefits" data-toc="Quyền lợi tài trợ">
```

Với section render nhiều `.page` bằng JS (như `exhibitions.js`), chỉ gắn `data-toc` cho **trang đầu tiên** của mỗi nhóm để tránh mục lục bị lặp nhiều mục giống nhau — xem cách `exhibitions.js` chỉ gắn khi `isFirstPage` là `true`.

## Chạy thử local

Vì các trang được nạp bằng `fetch()`, bạn phải chạy qua HTTP server (không mở trực tiếp file `index.html` bằng `file://`). Ví dụ:

```bash
npx serve webdesign2026
# hoặc dùng extension Live Server của VS Code
```

## Conventional Commits 1.0.0

Repo này tuân theo chuẩn [Conventional Commits 1.0.0](https://www.conventionalcommits.org/vi/v1.0.0/).

```
<type>(<scope>): <mô tả ngắn>

[nội dung chi tiết - tuỳ chọn]

[footer - tuỳ chọn]
```

### Type

| Type       | Ý nghĩa                                              |
| ---------- | ----------------------------------------------------- |
| `feat`     | Thêm tính năng/trang mới                               |
| `fix`      | Sửa lỗi                                                |
| `docs`     | Thay đổi tài liệu (README, CONTRIBUTING...)            |
| `style`    | Thay đổi format/CSS không ảnh hưởng logic              |
| `refactor` | Tái cấu trúc code, không đổi hành vi                   |
| `perf`     | Cải thiện hiệu năng                                    |
| `test`     | Thêm/sửa test                                          |
| `build`    | Thay đổi build tool, dependency                        |
| `ci`       | Thay đổi cấu hình CI/CD                                |
| `chore`    | Việc lặt vặt khác (không sửa src hay test)              |
| `revert`   | Revert lại 1 commit trước đó                           |

### Scope (gợi ý, không bắt buộc)

Dùng tên section hoặc thư mục bị ảnh hưởng: `title-page`, `open-letter-page`, `introduction-to-school`, `css`, `js`, `data`, `index`.

### Breaking change

Thêm `!` sau type/scope hoặc thêm footer `BREAKING CHANGE: <mô tả>` khi thay đổi phá vỡ cấu trúc data/HTML mà section khác đang phụ thuộc vào.

### Ví dụ

```
feat(introduction-to-school): thêm số liệu giảng viên vào trang giới thiệu trường

fix(open-letter-page): sửa lỗi marked.js không parse được đoạn có dấu *

docs: cập nhật hướng dẫn chạy local server trong README

style(css): chuẩn hoá spacing trong style.css theo thang 0.5rem

refactor(js): tách logic render logo ra khỏi title-page.js

chore: cập nhật PR template
```

## Pull Request

- Dùng template PR có sẵn, điền đầy đủ checklist.
- 1 PR nên tập trung vào 1 thay đổi (1 section hoặc 1 loại việc), tránh gộp nhiều việc không liên quan.
- Đảm bảo đã test bằng local server và kiểm tra tính năng In PDF không vỡ layout trước khi tạo PR.
