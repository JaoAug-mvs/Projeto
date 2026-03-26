export function normalizeText(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function parseListInput(value = "") {
  return [...new Set(value.split(/[\n,;]+/).map(normalizeText).filter(Boolean))];
}

export function formatListInput(list = []) {
  return list.map(toDisplayText).join(", ");
}

export function toDisplayText(value = "") {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function roundTo(value, step = 1) {
  return Math.round(value / step) * step;
}

export function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(`${dateValue}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getTodayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatNumber(value, digits = 0) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function escapeHtml(value = "") {
  return value
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function uniqueBy(items, getKey) {
  const map = new Map();
  items.forEach((item) => {
    map.set(getKey(item), item);
  });
  return [...map.values()];
}
