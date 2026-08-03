import { renderMarkdown, fetchMarkdown } from "../../js/markdown-utils.js";

const MD_URL = "./sections/open-letter-page/open-letter-page.md";

export function renderStatic(root, data) {
    const letter = data && data.letter;
    const titleEl = root.querySelector("[data-letter-title]");
    if (titleEl) titleEl.textContent = (letter && letter.title) || "Thư Ngỏ";
}

export async function loadDynamic(root) {
    const bodyEl = root.querySelector("[data-letter-body]");
    if (!bodyEl) return;

    try {
        const markdown = await fetchMarkdown(MD_URL);
        bodyEl.innerHTML = renderMarkdown(markdown);
    } catch (error) {
        bodyEl.innerHTML = `<p>Không tải được nội dung thư ngỏ (${error.message}).</p>`;
        console.error(`${MD_URL} không load được!. ERR:${error.message}`);
    }
}
