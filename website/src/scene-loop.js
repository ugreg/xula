let animationFrameId = null;
let currentAnimateFn = null;

export function createSceneLoop(animateFn) {
  currentAnimateFn = animateFn;

  function loop() {
    animationFrameId = requestAnimationFrame(loop);
    if (currentAnimateFn) animateFn();
  }

  animationFrameId = requestAnimationFrame(loop);
}

export function stopAnimation() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  currentAnimateFn = null;
}
