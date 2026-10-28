import { setBackend } from '../../src/common/renderer.js?v=202610280541.1932decc9592024f97254ffe723b733e46e7fa1f';

const group = document.querySelector('.renderer-switch');

group?.addEventListener('change', (e) => {
  if (e.target instanceof HTMLInputElement) setBackend(e.target.value);
});
