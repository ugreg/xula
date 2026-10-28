// flat wireframe meshes on canvas2d. unlit line art does not need a GL context.
import { onTick } from '../../../src/scene-loop.js?v=202610270729.133702c3219d19dfa3bc8c0fa12e015cbd506fc7';

const FOV = (50 * Math.PI) / 180;
const CAM_Z = 3;
const DPR = globalThis.devicePixelRatio || 1;

const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;
const SQ = [[-1, -1], [-1, 1], [1, 1], [1, -1]];

export const voxel = (x, y, z, s, color) => {
  const h = s / 2;
  const v = (a, b, c) => [x + a * h, y + b * h, z + c * h];
  const paths = [-1, 1].map((dz) => [...SQ.map(([a, b]) => v(a, b, dz)), v(-1, -1, dz)]);
  for (const [a, b] of SQ) paths.push([v(a, b, -1), v(a, b, 1)]);
  return { paths, dots: [-1, 1].flatMap((dz) => SQ.map(([a, b]) => v(a, b, dz))), dotR: s * 0.1, color };
};

// voxels: [x, y, z, size, color][]
export const icon = (voxels) => ({ parts: voxels.map(([x, y, z, s, c]) => voxel(x, y, z, s, c)) });

export const cube = (s, color) => ({ parts: [{ ...voxel(0, 0, 0, s, color), dots: [], dotR: 0 }] });

export const pyramid = (r, h, color) => {
  const apex = [0, h / 2, 0];
  const base = [0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2;
    return [r * Math.sin(a), -h / 2, r * Math.cos(a)];
  });
  return { parts: [{ color, paths: [...base.map((b) => [apex, b]), [...base, base[0]]] }] };
};

export const sphere = (r, color) => {
  const pt = (t, p) => [r * Math.sin(t) * Math.cos(p), r * Math.cos(t), r * Math.sin(t) * Math.sin(p)];
  const paths = [];
  for (let i = 0; i < 4; i++) paths.push(Array.from({ length: 17 }, (_, k) => pt((k / 16) * Math.PI, (i * Math.PI) / 4)));
  for (let i = 1; i < 4; i++) paths.push(Array.from({ length: 25 }, (_, k) => pt((i * Math.PI) / 4, (k / 24) * Math.PI * 2)));
  return { parts: [{ color, paths }] };
};

export const octahedron = (r, color) => {
  const v = [[r, 0, 0], [-r, 0, 0], [0, r, 0], [0, -r, 0], [0, 0, r], [0, 0, -r]];
  const paths = [[0, 4], [0, 5], [1, 4], [1, 5], [2, 4], [2, 5], [3, 4], [3, 5]].map(([a, b]) => [v[a], v[b]]);
  paths.push([v[0], v[2], v[1], v[3], v[0]]);
  return { parts: [{ color, paths }] };
};

export function createWireframe(canvas, mesh, { size = 64, spin = 0.02, tilt = 0.15, tiltRate = 1, lineWidth = 1 } = {}) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { stop() {} };

  canvas.width = canvas.height = Math.round(size * DPR);
  canvas.style.width = canvas.style.height = `${size}px`;
  const f = size / 2 / Math.tan(FOV / 2);
  const mid = size / 2;
  let ry = 0;
  let visible = false;

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(canvas);

  const stop = onTick(() => {
    if (!visible) return;
    ry += spin;
    const rx = Math.sin((performance.now() / 1000) * tiltRate) * tilt;
    const cosY = Math.cos(ry), sinY = Math.sin(ry), cosX = Math.cos(rx), sinX = Math.sin(rx);
    const project = ([x, y, z]) => {
      const px = x * cosY + z * sinY;
      const pz = z * cosY - x * sinY;
      const py = y * cosX - pz * sinX;
      const k = f / (CAM_Z - (y * sinX + pz * cosX));
      return [mid + px * k, mid - py * k, k];
    };

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.lineWidth = lineWidth;
    for (const part of mesh.parts) {
      ctx.strokeStyle = ctx.fillStyle = hex(part.color);
      ctx.beginPath();
      for (const path of part.paths) {
        path.forEach((p, i) => {
          const [x, y] = project(p);
          ctx[i ? 'lineTo' : 'moveTo'](x, y);
        });
      }
      ctx.stroke();
      if (part.dotR) {
        ctx.beginPath();
        for (const d of part.dots) {
          const [x, y, k] = project(d);
          ctx.moveTo(x + k * part.dotR, y);
          ctx.arc(x, y, k * part.dotR, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }
  });

  return { stop: () => { stop(); io.disconnect(); } };
}
