// import Color from 'https://cdn.skypack.dev/color';
import {
  pieces,
  seeds,
  OTHER_WALLKICK_DATA,
  I_WALLKICK_DATA,
} from './game_data.js';
import shuffle from './shuffle.js';
// var Color = require('color');

const DEFAULT_OPTIONS = {
  screenWidth: 640,
  screenHeight: 480,
  gridWidth: 32,
  gridHeight: 20,
  voidRadius: 16,
  crustThickness: 16,
};

const queue = [];

export function getWrapX(GRID_WIDTH) {
  return function wrapX(x) {
    if (x >= GRID_WIDTH) return x % GRID_WIDTH;
    if (x < 0) return wrapX(GRID_WIDTH + x);
    return x;
  };
}

export function getPieceGridCoords(piece, grid) {
  // console.log('grid: ', grid[0]);
  const wrapX = getWrapX(grid[0].length);
  let coords = [];

  piece.shape.forEach((line, y) => {
    line.forEach((block, x) => {
      if (block) {
        coords.push([x + piece.x, y + piece.y]);
      }
    });
  });

  coords = coords.map(([x, y]) => {
    if (piece.angle === 0) return [wrapX(x), y];
    let xTranslation = piece.x + piece.centre[0];
    let yTranslation = piece.y + piece.centre[1];
    let _x = x - xTranslation;
    let _y = y - yTranslation;

    if (piece.angle === 1) {
      [_x, _y] = [_y, -_x];
    } else if (piece.angle === 2) {
      [_x, _y] = [-_x, -_y];
    } else if (piece.angle === 3) {
      [_x, _y] = [-_y, _x];
    }

    _x += xTranslation;
    _y += yTranslation;
    return [wrapX(_x), _y];
  });

  return coords;
}

// use getPieceGridCoords
export function doesCollide(piece, grid) {
  const coords = getPieceGridCoords(piece, grid);
  let collides;
  coords.forEach(([x, y]) => {
    if (y >= grid.length) collides = true;
    if (grid[y] && grid[y][x]) {
      collides = true;
    }
  });
  return collides;
}

export function spawn() {
  const next = getNext();
  queue.shift();
  if (next.type === 'seed') {
    console.log('next: ', next);
    return {
      ...next,
      x: 14,
      y: 0,
      type: 'seed',
      angle: 0,
      falling: 0,
      fallNext: 1,
      shape: [[1]],
      centre: [0, 0],
    };
  } else {
    const piece = {
      x: 14,
      y: 0,
      type: next,
      angle: 0,
      falling: 0,
      fallNext: 1,
      shape: pieces[next].shape,
      centre: pieces[next].centre,
    };
    return piece;
  }
}

const TEST_SEED = false;
// const TEST_SEED = 'bomb';

function replenishQueue() {
  let pieceTypes = Object.keys(pieces);

  if (TEST_SEED) {
    const thatSeed = seeds.find((seed) => seed.name === TEST_SEED);
    if (!thatSeed) throw 'No seed ' + TEST_SEED;
    for (let i = 0; i < 7; ++i) {
      pieceTypes.push({ type: 'seed', ...thatSeed });
    }
  }

  pieceTypes.push({
    type: 'seed',
    ...seeds[Math.floor(Math.random() * seeds.length)],
  });
  shuffle(pieceTypes);
  console.log(pieceTypes);
  queue.push(...pieceTypes);
}

export function getNext() {
  if (queue.length === 0) replenishQueue();
  return queue[0];
}

export function removeLines(lines, grid) {
  lines.reverse().forEach((y) => {
    grid.splice(y, 1);
  });
  for (let i = 0; i < lines.length; i++) {
    let newEmptyRow = new Array(32).fill(0);
    grid.unshift(newEmptyRow);
  }
}

export function calculatePoints(lines, etc) {
  if (lines === 1) {
    return 100;
  } else if (lines === 2) {
    return 300;
  } else if (lines === 3) {
    return 500;
  } else {
    // TETRIS
    return 800;
  }
}

export function start() {
  this.score = 0;
  this.lines = 0;
  this.level = 1;

  this.addScore = (points) => {
    this.score += points;
  };

  /**
   * Awarn points, increase linecount and level
   * @param {*} linesCleared
   * @param {*} etc
   */
  this.awardPoints = (linesCleared, etc) => {
    const points = calculatePoints(linesCleared, etc);
    this.score += points;
    this.lines += linesCleared;
  };
}

export function tryRotate(piece, grid) {
  console.log('piece: ', piece);
  const wrapX = getWrapX(grid[0].length);
  let data = piece.type === 'i' ? I_WALLKICK_DATA : OTHER_WALLKICK_DATA;
  let sequence = data[`${piece.rotatedFrom}${piece.angle}`];
  console.log('sequence: ', sequence);
  for (let i = 0; i < sequence.length; i++) {
    let d = sequence[i];
    console.log('d: ', d);
    let shiftedPiece = {
      ...piece,
      x: wrapX(piece.x - d[0]), // mirror x axis
      y: piece.y - d[1],
    };
    if (!doesCollide(shiftedPiece, grid)) {
      return shiftedPiece;
    }
  }
}

Object.keys(pieces).forEach((pKey) => {
  var p = pieces[pKey];
  // var colour = Color(p.colour);
  // p.dimmed = colour.desaturate(0.75).string();
  p.dimmed = '#777';
});

export function getColour(piece, opts = {}) {
  if (piece.colour) return piece.colour;
  const archetype = pieces[piece.type];
  if (archetype) {
    return opts.dim ? archetype.dimmed : archetype.colour;
  } else {
    return 'gray';
  }
}

export function getCompleteLines(grid) {
  const completeLines = [];
  grid.forEach((line, y) => {
    if (line.find((block) => block === 0) === undefined) {
      completeLines.push(y);
      grid[y].fill(3);
    }
  });
  return completeLines;
}
