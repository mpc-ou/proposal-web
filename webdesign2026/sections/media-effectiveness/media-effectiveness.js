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

function renderStatList(stats) {
    return (stats || []).map((stat) => `<li>${stat}</li>`).join("");
}

function renderStatsPage(item, tocAttr) {
    const cardsHtml = (item.cards || [])
        .map(
            (card) => `
                <div class="stat-card stat-card--secondary" data-animate="fadeInRight">
                    <h4 class="stat-card__title">${card.title || ""}</h4>
                    <ul class="stat-card__list">${renderStatList(card.stats)}</ul>
                </div>
            `
        )
        .join("");

    const main = item.mainCard || {};

    const fanpage = item.fanpage;
    const bannerHtml = fanpage
        ? `
            <div class="media-effectiveness__stats-banner fb-mock" data-animate="fadeInDown">
                <div class="fb-mock__cover" style="background-image:url('${fanpage.cover || ""}')"></div>
                <div class="fb-mock__profile">
                    <div class="fb-mock__avatar" style="background-image:url('${fanpage.avatar || ""}')"></div>
                    <div class="fb-mock__info">
                        <a href="${fanpage.url || "#"}" target="_blank">
                            <h4 class="fb-mock__name">
                                ${fanpage.name || ""}
                            </h4>
                        </a>
                        <div class="fb-mock__meta">${fanpage.meta || ""}</div>
                        <div class="fb-mock__desc">${(fanpage.descriptionLines || []).join("<br>")}</div>
                    </div>
                </div>
            </div>
        `
        : "";

    return `
        <div class="page page--media-effectiveness page--media-effectiveness-stats"${tocAttr}>
            <div class="media-effectiveness__stats-header" data-animate="fadeInDown">
                ${renderHeading(item.heading || "HIỆU QUẢ TRUYỀN THÔNG")}
            </div>
            <h3 class="media-effectiveness__stats-subheading" data-animate="fadeInDown">${item.subheading || ""}</h3>

            <div class="media-effectiveness__stats-grid">
                ${bannerHtml}
                <div class="stat-card stat-card--main" data-animate="fadeInLeft">
                    <h4 class="stat-card__title"><i class="bi ${main.icon || "bi-facebook"}"></i> ${main.title || ""}</h4>
                    <ul class="stat-card__list">${renderStatList(main.stats)}</ul>
                </div>
                <div class="media-effectiveness__stats-side">
                    ${cardsHtml}
                </div>
            </div>
        </div>
    `;
}

function renderPage(item, isFirstPage, data) {
    const images = item.images || [];
    const galleryAttr = JSON.stringify(images).replace(/'/g, "&#39;");
    const imageCount = images.length;
    const tocHeading = data.tocHeading || data.heading || "Hiệu quả truyền thông";
    const tocAttr = item.toc
        ? ` data-toc="${item.toc}"`
        : isFirstPage
            ? ` data-toc="${tocHeading}"`
            : "";

    if (item.type === "stats") {
        return renderStatsPage(item, tocAttr);
    }

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
