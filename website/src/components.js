import { stamp } from './build.js?v=202610300527.a119f052c7cb2447afb8b438ac960b444e8365c5';

export const MOBILE_QUERY = '(max-width: 768px)';
export const mobileQuery = window.matchMedia(MOBILE_QUERY);

// components are fetched after the build, so their asset urls take the live build version, not the one baked at build time
const ASSET_RE = /(?:\.\.\/|\.\/|\/)?(?:img|font)\/[A-Za-z0-9._/-]*\.(?:png|jpg|svg|woff2|ico)(?!\?)/g;

async function includeOne(el) {
  const path = el.getAttribute('data-include');
  try {
    const response = await fetch(stamp(path));
    if (!response.ok) throw new Error(`failed to load ${path}`);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    el.innerHTML = doc.body.innerHTML.replace(ASSET_RE, stamp);

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
