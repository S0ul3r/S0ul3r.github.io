import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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

function smoothstep(edge0, edge1, value) {
  const x = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
}

function presenceWindow(value, enterStart, enterEnd, exitStart = 1, exitEnd = 1) {
  return smoothstep(enterStart, enterEnd, value) * (1 - smoothstep(exitStart, exitEnd, value));
}

/** Load the supplied Blender horse and build its luminous low-poly treatment. */
async function makeHorse() {
  const gltf = await new GLTFLoader().loadAsync('/media/horse.glb');
  const source = gltf.scene.getObjectByProperty('type', 'Mesh');
  if (!(source instanceof THREE.Mesh)) throw new Error('Horse model does not contain a mesh.');

  source.updateWorldMatrix(true, false);
  const geometry = source.geometry.clone();
  geometry.applyMatrix4(source.matrixWorld);
  geometry.rotateY(Math.PI / 2);
  geometry.center();
  geometry.computeBoundingBox();
  const size = geometry.boundingBox.getSize(new THREE.Vector3());
  const modelScale = 5.35 / size.y;
  geometry.scale(modelScale, modelScale, modelScale);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();

  const group = new THREE.Group();
  const fill = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: 0x9ca3a8,
      emissive: 0x111315,
      roughness: 0.76,
      metalness: 0.14,
      flatShading: true,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
    })
  );
  group.add(fill);

  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({
      color: 0xf2f2f2,
      transparent: true,
      opacity: 0.42,
    })
  );
  group.add(wire);

  const particleGeometry = geometry.clone();
  const particlePositions = particleGeometry.attributes.position;
  const particleBase = Float32Array.from(particlePositions.array);
  const particleScatter = new Float32Array(particleBase.length);
  for (let i = 0; i < particlePositions.count; i += 1) {
    const offset = i * 3;
    const distance = 0.55 + ((i * 47) % 100) / 42;
    particleScatter[offset] = Math.sin(i * 12.9898) * distance;
    particleScatter[offset + 1] = Math.cos(i * 7.233) * distance;
    particleScatter[offset + 2] = Math.sin(i * 3.771) * distance * 0.72;
  }
  const nodes = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.026,
      transparent: true,
      opacity: 0.38,
      sizeAttenuation: true,
    })
  );
  group.add(nodes);

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.32,
    })
  );
  const bounds = geometry.boundingBox;
  glow.position.set(bounds.max.x * 0.78, bounds.max.y * 0.7, 0.5);
  glow.scale.set(1.15, 1.15, 1);
  group.add(glow);

  group.userData.fill = fill;
  group.userData.wire = wire;
  group.userData.nodes = nodes;
  group.userData.glow = glow;
  group.userData.particleBase = particleBase;
  group.userData.particleScatter = particleScatter;
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

  const ambientLight = new THREE.HemisphereLight(0xdce5eb, 0x050505, 1.25);
  scene.add(ambientLight);
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
  keyLight.position.set(-4, 8, 7);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x9fb6c5, 1.35);
  rimLight.position.set(6, 2, -8);
  scene.add(rimLight);

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

  const bust = new THREE.Group();
  bust.position.set(-5.9, 2.35, 0);
  bust.rotation.y = 0.08;
  bust.visible = true;
  scene.add(bust);
  let horse = null;
  let horseHitTarget = null;
  makeHorse()
    .then((model) => {
      horse = model;
      horseHitTarget = model.userData.fill;
      bust.add(model);
      updateHorseAppearance(horsePresence, 0);
      if (reduce) renderer.render(scene, camera);
    })
    .catch((error) => console.error('Unable to load horse model.', error));

  const crystals = new THREE.Group();
  for (let i = 0; i < 9; i += 1) {
    const g = new THREE.OctahedronGeometry(0.45 + Math.random() * 0.35, 0);
    const m = new THREE.LineSegments(
      new THREE.WireframeGeometry(g),
      new THREE.LineBasicMaterial({ color: 0xd8d8d8, transparent: true, opacity: 0.28 })
    );
    m.position.set((Math.random() - 0.5) * 22, 1.2 + Math.random() * 6, (Math.random() - 0.5) * 16);
    m.userData.spin = 0.12 + Math.random() * 0.25;
    m.userData.baseScale = 0.78 + Math.random() * 0.42;
    m.material.opacity = 0;
    crystals.add(m);
    g.dispose();
  }
  scene.add(crystals);

  const blobGeo = new THREE.IcosahedronGeometry(2.15, mobile ? 2 : 4);
  const blobBase = Float32Array.from(blobGeo.attributes.position.array);
  const blob = new THREE.Mesh(
    blobGeo,
    new THREE.MeshBasicMaterial({
      color: 0xc8c8c8,
      wireframe: true,
      transparent: true,
      opacity: 0,
    })
  );
  blob.position.set(6.35, 1.65, 1.35);
  blob.scale.setScalar(0.72);
  scene.add(blob);

  const menuOrbGeo = new THREE.IcosahedronGeometry(3.4, mobile ? 2 : 4);
  const menuOrbBase = Float32Array.from(menuOrbGeo.attributes.position.array);
  const menuOrb = new THREE.Mesh(
    menuOrbGeo,
    new THREE.MeshBasicMaterial({
      color: 0xe8e8e8,
      wireframe: true,
      transparent: true,
      opacity: 0,
    })
  );
  menuOrb.position.set(0, 1.3, -1.2);
  scene.add(menuOrb);

  let composer = null;
  if (!mobile && !reduce && typeof EffectComposer === 'function') {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(globalThis.innerWidth, globalThis.innerHeight),
      0.28,
      0.5,
      0.22
    );
    composer.addPass(bloomPass);
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
  let horsePresence = 0;
  let horsePresenceTarget = 0;
  let crystalPresence = 0;
  let crystalPresenceTarget = 0;
  let blobPresence = 0;
  let blobPresenceTarget = 0;
  let menuOrbPresence = 0;

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
    horsePresenceTarget = live && !menuOpen ? presenceWindow(progress, 0.08, 0.17, 0.47, 0.58) : 0;
    crystalPresenceTarget = live && !menuOpen ? presenceWindow(progress, 0.24, 0.36, 0.74, 0.88) : 0;
    blobPresenceTarget = live && !menuOpen ? smoothstep(0.65, 0.78, progress) : 0;
    if (reduce) {
      horsePresence = horsePresenceTarget;
      crystalPresence = crystalPresenceTarget;
      blobPresence = blobPresenceTarget;
      menuOrbPresence = live && menuOpen ? 1 : 0;
      updateHorseAppearance(horsePresence);
      crystals.children.forEach((crystal) => {
        crystal.material.opacity = crystalPresence * 0.28;
        crystal.scale.setScalar(crystal.userData.baseScale * (0.45 + crystalPresence * 0.55));
      });
      blob.material.opacity = blobPresence * 0.32;
      blob.scale.setScalar(0.72 + blobPresence * 0.56);
      menuOrb.material.opacity = menuOrbPresence * 0.22;
      menuOrb.scale.setScalar(0.72 + menuOrbPresence * 0.28);
      renderer.render(scene, camera);
    }
  }

  function updateHorseAppearance(presence) {
    if (!horse) return;
    const fill = horse.userData.fill;
    const wire = horse.userData.wire;
    const nodes = horse.userData.nodes;
    const glow = horse.userData.glow;
    fill.material.opacity = presence * 0.24;
    wire.material.opacity = presence * 0.42;
    nodes.material.opacity = Math.min(1, presence * 0.38 + (1 - presence) * presence * 1.8);
    glow.material.opacity = presence * 0.32;
    glow.scale.set(1.15, 1.15, 1);
    horse.scale.setScalar(0.9 + presence * 0.1);
    horse.visible = presence > 0.002;

    const positions = nodes.geometry.attributes.position;
    const base = horse.userData.particleBase;
    const scatter = horse.userData.particleScatter;
    const spread = Math.pow(1 - presence, 1.7);
    for (let i = 0; i < positions.count; i += 1) {
      const offset = i * 3;
      positions.setXYZ(
        i,
        base[offset] + scatter[offset] * spread,
        base[offset + 1] + scatter[offset + 1] * spread,
        base[offset + 2] + scatter[offset + 2] * spread
      );
    }
    positions.needsUpdate = true;
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
    horsePresence += (horsePresenceTarget - horsePresence) * 0.065;
    crystalPresence += (crystalPresenceTarget - crystalPresence) * 0.055;
    blobPresence += (blobPresenceTarget - blobPresence) * 0.05;
    const menuTarget = document.body.classList.contains('is-live') && menuOpen ? 1 : 0;
    menuOrbPresence += (menuTarget - menuOrbPresence) * 0.07;

    updateHorseAppearance(horsePresence);

    crystals.children.forEach((crystal) => {
      crystal.material.opacity = crystalPresence * 0.28;
      crystal.scale.setScalar(crystal.userData.baseScale * (0.45 + crystalPresence * 0.55));
    });
    blob.material.opacity = blobPresence * 0.32;
    blob.scale.setScalar(0.72 + blobPresence * 0.56);
    menuOrb.material.opacity = menuOrbPresence * 0.22;
    menuOrb.scale.setScalar(0.72 + menuOrbPresence * 0.28);

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

      bust.rotation.y = Math.sin(t * 0.25) * 0.18 + pointer.x * 0.24;
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
