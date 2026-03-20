/**
 * Escapes text for safe insertion into HTML (text nodes / attributes).
 * Non-primitive values return an empty string (no `[object Object]`).
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value == null) return '';

  const div = document.createElement('div');

  if (typeof value === 'string') {
    div.textContent = value;
    return div.innerHTML;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '';
    div.textContent = String(value);
    return div.innerHTML;
  }

  if (typeof value === 'boolean') {
    div.textContent = value ? 'true' : 'false';
    return div.innerHTML;
  }

  if (typeof value === 'bigint') {
    div.textContent = value.toString();
    return div.innerHTML;
  }

  return '';
}
