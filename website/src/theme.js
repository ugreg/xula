const savedTheme = localStorage.getItem('theme');
const isLight = savedTheme === 'light';

if (isLight) {
  document.documentElement.classList.add('light');
}

export { isLight };
