import * as THREE from 'three';

const voxelMeshes = [];

function createWireframeVoxel(x, y, z, s, color) {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  const boxGeo = new THREE.BoxGeometry(s, s, s);
  const edges = new THREE.EdgesGeometry(boxGeo);
  const lineMat = new THREE.LineBasicMaterial({ color, linewidth: 1 });
  const wireframe = new THREE.LineSegments(edges, lineMat);
  group.add(wireframe);

  const half = s / 2;
  const vertexPositions = [
    [-half, -half, -half], [half, -half, -half],
    [-half, half, -half], [half, half, -half],
    [-half, -half, half], [half, -half, half],
    [-half, half, half], [half, half, half]
  ];

  const vertexGeo = new THREE.SphereGeometry(s * 0.1, 6, 4);
  const vertexMat = new THREE.MeshBasicMaterial({ color });

  for (const [vx, vy, vz] of vertexPositions) {
    const v = new THREE.Mesh(vertexGeo, vertexMat);
    v.position.set(vx, vy, vz);
    group.add(v);
  }

  return group;
}

function createIconScene(iconType) {
  try {
    const canvas = document.querySelector(`canvas[data-icon="${iconType}"]`);
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(64, 64);
    renderer.setPixelRatio(window.devicePixelRatio);

    const group = new THREE.Group();

    if (iconType === 'crane') {
      group.add(createWireframeVoxel(0, -0.4, 0, 0.7, 0xf5a623));
      group.add(createWireframeVoxel(0, 0.3, 0, 0.5, 0xf5a623));
      group.add(createWireframeVoxel(0, 1.0, 0, 0.5, 0xf5a623));
      group.add(createWireframeVoxel(-0.7, 0.7, 0, 0.9, 0xf5a623));
      group.add(createWireframeVoxel(-1.1, 0.2, 0, 0.2, 0xd35400));
    }

    if (iconType === 'wrench') {
      group.add(createWireframeVoxel(0, 0, 0, 0.8, 0x7f8c8d));
      group.add(createWireframeVoxel(0.4, 0, 0, 0.5, 0x7f8c8d));
      group.add(createWireframeVoxel(0.7, 0.3, 0, 0.5, 0x7f8c8d));
      group.add(createWireframeVoxel(0.7, -0.3, 0, 0.5, 0x7f8c8d));
      group.add(createWireframeVoxel(-0.4, 0, 0, 0.5, 0x95a5a6));
    }

    if (iconType === 'robot') {
      group.add(createWireframeVoxel(0, 0.4, 0, 0.8, 0x3498db));
      group.add(createWireframeVoxel(0, -0.3, 0, 0.9, 0x2980b9));
      group.add(createWireframeVoxel(-0.3, 0.6, 0, 0.3, 0x3498db));
      group.add(createWireframeVoxel(0.3, 0.6, 0, 0.3, 0xe74c3c));
      group.add(createWireframeVoxel(0, 0, 0.5, 0.2, 0x2ecc71));
    }

    if (iconType === 'heart') {
      group.add(createWireframeVoxel(-0.35, 0.2, 0, 0.6, 0xe74c3c));
      group.add(createWireframeVoxel(0.35, 0.2, 0, 0.6, 0xe74c3c));
      group.add(createWireframeVoxel(0, -0.1, 0, 0.9, 0xe74c3c));
      group.add(createWireframeVoxel(0, -0.5, 0, 0.6, 0xe74c3c));
      group.add(createWireframeVoxel(0, -0.8, 0, 0.3, 0xe74c3c));
    }

    if (iconType === 'grad') {
      group.add(createWireframeVoxel(0, 0, 0, 0.8, 0x2c3e50));
      group.add(createWireframeVoxel(0, 0.4, 0, 1.1, 0x2c3e50));
      group.add(createWireframeVoxel(-0.8, 0.6, 0, 0.3, 0xf1c40f));
      group.add(createWireframeVoxel(0, -0.4, 0, 0.5, 0x2c3e50));
      group.add(createWireframeVoxel(0.4, 0.4, 0, 0.3, 0xf1c40f));
    }

    if (iconType === 'briefcase') {
      group.add(createWireframeVoxel(0, -0.1, 0, 1, 0x34495e));
      group.add(createWireframeVoxel(0, 0.4, 0, 0.6, 0x7f8c8d));
      group.add(createWireframeVoxel(0, -0.3, 0.4, 0.2, 0x2c3e50));
      group.add(createWireframeVoxel(0, 0, 0.5, 0.3, 0xf1c40f));
      group.add(createWireframeVoxel(-0.4, 0.2, 0, 0.2, 0x7f8c8d));
    }

    if (iconType === 'money') {
      group.add(createWireframeVoxel(0, 0, 0, 1, 0x27ae60));
      group.add(createWireframeVoxel(0, -0.4, 0, 1, 0x2ecc71));
      group.add(createWireframeVoxel(0.3, 0, 0.5, 0.3, 0xf1c40f));
      group.add(createWireframeVoxel(-0.3, 0, 0.5, 0.3, 0xf1c40f));
      group.add(createWireframeVoxel(0, 0, -0.3, 0.9, 0x2ecc71));
    }

    scene.add(group);
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dlight = new THREE.DirectionalLight(0xffffff, 1.2);
    dlight.position.set(2, 2, 3);
    scene.add(dlight);

    voxelMeshes.push({ mesh: group, scene, camera, renderer, type: 'icon' });
  } catch (e) {
    console.error('[three] createIconScene error for', iconType, ':', e);
  }
}

import { createSceneLoop, stopAnimation } from './scene-loop.js';
import { log } from './observability/log.js';

function animateAll() {
  const t = Date.now() * 0.001;

  for (const item of voxelMeshes) {
    if (item.type === 'icon') {
      item.mesh.rotation.y += 0.02;
      item.mesh.rotation.x = Math.sin(t) * 0.15;
    }
    item.renderer.render(item.scene, item.camera);
  }
}

function cleanupMeshes() {
  voxelMeshes.forEach(item => {
    item.mesh.traverse(child => {
      if (child.geometry) {
        child.geometry.dispose();
        log.info('skills.html', 'disposed geometry:', child.geometry.type);
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => { m.dispose(); log.info('skills.html', 'disposed material:', m.type); });
        } else {
          child.material.dispose();
          log.info('skills.html', 'disposed material:', child.material.type);
        }
      }
    });
    item.renderer.dispose();
    log.info('skills.html', 'disposed renderer');
  });
  voxelMeshes.length = 0;
  log.info('skills.html', 'cleanup complete:', voxelMeshes.length, 'meshes remaining');
}

function initSkills() {
  createIconScene('crane');
  createIconScene('wrench');
  createIconScene('robot');
  createIconScene('heart');
  createIconScene('grad');
  createIconScene('briefcase');
  createIconScene('money');
  createSceneLoop(animateAll);
}

initSkills();
window.sceneRegistry = window.sceneRegistry || {};
window.sceneRegistry['skills'] = {
  cleanup: () => { cleanupMeshes(); stopAnimation(); },
  restart: () => { initSkills(); }
};

document.addEventListener('dblclick', (e) => {
  const clickedCard = e.target.closest('.extension-card');
  if (!clickedCard) return;
  const cardTitleElement = clickedCard.querySelector('h4');
  const cardTitle = cardTitleElement?.textContent?.trim();
  if (cardTitle) {
    navigator.clipboard?.writeText?.(cardTitle);
  }
});

// auto-scroll extensions grid on mobile
(function initAutoScroll() {
  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

  let scrolling = false;
  let speed = 0.5; // px per frame (~30px/sec)
  let resumeTimeout;
  let grid = null;
  let observer = null;

  function scroll() {
    if (!scrolling || !grid) return;
    if (grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 5) {
      grid.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      grid.scrollLeft += speed;
    }
    requestAnimationFrame(scroll);
  }

  function pause() {
    scrolling = false;
    clearTimeout(resumeTimeout);
  }

  function resume() {
    clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => { scrolling = true; }, 3000);
  }

  function startScrolling() {
    if (!isMobile()) return;
    grid = document.querySelector('.extensions-grid');
    if (!grid) return;

    // remove old listeners if any
    grid.removeEventListener('touchstart', pause);
    grid.removeEventListener('touchmove', pause);
    grid.removeEventListener('touchend', resume);
    grid.removeEventListener('mouseenter', pause);
    grid.removeEventListener('mouseleave', resume);

    grid.addEventListener('touchstart', pause, { passive: true });
    grid.addEventListener('touchmove', pause, { passive: true });
    grid.addEventListener('touchend', resume, { passive: true });
    grid.addEventListener('mouseenter', pause);
    grid.addEventListener('mouseleave', resume);

    scrolling = true;
    requestAnimationFrame(scroll);
  }

  // wait for grid to exist (it's loaded dynamically)
  function waitForGrid() {
    grid = document.querySelector('.extensions-grid');
    if (grid) {
      startScrolling();
      return;
    }
    // observe DOM for grid appearance
    observer = new MutationObserver((mutations, obs) => {
      grid = document.querySelector('.extensions-grid');
      if (grid) {
        obs.disconnect();
        observer = null;
        startScrolling();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForGrid);
  } else {
    waitForGrid();
  }
})();


