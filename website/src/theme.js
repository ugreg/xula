const savedTheme = localStorage.getItem('theme');
const isLight = savedTheme === 'light';

if (isLight) {
  document.documentElement.classList.add('light');
}

window.addEventListener('message', (e) => {
  if (e.data?.type === 'theme') {
    document.documentElement.classList.toggle('light', e.data.light);
  }
});

export { isLight };
