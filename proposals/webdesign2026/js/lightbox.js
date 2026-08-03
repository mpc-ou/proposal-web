/*
  lightbox.js
  Overlay xem anh phong to, dung chung cho moi section: gan thuoc tinh
  data-lightbox='["url1","url2",...]' (+ data-lightbox-index tuy chon) len
  the <img>, click vao la mo overlay - khong can khai bao gi them.
*/
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.3;

function parseGallery(el) {
    try {
        const parsed = JSON.parse(el.dataset.lightbox || "[]");
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (error) {
        return [];
    }
}

function createOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML = `
        <button type="button" class="lightbox-overlay__close" aria-label="Đóng">
            <i class="bi bi-x-lg"></i>
        </button>
        <button type="button" class="lightbox-overlay__nav lightbox-overlay__nav--prev" aria-label="Ảnh trước">
            <i class="bi bi-chevron-left"></i>
        </button>
        <div class="lightbox-overlay__stage">
            <img class="lightbox-overlay__img" alt="" draggable="false">
        </div>
        <button type="button" class="lightbox-overlay__nav lightbox-overlay__nav--next" aria-label="Ảnh sau">
            <i class="bi bi-chevron-right"></i>
        </button>
        <div class="lightbox-overlay__zoom">
            <button type="button" class="lightbox-overlay__zoom-btn" data-zoom-out aria-label="Thu nhỏ">
                <i class="bi bi-dash-lg"></i>
            </button>
            <button type="button" class="lightbox-overlay__zoom-btn" data-zoom-in aria-label="Phóng to">
                <i class="bi bi-plus-lg"></i>
            </button>
        </div>
        <div class="lightbox-overlay__counter"></div>
    `;
    document.body.appendChild(overlay);
    return overlay;
}

export function initLightbox() {
    if (window.__lightboxInit) return;
    window.__lightboxInit = true;

    let overlay = null;
    let imgEl, stageEl, prevBtn, nextBtn, counterEl;
    let images = [];
    let index = 0;
    let scale = MIN_SCALE;
    let translate = { x: 0, y: 0 };
    let dragging = false;
    let dragStart = { x: 0, y: 0 };

    function applyTransform() {
        imgEl.style.cursor = scale > MIN_SCALE ? "grab" : "zoom-in";
        imgEl.style.transform = `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;
    }

    function setScale(next) {
        scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
        if (scale === MIN_SCALE) translate = { x: 0, y: 0 };
        applyTransform();
    }

    function show(newIndex, { animate = true } = {}) {
        if (!images.length) return;
        index = (newIndex + images.length) % images.length;
        setScale(MIN_SCALE);

        const src = images[index];
        const multi = images.length > 1;
        prevBtn.hidden = !multi;
        nextBtn.hidden = !multi;
        counterEl.hidden = !multi;
        counterEl.textContent = multi ? `${index + 1} / ${images.length}` : "";

        if (animate && overlay.classList.contains("is-open")) {
            imgEl.classList.add("is-swapping");
            window.setTimeout(() => {
                imgEl.src = src;
                requestAnimationFrame(() => imgEl.classList.remove("is-swapping"));
            }, 140);
        } else {
            imgEl.src = src;
        }
    }

    function close() {
        if (!overlay) return;
        overlay.classList.remove("is-open");
        document.body.classList.remove("lightbox-open");
    }

    function open(gallery, startIndex) {
        ensureOverlay();
        images = gallery;
        overlay.classList.add("is-open");
        document.body.classList.add("lightbox-open");
        show(startIndex, { animate: false });
    }

    function ensureOverlay() {
        if (overlay) return;
        overlay = createOverlay();
        imgEl = overlay.querySelector(".lightbox-overlay__img");
        stageEl = overlay.querySelector(".lightbox-overlay__stage");
        prevBtn = overlay.querySelector(".lightbox-overlay__nav--prev");
        nextBtn = overlay.querySelector(".lightbox-overlay__nav--next");
        counterEl = overlay.querySelector(".lightbox-overlay__counter");

        overlay.querySelector(".lightbox-overlay__close").addEventListener("click", close);
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) close();
        });
        prevBtn.addEventListener("click", () => show(index - 1));
        nextBtn.addEventListener("click", () => show(index + 1));
        overlay.querySelector("[data-zoom-in]").addEventListener("click", () => setScale(scale + ZOOM_STEP));
        overlay.querySelector("[data-zoom-out]").addEventListener("click", () => setScale(scale - ZOOM_STEP));

        stageEl.addEventListener(
            "wheel",
            (event) => {
                event.preventDefault();
                setScale(scale + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
            },
            { passive: false }
        );

        imgEl.addEventListener("dblclick", () => setScale(scale > MIN_SCALE ? MIN_SCALE : 2.5));

        imgEl.addEventListener("mousedown", (event) => {
            if (scale <= MIN_SCALE) return;
            dragging = true;
            imgEl.classList.add("is-dragging");
            dragStart = { x: event.clientX - translate.x, y: event.clientY - translate.y };
        });
        window.addEventListener("mousemove", (event) => {
            if (!dragging) return;
            translate = { x: event.clientX - dragStart.x, y: event.clientY - dragStart.y };
            applyTransform();
        });
        window.addEventListener("mouseup", () => {
            dragging = false;
            imgEl.classList.remove("is-dragging");
        });

        document.addEventListener("keydown", (event) => {
            if (!overlay.classList.contains("is-open")) return;
            if (event.key === "Escape") close();
            if (event.key === "ArrowLeft") show(index - 1);
            if (event.key === "ArrowRight") show(index + 1);
        });
    }

    document.addEventListener("click", (event) => {
        const trigger = event.target.closest("[data-lightbox]");
        if (!trigger) return;
        const gallery = parseGallery(trigger);
        if (!gallery.length) return;
        open(gallery, Number(trigger.dataset.lightboxIndex || 0));
    });
}
