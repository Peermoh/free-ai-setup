import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';

/**
 * The 9:16 isometric scene.
 *
 * Built imperatively and driven by a GSAP timeline that is never played: the
 * renderer seeks it to an exact time per frame, so a video render is
 * deterministic and a live preview is the same code.
 *
 * Vertical layout, because the frame is tall:
 *   top    — three server blocks (cyan, magenta, yellow) in a slight arc
 *   middle — the routing hub
 *   bottom — a low-poly laptop
 */

export const BG = 0x0d1117;
export const CYAN = 0x22d3ee;
export const MAGENTA = 0xe879f9;
export const YELLOW = 0xfacc15;
export const ORANGE = 0xff8a2b;

const TOP_Y = 7.4;
const HUB_Y = 0;
const LAP_Y = -7.6;

/** A label drawn to a canvas and used as a texture. */
const panelTexture = (title: string, lines: string[], accent: string) => {
  const W = 1024;
  const H = 576;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;

  g.fillStyle = '#070c14';
  g.beginPath();
  g.roundRect(0, 0, W, H, 26);
  g.fill();
  g.strokeStyle = accent;
  g.lineWidth = 5;
  g.stroke();

  g.fillStyle = accent;
  g.fillRect(0, 0, W, 76);
  g.fillStyle = '#07101a';
  g.font = 'bold 42px "JetBrains Mono", monospace';
  g.fillText(title, 28, 53);

  g.fillStyle = '#e8eef9';
  g.font = '38px "JetBrains Mono", monospace';
  lines.forEach((l, i) => {
    if (l.startsWith('>')) {
      g.fillStyle = accent;
      g.fillText('>', 28, 150 + i * 58);
      g.fillStyle = '#e8eef9';
      g.fillText(l.slice(1).trim(), 62, 150 + i * 58);
    } else {
      g.fillText(l, 28, 150 + i * 58);
    }
  });

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

/** A server cabinet: body, lit face strip, vent slats. */
const makeServer = (colour: number) => {
  const g = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 3.2, 1.7),
    new THREE.MeshStandardMaterial({color: 0x1b2535, roughness: 0.75, metalness: 0.25})
  );
  g.add(body);

  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.42, 0.08),
    new THREE.MeshStandardMaterial({
      color: colour,
      emissive: colour,
      emissiveIntensity: 2.4,
      roughness: 0.3,
    })
  );
  strip.position.set(0, 1.2, 0.87);
  g.add(strip);

  for (let i = 0; i < 5; i++) {
    const slat = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.1, 0.05),
      new THREE.MeshStandardMaterial({color: 0x3a4a63, roughness: 0.9})
    );
    slat.position.set(0, 0.45 - i * 0.42, 0.87);
    g.add(slat);
  }

  const halo = new THREE.PointLight(colour, 6, 7);
  halo.position.set(0, 1.2, 1.3);
  g.add(halo);

  return g;
};

/** The routing hub: a slab with a glowing core ring. */
const makeHub = () => {
  const g = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.9, 2.6),
    new THREE.MeshStandardMaterial({color: 0x241708, roughness: 0.6, metalness: 0.35})
  );
  g.add(base);

  const core = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.14, 16, 48),
    new THREE.MeshStandardMaterial({
      color: ORANGE,
      emissive: ORANGE,
      emissiveIntensity: 3,
      roughness: 0.25,
    })
  );
  core.rotation.x = Math.PI / 2;
  core.position.y = 0.62;
  g.add(core);

  for (let i = 0; i < 5; i++) {
    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 12),
      new THREE.MeshStandardMaterial({
        color: ORANGE,
        emissive: ORANGE,
        emissiveIntensity: 2.5,
      })
    );
    led.position.set(-0.9 + i * 0.45, 0.48, 1.33);
    g.add(led);
  }

  const glow = new THREE.PointLight(ORANGE, 8, 9);
  glow.position.y = 1;
  g.add(glow);

  return {group: g, core, glow};
};

/** A low-poly laptop: wedge base and a screen hinged back. */
const makeLaptop = () => {
  const g = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 0.22, 2.9),
    new THREE.MeshStandardMaterial({color: 0xb8c4d8, roughness: 0.5, metalness: 0.5})
  );
  g.add(base);

  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.03, 1.7),
    new THREE.MeshStandardMaterial({color: 0x8d9ab2, roughness: 0.8})
  );
  pad.position.set(0, 0.13, 0.2);
  g.add(pad);

  const lid = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 2.7, 0.16),
    new THREE.MeshStandardMaterial({color: 0x9fadc4, roughness: 0.5, metalness: 0.5})
  );
  lid.add(shell);
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 2.3),
    new THREE.MeshStandardMaterial({
      color: 0x18324a,
      emissive: CYAN,
      emissiveIntensity: 0.55,
      roughness: 0.3,
    })
  );
  glass.position.z = 0.1;
  lid.add(glass);
  lid.position.set(0, 1.35, -1.45);
  lid.rotation.x = -0.32;
  g.add(lid);

  const spill = new THREE.PointLight(CYAN, 5, 8);
  spill.position.set(0, 1.4, 0.4);
  g.add(spill);

  return {group: g, glass};
};

export type Built = {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  composer: EffectComposer;
  timeline: gsap.core.Timeline;
  /** Per-frame work that is not a tween: floats, flow, pulses. */
  tick: (t: number) => void;
  dispose: () => void;
};

export const build = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  duration: number
): Built => {
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 26, 54);

  // Isometric: an orthographic camera on the (1,1,1) diagonal.
  const frustum = 22;
  const aspect = width / height;
  const camera = new THREE.OrthographicCamera(
    (-frustum * aspect) / 2,
    (frustum * aspect) / 2,
    frustum / 2,
    -frustum / 2,
    -100,
    200
  );
  camera.position.set(18, 16, 18);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0x9fb4d8, 1.05));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(8, 16, 10);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x7fa8ff, 0.7);
  fill.position.set(-10, 4, -8);
  scene.add(fill);

  // ---- the three source blocks, in a slight arc across the top -----------
  const arc: {x: number; y: number; z: number; c: number; label: string}[] = [
    {x: 3.4, y: TOP_Y - 0.5, z: -3.4, c: CYAN, label: 'LOCAL'},
    {x: 0, y: TOP_Y + 0.35, z: 0, c: MAGENTA, label: 'FREE TIER'},
    {x: -3.4, y: TOP_Y - 0.5, z: 3.4, c: YELLOW, label: 'KAGGLE GPU'},
  ];
  const servers = arc.map((a) => {
    const s = makeServer(a.c);
    s.position.set(a.x, a.y, a.z);
    scene.add(s);
    return s;
  });

  // ---- the hub, middle ---------------------------------------------------
  const hub = makeHub();
  hub.group.position.set(0, HUB_Y, 0);
  scene.add(hub.group);

  // ---- the laptop, bottom ------------------------------------------------
  const laptop = makeLaptop();
  laptop.group.position.set(0, LAP_Y, 0);
  scene.add(laptop.group);

  // ---- data flow ---------------------------------------------------------
  // Each source curves down into the hub; the hub curves down into the laptop.
  const curves: THREE.CubicBezierCurve3[] = arc.map(
    (a) =>
      new THREE.CubicBezierCurve3(
        new THREE.Vector3(a.x, a.y - 1.7, a.z),
        new THREE.Vector3(a.x * 0.8, a.y - 4, a.z * 0.8),
        new THREE.Vector3(a.x * 0.3, HUB_Y + 3.2, a.z * 0.3),
        new THREE.Vector3(0, HUB_Y + 0.8, 0)
      )
  );
  const outCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, HUB_Y - 0.5, 0),
    new THREE.Vector3(0, HUB_Y - 3, 0.6),
    new THREE.Vector3(0, LAP_Y + 3.4, 0.6),
    new THREE.Vector3(0, LAP_Y + 1.1, 0)
  );
  const allCurves = [...curves, outCurve];

  // faint guide lines, so the route is readable even between packets
  allCurves.forEach((c, i) => {
    const geo = new THREE.BufferGeometry().setFromPoints(c.getPoints(40));
    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({
        color: i < 3 ? arc[i].c : ORANGE,
        transparent: true,
        opacity: 0.22,
      })
    );
    scene.add(line);
  });

  // the packets themselves
  const PER = 7;
  const packets: {mesh: THREE.Mesh; curve: THREE.CubicBezierCurve3; off: number}[] = [];
  allCurves.forEach((curve, ci) => {
    const colour = ci < 3 ? arc[ci].c : ORANGE;
    for (let i = 0; i < PER; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 12, 12),
        new THREE.MeshBasicMaterial({color: colour})
      );
      scene.add(mesh);
      packets.push({mesh, curve, off: i / PER});
    }
  });
  // a few packets carry their own light, so they glow what they pass
  const travellers = [0, PER, PER * 2, PER * 3].map((i) => {
    const l = new THREE.PointLight(packets[i] ? 0xffffff : 0xffffff, 4, 6);
    scene.add(l);
    return {light: l, packet: packets[i]};
  });

  // ---- UI panels ---------------------------------------------------------
  const panels = [
    {
      at: 1.2,
      hold: 3.4,
      pos: new THREE.Vector3(0, TOP_Y - 1.2, 0),
      tex: panelTexture('ollama · local', ['> ollama run llama3.2:3b', '  answered on this machine'], '#22d3ee'),
    },
    {
      at: 6.0,
      hold: 3.4,
      pos: new THREE.Vector3(0, TOP_Y - 1.2, 0),
      tex: panelTexture('free tiers', ['  groq · gemini', '  nvidia · openrouter'], '#e879f9'),
    },
    {
      at: 11.0,
      hold: 3.2,
      pos: new THREE.Vector3(0, HUB_Y + 3.4, 0),
      tex: panelTexture('omniroute', ['> strategy: priority', '  5 targets, laptop last'], '#ff8a2b'),
    },
    {
      at: 15.6,
      hold: 3.4,
      pos: new THREE.Vector3(0, LAP_Y + 4.6, 0),
      tex: panelTexture('open webui', ['  one chat page', '  every model behind it'], '#facc15'),
    },
  ];

  // 80% of the frame width, in world units, so the text is readable on a phone
  // Sized so the panel reads at about 80% of the frame width at the zoom
  // levels it appears at; the camera zoom varies, so this is deliberately
  // generous rather than exactly 0.8 of the unzoomed frustum.
  const panelW = frustum * aspect * 1.15;
  const panelMeshes = panels.map((p) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(panelW, (panelW * 576) / 1024),
      new THREE.MeshBasicMaterial({
        map: p.tex,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      })
    );
    m.renderOrder = 999;
    m.position.copy(p.pos);
    m.quaternion.copy(camera.quaternion); // always face the camera
    m.scale.setScalar(0.01);
    scene.add(m);
    return m;
  });

  // ---- the timeline ------------------------------------------------------
  const timeline = gsap.timeline({paused: true});

  // camera: down the stack, zooming into each section in turn
  camera.zoom = 1;
  camera.updateProjectionMatrix();
  const look = {y: 0};
  const syncCam = () => {
    camera.lookAt(0, look.y, 0);
    camera.updateProjectionMatrix();
  };

  timeline
    .fromTo(camera, {zoom: 0.82}, {zoom: 1.35, duration: 4.5, ease: 'power2.inOut', onUpdate: syncCam}, 0)
    .to(look, {y: TOP_Y - 1, duration: 4.5, ease: 'power2.inOut', onUpdate: syncCam}, 0)
    .to(camera, {zoom: 1.2, duration: 3.5, ease: 'power1.inOut', onUpdate: syncCam}, 5.2)
    .to(look, {y: TOP_Y - 2, duration: 3.5, ease: 'power1.inOut', onUpdate: syncCam}, 5.2)
    .to(camera, {zoom: 1.5, duration: 3.6, ease: 'power2.inOut', onUpdate: syncCam}, 10.2)
    .to(look, {y: HUB_Y + 0.5, duration: 3.6, ease: 'power2.inOut', onUpdate: syncCam}, 10.2)
    .to(camera, {zoom: 1.25, duration: 4, ease: 'power2.inOut', onUpdate: syncCam}, 14.8)
    .to(look, {y: LAP_Y + 2, duration: 4, ease: 'power2.inOut', onUpdate: syncCam}, 14.8)
    .to(camera, {zoom: 0.8, duration: 3.4, ease: 'power2.inOut', onUpdate: syncCam}, 19.4)
    .to(look, {y: 0, duration: 3.4, ease: 'power2.inOut', onUpdate: syncCam}, 19.4);

  // panels: grow to full size, hold, shrink away
  panelMeshes.forEach((m, i) => {
    const p = panels[i];
    timeline
      .to(m.material as THREE.Material, {opacity: 1, duration: 0.35}, p.at)
      .to(m.scale, {x: 1, y: 1, z: 1, duration: 0.6, ease: 'back.out(1.6)'}, p.at)
      .to(m.scale, {x: 0.01, y: 0.01, z: 0.01, duration: 0.4, ease: 'power2.in'}, p.at + p.hold)
      .to(m.material as THREE.Material, {opacity: 0, duration: 0.35}, p.at + p.hold + 0.1);
  });

  timeline.totalDuration(Math.max(timeline.duration(), duration));

  // ---- post ---------------------------------------------------------------
  const composer = new EffectComposer(renderer);
  composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(
    new UnrealBloomPass(new THREE.Vector2(width, height), 0.55, 0.7, 0.3)
  );

  /** Everything that is continuous rather than keyframed. */
  const tick = (t: number) => {
    servers.forEach((s, i) => {
      s.position.y = arc[i].y + Math.sin(t * 1.1 + i * 1.7) * 0.22;
      s.rotation.y = Math.sin(t * 0.35 + i) * 0.08;
    });
    hub.group.position.y = HUB_Y + Math.sin(t * 0.9 + 0.6) * 0.16;
    hub.core.rotation.z = t * 0.8;
    laptop.group.position.y = LAP_Y + Math.sin(t * 0.8 + 1.4) * 0.18;

    // packets run their curves; the hub flares as each one arrives
    let arriving = 0;
    packets.forEach((p) => {
      const u = (t * 0.26 + p.off) % 1;
      p.curve.getPointAt(u, p.mesh.position);
      const near = 1 - Math.min(1, Math.abs(u - 0.97) * 26);
      if (near > 0) arriving = Math.max(arriving, near);
      const s = 0.8 + Math.sin(u * Math.PI) * 0.5;
      p.mesh.scale.setScalar(s);
    });
    hub.glow.intensity = 6 + arriving * 16;
    (hub.core.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.4 + arriving * 4;
    (laptop.glass.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.5 + (0.5 + Math.sin(t * 3) * 0.5) * 0.25;

    travellers.forEach((tr) => {
      if (tr.packet) tr.light.position.copy(tr.packet.mesh.position);
    });

    panelMeshes.forEach((m) => m.quaternion.copy(camera.quaternion));
  };

  const dispose = () => {
    composer.dispose();
    renderer.dispose();
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
    });
  };

  return {scene, camera, composer, timeline, tick, dispose};
};
