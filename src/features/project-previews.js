import { buildYouTubeEmbedUrl } from '../utils/youtube.js';

const THUMB_MAX_WIDTH = 720;
const THUMB_MAX_HEIGHT = 580;
/** Delay before hiding when pointer leaves a card (moving to empty space). */
const HOVER_CLEAR_DELAY_MS = 500;
/** After closing another card’s preview, wait this long before opening the new one (ms). */
const PREVIEW_SWITCH_STAGGER_MS = 95;
/** Inline transition when swapping cards so the old preview clears quickly. */
const PREVIEW_QUICK_HIDE_MS = 0.13;

/** Class toggled on the whole card so preview CSS does not rely on `:hover` on `<article>`. */
const PREVIEW_HOVER_CLASS = 'is-project-preview-hover';

/** @type {WeakMap<HTMLElement, number>} */
const pendingHideByCard = new WeakMap();

/**
 * @param {HTMLElement} card
 */
function clearPendingHide(card) {
  const id = pendingHideByCard.get(card);
  if (id != null) {
    globalThis.clearTimeout(id);
    pendingHideByCard.delete(card);
  }
}

/**
 * @param {HTMLElement} card
 * @param {{ quick?: boolean }} [options]
 */
function forceHidePreviewCard(card, options = {}) {
  const quick = options.quick === true;
  clearPendingHide(card);

  const preview = card.querySelector('.project-thumb-preview');
  if (quick && preview instanceof HTMLElement) {
    const prevTransition = preview.style.transitionDuration;
    preview.style.transitionDuration = `${PREVIEW_QUICK_HIDE_MS}s`;
    card.classList.remove(PREVIEW_HOVER_CLASS);
    globalThis.setTimeout(() => {
      preview.style.transitionDuration = prevTransition;
    }, Math.ceil(PREVIEW_QUICK_HIDE_MS * 1000) + 80);
  } else {
    card.classList.remove(PREVIEW_HOVER_CLASS);
  }

  const iframe = card.querySelector('iframe.project-preview-iframe');
  if (iframe instanceof HTMLIFrameElement) {
    iframe.removeAttribute('src');
  }
}

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
 * Whole-card hover/focus preview: toggles a class on `.card-project--with-preview` and
 * loads a muted YouTube iframe when the card has `data-youtube-hover`.
 * When moving between cards, the previous preview is closed first (quick fade), then the new one opens after a short stagger.
 */
export function initProjectCardPreviewHover(root = document) {
  const embedUrl = (videoId) =>
    buildYouTubeEmbedUrl(videoId, {
      autoplay: 1,
      mute: 1,
      playsinline: 1,
      rel: 0,
      modestbranding: 1,
    });

  root.querySelectorAll('#projects-list .card-project--with-preview').forEach((card) => {
    if (!(card instanceof HTMLElement)) return;

    const thumbHost = card.querySelector('.card-project-image');
    if (!(thumbHost instanceof HTMLElement)) return;

    const videoId = thumbHost.dataset.youtubeHover;
    const iframe = card.querySelector('iframe.project-preview-iframe');
    const src = videoId ? embedUrl(videoId) : '';
    let showSwitchTimer = 0;

    const clearShowSwitch = () => {
      globalThis.clearTimeout(showSwitchTimer);
      showSwitchTimer = 0;
    };

    const show = () => {
      clearPendingHide(card);
      clearShowSwitch();

      const list = root.querySelectorAll('#projects-list .card-project--with-preview');
      let hadOtherActive = false;
      for (const other of list) {
        if (other === card || !(other instanceof HTMLElement)) continue;
        if (other.classList.contains(PREVIEW_HOVER_CLASS)) {
          hadOtherActive = true;
          forceHidePreviewCard(other, { quick: true });
        }
      }

      const reveal = () => {
        if (!card.isConnected) return;
        card.classList.add(PREVIEW_HOVER_CLASS);
        if (videoId && iframe instanceof HTMLIFrameElement && src && !iframe.getAttribute('src')) {
          iframe.src = src;
          iframe.title = 'YouTube video preview';
        }
      };

      if (hadOtherActive) {
        showSwitchTimer = globalThis.setTimeout(reveal, PREVIEW_SWITCH_STAGGER_MS);
      } else {
        reveal();
      }
    };

    const hide = () => {
      clearShowSwitch();
      clearPendingHide(card);
      const id = globalThis.setTimeout(() => {
        pendingHideByCard.delete(card);
        forceHidePreviewCard(card, { quick: false });
      }, HOVER_CLEAR_DELAY_MS);
      pendingHideByCard.set(card, id);
    };

    card.addEventListener('mouseenter', show);
    card.addEventListener('mouseleave', hide);
    thumbHost.addEventListener('focusin', show);
    thumbHost.addEventListener('focusout', hide);
  });
}

/** @deprecated Use initProjectCardPreviewHover */
export const initProjectYouTubeHoverPreviews = initProjectCardPreviewHover;
