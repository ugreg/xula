const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
const isLight = savedTheme === 'light' || (!savedTheme && !prefersDark);

if (isLight) {
  document.documentElement.classList.add('light');
}

window.addEventListener('message', (e) => {
  if (e.data?.type === 'theme') {
    document.documentElement.classList.toggle('light', e.data.light);
  }
});

function reportHeight() {
  const height = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  );
  parent.postMessage({ type: 'iframe-height', height }, '*');
}

window.addEventListener('load', () => {
  setTimeout(reportHeight, 100);
  setTimeout(reportHeight, 500);
});
window.addEventListener('resize', reportHeight);
setInterval(reportHeight, 1000);