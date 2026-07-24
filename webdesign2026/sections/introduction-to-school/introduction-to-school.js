import { renderMarkdown, fetchMarkdown } from "../../js/markdown-utils.js";

const MD_URL = "./sections/introduction-to-school/introduction-to-school.md";
const SCHOOL_URL = "./sections/introduction-to-school/school.json";

async function fetchSchool() {
    const res = await fetch(SCHOOL_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function setText(root, selector, value) {
    const el = root.querySelector(selector);
    if (el) el.textContent = value || "";
}

function setHTML(root, selector, value) {
    const el = root.querySelector(selector);
    if (el) el.innerHTML = value || "";
}

function setImage(root, selector, src, alt) {
    const el = root.querySelector(selector);
    if (!el) return;
    el.src = src || "";
    el.alt = alt || "";
}

export default async function initIntroductionToSchool(root) {
    let school;
    try {
        school = await fetchSchool();
    } catch (error) {
        console.error(`${SCHOOL_URL} không load được!. ERR:${error.message}`);
        return;
    }

    setText(root, "[data-school-tag]", school.tag);
    setImage(root, "[data-school-image]", school.image, school.imageAlt);
    setText(root, "[data-school-eyebrow]", school.eyebrow);
    setText(root, "[data-school-heading]", school.heading);

    setText(root, "[data-school-eyebrow-2]", school.eyebrow);
    setText(root, "[data-school-heading-2]", school.heading);

    const majorsEl = root.querySelector("[data-school-majors]");
    if (majorsEl && Array.isArray(school.majors)) {
        majorsEl.innerHTML = school.majors
            .map((major) => `<li>${major}</li>`)
            .join("");
    }

    const statsEl = root.querySelector("[data-school-stats]");
    if (statsEl && Array.isArray(school.stats)) {
        statsEl.innerHTML = school.stats
            .map((stat) => `<li>${stat.value} ${stat.label}</li>`)
            .join("");
    }

    setImage(root, "[data-school-stats-image]", school.statsImage, school.statsImageAlt);
    setHTML(root, "[data-school-source]", renderMarkdown(school.source));

    const overviewEl = root.querySelector("[data-school-overview]");
    const summaryEl = root.querySelector("[data-school-summary]");

    try {
        const markdown = await fetchMarkdown(MD_URL);
        const html = renderMarkdown(markdown);
        const temp = document.createElement("div");
        temp.innerHTML = html;
        const paragraphs = temp.querySelectorAll("p");

        if (overviewEl) overviewEl.innerHTML = paragraphs[0] ? paragraphs[0].innerHTML : "";
        if (summaryEl) summaryEl.innerHTML = paragraphs[1] ? paragraphs[1].innerHTML : "";
    } catch (error) {
        if (overviewEl) {
            overviewEl.innerHTML = `<p>Không tải được nội dung giới thiệu (${error.message}).</p>`;
        }
        console.error(`${MD_URL} không load được!. ERR:${error.message}`);
    }
}
