import { clamp } from "./helpers.js";

export const activityLevels = {
  sedentario: { label: "Sedentário", factor: 1.2 },
  leve: { label: "Levemente ativo", factor: 1.375 },
  moderado: { label: "Moderadamente ativo", factor: 1.55 },
  intenso: { label: "Muito ativo", factor: 1.725 },
};

export const goals = {
  emagrecer: {
    label: "Emagrecer",
    calorieDelta: -450,
    headline: "Foco em déficit calórico com saciedade e constância.",
    targetText: "Perder gordura de forma gradual e sustentável",
  },
  ganhar: {
    label: "Ganhar massa",
    calorieDelta: 320,
    headline: "Foco em superávit leve e boa ingestão proteica.",
    targetText: "Aumentar massa muscular com energia e recuperação",
  },
  manter: {
    label: "Manter peso",
    calorieDelta: 0,
    headline: "Foco em equilíbrio calórico e rotina alimentar estável.",
    targetText: "Preservar composição corporal e rotina saudável",
  },
};

export function calculateBMI(weight, heightCm) {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

export function getBMIStatus(bmi) {
  if (bmi < 18.5) {
    return "Abaixo do peso";
  }
  if (bmi < 25) {
    return "Faixa considerada adequada";
  }
  if (bmi < 30) {
    return "Sobrepeso";
  }
  return "Obesidade";
}

export function calculateBMR({ weight, height, age, sex }) {
  const base = 10 * weight + 6.25 * height - 5 * age;

  if (sex === "masculino") {
    return base + 5;
  }
  if (sex === "feminino") {
    return base - 161;
  }

  return base - 78;
}

export function calculateMaintenanceCalories(profile) {
  const activityFactor = activityLevels[profile.activity]?.factor ?? 1.2;
  return calculateBMR(profile) * activityFactor;
}

export function calculateTargetCalories(profile, adaptiveDelta = 0) {
  const maintenance = calculateMaintenanceCalories(profile);
  const goalDelta = goals[profile.goal]?.calorieDelta ?? 0;
  const minimum = profile.sex === "masculino" ? 1500 : 1200;

  return Math.round(clamp(maintenance + goalDelta + adaptiveDelta, minimum, 4200));
}

export function calculateMacroTargets(profile, targetCalories) {
  const proteinPerKg =
    profile.goal === "ganhar" ? 2 : profile.goal === "emagrecer" ? 1.8 : 1.6;
  const fatPerKg = profile.goal === "ganhar" ? 0.9 : 0.8;
  const protein = Math.round(profile.weight * proteinPerKg);
  const fat = Math.round(profile.weight * fatPerKg);
  const remainingCalories = Math.max(targetCalories - protein * 4 - fat * 9, 0);
  const carbs = Math.round(remainingCalories / 4);

  return { protein, carbs, fat };
}

export function getGoalMeta(goal) {
  return goals[goal] ?? goals.manter;
}
