const ticks = new Set();
let frameId = null;

function frame() {
  for (const fn of ticks) fn();
  frameId = ticks.size ? requestAnimationFrame(frame) : null;
}

export function onTick(fn) {
  ticks.add(fn);
  if (frameId === null) frameId = requestAnimationFrame(frame);
  return () => {
    ticks.delete(fn);
    if (!ticks.size && frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  };
}
