import '../../src/theme.js?v=202611040620.5d300248ae570c4ca37655159ba683bc0b90e0de';
import { cube, pyramid, sphere, octahedron } from '../../src/graphics/wireframe.js?v=202611040620.5d300248ae570c4ca37655159ba683bc0b90e0de';
import { addSlot } from '../../src/graphics/stage.js?v=202611040620.5d300248ae570c4ca37655159ba683bc0b90e0de';
import { stamp } from '../../src/build.js?v=202611040620.5d300248ae570c4ca37655159ba683bc0b90e0de';
import { mobileQuery } from '../../src/components.js?v=202611040620.5d300248ae570c4ca37655159ba683bc0b90e0de';

// 4 meshes shared by 12 canvases: these are plain arrays, nothing per-canvas to build
const shapes = () => {
  // one knob for all 4 meshes: the mobile sizes are the base numbers, desktop scales them up
  const scale = mobileQuery.matches ? 2 : 3;
  return [
    cube(0.45 * scale, 0x5c78e2),
    pyramid(0.35 * scale, 0.5 * scale, 0xa855f7),
    sphere(0.325 * scale, 0x06b6d4),
    octahedron(0.35 * scale, 0x5865F2)
  ];
};

const avatars = [
  { src: stamp('../img/gavin.jpg'), alt: 'Gavin' },
  { src: stamp('../img/greg.jpg'), alt: 'Greg' },
  { src: stamp('../img/josh.jpg'), alt: 'Josh' },
  { src: stamp('../img/nam.jpg'), alt: 'Nam' }
];

const views = [];

function initXavierites() {
  const SHAPES = shapes();
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
