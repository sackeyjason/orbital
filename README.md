# Orbital

An action puzzle game. Inspired by Tetris, Starseed Pilgrim, and concave hollow Earth cosmogony. Work in progress.

[Play here in your browser!](https://sackeyjason.github.io/orbital/)

[I'm programming this on StackBlitz.](https://stackblitz.com/edit/orbital)

![screenshot](https://raw.githubusercontent.com/sackeyjason/orbital/master/screenshot.png)

## Dev log

### 2024 Feb 26 - reviving the project after a long pause

- There's been a regression. The settled shapes turn grey, but previously I had an enhancement whereby the shapes' colours got muted, desaturated, not completely greyed out, when placed.
  - I removed this because it had an external dependency, a colour library, and I removed that, since this isn't an npm project. There's no package manager. Just my code. I'll keep it this way for now.
  - Because: no build step. All this JS just runs in the browser.
- Officially open source - Zero-Clause BSD.
- Multiple shades of grey for blocks
- Faster starting speed
- reviewed and revised TODOs (see todo.md)
