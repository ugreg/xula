import { stamp } from './build.js?v=202610290502.05016aaea2c8d1e454707b7432adf9d05641a25a';

export const MOBILE_QUERY = '(max-width: 768px)';
export const mobileQuery = window.matchMedia(MOBILE_QUERY);

async function includeOne(el) {
  const path = el.getAttribute('data-include');
  try {
    const response = await fetch(stamp(path));
    if (!response.ok) throw new Error(`failed to load ${path}`);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    el.innerHTML = doc.body.innerHTML;

    const scripts = doc.querySelectorAll('script[type="module"]');
    for (const script of scripts) {
      const newScript = document.createElement('script');
      newScript.type = 'module';
      newScript.src = stamp(script.src);
      el.appendChild(newScript);
    }
  } catch (err) {
    console.error(err);
    el.textContent = 'Error loading component.';
  }
}

export async function loadComponents() {
  for (const el of document.querySelectorAll('[data-include]')) {
    if (el.hasAttribute('data-desktop-only') && mobileQuery.matches) continue;
    await includeOne(el);
  }
}

mobileQuery.addEventListener('change', () => {
  if (mobileQuery.matches) return;
  document.querySelectorAll('[data-include][data-desktop-only]:empty').forEach(includeOne);
});
