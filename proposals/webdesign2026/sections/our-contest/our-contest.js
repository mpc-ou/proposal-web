const JSON_URL = "./sections/our-contest/our-contest.json";

async function fetchOurContest() {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function setText(root, selector, value) {
    const el = root.querySelector(selector);
    if (el) el.textContent = value || "";
}

function renderHeader(root, header) {
    if (!header) return;
    setText(root, "[data-oc-label]", header.label);
    setText(root, "[data-oc-org]", header.org);
}

function renderGalleryMedia(root, tagSelector, imageSelector, data) {
    if (!data) return;
    const tagEl = root.querySelector(tagSelector);
    if (tagEl) {
        tagEl.innerHTML = `${data.tag || ""} <i class="bi bi-chevron-double-right"></i>`;
    }
    const imageEl = root.querySelector(imageSelector);
    if (!imageEl || !Array.isArray(data.images) || data.images.length === 0) return;

    const [first] = data.images;
    const gallery = JSON.stringify(data.images.map((img) => img.image));
    imageEl.src = first.image || "";
    imageEl.alt = first.alt || "";
    imageEl.setAttribute("data-lightbox", gallery);
    imageEl.setAttribute("data-lightbox-index", "0");
}

export async function loadDynamic(root) {
    let data;
    try {
        data = await fetchOurContest();
    } catch (error) {
        console.error(`${JSON_URL} không load được!. ERR:${error.message}`);
        return;
    }

    renderHeader(root, data.header);
    renderGalleryMedia(root, "[data-oc-robocode-tag]", "[data-oc-robocode-image]", data.robocode);
    renderGalleryMedia(root, "[data-oc-photo-tag]", "[data-oc-photo-image]", data.photo);
    setText(root, "[data-oc-feeling]", data.feeling);
}
