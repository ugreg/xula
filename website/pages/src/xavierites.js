import '../../src/theme.js?v=202610290653.21940158c08b20ee85aaa20fce0edc7c581b141d';
import { cube, pyramid, sphere, octahedron } from './common/wireframe.js?v=202610290653.21940158c08b20ee85aaa20fce0edc7c581b141d';
import { addSlot } from './common/stage.js?v=202610290653.21940158c08b20ee85aaa20fce0edc7c581b141d';

// 4 meshes shared by 12 canvases: these are plain arrays, nothing per-canvas to build
const SHAPES = [
  cube(0.45, 0x5c78e2),
  pyramid(0.35, 0.5, 0xa855f7),
  sphere(0.325, 0x06b6d4),
  octahedron(0.35, 0x5865F2)
];

const avatars = [
  { src: '../img/gavin.jpg?v=202610290653.21940158c08b20ee85aaa20fce0edc7c581b141d', alt: 'Gavin' },
  { src: '../img/greg.jpg?v=202610290653.21940158c08b20ee85aaa20fce0edc7c581b141d', alt: 'Greg' },
  { src: '../img/josh.jpg?v=202610290653.21940158c08b20ee85aaa20fce0edc7c581b141d', alt: 'Josh' },
  { src: '../img/nam.jpg?v=202610290653.21940158c08b20ee85aaa20fce0edc7c581b141d', alt: 'Nam' }
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
