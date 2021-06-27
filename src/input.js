const keyMap = {
  37: "left",
  38: "rotateR",
  39: "right",
  40: "down",

  90: "rotateL",
  88: "rotateR",
  32: "hardDrop",

  13: "enter",
};

const input = {
  init: (el, events) => {
    el.addEventListener("keydown", (event) => {
      // console.log('event: ', event);
      const value = keyMap[event.keyCode];
      if (value) events.push(["input", value]);
    });
    el.querySelectorAll("button").forEach((button) => {
      button.addEventListener("touchstart", (event) => {
        events.push(["input", event.target.dataset.input]);
      });
    });
  },
};

export default input;
