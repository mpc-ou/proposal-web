import { applyLazyImages } from "./dom-utils.js";

const DATA_URL = "./data/info.json";

const SECTIONS = [
  {
    html: "./sections/title-page/title-page.html",
    module: "../sections/title-page/title-page.js",
    aboveTheFold: true,
  },
  {
    html: "./sections/open-letter-page/open-letter-page.html",
    module: "../sections/open-letter-page/open-letter-page.js",
    aboveTheFold: true,
  },
  {
    html: "./sections/introduction-to-school/introduction-to-school.html",
    module: "../sections/introduction-to-school/introduction-to-school.js",
  },
  {
    html: "./sections/introduction-to-faculty/introduction-to-faculty.html",
    module: "../sections/introduction-to-faculty/introduction-to-faculty.js",
  },
  {
    html: "./sections/introduction-to-mpclub/introduction-to-mpclub.html",
    module: "../sections/introduction-to-mpclub/introduction-to-mpclub.js",
  },
  {
    html: "./sections/our-contest/our-contest.html",
    module: "../sections/our-contest/our-contest.js",
  },
  {
    html: "./sections/webdesign-recap/webdesign-recap.html",
    module: "../sections/webdesign-recap/webdesign-recap.js",
  },
  {
    html: "./sections/exhibitions/exhibitions.html",
    module: "../sections/exhibitions/exhibitions.js",
  },
  {
    html: "./sections/web-design-info/web-design-info.html",
    module: "../sections/web-design-info/web-design-info.js",
  },
  {
    html: "./sections/contest-value/contest-value.html",
    module: "../sections/contest-value/contest-value.js",
  },
  {
    html: "./sections/timeline/timeline.html",
    module: "../sections/timeline/timeline.js",
  },
  {
    html: "./sections/media-plan/media-plan.html",
    module: "../sections/media-plan/media-plan.js",
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
    html: "./sections/thank-you/thank-you.html",
    module: "../sections/thank-you/thank-you.js",
  },
];

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Khong tai duoc ${url} (HTTP ${res.status})`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Khong tai duoc ${url} (HTTP ${res.status})`);
  return res.text();
}

async function renderSectionModule(wrapper, entry, sharedData) {
  const mod = await import(entry.module);

  if (typeof mod.renderStatic === "function") {
    mod.renderStatic(wrapper, sharedData);
    applyLazyImages(wrapper);
  }

  if (typeof mod.loadDynamic === "function") {
    await mod.loadDynamic(wrapper, sharedData);
  } else if (typeof mod.default === "function") {
    await mod.default(wrapper, sharedData);
  }
  applyLazyImages(wrapper);
}

async function buildSection(entry, sharedData) {
  const wrapper = document.createElement("div");
  wrapper.className = "section-wrapper";

  try {
    wrapper.innerHTML = await fetchText(entry.html);
    applyLazyImages(wrapper);
    await renderSectionModule(wrapper, entry, sharedData);
  } catch (error) {
  }

  return wrapper;
}

function appendSectionsInOrder(contentDOM, sectionBuilds, onSectionAppended) {
  let chain = Promise.resolve();
  sectionBuilds.forEach((buildPromise, index) => {
    chain = chain.then(async () => {
      const wrapper = await buildPromise;
      contentDOM.appendChild(wrapper);
      onSectionAppended(index);
    });
  });
  return chain;
}

async function main() {
  const contentDOM = document.getElementById("content");
  if (!contentDOM) return;

  let sharedData = {};
  try {
    sharedData = await fetchJSON(DATA_URL);
  } catch (error) {
  }

  const sectionBuilds = SECTIONS.map((entry) => buildSection(entry, sharedData));
  const lastAboveTheFoldIndex = SECTIONS.reduce(
    (acc, entry, i) => (entry.aboveTheFold ? i : acc),
    -1,
  );

  await appendSectionsInOrder(contentDOM, sectionBuilds, (index) => {
    if (index === lastAboveTheFoldIndex) {
      document.dispatchEvent(new CustomEvent("sections:first-ready"));
    }
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.dispatchEvent(
        new CustomEvent("sections:loaded", { detail: { data: sharedData } }),
      );
    });
  });
}

document.addEventListener("DOMContentLoaded", main);
