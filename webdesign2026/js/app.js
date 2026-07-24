import { initLightbox } from "./lightbox.js";

const CONFIG = {
    animate: {
        selector: "[data-animate]",
        defaultEffect: "fadeIn",
        threshold: 0.2,
    },
    print: {
        buttonId: "printBtn",
    },
    pageNumber: {
        selector: ".page-number",
        startAt: 1,
        format: (n) => String(n),
    },
    scrollProgress: {
        barId: "scrollProgress",
    },
    backToTop: {
        btnId: "backToTop",
        showAfter: 600,
    },
    scrollRestore: {
        storageKey: "webdesign2026:scrollY",
    },
    pageIndicator: {
        elId: "pageIndicator",
        threshold: 0.5,
    },
    toc: {
        pageSelector: ".page[data-toc]",
        rootId: "toc",
        toggleId: "tocToggle",
        panelId: "tocPanel",
        listSelector: ".toc__list",
    },
    zoom: {
        contentId: "content",
        levelId: "zoomLevel",
        inBtnId: "zoomInBtn",
        outBtnId: "zoomOutBtn",
        min: 0.4,
        max: 1.5,
        step: 0.1,
        default: 0.7,
        // Doi ten key: gia tri cu la % TUYET DOI cua khung 1920px, khong
        // con dung duoc voi cach tinh "% tuong doi so voi fit-width" moi.
        storageKey: "webdesign2026:zoomLevelRel",
    },
};

function setupPageInnerWrap() {
    document.querySelectorAll(".page").forEach((page) => {
        if (page.querySelector(":scope > .page__inner")) return;

        const inner = document.createElement("div");
        const modifierClasses = Array.from(page.classList).filter((cls) => cls !== "page");
        modifierClasses.forEach((cls) => {
            inner.classList.add(cls);
            page.classList.remove(cls);
        });
        inner.classList.add("page__inner");

        while (page.firstChild) {
            inner.appendChild(page.firstChild);
        }
        page.appendChild(inner);
    });
}

function setupPageNumbers() {
    const { selector, startAt, format } = CONFIG.pageNumber;
    const badgeClass = selector.replace(/^\./, "");
    const pages = document.querySelectorAll(".page:not([data-no-page-number])");
    pages.forEach((page, index) => {
        let badge = page.querySelector(selector);
        if (!badge) {
            badge = document.createElement("span");
            badge.className = badgeClass;
            page.appendChild(badge);
        }
        badge.textContent = format(startAt + index);
    });
}

function setupScrollAnimations() {
    const items = document.querySelectorAll(CONFIG.animate.selector);
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("animate__animated"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const effect = el.dataset.animate || CONFIG.animate.defaultEffect;
                el.classList.add("animate__animated", `animate__${effect}`);
                obs.unobserve(el);
            });
        },
        { threshold: CONFIG.animate.threshold }
    );

    items.forEach((el) => observer.observe(el));
}

function loadStoredZoom() {
    try {
        const raw = localStorage.getItem(CONFIG.zoom.storageKey);
        const parsed = raw === null ? null : Number(raw);
        return Number.isFinite(parsed) ? parsed : null;
    } catch (error) {
        return null;
    }
}

function saveStoredZoom(level) {
    try {
        localStorage.setItem(CONFIG.zoom.storageKey, String(level));
    } catch (error) {
        // localStorage co the bi chan (che do an danh...), bo qua im lang
    }
}

function setupZoomControl() {
    const { contentId, levelId, inBtnId, outBtnId, min, max, step, default: defaultLevel } = CONFIG.zoom;
    const content = document.getElementById(contentId);
    const levelEl = document.getElementById(levelId);
    const inBtn = document.getElementById(inBtnId);
    const outBtn = document.getElementById(outBtnId);
    if (!content || !inBtn || !outBtn) return;

    const viewport = document.createElement("div");
    viewport.id = "zoomViewport";
    content.parentNode.insertBefore(viewport, content);
    viewport.appendChild(content);

    /*
      "level" la ty le TUONG DOI so voi "vua khop chieu rong man hinh"
      (unit), KHONG phai % tuyet doi cua khung thiet ke 1920px. Nho vay
      100% luon co nghia la trang rong dung bang man hinh - dung tren
      dien thoai man hinh hep cung khong bao gio bi tran ngang, khong con
      phai zoom am xuong duoi muc min moi vua het chieu rong nhu truoc.
    */
    const getUnit = () => window.innerWidth / content.offsetWidth;

    const stored = loadStoredZoom();
    let level = stored !== null && stored >= min && stored <= max ? stored : defaultLevel;

    const apply = () => {
        const scale = level * getUnit();
        content.style.transform = `scale(${scale})`;
        viewport.style.height = `${content.scrollHeight * scale}px`;
        if (levelEl) levelEl.textContent = `${Math.round(level * 100)}%`;
        outBtn.disabled = level <= min;
        inBtn.disabled = level >= max;
        saveStoredZoom(level);
    };

    inBtn.addEventListener("click", () => {
        level = Math.min(max, +(level + step).toFixed(2));
        apply();
    });

    outBtn.addEventListener("click", () => {
        level = Math.max(min, +(level - step).toFixed(2));
        apply();
    });

    window.addEventListener("resize", apply);

    apply();
}

function setupScrollProgress() {
    const bar = document.getElementById(CONFIG.scrollProgress.barId);
    if (!bar) return;

    const update = () => {
        const scrollTop = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (scrollTop / max) * 100 : 0;
        bar.style.width = `${pct}%`;
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
}

function setupBackToTop() {
    const { btnId, showAfter } = CONFIG.backToTop;
    const btn = document.getElementById(btnId);
    if (!btn) return;

    const update = () => {
        btn.classList.toggle("is-visible", window.scrollY > showAfter);
    };

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", update, { passive: true });
    update();
}


function setupPageIndicator() {
    const { elId, threshold } = CONFIG.pageIndicator;
    const indicatorEl = document.getElementById(elId);
    const pages = document.querySelectorAll(".page");
    if (!indicatorEl || !pages.length) return;

    const total = pages.length;
    const setActive = (index) => {
        indicatorEl.textContent = `${index + 1} / ${total}`;
    };
    setActive(0);

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const index = Array.prototype.indexOf.call(pages, entry.target);
                if (index >= 0) setActive(index);
            });
        },
        { threshold }
    );

    pages.forEach((page) => observer.observe(page));
}

function setupTableOfContents() {
    const { pageSelector, rootId, toggleId, panelId, listSelector } = CONFIG.toc;
    const root = document.getElementById(rootId);
    const toggle = document.getElementById(toggleId);
    const panel = document.getElementById(panelId);
    const list = panel ? panel.querySelector(listSelector) : null;
    const entries = document.querySelectorAll(pageSelector);

    if (!root || !toggle || !panel || !list || !entries.length) {
        if (root) root.hidden = true;
        return;
    }

    const allPages = Array.from(document.querySelectorAll(".page"));
    list.innerHTML = "";

    const close = () => {
        root.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
    };
    const open = () => {
        root.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
    };

    entries.forEach((page) => {
        const label = page.dataset.toc;
        const pageIndex = allPages.indexOf(page);
        const item = document.createElement("li");
        const link = document.createElement("button");
        link.type = "button";
        link.className = "toc__link";
        link.innerHTML = `<span class="toc__link-number">${pageIndex + 1}</span><span>${label}</span>`;
        link.addEventListener("click", () => {
            page.scrollIntoView({ behavior: "smooth" });
            close();
        });
        item.appendChild(link);
        list.appendChild(item);
    });

    toggle.addEventListener("click", () => {
        root.classList.contains("is-open") ? close() : open();
    });

    document.addEventListener("click", (event) => {
        if (root.classList.contains("is-open") && !root.contains(event.target)) close();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") close();
    });
}

/*
  In PDF: dung window.print() (@media print trong style.css) de chu la
  text that, chon/copy duoc binh thuong - KHONG dung html2canvas/jsPDF
  (render ra anh, mat kha nang chon chu).

  Truoc khi in (bat ke kich hoat bang nut, Ctrl+P hay menu trinh duyet -
  "beforeprint"/"afterprint" bat duoc ca 3 cach), phai RESET transform
  zoom man hinh ve "none". Neu khong, transform:scale con dinh tren
  #content se lam noi dung bi thu nho/lech vi tri so voi kich thuoc that
  ma @media print da tinh (chu bi "lech xuong duoi").
*/
function setupPrintButton() {
    const btn = document.getElementById(CONFIG.print.buttonId);
    if (btn) {
        btn.addEventListener("click", () => window.print());
    }

    const contentEl = document.getElementById(CONFIG.zoom.contentId);
    let previousTransform = "";

    window.addEventListener("beforeprint", () => {
        if (!contentEl) return;
        previousTransform = contentEl.style.transform;
        contentEl.style.transform = "none";
    });

    window.addEventListener("afterprint", () => {
        if (!contentEl) return;
        contentEl.style.transform = previousTransform;
    });
}

function readStoredScrollY() {
    try {
        const raw = sessionStorage.getItem(CONFIG.scrollRestore.storageKey);
        const parsed = raw === null ? null : Number(raw);
        return Number.isFinite(parsed) ? parsed : null;
    } catch (error) {
        return null;
    }
}

function saveScrollY(y) {
    try {
        sessionStorage.setItem(CONFIG.scrollRestore.storageKey, String(y));
    } catch (error) {
        // localStorage/sessionStorage co the bi chan (che do an danh...), bo qua im lang
    }
}

function setupScrollRestore() {
    let restoring = true;

    const restoreOnce = () => {
        const y = readStoredScrollY();
        if (y === null) {
            restoring = false;
            return;
        }
        window.scrollTo(0, y);
    };

    document.addEventListener("sections:loaded", () => {
        restoreOnce();

        const images = Array.from(document.querySelectorAll("#content img"));
        let pending = images.filter((img) => !img.complete).length;
        if (!pending) {
            restoring = false;
            return;
        }

        images.forEach((img) => {
            if (img.complete) return;
            const onDone = () => {
                pending -= 1;
                if (restoring) restoreOnce();
                if (pending <= 0) restoring = false;
            };
            img.addEventListener("load", onDone, { once: true });
            img.addEventListener("error", onDone, { once: true });
        });
    });

    window.addEventListener(
        "scroll",
        () => {
            if (restoring) return;
            saveScrollY(window.scrollY);
        },
        { passive: true }
    );
}

function onSectionsLoaded() {
    setupPageInnerWrap();
    setupPageNumbers();
    setupScrollAnimations();
    setupScrollProgress();
    setupPageIndicator();
    setupTableOfContents();
}

document.addEventListener("sections:loaded", onSectionsLoaded);
document.addEventListener("DOMContentLoaded", () => {
    setupPrintButton();
    setupZoomControl();
    setupScrollRestore();
    setupBackToTop();
    initLightbox();
});
