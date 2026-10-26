const format = (level, page, ...args) => {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const msg = args.join(' ');
  console.log(`${time} | ${level.padEnd(5)} page: ${page} msg: ${msg}`);
};

export const log = {
  info: (page, ...args) => format('info', page, ...args),
  warn: (page, ...args) => format('warn', page, ...args),
  error: (page, ...args) => format('error', page, ...args)
};
