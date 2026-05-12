const cookingForm = document.querySelector("#cooking-form");
const planOutput = document.querySelector("#plan-output");
const portionInput = document.querySelector("#portion");
const portionError = document.querySelector("#portion-error");
const lastSaved = document.querySelector("#last-saved");
const storageKey = "atelierKitchenCookingPreference";

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
