import { renderMarkdown, fetchMarkdown } from "../../js/markdown-utils.js";

const MD_URL = "./sections/introduction-to-faculty/introduction-to-faculty.md";
const FACULTY_URL = "./sections/introduction-to-faculty/faculty.json";

async function fetchFaculty() {
    const res = await fetch(FACULTY_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function setText(root, selector, value) {
    const el = root.querySelector(selector);
    if (el) el.textContent = value || "";
}

function setImage(root, selector, src, alt) {
    const el = root.querySelector(selector);
    if (!el) return;
    el.src = src || "";
    el.alt = alt || "";
    el.setAttribute("data-lightbox", JSON.stringify([src]));
    el.setAttribute("data-lightbox-index", "0");
}

function renderStats(root, stats) {
    const el = root.querySelector("[data-faculty-stats]");
    if (!el || !Array.isArray(stats)) return;
    el.innerHTML = stats
        .map(
            (stat) => `
                <li>
                    <span class="faculty__stats-value">${stat.value}</span>
                    <span class="faculty__stats-label">${stat.label}</span>
                </li>
            `
        )
        .join("");
}

function renderContact(root, contact) {
    const el = root.querySelector("[data-faculty-contact]");
    if (!el || !contact) return;
    el.innerHTML = Object.values(contact)
        .map((item) => {
            const inner = `<i class="bi ${item.icon || "bi-info-circle"}"></i><span>${item.text}</span>`;
            return item.url
                ? `<a class="faculty__contact-item" href="${item.url}" target="_blank" rel="noopener">${inner}</a>`
                : `<span class="faculty__contact-item">${inner}</span>`;
        })
        .join("");
}

export default async function initIntroductionToFaculty(root) {
    let faculty;
    try {
        faculty = await fetchFaculty();
    } catch (error) {
        console.error(`${FACULTY_URL} không load được!. ERR:${error.message}`);
        return;
    }

    setText(root, "[data-faculty-tag]", faculty.tag);
    setImage(root, "[data-faculty-image]", faculty.image, faculty.imageAlt);
    setText(root, "[data-faculty-eyebrow]", faculty.eyebrow);
    setText(root, "[data-faculty-heading]", faculty.heading);

    renderStats(root, faculty.stats);
    renderContact(root, faculty.contact);

    const overviewEl = root.querySelector("[data-faculty-overview]");

    try {
        const markdown = await fetchMarkdown(MD_URL);
        overviewEl.innerHTML = renderMarkdown(markdown);
    } catch (error) {
        if (overviewEl) {
            overviewEl.innerHTML = `<p>Không tải được nội dung giới thiệu (${error.message}).</p>`;
        }
        console.error(`${MD_URL} không load được!. ERR:${error.message}`);
    }
}
