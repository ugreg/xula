import './theme.js';

const html = (strings, ...vals) =>
  strings.reduce((acc, s, i) => acc + s + (vals[i] ?? ''), '');

const SEPTEMBER = 0;
const OCTOBER = 1;
const NOVEMBER = 2;
const DECEMBER = 3;

const calendarMonths = ['September', 'October', 'November', 'December'];
const now = new Date();
let initialMonth = now.getMonth() - 8;
if (initialMonth < 0 || initialMonth >= calendarMonths.length) initialMonth = 0;

const calendarState = {
  months: calendarMonths,
  current: initialMonth,
  year: 2026,
  view: 'list'
};

const joinBtn = '<a href="https://discord.com/invite/eRzNTw6hFm" target="_blank" rel="noopener noreferrer" class="discord-btn-tiny"><svg viewBox="0 0 24 24" fill="currentColor" style="width:12px;height:12px;"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.46 13.46 0 0 0-.586 1.212 18.26 18.26 0 0 0-5.537 0 13.544 13.544 0 0 0-.585-1.212.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.104 1.793 12.064 0a.074.074 0 0 1 .078.01c.118.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>Join</a>';

const gregAvatar = '<img src="greg.jpg" alt="Greg" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:4px;">';
const gavinAvatar = '<img src="gavin.jpg" alt="Gavin" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:4px;">';
const gregAvatarSmall = '<img src="greg.jpg" alt="Greg" style="width:20px;height:20px;border-radius:50%;vertical-align:middle;margin-right:2px;">';

const events = [];

events.push({
  monthIndex: OCTOBER,
  day: 20,
  title: gregAvatarSmall + gavinAvatar + ' G & G Free AI Tools Talk'
});

for (let month = OCTOBER; month <= NOVEMBER; month++) {
  const daysInMonth = new Date(2026, 8 + month + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(2026, 8 + month, day);
    const dayOfWeek = date.getDay();

    if (month === OCTOBER && (day === 1 || day === 20)) continue;
    if (month === NOVEMBER && (day === 24 || day === 25 || day === 26)) continue;

    if (dayOfWeek === 2) {
      events.push({
        monthIndex: month,
        day: day,
        title: 'Tutoring with ' + gregAvatar + ' Greg: 6-7 PM Central' + joinBtn
      });
    } else if (dayOfWeek === 3) {
      events.push({
        monthIndex: month,
        day: day,
        title: 'Tutoring with ' + gavinAvatar + ' Gavin: 6-7 PM Central' + joinBtn
      });
    } else if (dayOfWeek === 4) {
      events.push({
        monthIndex: month,
        day: day,
        title: 'Tutoring with ' + gregAvatar + ' Greg: 6-7 PM Central' + joinBtn
      });
    }
  }
}

events.sort((a, b) => {
  const dateA = new Date(2026, 8 + a.monthIndex, a.day);
  const dateB = new Date(2026, 8 + b.monthIndex, b.day);
  return dateA - dateB;
});

const getEventsForDate = (monthIndex, day) =>
  events.filter(e => e.monthIndex === monthIndex && e.day === day);

const calendarMonthDisplay = document.querySelector('#monthDisplay');
const calendarDaysContainer = document.querySelector('#calendarDays');
const calendarCard = document.querySelector('.calendar-card');

const renderCalendar = () => {
  const month = calendarState.months[calendarState.current];
  calendarMonthDisplay && (calendarMonthDisplay.textContent = month);

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (prevBtn) prevBtn.style.display = calendarState.current === SEPTEMBER ? 'none' : '';
  if (nextBtn) nextBtn.style.display = calendarState.current === DECEMBER ? 'none' : '';

  const firstDay = new Date(calendarState.year, 8 + calendarState.current, 1).getDay();
  const lastDay = new Date(calendarState.year, 8 + calendarState.current + 1, 0).getDate();

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const cells = dayLabels.map(d => html`<div class="day-label">${d}</div>`);

  for (let i = 0; i < firstDay; i++) cells.push('<div class="empty"></div>');
  for (let day = 1; day <= lastDay; day++) {
    const dayEvents = getEventsForDate(calendarState.current, day);
    const hasEvents = dayEvents.length > 0;
    cells.push(html`<div data-day="${day}" class="date-cell${hasEvents ? ' has-event' : ''}">${day}</div>`);
  }

  calendarDaysContainer && (calendarDaysContainer.innerHTML = cells.join(''));
};

const renderListView = () => {
  const upcomingEvents = events
    .map(e => ({ ...e, date: new Date(calendarState.year, 8 + e.monthIndex, e.day) }))
    .filter(e => e.date >= new Date(new Date().setHours(0,0,0,0)))
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

    if (isMobile) {
      return html`
        <div class="list-event-item" data-month="${e.monthIndex}" data-day="${e.day}">
          <div class="list-event-date">
            <span class="list-event-day">${dayName}</span>
            <span class="list-event-num">${e.day}</span>
            <span class="list-event-month">${monthName}</span>
          </div>
          <div class="list-event-info">
            <span class="list-event-title">${titleText}</span>
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

  if (prevMonthButton && calendarState.current > SEPTEMBER) {
    calendarState.current--;
    renderCalendar();
  }
  if (nextMonthButton && calendarState.current < DECEMBER) {
    calendarState.current++;
    renderCalendar();
  }
});

const viewToggle = document.getElementById('viewToggle');
viewToggle.checked = calendarState.view === 'list';

viewToggle?.addEventListener('change', () => {
  calendarState.view = viewToggle.checked ? 'list' : 'calendar';
  renderView();
});


