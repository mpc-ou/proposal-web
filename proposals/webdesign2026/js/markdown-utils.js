export function renderMarkdown(markdown) {
    if (window.marked && typeof window.marked.parse === "function") {
        return window.marked.parse(markdown);
    }
    return markdown
        .split(/\n\s*\n/)
        .map((block) => `<p>${block.trim()}</p>`)
        .join("");
}

export async function fetchMarkdown(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
}
