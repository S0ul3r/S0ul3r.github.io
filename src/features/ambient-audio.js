/**
 * Ambient bed: Harold Budd / Brian Eno — Against The Sky
 */
export function initAmbientAudio() {
  const btn = document.getElementById('eq-toggle');
  const hint = document.getElementById('sound-hint');
  if (!(btn instanceof HTMLButtonElement)) return { startFromGesture() {}, suspendForMedia() {}, resumeAfterMedia() {} };

  const audio = new Audio('/media/against-the-sky.mp3');
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.42;

  let on = false;
  let shouldResumeAfterMedia = false;

  const setOn = async (next) => {
    on = next;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
    if (hint) hint.style.opacity = on ? '0' : '';
    try {
      if (on) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      on = false;
      btn.classList.remove('is-on');
      btn.setAttribute('aria-pressed', 'false');
    }
  };

  btn.addEventListener('click', () => {
    void setOn(!on);
  });

  return {
    startFromGesture() {
      void setOn(true);
    },
    suspendForMedia() {
      shouldResumeAfterMedia = on && !audio.paused;
      audio.pause();
    },
    resumeAfterMedia() {
      if (shouldResumeAfterMedia && on) void audio.play();
      shouldResumeAfterMedia = false;
    },
  };
}
