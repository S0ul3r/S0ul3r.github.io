export function initProjectCarousel(root = document) {
  const stage = root.getElementById?.('carousel-stage') ?? document.getElementById('carousel-stage');
  const section = document.getElementById('projects');
  const carousel = document.getElementById('carousel');
  if (!(stage instanceof HTMLElement) || !(section instanceof HTMLElement)) return;
  const items = [...stage.querySelectorAll('.slab')];
  const sidePrev = document.getElementById('carousel-side-prev');
  const sideNext = document.getElementById('carousel-side-next');
  if (!items.length) return;

  let index = 0;
  let hover = false;
  let wheelLock = 0;

  const updateSideTargets = () => {
    if (!(carousel instanceof HTMLElement)) return;
    const active = items[index];
    const previous = items[index - 1];
    const next = items[index + 1];
    const carouselRect = carousel.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const activeRect = active.querySelector('.slab-frame')?.getBoundingClientRect();
    const place = (target, item, side) => {
      if (!(target instanceof HTMLButtonElement) || !item || !activeRect) {
        if (target instanceof HTMLButtonElement) target.hidden = true;
        return;
      }
      const rect = item.querySelector('.slab-frame')?.getBoundingClientRect();
      if (!rect) return;
      const left = side === 'previous' ? Math.max(rect.left, sectionRect.left) : Math.max(rect.left, activeRect.right);
      const right = side === 'previous' ? Math.min(rect.right, activeRect.left) : Math.min(rect.right, sectionRect.right);
      const height = Math.max(0, Math.min(rect.bottom, activeRect.bottom) - Math.max(rect.top, activeRect.top));
      target.hidden = right <= left || height === 0;
      target.style.left = `${left - carouselRect.left}px`;
      target.style.top = `${Math.max(rect.top, activeRect.top) - carouselRect.top}px`;
      target.style.width = `${Math.max(0, right - left)}px`;
      target.style.height = `${height}px`;
    };
    place(sidePrev, previous, 'previous');
    place(sideNext, next, 'next');
  };

  const updateVideoPreviews = () => {
    items.forEach((item, itemIndex) => {
      const host = item.querySelector('[data-preview-video-src]');
      if (!(host instanceof HTMLElement)) return;
      const video = host.querySelector('video');
      if (itemIndex !== index) {
        video?.remove();
        return;
      }
      if (video || !host.dataset.previewVideoSrc) return;
      const preview = document.createElement('video');
      preview.tabIndex = -1;
      preview.src = host.dataset.previewVideoSrc;
      preview.autoplay = true;
      preview.muted = true;
      preview.loop = true;
      preview.playsInline = true;
      preview.preload = 'metadata';
      host.appendChild(preview);
    });
  };

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
      item.querySelectorAll('a, button').forEach((control) => {
        control.tabIndex = abs === 0 ? 0 : -1;
      });
    });
    updateVideoPreviews();
    globalThis.requestAnimationFrame(updateSideTargets);
    globalThis.setTimeout(updateSideTargets, 580);
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
  sidePrev?.addEventListener('click', () => go(-1));
  sideNext?.addEventListener('click', () => go(1));

  items.forEach((item, itemIndex) => {
    item.addEventListener('click', () => {
      if (itemIndex === index) return;
      index = itemIndex;
      layout();
    });
  });

  stage.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const toggle = event.target.closest('.description-toggle');
    if (!(toggle instanceof HTMLButtonElement)) return;
    event.stopPropagation();
    const description = toggle.previousElementSibling;
    if (!(description instanceof HTMLElement)) return;
    const expanded = !description.classList.contains('is-expanded');
    description.classList.toggle('is-expanded', expanded);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'Show less' : 'Read more';
  });

  globalThis.addEventListener('resize', updateSideTargets, { passive: true });

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
