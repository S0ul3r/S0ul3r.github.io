/**
 * Ambient bed: Harold Budd / Brian Eno — Against The Sky
 */
export function initAmbientAudio() {
  const btn = document.getElementById('eq-toggle');
  const hint = document.getElementById('sound-hint');
  if (!(btn instanceof HTMLButtonElement)) return { startFromGesture() {} };

  const audio = new Audio('/media/against-the-sky.mp3');
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.42;

  let on = false;

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
  };
}
