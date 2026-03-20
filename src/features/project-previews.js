import { buildYouTubeEmbedUrl } from '../utils/youtube.js';

const THUMB_MAX_WIDTH = 720;
const THUMB_MAX_HEIGHT = 580;
const HOVER_CLEAR_DELAY_MS = 500;

/**
 * Sets CSS size variables on project thumbnail links for hover preview sizing.
 */
export function initProjectThumbDimensions(root = document) {
  const images = root.querySelectorAll('#projects-list .card-project-image img.project-thumb-small');

  images.forEach((img) => {
    const anchor = img.parentElement;
    if (!(anchor instanceof HTMLElement) || !anchor.classList.contains('card-project-image')) return;

    const applyDimensions = () => {
      if (anchor.dataset.youtubeHover != null) return;

      const nw = img.naturalWidth || img.width;
      const nh = img.naturalHeight || img.height;
      if (!nw || !nh) return;

      const scale = Math.min(THUMB_MAX_WIDTH / nw, THUMB_MAX_HEIGHT / nh, 1);
      anchor.style.setProperty('--img-w', `${Math.round(nw * scale)}px`);
      anchor.style.setProperty('--img-h', `${Math.round(nh * scale)}px`);
    };

    if (img.complete) applyDimensions();
    img.addEventListener('load', applyDimensions, { once: true });
  });
}

/**
 * Lazy-load YouTube iframe on hover/focus for project cards (muted autoplay).
 */
export function initProjectYouTubeHoverPreviews(root = document) {
  const embedUrl = (videoId) =>
    buildYouTubeEmbedUrl(videoId, {
      autoplay: 1,
      mute: 1,
      playsinline: 1,
      rel: 0,
      modestbranding: 1,
    });

  root.querySelectorAll('#projects-list .card-project-image[data-youtube-hover]').forEach((link) => {
    if (!(link instanceof HTMLElement)) return;

    const videoId = link.dataset.youtubeHover;
    const iframe = link.querySelector('iframe.project-preview-iframe');
    if (!videoId || !(iframe instanceof HTMLIFrameElement)) return;

    const src = embedUrl(videoId);
    let hideTimer = 0;

    const start = () => {
      globalThis.clearTimeout(hideTimer);
      if (!iframe.getAttribute('src')) {
        iframe.src = src;
        iframe.title = 'YouTube video preview';
      }
    };

    const stop = () => {
      globalThis.clearTimeout(hideTimer);
      hideTimer = globalThis.setTimeout(() => {
        iframe.removeAttribute('src');
      }, HOVER_CLEAR_DELAY_MS);
    };

    link.addEventListener('mouseenter', start);
    link.addEventListener('mouseleave', stop);
    link.addEventListener('focusin', start);
    link.addEventListener('focusout', stop);
  });
}
