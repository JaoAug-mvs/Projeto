import {
  calculateBMI,
  calculateMacroTargets,
  calculateMaintenanceCalories,
  calculateTargetCalories,
  getBMIStatus,
  getGoalMeta,
} from "./calculations.js";
import { mealDistribution, mealLibrary } from "./mealData.js";
import {
  clamp,
  formatDate,
  formatNumber,
  normalizeText,
  roundTo,
  toDisplayText,
} from "./helpers.js";

function getBlockedTerms(profile) {
  return [
    ...(profile.intolerances ?? []),
    ...(profile.allergies ?? []),
    ...(profile.dislikedFoods ?? []),
  ].map(normalizeText);
}

function getPreferredTerms(profile) {
  return (profile.preferredFoods ?? []).map(normalizeText);
}

function optionMatchesTerm(option, term) {
  const bucket = normalizeText([option.name, ...(option.ingredients ?? []), ...(option.tags ?? [])].join(" "));

  return bucket.includes(term);
}

const fallbackCatalog = {
  breakfast: [
    { food: "Bebida vegetal sem açúcar", amount: 220, unit: "ml", calories: 70, protein: 2, carbs: 9, fat: 2 },
    { food: "Aveia", amount: 35, unit: "g", calories: 130, protein: 5, carbs: 22, fat: 3 },
    { food: "Fruta da estação", amount: 1, unit: "un", calories: 80, protein: 1, carbs: 20, fat: 0 },
    { food: "Sementes de chia", amount: 15, unit: "g", calories: 75, protein: 3, carbs: 6, fat: 5 },
  ],
  morningSnack: [
    { food: "Fruta da estação", amount: 1, unit: "un", calories: 80, protein: 1, carbs: 20, fat: 0 },
    { food: "Sementes ou castanhas", amount: 20, unit: "g", calories: 120, protein: 4, carbs: 4, fat: 10 },
    { food: "Iogurte vegetal", amount: 140, unit: "g", calories: 85, protein: 4, carbs: 10, fat: 3 },
  ],
  lunch: [
    { food: "Proteína principal de preferência", amount: 140, unit: "g", calories: 220, protein: 28, carbs: 2, fat: 10 },
    { food: "Arroz, quinoa ou tubérculo", amount: 140, unit: "g", calories: 180, protein: 4, carbs: 36, fat: 2 },
    { food: "Leguminosas", amount: 100, unit: "g", calories: 120, protein: 8, carbs: 20, fat: 1 },
    { food: "Salada variada", amount: 120, unit: "g", calories: 45, protein: 2, carbs: 8, fat: 1 },
  ],
  afternoonSnack: [
    { food: "Sanduíche simples no pão ou tapioca", amount: 1, unit: "un", calories: 180, protein: 8, carbs: 28, fat: 4 },
    { food: "Pasta leve ou recheio proteico", amount: 40, unit: "g", calories: 90, protein: 7, carbs: 5, fat: 4 },
    { food: "Fruta", amount: 1, unit: "un", calories: 70, protein: 1, carbs: 18, fat: 0 },
  ],
  dinner: [
    { food: "Proteína principal", amount: 120, unit: "g", calories: 190, protein: 24, carbs: 2, fat: 8 },
    { food: "Base de carboidrato", amount: 120, unit: "g", calories: 150, protein: 3, carbs: 32, fat: 1 },
    { food: "Legumes cozidos ou salteados", amount: 160, unit: "g", calories: 90, protein: 4, carbs: 16, fat: 2 },
  ],
  supper: [
    { food: "Iogurte vegetal ou leite vegetal", amount: 180, unit: "ml", calories: 80, protein: 4, carbs: 10, fat: 3 },
    { food: "Fruta leve", amount: 1, unit: "un", calories: 65, protein: 1, carbs: 16, fat: 0 },
    { food: "Sementes", amount: 10, unit: "g", calories: 55, protein: 2, carbs: 2, fat: 4 },
  ],
};

function isItemBlocked(foodLabel, blockedTerms) {
  const normalized = normalizeText(foodLabel);
  return blockedTerms.some((term) => normalized.includes(term) || term.includes(normalized));
}

function createFallbackMeal(mealKey, definition, targetCalories, blockedTerms) {
  const catalog = fallbackCatalog[mealKey] ?? [];
  const compatibleItems = catalog.filter((item) => !isItemBlocked(item.food, blockedTerms));
  const chosen = (compatibleItems.length ? compatibleItems : catalog).slice(0, 4);
  const baseCalories = chosen.reduce((sum, item) => sum + item.calories, 0) || targetCalories;
  const multiplier = clamp(targetCalories / baseCalories, 0.85, 1.25);

  return {
    key: mealKey,
    label: definition.label,
    name: `Sugestão flexível de ${definition.label.toLowerCase()}`,
    calories: Math.round(baseCalories * multiplier),
    protein: Math.round(chosen.reduce((sum, item) => sum + item.protein, 0) * multiplier),
    carbs: Math.round(chosen.reduce((sum, item) => sum + item.carbs, 0) * multiplier),
    fat: Math.round(chosen.reduce((sum, item) => sum + item.fat, 0) * multiplier),
    items: chosen.map((item) => ({
      ...item,
      formattedAmount: formatAmount(item.amount * multiplier, item.unit),
    })),
    alternatives: [],
    ingredients: chosen.map((item) => item.food),
  };
}

function isOptionAllowed(option, profile, blockedTerms) {
  if (profile.vegetarian && !option.vegetarian) {
    return false;
  }

  return !blockedTerms.some((term) => optionMatchesTerm(option, term));
}

function countPreferredHits(option, preferredTerms) {
  return preferredTerms.filter((term) => optionMatchesTerm(option, term)).length;
}

function countOverlap(option, usedIngredients) {
  return option.ingredients.filter((ingredient) =>
    usedIngredients.has(normalizeText(ingredient))
  ).length;
}

function getMealScore(option, targetCalories, profile, preferredTerms, usedIngredients) {
  const preferredHits = countPreferredHits(option, preferredTerms);
  const overlap = countOverlap(option, usedIngredients);
  const caloriePenalty = Math.abs(targetCalories - option.calories);
  const proteinBias = profile.goal === "ganhar" ? option.protein * 2 : option.protein;
  const satietyBias =
    profile.goal === "emagrecer" ? option.protein * 1.5 + option.fat * 0.3 : 0;

  return preferredHits * 100 + proteinBias + satietyBias - overlap * 22 - caloriePenalty;
}

function formatAmount(amount, unit) {
  if (["g", "ml"].includes(unit)) {
    return `${formatNumber(roundTo(amount, 5))} ${unit}`;
  }

  const rounded = roundTo(amount, 0.5);
  return `${formatNumber(rounded, rounded % 1 === 0 ? 0 : 1)} ${unit}`;
}

function scaleMeal(option, targetCalories) {
  const multiplier = clamp(targetCalories / option.calories, 0.85, 1.25);
  const calories = Math.round(option.calories * multiplier);

  return {
    ...option,
    calories,
    protein: Math.round(option.protein * multiplier),
    carbs: Math.round(option.carbs * multiplier),
    fat: Math.round(option.fat * multiplier),
    items: option.items.map((item) => ({
      ...item,
      formattedAmount: formatAmount(item.amount * multiplier, item.unit),
    })),
  };
}

function pickMealOptions(profile, dailyCalories) {
  const blockedTerms = getBlockedTerms(profile);
  const preferredTerms = getPreferredTerms(profile);
  const usedIngredients = new Set();

  return Object.entries(mealDistribution).map(([mealKey, definition]) => {
    const targetCalories = Math.round(dailyCalories * definition.share);
    const options = mealLibrary[mealKey].filter((option) =>
      isOptionAllowed(option, profile, blockedTerms)
    );

    if (!options.length) {
      return createFallbackMeal(mealKey, definition, targetCalories, blockedTerms);
    }

    const scored = options
      .slice()
      .sort(
        (a, b) =>
          getMealScore(b, targetCalories, profile, preferredTerms, usedIngredients) -
          getMealScore(a, targetCalories, profile, preferredTerms, usedIngredients)
      );

    const primary = scaleMeal(scored[0], targetCalories);
    primary.ingredients.forEach((ingredient) => usedIngredients.add(normalizeText(ingredient)));

    const alternatives = scored
      .slice(1, 3)
      .map((option) => scaleMeal(option, targetCalories))
      .map((option) => ({ name: option.name, calories: option.calories }));

    return {
      key: mealKey,
      label: definition.label,
      ...primary,
      alternatives,
    };
  });
}

function getAdaptiveRecommendation(profile, progress) {
  if (!progress || progress.length < 2) {
    return {
      delta: 0,
      message:
        "Registre seu peso ao longo das semanas para receber ajustes automáticos mais precisos.",
      wasAdjusted: false,
    };
  }

  const sorted = progress.slice().sort((a, b) => a.date.localeCompare(b.date));
  const previous = sorted[sorted.length - 2];
  const latest = sorted[sorted.length - 1];
  const days = Math.max(
    1,
    Math.round(
      (new Date(`${latest.date}T12:00:00`) - new Date(`${previous.date}T12:00:00`)) / 86400000
    )
  );
  const weightDelta = latest.weight - previous.weight;

  if (profile.goal === "emagrecer") {
    if (days >= 7 && weightDelta >= -0.1) {
      return {
        delta: -120,
        message: "Sua dieta foi ajustada com base no seu progresso para reforçar o déficit calórico.",
        wasAdjusted: true,
      };
    }
    if (days >= 7 && weightDelta <= -1.1) {
      return {
        delta: 100,
        message: "Sua evolução foi rápida; a dieta recebeu um leve aumento calórico para preservar energia.",
        wasAdjusted: true,
      };
    }
  }

  if (profile.goal === "ganhar") {
    if (days >= 7 && weightDelta <= 0.1) {
      return {
        delta: 130,
        message: "Sua dieta foi ajustada com base no seu progresso para favorecer o ganho de massa.",
        wasAdjusted: true,
      };
    }
    if (days >= 7 && weightDelta >= 1.2) {
      return {
        delta: -110,
        message:
          "O ganho de peso veio acima do esperado; a recomendação calórica foi suavemente reduzida.",
        wasAdjusted: true,
      };
    }
  }

  if (profile.goal === "manter" && Math.abs(weightDelta) >= 0.8) {
    return {
      delta: weightDelta > 0 ? -90 : 90,
      message:
        "Sua dieta foi ajustada com base no seu progresso para trazer o peso de volta à faixa de equilíbrio.",
      wasAdjusted: true,
    };
  }

  return {
    delta: 0,
    message: "Seu progresso está consistente com a meta atual. Continue registrando suas atualizações.",
    wasAdjusted: false,
  };
}

export function generateDietPlan(profile, progress = []) {
  const adaptive = getAdaptiveRecommendation(profile, progress);
  const maintenanceCalories = Math.round(calculateMaintenanceCalories(profile));
  const targetCalories = calculateTargetCalories(profile, adaptive.delta);
  const bmi = calculateBMI(profile.weight, profile.height);
  const macros = calculateMacroTargets(profile, targetCalories);
  const meals = pickMealOptions(profile, targetCalories);
  const dailyCalories = meals.reduce((total, meal) => total + meal.calories, 0);
  const goalMeta = getGoalMeta(profile.goal);

  return {
    createdAt: new Date().toISOString(),
    createdAtLabel: formatDate(new Date().toISOString().slice(0, 10)),
    maintenanceCalories,
    targetCalories,
    dailyCalories,
    bmi: Number(bmi.toFixed(1)),
    bmiStatus: getBMIStatus(bmi),
    macros,
    meals,
    goalMeta,
    adaptive,
    summary: `${goalMeta.headline} Estimativa diária em torno de ${formatNumber(dailyCalories)} kcal.`,
    restrictionSummary: [
      profile.vegetarian ? "vegetariano" : null,
      ...(profile.intolerances ?? []).map(toDisplayText),
      ...(profile.allergies ?? []).map(toDisplayText),
    ].filter(Boolean),
  };
}
