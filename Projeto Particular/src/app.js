import { renderLayout } from "./pages/layout.js";
import { loadAppState, saveAppState } from "./state/storage.js";
import { generateDietPlan } from "./utils/dietGenerator.js";
import { getTodayISO, parseListInput, uniqueBy } from "./utils/helpers.js";

function getDefaultUiState() {
  return {
    formError: "",
    progressError: "",
    profileSavedMessage: "",
    progressSavedMessage: "",
    isGenerating: false,
  };
}

function ensureBaselineProgress(profile, progress) {
  if (!profile) {
    return progress;
  }

  const baseline = {
    date: getTodayISO(),
    weight: profile.weight,
    label: "Peso inicial",
  };

  const next = progress.length ? progress : [baseline];
  return uniqueBy(next, (entry) => `${entry.date}-${entry.weight}-${entry.label ?? ""}`).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

function readProfileForm(form) {
  const fields = new FormData(form);
  return {
    name: String(fields.get("name") || "").trim(),
    age: Number(fields.get("age")),
    weight: Number(fields.get("weight")),
    height: Number(fields.get("height")),
    sex: String(fields.get("sex") || ""),
    activity: String(fields.get("activity") || ""),
    goal: String(fields.get("goal") || ""),
    vegetarian: fields.get("vegetarian") === "on",
    intolerances: parseListInput(String(fields.get("intolerances") || "")),
    allergies: parseListInput(String(fields.get("allergies") || "")),
    preferredFoods: parseListInput(String(fields.get("preferredFoods") || "")),
    dislikedFoods: parseListInput(String(fields.get("dislikedFoods") || "")),
  };
}

function validateProfile(profile) {
  if (!profile.name || !profile.sex || !profile.activity || !profile.goal) {
    return "Preencha os campos obrigatórios do perfil antes de gerar a dieta.";
  }

  if (
    Number.isNaN(profile.age) ||
    Number.isNaN(profile.weight) ||
    Number.isNaN(profile.height) ||
    profile.age < 14 ||
    profile.weight <= 0 ||
    profile.height <= 0
  ) {
    return "Confira idade, peso e altura. Esses dados precisam ser válidos para calcular a dieta.";
  }

  return "";
}

export function createApp(root) {
  let state = loadAppState();
  let uiState = getDefaultUiState();

  if (state.profile && !state.dietPlan) {
    state.progress = ensureBaselineProgress(state.profile, state.progress);
    state.dietPlan = generateDietPlan(state.profile, state.progress);
    saveAppState(state);
  }

  function persistAndRender() {
    saveAppState(state);
    render();
  }

  function render() {
    root.innerHTML = renderLayout(state, uiState);

    const profileForm = root.querySelector("#profile-form");
    const progressForm = root.querySelector("#progress-form");

    profileForm?.addEventListener("submit", handleProfileSubmit);
    progressForm?.addEventListener("submit", handleProgressSubmit);
  }

  function scrollToSection(selector) {
    const element = root.querySelector(selector);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleProfileSubmit(event) {
    event.preventDefault();

    const profile = readProfileForm(event.currentTarget);
    const validationMessage = validateProfile(profile);

    uiState = { ...getDefaultUiState(), formError: validationMessage };
    render();

    if (validationMessage) {
      return;
    }

    uiState = { ...getDefaultUiState(), isGenerating: true };
    render();

    window.setTimeout(() => {
      const progress = ensureBaselineProgress(profile, state.progress);
      state = {
        ...state,
        profile,
        progress,
        dietPlan: generateDietPlan(profile, progress),
      };
      uiState = {
        ...getDefaultUiState(),
        profileSavedMessage: "Perfil salvo com sucesso e dieta personalizada gerada.",
      };
      persistAndRender();
      scrollToSection("#resultado");
    }, 700);
  }

  function handleProgressSubmit(event) {
    event.preventDefault();

    if (!state.profile) {
      uiState = {
        ...getDefaultUiState(),
        progressError: "Salve o perfil primeiro para começar o acompanhamento.",
      };
      render();
      return;
    }

    const formData = new FormData(event.currentTarget);
    const date = String(formData.get("progressDate") || "");
    const weight = Number(formData.get("progressWeight"));

    if (!date || Number.isNaN(weight) || weight <= 0) {
      uiState = {
        ...getDefaultUiState(),
        progressError: "Informe uma data válida e um peso válido para registrar o progresso.",
      };
      render();
      return;
    }

    const entries = uniqueBy(
      [
        ...state.progress.filter((entry) => !(entry.date === date && entry.label === "Atualização de peso")),
        {
          date,
          weight,
          label: "Atualização de peso",
        },
      ],
      (entry) => `${entry.date}-${entry.label}`
    ).sort((a, b) => a.date.localeCompare(b.date));

    state = {
      ...state,
      progress: entries,
      dietPlan: generateDietPlan({ ...state.profile, weight }, entries),
      profile: { ...state.profile, weight },
    };

    uiState = {
      ...getDefaultUiState(),
      progressSavedMessage: "Progresso registrado. A dieta foi recalculada com base no novo peso.",
    };

    persistAndRender();
    scrollToSection("#acompanhamento");
  }

  render();
}
