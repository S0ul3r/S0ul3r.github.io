/**
 * @param {string} text
 * @param {HTMLElement} el
 */
export function typeRole(text, el) {
  el.textContent = '';
  const reduce = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const full = `| ${text} |`;
  if (reduce) {
    el.textContent = full;
    return;
  }
  let i = 0;
  const step = () => {
    i += 1;
    el.textContent = full.slice(0, i);
    if (i < full.length) globalThis.setTimeout(step, 42);
  };
  step();
}
