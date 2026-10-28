import '../../src/theme.js?v=202610270729.133702c3219d19dfa3bc8c0fa12e015cbd506fc7';
import { createWireframe, cube, pyramid, sphere, octahedron } from './common/wireframe.js?v=202610270729.133702c3219d19dfa3bc8c0fa12e015cbd506fc7';

// 4 meshes shared by 12 canvases: these are plain arrays, nothing per-canvas to build
const SHAPES = [
  cube(0.45, 0x5c78e2),
  pyramid(0.35, 0.5, 0xa855f7),
  sphere(0.325, 0x06b6d4),
  octahedron(0.35, 0x5865F2)
];

const avatars = [
  { src: '../img/gavin.jpg?v=202610270729.133702c3219d19dfa3bc8c0fa12e015cbd506fc7', alt: 'Gavin' },
  { src: '../img/greg.jpg?v=202610270729.133702c3219d19dfa3bc8c0fa12e015cbd506fc7', alt: 'Greg' },
  { src: '../img/josh.jpg?v=202610270729.133702c3219d19dfa3bc8c0fa12e015cbd506fc7', alt: 'Josh' },
  { src: '../img/nam.jpg?v=202610270729.133702c3219d19dfa3bc8c0fa12e015cbd506fc7', alt: 'Nam' }
];

const views = [];

function initXavierites() {
  const track = document.getElementById('avatarTrack');
  if (!track) return;
  track.innerHTML = '';
  const fragment = document.createDocumentFragment();

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

    views.push(createWireframe(canvas, SHAPES[i % SHAPES.length], { size: 140, spin: 0.025, tilt: 0.2, tiltRate: 0.8, lineWidth: 1.5 }));
    canvas.style.width = canvas.style.height = '100%';
  }

  track.appendChild(fragment);
}

initXavierites();
window.sceneRegistry = window.sceneRegistry || {};
window.sceneRegistry['xavierites'] = {
  cleanup: () => views.splice(0).forEach((v) => v.stop()),
  restart: initXavierites
};
