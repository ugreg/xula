import '../../src/theme.js';
import { createShape, onBackendChange } from './common/renderer.js';

// 4 shapes shared by 12 canvases: plain descriptors, nothing per-canvas to build
const SHAPES = [
  { kind: 'cube', r: 0.45, color: 0x5c78e2 },
  { kind: 'pyramid', r: 0.35, h: 0.5, color: 0xa855f7 },
  { kind: 'sphere', r: 0.325, color: 0x06b6d4 },
  { kind: 'octahedron', r: 0.35, color: 0x5865F2 }
];

const avatars = [
  { src: '../img/gavin.jpg', alt: 'Gavin' },
  { src: '../img/greg.jpg', alt: 'Greg' },
  { src: '../img/josh.jpg', alt: 'Josh' },
  { src: '../img/nam.jpg', alt: 'Nam' }
];

const SHAPE_OPTS = { size: 140, spin: 0.025, tilt: 0.2, tiltRate: 0.8, lineWidth: 1.5 };

const views = new Set();
let gen = 0;

async function initXavierites() {
  const myGen = ++gen;
  for (const view of views) view.stop();
  views.clear();

  const track = document.getElementById('avatarTrack');
  if (!track) return;
  track.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const pending = [];

  for (let i = 0; i < avatars.length * 3; i++) {
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = avatars[i % avatars.length].src;
    img.alt = avatars[i % avatars.length].alt;
    fragment.appendChild(img);

    const wrapper = document.createElement('div');
    wrapper.className = 'avatar-shape';
    wrapper.style.flexShrink = '0';
    const canvas = document.createElement('canvas');
    canvas.setAttribute('data-avatar-shape', 'true');
    wrapper.appendChild(canvas);
    fragment.appendChild(wrapper);

    pending.push(
      createShape(canvas, SHAPES[i % SHAPES.length], SHAPE_OPTS).then((view) => {
        if (myGen !== gen) {
          view.stop(); // a newer engine switch already won
          return;
        }
        views.add(view);
      })
    );
    canvas.style.width = canvas.style.height = '100%';
  }

  track.appendChild(fragment);
  await Promise.all(pending);
}

initXavierites();
onBackendChange(initXavierites);
window.sceneRegistry = window.sceneRegistry || {};
window.sceneRegistry['xavierites'] = {
  cleanup: () => views.forEach((v) => v.stop()),
  restart: initXavierites
};
