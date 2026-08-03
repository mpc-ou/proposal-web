export function applyLazyImages(root) {
    root.querySelectorAll("img:not([loading])").forEach((img) => {
        img.loading = "lazy";
        img.decoding = "async";
    });
}
