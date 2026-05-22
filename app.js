/**
 * Smart Air Fryer Assistant — Figma-driven app.
 * Commit 6: detail feedback form and ratings storage.
 */

const VIEWS = ["home", "detail", "shopping", "history"];
const DEFAULT_VIEW = "home";
const SELECTED_FOOD_KEY = "atelierKitchenSelectedFood";
const PRESETS_STORAGE_KEY = "atelierKitchenFoodPresets";
const RATINGS_STORAGE_KEY = "atelierKitchenFoodRatings";

const viewElements = new Map();
const navButtons = [];

const FALLBACK_RECIPES = [
  {
    id: "galettes",
    name: "French Galettes",
    description: "Crispy buckwheat galettes with even browning from frozen.",
    temperature: 180,
    minutes: 12,
    servings: 2,
    ingredient: "French galettes",
    keywords: ["galette", "galettes", "french", "buckwheat", "jambon"],
    badge: "preset",
    badgeLabel: "Preset available",
    image: "https://www.figma.com/api/mcp/asset/8b2652d1-8751-4c8c-8501-0f59fe4dfb98",
    tip: "Flip once halfway for even crisping.",
    tagline: "Savory buckwheat crepes from Brittany",
    chefNote:
      "The key to a perfect galette complétte is a high-heat sear followed by a gentle melt of the gruyère. Don't be afraid of the lacy edges—they're the best part."
  },
  {
    id: "ham",
    name: "Frozen Ham",
    description: "Frozen ham slices reheated without drying out.",
    temperature: 165,
    minutes: 18,
    servings: 2,
    ingredient: "Frozen ham",
    keywords: ["ham", "jambon", "frozen", "pork"],
    badge: "frozen",
    badgeLabel: "Frozen setting",
    image: "https://www.figma.com/api/mcp/asset/b25c3aec-2a00-460d-960c-7e3f23f67456",
    tip: "Use light oil spray to avoid drying.",
    tagline: "Frozen ham slices, crisp outside and juicy inside",
    chefNote:
      "Pat slices dry before cooking. A light oil spray keeps the ham from drying while the edges crisp up."
  },
  {
    id: "seafood",
    name: "Seafood Mix",
    description: "Mixed seafood with quick high-heat finish.",
    temperature: 200,
    minutes: 8,
    servings: 2,
    ingredient: "Seafood mix",
    keywords: ["seafood", "shrimp", "fish", "mix", "healthy"],
    badge: "healthy",
    badgeLabel: "Healthy choice",
    image: "https://www.figma.com/api/mcp/asset/24c5963a-889f-4af7-8263-e7c38bbcc06e",
    tip: "Preheat for 2 minutes before cooking.",
    tagline: "Mixed seafood with a quick high-heat finish",
    chefNote:
      "Preheat the basket for two minutes. Cook in a single layer and shake halfway for even color."
  }
];

let activeDetailFoodId = null;

let recipes = [];
let recipesById = new Map();
let recipesReady = false;

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

function readPresets() {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writePresets(presets) {
  localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
}

function getPresetForFood(foodId) {
  return readPresets()[foodId] || null;
}

function savePresetForFood(foodId, partial) {
  const presets = readPresets();
  presets[foodId] = {
    ...presets[foodId],
    ...partial,
    updatedAt: Date.now()
  };
  writePresets(presets);
}

function setDetailStatus(message, type) {
  const status = document.querySelector("#detail-status");
  if (!status) {
    return;
  }
  status.textContent = message;
  status.className = "detail-status" + (type ? ` detail-status--${type}` : "");
}

function setFeedbackStatus(message, type) {
  const status = document.querySelector("#detail-feedback-status");
  if (!status) {
    return;
  }
  status.textContent = message;
  status.className = "detail-feedback__status" + (type ? ` detail-feedback__status--${type}` : "");
}

function readRatings() {
  try {
    const raw = localStorage.getItem(RATINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeRatings(ratings) {
  localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(ratings));
}

function getRatingForFood(foodId) {
  return readRatings()[foodId] || null;
}

function saveRatingForFood(foodId, partial) {
  const ratings = readRatings();
  ratings[foodId] = {
    ...ratings[foodId],
    ...partial,
    updatedAt: Date.now()
  };
  writeRatings(ratings);
}

function getStarRowsForField(field) {
  return document.querySelectorAll(`.detail-star-row[data-rating-field="${field}"]`);
}

function setStarRowValue(row, value) {
  const stars = row.querySelectorAll(".detail-star[data-star-value]");
  stars.forEach((button) => {
    const starValue = Number(button.dataset.starValue);
    const isOn = starValue <= value;
    button.classList.toggle("detail-star--on", isOn);
    button.setAttribute("aria-pressed", isOn ? "true" : "false");
  });
  row.dataset.value = String(value);
}

function setRatingFieldValue(field, value) {
  const clamped = Math.min(5, Math.max(0, value));
  getStarRowsForField(field).forEach((row) => {
    setStarRowValue(row, clamped);
  });
}

function getRatingFieldValue(field) {
  const row = document.querySelector(`.detail-star-row[data-rating-field="${field}"]`);
  return row ? Number(row.dataset.value || 0) : 0;
}

function getSelectedFeedbackTag() {
  const active = document.querySelector('.detail-feedback__tag[aria-pressed="true"]');
  return active ? active.dataset.feedbackTag : "";
}

function setSelectedFeedbackTag(tag) {
  document.querySelectorAll(".detail-feedback__tag").forEach((button) => {
    const isActive = button.dataset.feedbackTag === tag;
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function clearFeedbackForm() {
  setRatingFieldValue("crunchiness", 0);
  setRatingFieldValue("satisfaction", 0);
  setSelectedFeedbackTag("");
  const note = document.querySelector("#detail-personal-note");
  if (note) {
    note.value = "";
  }
  setFeedbackStatus("");
}

function renderFeedbackForm(foodId) {
  const saveBtn = document.querySelector("#detail-save-review");
  const rating = foodId ? getRatingForFood(foodId) : null;

  if (!foodId) {
    clearFeedbackForm();
    if (saveBtn) {
      saveBtn.disabled = true;
    }
    return;
  }

  if (saveBtn) {
    saveBtn.disabled = false;
  }

  setRatingFieldValue("crunchiness", rating?.crunchiness || 0);
  setRatingFieldValue("satisfaction", rating?.satisfaction || 0);
  setSelectedFeedbackTag(rating?.tag || "");

  const note = document.querySelector("#detail-personal-note");
  if (note) {
    note.value = rating?.personalNote || "";
  }

  if (rating?.submittedAt) {
    setFeedbackStatus("Previous review loaded. Update and save again anytime.", "success");
  } else {
    setFeedbackStatus("");
  }
}

function getFeedbackMessage(crunchiness, satisfaction) {
  const average = (crunchiness + satisfaction) / 2;
  if (average < 3) {
    return "Thanks for the honest feedback — we'll tune this preset.";
  }
  if (average >= 4.5) {
    return "Glad it turned out great! Your review was saved.";
  }
  return "Review saved. Thanks for helping improve our presets.";
}

function clampDetailInputs() {
  const tempInput = document.querySelector("#detail-temperature");
  const minutesInput = document.querySelector("#detail-minutes");

  if (tempInput) {
    const temp = Number(tempInput.value);
    if (Number.isFinite(temp)) {
      tempInput.value = String(Math.min(250, Math.max(80, temp)));
    }
  }

  if (minutesInput) {
    const mins = Number(minutesInput.value);
    if (Number.isFinite(mins)) {
      minutesInput.value = String(Math.min(120, Math.max(1, mins)));
    }
  }
}

function persistDetailParameters(foodId) {
  if (!foodId) {
    return;
  }

  clampDetailInputs();

  const tempInput = document.querySelector("#detail-temperature");
  const minutesInput = document.querySelector("#detail-minutes");
  const favoriteBtn = document.querySelector("#detail-save-favorite");

  if (!tempInput || !minutesInput) {
    return;
  }

  const temperature = Number(tempInput.value);
  const minutes = Number(minutesInput.value);

  if (!Number.isFinite(temperature) || !Number.isFinite(minutes)) {
    return;
  }

  savePresetForFood(foodId, {
    temperature,
    minutes,
    favorited: favoriteBtn ? favoriteBtn.getAttribute("aria-pressed") === "true" : false
  });
}

function renderDetailScreen(foodId) {
  const emptyEl = document.querySelector("#detail-empty");
  const contentEl = document.querySelector("#detail-content");
  const recipe = foodId ? recipesById.get(foodId) : null;

  activeDetailFoodId = recipe ? foodId : null;

  if (!emptyEl || !contentEl) {
    return;
  }

  if (!recipe) {
    emptyEl.hidden = false;
    contentEl.hidden = true;
    setDetailStatus("");
    renderFeedbackForm(null);
    return;
  }

  emptyEl.hidden = true;
  contentEl.hidden = false;

  const saved = getPresetForFood(foodId);
  const temperature = saved?.temperature ?? recipe.temperature;
  const minutes = saved?.minutes ?? recipe.minutes;
  const favorited = Boolean(saved?.favorited);

  const heroImage = document.querySelector("#detail-hero-image");
  const titleEl = document.querySelector("#detail-title");
  const taglineEl = document.querySelector("#detail-tagline");
  const tempInput = document.querySelector("#detail-temperature");
  const minutesInput = document.querySelector("#detail-minutes");
  const favoriteBtn = document.querySelector("#detail-save-favorite");
  const chefNoteEl = document.querySelector("#detail-chef-note");

  if (heroImage) {
    heroImage.src = recipe.image;
    heroImage.alt = recipe.name;
  }

  if (titleEl) {
    titleEl.textContent = recipe.name;
  }

  if (taglineEl) {
    taglineEl.textContent = recipe.tagline || recipe.description;
  }

  if (tempInput) {
    tempInput.value = String(temperature);
  }

  if (minutesInput) {
    minutesInput.value = String(minutes);
  }

  if (favoriteBtn) {
    favoriteBtn.setAttribute("aria-pressed", favorited ? "true" : "false");
    favoriteBtn.querySelector(".detail-favorite__text").textContent = favorited
      ? "Saved to Favorites"
      : "Save to Favorites";
  }

  if (chefNoteEl) {
    chefNoteEl.textContent = recipe.chefNote || recipe.tip;
  }

  setDetailStatus(
    saved ? "Restored your saved settings for this preset." : "Recommended settings loaded.",
    saved ? "success" : ""
  );

  renderFeedbackForm(foodId);
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
    renderDetailScreen(activeFoodId);
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

function normalizeSearchText(value) {
  return value.trim().toLowerCase();
}

function recipeMatchesQuery(recipe, query) {
  const lower = normalizeSearchText(query);
  if (!lower) {
    return true;
  }

  const fields = [
    recipe.id,
    recipe.name,
    recipe.ingredient,
    recipe.description,
    ...(recipe.keywords || [])
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  if (fields.some((field) => field.includes(lower))) {
    return true;
  }

  const nameWords = recipe.name.toLowerCase().split(/\s+/);
  return nameWords.some((word) => word.startsWith(lower) || lower.startsWith(word));
}

function setRecipesData(list) {
  recipes = list;
  recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  recipesReady = true;
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
  if (!recipesReady || recipes.length === 0) {
    setSearchStatus("Presets are still loading. Please try again in a moment.", "error");
    return;
  }

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
      if (!recipesReady) {
        setSearchStatus("Presets are still loading…", "");
        return;
      }
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

    const data = await response.json();
    setRecipesData(data);
    renderFoodCards(recipes);
    setSearchStatus("");
  } catch (error) {
    setRecipesData(FALLBACK_RECIPES);
    renderFoodCards(recipes);
    setSearchStatus(
      window.location.protocol === "file:"
        ? "Using built-in presets. For AJAX loading, run: python -m http.server 8000"
        : "Loaded built-in presets (network fetch unavailable).",
      ""
    );
    if (container) {
      container.setAttribute("aria-busy", "false");
    }
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

function initDetailInteractions() {
  const goHomeBtn = document.querySelector("#detail-go-home");
  const favoriteBtn = document.querySelector("#detail-save-favorite");
  const shoppingBtn = document.querySelector("#detail-shopping-list");
  const tempInput = document.querySelector("#detail-temperature");
  const minutesInput = document.querySelector("#detail-minutes");

  if (goHomeBtn) {
    goHomeBtn.addEventListener("click", () => {
      showView("home");
    });
  }

  if (favoriteBtn) {
    favoriteBtn.addEventListener("click", () => {
      if (!activeDetailFoodId) {
        return;
      }

      const isSaved = favoriteBtn.getAttribute("aria-pressed") === "true";
      const nextSaved = !isSaved;
      favoriteBtn.setAttribute("aria-pressed", nextSaved ? "true" : "false");
      favoriteBtn.querySelector(".detail-favorite__text").textContent = nextSaved
        ? "Saved to Favorites"
        : "Save to Favorites";

      persistDetailParameters(activeDetailFoodId);
      setDetailStatus(
        nextSaved ? "Preset saved to favorites." : "Removed from favorites.",
        "success"
      );
    });
  }

  const onParameterChange = () => {
    if (!activeDetailFoodId) {
      return;
    }
    persistDetailParameters(activeDetailFoodId);
    setDetailStatus("Settings updated.", "success");
  };

  if (tempInput) {
    tempInput.addEventListener("change", onParameterChange);
  }

  if (minutesInput) {
    minutesInput.addEventListener("change", onParameterChange);
  }

  if (shoppingBtn) {
    shoppingBtn.addEventListener("click", () => {
      if (!activeDetailFoodId) {
        setDetailStatus("Select a food preset first.", "error");
        return;
      }
      persistDetailParameters(activeDetailFoodId);
      sessionStorage.setItem("atelierKitchenPendingListFood", activeDetailFoodId);
      setDetailStatus("Opening shopping list…", "success");
      showView("shopping");
    });
  }
}

function initDetailFeedbackInteractions() {
  document.querySelectorAll(".detail-star-row").forEach((row) => {
    const field = row.dataset.ratingField;
    row.querySelectorAll(".detail-star[data-star-value]").forEach((button) => {
      button.addEventListener("click", () => {
        const value = Number(button.dataset.starValue);
        setRatingFieldValue(field, value);
        setFeedbackStatus("");
      });
    });
  });

  document.querySelectorAll(".detail-feedback__tag").forEach((button) => {
    button.addEventListener("click", () => {
      const isActive = button.getAttribute("aria-pressed") === "true";
      setSelectedFeedbackTag(isActive ? "" : button.dataset.feedbackTag);
      setFeedbackStatus("");
    });
  });

  const saveReviewBtn = document.querySelector("#detail-save-review");
  if (saveReviewBtn) {
    saveReviewBtn.addEventListener("click", () => {
      if (!activeDetailFoodId) {
        setFeedbackStatus("Select a food preset before saving a review.", "error");
        return;
      }

      const crunchiness = getRatingFieldValue("crunchiness");
      const satisfaction = getRatingFieldValue("satisfaction");

      if (crunchiness < 1 || satisfaction < 1) {
        setFeedbackStatus("Please rate both crunchiness and overall satisfaction.", "error");
        return;
      }

      const personalNote = document.querySelector("#detail-personal-note");
      saveRatingForFood(activeDetailFoodId, {
        crunchiness,
        satisfaction,
        tag: getSelectedFeedbackTag(),
        personalNote: personalNote ? personalNote.value.trim() : "",
        submittedAt: Date.now()
      });

      setFeedbackStatus(getFeedbackMessage(crunchiness, satisfaction), "success");
    });
  }
}

async function initApp() {
  if (!document.querySelector("#view-home")) {
    return;
  }

  initRouting();
  initHeaderActions();
  await loadRecipes();
  initHomeInteractions();
  initDetailInteractions();
  initDetailFeedbackInteractions();
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
