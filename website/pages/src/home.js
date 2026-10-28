import '../../src/theme.js?v=202610270729.133702c3219d19dfa3bc8c0fa12e015cbd506fc7';
import * as THREE from 'three';

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

    return { mesh: arrowMesh, scene, camera, renderer, geometry, material };
  } catch (e) {
    console.error('[three] initArrow error:', e);
  }
  return null;
}

import { onTick } from '../../src/scene-loop.js?v=202610270729.133702c3219d19dfa3bc8c0fa12e015cbd506fc7';
import { log } from '../../src/observability/log.js?v=202610270729.133702c3219d19dfa3bc8c0fa12e015cbd506fc7';

// the only WebGL context on the site: MeshStandardMaterial reads light, so this one earns the GPU
let arrow = null;
let stopTick = null;

function cleanupMeshes() {
  if (!arrow) return;
  stopTick?.();
  stopTick = null;
  arrow.geometry.dispose();
  arrow.material.dispose();
  arrow.renderer.dispose();
  arrow = null;
  log.info('home.html', 'arrow disposed');
}

function initHome() {
  arrow = initArrow();
  const spinner = document.getElementById('arrowSpinner');
  const canvas = document.getElementById('arrowCanvas');
  if (spinner) spinner.style.display = 'none';
  if (canvas) canvas.style.display = 'block';
  if (!arrow) return;
  stopTick = onTick(() => {
    arrow.mesh.rotation.y += 0.02;
    arrow.renderer.render(arrow.scene, arrow.camera);
  });
}

initHome();
window.sceneRegistry = window.sceneRegistry || {};
window.sceneRegistry['home'] = {
  cleanup: cleanupMeshes,
  restart: initHome
};
