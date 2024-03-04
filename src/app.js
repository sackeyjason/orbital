import { updateFps, renderFps } from './fps.js';
// import memoize from "lodash.memoize";
import input from './input.js';
import {
  start,
  getWrapX,
  getPieceGridCoords,
  doesCollide,
  spawn,
  getNext,
  removeLines,
  calculatePoints,
  tryRotate,
  getColour,
  getCompleteLines,
} from './game.js';
import { getCircleToGrid, getAngle } from './geometry.js';
// import h from "hyperscript";
import { Plant, explode } from './plant.js';
import { timestamp } from './util.js';

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;
const GRID_WIDTH = 32;
const GRID_HEIGHT = 14;
const VOID_RADIUS = 16;
const CRUST_THICKNESS = 16;
const SCREEN_CENTRE = [(SCREEN_WIDTH - 1) / 2, (SCREEN_HEIGHT - 1) / 2];
const ACTIVE_RADIUS = SCREEN_HEIGHT / 2 - (VOID_RADIUS + CRUST_THICKNESS);

let circleRadius = SCREEN_HEIGHT - 1 * CRUST_THICKNESS;
const circle = {
  x: (SCREEN_WIDTH - circleRadius) / 2,
  y: CRUST_THICKNESS,
  bottom: SCREEN_HEIGHT - CRUST_THICKNESS,
  w: (SCREEN_WIDTH - circleRadius) / 2 + circleRadius,
};
let ctx;
const events = [];

const modeSelector = {};

let clearing = null;
let piece = null;
let mainMenu = true;
let round = null;
let plant = null;
let bombs = [];

const wrapX = getWrapX(GRID_WIDTH);

const grid = new Array(GRID_HEIGHT).fill(null).map(() => {
  return new Array(GRID_WIDTH).fill(0);
});
let grid2;

function clearGrid() {
  grid.forEach((row) => {
    row.fill(0);
  });
}

function gridLookup(x, y) {
  return grid[y] && grid[y][x];
}
// let lookup = memoize(gridLookup, (x, y) => `${x},${y}`);

const getGridCoords = getCircleToGrid({
  GRID_WIDTH,
  GRID_HEIGHT,
  VOID_RADIUS,
  ACTIVE_RADIUS,
});

function renderGrid(grid) {
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  let pixelHeight = 2;

  let hue = 0;
  if (modeSelector.mode === 'colour') {
    hue = (dotX / GRID_WIDTH) * 360;
    ctx.fillStyle = `hsla(${hue}deg, 100%, 80%, 1.0)`;
  } else if (modeSelector.mode === 'nuts') {
    hue = (dotX / (GRID_WIDTH / 20)) * 360;
    ctx.fillStyle = `hsla(${hue}deg, 100%, 80%, 1.0)`;
  } else if (modeSelector.mode === 'vcr') {
    ctx.fillStyle = `rgb(10,250,100)`;
    pixelHeight = 1;
  } else {
    ctx.fillStyle = `rgb(200,200,200)`;
  }

  const xCentre = SCREEN_CENTRE[0];
  const yCentre = SCREEN_CENTRE[1];

  // for each pixel
  for (let y = circle.y; y < circle.bottom; y += 2) {
    for (let x = circle.x; x < circle.w; x += 2) {
      const dx = x - xCentre;
      const dy = y - yCentre;

      const radius = Math.sqrt(dx ** 2 + dy ** 2);
      const angle = getAngle(dx, dy);

      const [gridX, gridY] = getGridCoords(angle, radius);

      let fuzz = 0;
      if (modeSelector.mode === 'fuzzy') {
        fuzz = Math.random() * 3 - 1.5;
      } else if (modeSelector.mode === 'nuts') {
        fuzz = Math.random() * 6 - 3;
      }
      if (shock) fuzz = Math.random() * shock - shock / 2;

      // if (gridLookup(gridX, gridY)) {
      // if (lookup(gridX, gridY)) {
      if (grid[gridY] && grid[gridY][gridX]) {
        const cell = grid[gridY][gridX];
        const hasShape = cell.shape;
        const clearingRow = cell === 3;
        if (modeSelector.mode === 'colour' || modeSelector.mode === 'nuts') {
          let hue2 = (hue + (angle / (2 * Math.PI)) * 360) % 360;
          ctx.fillStyle = `hsla(${hue2}deg, 100%, 80%, 1.0)`;
        } else {
          if (hasShape) {
            ctx.fillStyle = getColour(cell);
          } else if (clearingRow) {
            fuzz = Math.random() * 3 - 1.5;
            let hue2 = (hue + (angle / (2 * Math.PI)) * 360) % 360;
            ctx.fillStyle = `hsla(${hue2}deg, 100%, 80%, 1.0)`;
          } else {
            ctx.fillStyle = cell.colour || `rgb(200,200,200)`;
          }
        }
        ctx.fillRect(x, y, 2 + fuzz, pixelHeight + fuzz);
      }
    }
  }
  // lookup.cache.clear();
}

function getClickHandler() {
  return function handleClick(e) {
    const startedAt = timestamp();
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left; //x position within the element.
    var y = e.clientY - rect.top; //y position within the element.

    var scale = SCREEN_WIDTH / rect.width;

    x = x * scale;
    y = y * scale;

    const dx = x - SCREEN_CENTRE[0];
    const dy = y - SCREEN_CENTRE[1];

    const radius = Math.sqrt(dx ** 2 + dy ** 2);
    const angle = getAngle(dx, dy);

    const [gridX, gridY] = getGridCoords(angle, radius);
    grid[gridY] && (grid[gridY][gridX] = 1);
  };
}

function lockPieceIn() {
  if (piece.type === 'seed') {
    // Check appropriate soil condition
    // ~~Plant down~~
    // piece.y = piece.y + 1;
    plant = new Plant(piece, { wrapX });
  } else {
    getPieceGridCoords(piece, grid).forEach(([x, y]) => {
      if (grid[y]) grid[y][x] = { colour: getColour(piece, { dim: true }) };
    });
  }
  piece = null;
}

function newGame() {
  round = new start();
  console.log('round: ', round);
  clearGrid();
  mainMenu = false;
  const menuEl = document.querySelector('.main-menu');
  menuEl.parentElement.removeChild(menuEl);
}

let shock = 0;
let shockDecay = 0.1;

function processEvent(event) {
  const { eventType, data } = event;
  // console.log(event);
  if (event[0] === 'input') {
    if (event[1] === 'enter') {
      if (mainMenu) {
        newGame();
        return;
      }
    }
    if (piece && !mainMenu) {
      switch (event[1]) {
        case 'left':
          if (doesCollide({ ...piece, x: wrapX(piece.x + 1) }, grid)) {
            // clunk
          } else {
            piece.x = wrapX(piece.x + 1);
          }
          break;
        case 'right':
          if (doesCollide({ ...piece, x: wrapX(piece.x - 1) }, grid)) {
            // clonk
          } else {
            piece.x = wrapX(piece.x - 1);
          }
          break;
        case 'down':
          if (doesCollide({ ...piece, y: piece.y + 1 }, grid)) {
            lockPieceIn();
          } else {
            piece.y += 1;
          }
          break;
        case 'rotateR':
          //piece.angle = (piece.angle + 1) % 4;
          piece.rotation = 1;
          break;
        case 'rotateL':
          piece.rotation = -1;
          // piece.angle = piece.angle - 1;
          // if (piece.angle < 0) piece.angle = 3;
          break;
        default:
          break;
      }
    }
  } else if (event[0] === 'clear') {
  } else if (event[0] === 'newBomb') {
    const data = event[1];
    bombs.push({ ...data, timer: 0 });
  } else if (event[0] === 'explodeBomb') {
    const { bomb, wrapX } = event[1];
    explode(bomb.x, bomb.y, grid, wrapX);
  }
}

let startTime;
let dotX = 0;
const speed = 2 / 30 / 32;
let fps;
// Gravity
let fallingSpeed = 0.0015;

function update(t) {
  while (events.length) {
    let event = events.shift();
    processEvent(event);
  }
  fps = updateFps(t) || fps;
  dotX = wrapX(dotX + speed * t);

  shock = Math.max(0, shock - shockDecay * t);

  grid2 = grid.map((line) => line.slice());

  if (piece) {
    piece.falling += t * fallingSpeed;
    if (piece.falling > piece.fallNext) {
      piece.fallNext++;
      if (doesCollide({ ...piece, y: piece.y + 1 }, grid)) {
        lockPieceIn();
        return;
      } else {
        piece.y += 1;
      }
    }
    if (piece.rotation && piece.type !== 'o') {
      // basic attempt
      const pieceRotated = {
        ...piece,
        rotation: 0,
        rotatedFrom: piece.angle,
        angle: { '-1': 3, 0: 0, 1: 1, 2: 2, 3: 3, 4: 0 }[
          piece.angle + piece.rotation
        ],
      };
      const rotateAttempt = tryRotate(pieceRotated, grid);
      piece = rotateAttempt || piece;
      piece.rotation = 0;
    }

    const pieceCoords = getPieceGridCoords(piece, grid);
    pieceCoords.forEach(([x, y]) => {
      if (y < 0) return;
      if (grid2[y]) grid2[y][x] = piece;
    });
  } else if (clearing) {
    // animating
    if (timestamp() - clearing.at >= 500) {
      removeLines(clearing.lines, grid);
      grid2 = grid;
      clearing = null;
    }
  } else if (plant) {
    plant.grow(t, grid);
    if (plant.finished) {
      if ((plant.name = 'bomb')) {
        const { x, y } = plant;
        events.push(['newBomb', { x, y }]);
      }
      plant = null;
    }
  } else {
    bombs.forEach((bomb) => {
      ++bomb.timer;
      if (bomb.timer > 2) {
        events.push(['explodeBomb', { bomb, wrapX }]);
      }
      bombs = bombs.filter((bomb) => bomb.timer <= 2);
    });
    const completeLines = getCompleteLines(grid);
    if (completeLines.length) {
      clearing = {
        lines: completeLines,
        at: timestamp(),
      };
      const level = round.level;
      const pointsAwarded = calculatePoints(completeLines.length, {
        level,
        lastPiece: null,
      });

      // check level
      // check last piece to detect T-spins, room to manoeuvre
      round.addScore(pointsAwarded);
    } else if (!mainMenu) {
      piece = spawn();
      if (doesCollide(piece, grid)) {
        // GAME OVER
        // high score?
        piece = null;
        showMainMenu('GAME OVER', { lastScore: round.score });
      }
    }
  }
}

function showMainMenu(message, etc) {
  mainMenu = true;
  const html_ = `<div class="main-menu">
    <div><h1>Orbital</h1></div>
    <nav><div>Hit Enter/Tap to start</div></nav>
    ${etc && `<div class="lastScore">${etc.lastScore}</div>`}
  </div>`;
  const container = document.createElement('div');
  container.innerHTML = html_;
  const menuScreen = container.children[0];
  // const menuScreen = h("div.main-menu", [
  //   h("div", [h("h1", "Orbital"), h("h2", "Radial Matrix")]),
  //   h("nav", h("div", "Hit Enter/Tap to start")),
  //   etc && h("div.lastScore", etc.lastScore),
  // ]);
  document.querySelector('body').appendChild(menuScreen);
}

function render() {
  renderGrid(grid2);
  renderFps(ctx, fps);
}

let last = timestamp();

function step() {
  let now = timestamp();
  if (startTime === undefined) startTime = now;
  const elapsed = now - startTime;
  let dt = Math.min(1000, now - last);
  update(dt);
  render();
  last = now;
  window.requestAnimationFrame(step);
}

function init() {
  console.log('init', Date.now());
  view.setAttribute('width', SCREEN_WIDTH);
  view.setAttribute('height', SCREEN_HEIGHT);
  ctx = view.getContext('2d');
  // modeSelector.init();
  input.init(document, events);
  // view.addEventListener('click', getClickHandler());
  document.addEventListener('click', () => events.push(['input', 'enter']));

  console.log(getNext());
  showMainMenu();
  step();
}

export default init;
