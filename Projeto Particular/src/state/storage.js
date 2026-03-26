const STORAGE_KEY = "nutriflow-app-state-v1";

export function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { profile: null, dietPlan: null, progress: [] };
    }

    const parsed = JSON.parse(raw);
    return {
      profile: parsed.profile ?? null,
      dietPlan: parsed.dietPlan ?? null,
      progress: parsed.progress ?? [],
    };
  } catch (error) {
    console.error("Falha ao carregar dados salvos:", error);
    return { profile: null, dietPlan: null, progress: [] };
  }
}

export function saveAppState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
