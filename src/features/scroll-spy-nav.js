const VIEWPORT_ACTIVE_RATIO = 0.25;

/**
 * Highlights the nav link whose section is nearest the top of the viewport.
 */
export function initScrollSpyNav(doc = document) {
  const sections = doc.querySelectorAll('.section');
  const navLinks = doc.querySelectorAll('.nav-link');
  if (sections.length === 0 || navLinks.length === 0) return;

  const update = () => {
    const viewportTop = VIEWPORT_ACTIVE_RATIO * globalThis.innerHeight;
    let activeId = sections[0]?.id ?? '';

    for (const section of sections) {
      if (!(section instanceof HTMLElement)) continue;
      const top = section.getBoundingClientRect().top;
      if (top <= viewportTop) activeId = section.id;
    }

    for (const link of navLinks) {
      if (!(link instanceof HTMLAnchorElement)) continue;
      link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
    }
  };

  const onScrollOrResize = () => globalThis.requestAnimationFrame(update);

  globalThis.addEventListener('scroll', onScrollOrResize, { passive: true });
  globalThis.addEventListener('resize', onScrollOrResize);
  update();
}
