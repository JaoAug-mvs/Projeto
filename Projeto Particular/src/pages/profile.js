import {
  renderCheckboxField,
  renderInputField,
  renderSelectField,
  renderTextareaField,
} from "../components/formControls.js";
import { activityLevels, goals } from "../utils/calculations.js";

export function renderProfileSection(profile, uiState) {
  const current = profile ?? {};

  return `
    <section class="section" id="perfil">
      <div class="section__intro">
        <span class="eyebrow">Perfil</span>
        <h2>Conte um pouco sobre você</h2>
        <p>
          Esses dados alimentam o cálculo de IMC, gasto calórico estimado e montagem automática do
          plano alimentar.
        </p>
      </div>
      <div class="panel-grid">
        <article class="panel panel--form">
          <form id="profile-form" class="form-grid">
            ${renderInputField({
              id: "name",
              label: "Nome",
              placeholder: "Seu nome",
              value: current.name ?? "",
              required: true,
            })}
            ${renderInputField({
              id: "age",
              label: "Idade",
              type: "number",
              value: current.age ?? "",
              min: 14,
              max: 100,
              required: true,
            })}
            ${renderInputField({
              id: "weight",
              label: "Peso atual (kg)",
              type: "number",
              value: current.weight ?? "",
              min: 30,
              max: 300,
              step: 0.1,
              required: true,
            })}
            ${renderInputField({
              id: "height",
              label: "Altura (cm)",
              type: "number",
              value: current.height ?? "",
              min: 120,
              max: 230,
              required: true,
            })}
            ${renderSelectField({
              id: "sex",
              label: "Sexo",
              value: current.sex ?? "",
              required: true,
              options: [
                { value: "feminino", label: "Feminino" },
                { value: "masculino", label: "Masculino" },
                { value: "outro", label: "Outro / Prefiro não informar" },
              ],
            })}
            ${renderSelectField({
              id: "activity",
              label: "Nível de atividade física",
              value: current.activity ?? "",
              required: true,
              options: Object.entries(activityLevels).map(([value, item]) => ({
                value,
                label: item.label,
              })),
            })}
            ${renderSelectField({
              id: "goal",
              label: "Objetivo",
              value: current.goal ?? "",
              required: true,
              options: Object.entries(goals).map(([value, item]) => ({
                value,
                label: item.label,
              })),
            })}
            <div class="field field--checkbox">
              <span class="field__label">Preferência alimentar</span>
              ${renderCheckboxField({
                id: "vegetarian",
                label: "Sou vegetariano(a)",
                checked: current.vegetarian ?? false,
              })}
            </div>
            ${renderTextareaField({
              id: "intolerances",
              label: "Intolerâncias alimentares",
              placeholder: "Ex.: lactose, glúten",
              values: current.intolerances ?? [],
            })}
            ${renderTextareaField({
              id: "allergies",
              label: "Alergias",
              placeholder: "Ex.: amendoim, camarão",
              values: current.allergies ?? [],
            })}
            ${renderTextareaField({
              id: "preferredFoods",
              label: "Alimentos preferidos",
              placeholder: "Ex.: frango, arroz, banana",
              values: current.preferredFoods ?? [],
            })}
            ${renderTextareaField({
              id: "dislikedFoods",
              label: "Alimentos que não gosta",
              placeholder: "Ex.: cebola, fígado",
              values: current.dislikedFoods ?? [],
            })}
            ${
              uiState.formError
                ? `<div class="form-feedback form-feedback--error">${uiState.formError}</div>`
                : ""
            }
            ${
              uiState.profileSavedMessage
                ? `<div class="form-feedback form-feedback--success">${uiState.profileSavedMessage}</div>`
                : ""
            }
            <button class="button button--wide" type="submit" ${
              uiState.isGenerating ? "disabled" : ""
            }>
              ${
                uiState.isGenerating
                  ? '<span class="spinner"></span> Gerando dieta...'
                  : "Salvar perfil e gerar dieta"
              }
            </button>
          </form>
        </article>
        <article class="panel panel--notes">
          <div class="soft-card">
            <strong>Como a dieta é criada</strong>
            <p>
              O sistema combina estimativa de gasto energético, objetivo, nível de atividade e uma
              biblioteca de refeições filtrada pelas suas restrições e rejeições alimentares.
            </p>
          </div>
          <div class="soft-card">
            <strong>Boas práticas do formulário</strong>
            <ul class="check-list">
              <li>Use seu peso atual mais recente</li>
              <li>Liste alergias e intolerâncias separadas por vírgula</li>
              <li>Inclua alimentos que você gosta para receber opções mais aderentes</li>
            </ul>
          </div>
        </article>
      </div>
    </section>
  `;
}
