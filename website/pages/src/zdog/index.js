// zdog backend. flat pseudo-3d on canvas2d, no GL context. zdog draws solid faces, so this
// is the "what does it look like" option, not the "same picture, other engine" option.
import { onTick } from '../../../src/scene-loop.js';

const DPR = globalThis.devicePixelRatio || 1;
const URL = 'https://cdn.jsdelivr.net/npm/zdog@1.1.3/dist/zdog.dist.min.js';

// zdog's dist is UMD and writes to `this`, which is undefined inside a module, so it has to
// come in as a classic script and be read back off window.
let loading;
function loadZdog() {
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = URL;
    script.onload = () => (window.Zdog ? resolve(window.Zdog) : reject(new Error('zdog global missing')));
    script.onerror = () => reject(new Error(`zdog failed to load from ${URL}`));
    document.head.appendChild(script);
  });
  return loading;
}

const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;

function build(Zdog, illo, desc, px) {
  const color = hex(desc.color);
  const add = (ctor, options) => new ctor({ addTo: illo, stroke: 0, color, ...options });

  if (desc.kind === 'cube') {
    add(Zdog.Box, { width: desc.r, height: desc.r, depth: desc.r });
    return;
  }
  if (desc.kind === 'pyramid') {
    // zdog has no 4 sided pyramid; Cone is its pointed solid, so this one is a cone.
    add(Zdog.Cone, { diameter: desc.r * 2, length: desc.h, rotate: { x: Math.PI / 2 } });
    return;
  }
  if (desc.kind === 'sphere') {
    const ring = { diameter: desc.r * 2, quarters: 4, closed: true, stroke: px * 1.5 };
    add(Zdog.Ellipse, ring);
    add(Zdog.Ellipse, { ...ring, rotate: { y: Math.PI / 2 } });
    add(Zdog.Ellipse, { ...ring, rotate: { x: Math.PI / 2 } });
    return;
  }

  const verts = desc.kind === 'octahedron'
    ? [[desc.r, 0, 0], [-desc.r, 0, 0], [0, desc.r, 0], [0, -desc.r, 0], [0, 0, desc.r], [0, 0, -desc.r]]
    : null;
  if (!verts) return;

  const edges = [[0, 4], [0, 5], [1, 4], [1, 5], [2, 4], [2, 5], [3, 4], [3, 5], [0, 2], [2, 1], [1, 3], [3, 0]];
  for (const [a, b] of edges) {
    add(Zdog.Shape, { path: [verts[a], verts[b]], closed: false, stroke: px * 1.5 });
  }
}

// voxels: [x, y, z, size, color][]
function buildIcon(Zdog, illo, voxels) {
  for (const [x, y, z, s, c] of voxels) {
    new Zdog.Box({
      addTo: illo,
      width: s, height: s, depth: s,
      translate: { x, y, z },
      stroke: 0,
      color: hex(c),
    });
  }
}

export async function create(canvas, desc, { size = 64, spin = 0.02, tilt = 0.15, tiltRate = 1 } = {}) {
  const Zdog = await loadZdog();

  canvas.width = canvas.height = Math.round(size * DPR);
  canvas.style.width = canvas.style.height = `${size}px`;

  // same framing as the other two backends: 1 world unit is 0.357 * size css px
  const zoom = size * 0.357 * DPR;
  const illo = new Zdog.Illustration({ element: canvas, zoom });

  if (desc.kind === 'icon') buildIcon(Zdog, illo, desc.voxels);
  else build(Zdog, illo, desc, 1 / zoom);

  let visible = false;
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  io.observe(canvas);

  const stop = onTick(() => {
    if (!visible) return;
    illo.rotate.y += spin;
    illo.rotate.x = Math.sin((performance.now() / 1000) * tiltRate) * tilt;
    illo.updateRenderGraph();
  });

  return { stop: () => { stop(); io.disconnect(); } };
}
