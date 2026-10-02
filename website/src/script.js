const scrollTopButton = document.querySelector('.scroll-top-btn');
const themeToggle = document.getElementById('themeToggle');
const homeTerminal = document.getElementById('homeTerminal');
const carousel = document.getElementById('carousel');
const statsArrowBtn = document.querySelector('.stats-arrow-btn:not(.back)');
const backArrowBtn = document.querySelector('.stats-arrow-btn.back');
const dots = document.querySelectorAll('.page-indicator .dot');
const iframes = document.querySelectorAll('.carousel-page iframe');

const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

/* ===== THEME ===== */

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
const isLight = savedTheme === 'light' || (!savedTheme && !prefersDark);

if (isLight) {
  document.documentElement.classList.add('light');
  themeToggle.checked = true;
}

function syncThemeToFrames() {
  const light = document.documentElement.classList.contains('light');
  iframes.forEach(iframe => {
    iframe.contentWindow?.postMessage({ type: 'theme', light }, '*');
  });
}

themeToggle.addEventListener('change', () => {
  const light = themeToggle.checked;
  document.documentElement.classList.toggle('light', light);
  localStorage.setItem('theme', light ? 'light' : 'dark');
  syncThemeToFrames();
});

window.addEventListener('load', () => {
  document.body.classList.remove('loading');
  setTimeout(syncThemeToFrames, 100);
  homeTerminal?.classList.add('visible');

  if (isMobile() && carousel) {
    carousel.style.overflowX = 'auto';
  }
});

/* ===== SCROLL ===== */

window.addEventListener('scroll', () => {
  const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
  const showScrollTop = window.scrollY > totalScroll * 0.5;
  scrollTopButton?.classList.toggle('visible', showScrollTop);

  if (homeTerminal) {
    homeTerminal.classList.toggle('visible', window.scrollY <= 50);
  }
});

scrollTopButton?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== CAROUSEL (mobile only) ===== */

let currentPage = 0;
const totalPages = 5;

function goToPage(page) {
  if (!isMobile()) return;
  if (page < 0 || page >= totalPages) return;
  if (!carousel) return;
  currentPage = page;
  dots.forEach((dot, i) => dot.classList.toggle('active', i === page));

  carousel.scrollTo({ left: page * window.innerWidth, behavior: 'smooth' });

  statsArrowBtn.classList.toggle('hidden', page === totalPages - 1);
  backArrowBtn.classList.toggle('hidden', page === 0);
}



dots.forEach(dot => {
  dot.addEventListener('click', () => {
    if (!isMobile()) return;
    const page = parseInt(dot.getAttribute('data-page'), 10);
    goToPage(page);
  });
});



window.addEventListener('resize', () => {
  if (!isMobile()) {
    carousel.style.transition = 'none';
    carousel.style.transform = '';
    carousel.style.overflowX = '';
    return;
  }
});

statsArrowBtn?.addEventListener('click', () => {
  if (isMobile() && currentPage < totalPages - 1) goToPage(currentPage + 1);
});

backArrowBtn?.addEventListener('click', () => {
  if (isMobile() && currentPage > 0) goToPage(currentPage - 1);
});

document.addEventListener('keydown', (e) => {
  if (!isMobile()) return;
  if (e.key === 'ArrowRight' && currentPage < totalPages - 1) goToPage(currentPage + 1);
  if (e.key === 'ArrowLeft' && currentPage > 0) goToPage(currentPage - 1);
});

/* ===== MOBILE SWIPE ===== */

let swipeStartX = 0;

carousel?.addEventListener('touchstart', (e) => {
  if (!isMobile()) return;
  swipeStartX = e.touches[0].clientX;
}, { passive: true });

carousel?.addEventListener('touchend', (e) => {
  if (!isMobile()) return;
  const swipeEndX = e.changedTouches[0].clientX;
  const diff = swipeStartX - swipeEndX;
  if (diff > 50 && currentPage < totalPages - 1) goToPage(currentPage + 1);
  if (diff < -50 && currentPage > 0) goToPage(currentPage - 1);
}, { passive: true });
