import { formatDate, formatNumber } from "../utils/helpers.js";

export function renderProgressChart(entries = []) {
  if (!entries.length) {
    return `
      <div class="chart chart--empty">
        <p>Sem dados suficientes para desenhar o gráfico.</p>
      </div>
    `;
  }

  const sorted = entries.slice().sort((a, b) => a.date.localeCompare(b.date));
  const width = 640;
  const height = 240;
  const padding = 28;
  const weights = sorted.map((entry) => entry.weight);
  const minWeight = Math.min(...weights) - 1;
  const maxWeight = Math.max(...weights) + 1;
  const range = Math.max(maxWeight - minWeight, 1);

  const points = sorted.map((entry, index) => {
    const x =
      sorted.length === 1
        ? width / 2
        : padding + (index * (width - padding * 2)) / (sorted.length - 1);
    const y = height - padding - ((entry.weight - minWeight) / range) * (height - padding * 2);
    return { ...entry, x, y };
  });

  const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");

  return `
    <div class="chart">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfico de evolução de peso">
        <defs>
          <linearGradient id="chartStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#2f7f6d" />
            <stop offset="100%" stop-color="#e68755" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${width}" height="${height}" rx="24" fill="rgba(255,255,255,0.5)" />
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="chart__axis" />
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" class="chart__axis" />
        <path d="${path}" class="chart__line" />
        ${points
          .map(
            (point) => `
              <circle cx="${point.x}" cy="${point.y}" r="5" class="chart__dot" />
              <text x="${point.x}" y="${point.y - 12}" text-anchor="middle" class="chart__value">
                ${formatNumber(point.weight, 1)} kg
              </text>
              <text x="${point.x}" y="${height - 8}" text-anchor="middle" class="chart__label">
                ${formatDate(point.date)}
              </text>
            `
          )
          .join("")}
      </svg>
    </div>
  `;
}
