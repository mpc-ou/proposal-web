import { renderMarkdown, fetchMarkdown } from "../../js/markdown-utils.js";

const JSON_URL = "./sections/organizing-resources/organizing-resources.json";

async function fetchConfig() {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export default async function initOrganizingResources(root) {
    const container = root.querySelector("#organizing-resources");
    if (!container) return;

    let config = { images: [] };
    try {
        config = await fetchConfig();
    } catch (error) {
        console.error(`${JSON_URL} không load được!. ERR:${error.message}`);
    }

    const mdUrl = config.mdUrl || "./sections/organizing-resources/organizing-resources.md";
    let markdown = "";
    try {
        markdown = await fetchMarkdown(mdUrl);
    } catch (error) {
        console.error(`${mdUrl} không load được!. ERR:${error.message}`);
        markdown = "Không tải được nội dung.";
    }

    const htmlContent = renderMarkdown(markdown);
    const images = config.images || [];

    const allImgsJson = JSON.stringify(images.map(item => item.img || "")).replace(/'/g, "&#39;");

    const galleryHtml = images.map((item, idx) => `
        <div class="cwindow organizing-resources__photo-card" data-animate="fadeInUp" style="animation-delay: ${0.15 * idx + 0.2}s">
            <div class="cwindow__dot cwindow__dot--red"></div>
            <div class="cwindow__dot cwindow__dot--yellow"></div>
            <div class="cwindow__dot cwindow__dot--green"></div>
            <div class="organizing-resources__img-wrapper">
                <img src="${item.img || ""}" alt="${item.caption || `Ảnh ${idx + 1}`}" data-lightbox='${allImgsJson}' data-lightbox-index="${idx}">
            </div>
            ${item.caption ? `<div class="organizing-resources__caption">${item.caption}</div>` : ""}
        </div>
    `).join("");

    container.innerHTML = `
        <div class="page page--organizing-resources" data-toc="${config.tocHeading || "Nguồn lực tổ chức"}">
            <div class="organizing-resources__layout">
                
                <div class="organizing-resources__left" data-animate="fadeInLeft">
                    <h2 class="organizing-resources__title">
                        <span>${config.titlePrefix || "NGUỒN LỰC"}</span>
                        <span class="organizing-resources__title-highlight">${config.titleHighlight || "TỔ CHỨC"}</span>
                    </h2>

                    <div class="organizing-resources__card">
                        <div class="organizing-resources__text">
                            ${htmlContent}
                        </div>
                    </div>
                </div>

                <div class="organizing-resources__right" data-animate="fadeInRight">
                    <div class="organizing-resources__gallery">
                        ${galleryHtml}
                    </div>
                </div>

            </div>
        </div>
    `;
}
