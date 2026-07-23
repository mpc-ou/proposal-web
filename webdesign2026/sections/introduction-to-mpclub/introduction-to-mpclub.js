import { renderMarkdown, fetchMarkdown } from "../../js/markdown-utils.js";

const MD_URL = "./sections/introduction-to-mpclub/introduction-to-mpclub.md";
const CLUB_URL = "./sections/introduction-to-mpclub/club.json";

const SOCIAL_ICONS = {
    email: "bi-envelope-fill",
    facebook: "bi-facebook",
    website: "bi-globe2",
    github: "bi-github",
};

async function fetchClub() {
    const res = await fetch(CLUB_URL);
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

function formatLinkHref(url) {
    if (!url) return "";
    return /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;
}

function formatLinkText(url) {
    if (!url) return "";
    return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function renderStats(root, stats) {
    const el = root.querySelector("[data-club-stats]");
    if (!el || !stats) return;
    el.innerHTML = Object.values(stats)
        .map(
            (stat) => `
                <li>
                    <span class="mpclub__stats-value">${stat.value}</span>
                    <span class="mpclub__stats-label">${stat.label}</span>
                </li>
            `
        )
        .join("");
}

function renderSocials(root, social) {
    const el = root.querySelector("[data-club-socials]");
    if (!el || !social) return;
    el.innerHTML = Object.entries(social)
        .map(([key, item]) => {
            const icon = SOCIAL_ICONS[key] || "bi-link-45deg";
            return `
                <a class="mpclub__link" href="${formatLinkHref(item.url)}" target="_blank" rel="noopener">
                    <i class="bi ${icon}"></i>
                    <span>${formatLinkText(item.label || item.url)}</span>
                </a>
            `;
        })
        .join("");
}

function renderActivities(root, activities) {
    const el = root.querySelector("[data-club-activities]");
    if (!el || !Array.isArray(activities)) return;
    el.innerHTML = activities
        .map((activity, index) => {
            const images = activity.images || [];
            const hasImage = images.length > 0;
            const gallery = JSON.stringify(images).replace(/'/g, "&#39;");
            const stateClass = hasImage ? "" : " mpclub-activities__card--plain";

            return `
                <div class="mpclub-activities__card${stateClass}" data-animate="fadeInUp" style="animation-delay:${index * 0.12}s">
                    ${
                        hasImage
                            ? `<img class="mpclub-activities__bg" src="${images[0]}" alt="" data-lightbox='${gallery}' data-lightbox-index="0">
                               <div class="mpclub-activities__overlay"></div>`
                            : ""
                    }
                    <div class="mpclub-activities__content">
                        <span class="mpclub-activities__index">${String(index + 1).padStart(2, "0")}</span>
                        <h3 class="mpclub-activities__card-title">${activity.title}</h3>
                        <p class="mpclub-activities__card-text">${activity.description}</p>
                    </div>
                </div>
            `;
        })
        .join("");
}

export default async function initIntroductionToMpclub(root) {
    let club;
    try {
        club = await fetchClub();
    } catch (error) {
        console.error(`${CLUB_URL} không load được!. ERR:${error.message}`);
        return;
    }

    setText(root, "[data-club-tag]", club.tag);
    setImage(root, "[data-club-image]", club.image, club.imageAlt);
    setText(root, "[data-club-eyebrow]", club.eyebrow);
    setText(root, "[data-club-heading]", club.heading);
    setText(root, "[data-club-eyebrow-2]", club.eyebrow);
    setText(root, "[data-club-activities-heading]", club.activitiesHeading);

    const metaParts = [];
    if (club.founded) metaParts.push(`Thành lập: ${club.founded}`);
    if (club.abbr) metaParts.push(`Viết tắt: ${club.abbr}`);
    setText(root, "[data-club-meta]", metaParts.join(" · "));

    renderStats(root, club.stats);
    renderSocials(root, club.social);
    renderActivities(root, club.activities);

    const overviewEl = root.querySelector("[data-club-overview]");
    const missionEl = root.querySelector("[data-club-mission]");

    try {
        const markdown = await fetchMarkdown(MD_URL);
        const html = renderMarkdown(markdown);
        const temp = document.createElement("div");
        temp.innerHTML = html;

        const paragraphs = temp.querySelectorAll("p");
        if (overviewEl) overviewEl.innerHTML = paragraphs[0] ? paragraphs[0].innerHTML : "";
        if (missionEl) missionEl.innerHTML = paragraphs[1] ? paragraphs[1].innerHTML : "";
    } catch (error) {
        if (overviewEl) {
            overviewEl.innerHTML = `<p>Không tải được nội dung giới thiệu (${error.message}).</p>`;
        }
        console.error(`${MD_URL} không load được!. ERR:${error.message}`);
    }
}
