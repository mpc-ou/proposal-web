const JSON_URL = "./sections/webdesign-recap/webdesign-recap.json";

async function fetchRecap() {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function renderPage(pageEl, page) {
    if (!page) return;

    const labelEl = pageEl.querySelector("[data-recap-label]");
    if (labelEl) labelEl.textContent = page.label || "";

    const brandEl = pageEl.querySelector("[data-recap-brand]");
    if (brandEl) brandEl.textContent = page.brand || "";

    const titleEl = pageEl.querySelector("[data-recap-title]");
    if (titleEl) titleEl.textContent = page.title || "";

    const textEl = pageEl.querySelector("[data-recap-text]");
    if (textEl) textEl.textContent = page.text || "";

    const tagEl = pageEl.querySelector("[data-recap-tag]");
    if (tagEl) tagEl.innerHTML = `${page.tag || ""} <i class="bi bi-chevron-double-right"></i>`;

    const mediaEl = pageEl.querySelector("[data-recap-media]");
    if (mediaEl && Array.isArray(page.images)) {
        const gallery = JSON.stringify(page.images.map((img) => img.image));
        mediaEl.innerHTML = page.images
            .slice(0, 2)
            .map(
                (img, index) => `
                    <div class="recap__media-item recap__media-item--${index === 0 ? "primary" : "secondary"}">
                        <img
                            src="${img.image}"
                            alt="${img.alt || ""}"
                            data-lightbox='${gallery}'
                            data-lightbox-index="${index}"
                        >
                    </div>
                `
            )
            .join("");
    }
}

export async function loadDynamic(root) {
    let data;
    try {
        data = await fetchRecap();
    } catch (error) {
        console.error(`${JSON_URL} không load được!. ERR:${error.message}`);
        return;
    }

    root.querySelectorAll("[data-recap-page]").forEach((pageEl) => {
        const id = pageEl.getAttribute("data-recap-page");
        const page = (data.pages || []).find((p) => p.id === id);
        renderPage(pageEl, page);
    });
}
