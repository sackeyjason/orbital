import { timestamp } from './util';

function Plant(seed, data) {
  console.log('seed: ', seed);
  const wrapX = data.wrapX;
  var plantedAt = timestamp();
  var age = 0;
  // var { grid } = data;
  var b = { ...seed, type: 'plant', shape: null };
  var leaves = [];
  var growth = 0;
  var gps = 4;

  function moveLeaf(initLeaf) {
    var leaf = { ...initLeaf };
    if (leaf.angle === 0) leaf.y -= 1;
    if (leaf.angle === 1) leaf.x += 1;
    if (leaf.angle === 2) leaf.y += 1;
    if (leaf.angle === 3) leaf.x -= 1;
    leaf.x = wrapX(leaf.x);
    return leaf;
  }

  // check direction
  // direction plant down -> grow up
  leaves.push({ x: seed.x, y: seed.y, life: 3, angle: 0 });

  this.grow = (delta, grid) => {
    age += delta;
    switch (seed.name) {
      case 'castle': {
        if (age / (1000 / gps) > growth) {
          leaves.forEach((leaf) => {
            var mLeaf = moveLeaf(leaf);
            if (grid[mLeaf.y] && grid[mLeaf.y][mLeaf.x]) {
              // Collides - no move
            } else {
              leaf.x = mLeaf.x;
              leaf.y = mLeaf.y;
              if (grid[leaf.y]) grid[leaf.y][leaf.x] = { ...b };
              leaf.angle = (leaf.angle + 1) % 4;
              leaves.push({ ...leaf, angle: (leaf.angle + 2) % 4 });
            }
          });
          if (growth === 0) {
            const leaf = leaves[0];
            if (grid?.[leaf.y]?.[leaf.x + 1] && grid?.[leaf.y]?.[leaf.x - 1]) {
              // grow up
            } else {
              // grow sideways
              leaf.angle = 1;
              leaves.push({ ...leaf, angle: 3 });
            }
          }
          growth++;
          if (growth === 5) {
            this.finished = true;
          }
        }
        break;
      }
      case 'swamp':
        if (age / (1000 / gps) > growth) {
          leaves.forEach((leaf) => {
            if (grid[leaf.y + 1] && !grid[leaf.y + 1][leaf.x]) {
              // fall down
              leaf.angle = 2;
            }
            var mLeaf = moveLeaf(leaf);
            if (grid[mLeaf.y] && grid[mLeaf.y][mLeaf.x]) {
              // Collides - no move
            } else {
              leaf.x = mLeaf.x;
              leaf.y = mLeaf.y;
              if (grid[leaf.y]) grid[leaf.y][leaf.x] = { ...b };
            }
          });

          if (growth === 0) {
            // one left, one right
            const leaf = leaves[0];
            leaf.angle = 1;
            leaves.push({ ...leaf, angle: 3 });
          }

          growth++;
          if (growth > 7) {
            this.finished = true;
          }
        }

        break;
      default:
        break;
    }
  };
}

export { Plant };
