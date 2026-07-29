(() => {
    const overlay = document.getElementById("loadingOverlay");
    const barFill = document.getElementById("loadingBarFill");
    const percentEl = document.getElementById("loadingPercent");
    if (!overlay || !barFill || !percentEl) return;

    const anim = document.getElementById("loadingAnim");
    if (anim) {
        const canPlayWebm = typeof anim.canPlayType === "function" && anim.canPlayType("video/webm") !== "";
        if (!canPlayWebm) {
            fallbackToGif(anim);
        } else {
            anim.addEventListener("error", () => fallbackToGif(anim), { once: true });
            anim.play?.().catch(() => fallbackToGif(anim));
        }
    }

    function fallbackToGif(videoEl) {
        const img = document.createElement("img");
        img.className = videoEl.className;
        img.src = "./img/loading.gif";
        img.alt = "Đang tải nội dung";
        videoEl.replaceWith(img);
    }

    let progress = 0;
    let done = false;

    function setProgress(value) {
        progress = Math.max(progress, Math.min(value, 100));
        barFill.style.width = `${progress}%`;
        percentEl.textContent = `${Math.round(progress)}%`;
    }

    // Chua co tien do that (init.js khong bi sua), nen mo phong chay nhanh
    // luc dau roi cham dan, dung o 92% cho toi khi "sections:loaded" ban ra.
    const timer = setInterval(() => {
        if (done) return;
        const remaining = 92 - progress;
        setProgress(progress + Math.max(remaining * 0.06, 0.4));
    }, 120);

    function finish() {
        if (done) return;
        done = true;
        clearInterval(timer);
        setProgress(100);
        setTimeout(() => {
            overlay.classList.add("is-hidden");
            setTimeout(() => overlay.remove(), 600);
        }, 250);
    }

    document.addEventListener("sections:loaded", finish, { once: true });
    window.addEventListener("load", () => setTimeout(finish, 800));
})();
