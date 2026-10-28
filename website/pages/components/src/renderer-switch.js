import { setBackend } from '../../src/common/renderer.js';

const group = document.querySelector('.renderer-switch');

group?.addEventListener('change', (e) => {
  if (e.target instanceof HTMLInputElement) setBackend(e.target.value);
});
