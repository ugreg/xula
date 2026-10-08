import './theme.js';
import * as THREE from 'three';

const voxelMeshes = [];

function initArrow() {
  try {
    const canvas = document.getElementById('arrowCanvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(64, 64);
    renderer.setPixelRatio(window.devicePixelRatio);

    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 1);
    arrowShape.lineTo(-0.5, 0.1);
    arrowShape.lineTo(-0.15, 0.1);
    arrowShape.lineTo(-0.15, -1);
    arrowShape.lineTo(0.15, -1);
    arrowShape.lineTo(0.15, 0.1);
    arrowShape.lineTo(0.5, 0.1);
    arrowShape.lineTo(0, 1);

    const geometry = new THREE.ExtrudeGeometry(arrowShape, {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 1
    });
    geometry.center();

    const material = new THREE.MeshStandardMaterial({
      color: 0x5865F2,
      roughness: 0.3,
      metalness: 0.4,
      flatShading: true
    });

    const arrowMesh = new THREE.Mesh(geometry, material);
    scene.add(arrowMesh);

    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const d1 = new THREE.DirectionalLight(0xffffff, 2);
    d1.position.set(2, 2, 4);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0x4752C4, 1.5);
    d2.position.set(-2, 1, -2);
    scene.add(d2);

    voxelMeshes.push({ mesh: arrowMesh, scene, camera, renderer, type: 'arrow' });
  } catch (e) {
    console.error('[three] initArrow error:', e);
  }
}

let animationFrameId = null;
let isAnimating = true;

function animateAll() {
  if (!isAnimating) return;
  animationFrameId = requestAnimationFrame(animateAll);
  const t = Date.now() * 0.001;

  for (const item of voxelMeshes) {
    if (item.type === 'arrow') {
      item.mesh.rotation.y += 0.02;
    }
    if (item.type === 'icon') {
      item.mesh.rotation.y += 0.02;
      item.mesh.rotation.x = Math.sin(t) * 0.15;
    }
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
    if (Array.isArray(item.mesh.material)) {
      item.mesh.material.forEach(m => m.dispose());
    } else {
      item.mesh.material.dispose();
    }
    item.renderer.dispose();
  });
  voxelMeshes.length = 0;
}

setTimeout(() => {
  initArrow();
  animateAll();

  const spinner = document.getElementById('arrowSpinner');
  const canvas = document.getElementById('arrowCanvas');
  if (spinner) spinner.style.display = 'none';
  if (canvas) canvas.style.display = 'block';
  if (canvas) {
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
    observer.observe(canvas);
  }
}, 500);
