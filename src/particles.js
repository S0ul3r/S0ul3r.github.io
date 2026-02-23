const COLORS = ['#58a6ff', '#22d3ee', '#38bdf8', '#06b6d4'];
const LINE_DIST = 140;
const MOUSE_RADIUS = 150;
const MOUSE_FORCE = 0.8;

let mouse = { x: -9999, y: -9999 };

export function updateMouse(x, y) {
  mouse.x = x;
  mouse.y = y;
}

function createParticle(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: 1.5 + Math.random(),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: 0.3 + Math.random() * 0.3,
  };
}

function applyPhysics(p, w, h) {
  const dx = p.x - mouse.x;
  const dy = p.y - mouse.y;
  const dist = Math.hypot(dx, dy);

  if (dist < MOUSE_RADIUS && dist > 0) {
    const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
    p.vx += (dx / dist) * force;
    p.vy += (dy / dist) * force;
  }

  p.vx *= 0.98;
  p.vy *= 0.98;

  if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * 0.05;
  if (Math.abs(p.vy) < 0.1) p.vy += (Math.random() - 0.5) * 0.05;

  p.x += p.vx;
  p.y += p.vy;

  if (p.x < 0) { p.x = 0; p.vx *= -1; }
  if (p.x > w) { p.x = w; p.vx *= -1; }
  if (p.y < 0) { p.y = 0; p.vy *= -1; }
  if (p.y > h) { p.y = h; p.vy *= -1; }
}

function drawLines(ctx, particles) {
  ctx.lineWidth = 0.5;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < LINE_DIST) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = a.color;
        ctx.globalAlpha = (1 - dist / LINE_DIST) * 0.15;
        ctx.stroke();
      }
    }
  }
}

export function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particles-bg';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let w, h, particles;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function spawn() {
    const count = window.innerWidth < 768 ? 60 : 120;
    particles = Array.from({ length: count }, () => createParticle(w, h));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      applyPhysics(p, w, h);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
    }

    drawLines(ctx, particles);

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resize();
  spawn();
  draw();

  window.addEventListener('resize', () => {
    resize();
    spawn();
  });
}
