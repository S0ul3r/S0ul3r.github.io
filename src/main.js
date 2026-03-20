import './style.css';
import { cv, devicons } from './data.js';
import { initParticles, updateMouse } from './particles.js';
import { escapeHtml } from './utils/html.js';
import { extractYouTubeVideoId } from './utils/youtube.js';
import { mountPortfolioView } from './render/mountPortfolio.js';
import { initProjectThumbDimensions, initProjectCardPreviewHover } from './features/project-previews.js';
import { initYouTubeVideoModal } from './features/youtube-video-modal.js';
import { runHeroTypingAnimation } from './features/hero-typing.js';
import { initRevealOnScroll } from './features/reveal-on-scroll.js';
import { initScrollSpyNav } from './features/scroll-spy-nav.js';

function initMouseGlow() {
  const glowEl = document.getElementById('mouse-glow');
  if (!glowEl) return;

  document.addEventListener(
    'mousemove',
    (e) => {
      updateMouse(e.clientX, e.clientY);
      globalThis.requestAnimationFrame(() => {
        glowEl.style.setProperty('--glow-x', `${e.clientX}px`);
        glowEl.style.setProperty('--glow-y', `${e.clientY}px`);
      });
    },
    { passive: true }
  );
}

function setFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

function bootstrap() {
  mountPortfolioView(cv, devicons, { escapeHtml, extractYouTubeVideoId });

  initProjectThumbDimensions();
  initProjectCardPreviewHover();

  initYouTubeVideoModal();

  setFooterYear();
  initParticles();
  initMouseGlow();

  void runHeroTypingAnimation(cv.basics).catch(() => {
    /* typing is decorative; ignore failures */
  });

  initRevealOnScroll();
  initScrollSpyNav();
}

bootstrap();
