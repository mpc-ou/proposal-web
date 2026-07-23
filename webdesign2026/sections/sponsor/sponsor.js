const JSON_URL = "./sections/sponsor/sponsor.json";

async function fetchSponsorData() {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function renderPackagesPage(packagesData, isFirstPage) {
    const tocAttr = isFirstPage ? ` data-toc="Quyền lợi tài trợ"` : "";
    const packages = packagesData.packages || [];

    const cardsHtml = packages.map((pkg, idx) => `
        <div class="sponsor-pkg-card ${pkg.colorClass || ""}" data-animate="fadeInRight" style="animation-delay: ${0.1 * idx + 0.1}s">
            <div class="sponsor-pkg-card__tier">${pkg.tier}</div>
            <div class="sponsor-pkg-card__amount">${pkg.amount}</div>
        </div>
    `).join("");

    return `
        <div class="page page--sponsor page--sponsor-packages"${tocAttr}>
            <div class="sponsor-packages__layout">
                <div class="sponsor-packages__left" data-animate="fadeInLeft">
                    <h2 class="sponsor-packages__title">
                        <span>${packagesData.titlePrefix || "Các Gói"}</span>
                        <span class="sponsor-packages__title-highlight">${packagesData.titleHighlight || "TÀI TRỢ"}</span>
                    </h2>
                    <div class="sponsor-packages__illustration">
                        <svg viewBox="0 0 120 120" class="sponsor-folder-icon">
                            <path fill="var(--color-primary)" d="M10 25C10 20.5817 13.5817 17 18 17H42C45.1818 17 48.0686 18.8954 49.3431 21.8137L52.8 30H102C106.418 30 110 33.5817 110 38V95C110 99.4183 106.418 103 102 103H18C13.5817 103 10 99.4183 10 95V25Z" opacity="0.15"/>
                            <path stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M12 28C12 23.5817 15.5817 20 20 20H42C44.5 20 46.8 21.4 48 23.6L52 32H100C104.418 32 108 35.5817 108 40V92C108 96.4183 104.418 100 100 100H20C15.5817 100 12 96.4183 12 92V28Z"/>
                            <path stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M60 48L78 57V72C78 84 60 92 60 92C60 92 42 84 42 72V57L60 48Z"/>
                            <path stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" fill="none" d="M52 69L57 74L68 63"/>
                        </svg>
                    </div>
                </div>

                <div class="sponsor-packages__right">
                    <div class="sponsor-cash-box">
                        <div class="sponsor-cash-header" data-animate="fadeInDown">
                            ${packagesData.cashTitle || "TÀI TRỢ HIỆN KIM"}
                        </div>
                        <div class="sponsor-cash-cards">
                            ${cardsHtml}
                        </div>
                    </div>

                    <div class="sponsor-inkind-box" data-animate="fadeInUp">
                        <div class="sponsor-inkind-bg">
                            ${packagesData.inKindTitle || "TÀI TRỢ HIỆN VẬT"}
                        </div>
                        <div class="sponsor-inkind-card">
                            <p>${packagesData.inKindPolicy || "NTT có thể tài trợ kết hợp cả hai hình thức hiện vật(30%) và hiện kim(70%)."}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function formatCellText(val) {
    if (!val) return "";
    if (val === "X") {
        return `<span class="sponsor-table__value-cell--check">X</span>`;
    }
    return val;
}

// Tự động gộp các ô kề nhau có nội dung giống nhau (Col-span mechanism)
function renderTierCells(row) {
    const gold = row.gold ? row.gold.trim() : "";
    const silver = row.silver ? row.silver.trim() : "";
    const bronze = row.bronze ? row.bronze.trim() : "";

    // 1. Cả 3 ô đều có nội dung giống nhau -> Gộp 3 cột (colspan="3")
    if (gold && gold === silver && silver === bronze) {
        return `<td class="sponsor-table__value-cell sponsor-table__value-cell--span-all" colspan="3">${formatCellText(gold)}</td>`;
    }

    // 2. Ô Vàng & Bạc giống nhau -> Gộp Vàng + Bạc (colspan="2")
    if (gold && gold === silver) {
        return `
            <td class="sponsor-table__value-cell sponsor-table__value-cell--span-2" colspan="2">${formatCellText(gold)}</td>
            <td class="sponsor-table__value-cell">${formatCellText(bronze)}</td>
        `;
    }

    // 3. Ô Bạc & Đồng giống nhau -> Gộp Bạc + Đồng (colspan="2")
    if (silver && silver === bronze) {
        return `
            <td class="sponsor-table__value-cell">${formatCellText(gold)}</td>
            <td class="sponsor-table__value-cell sponsor-table__value-cell--span-2" colspan="2">${formatCellText(silver)}</td>
        `;
    }

    // 4. Các ô có nội dung khác nhau -> Hiển thị 3 cột riêng
    return `
        <td class="sponsor-table__value-cell">${formatCellText(gold)}</td>
        <td class="sponsor-table__value-cell">${formatCellText(silver)}</td>
        <td class="sponsor-table__value-cell">${formatCellText(bronze)}</td>
    `;
}

function renderTableRow(row) {
    if (row.type === "full-span") {
        return `
            <tr>
                <td class="sponsor-table__label-cell">${row.label}</td>
                <td class="sponsor-table__value-cell sponsor-table__value-cell--span-all" colspan="3">${formatCellText(row.value)}</td>
            </tr>
        `;
    }

    return `
        <tr>
            <td class="sponsor-table__label-cell">${row.label}</td>
            ${renderTierCells(row)}
        </tr>
    `;
}

function renderBenefitTablePage(pageData) {
    const headers = pageData.headers || ["QUYỀN LỢI NHÀ TÀI TRỢ", "VÀNG", "BẠC", "ĐỒNG"];
    const rowsHtml = (pageData.rows || []).map(row => renderTableRow(row)).join("");

    let notesHtml = "";
    if (Array.isArray(pageData.notes) && pageData.notes.length > 0) {
        const listItems = pageData.notes.map(note => `<li>${note}</li>`).join("");
        notesHtml = `
            <div class="sponsor-notes-wrapper" data-animate="fadeInUp">
                <ul class="sponsor-notes-list">
                    ${listItems}
                </ul>
            </div>
        `;
    }

    const wrapperClass = pageData.notes ? "sponsor-table-wrapper sponsor-table-wrapper--compact" : "sponsor-table-wrapper";

    return `
        <div class="page page--sponsor page--sponsor-benefits">
            <h2 class="sponsor-benefit__title" data-animate="fadeInDown">
                <span>${pageData.titlePrefix || "QUYỀN LỢI NHÀ TÀI TRỢ"}</span>
                <span class="sponsor-benefit__title-highlight">${pageData.titleHighlight || pageData.category || "CƠ BẢN"}</span>
            </h2>

            <div class="${wrapperClass}" data-animate="fadeInUp">
                <table class="sponsor-table">
                    <thead>
                        <tr>
                            <th class="sponsor-table__th sponsor-table__th--label">${headers[0]}</th>
                            <th class="sponsor-table__th sponsor-table__th--gold">${headers[1]}</th>
                            <th class="sponsor-table__th sponsor-table__th--silver">${headers[2]}</th>
                            <th class="sponsor-table__th sponsor-table__th--bronze">${headers[3]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>

            ${notesHtml}
        </div>
    `;
}

// Cơ chế ngắt trang tự động (Auto-chunking mechanism)
function chunkBenefitRows(rows, maxRowsPerPage = 4) {
    const pages = [];
    for (let i = 0; i < rows.length; i += maxRowsPerPage) {
        pages.push(rows.slice(i, i + maxRowsPerPage));
    }
    return pages;
}

export default async function initSponsor(root) {
    const container = root.querySelector("#sponsor");
    if (!container) return;

    let data;
    try {
        data = await fetchSponsorData();
    } catch (error) {
        console.error(`${JSON_URL} không load được!. ERR:${error.message}`);
        return;
    }

    let html = "";

    // 1. Render Packages Page (Page 1: Các gói tài trợ)
    if (data.packagesPage) {
        html += renderPackagesPage(data.packagesPage, true);
    }

    // 2. Render Benefit Pages (Pages 2+) with auto-chunking mechanism & col-span merging
    if (Array.isArray(data.benefitPages) && data.benefitPages.length > 0) {
        data.benefitPages.forEach(page => {
            const rows = page.rows || [];
            if (rows.length > 4) {
                const chunkedRows = chunkBenefitRows(rows, 4);
                chunkedRows.forEach((rowChunk, idx) => {
                    const subPageData = {
                        ...page,
                        id: `${page.id}-${idx + 1}`,
                        rows: rowChunk
                    };
                    html += renderBenefitTablePage(subPageData);
                });
            } else {
                html += renderBenefitTablePage(page);
            }
        });
    }

    container.innerHTML = html;
}
