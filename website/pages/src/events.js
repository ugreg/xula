const card = document.getElementById('sharedTerminal');
const close = document.getElementById('closeTerminal');

// nothing adds .visible yet, so the card stays hidden until a trigger exists
close?.addEventListener('click', () => card?.classList.remove('visible'));
