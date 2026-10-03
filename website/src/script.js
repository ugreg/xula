const scrollTopButton = document.querySelector('.scroll-top-btn');
const themeToggle = document.getElementById('themeToggle');
const homeTerminal = document.getElementById('homeTerminal');
const carousel = document.getElementById('carousel');
const statsArrowBtn = document.querySelector('.stats-arrow-btn:not(.back)');
const backArrowBtn = document.querySelector('.stats-arrow-btn.back');
const dots = document.querySelectorAll('.page-indicator .dot');
const iframes = document.querySelectorAll('.carousel-page iframe');

const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

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

  if (isMobile()) {
    if (homeTerminal) homeTerminal.classList.remove('visible');
    if (carousel) carousel.style.overflowX = 'auto';
  } else {
    homeTerminal?.classList.add('visible');
  }
});

window.addEventListener('scroll', () => {
  const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
  const showScrollTop = window.scrollY > totalScroll * 0.5;
  scrollTopButton?.classList.toggle('visible', showScrollTop);

  if (homeTerminal && !isMobile()) {
    const scrollPos = window.scrollY;
    homeTerminal.classList.toggle('visible', scrollPos <= 50);
  }
});

scrollTopButton?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});



let currentPage = 0;
const totalPages = 5;

function goToPage(page) {
  if (!isMobile()) return;
  if (page < 0 || page >= totalPages) return;
  if (!carousel) return;
  carousel.scrollTo({ left: page * window.innerWidth, behavior: 'smooth' });
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

if (carousel) {
  function updatePageFromScroll() {
    const pageWidth = window.innerWidth;
    const idx = Math.round(carousel.scrollLeft / pageWidth);
    if (idx >= 0 && idx < totalPages) {
      currentPage = idx;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
      statsArrowBtn.classList.toggle('hidden', idx === totalPages - 1);
      backArrowBtn.classList.toggle('hidden', idx === 0);
    }
  }

  carousel.addEventListener('scroll', updatePageFromScroll, { passive: true });
  updatePageFromScroll();

  // swipe detection on overlays (workaround for iframe touch capture)
  let swipeStartX = 0;
  let swipeStartY = 0;

  document.querySelectorAll('.swipe-overlay').forEach(overlay => {
    overlay.addEventListener('touchstart', (e) => {
      swipeStartX = e.touches[0].clientX;
      swipeStartY = e.touches[0].clientY;
    }, { passive: true });

    overlay.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - swipeStartX;
      const dy = e.changedTouches[0].clientY - swipeStartY;

      // only respond to horizontal swipes (more horizontal than vertical)
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0 && currentPage < totalPages - 1) goToPage(currentPage + 1);
        if (dx > 0 && currentPage > 0) goToPage(currentPage - 1);
      }
    }, { passive: true });
  });
}
