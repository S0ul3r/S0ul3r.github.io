import { buildYouTubeEmbedUrl } from '../utils/youtube.js';

/**
 * If `index.html` is an older template (e.g. cached Pages deploy), inject the modal shell
 * so the handler + CSS classes still work after only the JS bundle updates.
 * @param {Document} doc
 * @returns {HTMLElement}
 */
function ensureYouTubeVideoModalShell(doc) {
  const existing = doc.getElementById('youtube-video-modal');
  if (existing instanceof HTMLElement) return existing;

  const root = doc.createElement('div');
  root.id = 'youtube-video-modal';
  root.className = 'video-modal';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-hidden', 'true');
  root.setAttribute('aria-labelledby', 'youtube-video-modal-heading');
  root.innerHTML = `
    <div class="video-modal__backdrop" aria-hidden="true"></div>
    <div class="video-modal__panel">
      <button type="button" class="video-modal__close" aria-label="Close video">
        <span aria-hidden="true">&times;</span>
      </button>
      <h2 id="youtube-video-modal-heading" class="video-modal__heading">Video</h2>
      <div class="video-modal__frame">
        <iframe
          id="youtube-video-modal-iframe"
          class="video-modal__iframe"
          title="Video player"
          allowfullscreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
      </div>
    </div>
  `;
  doc.body.appendChild(root);
  return root;
}

/**
 * Full-page YouTube player modal (div overlay — works without `<dialog>` support).
 * Opens on elements with `data-youtube-modal` + `data-youtube-id` (+ optional `data-video-title`).
 *
 * @param {Document} doc
 * @param {{ onOpen?: () => void; onClose?: () => void }} [opts]
 */
export function initYouTubeVideoModal(doc = document, opts = {}) {
  const root = ensureYouTubeVideoModalShell(doc);
  const backdrop = root.querySelector('.video-modal__backdrop');
  const closeBtn = root.querySelector('.video-modal__close');
  const iframe = doc.getElementById('youtube-video-modal-iframe');
  const heading = doc.getElementById('youtube-video-modal-heading');

  if (
    !(backdrop instanceof HTMLElement) ||
    !(closeBtn instanceof HTMLButtonElement) ||
    !(iframe instanceof HTMLIFrameElement) ||
    !(heading instanceof HTMLElement)
  ) {
    return;
  }

  /** @type {Element | null} */
  let previousFocus = null;

  const close = () => {
    iframe.removeAttribute('src');
    iframe.title = 'Video player';
    heading.textContent = 'Video';
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    doc.body.classList.remove('video-modal-open');
    opts.onClose?.();
    if (previousFocus instanceof HTMLElement && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
    previousFocus = null;
  };

  /**
   * @param {{ videoId: string; title: string }} opts
   */
  const open = ({ videoId, title }) => {
    if (!videoId) return;
    previousFocus = doc.activeElement;
    // User gesture (click) allows autoplay with sound in typical browsers
    iframe.src = buildYouTubeEmbedUrl(videoId, {
      autoplay: 1,
      mute: 0,
      playsinline: 1,
      rel: 0,
      modestbranding: 1,
    });
    iframe.title = title;
    heading.textContent = title;
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    doc.body.classList.add('video-modal-open');
    opts.onOpen?.();
    closeBtn.focus();
  };

  /** @param {Event} e */
  const onTriggerPointer = (e) => {
    if (!(e.target instanceof Element)) return;
    const trigger = e.target.closest('[data-youtube-modal]');
    if (!(trigger instanceof HTMLElement) || !trigger.dataset.youtubeId) return;
    const videoId = trigger.dataset.youtubeId;
    e.preventDefault();
    e.stopPropagation();
    const title = trigger.dataset.videoTitle?.trim() || 'Video';
    open({ videoId, title });
  };

  // Capture: runs before default actions on links/buttons
  doc.addEventListener('click', onTriggerPointer, true);

  doc.addEventListener(
    'keydown',
    (e) => {
      if (!root.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    },
    true
  );

  backdrop.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
}
