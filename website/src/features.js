document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.avatar-track');
  if (track) {
    const items = Array.from(track.children);
    for (let i = items.length - 1; i > 0; i--) {
      const separator = document.createElement('div');
      separator.className = 'avatar-shape';
      separator.style.width = '64px';
      separator.style.height = '64px';
      separator.style.flexShrink = '0';
      items[i].before(separator);
    }
  }
});

document.addEventListener('dblclick', (e) => {
  const clickedCard = e.target.closest('.feature-card');
  if (!clickedCard) return;
  const cardTitleElement = clickedCard.querySelector('h3');
  const cardTitle = cardTitleElement?.textContent?.trim();
  if (cardTitle) {
    navigator.clipboard?.writeText?.(cardTitle);
  }
});

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
