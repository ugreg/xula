const scrollTopButton = document.querySelector('.scroll-top-btn');
const themeToggle = document.getElementById('themeToggle');
const carousel = document.getElementById('carousel');
const statsArrowBtn = document.querySelector('.stats-arrow-btn:not(.back)');
const backArrowBtn = document.querySelector('.stats-arrow-btn.back');
const dots = document.querySelectorAll('.page-indicator .dot');

function getTerminal() {
  return document.getElementById('homeTerminal');
}

let isMobile = window.matchMedia('(max-width: 768px)').matches;
window.addEventListener('resize', () => {
  isMobile = window.matchMedia('(max-width: 768px)').matches;
});

async function loadPage(pageName, container) {
  try {
    const response = await fetch(`pages/${pageName}.html`);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    container.innerHTML = doc.body.innerHTML;

    const scripts = doc.querySelectorAll('script[type="module"]');
    for (const script of scripts) {
      const newScript = document.createElement('script');
      newScript.type = 'module';
      newScript.src = script.src;
      container.appendChild(newScript);
    }
  } catch (e) {
    console.error(`[load] failed to load ${pageName}:`, e);
  }
}

async function loadAllPages() {
  await loadIncludes(); // includes.js (defer) already called this, but we await to ensure pages load after

  const pages = carousel.querySelectorAll('.carousel-page');
  const promises = [];
  for (const page of pages) {
    const pageName = page.getAttribute('data-page');
    if (pageName) {
      promises.push(loadPage(pageName, page));
    }
  }
  await Promise.all(promises);
}

window.addEventListener('load', async () => {
  document.body.classList.remove('loading');
  await loadAllPages();

  const savedTheme = localStorage.getItem('theme');
  const isLight = savedTheme === 'light' || !savedTheme;

  if (isLight) {
    document.documentElement.classList.add('light');
    if (themeToggle) {
      themeToggle.checked = true;
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      const light = themeToggle.checked;
      document.documentElement.classList.toggle('light', light);
      localStorage.setItem('theme', light ? 'light' : 'dark');
    });
  }

  if (isMobile) {
    const t = getTerminal();
    if (t) t.classList.remove('visible');
    if (carousel) carousel.style.overflowX = 'auto';
  } else {
    const t = getTerminal();
    if (t) t.classList.add('visible');
  }
});

window.addEventListener('scroll', () => {
  const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
  const showScrollTop = window.scrollY > totalScroll * 0.5;
  if (scrollTopButton) {
    scrollTopButton.classList.toggle('visible', showScrollTop);
  }

  const t = getTerminal();
  if (t && !isMobile) {
    const scrollPos = carousel ? carousel.scrollTop : window.scrollY;
    t.classList.toggle('visible', scrollPos <= 50);
  }
});

if (scrollTopButton) {
  scrollTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (carousel) {
  carousel.addEventListener('scroll', () => {
    const t = getTerminal();
    if (t && !isMobile) {
      t.classList.toggle('visible', carousel.scrollTop <= 50);
    }
  }, { passive: true });
}



let currentPage = 0;
const totalPages = 5;

function goToPage(page) {
  if (page < 0 || page >= totalPages) return;
  if (!carousel) return;
  carousel.scrollTo({ left: page * window.innerWidth, behavior: 'smooth' });
}



if (dots) {
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const page = parseInt(dot.getAttribute('data-page'), 10);
      goToPage(page);
    });
  });
}



if (carousel) {
  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 768px)').matches) {
      carousel.style.transition = 'none';
      carousel.style.transform = '';
      carousel.style.overflowX = '';
      return;
    }
  });
}

if (carousel) {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let isSwiping = false;

  function updatePageFromScroll() {
    const pageWidth = window.innerWidth;
    const idx = Math.round(carousel.scrollLeft / pageWidth);
    if (idx >= 0 && idx < totalPages) {
      currentPage = idx;
      if (dots) {
        dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
      }
      statsArrowBtn.classList.toggle('hidden', idx === totalPages - 1);
      backArrowBtn.classList.toggle('hidden', idx === 0);
    }
  }

  carousel.addEventListener('scroll', updatePageFromScroll, { passive: true });
  updatePageFromScroll();

  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    isSwiping = true;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    isSwiping = false;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const elapsed = Date.now() - touchStartTime;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX < 0 && currentPage < totalPages - 1) {
        goToPage(currentPage + 1);
      } else if (deltaX > 0 && currentPage > 0) {
        goToPage(currentPage - 1);
      }
    }
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && currentPage < totalPages - 1) goToPage(currentPage + 1);
    if (e.key === 'ArrowLeft' && currentPage > 0) goToPage(currentPage - 1);
  });

  statsArrowBtn?.addEventListener('click', () => {
    if (currentPage < totalPages - 1) goToPage(currentPage + 1);
  });

  backArrowBtn?.addEventListener('click', () => {
    if (currentPage > 0) goToPage(currentPage - 1);
  });
}
