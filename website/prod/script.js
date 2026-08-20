import * as THREE from 'three';

const html = (strings, ...vals) =>
  strings.reduce((acc, s, i) => acc + s + (vals[i] ?? ''), '');

const progressBar = document.getElementById('file');
const loadingText = document.getElementById('loading-text');
const loadingScreen = document.getElementById('loading-screen');

let progress = 0;

const setProgress = (val) => {
  progress = Math.min(100, Math.max(0, val));
  progressBar.value = progress;
  loadingText.textContent = Math.round(progress) + '%';
};

const totalResources = () => {
  const imgs = document.images.length;
  const links = document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"]').length;
  const scripts = document.querySelectorAll('script[src]').length;
  return Math.max(imgs + links + scripts, 10);
};

let loadedResources = 0;
let totalRes = totalResources();

const onResourceLoad = () => {
  loadedResources++;
  const resourceProgress = Math.min(60, (loadedResources / totalRes) * 60);
  setProgress(10 + resourceProgress);
};

document.addEventListener('DOMContentLoaded', () => {
  setProgress(25);
  const images = document.querySelectorAll('img, link[rel="preload"]');
  images.forEach(img => {
    if (img.complete) {
      onResourceLoad();
    } else {
      img.addEventListener('load', onResourceLoad, { once: true });
      img.addEventListener('error', onResourceLoad, { once: true });
    }
  });
});

window.addEventListener('load', () => {
  setProgress(85);
  setTimeout(() => {
    setProgress(100);
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      document.body.classList.remove('loading');
      setTimeout(() => { loadingScreen.style.display = 'none'; }, 400);
    }, 300);
  }, 200);
});

setProgress(5);

const observerConfig = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target);
    }
  }
}, structuredClone(observerConfig));

const revealElements = document.querySelectorAll('.reveal');
revealElements.forEach(el => revealObserver.observe(el));

document.addEventListener('click', (e) => {
  const anchorLink = e.target.closest('a[href^="#"]');
  if (!anchorLink?.hash) return;
  e.preventDefault();
  const anchorTarget = document.querySelector(anchorLink.hash);
  anchorTarget?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const floatingElements = Array.from(document.querySelectorAll('.floating'));
let mouseX = window.innerWidth / 2;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
});

const featuresSection = document.querySelector('#features') ?? document.body;
new ResizeObserver(() => {
  for (const [i, el] of floatingElements.entries()) {
    const speed = (i + 1) * 20;
    const xOffset = (mouseX - window.innerWidth / 2) / speed;
    el.style.transform = html`translate(${xOffset}px, ${-10}px) rotate(${xOffset * 5}deg)`;
  }
}).observe(featuresSection);

const homeTerminalElement = document.querySelector('#homeTerminal');
const scrollTopButton = document.querySelector('.scroll-top-btn');
const scrollController = new AbortController();

window.addEventListener('scroll', () => {
  const showTerminal = window.scrollY <= window.innerHeight * 0.1;
  const sharedVisible = sharedTerminal?.classList.contains('visible');
  homeTerminalElement?.classList.toggle('visible', showTerminal && !sharedVisible);

  const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
  const showScrollTop = window.scrollY > totalScroll * 0.5;
  scrollTopButton?.classList.toggle('visible', showScrollTop);
}, { signal: scrollController.signal });

homeTerminalElement?.classList.add('visible');

scrollTopButton?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('beforeunload', () => scrollController.abort());

const calendarState = {
  months: ['September', 'October', 'November', 'December'],
  current: 0,
  year: 2026,
  view: 'list'
};

const events = [
  { monthIndex: 0, day: 22, title: 'Pro Dev and Staff meeting', type: 'meeting' },
  { monthIndex: 1, day: 6, title: 'AI Tools Hands-on Session', type: 'workshop' },
  { monthIndex: 2, day: 10, title: 'Hackathon Kickoff', type: 'event' },
  { monthIndex: 3, day: 1, title: 'Year-End Celebration', type: 'event' },
  { monthIndex: 3, day: 15, title: 'Winter Workshop Series Begins', type: 'workshop' }
];

const getEventsForDate = (monthIndex, day) =>
  events.filter(e => e.monthIndex === monthIndex && e.day === day);

const calendarMonthDisplay = document.querySelector('#monthDisplay');
const calendarDaysContainer = document.querySelector('#calendarDays');
const calendarCard = document.querySelector('.calendar-card');

const renderCalendar = () => {
  const month = calendarState.months[calendarState.current];
  calendarMonthDisplay && (calendarMonthDisplay.textContent = month);

  const firstDay = new Date(calendarState.year, 8 + calendarState.current, 1).getDay();
  const lastDay = new Date(calendarState.year, 8 + calendarState.current + 1, 0).getDate();

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const cells = dayLabels.map(d =>
    html`<div class="day-label">${d}</div>`
  );

  for (let i = 0; i < firstDay; i++) cells.push('<div class="empty"></div>');
  for (let day = 1; day <= lastDay; day++) {
    const dayEvents = getEventsForDate(calendarState.current, day);
    const hasEvents = dayEvents.length > 0;
    const dotHtml = hasEvents ? `<svg width="8" height="8" viewBox="0 0 8 8" style="position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); pointer-events: none;"><circle cx="4" cy="4" r="2.5" fill="#5865F2"/></svg>` : '';
    cells.push(html`<div data-day="${day}" class="date-cell${hasEvents ? ' has-event' : ''}">${day}${dotHtml}</div>`);
  }

  calendarDaysContainer && (calendarDaysContainer.innerHTML = cells.join(''));
};

const renderListView = () => {
  const upcomingEvents = events
    .map(e => ({ ...e, date: new Date(calendarState.year, 8 + e.monthIndex, e.day) }))
    .filter(e => e.date >= new Date(2026, 8, 1))
    .sort((a, b) => a.date - b.date);

  const listHtml = upcomingEvents.map(e => {
    const monthName = calendarState.months[e.monthIndex];
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][e.date.getDay()];
    return html`
      <div class="list-event-item" data-month="${e.monthIndex}" data-day="${e.day}">
        <div class="list-event-date">
          <span class="list-event-day">${dayName}</span>
          <span class="list-event-num">${e.day}</span>
        </div>
        <div class="list-event-info">
          <span class="list-event-title">${e.title}</span>
        </div>
        <span class="list-event-month">${monthName}</span>
      </div>
    `;
  }).join('');

  calendarDaysContainer.innerHTML = html`<div class="events-list" style="width: 100%;">${listHtml}</div>`;
};

const renderView = () => {
  const isListView = calendarState.view === 'list';
  calendarCard?.classList.toggle('list-view', isListView);

  if (isListView) {
    calendarMonthDisplay.textContent = 'Upcoming Events';
    renderListView();
  } else {
    renderCalendar();
  }
};

renderView();

document.addEventListener('click', (e) => {
  if (calendarState.view !== 'calendar') return;

  const prevMonthButton = e.target.closest('#prevBtn');
  const nextMonthButton = e.target.closest('#nextBtn');

  if (prevMonthButton && calendarState.current > 0) {
    calendarState.current--;
    renderCalendar();
  }
  if (nextMonthButton && calendarState.current < 3) {
    calendarState.current++;
    renderCalendar();
  }
});

const sharedTerminal = document.getElementById('sharedTerminal');
const terminalBody = document.getElementById('terminalBody');
const closeTerminalBtn = document.getElementById('closeTerminal');

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthNames = ['September', 'October', 'November', 'December'];

function openTerminal(day, monthIndex) {
  const monthNum = 8 + monthIndex;
  const dateObj = new Date(calendarState.year, monthNum, day);
  const dayName = dayNames[dateObj.getDay()];
  const monthName = monthNames[monthIndex];
  const dayEvents = getEventsForDate(monthIndex, day);
  const hasEvents = dayEvents.length > 0;

  let eventHtml = '';
  if (hasEvents) {
    eventHtml = '<div style="margin-top: 10px; margin-bottom: 8px;"><span style="color: #60a5fa;">📌 Events:</span></div>';
    dayEvents.forEach(evt => {
      eventHtml += `<div class="output" style="margin-bottom: 4px; padding-left: 16px;">
        <span style="color: #5865F2;">▸</span> ${evt.title}
      </div>`;
    });
  }

  const content = `
    <div style="color: #888; font-size: 12px; margin-bottom: 10px;">
      <span style="color: #27c93f;">$</span> calendar info ${day} ${monthName} ${calendarState.year}
    </div>
    <div class="output" style="margin-bottom: 8px;">
      <span style="color: #86efac;">Hello!</span> You selected:
    </div>
    <div class="output" style="margin-bottom: 4px;">
      <span style="color: #d4a574;">Day:</span> ${dayName}
    </div>
    <div class="output" style="margin-bottom: 4px;">
      <span style="color: #d4a574;">Date:</span> ${monthName} ${day}, ${calendarState.year}
    </div>
    ${eventHtml}
    <div style="margin-top: 15px; color: #888;">
      <span style="color: #27c93f;">$</span> <span class="cursor"></span>
    </div>
  `;

  terminalBody.innerHTML = content;
  homeTerminalElement?.classList.remove('visible');
  sharedTerminal?.classList.add('visible');
}

function closeTerminal() {
  sharedTerminal?.classList.remove('visible');
}

closeTerminalBtn?.addEventListener('click', closeTerminal);

const viewToggle = document.getElementById('viewToggle');
viewToggle.checked = calendarState.view === 'list';

viewToggle?.addEventListener('change', () => {
  calendarState.view = viewToggle.checked ? 'list' : 'calendar';
  renderView();
});

calendarDaysContainer?.addEventListener('click', (e) => {
  const dateCell = e.target.closest('.date-cell');
  if (dateCell) {
    const day = parseInt(dateCell.getAttribute('data-day'), 10);
    openTerminal(day, calendarState.current);
    return;
  }

  const listItem = e.target.closest('.list-event-item');
  if (listItem) {
    const monthIdx = parseInt(listItem.getAttribute('data-month'), 10);
    const day = parseInt(listItem.getAttribute('data-day'), 10);
    openTerminal(day, monthIdx);
  }
});

const motionPreferenceQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
const handleMotionPreference = (mq) => {
  if (mq.matches) {
    document.documentElement.style.setProperty('--anim-speed', '0s');
    floatingElements.forEach(el => el.style.animation = 'none');
  } else {
    document.documentElement.style.removeProperty('--anim-speed');
    floatingElements.forEach(el => el.style.animation = '');
  }
};

handleMotionPreference(motionPreferenceQuery);
motionPreferenceQuery?.addEventListener?.('change', handleMotionPreference);

const wideScreenQuery = window.matchMedia?.('(min-width: 768px)');
wideScreenQuery?.addEventListener?.('change', (mq) => {
  document.documentElement.classList.toggle('wide-screen', mq.matches);
});

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard?.writeText?.(text);
  } catch {}
};

document.addEventListener('dblclick', (e) => {
  const clickedCard = e.target.closest('.feature-card, .extension-card');
  if (!clickedCard) return;
  const cardTitleElement = clickedCard.querySelector('h3, h4');
  const cardTitle = cardTitleElement?.textContent?.trim();
  if (cardTitle) copyToClipboard(cardTitle);
});

window.__app = { state: calendarState, copy: copyToClipboard };

const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
const isLight = savedTheme === 'light' || (!savedTheme && !prefersDark);

if (isLight) {
  document.documentElement.classList.add('light');
  themeToggle.checked = true;
}

themeToggle.addEventListener('change', () => {
  const light = themeToggle.checked;
  document.documentElement.classList.toggle('light', light);
  localStorage.setItem('theme', light ? 'light' : 'dark');
});

/* ===== THREE.JS: ARROW + ICONS ===== */

const voxelMeshes = [];

function createVoxel(x, y, z, s, color) {
  const g = new THREE.BoxGeometry(s, s, s);
  const m = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(g, m);
  mesh.position.set(x, y, z);
  return mesh;
}

function initArrow() {
  try {
    console.log('[three] initArrow starting');
    const canvas = document.getElementById('arrowCanvas');
    if (!canvas) {
      console.error('[three] initArrow: arrowCanvas not found');
      return;
    }
    console.log('[three] initArrow: canvas found');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(64, 64);
    renderer.setPixelRatio(window.devicePixelRatio);

    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 1);
    arrowShape.lineTo(-0.5, 0.1);
    arrowShape.lineTo(-0.15, 0.1);
    arrowShape.lineTo(-0.15, -1);
    arrowShape.lineTo(0.15, -1);
    arrowShape.lineTo(0.15, 0.1);
    arrowShape.lineTo(0.5, 0.1);
    arrowShape.lineTo(0, 1);

    const extrudeSettings = {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 1
    };

    const geometry = new THREE.ExtrudeGeometry(arrowShape, extrudeSettings);
    geometry.center();

    const material = new THREE.MeshStandardMaterial({
      color: 0x5865F2,
      roughness: 0.3,
      metalness: 0.4,
      flatShading: true
    });

    const arrowMesh = new THREE.Mesh(geometry, material);
    scene.add(arrowMesh);

    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const d1 = new THREE.DirectionalLight(0xffffff, 2);
    d1.position.set(2, 2, 4);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0x4752C4, 1.5);
    d2.position.set(-2, 1, -2);
    scene.add(d2);

    voxelMeshes.push({ mesh: arrowMesh, scene, camera, renderer, type: 'arrow' });
    console.log('[three] initArrow: done, total scenes:', voxelMeshes.length);
  } catch (e) {
    console.error('[three] initArrow error:', e);
  }
}

function createIconScene(iconType, color) {
  try {
    const canvas = document.querySelector(`canvas[data-icon="${iconType}"]`);
    if (!canvas) {
      console.warn('[three] createIconScene:', iconType, 'canvas not found');
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(64, 64);
    renderer.setPixelRatio(window.devicePixelRatio);

    const group = new THREE.Group();

    if (iconType === 'crane') {
      group.add(createVoxel(0, -0.4, 0, 0.7, 0xf5a623));
      group.add(createVoxel(0, 0.3, 0, 0.5, 0xf5a623));
      group.add(createVoxel(0, 1.0, 0, 0.5, 0xf5a623));
      group.add(createVoxel(-0.7, 0.7, 0, 0.9, 0xf5a623));
      group.add(createVoxel(-1.1, 0.2, 0, 0.2, 0xd35400));
    }

    if (iconType === 'wrench') {
      group.add(createVoxel(0, 0, 0, 0.8, 0x7f8c8d));
      group.add(createVoxel(0.4, 0, 0, 0.5, 0x7f8c8d));
      group.add(createVoxel(0.7, 0.3, 0, 0.5, 0x7f8c8d));
      group.add(createVoxel(0.7, -0.3, 0, 0.5, 0x7f8c8d));
      group.add(createVoxel(-0.4, 0, 0, 0.5, 0x95a5a6));
    }

    if (iconType === 'robot') {
      group.add(createVoxel(0, 0.4, 0, 0.8, 0x3498db));
      group.add(createVoxel(0, -0.3, 0, 0.9, 0x2980b9));
      group.add(createVoxel(-0.3, 0.6, 0, 0.3, 0x3498db));
      group.add(createVoxel(0.3, 0.6, 0, 0.3, 0xe74c3c));
      group.add(createVoxel(0, 0, 0.5, 0.2, 0x2ecc71));
    }

    if (iconType === 'heart') {
      group.add(createVoxel(-0.35, 0.2, 0, 0.6, 0xe74c3c));
      group.add(createVoxel(0.35, 0.2, 0, 0.6, 0xe74c3c));
      group.add(createVoxel(0, -0.1, 0, 0.9, 0xe74c3c));
      group.add(createVoxel(0, -0.5, 0, 0.6, 0xe74c3c));
      group.add(createVoxel(0, -0.8, 0, 0.3, 0xe74c3c));
    }

    if (iconType === 'grad') {
      group.add(createVoxel(0, 0, 0, 0.8, 0x2c3e50));
      group.add(createVoxel(0, 0.4, 0, 1.1, 0x2c3e50));
      group.add(createVoxel(-0.8, 0.6, 0, 0.3, 0xf1c40f));
      group.add(createVoxel(0, -0.4, 0, 0.5, 0x2c3e50));
      group.add(createVoxel(0.4, 0.4, 0, 0.3, 0xf1c40f));
    }

    if (iconType === 'briefcase') {
      group.add(createVoxel(0, -0.1, 0, 1, 0x34495e));
      group.add(createVoxel(0, 0.4, 0, 0.6, 0x7f8c8d));
      group.add(createVoxel(0, -0.3, 0.4, 0.2, 0x2c3e50));
      group.add(createVoxel(0, 0, 0.5, 0.3, 0xf1c40f));
      group.add(createVoxel(-0.4, 0.2, 0, 0.2, 0x7f8c8d));
    }

    if (iconType === 'money') {
      group.add(createVoxel(0, 0, 0, 1, 0x27ae60));
      group.add(createVoxel(0, -0.4, 0, 1, 0x2ecc71));
      group.add(createVoxel(0.3, 0, 0.5, 0.3, 0xf1c40f));
      group.add(createVoxel(-0.3, 0, 0.5, 0.3, 0xf1c40f));
      group.add(createVoxel(0, 0, -0.3, 0.9, 0x2ecc71));
    }

    scene.add(group);
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dlight = new THREE.DirectionalLight(0xffffff, 1.2);
    dlight.position.set(2, 2, 3);
    scene.add(dlight);

    voxelMeshes.push({ mesh: group, scene, camera, renderer, type: 'icon' });
    console.log('[three] createIconScene:', iconType, 'done');
  } catch (e) {
    console.error('[three] createIconScene error for', iconType, ':', e);
  }
}

function initIcons() {
  console.log('[three] initIcons starting');
  createIconScene('crane', 0xf5a623);
  createIconScene('wrench', 0x7f8c8d);
  createIconScene('robot', 0x3498db);
  createIconScene('heart', 0xe74c3c);
  createIconScene('grad', 0x2c3e50);
  createIconScene('briefcase', 0x34495e);
  createIconScene('money', 0x27ae60);
  console.log('[three] initIcons done, total scenes:', voxelMeshes.length);
}

function animateAll() {
  requestAnimationFrame(animateAll);
  const t = Date.now() * 0.001;

  for (const item of voxelMeshes) {
    if (item.type === 'arrow') {
      item.mesh.rotation.y += 0.02;
    }
    if (item.type === 'icon') {
      item.mesh.rotation.y += 0.02;
      item.mesh.rotation.x = Math.sin(t) * 0.15;
    }
    item.renderer.render(item.scene, item.camera);
  }
}

window.addEventListener('load', () => {
  console.log('[three] window load event');
  setTimeout(() => {
    console.log('[three] initializing...');
    console.log('[three] THREE version:', THREE.REVISION);
    initArrow();
    initIcons();
    animateAll();
  }, 500);
});
