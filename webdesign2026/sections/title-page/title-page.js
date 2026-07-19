export default function initTitlePage(root, data) {
    const titlePage = data && data.titlePage;
    if (!titlePage) return;

    const orgLinesEl = root.querySelector("[data-org-lines]");
    if (orgLinesEl && Array.isArray(titlePage.orgLines)) {
        orgLinesEl.innerHTML = titlePage.orgLines
            .map((line) => `<p>${line}</p>`)
            .join("");
    }

    const logosEl = root.querySelector("[data-logos]");
    if (logosEl && Array.isArray(titlePage.logos)) {
        logosEl.innerHTML = titlePage.logos
            .map(
                (logo) =>
                    `<img class="logo-row__item" src="${logo.src}" alt="${logo.alt || ""}">`
            )
            .join("");
    }

    const eyebrowEl = root.querySelector("[data-eyebrow]");
    if (eyebrowEl) eyebrowEl.textContent = titlePage.eyebrow || "";

    const headlineEl = root.querySelector("[data-headline]");
    if (headlineEl) headlineEl.textContent = titlePage.headline || "";
}
