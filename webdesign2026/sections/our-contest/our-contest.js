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

function renderRobocode(root, robocode) {
    if (!robocode) return;
    const tagEl = root.querySelector("[data-oc-robocode-tag]");
    if (tagEl) {
        tagEl.innerHTML = `${robocode.tag || ""} <i class="bi bi-chevron-double-right"></i>`;
    }
    const imageEl = root.querySelector("[data-oc-robocode-image]");
    if (imageEl) {
        imageEl.src = robocode.image || "";
        imageEl.alt = robocode.imageAlt || "";
    }
}

function renderPhoto(root, photo) {
    if (!photo) return;
    const tagEl = root.querySelector("[data-oc-photo-tag]");
    if (tagEl) {
        tagEl.innerHTML = `${photo.tag || ""} <i class="bi bi-chevron-double-right"></i>`;
    }
    const imageEl = root.querySelector("[data-oc-photo-image]");
    if (imageEl) {
        imageEl.src = photo.image || "";
        imageEl.alt = photo.imageAlt || "";
    }
}

export default async function initOurContest(root) {
    let data;
    try {
        data = await fetchOurContest();
    } catch (error) {
        console.error(`${JSON_URL} không load được!. ERR:${error.message}`);
        return;
    }

    renderHeader(root, data.header);
    renderRobocode(root, data.robocode);
    renderPhoto(root, data.photo);
    setText(root, "[data-oc-feeling]", data.feeling);
}
