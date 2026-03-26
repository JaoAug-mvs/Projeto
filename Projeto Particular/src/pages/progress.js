import { renderProgressList, renderStatCard } from "../components/cards.js";
import { renderProgressChart } from "../components/progressChart.js";
import { goals } from "../utils/calculations.js";
import { formatNumber, getTodayISO } from "../utils/helpers.js";

export function renderProgressSection({ profile, dietPlan, progress, uiState }) {
  const currentGoal = profile ? goals[profile.goal]?.label ?? "-" : "-";
  const latestWeight = progress.length ? progress[progress.length - 1].weight : profile?.weight;

  return `
    <section class="section" id="acompanhamento">
      <div class="section__intro">
        <span class="eyebrow">Acompanhamento</span>
        <h2>Evolução e ajustes inteligentes</h2>
        <p>
          Registre seu peso periodicamente para manter o plano mais próximo da sua realidade.
        </p>
      </div>
      <div class="panel-grid">
        <article class="panel">
          <div class="stats-grid stats-grid--compact">
            ${renderStatCard({
              label: "Meta atual",
              value: currentGoal,
              helper: dietPlan?.goalMeta.targetText ?? "Definida após gerar a dieta",
            })}
            ${renderStatCard({
              label: "Peso mais recente",
              value: latestWeight ? `${formatNumber(latestWeight, 1)} kg` : "-",
              helper: "Atualizado com base nos registros",
              accent: "sand",
            })}
            ${renderStatCard({
              label: "Consumo sugerido",
              value: dietPlan ? `${formatNumber(dietPlan.dailyCalories)} kcal` : "-",
              helper: "Estimativa diária atual",
              accent: "terracotta",
            })}
          </div>
          <div class="chart-shell">${renderProgressChart(progress)}</div>
        </article>
        <article class="panel">
          <form id="progress-form" class="form-grid form-grid--single">
            <h3>Registrar progresso</h3>
            <label class="field">
              <span class="field__label">Data da atualização *</span>
              <input
                class="field__control"
                type="date"
                name="progressDate"
                id="progressDate"
                value="${getTodayISO()}"
                required
              />
            </label>
            <label class="field">
              <span class="field__label">Peso atual (kg) *</span>
              <input
                class="field__control"
                type="number"
                name="progressWeight"
                id="progressWeight"
                min="30"
                max="300"
                step="0.1"
                value="${latestWeight ?? ""}"
                required
              />
            </label>
            ${
              uiState.progressError
                ? `<div class="form-feedback form-feedback--error">${uiState.progressError}</div>`
                : ""
            }
            ${
              uiState.progressSavedMessage
                ? `<div class="form-feedback form-feedback--success">${uiState.progressSavedMessage}</div>`
                : ""
            }
            <button class="button button--wide" type="submit">Registrar e reajustar dieta</button>
          </form>
          <div class="history-shell">
            <h3>Histórico</h3>
            ${renderProgressList(progress)}
          </div>
        </article>
      </div>
    </section>
  `;
}
