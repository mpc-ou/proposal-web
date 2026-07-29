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

    // Khong co tien do that (khong duoc dung MutationObserver/patch fetch -
    // qua nang voi trang co nhieu section+anh, gay treo may), nen mo phong
    // chay nhanh roi cham dan, dung o 90% cho toi khi "sections:loaded".
    const ramp = setInterval(() => {
        if (done) return;
        const remaining = 90 - progress;
        setProgress(progress + Math.max(remaining * 0.06, 0.3));
    }, 120);

    function finish() {
        if (done) return;
        done = true;
        clearInterval(ramp);
        setProgress(100);
        setTimeout(() => {
            overlay.classList.add("is-hidden");
            setTimeout(() => overlay.remove(), 600);
        }, 250);
    }

    // "sections:loaded" duoc init.js ban ra sau khi TAT CA section da
    // fetch+init xong (bao gom fetch JSON/markdown rieng cua tung section).
    // Doi them 1 chut de anh vua duoc gan src kip bat dau tai.
    document.addEventListener(
        "sections:loaded",
        () => setTimeout(finish, 500),
        { once: true }
    );

    // Luoi an toan: neu vi ly do gi do "sections:loaded" khong bao gio ban
    // ra (loi mang, section bi treo...), van tu dong tat overlay.
    setTimeout(finish, 30000);
})();
