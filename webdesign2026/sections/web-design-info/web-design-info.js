import { renderMarkdown, fetchMarkdown } from "../../js/markdown-utils.js";

const JSON_URL = "./sections/web-design-info/web-design-info.json";
const DESCRIPTION_MD_URL = "./sections/web-design-info/description.md";
const THEME_MD_URL = "./sections/web-design-info/contest-theme.md";

async function fetchWebDesignInfo() {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function setText(root, selector, value) {
    root.querySelectorAll(selector).forEach((el) => {
        el.textContent = value || "";
    });
}

function renderHeader(root, header) {
    if (!header) return;
    setText(root, "[data-wdi-subtitle]", header.subtitle);
    setText(root, "[data-wdi-title]", header.title);
}

function renderIntro(root, intro) {
    if (!intro) return;
    const imageEl = root.querySelector("[data-wdi-image]");
    if (imageEl) {
        imageEl.src = intro.image || "";
        imageEl.alt = intro.imageAlt || "";
        imageEl.setAttribute("data-lightbox", JSON.stringify([intro.image || ""]));
    }
    setText(root, "[data-wdi-card-title]", intro.cardTitle);

    const listEl = root.querySelector("[data-wdi-info-list]");
    if (listEl && Array.isArray(intro.infoList)) {
        listEl.innerHTML = intro.infoList
            .map(
                (item) => `
                    <li>
                        <span class="label">${item.label || ""}</span>
                        <span class="value">${item.value || ""}</span>
                    </li>
                `
            )
            .join("");
    }
}

function renderCriteria(root, criteria) {
    if (!criteria) return;
    setText(root, "[data-wdi-criteria-section-title]", criteria.sectionTitle);
    setText(root, "[data-wdi-criteria-intro]", criteria.intro);
    setText(root, "[data-wdi-criteria-footer]", criteria.footerNote);
    setText(root, "[data-wdi-theme-title]", criteria.themeTitle);
    setText(root, "[data-wdi-participation-title]", criteria.participationTitle);

    const listEl = root.querySelector("[data-wdi-criteria-list]");
    if (listEl && Array.isArray(criteria.list)) {
        listEl.innerHTML = criteria.list.map((item) => `<li>${item}</li>`).join("");
    }

    const participationEl = root.querySelector("[data-wdi-participation-list]");
    if (participationEl && Array.isArray(criteria.participation)) {
        participationEl.innerHTML = criteria.participation
            .map(
                (item) => `<li><strong>- ${item.label || ""}</strong> ${item.text || ""}</li>`
            )
            .join("");
    }
}

function renderRules(root, finalRules) {
    if (!finalRules) return;
    setText(root, "[data-wdi-rules-section-title]", finalRules.sectionTitle);

    const listEl = root.querySelector("[data-wdi-rules-list]");
    if (listEl && Array.isArray(finalRules.list)) {
        listEl.innerHTML = finalRules.list.map((item) => `<li>${item}</li>`).join("");
    }
}

async function renderMarkdownInto(root, selector, url) {
    const el = root.querySelector(selector);
    if (!el) return;
    try {
        const markdown = await fetchMarkdown(url);
        el.innerHTML = renderMarkdown(markdown);
    } catch (error) {
        el.innerHTML = `<p>Không tải được nội dung (${error.message}).</p>`;
        console.error(`${url} không load được!. ERR:${error.message}`);
    }
}

export default async function initWebDesignInfo(root) {
    let data;
    try {
        data = await fetchWebDesignInfo();
    } catch (error) {
        console.error(`${JSON_URL} không load được!. ERR:${error.message}`);
        return;
    }

    renderHeader(root, data.header);
    renderIntro(root, data.intro);
    renderCriteria(root, data.criteria);
    renderRules(root, data.finalRules);

    await Promise.all([
        renderMarkdownInto(root, "[data-wdi-description]", DESCRIPTION_MD_URL),
        renderMarkdownInto(root, "[data-wdi-theme-text]", THEME_MD_URL),
    ]);
}
