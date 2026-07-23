const JSON_URL = "./sections/exhibitions/exhibitions.json";
const TEAMS_PER_PAGE = 2;

function formatLinkHref(url) {
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function formatLinkText(url) {
    if (!url) return "";
    return url.replace(/^https?:\/\//i, "");
}

function formatGithubText(url) {
    if (!url) return "";
    return url.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
}

function renderLinks(team) {
    const links = [];
    if (team.github) {
        links.push(`
            <a class="exhibitions__link" href="${formatLinkHref(team.github)}" target="_blank" rel="noopener">
                <i class="bi bi-github"></i>
                <span>${formatGithubText(team.github)}</span>
            </a>
        `);
    }
    if (team.website) {
        links.push(`
            <a class="exhibitions__link" href="${formatLinkHref(team.website)}" target="_blank" rel="noopener">
                <i class="bi bi-globe2"></i>
                <span>${formatLinkText(team.website)}</span>
            </a>
        `);
    }
    if (!links.length) return "";
    return `<div class="exhibitions__links">${links.join("")}</div>`;
}

function renderMedia(team) {
    const imgs = team.imgs || [];
    const gallery = JSON.stringify(imgs).replace(/'/g, "&#39;");
    return `
        <div class="exhibitions__media">
            <div class="exhibitions__window-box">
                <div class="exhibitions__dot"></div>
                <div class="exhibitions__dot"></div>
                <div class="exhibitions__dot"></div>
                <img src="${imgs[0] || ""}" alt="${team.projectName}" data-lightbox='${gallery}' data-lightbox-index="0">
            </div>
        </div>
    `;
}

function renderInfo(team) {
    return `
        <div class="exhibitions__info">
            <div class="exhibitions__team-name">${team.teamName}</div>
            <div class="exhibitions__project-name">${team.projectName}</div>
            ${renderLinks(team)}
        </div>
    `;
}

function renderEntry(team, reversed) {
    const modifier = reversed ? " exhibitions__entry--reverse" : "";
    const animate = reversed ? "fadeInRight" : "fadeInLeft";
    return `
        <div class="exhibitions__entry${modifier}" data-animate="${animate}">
            ${renderMedia(team)}
            ${renderInfo(team)}
        </div>
    `;
}

function editionTitle(edition) {
    const label = edition.name.replace(/\s*\d{4}\s*$/, "").trim() || edition.name;
    return `Triển lãm ${label} ${edition.year}`;
}

function renderHeader(edition) {
    return `<h2 class="exhibitions__heading" data-animate="fadeInLeft">${editionTitle(edition)}</h2>`;
}

/*
  Description chi hien 1 lan duy nhat, o trang dau tien cua moi ky (isFirstPage)
  - cac trang sau cung ky khong lap lai de do rom.
*/
function renderDescription(edition) {
    if (!edition.description) return "";
    return `<p class="exhibitions__description" data-animate="fadeInLeft">${edition.description}</p>`;
}

function renderPage(edition, teamA, teamB, isFirstPage) {
    const singleClass = teamB ? "" : " exhibitions__entries--single";
    const tocAttr = isFirstPage ? ` data-toc="${editionTitle(edition)}"` : "";
    return `
        <div class="page exhibitions-page"${tocAttr}>
            ${renderHeader(edition)}
            ${isFirstPage ? renderDescription(edition) : ""}
            <div class="exhibitions__entries${singleClass}">
                ${renderEntry(teamA, false)}
                ${teamB ? renderEntry(teamB, true) : ""}
            </div>
        </div>
    `;
}

async function fetchEditions() {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export default async function initExhibitions(root) {
    const exhibitionsZone = root.querySelector("#exhibitions");
    if (!exhibitionsZone) return;

    let editions = [];
    try {
        editions = await fetchEditions();
    } catch (error) {
        console.error(`${JSON_URL} không load được!. ERR:${error.message}`);
        return;
    }

    let html = "";
    editions.forEach((edition) => {
        const teams = edition.teams || [];
        for (let i = 0; i < teams.length; i += TEAMS_PER_PAGE) {
            html += renderPage(edition, teams[i], teams[i + 1], i === 0);
        }
    });

    exhibitionsZone.innerHTML = html;
}
