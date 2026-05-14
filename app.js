const cookingForm = document.querySelector("#cooking-form");
const planOutput = document.querySelector("#plan-output");
const portionInput = document.querySelector("#portion");
const portionError = document.querySelector("#portion-error");
const lastSaved = document.querySelector("#last-saved");
const recipeList = document.querySelector("#recipe-list");
const storageKey = "atelierKitchenCookingPreference";
const favoritesKey = "atelierKitchenFavorites";
const favoritesList = document.querySelector("#favorites-list");
let allRecipes = [];

const presets = {
  potatoes: { temperature: 190, minutes: 18, reminder: "Shake the basket halfway through." },
  chicken: { temperature: 180, minutes: 16, reminder: "Check the thickest part before serving." },
  tofu: { temperature: 185, minutes: 14, reminder: "Pat dry before cooking for a firmer edge." },
  vegetables: { temperature: 175, minutes: 12, reminder: "Cut pieces evenly so they finish together." }
};

function buildPlan(formData) {
  const ingredient = formData.get("ingredient");
  const portion = Number(formData.get("portion"));
  const texture = formData.get("texture");
  const oil = formData.get("oil");
  const notes = formData.get("notes").trim();
  const dietary = formData.getAll("dietary");
  const preset = presets[ingredient];
  const textureOffset = texture === "crispy" ? 3 : texture === "gentle" ? -2 : 0;
  const portionOffset = Math.max(0, portion - 2) * 2;

  return {
    ingredient,
    portion,
    texture,
    oil,
    notes,
    dietary,
    temperature: preset.temperature,
    minutes: preset.minutes + textureOffset + portionOffset,
    reminder: preset.reminder
  };
}

function validatePortion() {
  const portion = Number(portionInput.value);
  const isValid = Number.isInteger(portion) && portion >= 1 && portion <= 6;
  portionInput.setAttribute("aria-invalid", String(!isValid));
  portionError.textContent = isValid ? "" : "Enter a whole number from 1 to 6.";
  return isValid;
}

function renderPlan(plan) {
  const oilText = {
    standard: "Use a light oil coating.",
    low: "Use a small spray of oil.",
    none: "Skip added oil and check texture halfway."
  }[plan.oil];
  const dietaryText = plan.dietary.length > 0 ? ` Dietary notes: ${plan.dietary.join(", ")}.` : "";
  const notesText = plan.notes ? ` Notes: ${plan.notes}.` : "";

  planOutput.innerHTML = `
    <h3>Suggested plan</h3>
    <p><strong>${plan.portion} portion(s) of ${plan.ingredient}</strong></p>
    <p>Cook at ${plan.temperature} degrees C for ${plan.minutes} minutes. ${plan.reminder} ${oilText}${dietaryText}${notesText}</p>
  `;
}

function savePlan(plan) {
  const savedPlan = {
    ...plan,
    savedAt: new Date().toISOString()
  };

  localStorage.setItem(storageKey, JSON.stringify(savedPlan));
  updateSavedStatus(savedPlan);
}

function updateSavedStatus(plan) {
  const date = new Date(plan.savedAt);
  lastSaved.textContent = `${plan.ingredient}, ${plan.portion} portion(s), ${date.toLocaleDateString()}`;
}

function restorePreference() {
  const saved = localStorage.getItem(storageKey);

  if (!saved) {
    return;
  }

  try {
    const plan = JSON.parse(saved);
    cookingForm.elements.ingredient.value = plan.ingredient;
    cookingForm.elements.portion.value = plan.portion;
    cookingForm.elements.texture.value = plan.texture;
    cookingForm.elements.oil.value = plan.oil;
    cookingForm.elements.notes.value = plan.notes || "";

    cookingForm.querySelectorAll('input[name="dietary"]').forEach((checkbox) => {
      checkbox.checked = plan.dietary.includes(checkbox.value);
    });

    renderPlan(plan);
    updateSavedStatus(plan);
  } catch (error) {
    localStorage.removeItem(storageKey);
  }
}

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
        <span>${recipe.temperature} degrees C</span>
        <span aria-hidden="true"> · </span>
        <time itemprop="cookTime" datetime="PT${recipe.minutes}M">${recipe.minutes} minutes</time>
        <span aria-hidden="true"> · </span>
        <span itemprop="recipeYield">${recipe.servings} serving(s)</span>
      </p>
    </article>
  `;
}

function renderRecipes(recipes) {
  const favorites = getFavorites();
  recipeList.innerHTML = recipes
    .map((recipe) => recipeCardTemplate(recipe, favorites.includes(recipe.id)))
    .join("");
}

function renderFavorites() {
  const favorites = getFavorites();
  const favRecipes = allRecipes.filter((r) => favorites.includes(r.id));

  if (favRecipes.length === 0) {
    favoritesList.innerHTML = '<p class="empty-message">No favorites saved yet.</p>';
    return;
  }

  favoritesList.innerHTML = favRecipes
    .map(
      (recipe) => `
    <div class="fav-card">
      <strong>${recipe.name}</strong>
      <p>${recipe.temperature}°C | ${recipe.minutes}m</p>
    </div>
  `
    )
    .join("");
}

function getFavorites() {
  return JSON.parse(localStorage.getItem(favoritesKey)) || [];
}

async function loadRecipes() {
  try {
    const response = await fetch("data/recipes.json");

    if (!response.ok) {
      throw new Error("Recipe data failed to load.");
    }

    const recipes = await response.json();
    allRecipes = recipes; // Store for search
    renderRecipes(recipes);
    renderFavorites();
    recipeList.setAttribute("aria-busy", "false");
  } catch (error) {
    recipeList.innerHTML = `
      <p class="loading-message">Recipe presets are unavailable. Please try again after refreshing the page.</p>
    `;
    recipeList.setAttribute("aria-busy", "false");
  }
}

function handleFavoriteClick(event) {
  const btn = event.target.closest(".btn-fav");
  if (!btn) return;
  
  const recipeId = btn.dataset.id;
  let favorites = getFavorites();
  const index = favorites.indexOf(recipeId);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(recipeId);
  }
  
  localStorage.setItem(favoritesKey, JSON.stringify(favorites));
  renderRecipes(allRecipes); // Re-render to update UI across all cards
  renderFavorites();
}

cookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validatePortion()) {
    portionInput.focus();
    return;
  }
  const plan = buildPlan(new FormData(cookingForm));
  renderPlan(plan);
  savePlan(plan);
});

portionInput.addEventListener("input", validatePortion);
restorePreference();
loadRecipes();
recipeList.addEventListener("click", handleFavoriteClick);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}
