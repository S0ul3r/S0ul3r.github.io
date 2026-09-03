/**
 * @param {{ onToggle?: (open: boolean) => void }} [opts]
 */
export function initOverlayMenu(opts = {}) {
  const toggle = document.getElementById('menu-toggle');
  const overlay = document.getElementById('overlay-menu');
  if (!(toggle instanceof HTMLButtonElement) || !(overlay instanceof HTMLElement)) return;

  const setOpen = (open) => {
    overlay.hidden = !open;
    overlay.classList.toggle('is-open', open);
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('is-menu-open', open);
    opts.onToggle?.(open);
  };

  toggle.addEventListener('click', () => setOpen(overlay.hidden));

  overlay.addEventListener('click', (e) => {
    if (!(e.target instanceof Element)) return;
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) setOpen(false);
  });
}
