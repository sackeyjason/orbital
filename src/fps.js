let fpsUpdateDelay = 0;

export function updateFps(t) {
  fpsUpdateDelay += t;
  if (fpsUpdateDelay > 1000) {
    fpsUpdateDelay = 0;
    return Math.round(1 / (t / 1000));
  }
}

export function renderFps(ctx, fps) {
  // Draw number to the screen
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, 80, 32);
  ctx.font = '14px Arial';
  ctx.fillStyle = '#CCC';
  ctx.fillText('FPS: ' + fps, 10, 20);
}
