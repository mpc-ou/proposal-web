const JSON_URL = "./sections/contest-value/contest-value.json";

async function fetchContestValue() {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function setText(root, selector, value) {
    const el = root.querySelector(selector);
    if (el) el.textContent = value || "";
}

function renderTitle(root, title) {
    if (!title) return;
    setText(root, "[data-cv-title-line1]", title.line1);
    setText(root, "[data-cv-title-highlight]", title.highlight);
}

function renderImage(root, data) {
    const imageEl = root.querySelector("[data-cv-image]");
    if (imageEl) {
        imageEl.src = data.image || "";
        imageEl.alt = data.imageAlt || "";
    }
    const iconEl = root.querySelector("[data-cv-icon]");
    if (iconEl) iconEl.classList.add(data.icon || "bi-award");
}

function renderCards(root, cards) {
    const el = root.querySelector("[data-cv-cards]");
    if (!el || !Array.isArray(cards)) return;
    el.innerHTML = cards
        .map(
            (card) => `
                <div class="contest-value__card contest-value__card--${card.modifier || "orange"}">
                    <h2 class="contest-value__card-title">${card.title || ""}</h2>
                    ${(card.paragraphs || [])
                        .map((text) => `<p class="contest-value__card-text">${text}</p>`)
                        .join("")}
                </div>
            `
        )
        .join("");
}

export async function loadDynamic(root) {
    let data;
    try {
        data = await fetchContestValue();
    } catch (error) {
        console.error(`${JSON_URL} không load được!. ERR:${error.message}`);
        return;
    }

    renderTitle(root, data.title);
    renderImage(root, data);
    renderCards(root, data.cards);
}
