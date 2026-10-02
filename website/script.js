const scrollTopButton = document.querySelector('.scroll-top-btn');
const themeToggle = document.getElementById('themeToggle');
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
});

/* ===== SCROLL ===== */

window.addEventListener('scroll', () => {
  const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
  const showScrollTop = window.scrollY > totalScroll * 0.5;
  scrollTopButton?.classList.toggle('visible', showScrollTop);
});

scrollTopButton?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== CAROUSEL (mobile only) ===== */

let currentPage = 0;
const totalPages = 5;
let isDragging = false;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let isCarouselTransitioning = false;

function updateCarousel() {
  if (!isMobile()) return;
  carousel.style.transition = isCarouselTransitioning ? 'transform 0.4s cubic-bezier(0.2, 0, 0.2, 1)' : 'none';
  carousel.style.transform = `translateX(-${currentTranslate}px)`;
}

function goToPage(page) {
  if (!isMobile()) return;
  if (page < 0 || page >= totalPages) return;
  currentPage = page;
  dots.forEach((dot, i) => dot.classList.toggle('active', i === page));

  isCarouselTransitioning = true;
  currentTranslate = page * window.innerWidth;
  updateCarousel();

  statsArrowBtn.classList.toggle('hidden', page === 4);
  backArrowBtn.classList.toggle('hidden', page !== 4);

  setTimeout(() => {
    isCarouselTransitioning = false;
    prevTranslate = currentTranslate;
  }, 400);
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    if (!isMobile()) return;
    const page = parseInt(dot.getAttribute('data-page'), 10);
    goToPage(page);
  });
});

carousel.addEventListener('touchstart', (e) => {
  if (!isMobile()) return;
  const tag = e.target.tagName;
  const isInteractive = ['INPUT', 'BUTTON', 'A', 'CANVAS', 'LABEL', 'IFRAME'].includes(tag);
  const isPageIndicator = e.target.closest('.page-indicator');
  const isArrowBtn = e.target.closest('.stats-arrow-btn');

  if (isInteractive || isPageIndicator || isArrowBtn || isCarouselTransitioning) return;

  isDragging = true;
  startX = e.touches[0].clientX;
  prevTranslate = currentTranslate;
  carousel.style.transition = 'none';
}, { passive: true });

carousel.addEventListener('touchmove', (e) => {
  if (!isMobile() || !isDragging) return;
  const currentX = e.touches[0].clientX;
  const diff = currentX - startX;
  currentTranslate = prevTranslate - diff;

  const minTranslate = (totalPages - 1) * window.innerWidth;
  currentTranslate = Math.max(0, Math.min(currentTranslate, minTranslate));

  updateCarousel();
}, { passive: true });

carousel.addEventListener('touchend', (e) => {
  if (!isMobile() || !isDragging) return;
  isDragging = false;

  const endX = e.changedTouches[0].clientX;
  const diff = endX - startX;
  const threshold = 50;

  if (Math.abs(diff) > threshold) {
    if (diff < 0) goToPage(currentPage + 1);
    else goToPage(currentPage - 1);
  } else {
    isCarouselTransitioning = true;
    currentTranslate = prevTranslate;
    updateCarousel();
    setTimeout(() => {
      isCarouselTransitioning = false;
    }, 400);
  }
}, { passive: true });

window.addEventListener('resize', () => {
  if (!isMobile()) {
    carousel.style.transition = 'none';
    carousel.style.transform = '';
    return;
  }
  currentTranslate = currentPage * window.innerWidth;
  prevTranslate = currentTranslate;
  updateCarousel();
});

statsArrowBtn?.addEventListener('click', () => {
  if (isMobile()) goToPage(4);
});

backArrowBtn?.addEventListener('click', () => {
  if (isMobile()) goToPage(0);
});

document.addEventListener('keydown', (e) => {
  if (!isMobile()) return;
  if (e.key === 'Escape' && currentPage > 0) goToPage(0);
});
