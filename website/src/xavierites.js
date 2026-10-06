import './theme.js';
import * as THREE from 'three';

const voxelMeshes = [];

const avatarShapeIndex = { current: 0 };

function createAvatarShape() {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('data-avatar-shape', 'true');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 3;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(256, 256);
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

let animationFrameId = null;
let isAnimating = true;

function animateAll() {
  if (!isAnimating) return;
  animationFrameId = requestAnimationFrame(animateAll);
  const t = Date.now() * 0.001;

  for (const item of voxelMeshes) {
    if (item.type === 'avatar-shape') {
      item.mesh.rotation.y += 0.025;
      item.mesh.rotation.x = Math.sin(t * 0.8) * 0.2;
    }
    item.renderer.render(item.scene, item.camera);
  }
}

function stopAnimation() {
  isAnimating = false;
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function cleanupMeshes() {
  voxelMeshes.forEach(item => {
    item.mesh.geometry.dispose();
    item.mesh.material.dispose();
    item.renderer.dispose();
  });
  voxelMeshes.length = 0;
}

const track = document.querySelector('.avatar-track');
if (track) {
  const items = Array.from(track.children);
  for (let i = items.length - 1; i > 0; i--) {
    const shapeCanvas = createAvatarShape();
    const wrapper = document.createElement('div');
    wrapper.className = 'avatar-shape';
    wrapper.style.flexShrink = '0';
    wrapper.appendChild(shapeCanvas);
    items[i].before(wrapper);
  }
  animateAll();

  const header = document.querySelector('.section-header');
  if (header) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!isAnimating) {
            isAnimating = true;
            animateAll();
          }
        } else {
          stopAnimation();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(header);
  }
}


