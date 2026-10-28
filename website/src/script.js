import { log } from './observability/log.js?v=202610280717.4c1f077bfdbf1ad341cad3f757b7de2bea09b85d';
import { stamp, V } from './build.js?v=202610280717.4c1f077bfdbf1ad341cad3f757b7de2bea09b85d';
import { loadComponents, mobileQuery } from './components.js?v=202610280717.4c1f077bfdbf1ad341cad3f757b7de2bea09b85d';

function copyFallback(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

function setupBuildVersion() {
  document.querySelectorAll('[data-build-version]').forEach((el) => {
    el.textContent = V;
  });

  document.querySelectorAll('[data-copy-build]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const flash = () => {
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(V).then(flash, () => {
          copyFallback(V);
          flash();
        });
      } else {
        copyFallback(V);
        flash();
      }
    });
  });
}

const scrollTopButton = document.querySelector('.scroll-top-btn');
const carousel = document.getElementById('carousel');
const statsArrowBtn = document.querySelector('.stats-arrow-btn:not(.back)');
const backArrowBtn = document.querySelector('.stats-arrow-btn.back');
const dots = document.querySelectorAll('.page-indicator .dot');

function getTerminal() {
  return document.getElementById('homeTerminal');
}

// fixed calendar FAB appears after this fraction of a viewport scrolled
const CALENDAR_FAB_SCROLL_RATIO = 0.5;

function getCalendarFab() {
  return document.querySelector('.calendar-fab');
}

function updateCalendarFab(scrollPos) {
  const fab = getCalendarFab();
  if (!fab) return;
  fab.classList.toggle('visible', scrollPos > window.innerHeight * CALENDAR_FAB_SCROLL_RATIO);
}

let isMobile = mobileQuery.matches;
window.addEventListener('resize', () => {
  isMobile = mobileQuery.matches;
});

async function loadPage(pageName, container) {
  try {
    const response = await fetch(stamp(`pages/${pageName}.html`));
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    container.innerHTML = doc.body.innerHTML;

    const scripts = doc.querySelectorAll('script[type="module"]');
    for (const script of scripts) {
      const newScript = document.createElement('script');
      newScript.type = 'module';
      newScript.src = stamp(script.src);
      container.appendChild(newScript);
    }
  } catch (e) {
    console.error(`[load] failed to load ${pageName}:`, e);
  }
}

async function loadAllPages() {
  await loadComponents();
  setupBuildVersion();

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

const getCalendarModal = () => document.getElementById('calendarModal');

// single source of truth for calendar state: modal, body lock, and trigger aria
// everything routes through here so the three signals can never disagree
function setCalendarOpen(open) {
  const calendarModal = getCalendarModal();
  if (!calendarModal) return;

  calendarModal.classList.toggle('active', open);
  document.body.classList.toggle('calendar-open', open);
  document.body.style.overflow = open ? 'hidden' : '';

  for (const trigger of document.querySelectorAll('[data-calendar-open]')) {
    trigger.setAttribute('aria-expanded', String(open));
  }

  if (open && window.initCalendar) window.initCalendar();
}

// delegated on document so re-injected pages and components can never orphan a listener
function setupCalendarModal() {
  document.addEventListener('click', (e) => {
    const calendarModal = getCalendarModal();
    if (!calendarModal) return;

    if (e.target.closest('[data-calendar-open]')) {
      setCalendarOpen(true);
      return;
    }

    const outsideCard =
      e.target === calendarModal ||
      e.target.closest('.calendar-modal-backdrop') ||
      e.target.closest('[data-calendar-close]');

    if (outsideCard && calendarModal.classList.contains('active')) {
      setCalendarOpen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && getCalendarModal()?.classList.contains('active')) {
      setCalendarOpen(false);
    }
  });

  window.__xula = {
    setCalendarOpen,
    calendarState: () => ({
      open: getCalendarModal()?.classList.contains('active') ?? false,
      triggers: document.querySelectorAll('[data-calendar-open]').length,
    }),
  };
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



const visiblePages = carousel
  ? [...carousel.querySelectorAll('.carousel-page')].filter(p => getComputedStyle(p).display !== 'none')
  : [];
const pageOrder = visiblePages.map(p => p.dataset.page);
let currentPage = pageOrder[0];

function goToPage(pageName) {
  const idx = pageOrder.indexOf(pageName);
  if (idx < 0) return;
  const target = visiblePages[idx];
  if (!target) return;
  carousel.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
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
    const pages = visiblePages;
    const probe = carousel.scrollTop + carousel.clientHeight / 2;
    let idx = 0;
    pages.forEach((page, i) => {
      if (page.offsetTop <= probe) idx = i;
    });
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


