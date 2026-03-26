import { escapeHtml, formatDate, formatNumber, toDisplayText } from "../utils/helpers.js";

export function renderStatCard({ label, value, helper = "", accent = "sage" }) {
  return `
    <article class="stat-card stat-card--${accent}">
      <span class="stat-card__label">${label}</span>
      <strong class="stat-card__value">${value}</strong>
      <span class="stat-card__helper">${helper}</span>
    </article>
  `;
}

export function renderBadgeList(items = []) {
  if (!items.length) {
    return `<span class="muted">Nenhuma restrição marcada.</span>`;
  }

  return `
    <div class="badge-list">
      ${items
        .map((item) => `<span class="badge">${escapeHtml(toDisplayText(item))}</span>`)
        .join("")}
    </div>
  `;
}

export function renderMealCard(meal) {
  return `
    <article class="meal-card" id="meal-${meal.key}">
      <div class="meal-card__header">
        <div>
          <span class="eyebrow">${meal.label}</span>
          <h3>${meal.name}</h3>
        </div>
        <span class="meal-card__kcal">${formatNumber(meal.calories)} kcal</span>
      </div>
      <ul class="meal-list">
        ${meal.items
          .map(
            (item) => `
              <li>
                <span>${item.food}</span>
                <strong>${item.formattedAmount}</strong>
              </li>
            `
          )
          .join("")}
      </ul>
      <div class="meal-card__footer">
        <span class="macro-pill">P ${formatNumber(meal.protein)}g</span>
        <span class="macro-pill">C ${formatNumber(meal.carbs)}g</span>
        <span class="macro-pill">G ${formatNumber(meal.fat)}g</span>
      </div>
      ${
        meal.alternatives.length
          ? `
            <div class="meal-card__alternatives">
              <span class="meal-card__alt-label">Alternativas</span>
              ${meal.alternatives
                .map(
                  (alternative) =>
                    `<span class="alt-chip">${alternative.name} · ${formatNumber(
                      alternative.calories
                    )} kcal</span>`
                )
                .join("")}
            </div>
          `
          : ""
      }
    </article>
  `;
}

export function renderProgressList(entries = []) {
  if (!entries.length) {
    return `<div class="empty-inline">Seu histórico vai aparecer aqui assim que você registrar a primeira atualização.</div>`;
  }

  const sorted = entries.slice().sort((a, b) => b.date.localeCompare(a.date));

  return `
    <div class="timeline">
      ${sorted
        .map(
          (entry) => `
            <article class="timeline__item">
              <div>
                <strong>${formatDate(entry.date)}</strong>
                <span>${entry.label || "Atualização de peso"}</span>
              </div>
              <strong>${formatNumber(entry.weight, 1)} kg</strong>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

export function renderEmptyState(title, text, anchor = "#perfil") {
  return `
    <article class="empty-state">
      <h3>${title}</h3>
      <p>${text}</p>
      <a class="button button--ghost" href="${anchor}">Começar agora</a>
    </article>
  `;
}
