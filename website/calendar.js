const html = (strings, ...vals) =>
  strings.reduce((acc, s, i) => acc + s + (vals[i] ?? ''), '');

const calendarState = {
  months: ['September', 'October', 'November', 'December'],
  current: 0,
  year: 2026,
  view: 'list'
};

const events = [
  { monthIndex: 0, day: 29, title: 'Pro Dev and Staff meeting' },
  { monthIndex: 1, day: 13, title: 'Tutoring' },
  { monthIndex: 1, day: 20, title: 'Tutoring' },
  { monthIndex: 1, day: 27, title: 'Tutoring' },
  { monthIndex: 2, day: 10, title: 'Backend systems talk' },
  { monthIndex: 2, day: 17, title: 'Tutoring' },
  { monthIndex: 2, day: 19, title: 'Tutoring' },
  { monthIndex: 3, day: 3, title: 'Last talk' },
  { monthIndex: 3, day: 17, title: 'Year-End Celebration' }
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
  sharedTerminal?.classList.add('visible');
}

closeTerminalBtn?.addEventListener('click', () => sharedTerminal?.classList.remove('visible'));

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

/* ===== THEME ===== */

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
