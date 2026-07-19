# Đóng góp cho dự án

Cảm ơn bạn đã đóng góp cho proposal **Web Design 2026**. Tài liệu này quy định cách tổ chức thay đổi và commit message.

## Cấu trúc dự án

```
webdesign2026/
├── css/
│   ├── color.css                        # CHỈ chứa biến màu (:root), không có rule khác
│   └── style.css                        # Reset + typography + utility class + component dùng CHUNG
├── js/
│   ├── init.js                          # Nạp các section (theo thứ tự khai báo trong mảng SECTIONS)
│   ├── app.js                           # Config chung, đánh số trang, animation, zoom, nút In PDF
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
