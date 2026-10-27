const API = 'https://github-stats-extended.vercel.app/api';
const THEME_NAME = { dark: 'dark', light: 'graywhite' };

function applyStatsTheme() {
  const dark = document.documentElement.classList.contains('dark');
  const theme = dark ? THEME_NAME.dark : THEME_NAME.light;
  document.querySelectorAll('img[data-stats-user]').forEach((img) => {
    const url = `${API}?username=${encodeURIComponent(img.dataset.statsUser)}&hide_border=true&theme=${theme}`;
    if (img.src !== url) img.src = url;
  });
}

applyStatsTheme();

new MutationObserver(applyStatsTheme).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class'],
});
