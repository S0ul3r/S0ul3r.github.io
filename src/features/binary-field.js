export function seedBinaryField(root = document.getElementById('binary-field')) {
  if (!(root instanceof HTMLElement)) return;
  const bits = ['01001', '10110', '11101', '00011', '11010', '01100'];
  for (let i = 0; i < 14; i += 1) {
    const el = document.createElement('span');
    el.className = 'binary-bit';
    el.textContent = bits[i % bits.length];
    el.style.left = `${8 + Math.random() * 84}%`;
    el.style.top = `${10 + Math.random() * 70}%`;
    el.style.opacity = String(0.12 + Math.random() * 0.22);
    root.appendChild(el);
  }
}
