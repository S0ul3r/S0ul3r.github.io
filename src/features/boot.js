/**
 * Loading counter, then Start gate.
 * @param {{ onStart: () => void }} opts
 */
export function initBoot(opts) {
  const boot = document.getElementById('boot');
  const counter = document.getElementById('boot-counter');
  const start = document.getElementById('start-button');
  if (!(boot instanceof HTMLElement) || !(start instanceof HTMLButtonElement)) return;

  let n = 0;
  const tick = () => {
    n += 1 + Math.floor(Math.random() * 3);
    if (n >= 100) n = 100;
    if (counter) counter.textContent = String(n);
    if (n < 100) {
      globalThis.setTimeout(tick, 18);
      return;
    }
    boot.classList.add('is-ready');
  };
  tick();

  start.addEventListener('click', () => {
    globalThis.scrollTo(0, 0);
    boot.classList.add('is-gone');
    document.body.classList.remove('is-booting');
    document.body.classList.add('is-live');
    opts.onStart();
  });
}
