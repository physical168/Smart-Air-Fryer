/**
 * Smart Air Fryer Assistant — Figma-driven app shell.
 * Commit 1: init only. Navigation and screen logic arrive in commits 2–8.
 */

function initApp() {
  const homeView = document.querySelector("#view-home");
  if (!homeView) {
    return;
  }

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
