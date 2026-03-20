const REVEAL_STAGGER_MS = 80;
const REVEAL_MOD = 5;
const IO_THRESHOLD = 0.1;

/**
 * Observes `.reveal` elements and adds `.visible` when they enter the viewport.
 */
export function initRevealOnScroll(root = document) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      }
    },
    { threshold: IO_THRESHOLD }
  );

  root.querySelectorAll('.reveal').forEach((el, index) => {
    el.style.transitionDelay = `${(index % REVEAL_MOD) * REVEAL_STAGGER_MS}ms`;
    observer.observe(el);
  });
}
