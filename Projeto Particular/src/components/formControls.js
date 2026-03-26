import { escapeHtml, formatListInput } from "../utils/helpers.js";

export function renderInputField({
  id,
  label,
  type = "text",
  placeholder = "",
  value = "",
  required = false,
  min,
  max,
  step,
}) {
  return `
    <label class="field">
      <span class="field__label">${label}${required ? " *" : ""}</span>
      <input
        class="field__control"
        id="${id}"
        name="${id}"
        type="${type}"
        value="${escapeHtml(value ?? "")}"
        placeholder="${escapeHtml(placeholder)}"
        ${required ? "required" : ""}
        ${min !== undefined ? `min="${min}"` : ""}
        ${max !== undefined ? `max="${max}"` : ""}
        ${step !== undefined ? `step="${step}"` : ""}
      />
    </label>
  `;
}

export function renderTextareaField({ id, label, placeholder = "", values = [], rows = 3 }) {
  return `
    <label class="field">
      <span class="field__label">${label}</span>
      <textarea class="field__control field__control--textarea" id="${id}" name="${id}" rows="${rows}" placeholder="${escapeHtml(
        placeholder
      )}">${escapeHtml(formatListInput(values))}</textarea>
    </label>
  `;
}

export function renderSelectField({ id, label, value = "", required = false, options = [] }) {
  return `
    <label class="field">
      <span class="field__label">${label}${required ? " *" : ""}</span>
      <select class="field__control" id="${id}" name="${id}" ${required ? "required" : ""}>
        <option value="">Selecione</option>
        ${options
          .map(
            (option) => `
              <option value="${escapeHtml(option.value)}" ${
                option.value === value ? "selected" : ""
              }>
                ${escapeHtml(option.label)}
              </option>
            `
          )
          .join("")}
      </select>
    </label>
  `;
}

export function renderCheckboxField({ id, label, checked = false }) {
  return `
    <label class="checkbox">
      <input id="${id}" name="${id}" type="checkbox" ${checked ? "checked" : ""} />
      <span>${label}</span>
    </label>
  `;
}
