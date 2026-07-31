import { renderMarkdown } from "../../js/markdown-utils.js";

const JSON_URL = "./sections/media-plan/media-plan.json";

async function fetchMediaPlan() {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function inlineMarkdown(text) {
    if (!text) return "";
    const html = renderMarkdown(text).trim();
    return html.replace(/^<p>([\s\S]*)<\/p>$/, "$1");
}

function setText(root, selector, value) {
    root.querySelectorAll(selector).forEach((el) => {
        el.textContent = value || "";
    });
}

function renderHeader(root, header) {
    if (!header) return;
    setText(root, "[data-media-plan-sub-title]", header.subTitle);
    setText(root, "[data-media-plan-main-title]", header.mainTitle);
}

function renderImage(root, image) {
    if (!image) return;
    const imgEl = root.querySelector("[data-media-plan-image]");
    if (!imgEl) return;
    imgEl.src = image.src || "";
    imgEl.alt = image.alt || "";
}

function renderPurpose(root, purpose) {
    if (!purpose) return;
    setText(root, "[data-media-plan-purpose-title]", purpose.title);
    const listEl = root.querySelector("[data-media-plan-purpose-list]");
    if (!listEl || !Array.isArray(purpose.items)) return;
    listEl.innerHTML = purpose.items
        .map((item) => `<li>${inlineMarkdown(item)}</li>`)
        .join("");
}

function renderAudience(root, audience) {
    if (!audience) return;
    setText(root, "[data-media-plan-audience-title]", audience.title);
    const textEl = root.querySelector("[data-media-plan-audience-text]");
    if (textEl) textEl.innerHTML = inlineMarkdown(audience.text);
}

function renderGoal(root, goal) {
    if (!goal) return;
    setText(root, "[data-media-plan-goal-title]", goal.title);
    const textEl = root.querySelector("[data-media-plan-goal-text]");
    if (!textEl) return;
    let html = inlineMarkdown(goal.text);
    if (goal.highlight) {
        html = html.replace(
            "{{highlight}}",
            `<span class="highlight">${goal.highlight}</span>`
        );
    }
    textEl.innerHTML = html;
}

function renderTimeline(root, milestones) {
    const el = root.querySelector("[data-media-plan-timeline]");
    if (!el || !Array.isArray(milestones)) return;
    el.innerHTML = milestones
        .map(
            (item, index) => `
                <div
                    class="timeline__item ${item.side === "left" ? "left" : "right"}"
                    data-animate="fadeInUp"
                    style="animation-delay:${index * 0.08}s"
                >
                    <div class="timeline__title">${item.title || ""}</div>
                    <div class="timeline__date">${item.date || ""}</div>
                </div>
            `
        )
        .join("");
}

function renderTargets(root, targets) {
    if (!targets) return;
    setText(root, "[data-media-plan-target-main-title]", targets.mainTitle);
    setText(root, "[data-media-plan-target-main-number]", targets.mainNumber);
    setText(root, "[data-media-plan-target-main-label]", targets.mainLabel);
    setText(root, "[data-media-plan-targets-heading]", targets.heading);

    const gridEl = root.querySelector("[data-media-plan-targets-grid]");
    if (!gridEl || !Array.isArray(targets.events)) return;
    gridEl.innerHTML = targets.events
        .map(
            (event, index) => `
                <div
                    class="target-card target-card--event"
                    data-animate="${index === 0 ? "fadeInLeft" : "fadeInRight"}"
                >
                    <h4 class="target-card__sub-title">${event.title || ""}</h4>
                    <div class="target-card__datas">
                        ${(event.stats || [])
                    .map(
                        (stat) => `
                                    <div class="data-item">
                                        <span class="data-item__number" data-counter>${stat.number || ""}</span>
                                        <span class="data-item__label">${stat.label || ""}</span>
                                    </div>
                                `
                    )
                    .join("")}
                    </div>
                </div>
            `
        )
        .join("");
}

export default async function initMediaPlan(root) {
    let data;
    try {
        data = await fetchMediaPlan();
    } catch (error) {
        console.error(`${JSON_URL} không load được!. ERR:${error.message}`);
        return;
    }

    renderHeader(root, data.header);
    renderImage(root, data.image);
    renderPurpose(root, data.purpose);
    renderAudience(root, data.audience);
    renderGoal(root, data.goal);
    renderTimeline(root, data.milestones);
    renderTargets(root, data.targets);
}
