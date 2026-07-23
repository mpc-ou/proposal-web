const DATA_URL = "./data/info.json";

const SECTIONS = [
  {
    html: "./sections/title-page/title-page.html",
    module: "../sections/title-page/title-page.js",
  },
  {
    html: "./sections/open-letter-page/open-letter-page.html",
    module: "../sections/open-letter-page/open-letter-page.js",
  },
  {
    html: "./sections/introduction-to-school/introduction-to-school.html",
    module: "../sections/introduction-to-school/introduction-to-school.js",
  },
  {
    html: "./sections/introduction-to-mpclub/introduction-to-mpclub.html",
    module: "../sections/introduction-to-mpclub/introduction-to-mpclub.js",
  },
  {
    html: "./sections/exhibitions/exhibitions.html",
    module: "../sections/exhibitions/exhibitions.js",
  },
  {
    html: "./sections/timeline/timeline.html",
    module: "../sections/timeline/timeline.js",
  },
  {
    html: "./sections/media-effectiveness/media-effectiveness.html",
    module: "../sections/media-effectiveness/media-effectiveness.js",
  },
  {
    html: "./sections/organizing-resources/organizing-resources.html",
    module: "../sections/organizing-resources/organizing-resources.js",
  },
  {
    html: "./sections/sponsor/sponsor.html",
    module: "../sections/sponsor/sponsor.js",
  },
  {
    html: "./sections/media-plan/media-plan.html",
    module: "../sections/media-plan/media-plan.js",
  },
];

async function loadSharedData() {
  const res = await fetch(DATA_URL);
  if (!res.ok) {
    throw new Error(`Khong tai duoc ${DATA_URL} (HTTP ${res.status})`);
  }
  return res.json();
}

async function loadSection(root, entry, data) {
  const res = await fetch(entry.html);
  if (!res.ok) {
    throw new Error(`Khong tai duoc ${entry.html} (HTTP ${res.status})`);
  }
  const html = await res.text();

  const wrapper = document.createElement("div");
  wrapper.className = "section-wrapper";
  wrapper.innerHTML = html;
  root.appendChild(wrapper);

  const mod = await import(entry.module);
  if (typeof mod.default === "function") {
    await mod.default(wrapper, data);
  }
}

async function main() {
  const contentDOM = document.getElementById("content");
  if (!contentDOM) return;

  let data = {};
  try {
    data = await loadSharedData();
  } catch (error) {
    console.error(`data/info.json khong tai duoc. ERR: ${error.message}`);
  }

  for (const entry of SECTIONS) {
    try {
      await loadSection(contentDOM, entry, data);
      console.info(`${entry.html} da duoc load!`);
    } catch (error) {
      console.error(`${entry.html} khong load duoc!. ERR: ${error.message}`);
    }
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.dispatchEvent(
        new CustomEvent("sections:loaded", { detail: { data } }),
      );
    });
  });
}

document.addEventListener("DOMContentLoaded", main);
