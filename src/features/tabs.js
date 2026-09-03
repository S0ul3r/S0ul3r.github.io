export function initTabs(root = document) {
  const tabs = [...root.querySelectorAll('.tab')];
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.getAttribute('data-tab');
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', String(on));
      });
      root.querySelectorAll('.tab-panel').forEach((panel) => {
        const match = panel.id === `tab-${id}`;
        panel.classList.toggle('is-on', match);
        panel.hidden = !match;
      });
    });
  });
}
