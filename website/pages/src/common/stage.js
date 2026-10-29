// one gpu canvas for the whole page: every wireframe slot draws into its own rect, so the
// site spends 1 gpu context on shapes instead of one per canvas. engine swaps at runtime,
// canvas2d (per-slot) stays as the fallback for browsers with no gpu context.
import { onTick } from '../../../src/scene-loop.js?v=202610282358.5d159ea18e039d84856bb769ee171be2a5cdd905';
import { createWireframe, toLines } from './wireframe.js?v=202610282358.5d159ea18e039d84856bb769ee171be2a5cdd905';
import * as webgl from '../../../src/webgl/index.js?v=202610282358.5d159ea18e039d84856bb769ee171be2a5cdd905';
import * as webgpu from '../../../src/webgpu/index.js?v=202610282358.5d159ea18e039d84856bb769ee171be2a5cdd905';

const FOV = (50 * Math.PI) / 180;
const CAM_Z = 3;
const NEAR = 0.1;
const FAR = 10;
const DEFAULTS = { spin: 0.02, tilt: 0.15, tiltRate: 1 };

const ENGINES = { webgl, webgpu };
const CLIPPERS = /auto|scroll|hidden|clip/;

const T = new Float32Array(16);
const M1 = new Float32Array(16);
const M2 = new Float32Array(16);
const ROT_Y = new Float32Array(16);
const ROT_X = new Float32Array(16);
const PROJ = new Float32Array(16);
const VIEW = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -CAM_Z, 1]);

const mul = (a, b, out) => {
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      T[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return out.set(T);
};

// same camera as the canvas2d projector: fov 50, 3 units back, aspect from the slot rect
const mvpOf = (ry, rx, aspect, out) => {
  const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
  ROT_Y.set([cy, 0, -sy, 0, 0, 1, 0, 0, sy, 0, cy, 0, 0, 0, 0, 1]);
  ROT_X.set([1, 0, 0, 0, 0, cx, sx, 0, 0, -sx, cx, 0, 0, 0, 0, 1]);
  const f = 1 / Math.tan(FOV / 2);
  PROJ.fill(0);
  PROJ[0] = f / aspect;
  PROJ[5] = f;
  PROJ[10] = (FAR + NEAR) / (NEAR - FAR);
  PROJ[11] = -1;
  PROJ[14] = (2 * FAR * NEAR) / (NEAR - FAR);
  mul(ROT_X, ROT_Y, M1);
  mul(VIEW, M1, M2);
  return mul(PROJ, M2, out);
};

const rect = (el) => {
  const r = el.getBoundingClientRect();
  return [r.left, r.top, r.width, r.height];
};

const intersect = (a, b) => {
  const x = Math.max(a[0], b[0]);
  const y = Math.max(a[1], b[1]);
  const right = Math.min(a[0] + a[2], b[0] + b[2]);
  const bottom = Math.min(a[1] + a[3], b[1] + b[3]);
  return right > x && bottom > y ? [x, y, right - x, bottom - y] : null;
};

// the gpu canvas is not clipped by the page's own scroll boxes, so mirror them with a scissor
const clipperOf = (el) => {
  for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
    const { overflow, overflowX, overflowY } = getComputedStyle(n);
    if (CLIPPERS.test(`${overflow}${overflowX}${overflowY}`)) return n;
  }
  return null;
};

const slots = [];
let mode = 'webgl';
let engine = null;
let ready = false;
let gen = 0;
let canvas = null;
let stopFrame = null;
const MVP = new Float32Array(16);

// a canvas locks to the first context type it gets, so every engine bring-up needs a fresh one
const stageCanvas = () => {
  if (canvas?.isConnected) document.body.removeChild(canvas);
  canvas = document.createElement('canvas');
  canvas.id = 'gpu-stage';
  document.body.appendChild(canvas);
  return canvas;
};

const attach = (slot) => {
  slot.res = engine ? engine.mesh(toLines(slot.mesh)) : createWireframe(slot.el, slot.mesh, slot.opts);
};

const detach = (slot, current = engine) => {
  if (!slot.res) return;
  if (current) current.free(slot.res);
  else slot.res.stop();
  slot.res = null;
};

const frame = () => {
  const dpr = globalThis.devicePixelRatio || 1;
  const vw = globalThis.innerWidth;
  const vh = globalThis.innerHeight;
  engine.begin(Math.round(vw * dpr), Math.round(vh * dpr));
  const now = performance.now() / 1000;
  for (const slot of slots) {
    const r = rect(slot.el);
    if (r[2] <= 0 || r[3] <= 0 || r[0] > vw || r[1] > vh || r[0] + r[2] < 0 || r[1] + r[3] < 0) continue;
    let clip = null;
    if (slot.clipEl) {
      clip = intersect(r, rect(slot.clipEl));
      if (!clip) continue;
    }
    slot.ry += slot.opts.spin;
    mvpOf(slot.ry, Math.sin(now * slot.opts.tiltRate) * slot.opts.tilt, r[2] / r[3], MVP);
    engine.draw(slot.res, MVP, r, dpr, clip);
  }
  engine.end();
};

const run = () => {
  stopFrame ??= onTick(frame);
};

// the shared loop only exists to drive the gpu engine; canvas2d views tick themselves
const idle = () => {
  if (stopFrame && (!engine || slots.length === 0)) {
    stopFrame();
    stopFrame = null;
  }
};

let pending = 0;

async function rebuild() {
  const mine = ++gen;
  const previous = engine;
  engine = null;
  ready = false;
  pending++;
  idle(); // no frames while the next engine is still loading
  for (const slot of slots) detach(slot, previous);
  previous?.destroy();

  if (mode !== 'canvas2d') {
    try {
      engine = await ENGINES[mode].create(stageCanvas());
    } catch (err) {
      console.error(`[stage] ${mode} unavailable, drawing with canvas2d`, err);
      mode = 'canvas2d';
    }
    if (mine !== gen) { // a newer switch already took over
      engine?.destroy();
      engine = null;
      pending--;
      return;
    }
  }

  if (mode === 'canvas2d') canvas?.remove(); // no gpu canvas to show, drop the empty one

  ready = true;
  pending--;
  for (const slot of slots) attach(slot);
  if (engine && slots.length) run();
  else idle();
  window.dispatchEvent(new Event('renderermode'));
}

export function setMode(next) {
  if (next === mode || (!ENGINES[next] && next !== 'canvas2d')) return Promise.resolve();
  mode = next;
  return rebuild();
}

export const getMode = () => mode;

export const onModeChange = (fn) => window.addEventListener('renderermode', fn);

export function addSlot(el, mesh, opts = {}) {
  const slot = { el, mesh, opts: { ...DEFAULTS, ...opts }, clipEl: clipperOf(el), ry: 0, res: null };
  slots.push(slot);
  if (ready) {
    attach(slot);
    if (engine) run();
  } else if (!pending) rebuild(); // first slot on the page brings up the engine
  return () => {
    detach(slot);
    slots.splice(slots.indexOf(slot), 1);
    idle();
  };
}
