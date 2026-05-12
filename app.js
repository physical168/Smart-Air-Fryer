const cookingForm = document.querySelector("#cooking-form");
const planOutput = document.querySelector("#plan-output");

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
  const preset = presets[ingredient];
  const textureOffset = texture === "crispy" ? 3 : texture === "gentle" ? -2 : 0;
  const portionOffset = Math.max(0, portion - 2) * 2;

  return {
    ingredient,
    portion,
    texture,
    temperature: preset.temperature,
    minutes: preset.minutes + textureOffset + portionOffset,
    reminder: preset.reminder
  };
}

function renderPlan(plan) {
  planOutput.innerHTML = `
    <h3>Suggested plan</h3>
    <p><strong>${plan.portion} portion(s) of ${plan.ingredient}</strong></p>
    <p>Cook at ${plan.temperature} degrees C for ${plan.minutes} minutes. ${plan.reminder}</p>
  `;
}

cookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const plan = buildPlan(new FormData(cookingForm));
  renderPlan(plan);
});
