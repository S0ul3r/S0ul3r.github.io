/**
 * Full-viewport canvas particle network (decorative background).
 */

const CONFIG = Object.freeze({
  colors: ['#58a6ff', '#22d3ee', '#38bdf8', '#06b6d4'],
  lineDistancePx: 140,
  mouseRadiusPx: 150,
  mouseForce: 0.8,
  velocityDamping: 0.98,
  idleJitter: 0.05,
  particleCountDesktop: 120,
  particleCountMobile: 60,
  mobileBreakpointPx: 768,
  resizeDebounceMs: 120,
  canvasId: 'particles-bg',
});

/** @type {{ x: number; y: number }} */
let mouse = { x: -9999, y: -9999 };

/**
 * @param {number} x
 * @param {number} y
 */
export function updateMouse(x, y) {
  mouse = { x, y };
}

/**
 * @param {number} w
 * @param {number} h
 */
function createParticle(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: 1.5 + Math.random(),
    color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
    opacity: 0.3 + Math.random() * 0.3,
  };
}

/**
 * @param {ReturnType<typeof createParticle>} p
 * @param {number} w
 * @param {number} h
 */
function applyPhysics(p, w, h) {
  const dx = p.x - mouse.x;
  const dy = p.y - mouse.y;
  const dist = Math.hypot(dx, dy);

  if (dist < CONFIG.mouseRadiusPx && dist > 0) {
    const force = (1 - dist / CONFIG.mouseRadiusPx) * CONFIG.mouseForce;
    p.vx += (dx / dist) * force;
    p.vy += (dy / dist) * force;
  }

  p.vx *= CONFIG.velocityDamping;
  p.vy *= CONFIG.velocityDamping;

  if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * CONFIG.idleJitter;
  if (Math.abs(p.vy) < 0.1) p.vy += (Math.random() - 0.5) * CONFIG.idleJitter;

  p.x += p.vx;
  p.y += p.vy;

  if (p.x < 0) {
    p.x = 0;
    p.vx *= -1;
  }
  if (p.x > w) {
    p.x = w;
    p.vx *= -1;
  }
  if (p.y < 0) {
    p.y = 0;
    p.vy *= -1;
  }
  if (p.y > h) {
    p.y = h;
    p.vy *= -1;
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {ReturnType<typeof createParticle>[]} particles
 */
function drawProximityLines(ctx, particles) {
  ctx.lineWidth = 0.5;
  const maxD = CONFIG.lineDistancePx;

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist >= maxD) continue;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = a.color;
      ctx.globalAlpha = (1 - dist / maxD) * 0.15;
      ctx.stroke();
    }
  }
}

/**
 * Prepends a fixed canvas and runs the animation loop.
 * @param {{ container?: HTMLElement }} [options]
 */
export function initParticles(options = {}) {
  const container = options.container ?? document.body;
  const canvas = document.createElement('canvas');
  canvas.id = CONFIG.canvasId;
  container.prepend(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  /** @type {ReturnType<typeof createParticle>[]} */
  let particles = [];

  let resizeTimer = 0;

  function resizeCanvas() {
    width = canvas.width = globalThis.innerWidth;
    height = canvas.height = globalThis.innerHeight;
  }

  function respawnParticles() {
    const count =
      globalThis.innerWidth < CONFIG.mobileBreakpointPx
        ? CONFIG.particleCountMobile
        : CONFIG.particleCountDesktop;
    particles = Array.from({ length: count }, () => createParticle(width, height));
  }

  function scheduleResize() {
    globalThis.clearTimeout(resizeTimer);
    resizeTimer = globalThis.setTimeout(() => {
      resizeCanvas();
      respawnParticles();
    }, CONFIG.resizeDebounceMs);
  }

  function frame() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      applyPhysics(p, width, height);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
    }

    drawProximityLines(ctx, particles);
    ctx.globalAlpha = 1;

    globalThis.requestAnimationFrame(frame);
  }

  resizeCanvas();
  respawnParticles();
  frame();

  globalThis.addEventListener('resize', scheduleResize, { passive: true });
}
