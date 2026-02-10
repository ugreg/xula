<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

defineProps({
  celebrityName: String
})

const canvasContainer = ref(null)
let scene, camera, renderer, pokeballGroup, animationId = null

function buildPokeball() {
  const group = new THREE.Group()
  const radius = 1
  const segments = 32

  // Top half (red)
  const topGeom = new THREE.SphereGeometry(radius, segments, segments, 0, Math.PI * 2, 0, Math.PI / 2)
  const topMat = new THREE.MeshStandardMaterial({ color: 0xff1a1a, roughness: 0.4, metalness: 0.1 })
  const top = new THREE.Mesh(topGeom, topMat)
  group.add(top)

  // Bottom half (white)
  const bottomGeom = new THREE.SphereGeometry(radius, segments, segments, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)
  const bottomMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.05 })
  const bottom = new THREE.Mesh(bottomGeom, bottomMat)
  group.add(bottom)

  // Center band (black)
  const bandGeom = new THREE.CylinderGeometry(radius * 1.002, radius * 1.002, 0.12, segments)
  const bandMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.6, metalness: 0.2 })
  const band = new THREE.Mesh(bandGeom, bandMat)
  band.rotation.x = Math.PI / 2
  group.add(band)

  // Center button (white)
  const buttonGeom = new THREE.SphereGeometry(0.18, 24, 24)
  const buttonMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 })
  const button = new THREE.Mesh(buttonGeom, buttonMat)
  button.position.z = radius * 0.95
  group.add(button)

  return group
}

function initScene() {
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
  camera.position.z = 3.2

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  canvasContainer.value.appendChild(renderer.domElement)

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9)
  dirLight.position.set(2, 3, 4)
  scene.add(dirLight)
  const fillLight = new THREE.DirectionalLight(0xffaa88, 0.3)
  fillLight.position.set(-2, -1, 2)
  scene.add(fillLight)

  pokeballGroup = buildPokeball()
  scene.add(pokeballGroup)

  const ROTATION_DURATION_MS = 15000 // one full rotation every 15 seconds
  const startTime = Date.now()

  function animate() {
    animationId = requestAnimationFrame(animate)
    const elapsed = Date.now() - startTime
    pokeballGroup.rotation.y = (elapsed / ROTATION_DURATION_MS) * Math.PI * 2
    pokeballGroup.rotation.x = Math.sin(elapsed * 0.0005) * 0.15
    renderer.render(scene, camera)
  }
  animate()
}

function disposeScene() {
  if (animationId != null) cancelAnimationFrame(animationId)
  if (!renderer || !canvasContainer.value) return
  renderer.dispose()
  if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
  scene.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
      else obj.material.dispose()
    }
  })
}

onMounted(() => {
  if (canvasContainer.value) initScene()
})

onUnmounted(() => {
  disposeScene()
})
</script>

<template>
  <div class="loading-container">
    <div class="pokeball-wrapper" ref="canvasContainer" />
    <p class="loading-text">Catching celebrity data...</p>
    <p class="loading-subtext">Searching for {{ celebrityName }}</p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.pokeball-wrapper {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pokeball-wrapper canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
}

.loading-text {
  margin-top: 2rem;
  font-size: 1.8rem;
  font-weight: bold;
  color: #FFCB05;
  animation: fadeInOut 1.5s ease-in-out infinite;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.loading-subtext {
  margin-top: 0.5rem;
  font-size: 1.1rem;
  color: #888;
}
</style>
