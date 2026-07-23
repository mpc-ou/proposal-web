import { renderMarkdown } from "../../js/markdown-utils.js";

const JSON_URL = "./sections/timeline/timeline.json";

async function fetchTimeline() {
    const res = await fetch(JSON_URL);
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
}

function inlineMarkdown(text) {
    if (!text) return "";
    const html = renderMarkdown(text).trim();
    return html.replace(/^<p>([\s\S]*)<\/p>$/, "$1");
}

function renderMilestones(root, milestones) {
    const el = root.querySelector("[data-timeline-track]");
    if (!el || !Array.isArray(milestones)) return;
    el.innerHTML = milestones
        .map(
            (item, index) => `
                <div class="timeline__item" data-animate="fadeInUp" style="animation-delay:${index * 0.1}s">
                    <div class="timeline__card">
                        <div class="timeline__card-head">
                            <i class="bi ${item.icon || "bi-flag"}"></i>
                            <span class="timeline__date">${item.date || ""}</span>
                        </div>
                        <p class="timeline__text">
                            ${item.label ? `<strong>${item.label}</strong> - ` : ""}${inlineMarkdown(item.text)}
                        </p>
                        ${item.note ? `<p class="timeline__note">${inlineMarkdown(item.note)}</p>` : ""}
                        <span class="timeline__arrow"><i class="bi bi-chevron-double-right"></i></span>
                    </div>
                </div>
            `
        )
        .join("");
}

export default async function initTimeline(root) {
    let timeline;
    try {
        timeline = await fetchTimeline();
    } catch (error) {
        console.error(`${JSON_URL} không load được!. ERR:${error.message}`);
        return;
    }

    setText(root, "[data-timeline-eyebrow]", timeline.eyebrow);
    setText(root, "[data-timeline-heading]", timeline.heading);
    setImage(root, "[data-timeline-image]", timeline.image, timeline.imageAlt);
    renderMilestones(root, timeline.milestones);
}
