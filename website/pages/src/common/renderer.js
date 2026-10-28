// one seam between the pages and whichever engine draws their shapes.
// backends are dynamic imports, so a page only ever downloads the engine it is using.
// shortcut: the choice lives in memory only, a reload goes back to canvas2d.
const BACKENDS = {
  canvas2d: () => import('./wireframe.js?v=202610280541.1932decc9592024f97254ffe723b733e46e7fa1f'),
  ogl: () => import('../ogl/index.js?v=202610280541.1932decc9592024f97254ffe723b733e46e7fa1f'),
  zdog: () => import('../zdog/index.js?v=202610280541.1932decc9592024f97254ffe723b733e46e7fa1f'),
};

export const DEFAULT_BACKEND = 'canvas2d';
let backend = DEFAULT_BACKEND;

export const getBackend = () => backend;

export function setBackend(name) {
  if (!BACKENDS[name] || name === backend) return;
  backend = name;
  window.dispatchEvent(new Event('rendererchange'));
}

export async function createShape(canvas, desc, opts) {
  try {
    const mod = await BACKENDS[backend]();
    return await mod.create(canvas, desc, opts);
  } catch (e) {
    console.error(`[renderer] ${backend} failed, falling back to canvas2d`, e);
    const fallback = await BACKENDS[DEFAULT_BACKEND]();
    return await fallback.create(canvas, desc, opts);
  }
}

// rebuild every live shape after the engine changes. pages own their own teardown.
export function onBackendChange(rebuild) {
  window.addEventListener('rendererchange', rebuild);
}
