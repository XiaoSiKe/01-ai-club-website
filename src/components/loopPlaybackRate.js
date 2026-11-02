// Ease only interaction changes; steady scrolling remains a compositor animation.
export function easeLoopPlaybackRate(animation, target, {
  requestFrame = requestAnimationFrame,
  cancelFrame = cancelAnimationFrame,
  now = () => performance.now(),
  duration = 180,
} = {}) {
  const from = animation.playbackRate;
  const start = now();
  let frame;
  const tick = time => {
    const progress = Math.min(1, Math.max(0, (time - start) / duration));
    const eased = progress * progress * (3 - 2 * progress);
    animation.updatePlaybackRate(from + (target - from) * eased);
    if (progress < 1) frame = requestFrame(tick);
  };
  frame = requestFrame(tick);
  return () => cancelFrame(frame);
}
