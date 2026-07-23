const JSON_URL = "./sections/media-effectiveness/media-effectiveness.json";

async function fetchMediaEffectiveness() {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function renderHeading(heading) {
    if (!heading) return "";
    return `
        <h2 class="media-effectiveness__heading" data-animate="fadeInLeft">${heading}</h2>
    `;
}

function renderWindowCard(imgUrl, index, totalImages, galleryAttr, altText, animDelay) {
    const posClass = `media-effectiveness__card--pos-${index + 1}`;
    const countClass = `media-effectiveness__card--count-${totalImages}`;
    return `
        <div class="cwindow media-effectiveness__card ${countClass} ${posClass}" data-animate="fadeInUp" style="animation-delay: ${animDelay}s">
            <div class="cwindow__dot cwindow__dot--red"></div>
            <div class="cwindow__dot cwindow__dot--yellow"></div>
            <div class="cwindow__dot cwindow__dot--green"></div>
            <img src="${imgUrl || ""}" alt="${altText || "Ảnh truyền thông"}" data-lightbox='${galleryAttr}' data-lightbox-index="${index}">
        </div>
    `;
}

function renderPage(item, isFirstPage, data) {
    const images = item.images || [];
    const galleryAttr = JSON.stringify(images).replace(/'/g, "&#39;");
    const imageCount = images.length;
    const tocHeading = data.tocHeading || data.heading || "Hiệu quả truyền thông";
    const tocAttr = isFirstPage ? ` data-toc="${tocHeading}"` : "";

    const cardsHtml = images.map((img, idx) =>
        renderWindowCard(img, idx, imageCount, galleryAttr, item.title || item.heading || data.heading, (idx * 0.15 + 0.1).toFixed(2))
    ).join("");

    let infoBlockHtml = "";
    if (item.subheading || item.title) {
        infoBlockHtml = `
            <div class="media-effectiveness__info-block" data-animate="${imageCount === 2 ? "fadeInLeft" : "fadeInRight"}">
                ${item.subheading ? `<div class="media-effectiveness__subheading">${item.subheading}</div>` : ""}
                ${item.title ? `<div class="media-effectiveness__title">${item.title}</div>` : ""}
                ${item.description ? `<p class="media-effectiveness__description">${item.description}</p>` : ""}
            </div>
        `;
    }

    const mainHeading = item.heading || data.heading || "HIỆU QUẢ TRUYỀN THÔNG";

    return `
        <div class="page page--media-effectiveness page--media-effectiveness-${imageCount}-items"${tocAttr}>
            <div class="media-effectiveness__header">
                ${renderHeading(mainHeading)}
                ${imageCount !== 2 ? infoBlockHtml : ""}
            </div>

            <div class="media-effectiveness__stage media-effectiveness__stage--${imageCount}-items">
                ${cardsHtml}
                ${imageCount === 2 ? infoBlockHtml : ""}
            </div>
        </div>
    `;
}

export default async function initMediaEffectiveness(root) {
    const container = root.querySelector("#media-effectiveness");
    if (!container) return;

    let data;
    try {
        data = await fetchMediaEffectiveness();
    } catch (error) {
        console.error(`${JSON_URL} không load được!. ERR:${error.message}`);
        return;
    }

    const items = Array.isArray(data.pages)
        ? data.pages
        : Object.keys(data)
            .filter(key => typeof data[key] === "object" && data[key] !== null && !Array.isArray(data[key]))
            .map(key => data[key]);

    let html = "";
    items.forEach((item, index) => {
        html += renderPage(item, index === 0, data);
    });

    container.innerHTML = html;
}
