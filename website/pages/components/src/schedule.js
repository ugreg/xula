export const MONTHS = ['September', 'October', 'November', 'December'];
export const START_MONTH = 8;

export const SEPTEMBER = 0;
const OCTOBER = 1;
const NOVEMBER = 2;
export const DECEMBER = 3;

const TERM_CLOSED_DAYS = {
  [OCTOBER]: [1, 20],
  [NOVEMBER]: [30]
};

const nthWeekday = (year, monthIndex, weekday, n) => {
  const first = new Date(year, monthIndex, 1);
  const firstOccurrence = 1 + (weekday - first.getDay() + 7) % 7;
  return new Date(year, monthIndex, firstOccurrence + (n - 1) * 7);
};

const buildClosedDays = (year) => {
  const out = new Set();
  Object.entries(TERM_CLOSED_DAYS).forEach(([monthIndex, days]) =>
    days.forEach(day => out.add(`${monthIndex}:${day}`))
  );
  const thanksgiving = nthWeekday(year, START_MONTH + NOVEMBER, 4, 4);
  for (let back = 3; back >= 0; back--) {
    const closed = new Date(thanksgiving);
    closed.setDate(thanksgiving.getDate() - back);
    out.add(`${NOVEMBER}:${closed.getDate()}`);
  }
  return out;
};

export const eventDate = (year, event) =>
  new Date(year, START_MONTH + event.monthIndex, event.day);

export const buildSchedule = (year) => {
  const closedDays = buildClosedDays(year);
  const isClosedDay = (monthIndex, day) => closedDays.has(`${monthIndex}:${day}`);

  const schedule = [
    { monthIndex: DECEMBER, day: 14, kind: 'special', title: 'G & G Landing the Internship' }
  ];

  for (let month = OCTOBER; month <= NOVEMBER; month++) {
    const daysInMonth = new Date(year, START_MONTH + month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      if (isClosedDay(month, day)) continue;

      const weekday = new Date(year, START_MONTH + month, day).getDay();
      let host = null;
      if (weekday === 2 || weekday === 4) host = 'Greg';
      else if (weekday === 3) host = 'Wes';
      if (!host) continue;

      schedule.push({ monthIndex: month, day, kind: 'tutoring', host });
    }
  }

  return schedule.sort((a, b) => eventDate(year, a) - eventDate(year, b));
};
