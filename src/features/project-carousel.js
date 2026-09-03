export function initProjectCarousel(root = document) {
  const stage = root.getElementById?.('carousel-stage') ?? document.getElementById('carousel-stage');
  const section = document.getElementById('projects');
  const carousel = document.getElementById('carousel');
  if (!(stage instanceof HTMLElement) || !(section instanceof HTMLElement)) return;
  const items = [...stage.querySelectorAll('.slab')];
  if (!items.length) return;

  let index = 0;
  let hover = false;
  let wheelLock = 0;

  const layout = () => {
    items.forEach((item, i) => {
      const offset = i - index;
      const abs = Math.abs(offset);
      const x = offset * 34;
      const rot = offset * -18;
      const z = -abs * 180;
      item.classList.toggle('is-active', abs === 0);
      item.dataset.carouselPosition = offset < 0 ? 'previous' : offset > 0 ? 'next' : 'active';
      item.style.opacity = abs > 1 ? '0' : String(1 - abs * 0.28);
      item.style.pointerEvents = abs <= 1 ? 'auto' : 'none';
      item.style.cursor = abs === 1 ? 'pointer' : 'default';
      item.style.zIndex = String(20 - abs);
      item.style.transform = `translateX(${x}vw) rotateY(${rot}deg) translateZ(${z}px)`;
    });
  };

  /**
   * @param {number} dir
   * @returns {boolean} whether the carousel moved
   */
  const go = (dir) => {
    const next = index + dir;
    if (next < 0 || next >= items.length) return false;
    index = next;
    layout();
    return true;
  };

  document.getElementById('carousel-prev')?.addEventListener('click', () => {
    go(-1);
  });
  document.getElementById('carousel-next')?.addEventListener('click', () => {
    go(1);
  });

  items.forEach((item, itemIndex) => {
    item.addEventListener('click', () => {
      if (itemIndex === index) return;
      index = itemIndex;
      layout();
    });
  });

  const zone = carousel instanceof HTMLElement ? carousel : section;
  zone.addEventListener('pointerenter', () => {
    hover = true;
  });
  zone.addEventListener('pointerleave', () => {
    hover = false;
  });

  section.addEventListener(
    'wheel',
    (e) => {
      if (!hover) return;
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 6) return;

      const dir = delta > 0 ? 1 : -1;
      const atStart = index === 0;
      const atEnd = index === items.length - 1;

      // At the ends, release the page so vertical scrolling continues.
      if ((dir < 0 && atStart) || (dir > 0 && atEnd)) return;

      e.preventDefault();
      const now = Date.now();
      if (now - wheelLock < 380) return;
      wheelLock = now;
      go(dir);
    },
    { passive: false }
  );

  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });

  layout();
}
