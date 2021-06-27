export const getCircleToGrid = ({
  GRID_WIDTH,
  GRID_HEIGHT,
  VOID_RADIUS,
  ACTIVE_RADIUS,
}) =>
  function getGridCoords(angle, radius) {
    const gridX = Math.floor((angle / (2 * Math.PI)) * GRID_WIDTH);
    const gridY = Math.floor(
      ((radius - VOID_RADIUS) / ACTIVE_RADIUS) * GRID_HEIGHT
    );
    return [gridX, gridY];
  };

const halfPi = Math.PI / 2;
/**
 * Get angle from top, clockwise, positive
 * @param {number} x
 * @param {number} y
 */
export function getAngle(x, y) {
  // reorient from top
  let angle = Math.atan(y / x) + halfPi;
  // flip around left-oriented angles
  if (x < 0) angle += Math.PI;
  return angle;
}
