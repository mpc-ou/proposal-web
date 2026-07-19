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
    pageDots: {
        navClass: "page-dots",
        dotClass: "page-dots__dot",
        activeClass: "is-active",
        threshold: 0.5,
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
        storageKey: "webdesign2026:zoom",
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

    const stored = loadStoredZoom();
    let level = stored !== null && stored >= min && stored <= max ? stored : defaultLevel;

    const apply = () => {
        content.style.transform = `scale(${level})`;
        viewport.style.height = `${content.scrollHeight * level}px`;
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

    window.addEventListener("resize", () => {
        viewport.style.height = `${content.scrollHeight * level}px`;
    });

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

function setupPageDots() {
    const { navClass, dotClass, activeClass, threshold } = CONFIG.pageDots;
    const pages = document.querySelectorAll(".page");
    if (!pages.length) return;

    const nav = document.createElement("nav");
    nav.className = navClass;
    nav.setAttribute("aria-label", "Điều hướng trang");

    const dots = [];
    pages.forEach((page, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = dotClass;
        dot.setAttribute("aria-label", `Đến trang ${index + 1}`);
        dot.addEventListener("click", () => page.scrollIntoView({ behavior: "smooth" }));
        nav.appendChild(dot);
        dots.push(dot);
    });

    document.body.appendChild(nav);

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const index = Array.prototype.indexOf.call(pages, entry.target);
                dots.forEach((dot) => dot.classList.remove(activeClass));
                if (dots[index]) dots[index].classList.add(activeClass);
            });
        },
        { threshold }
    );

    pages.forEach((page) => observer.observe(page));
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

function onSectionsLoaded() {
    setupPageInnerWrap();
    setupPageNumbers();
    setupScrollAnimations();
    setupScrollProgress();
    setupPageDots();
}

document.addEventListener("sections:loaded", onSectionsLoaded);
document.addEventListener("DOMContentLoaded", () => {
    setupPrintButton();
    setupZoomControl();
});
