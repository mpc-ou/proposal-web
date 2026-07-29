import { renderMarkdown } from "../../js/markdown-utils.js";

const DATA_URL = "./sections/thank-you/thank-you.json";

async function fetchThankYou() {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

function renderContacts(root, contacts) {
    const el = root.querySelector("[data-thank-you-contacts]");
    if (!el || !Array.isArray(contacts)) return;
    el.innerHTML = contacts
        .map(
            (contact, index) => `
                <div class="thank-you__card ${index === 0 ? "thank-you__card--main" : "thank-you__card--second"}">
                    <h5 class="thank-you__card-role">${contact.role}</h5>
                    <h4 class="thank-you__card-name">${contact.name}</h4>
                    <p class="thank-you__card-info">
                        <strong>Email:</strong>
                        <a href="mailto:${contact.email}">${contact.email}</a>
                    </p>
                    <p class="thank-you__card-info">
                        <strong>SĐT:</strong>
                        <a href="tel:${contact.phone}">${contact.phone}</a>
                    </p>
                </div>
            `
        )
        .join("");
}

function renderInfoList(root, items) {
    const el = root.querySelector("[data-thank-you-info-list]");
    if (!el || !Array.isArray(items)) return;
    el.innerHTML = items
        .map(
            (item) => `
                <li class="thank-you__info-item">
                    <strong>${item.label}:</strong>
                    <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.text}</a>
                </li>
            `
        )
        .join("");
}

export default async function initThankYou(root) {
    let data;
    try {
        data = await fetchThankYou();
    } catch (error) {
        console.error(`${DATA_URL} không load được!. ERR:${error.message}`);
        return;
    }

    const titleEl = root.querySelector("[data-thank-you-title]");
    if (titleEl) titleEl.textContent = data.header?.title || "";

    const textEl = root.querySelector("[data-thank-you-text]");
    if (textEl) textEl.innerHTML = renderMarkdown(data.header?.text || "");

    const infoTitleEl = root.querySelector("[data-thank-you-info-title]");
    if (infoTitleEl) infoTitleEl.textContent = data.info?.title || "";

    renderContacts(root, data.contacts);
    renderInfoList(root, data.info?.items);
}
