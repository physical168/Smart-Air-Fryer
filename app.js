/**
 * Smart Air Fryer Assistant — Figma-driven app shell.
 * Commit 2: global header, bottom nav, and view routing.
 */

const VIEWS = ["home", "detail", "shopping", "history"];
const DEFAULT_VIEW = "home";

const viewElements = new Map();
const navButtons = [];

function getViewFromHash() {
  const hash = window.location.hash.replace("#", "").trim();
  return VIEWS.includes(hash) ? hash : DEFAULT_VIEW;
}

function setHash(viewId, replace) {
  const nextHash = `#${viewId}`;
  if (window.location.hash === nextHash) {
    return;
  }

  if (replace) {
    history.replaceState({ view: viewId }, "", nextHash);
  } else {
    history.pushState({ view: viewId }, "", nextHash);
  }
}

function updateDocumentTitle(viewId) {
  const titles = {
    home: "Atelier Kitchen · Home",
    detail: "Atelier Kitchen · Favorites",
    shopping: "Atelier Kitchen · Shopping list",
    history: "Atelier Kitchen · History"
  };

  document.title = titles[viewId] || "Atelier Kitchen · Smart Air Fryer";
}

function updateNavState(viewId) {
  navButtons.forEach((button) => {
    const isActive = button.dataset.nav === viewId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

function showView(viewId, options = {}) {
  const { updateHistory = true, replaceHistory = false } = options;

  if (!VIEWS.includes(viewId)) {
    viewId = DEFAULT_VIEW;
  }

  viewElements.forEach((section, id) => {
    const isActive = id === viewId;
    section.classList.toggle("is-active", isActive);
    section.hidden = !isActive;
  });

  updateNavState(viewId);
  updateDocumentTitle(viewId);
  document.documentElement.dataset.currentView = viewId;

  const routeDebug = document.querySelector("#route-debug");
  if (routeDebug) {
    routeDebug.textContent = `#${viewId}`;
  }

  if (updateHistory) {
    setHash(viewId, replaceHistory);
  }

  const activeSection = viewElements.get(viewId);
  if (activeSection) {
    const heading = activeSection.querySelector("h2");
    if (heading) {
      heading.focus({ preventScroll: true });
    }
  }
}

function bindNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const viewId = button.dataset.nav;
      if (viewId) {
        showView(viewId);
      }
    });
  });

  window.addEventListener("hashchange", () => {
    showView(getViewFromHash(), { updateHistory: false });
  });

  window.addEventListener("popstate", () => {
    showView(getViewFromHash(), { updateHistory: false });
  });
}

function initRouting() {
  VIEWS.forEach((viewId) => {
    const section = document.querySelector(`#view-${viewId}`);
    if (section) {
      viewElements.set(viewId, section);
    }
  });

  document.querySelectorAll(".bottom-nav__link[data-nav]").forEach((button) => {
    navButtons.push(button);
  });

  bindNavigation();

  const initialView = getViewFromHash();
  showView(initialView, { replaceHistory: true });
}

function initHeaderActions() {
  const profileButton = document.querySelector("#header-profile");
  const settingsButton = document.querySelector("#header-settings");

  if (profileButton) {
    profileButton.addEventListener("click", () => {
      profileButton.setAttribute("aria-expanded", "true");
      window.setTimeout(() => profileButton.setAttribute("aria-expanded", "false"), 150);
    });
  }

  if (settingsButton) {
    settingsButton.addEventListener("click", () => {
      settingsButton.setAttribute("aria-expanded", "true");
      window.setTimeout(() => settingsButton.setAttribute("aria-expanded", "false"), 150);
    });
  }
}

function initApp() {
  if (!document.querySelector("#view-home")) {
    return;
  }

  initRouting();
  initHeaderActions();
  document.documentElement.dataset.appReady = "true";
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      /* PWA optional during scaffold phase */
    });
  });
}

initApp();
registerServiceWorker();
