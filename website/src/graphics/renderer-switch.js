import { getMode, onModeChange, setMode } from './stage.js?v=202611040620.5d300248ae570c4ca37655159ba683bc0b90e0de';

const group = document.querySelector('.renderer-switch');

group?.addEventListener('change', (e) => {
  if (e.target instanceof HTMLInputElement) setMode(e.target.value);
});

const gpu = group?.querySelector('#renderer-webgpu');
if (gpu && !navigator.gpu) {
  gpu.disabled = true;
  group.querySelector('label[for="renderer-webgpu"]').title = 'WebGPU is not available in this browser';
}

// the stage falls back to canvas2d when an engine fails to start, so keep the buttons honest
onModeChange(() => {
  for (const input of group?.querySelectorAll('input') ?? []) input.checked = input.value === getMode();
});
