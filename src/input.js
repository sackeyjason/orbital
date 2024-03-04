const keyMap = {
  // arrow keys
  37: 'left',
  38: 'rotateR',
  39: 'right',
  40: 'down',

  // hjkl - vim keys
  72: 'left',
  74: 'down',
  75: 'rotateR',
  76: 'right',

  // wasd
  65: 'left',
  83: 'down',
  87: 'rotateR',
  68: 'right',

  90: 'rotateL',
  88: 'rotateR',
  32: 'hardDrop',

  13: 'enter',
};

const swipey = {
  down: false,
  x: 0,
  y: 0,
  contactX: 0,
  contactY: 0,
};

// Touchscreen: virtual joystick
const TOUCH_DEADZONE = 50;

// or virtual scrollwheel?

const input = {
  init: (el, events) => {
    // Keyboard input
    el.addEventListener('keydown', (event) => {
      // if (event.repeat) return;
      const value = keyMap[event.keyCode];
      if (value) events.push(['input', value]);
    });

    // Onscreen buttons - removed/deprecated
    // option to restore?
    el.querySelectorAll('button').forEach((button) => {
      button.addEventListener('touchstart', (event) => {
        events.push(['input', event.target.dataset.input]);
      });
    });

    // Touch/mouse/pointer swiping
    el.addEventListener('pointerdown', (event) => {
      swipey.contactX = event.clientX;
      swipey.contactY = event.clientY;
      swipey.x = event.clientX;
      swipey.y = event.clientY;
      swipey.down = true;
    });

    el.addEventListener('pointermove', (event) => {
      if (swipey.down) {
        swipey.x = event.clientX;
        swipey.y = event.clientY;

        const moved = [swipey.x - swipey.contactX, swipey.y - swipey.contactY];

        const [xMoved, yMoved] = moved;

        if (Math.abs(xMoved)) {
          if (xMoved > 0) {
            events.push(['input', 'right']);
          } else {
            events.push(['input', 'left']);
          }
        }

        console.log({ xMoved, yMoved });
      }
    });

    el.addEventListener('pointerup', (_event) => {
      console.log(swipey);
      swipey.down = false;
    });
  },
};

export default input;
