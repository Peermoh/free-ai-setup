import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';

/**
 * "Cloud Architect Blueprint" — 9:16.
 *
 * Dark blue blueprint grid, crisp glowing white wireframe objects, cyan data
 * lines running from three server towers through a hexagonal routing hub and
 * down into a laptop. The camera is locked in a top-down isometric view and
 * only breathes: a very slow push in at the start, a slight pull back at the
 * end.
 */

export const BG = 0x081426;
export const WIRE = 0xffffff;
export const CYAN = 0x4bd8ff;
export const BLUE = 0x1e3a5f;

const LAPTOP_Y = -8.2;
const HUB_Y = -0.6;
const SERVER_Y = 7.2;

/** Blueprint label: thin uppercase text on a hairline rule. */
const labelTexture = (title: string, sub: string) => {
  const W = 512;
  const H = 128;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, W, H);
  g.strokeStyle = 'rgba(75,216,255,0.85)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, H - 34);
  g.lineTo(W, H - 34);
  g.stroke();
  g.fillStyle = '#ffffff';
  g.font = 'bold 40px "JetBrains Mono", monospace';
  g.fillText(title, 4, H - 50);
  g.fillStyle = 'rgba(75,216,255,0.9)';
  g.font = '26px "JetBrains Mono", monospace';
  g.fillText(sub, 4, H - 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

/** The closing terminal overlay. */
const terminalTexture = () => {
  const W = 1024;
  const H = 400;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = 'rgba(6,16,30,0.92)';
  g.beginPath();
  g.roundRect(0, 0, W, H, 18);
  g.fill();
  g.strokeStyle = 'rgba(75,216,255,0.9)';
  g.lineWidth = 4;
  g.stroke();
  g.strokeStyle = 'rgba(75,216,255,0.35)';
  g.lineWidth = 2;
  g.strokeRect(18, 18, W - 36, H - 36);
  g.fillStyle = CYAN_CSS;
  g.font = 'bold 54px "JetBrains Mono", monospace';
  g.fillText('>', 54, 180);
  g.fillStyle = '#ffffff';
  g.fillText('COMMENT "AI-LOCAL" TO EXECUTE', 110, 180);
  g.fillStyle = 'rgba(255,255,255,0.55)';
  g.font = '30px "JetBrains Mono", monospace';
  g.fillText('scripts + guide  ·  free to run', 110, 250);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const CYAN_CSS = '#4bd8ff';

/** A wireframe box: bright edges over a nearly black fill that hides edges behind. */
const wireBox = (w: number, h: number, d: number, colour = WIRE) => {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(w, h, d);
  const fill = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({color: BG, transparent: true, opacity: 0.92})
  );
  g.add(fill);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({color: colour, transparent: true, opacity: 1})
  );
  g.add(edges);
  return {group: g, fill, edges};
};

/** Horizontal rack lines inside a tower, for a technical read. */
const rackLines = (w: number, d: number, count: number, span: number) => {
  const pts: number[] = [];
  for (let i = 0; i < count; i++) {
    const y = -span / 2 + (span / (count - 1)) * i;
    pts.push(-w / 2, y, d / 2, w / 2, y, d / 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({color: CYAN, transparent: true, opacity: 0.55})
  );
};

export type Built = {
  composer: EffectComposer;
  timeline: gsap.core.Timeline;
  tick: (t: number) => void;
  dispose: () => void;
};

export const build = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): Built => {
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);

  // Locked top-down isometric.
  const frustum = 26;
  const aspect = width / height;
  const camera = new THREE.OrthographicCamera(
    (-frustum * aspect) / 2,
    (frustum * aspect) / 2,
    frustum / 2,
    -frustum / 2,
    -200,
    400
  );
  camera.position.set(20, 20, 20);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 1));

  // ---- blueprint grid ----------------------------------------------------
  const grid = new THREE.Group();
  const minor = new THREE.GridHelper(120, 120, BLUE, BLUE);
  (minor.material as THREE.Material).opacity = 0.32;
  (minor.material as THREE.Material).transparent = true;
  const major = new THREE.GridHelper(120, 12, 0x2f6ea8, 0x2f6ea8);
  (major.material as THREE.Material).opacity = 0.55;
  (major.material as THREE.Material).transparent = true;
  grid.add(minor, major);
  grid.position.y = LAPTOP_Y - 2.4;
  scene.add(grid);

  // ---- laptop, lower third ----------------------------------------------
  const laptop = new THREE.Group();
  const base = wireBox(6.4, 0.5, 4.4);
  laptop.add(base.group);
  const lid = new THREE.Group();
  const lidBox = wireBox(6.4, 4.2, 0.3);
  lid.add(lidBox.group);
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(5.8, 3.6),
    new THREE.MeshBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    })
  );
  glow.position.z = 0.2;
  lid.add(glow);
  lid.position.set(0, 2.1, -2.1);
  lid.rotation.x = -0.26;
  laptop.add(lid);
  laptop.position.set(0, LAPTOP_Y, 0);
  scene.add(laptop);

  // ---- three towers, upper third -----------------------------------------
  /*
   * In an isometric projection screen-x is (x - z) * 0.866 and screen-y does
   * not move when x and z change together. So a flat row across the frame is
   * (t, -t), and the frame is only ~14.6 world units wide: t beyond about
   * 2.5 pushes a tower off the edge.
   */
  const T = 2.5;
  const towerDefs = [
    {x: T, z: -T, title: 'LOCAL', sub: 'ollama · 3b'},
    {x: 0, z: 0, title: 'FREE TIERS', sub: 'groq · gemini · nvidia'},
    {x: -T, z: T, title: 'KAGGLE', sub: '2 × t4 gpu'},
  ];
  const towers = towerDefs.map((d) => {
    const g = new THREE.Group();
    const box = wireBox(3, 5.2, 3);
    g.add(box.group);
    g.add(rackLines(3, 3, 6, 4.2));
    g.position.set(d.x, SERVER_Y, d.z);

    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 1.3),
      new THREE.MeshBasicMaterial({
        map: labelTexture(d.title, d.sub),
        transparent: true,
        opacity: 0,
        depthTest: false,
      })
    );
    label.renderOrder = 900;
    label.position.set(d.x, SERVER_Y + 3.9, d.z);
    scene.add(label);

    scene.add(g);
    return {group: g, box, label};
  });

  // ---- hexagonal routing hub, centre --------------------------------------
  const hub = new THREE.Group();
  const hexGeo = new THREE.CylinderGeometry(2.6, 2.6, 1.1, 6);
  const hexFill = new THREE.Mesh(
    hexGeo,
    new THREE.MeshBasicMaterial({color: BG, transparent: true, opacity: 0.9})
  );
  const hexEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(hexGeo),
    new THREE.LineBasicMaterial({color: WIRE, transparent: true, opacity: 1})
  );
  const hexCore = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 0.08, 6),
    new THREE.MeshBasicMaterial({color: CYAN, transparent: true, opacity: 0.55})
  );
  hexCore.position.y = 0.6;
  hub.add(hexFill, hexEdges, hexCore);
  hub.position.set(0, HUB_Y, 0);
  hub.scale.setScalar(0.001);
  scene.add(hub);

  const hubLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 1.3),
    new THREE.MeshBasicMaterial({
      map: labelTexture('OMNIROUTE', 'open source router'),
      transparent: true,
      opacity: 0,
      depthTest: false,
    })
  );
  hubLabel.renderOrder = 900;
  hubLabel.position.set(0, HUB_Y - 2.4, 0);
  scene.add(hubLabel);

  // ---- data lines ---------------------------------------------------------
  const curves = towerDefs.map(
    (d) =>
      new THREE.CubicBezierCurve3(
        new THREE.Vector3(d.x, SERVER_Y - 2.8, d.z),
        new THREE.Vector3(d.x * 0.7, SERVER_Y - 5.5, d.z * 0.7),
        new THREE.Vector3(d.x * 0.25, HUB_Y + 3.5, d.z * 0.25),
        new THREE.Vector3(0, HUB_Y + 0.7, 0)
      )
  );
  const outCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, HUB_Y - 0.7, 0),
    new THREE.Vector3(0, HUB_Y - 3.2, 0),
    new THREE.Vector3(0, LAPTOP_Y + 4.2, 0),
    new THREE.Vector3(0, LAPTOP_Y + 1.4, 0)
  );
  const allCurves = [...curves, outCurve];

  const tubes = allCurves.map((c) => {
    const m = new THREE.Mesh(
      new THREE.TubeGeometry(c, 60, 0.07, 8, false),
      new THREE.MeshBasicMaterial({color: CYAN, transparent: true, opacity: 0})
    );
    scene.add(m);
    return m;
  });

  const PER = 6;
  const packets: {m: THREE.Mesh; c: THREE.CubicBezierCurve3; off: number}[] = [];
  allCurves.forEach((c) => {
    for (let i = 0; i < PER; i++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 10, 10),
        new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0})
      );
      scene.add(m);
      packets.push({m, c, off: i / PER});
    }
  });

  // ---- closing terminal ---------------------------------------------------
  const terminal = new THREE.Mesh(
    new THREE.PlaneGeometry(frustum * aspect * 0.86, frustum * aspect * 0.86 * (400 / 1024)),
    new THREE.MeshBasicMaterial({
      map: terminalTexture(),
      transparent: true,
      opacity: 0,
      depthTest: false,
    })
  );
  terminal.renderOrder = 999;
  terminal.position.set(0, LAPTOP_Y + 2.4, 0);
  scene.add(terminal);

  // ---- timeline, matching the four scenes --------------------------------
  const tl = gsap.timeline({paused: true});
  const flow = {on: 0};

  // scene 1 (0-14): the laptop materialises, camera pushes in very slowly
  camera.zoom = 0.82;
  camera.updateProjectionMatrix();
  laptop.scale.setScalar(0.001);
  const fadeAll = (o: THREE.Object3D, to: number, dur: number, at: number) => {
    o.traverse((c) => {
      const m = (c as THREE.Mesh).material as THREE.Material | undefined;
      if (m && 'opacity' in m) tl.to(m, {opacity: to, duration: dur}, at);
    });
  };

  tl.to(laptop.scale, {x: 1, y: 1, z: 1, duration: 1.6, ease: 'back.out(1.4)'}, 0.6);
  tl.to(camera, {zoom: 1.0, duration: 13, ease: 'none', onUpdate: () => camera.updateProjectionMatrix()}, 0.5);

  // scene 2 (15-32): the three towers draw themselves in, one by one
  towers.forEach((t, i) => {
    const at = 15.4 + i * 4.6;
    t.group.scale.set(1, 0.001, 1);
    tl.to(t.group.scale, {y: 1, duration: 1.1, ease: 'power2.out'}, at);
    tl.to(t.label.material as THREE.Material, {opacity: 1, duration: 0.6}, at + 0.5);
  });

  // scene 3 (33-42): the hub appears and the data starts flowing
  tl.to(hub.scale, {x: 1, y: 1, z: 1, duration: 1.1, ease: 'back.out(1.5)'}, 33.2);
  tl.to(hubLabel.material as THREE.Material, {opacity: 1, duration: 0.6}, 33.9);
  tubes.forEach((t, i) =>
    tl.to(t.material as THREE.Material, {opacity: 0.55, duration: 0.8}, 34.4 + i * 0.45)
  );
  tl.to(flow, {on: 1, duration: 1.2}, 35.2);
  packets.forEach((p) =>
    tl.to(p.m.material as THREE.Material, {opacity: 1, duration: 0.6}, 35.4)
  );

  // scene 4 (43-47): pull back slightly, terminal overlays the lower half
  tl.to(camera, {zoom: 0.84, duration: 2.2, ease: 'power2.inOut', onUpdate: () => camera.updateProjectionMatrix()}, 42.8);
  tl.to(terminal.material as THREE.Material, {opacity: 1, duration: 0.5}, 43.2);
  tl.fromTo(terminal.scale, {x: 0.9, y: 0.9}, {x: 1, y: 1, duration: 0.6, ease: 'back.out(1.6)'}, 43.2);

  tl.totalDuration(Math.max(tl.duration(), 47));

  const composer = new EffectComposer(renderer);
  composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.85, 0.55, 0.12));

  const tick = (t: number) => {
    // a slow continuous drift, so the schematic feels alive while locked off
    towers.forEach((tw, i) => {
      // hide entirely until it starts drawing itself in
      tw.group.visible = tw.group.scale.y > 0.02;
      tw.group.position.y = SERVER_Y + Math.sin(t * 0.7 + i * 1.3) * 0.16;
      tw.label.position.y = SERVER_Y + 3.9 + Math.sin(t * 0.7 + i * 1.3) * 0.16;
    });
    laptop.position.y = LAPTOP_Y + Math.sin(t * 0.6) * 0.14;
    hub.position.y = HUB_Y + Math.sin(t * 0.8 + 1) * 0.12;
    hub.rotation.y = t * 0.22;
    hubLabel.position.y = HUB_Y - 2.4 + Math.sin(t * 0.8 + 1) * 0.12;

    (hexCore.material as THREE.MeshBasicMaterial).opacity =
      0.3 + (0.5 + Math.sin(t * 3.4) * 0.5) * 0.45 * flow.on;
    (glow.material as THREE.MeshBasicMaterial).opacity =
      0.14 + (0.5 + Math.sin(t * 2.1) * 0.5) * 0.14;

    packets.forEach((p) => {
      const u = (t * 0.22 + p.off) % 1;
      p.c.getPointAt(u, p.m.position);
      p.m.scale.setScalar(0.7 + Math.sin(u * Math.PI) * 0.6);
    });

    // labels and the terminal always face the camera
    [...towers.map((x) => x.label), hubLabel, terminal].forEach((m) =>
      m.quaternion.copy(camera.quaternion)
    );
  };

  const dispose = () => {
    composer.dispose();
    renderer.dispose();
  };

  return {composer, timeline: tl, tick, dispose};
};
