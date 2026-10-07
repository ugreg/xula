async function loadIncludes() {
  const elements = document.querySelectorAll('[data-include]');
  
  for (const el of elements) {
    const path = el.getAttribute('data-include');
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`failed to load ${path}`);
      el.innerHTML = await response.text();
    } catch (err) {
      console.error(err);
      el.textContent = 'Error loading component.';
    }
  }
}

loadIncludes();
