import {
  renderBadgeList,
  renderEmptyState,
  renderMealCard,
  renderStatCard,
} from "../components/cards.js";
import { formatNumber } from "../utils/helpers.js";

export function renderDietSection(dietPlan) {
  if (!dietPlan) {
    return `
      <section class="section" id="resultado">
        <div class="section__intro">
          <span class="eyebrow">Resultado</span>
          <h2>Sua dieta personalizada aparece aqui</h2>
          <p>Assim que o perfil for salvo, o sistema monta um plano alimentar completo.</p>
        </div>
        ${renderEmptyState(
          "Nenhuma dieta gerada ainda",
          "Preencha seu perfil para receber uma sugestão automática de refeições, calorias e macros."
        )}
      </section>
    `;
  }

  return `
    <section class="section" id="resultado">
      <div class="section__intro">
        <span class="eyebrow">Resultado</span>
        <h2>Plano alimentar sugerido</h2>
        <p>${dietPlan.summary}</p>
      </div>
      <article class="notice-banner">
        <div>
          <strong>Importante</strong>
          <p>
            Sugestão automatizada para fins educativos. Ajustes clínicos e tratamento nutricional
            devem ser feitos com profissional habilitado.
          </p>
        </div>
        <div class="notice-banner__meta">
          <span>Gerado em ${dietPlan.createdAtLabel}</span>
        </div>
      </article>
      <div class="stats-grid">
        ${renderStatCard({
          label: "Calorias sugeridas",
          value: `${formatNumber(dietPlan.dailyCalories)} kcal`,
          helper: `Manutenção estimada: ${formatNumber(dietPlan.maintenanceCalories)} kcal`,
        })}
        ${renderStatCard({
          label: "IMC",
          value: formatNumber(dietPlan.bmi, 1),
          helper: dietPlan.bmiStatus,
          accent: "sand",
        })}
        ${renderStatCard({
          label: "Proteínas",
          value: `${formatNumber(dietPlan.macros.protein)} g`,
          helper: "Meta diária aproximada",
          accent: "terracotta",
        })}
        ${renderStatCard({
          label: "Carboidratos / Gorduras",
          value: `${formatNumber(dietPlan.macros.carbs)} g / ${formatNumber(
            dietPlan.macros.fat
          )} g`,
          helper: dietPlan.goalMeta.targetText,
        })}
      </div>
      <div class="adaptive-message ${dietPlan.adaptive.wasAdjusted ? "adaptive-message--active" : ""}">
        ${dietPlan.adaptive.message}
      </div>
      <div class="restriction-box">
        <strong>Restrições consideradas</strong>
        ${renderBadgeList(dietPlan.restrictionSummary)}
      </div>
      <div class="meal-grid">
        ${dietPlan.meals.map((meal) => renderMealCard(meal)).join("")}
      </div>
    </section>
  `;
}
