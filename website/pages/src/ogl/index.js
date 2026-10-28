// ogl backend. one webgl context for the whole page: every shape renders into one shared
// offscreen buffer and is copied into its own canvas, so 19 shapes still cost 1 context.
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from 'ogl';
import { onTick } from '../../../src/scene-loop.js';
import { build } from '../common/wireframe.js';

const DPR = globalThis.devicePixelRatio || 1;

const VERT = `
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;
void main() {
  vColor = color;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor, 1.0);
}`;

let shared = null;

// one renderer, grown to the largest canvas that asks for it. setSize takes css px.
function engine(size) {
  if (!shared) {
    const canvas = document.createElement('canvas');
    const renderer = new Renderer({ canvas, dpr: DPR, alpha: true, antialias: true, preserveDrawingBuffer: true });
    const gl = renderer.gl;
    const camera = new Camera(gl, { fov: 50, aspect: 1, near: 0.1, far: 100 });
    camera.position.z = 3;
    shared = { canvas, renderer, gl, camera, program: new Program(gl, { vertex: VERT, fragment: FRAG }), buf: 0 };
  }
  if (shared.buf < size) {
    shared.buf = size;
    shared.renderer.setSize(size, size);
  }
  return shared;
}

// wireframe mesh -> GL line list. the filled corner pips are dropped: gl lines are 1px anyway.
function toLines(mesh) {
  const pos = [];
  const col = [];
  for (const part of mesh.parts) {
    const r = ((part.color >> 16) & 255) / 255;
    const g = ((part.color >> 8) & 255) / 255;
    const b = (part.color & 255) / 255;
    for (const path of part.paths) {
      for (let i = 1; i < path.length; i++) {
        pos.push(...path[i - 1], ...path[i]);
        col.push(r, g, b, r, g, b);
      }
    }
  }
  return { pos: new Float32Array(pos), col: new Float32Array(col) };
}

const views = new Set();
let tick = null;

function frame() {
  for (const v of views) {
    if (!v.visible) continue;
    const e = v.engine;
    v.ry += v.spin;
    v.node.rotation.y = v.ry;
    v.node.rotation.x = Math.sin((performance.now() / 1000) * v.tiltRate) * v.tilt;
    e.renderer.render({ scene: v.scene, camera: e.camera });
    v.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    v.ctx.clearRect(0, 0, v.size, v.size);
    v.ctx.drawImage(e.canvas, 0, 0, e.buf * DPR, e.buf * DPR, 0, 0, v.size, v.size);
  }
}

export function create(canvas, desc, { size = 64, spin = 0.02, tilt = 0.15, tiltRate = 1 } = {}) {
  const mesh = build(desc);
  const ctx = mesh && canvas.getContext('2d');
  if (!ctx) return { stop() {} };

  canvas.width = canvas.height = Math.round(size * DPR);
  canvas.style.width = canvas.style.height = `${size}px`;

  const e = engine(size);
  const { pos, col } = toLines(mesh);
  const geometry = new Geometry(e.gl, {
    position: { size: 3, data: pos },
    color: { size: 3, data: col },
  });
  const node = new Mesh(e.gl, { geometry, program: e.program, mode: e.gl.LINES });
  const scene = new Transform();
  node.addTo(scene);

  const view = { ctx, size, spin, tilt, tiltRate, node, scene, engine: e, ry: 0, visible: false };
  const io = new IntersectionObserver(([entry]) => { view.visible = entry.isIntersecting; });
  io.observe(canvas);
  views.add(view);
  if (!tick) tick = onTick(frame);

  return {
    stop() {
      io.disconnect();
      views.delete(view);
      geometry.dispose();
      if (!views.size && tick) {
        tick();
        tick = null;
      }
    },
  };
}
