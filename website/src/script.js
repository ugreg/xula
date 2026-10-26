import { log } from './observability/log.js';

async function loadComponents() {
  const elements = document.querySelectorAll('[data-include]');

  for (const el of elements) {
    const path = el.getAttribute('data-include');
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`failed to load ${path}`);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      el.innerHTML = doc.body.innerHTML;

      const scripts = doc.querySelectorAll('script[type="module"]');
      for (const script of scripts) {
        const newScript = document.createElement('script');
        newScript.type = 'module';
        newScript.src = script.src;
        el.appendChild(newScript);
      }
    } catch (err) {
      console.error(err);
      el.textContent = 'Error loading component.';
    }
  }
}

const scrollTopButton = document.querySelector('.scroll-top-btn');
const carousel = document.getElementById('carousel');
const statsArrowBtn = document.querySelector('.stats-arrow-btn:not(.back)');
const backArrowBtn = document.querySelector('.stats-arrow-btn.back');
const dots = document.querySelectorAll('.page-indicator .dot');

function getTerminal() {
  return document.getElementById('homeTerminal');
}

function getCalendarFab() {
  return document.querySelector('.calendar-fab:not(.hero-calendar)');
}

function updateCalendarFab(scrollPos) {
  const fab = getCalendarFab();
  if (fab) fab.classList.toggle('visible', scrollPos > 0);
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
  await loadComponents();

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

function setupCalendarModal() {
  const calendarFabs = document.querySelectorAll('.calendar-fab');
  const calendarModal = document.getElementById('calendarModal');
  const calendarModalClose = document.querySelector('.calendar-modal-close');

  function openCalendar() {
    if (calendarModal) {
      calendarModal.classList.add('active');
      document.body.classList.add('calendar-open');
      document.body.style.overflow = 'hidden';
      if (window.initCalendar) window.initCalendar();
    }
  }

  function closeCalendar() {
    if (calendarModal) {
      calendarModal.classList.remove('active');
      document.body.classList.remove('calendar-open');
      document.body.style.overflow = '';
    }
  }

  for (const fab of calendarFabs) {
    fab.addEventListener('click', openCalendar);
  }

  if (calendarModalClose) {
    calendarModalClose.addEventListener('click', closeCalendar);
  }

  if (calendarModal) {
    calendarModal.addEventListener('click', (e) => {
      const calendarCard = calendarModal.querySelector('.calendar-card');
      if (!calendarCard || !calendarCard.contains(e.target)) {
        closeCalendar();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && calendarModal?.classList.contains('active')) {
      closeCalendar();
    }
  });
}

window.addEventListener('load', async () => {
  document.body.classList.remove('loading');
  await loadAllPages();
  setupAutoScroll();
  setupCalendarModal();

  const themeToggle = document.getElementById('themeToggle');
  document.documentElement.classList.add('light');
  document.documentElement.classList.remove('dark');
  if (themeToggle) themeToggle.checked = true;

  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      const light = themeToggle.checked;
      document.documentElement.classList.toggle('light', light);
      document.documentElement.classList.toggle('dark', !light);
    });
  }

  if (isMobile) {
    const t = getTerminal();
    if (t) t.classList.remove('visible');
    if (carousel) carousel.style.overflowY = 'auto';
  } else {
    const t = getTerminal();
    if (t && carousel.scrollTop === 0) t.classList.add('visible');
  }

  updateCalendarFab(carousel ? carousel.scrollTop : window.scrollY);
});

window.addEventListener('scroll', () => {
  const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
  const showScrollTop = window.scrollY > totalScroll * 0.5;
  if (scrollTopButton) {
    scrollTopButton.classList.toggle('visible', showScrollTop);
  }

  const t = getTerminal();
  const scrollPos = carousel ? carousel.scrollTop : window.scrollY;
  if (t && !isMobile) {
    t.classList.toggle('visible', scrollPos === 0);
  }

  updateCalendarFab(scrollPos);
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
      t.classList.toggle('visible', carousel.scrollTop === 0);
    }

    updateCalendarFab(carousel.scrollTop);
  }, { passive: true });
}



const pageOrder = ['home', 'xavierites', 'skills', 'stats'];
let currentPage = pageOrder[0];

function goToPage(pageName) {
  const idx = pageOrder.indexOf(pageName);
  if (idx < 0) return;
  if (!carousel) return;
  const pageH = isMobile ? window.innerHeight - 90 : window.innerHeight;
  carousel.scrollTo({ top: idx * pageH, behavior: 'smooth' });
}



if (dots) {
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const pageName = dot.getAttribute('data-page');
      goToPage(pageName);
    });
  });
}



if (carousel) {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let isSwiping = false;

  function updatePageFromScroll() {
    const pageHeight = isMobile ? window.innerHeight - 90 : window.innerHeight;
    const idx = Math.round(carousel.scrollTop / pageHeight);
    if (idx >= 0 && idx < pageOrder.length) {
      const prevPage = currentPage;
      currentPage = pageOrder[idx];
      if (dots) {
        dots.forEach(dot => {
          const name = dot.getAttribute('data-page');
          dot.classList.toggle('active', name === currentPage);
        });
      }
      if (idx !== pageOrder.indexOf(prevPage) && isMobile) {
        if (window.sceneRegistry?.[prevPage]) {
          window.sceneRegistry[prevPage].cleanup();
          log.info(`${prevPage}.html`, 'cleanup triggered');
        }
        if (window.sceneRegistry?.[currentPage]) {
          window.sceneRegistry[currentPage].restart();
          log.info(`${currentPage}.html`, 'restart triggered');
        }
      }
      statsArrowBtn.classList.toggle('hidden', idx === pageOrder.length - 1);
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

    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
      const idx = pageOrder.indexOf(currentPage);
      if (deltaY < 0 && idx < pageOrder.length - 1) {
        goToPage(pageOrder[idx + 1]);
      } else if (deltaY > 0 && idx > 0) {
        goToPage(pageOrder[idx - 1]);
      }
    }
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    const idx = pageOrder.indexOf(currentPage);
    if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault();
      goToPage(pageOrder[idx - 1]);
    }
    if (e.key === 'ArrowDown' && idx < pageOrder.length - 1) {
      e.preventDefault();
      goToPage(pageOrder[idx + 1]);
    }
  });

  statsArrowBtn?.addEventListener('click', () => {
    const idx = pageOrder.indexOf(currentPage);
    if (idx < pageOrder.length - 1) goToPage(pageOrder[idx + 1]);
  });

  backArrowBtn?.addEventListener('click', () => {
    const idx = pageOrder.indexOf(currentPage);
    if (idx > 0) goToPage(pageOrder[idx - 1]);
  });
}

function setupAutoScroll() {
  const grids = document.querySelectorAll('.extensions-grid, .stats-grid');
  grids.forEach((grid) => {
    let scrollInterval;
    let isHovering = false;
    let isTouching = false;

    const startScroll = () => {
      if (scrollInterval) return;
      scrollInterval = setInterval(() => {
        if (isHovering || isTouching) return;
        const maxScroll = grid.scrollWidth - grid.clientWidth;
        if (maxScroll <= 0) return;
        if (grid.scrollLeft >= maxScroll - 1) {
          grid.scrollLeft = 0;
        } else {
          grid.scrollLeft += 1;
        }
      }, 50);
    };

    grid.addEventListener('mouseenter', () => { isHovering = true; });
    grid.addEventListener('mouseleave', () => { isHovering = false; });
    grid.addEventListener('touchstart', () => { isTouching = true; });
    grid.addEventListener('touchend', () => { isTouching = false; });

    startScroll();
  });
}


