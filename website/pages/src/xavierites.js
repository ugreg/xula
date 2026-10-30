import '../../src/theme.js?v=202610292128.dbbc4a839ad394f71ba3e1c8418d0dc3094e06c5';
import { cube, pyramid, sphere, octahedron } from './common/wireframe.js?v=202610292128.dbbc4a839ad394f71ba3e1c8418d0dc3094e06c5';
import { addSlot } from './common/stage.js?v=202610292128.dbbc4a839ad394f71ba3e1c8418d0dc3094e06c5';
import { stamp } from '../../src/build.js?v=202610292128.dbbc4a839ad394f71ba3e1c8418d0dc3094e06c5';

// 4 meshes shared by 12 canvases: these are plain arrays, nothing per-canvas to build
const SHAPES = [
  cube(0.45, 0x5c78e2),
  pyramid(0.35, 0.5, 0xa855f7),
  sphere(0.325, 0x06b6d4),
  octahedron(0.35, 0x5865F2)
];

const avatars = [
  { src: stamp('../img/gavin.jpg'), alt: 'Gavin' },
  { src: stamp('../img/greg.jpg'), alt: 'Greg' },
  { src: stamp('../img/josh.jpg'), alt: 'Josh' },
  { src: stamp('../img/nam.jpg'), alt: 'Nam' }
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

    views.push(addSlot(canvas, SHAPES[i % SHAPES.length], { size: 140, spin: 0.025, tilt: 0.2, tiltRate: 0.8, lineWidth: 1.5 }));
    canvas.style.width = canvas.style.height = '100%';
  }

  track.appendChild(fragment);
}

initXavierites();
window.sceneRegistry = window.sceneRegistry || {};
window.sceneRegistry['xavierites'] = {
  cleanup: () => views.splice(0).forEach((off) => off()),
  restart: initXavierites
};
