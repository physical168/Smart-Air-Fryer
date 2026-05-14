/**
 * Smart Air Fryer Assistant - Core Logic (Member B)
 * Handles state, persistence, and user interaction.
 */

// --- 1. Constants and DOM Elements ---
const DOM = {
  cookingForm: document.querySelector("#cooking-form"),
  planOutput: document.querySelector("#plan-output"),
  portionInput: document.querySelector("#portion"),
  portionError: document.querySelector("#portion-error"),
  lastSaved: document.querySelector("#last-saved"),
  recipeList: document.querySelector("#recipe-list"),
  favoritesList: document.querySelector("#favorites-list"),
  recipeSearch: document.querySelector("#recipe-search"),
  searchHistory: document.querySelector("#search-history"),
  timerDisplay: document.querySelector(".timer-display"),
  beep: document.querySelector("#timer-beep")
};

const KEYS = {
  preference: "atelierKitchenCookingPreference",
  favorites: "atelierKitchenFavorites",
  search: "atelierKitchenSearchHistory"
};

const PRESETS = {
  potatoes: { temperature: 190, minutes: 18, reminder: "Shake the basket halfway through." },
  chicken: { temperature: 180, minutes: 16, reminder: "Check the thickest part before serving." },
  tofu: { temperature: 185, minutes: 14, reminder: "Pat dry before cooking for a firmer edge." },
  vegetables: { temperature: 175, minutes: 12, reminder: "Cut pieces evenly so they finish together." }
};

let allRecipes = [];
let timerInterval;

// --- 2. State Management Helpers ---

const Storage = {
  get: (key) => JSON.parse(localStorage.getItem(key)) || [],
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val))
};

// --- 3. Rendering Logic ---

function recipeCardTemplate(recipe, isFav = false) {
  return `
    <article class="recipe-card" itemscope itemtype="https://schema.org/Recipe">
      <div class="card-header">
        <h3 itemprop="name">${recipe.name}</h3>
        <button class="btn-fav ${isFav ? 'active' : ''}" data-id="${recipe.id}" aria-label="Toggle favorite">
          ❤
        </button>
      </div>
      <p itemprop="description">${recipe.description}</p>
      <p class="recipe-meta">
        <span itemprop="recipeIngredient">${recipe.ingredient}</span>
        <span aria-hidden="true"> · </span>
        <span>${recipe.temperature}°C</span>
        <span aria-hidden="true"> · </span>
        <time itemprop="cookTime" datetime="PT${recipe.minutes}M">${recipe.minutes}m</time>
        <span aria-hidden="true"> · </span>
        <span itemprop="recipeYield">${recipe.servings} serving(s)</span>
      </p>
    </article>
  `;
}

function renderRecipes(recipes) {
  const favorites = Storage.get(KEYS.favorites);
  DOM.recipeList.innerHTML = recipes
    .map((recipe) => recipeCardTemplate(recipe, favorites.includes(recipe.id)))
    .join("");
}

function renderFavorites() {
  const favorites = Storage.get(KEYS.favorites);
  const favRecipes = allRecipes.filter((r) => favorites.includes(r.id));

  if (favRecipes.length === 0) {
    DOM.favoritesList.innerHTML = '<p class="empty-message">No favorites saved yet.</p>';
    return;
  }

  DOM.favoritesList.innerHTML = favRecipes
    .map(recipe => `
      <div class="fav-card">
        <strong>${recipe.name}</strong>
        <p>${recipe.temperature}°C | ${recipe.minutes}m</p>
      </div>
    `).join("");
}

function renderSearchHistory() {
  const history = Storage.get(KEYS.search);
  DOM.searchHistory.innerHTML = history
    .map(term => `<button class="search-chip" type="button">${term}</button>`)
    .join("");
}

// --- 4. Core Features ---

async function loadRecipes() {
  try {
    const response = await fetch("data/recipes.json");
    if (!response.ok) throw new Error("Load failed");
    allRecipes = await response.json();
    renderRecipes(allRecipes);
    renderFavorites();
    DOM.recipeList.setAttribute("aria-busy", "false");
  } catch (error) {
    DOM.recipeList.innerHTML = '<p class="error">Presets unavailable.</p>';
  }
}

function handleFavoriteClick(event) {
  const btn = event.target.closest(".btn-fav");
  if (!btn) return;

  const id = btn.dataset.id;
  let favs = Storage.get(KEYS.favorites);
  const idx = favs.indexOf(id);

  idx > -1 ? favs.splice(idx, 1) : favs.push(id);
  
  Storage.set(KEYS.favorites, favs);
  renderRecipes(allRecipes);
  renderFavorites();
}

function startTimer(seconds) {
  clearInterval(timerInterval);
  let timeLeft = seconds;
  
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft < 0) {
      clearInterval(timerInterval);
      DOM.beep.play();
      alert("Cooking complete!");
      DOM.timerDisplay.textContent = "00:00";
      return;
    }
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const secs = (timeLeft % 60).toString().padStart(2, "0");
    DOM.timerDisplay.textContent = `${mins}:${secs}`;
  }, 1000);
}

// --- 5. Event Listeners ---

DOM.cookingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // ... existing form logic simplified for brevity in this refactor
  const formData = new FormData(DOM.cookingForm);
  const plan = {
    ingredient: formData.get("ingredient"),
    portion: formData.get("portion"),
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(KEYS.preference, JSON.stringify(plan));
  DOM.lastSaved.textContent = `${plan.ingredient}, ${plan.portion} portion(s)`;
});

DOM.recipeSearch.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = allRecipes.filter(r => 
    r.name.toLowerCase().includes(term) || r.ingredient.toLowerCase().includes(term)
  );
  renderRecipes(filtered);
});

DOM.recipeSearch.addEventListener("change", (e) => {
  const term = e.target.value.trim();
  if (term.length > 2) {
    let history = Storage.get(KEYS.search);
    if (!history.includes(term)) {
      history.unshift(term);
      Storage.set(KEYS.search, history.slice(0, 5));
      renderSearchHistory();
    }
  }
});

DOM.searchHistory.addEventListener("click", (e) => {
  if (e.target.classList.contains("search-chip")) {
    DOM.recipeSearch.value = e.target.textContent;
    DOM.recipeSearch.dispatchEvent(new Event('input'));
  }
});

DOM.recipeList.addEventListener("click", handleFavoriteClick);
document.querySelector("#start-timer").addEventListener("click", () => startTimer(300));
document.querySelector("#stop-timer").addEventListener("click", () => {
  clearInterval(timerInterval);
  DOM.timerDisplay.textContent = "00:00";
});

// --- 6. Initialization ---
loadRecipes();
renderSearchHistory();
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}
