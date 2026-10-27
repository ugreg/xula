const COMMANDS = [
  ['ls', 'list the current directory'],
  ['echo', 'print text back to the terminal'],
  ['cat', 'print the contents of a file'],
];

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

  const run = (raw) => {
    const [name] = raw.split(/\s+/);
    if (name === 'help') {
      COMMANDS.forEach(([cmd, desc]) => {
        const line = row('term-line');
        part(line, cmd, 'term-name');
        part(line, desc);
        part(line, 'under development...', 'term-wip');
      });
      return;
    }
    if (COMMANDS.some(([cmd]) => cmd === name)) return;
    part(row('term-line term-err'), `command not found: ${raw}`);
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

  reset.addEventListener('click', () => {
    out.textContent = '';
    input.value = '';
    body.scrollTop = 0;
  });
}

initTerminal();
