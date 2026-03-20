/**
 * @param {HTMLElement} element
 * @param {string} text
 * @param {number} [speedMs=70]
 * @returns {Promise<HTMLElement>}
 */
function typeText(element, text, speedMs = 70) {
  return new Promise((resolve) => {
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    element.textContent = '';
    element.appendChild(cursor);

    const interval = globalThis.setInterval(() => {
      element.textContent = text.slice(0, ++i);
      element.appendChild(cursor);
      if (i >= text.length) {
        globalThis.clearInterval(interval);
        resolve(cursor);
      }
    }, speedMs);
  });
}

/**
 * @param {{ name: string; headline: string }} basics
 */
export async function runHeroTypingAnimation(basics) {
  const nameEl = document.getElementById('hero-name-visible');
  const headlineEl = document.getElementById('hero-headline');

  if (!(nameEl instanceof HTMLElement) || !(headlineEl instanceof HTMLElement)) return;

  const cursor1 = await typeText(nameEl, basics.name, 70);
  cursor1.remove();

  const cursor2 = await typeText(headlineEl, basics.headline, 40);

  globalThis.setTimeout(() => {
    cursor2.classList.add('fade-out');
  }, 2000);
}
