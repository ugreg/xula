import { buildSchedule, eventDate } from './schedule.js?v=202610270717.fc7541fee80632fb33becc9e221f0e74ac9f8c04';

const COMMANDS = [
  ['events', 'print upcoming events'],
  ['refresh', 'clear the terminal'],
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const dayLabel = (date) =>
  `${DAY_NAMES[date.getDay()]} ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;

const plainTitle = (event) =>
  event.kind === 'special' ? event.title : `Tutoring with ${event.host}: 6-7 PM Central`;

function initTerminal() {
  const body = document.querySelector('[data-terminal-body]');
  const out = document.querySelector('[data-terminal-out]');
  const input = document.querySelector('[data-terminal-input]');
  const reset = document.querySelector('[data-terminal-reset]');
  if (!body || !out || !input || !reset) return;

  const row = (className) => {
    const el = document.createElement('div');
    if (className) el.className = className;
    out.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  };

  const part = (parent, text, className) => {
    const el = document.createElement('span');
    el.textContent = text;
    if (className) el.className = className;
    parent.appendChild(el);
    return el;
  };

  const printHelp = () => {
    COMMANDS.forEach(([cmd, desc]) => {
      const line = row('term-line');
      part(line, cmd, 'term-name');
      part(line, desc);
    });
  };

  const printEvents = () => {
    const year = new Date().getFullYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = buildSchedule(year).filter((e) => eventDate(year, e) >= today);
    if (!upcoming.length) {
      part(row('term-line'), 'no upcoming events');
      return;
    }

    upcoming.forEach((e) => {
      const line = row('term-line');
      part(line, dayLabel(eventDate(year, e)), 'term-name');
      part(line, plainTitle(e));
    });
  };

  const icon = reset.querySelector('img');

  icon?.addEventListener('animationend', () => icon.classList.remove('spinning'));

  const refresh = () => {
    if (icon) {
      icon.classList.remove('spinning');
      void icon.offsetWidth;
      icon.classList.add('spinning');
    }
    out.textContent = '';
    input.value = '';
    body.scrollTop = 0;
  };

  reset.addEventListener('click', refresh);

  const run = (raw) => {
    const [name] = raw.split(/\s+/);
    switch (name) {
      case 'help':
        printHelp();
        return;
      case 'events':
        printEvents();
        return;
      case 'refresh':
        refresh();
        return;
      default:
        part(row('term-line term-err'), `command not found: ${raw}`);
    }
  };

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const raw = input.value.trim();
    input.value = '';
    if (!raw) return;
    const line = row('term-line');
    part(line, '$', 'prompt-sign');
    part(line, raw);
    run(raw);
  });

}

initTerminal();
