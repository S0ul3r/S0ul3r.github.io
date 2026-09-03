import '@fontsource/bitter/100.css';
import '@fontsource/bitter/300.css';
import '@fontsource/bitter/400.css';
import '@fontsource/bitter/500.css';
import '@fontsource/bitter/700.css';
import '@fontsource/bitter/300-italic.css';
import '@fontsource/bitter/400-italic.css';
import '@fontsource/nanum-myeongjo/400.css';
import '@fontsource/nanum-myeongjo/700.css';
import '@fontsource/lato/400.css';
import '@phosphor-icons/web/regular';

import './style.css';
import { cv, devicons, tagHue } from './data.js';
import { escapeHtml } from './utils/html.js';
import { extractYouTubeVideoId } from './utils/youtube.js';
import { mountPortfolioView } from './render/mountPortfolio.js';
import { initYouTubeVideoModal } from './features/youtube-video-modal.js';
import { initBoot } from './features/boot.js';
import { initOverlayMenu } from './features/overlay-menu.js';
import { initSectionNav } from './features/section-nav.js';
import { typeRole } from './features/typed-role.js';
import { initTabs } from './features/tabs.js';
import { initProjectCarousel } from './features/project-carousel.js';
import { initAmbientAudio } from './features/ambient-audio.js';
import { initCursorOrb } from './features/cursor-orb.js';
import { initContactForm } from './features/contact-form.js';
import { seedBinaryField } from './features/binary-field.js';
import { initWorld } from './scene/world.js';

function bootstrap() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  globalThis.scrollTo(0, 0);
  mountPortfolioView(cv, devicons, tagHue, { escapeHtml, extractYouTubeVideoId });
  seedBinaryField();
  initTabs();
  initProjectCarousel();
  initYouTubeVideoModal();
  initContactForm(cv.basics.email);
  initCursorOrb();

  const audio = initAmbientAudio();
  const canvas = document.getElementById('world');
  const world = canvas instanceof HTMLCanvasElement ? initWorld(canvas) : null;

  initOverlayMenu({
    onToggle: (open) => world?.setMenuOpen(open),
  });

  document.addEventListener(
    'pointermove',
    (e) => {
      if (!world) return;
      const nx = (e.clientX / globalThis.innerWidth) * 2 - 1;
      const ny = -(e.clientY / globalThis.innerHeight) * 2 + 1;
      world.setPointer(nx, ny);
    },
    { passive: true }
  );

  initSectionNav({
    onProgress: (p) => {
      world?.setProgress(p);
      document.body.classList.toggle('is-past-home', p > 0.08);
    },
  });

  initBoot({
    onStart: () => {
      const role = document.getElementById('role-line');
      if (role instanceof HTMLElement) typeRole(cv.basics.roleLine || 'SOFTWARE DEVELOPER', role);
    },
  });

  document.getElementById('sound-hint')?.addEventListener('click', () => {
    audio.startFromGesture();
  });
}

bootstrap();
