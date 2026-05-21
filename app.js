/**
 * Smart Air Fryer Assistant — Figma-driven app.
 * Commit 4: home search, recipe AJAX, navigation to detail.
 */

const VIEWS = ["home", "detail", "shopping", "history"];
const DEFAULT_VIEW = "home";
const SELECTED_FOOD_KEY = "atelierKitchenSelectedFood";

const viewElements = new Map();
const navButtons = [];

let recipes = [];
let recipesById = new Map();

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
  const foodId = sessionStorage.getItem(SELECTED_FOOD_KEY);
  const recipe = foodId ? recipesById.get(foodId) : null;

  if (viewId === "detail" && recipe) {
    document.title = `Atelier Kitchen · ${recipe.name}`;
    return;
  }

  const titles = {
    home: "Atelier Kitchen · Home",
    detail: "Atelier Kitchen · Cooking detail",
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

function renderDetailSelection(foodId) {
  const textEl = document.querySelector("#detail-selection-text");
  const metaEl = document.querySelector("#detail-selection-meta");

  if (!textEl || !metaEl) {
    return;
  }

  const recipe = foodId ? recipesById.get(foodId) : null;

  if (!recipe) {
    textEl.textContent = "Select a food from Home to see parameters.";
    metaEl.hidden = true;
    metaEl.innerHTML = "";
    return;
  }

  textEl.textContent = `${recipe.name} — recommended air fryer settings`;
  metaEl.hidden = false;
  metaEl.innerHTML = `
    <div>
      <dt>Temperature</dt>
      <dd>${recipe.temperature}°C</dd>
    </div>
    <div>
      <dt>Time</dt>
      <dd>${recipe.minutes} min</dd>
    </div>
    <div>
      <dt>Tip</dt>
      <dd>${recipe.tip}</dd>
    </div>
  `;
}

function showView(viewId, options = {}) {
  const { updateHistory = true, replaceHistory = false, foodId = null } = options;

  if (!VIEWS.includes(viewId)) {
    viewId = DEFAULT_VIEW;
  }

  if (foodId) {
    sessionStorage.setItem(SELECTED_FOOD_KEY, foodId);
  }

  viewElements.forEach((section, id) => {
    const isActive = id === viewId;
    section.classList.toggle("is-active", isActive);
    section.hidden = !isActive;
  });

  updateNavState(viewId);
  document.documentElement.dataset.currentView = viewId;

  if (viewId === "detail") {
    const activeFoodId = foodId || sessionStorage.getItem(SELECTED_FOOD_KEY);
    renderDetailSelection(activeFoodId);
  }

  updateDocumentTitle(viewId);

  if (updateHistory) {
    setHash(viewId, replaceHistory);
  }

  const activeSection = viewElements.get(viewId);
  if (activeSection) {
    const heading =
      activeSection.querySelector("h1[tabindex], h2[tabindex]") ||
      activeSection.querySelector("h1, h2");
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

function foodCardMarkup(recipe) {
  const badgeClass = `food-card__badge-icon--${recipe.badge}`;
  return `
    <li class="food-card-list__item" data-food-item="${recipe.id}">
      <button type="button" class="food-card" data-food-id="${recipe.id}">
        <img
          class="food-card__image"
          src="${recipe.image}"
          alt=""
          width="96"
          height="96"
        />
        <span class="food-card__body">
          <span class="food-card__badge">
            <span class="food-card__badge-icon ${badgeClass}" aria-hidden="true"></span>
            ${recipe.badgeLabel}
          </span>
          <span class="food-card__name">${recipe.name}</span>
          <span class="food-card__meta">
            <span><span class="food-card__meta-icon food-card__meta-icon--time" aria-hidden="true"></span>${recipe.minutes}m</span>
            <span><span class="food-card__meta-icon food-card__meta-icon--temp" aria-hidden="true"></span>${recipe.temperature}°C</span>
          </span>
        </span>
      </button>
    </li>
  `;
}

function renderFoodCards(list) {
  const container = document.querySelector("#food-card-list");
  if (!container) {
    return;
  }

  if (list.length === 0) {
    container.innerHTML = `<li class="food-card-list__empty">No presets match your search.</li>`;
    container.setAttribute("aria-busy", "false");
    return;
  }

  container.innerHTML = list.map(foodCardMarkup).join("");
  container.setAttribute("aria-busy", "false");

  container.querySelectorAll(".food-card[data-food-id]").forEach((button) => {
    button.addEventListener("click", () => {
      openFoodDetail(button.dataset.foodId);
    });
  });
}

function recipeMatchesQuery(recipe, query) {
  const lower = query.toLowerCase();
  if (recipe.name.toLowerCase().includes(lower)) {
    return true;
  }
  if (recipe.ingredient.toLowerCase().includes(lower)) {
    return true;
  }
  return recipe.keywords.some((word) => word.includes(lower) || lower.includes(word));
}

function filterRecipes(query) {
  const trimmed = query.trim();
  if (!trimmed) {
    return [...recipes];
  }
  return recipes.filter((recipe) => recipeMatchesQuery(recipe, trimmed));
}

function setSearchStatus(message, type) {
  const status = document.querySelector("#home-search-status");
  if (!status) {
    return;
  }
  status.textContent = message;
  status.className = "home-search-status" + (type ? ` home-search-status--${type}` : "");
}

function openFoodDetail(foodId) {
  if (!recipesById.has(foodId)) {
    setSearchStatus("Preset not found. Try another search.", "error");
    return;
  }
  showView("detail", { foodId });
}

function handleSearchSubmit(query) {
  const matches = filterRecipes(query);

  if (!query.trim()) {
    renderFoodCards(recipes);
    setSearchStatus("");
    return;
  }

  renderFoodCards(matches);

  if (matches.length === 0) {
    setSearchStatus(`No results for “${query.trim()}”.`, "error");
    return;
  }

  if (matches.length === 1) {
    setSearchStatus(`Opening ${matches[0].name}…`, "success");
    openFoodDetail(matches[0].id);
    return;
  }

  setSearchStatus(`${matches.length} presets found. Tap a card or refine your search.`, "success");
}

function initHomeInteractions() {
  const searchForm = document.querySelector("#home-search-form");
  const searchInput = document.querySelector("#home-search-input");
  const viewAllBtn = document.querySelector(".home-popular__view-all");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const matches = filterRecipes(searchInput.value);
      renderFoodCards(matches);
      if (searchInput.value.trim()) {
        setSearchStatus(
          matches.length
            ? `${matches.length} preset${matches.length === 1 ? "" : "s"} shown.`
            : "No matching presets.",
          matches.length ? "" : "error"
        );
      } else {
        setSearchStatus("");
      }
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = searchInput ? searchInput.value : "";
      handleSearchSubmit(query);
    });
  }

  document.querySelectorAll("[data-quick-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.quickAction;
      if (action === "quick-start") {
        openFoodDetail("galettes");
        return;
      }
      if (action === "preheat") {
        setSearchStatus("Preheat ready in 3 minutes. Start with your chosen preset.", "success");
      }
    });
  });

  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
      }
      renderFoodCards(recipes);
      setSearchStatus("Showing all quick food presets.", "");
    });
  }
}

async function loadRecipes() {
  const container = document.querySelector("#food-card-list");

  try {
    const response = await fetch("data/recipes.json");
    if (!response.ok) {
      throw new Error("Recipe data failed to load.");
    }

    recipes = await response.json();
    recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
    renderFoodCards(recipes);
  } catch (error) {
    if (container) {
      container.innerHTML =
        `<li class="food-card-list__empty">Recipe presets are unavailable. Please refresh the page.</li>`;
      container.setAttribute("aria-busy", "false");
    }
    setSearchStatus("Could not load recipe presets.", "error");
  }
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
  loadRecipes();
  initHomeInteractions();
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
