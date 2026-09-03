export function initCursorOrb() {
  const ring = document.getElementById('cursor-ring');
  if (!(ring instanceof HTMLElement)) return;
  if (globalThis.matchMedia('(pointer: coarse)').matches) return;

  let x = globalThis.innerWidth / 2;
  let y = globalThis.innerHeight / 2;
  let tx = x;
  let ty = y;

  document.addEventListener(
    'pointermove',
    (e) => {
      tx = e.clientX;
      ty = e.clientY;
    },
    { passive: true }
  );

  const loop = () => {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    globalThis.requestAnimationFrame(loop);
  };
  loop();
}
