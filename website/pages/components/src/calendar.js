import '../../../src/theme.js?v=202610282140.60ab7aecf18f6d187948740820950d88bb27c840';
import { MONTHS, START_MONTH, SEPTEMBER, DECEMBER, buildSchedule, eventDate } from './schedule.js?v=202610282140.60ab7aecf18f6d187948740820950d88bb27c840';

const html = (strings, ...vals) =>
  strings.reduce((acc, s, i) => acc + s + (vals[i] ?? ''), '');

const now = new Date();
let initialMonth = now.getMonth() - START_MONTH;
if (initialMonth < 0 || initialMonth >= MONTHS.length) initialMonth = 0;

const calendarState = {
  months: MONTHS,
  current: initialMonth,
  year: now.getFullYear(),
  view: 'list'
};

const joinBtn = '<a href="https://discord.com/invite/eRzNTw6hFm" target="_blank" rel="noopener noreferrer" class="discord-btn-tiny"><img src="../img/icon/discord.svg?v=202610282140.60ab7aecf18f6d187948740820950d88bb27c840" alt="Discord" style="width:12px;height:12px;">Join</a>';

const discordIconBtn = '<a href="https://discord.com/invite/eRzNTw6hFm" target="_blank" rel="noopener noreferrer" class="discord-btn-icon" aria-label="Join Discord"><img src="../img/icon/discord.svg?v=202610282140.60ab7aecf18f6d187948740820950d88bb27c840" alt="Discord"></a>';

const gregAvatar = '<img src="../img/greg.jpg?v=202610282140.60ab7aecf18f6d187948740820950d88bb27c840" alt="Greg" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:4px;">';
const gavinAvatar = '<img src="../img/gavin.jpg?v=202610282140.60ab7aecf18f6d187948740820950d88bb27c840" alt="Gavin" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:4px;">';
const wesAvatar = '<img src="../img/icon/user.svg?v=202610282140.60ab7aecf18f6d187948740820950d88bb27c840" alt="Wes" class="event-avatar" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:4px;">';
const gregAvatarSmall = '<img src="../img/greg.jpg?v=202610282140.60ab7aecf18f6d187948740820950d88bb27c840" alt="Greg" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:2px;">';

const AVATAR = { Greg: gregAvatar, Wes: wesAvatar };

const titleFor = (event) =>
  event.kind === 'special'
    ? gregAvatarSmall + gavinAvatar + ' ' + event.title
    : `Tutoring with ${AVATAR[event.host]} ${event.host}: 6-7 PM Central${joinBtn}`;

const events = buildSchedule(calendarState.year).map(event => ({
  monthIndex: event.monthIndex,
  day: event.day,
  title: titleFor(event)
}));

const getEventsForDate = (monthIndex, day) =>
  events.filter(e => e.monthIndex === monthIndex && e.day === day);

function getCalendarElements() {
  return {
    monthDisplay: document.querySelector('#monthDisplay'),
    daysContainer: document.querySelector('#calendarDays'),
    card: document.querySelector('.calendar-card')
  };
}

const renderCalendar = () => {
  const el = getCalendarElements();
  const month = calendarState.months[calendarState.current];
  el.monthDisplay && (el.monthDisplay.textContent = month);

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (prevBtn) prevBtn.style.display = calendarState.current === SEPTEMBER ? 'none' : '';
  if (nextBtn) nextBtn.style.display = calendarState.current === DECEMBER ? 'none' : '';

  const firstDay = new Date(calendarState.year, START_MONTH + calendarState.current, 1).getDay();
  const lastDay = new Date(calendarState.year, START_MONTH + calendarState.current + 1, 0).getDate();

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const cells = dayLabels.map(d => html`<div class="day-label">${d}</div>`);

  for (let i = 0; i < firstDay; i++) cells.push('<div class="empty"></div>');
  for (let day = 1; day <= lastDay; day++) {
    const dayEvents = getEventsForDate(calendarState.current, day);
    cells.push(html`<div data-day="${day}" class="date-cell">${day}${dayEvents.length ? discordIconBtn : ''}</div>`);
  }

  el.daysContainer && (el.daysContainer.innerHTML = cells.join(''));
};

const renderListView = () => {
  const ref = new Date();
  const today = new Date(calendarState.year, ref.getMonth(), ref.getDate());
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events
    .map(e => ({ ...e, date: eventDate(calendarState.year, e) }))
    .filter(e => e.date >= today)
    .sort((a, b) => a.date - b.date);

  const isMobile = window.innerWidth < 768;

  const listHtml = upcomingEvents.map(e => {
    const monthName = calendarState.months[e.monthIndex];
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][e.date.getDay()];

    const hasBtn = e.title.includes('discord-btn-tiny');
    const btnStart = e.title.indexOf('<a href');
    let titleText = e.title;
    let btnHtml = '';
    if (hasBtn && btnStart > 0) {
      titleText = e.title.substring(0, btnStart).trim();
      btnHtml = e.title.substring(btnStart);
    }

    const fs = isMobile ? 'font-size:0.70rem' : '';
    if (isMobile) {
      return html`
        <div class="list-event-item" data-month="${e.monthIndex}" data-day="${e.day}">
          <div class="list-event-date">
            <span class="list-event-day" style="${fs}">${dayName}</span>
            <span class="list-event-num" style="${fs}">${e.day}</span>
            <span class="list-event-month" style="${fs}">${monthName}</span>
          </div>
          <div class="list-event-info">
            <span class="list-event-title" style="${fs}">${titleText}</span>
            ${btnHtml}
          </div>
        </div>
      `;
    }

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

  const el = getCalendarElements();
  el.daysContainer.innerHTML = html`<div class="events-list" style="width: 100%;">${listHtml}</div>`;
};

const renderView = () => {
  const el = getCalendarElements();
  const yearEl = document.querySelector('.calendar-header .year');
  if (yearEl) yearEl.textContent = calendarState.year;
  const isListView = calendarState.view === 'list';
  el.card?.classList.toggle('list-view', isListView);

  if (isListView) {
    el.monthDisplay.textContent = 'Upcoming Events';
    renderListView();
  } else {
    renderCalendar();
  }
};

let initialized = false;

document.addEventListener('click', (e) => {
  if (calendarState.view !== 'calendar') return;
  const prevMonthButton = e.target.closest('#prevBtn');
  const nextMonthButton = e.target.closest('#nextBtn');

  if (prevMonthButton && calendarState.current > SEPTEMBER) {
    calendarState.current--;
    renderCalendar();
  }
  if (nextMonthButton && calendarState.current < DECEMBER) {
    calendarState.current++;
    renderCalendar();
  }
});

function initCalendar() {
  if (initialized) return;
  initialized = true;
  renderView();

  const viewToggle = document.getElementById('viewToggle');
  const slider = viewToggle?.closest('.toggle').querySelector('.slider');
  viewToggle?.addEventListener('change', () => {
    calendarState.view = viewToggle.checked ? 'list' : 'calendar';
    slider?.classList.toggle('checked', viewToggle.checked);
    renderView();
  });
}

window.initCalendar = initCalendar;
