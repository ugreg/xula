import '../../src/theme.js?v=202610270702.d9e88ae6991e7eb98fc04e671e1116770de2f4a9';
import * as THREE from 'three';

const voxelMeshes = [];

const avatarShapeIndex = { current: 0 };

function createAvatarShape() {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('data-avatar-shape', 'true');
  canvas.width = 180;
  canvas.height = 180;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 3;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(180, 180, false);
  renderer.setPixelRatio(window.devicePixelRatio);

  const types = ['cube', 'pyramid', 'sphere', 'octahedron'];
  const type = types[avatarShapeIndex.current % types.length];
  avatarShapeIndex.current++;

  const colors = [0x5c78e2, 0xa855f7, 0x06b6d4, 0x5865F2];
  const color = colors[(avatarShapeIndex.current - 1) % colors.length];

  let geometry;

  if (type === 'cube') {
    geometry = new THREE.BoxGeometry(0.45, 0.45, 0.45);
  } else if (type === 'pyramid') {
    geometry = new THREE.ConeGeometry(0.35, 0.5, 4);
  } else if (type === 'sphere') {
    geometry = new THREE.SphereGeometry(0.325, 16, 12);
  } else {
    geometry = new THREE.OctahedronGeometry(0.35);
  }

  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({ color, linewidth: 1.5 });
  const mesh = new THREE.LineSegments(edges, lineMaterial);
  scene.add(mesh);
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(2, 2, 3);
  scene.add(light);

  voxelMeshes.push({ mesh, scene, camera, renderer, type: 'avatar-shape' });
  return canvas;
}

import { createSceneLoop, stopAnimation } from '../../src/scene-loop.js?v=202610270702.d9e88ae6991e7eb98fc04e671e1116770de2f4a9';
import { log } from '../../src/observability/log.js?v=202610270702.d9e88ae6991e7eb98fc04e671e1116770de2f4a9';

function animateAll() {
  const t = Date.now() * 0.001;

  for (const item of voxelMeshes) {
    if (item.type === 'avatar-shape') {
      item.mesh.rotation.y += 0.025;
      item.mesh.rotation.x = Math.sin(t * 0.8) * 0.2;
    }
    item.renderer.render(item.scene, item.camera);
  }
}

function cleanupMeshes() {
  voxelMeshes.forEach(item => {
    item.mesh.geometry.dispose();
    log.info('xavierites.html', 'disposed geometry:', item.mesh.geometry.type);
    item.mesh.material.dispose();
    log.info('xavierites.html', 'disposed material:', item.mesh.material.type);
    item.renderer.dispose();
    log.info('xavierites.html', 'disposed renderer');
  });
  voxelMeshes.length = 0;
  log.info('xavierites.html', 'cleanup complete:', voxelMeshes.length, 'meshes remaining');
}

const avatars = [
  { src: '../img/gavin.jpg?v=202610270702.d9e88ae6991e7eb98fc04e671e1116770de2f4a9', alt: 'Gavin' },
  { src: '../img/greg.jpg?v=202610270702.d9e88ae6991e7eb98fc04e671e1116770de2f4a9', alt: 'Greg' },
  { src: '../img/josh.jpg?v=202610270702.d9e88ae6991e7eb98fc04e671e1116770de2f4a9', alt: 'Josh' },
  { src: '../img/nam.jpg?v=202610270702.d9e88ae6991e7eb98fc04e671e1116770de2f4a9', alt: 'Nam' }
];

function initXavierites() {
  const track = document.getElementById('avatarTrack');
  if (!track) return;
  track.innerHTML = '';
  const fragment = document.createDocumentFragment();
  for (let repeat = 0; repeat < 3; repeat++) {
    for (const avatar of avatars) {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = avatar.src;
      img.alt = avatar.alt;
      fragment.appendChild(img);
      const shapeCanvas = createAvatarShape();
      const wrapper = document.createElement('div');
      wrapper.className = 'avatar-shape';
      wrapper.style.flexShrink = '0';
      wrapper.appendChild(shapeCanvas);
      fragment.appendChild(wrapper);
    }
  }
  track.appendChild(fragment);
  createSceneLoop(animateAll);
}

initXavierites();
window.sceneRegistry = window.sceneRegistry || {};
window.sceneRegistry['xavierites'] = {
  cleanup: () => { cleanupMeshes(); stopAnimation(); },
  restart: () => { initXavierites(); }
};


