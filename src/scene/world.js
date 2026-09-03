import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { fbm } from './noise.js';

const CAMERAS = [
  { pos: [0, 5.6, 16.5], look: [0, 1.4, 0] },
  { pos: [2.2, 3.1, 10.2], look: [-3.2, 1.8, 0] },
  { pos: [3.8, 6.8, 13.2], look: [1.2, 1.4, -2.4] },
  { pos: [0.2, 4.4, 12.4], look: [0, 1.6, -1.2] },
  { pos: [4.4, 2.8, 8.6], look: [6.2, 1.7, 1.4] },
];

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 2, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.18, 'rgba(255,255,255,0.55)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Low-poly rearing horse assembled from wireframe primitives.
 * Nickname: horse — side view facing +X.
 */
function makeHorse() {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({
    color: 0xf2f2f2,
    wireframe: true,
    transparent: true,
    opacity: 0.85,
  });
  const nodeMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true,
  });

  const addWire = (geo, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    mesh.rotation.set(rx, ry, rz);
    group.add(mesh);
    const pts = new THREE.Points(geo, nodeMat);
    pts.position.copy(mesh.position);
    pts.scale.copy(mesh.scale);
    pts.rotation.copy(mesh.rotation);
    group.add(pts);
  };

  // Barrel / torso
  addWire(new THREE.SphereGeometry(0.85, 10, 8), 0.1, 0.35, 0, 1.35, 0.85, 0.7);
  // Chest
  addWire(new THREE.SphereGeometry(0.55, 8, 6), 0.95, 0.55, 0, 1.1, 1, 0.85);
  // Neck
  addWire(new THREE.CylinderGeometry(0.22, 0.32, 1.15, 7), 1.45, 1.25, 0, 1, 1, 1, 0, 0, -0.85);
  // Head
  addWire(new THREE.SphereGeometry(0.38, 8, 6), 2.05, 1.95, 0, 1.35, 0.75, 0.7, 0, 0, -0.35);
  // Snout
  addWire(new THREE.ConeGeometry(0.22, 0.55, 6), 2.55, 1.85, 0, 1, 1, 0.85, 0, 0, -1.45);
  // Ears
  addWire(new THREE.ConeGeometry(0.1, 0.32, 4), 1.95, 2.35, 0.12, 1, 1, 1, 0.2, 0, 0.15);
  addWire(new THREE.ConeGeometry(0.1, 0.32, 4), 1.95, 2.35, -0.12, 1, 1, 1, -0.2, 0, 0.15);
  // Mane ridge
  addWire(new THREE.BoxGeometry(0.12, 0.9, 0.18), 1.35, 1.55, 0, 1, 1, 1, 0, 0, -0.7);

  // Front legs (raised)
  addWire(new THREE.CylinderGeometry(0.09, 0.11, 0.7, 6), 1.15, 0.35, 0.22, 1, 1, 1, 0, 0, -1.2);
  addWire(new THREE.CylinderGeometry(0.07, 0.09, 0.55, 6), 1.55, -0.05, 0.22, 1, 1, 1, 0, 0, -1.55);
  addWire(new THREE.CylinderGeometry(0.09, 0.11, 0.7, 6), 1.05, 0.3, -0.22, 1, 1, 1, 0, 0, -1.05);
  addWire(new THREE.CylinderGeometry(0.07, 0.09, 0.55, 6), 1.4, -0.15, -0.22, 1, 1, 1, 0, 0, -1.4);

  // Hind legs (planted)
  addWire(new THREE.CylinderGeometry(0.12, 0.14, 0.95, 6), -0.55, -0.45, 0.2, 1, 1, 1, 0, 0, 0.35);
  addWire(new THREE.CylinderGeometry(0.09, 0.11, 0.7, 6), -0.75, -1.15, 0.2, 1, 1, 1, 0, 0, 0.15);
  addWire(new THREE.CylinderGeometry(0.12, 0.14, 0.95, 6), -0.45, -0.4, -0.2, 1, 1, 1, 0, 0, 0.25);
  addWire(new THREE.CylinderGeometry(0.09, 0.11, 0.7, 6), -0.6, -1.15, -0.2, 1, 1, 1, 0, 0, 0.1);

  // Hooves
  addWire(new THREE.BoxGeometry(0.22, 0.12, 0.18), -0.85, -1.55, 0.2);
  addWire(new THREE.BoxGeometry(0.22, 0.12, 0.18), -0.7, -1.55, -0.2);
  addWire(new THREE.BoxGeometry(0.18, 0.1, 0.14), 1.7, -0.35, 0.22);
  addWire(new THREE.BoxGeometry(0.18, 0.1, 0.14), 1.55, -0.45, -0.22);

  // Tail
  addWire(new THREE.CylinderGeometry(0.05, 0.1, 1.1, 5), -1.15, 0.05, 0, 1, 1, 1, 0, 0, 0.75);
  addWire(new THREE.ConeGeometry(0.12, 0.45, 5), -1.55, -0.45, 0, 1, 1, 1, 0, 0, 0.4);

  // Soft inner glow in the chest
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.9,
    })
  );
  glow.position.set(0.55, 0.7, 0.35);
  glow.scale.set(1.6, 1.6, 1);
  group.add(glow);

  group.position.set(-6.0, 1.55, 0);
  group.scale.set(1.15, 1.15, 1.15);
  group.rotation.y = 0.55;
  return group;
}

/**
 * @param {HTMLCanvasElement} canvas
 */
export function initWorld(canvas) {
  const reduce = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = globalThis.innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !mobile,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, mobile ? 1.25 : 1.6));
  renderer.setSize(globalThis.innerWidth, globalThis.innerHeight, false);
  renderer.setClearColor(0x050505, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, 0.034);

  const camera = new THREE.PerspectiveCamera(42, globalThis.innerWidth / globalThis.innerHeight, 0.1, 220);
  camera.position.set(...CAMERAS[0].pos);
  camera.lookAt(...CAMERAS[0].look);

  const segs = mobile ? 48 : 86;
  const terrainGeo = new THREE.PlaneGeometry(96, 64, segs, Math.round(segs * 0.66));
  terrainGeo.rotateX(-Math.PI / 2);
  const pos = terrainGeo.attributes.position;
  const baseX = new Float32Array(pos.count);
  const baseZ = new Float32Array(pos.count);
  const baseY = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i += 1) {
    baseX[i] = pos.getX(i);
    baseZ[i] = pos.getZ(i);
    const n = fbm(baseX[i] * 0.042, baseZ[i] * 0.042);
    baseY[i] = n * 8.2 - 1.4;
    pos.setY(i, baseY[i]);
  }
  pos.needsUpdate = true;
  const terrain = new THREE.Mesh(
    terrainGeo,
    new THREE.MeshBasicMaterial({
      color: 0x8a8a8a,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    })
  );
  scene.add(terrain);

  const starCount = mobile ? 900 : 1700;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    starPos[i * 3] = (Math.random() - 0.5) * 140;
    starPos[i * 3 + 1] = Math.random() * 48 + 1.5;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 140;
  }
  const stars = new THREE.Points(
    new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(starPos, 3)),
    new THREE.PointsMaterial({ color: 0xffffff, size: 0.045, transparent: true, opacity: 0.7 })
  );
  scene.add(stars);

  const sunMat = new THREE.SpriteMaterial({
    map: glowTexture(),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  });
  const sun = new THREE.Sprite(sunMat);
  sun.position.set(0.2, 13.4, -18);
  sun.scale.set(18, 18, 1);
  scene.add(sun);

  const bust = makeHorse();
  bust.visible = false;
  scene.add(bust);
  // Chest glow is built into the horse group; keep a small external accent off.
  const bulb = new THREE.Sprite(sunMat);
  bulb.position.set(-5.4, 2.2, 0.6);
  bulb.scale.set(0.01, 0.01, 1);
  bulb.visible = false;
  scene.add(bulb);

  const crystals = new THREE.Group();
  for (let i = 0; i < 9; i += 1) {
    const g = new THREE.OctahedronGeometry(0.45 + Math.random() * 0.35, 0);
    const m = new THREE.LineSegments(
      new THREE.WireframeGeometry(g),
      new THREE.LineBasicMaterial({ color: 0xd8d8d8, transparent: true, opacity: 0.28 })
    );
    m.position.set((Math.random() - 0.5) * 22, 1.2 + Math.random() * 6, (Math.random() - 0.5) * 16);
    m.userData.spin = 0.12 + Math.random() * 0.25;
    crystals.add(m);
    g.dispose();
  }
  crystals.visible = false;
  scene.add(crystals);

  const blobGeo = new THREE.IcosahedronGeometry(2.15, mobile ? 2 : 4);
  const blobBase = Float32Array.from(blobGeo.attributes.position.array);
  const blob = new THREE.Mesh(
    blobGeo,
    new THREE.MeshBasicMaterial({
      color: 0xc8c8c8,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    })
  );
  blob.position.set(6.35, 1.65, 1.35);
  blob.scale.set(1.28, 1.28, 1.28);
  blob.visible = false;
  scene.add(blob);

  const menuOrbGeo = new THREE.IcosahedronGeometry(3.4, mobile ? 2 : 4);
  const menuOrbBase = Float32Array.from(menuOrbGeo.attributes.position.array);
  const menuOrb = new THREE.Mesh(
    menuOrbGeo,
    new THREE.MeshBasicMaterial({
      color: 0xe8e8e8,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    })
  );
  menuOrb.position.set(0, 1.3, -1.2);
  menuOrb.visible = false;
  scene.add(menuOrb);

  let composer = null;
  if (!mobile && !reduce && typeof EffectComposer === 'function') {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(globalThis.innerWidth, globalThis.innerHeight),
      0.28,
      0.5,
      0.22
    );
    composer.addPass(bloom);
  }

  const pointer = { x: 0, y: 0 };
  const look = new THREE.Vector3(...CAMERAS[0].look);
  const camPos = new THREE.Vector3(...CAMERAS[0].pos);
  const targetPos = camPos.clone();
  const targetLook = look.clone();
  const clock = new THREE.Clock();
  let progress = 0;
  let raf = 0;
  let running = true;
  let menuOpen = false;

  function applyProgress(p) {
    progress = Math.max(0, Math.min(1, p));
    const scaled = progress * (CAMERAS.length - 1);
    const i = Math.floor(scaled);
    const t = scaled - i;
    const a = CAMERAS[i];
    const b = CAMERAS[Math.min(i + 1, CAMERAS.length - 1)];
    if (!menuOpen) {
      targetPos.set(
        a.pos[0] + (b.pos[0] - a.pos[0]) * t,
        a.pos[1] + (b.pos[1] - a.pos[1]) * t,
        a.pos[2] + (b.pos[2] - a.pos[2]) * t
      );
      targetLook.set(
        a.look[0] + (b.look[0] - a.look[0]) * t,
        a.look[1] + (b.look[1] - a.look[1]) * t,
        a.look[2] + (b.look[2] - a.look[2]) * t
      );
    }
    const live = document.body.classList.contains('is-live');
    const showBust = live && !menuOpen && progress > 0.12 && progress < 0.55;
    const showBlob = live && !menuOpen && progress > 0.72;
    bust.visible = showBust;
    bulb.visible = showBust;
    blob.visible = showBlob;
    crystals.visible = live && !menuOpen && progress > 0.28 && progress < 0.85;
    menuOrb.visible = live && menuOpen;
  }

  function resize() {
    const w = globalThis.innerWidth;
    const h = globalThis.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
  }

  function tick() {
    if (!running) return;
    raf = globalThis.requestAnimationFrame(tick);
    const t = clock.getElapsedTime();

    if (!reduce) {
      camPos.lerp(targetPos, 0.06);
      look.lerp(targetLook, 0.06);
      camera.position.copy(camPos);
      camera.position.x += pointer.x * 0.55;
      camera.position.y += pointer.y * 0.28;
      camera.lookAt(look);

      for (let i = 0; i < pos.count; i += 1) {
        pos.setY(i, baseY[i] + Math.sin(t * 0.55 + baseX[i] * 0.14) * 0.22);
      }
      pos.needsUpdate = true;

      bust.rotation.y = Math.sin(t * 0.25) * 0.35 + pointer.x * 0.4;
      crystals.children.forEach((c) => {
        c.rotation.y += 0.003 * c.userData.spin;
        c.rotation.x += 0.002 * c.userData.spin;
      });

      const bpos = blobGeo.attributes.position;
      for (let i = 0; i < bpos.count; i += 1) {
        const ox = blobBase[i * 3];
        const oy = blobBase[i * 3 + 1];
        const oz = blobBase[i * 3 + 2];
        const n = fbm(ox * 0.9 + t * 0.35, oy * 0.9 + t * 0.2);
        const s = 1 + (n - 0.5) * 0.28;
        bpos.setXYZ(i, ox * s, oy * s, oz * s);
      }
      bpos.needsUpdate = true;
      blob.rotation.y = t * 0.12;

      const mpos = menuOrbGeo.attributes.position;
      for (let i = 0; i < mpos.count; i += 1) {
        const ox = menuOrbBase[i * 3];
        const oy = menuOrbBase[i * 3 + 1];
        const oz = menuOrbBase[i * 3 + 2];
        const n = fbm(ox * 0.55 + t * 0.22, oy * 0.55 + t * 0.18);
        const s = 1 + (n - 0.5) * 0.42;
        mpos.setXYZ(i, ox * s, oy * s, oz * s);
      }
      mpos.needsUpdate = true;
      menuOrb.rotation.y = t * 0.08;
      menuOrb.rotation.x = Math.sin(t * 0.15) * 0.12;
    }

    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  globalThis.addEventListener('resize', resize, { passive: true });
  if (!reduce) tick();
  else {
    camera.position.set(...CAMERAS[0].pos);
    camera.lookAt(...CAMERAS[0].look);
    renderer.render(scene, camera);
  }

  return {
    setPointer(nx, ny) {
      pointer.x = nx;
      pointer.y = ny;
    },
    setProgress(p) {
      applyProgress(p);
    },
    setMenuOpen(open) {
      menuOpen = Boolean(open);
      if (menuOpen) {
        targetPos.set(0, 4.4, 13.2);
        targetLook.set(0, 1.25, -1.2);
      }
      applyProgress(progress);
    },
    destroy() {
      running = false;
      globalThis.cancelAnimationFrame(raf);
      renderer.dispose();
      composer?.dispose();
    },
  };
}
