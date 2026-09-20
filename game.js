(() => {
  "use strict";
  const COLS = 10, ROWS = 20;
  const PIECES = {
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    J: [[1,0,0],[1,1,1],[0,0,0]], L: [[0,0,1],[1,1,1],[0,0,0]],
    O: [[1,1],[1,1]], S: [[0,1,1],[1,1,0],[0,0,0]],
    T: [[0,1,0],[1,1,1],[0,0,0]], Z: [[1,1,0],[0,1,1],[0,0,0]]
  };
  const boardElement = document.querySelector("#board");
  const nextElement = document.querySelector("#next-grid");
  const scoreElement = document.querySelector("#score");
  const highScoreElement = document.querySelector("#high-score");
  const levelElement = document.querySelector("#level");
  const linesElement = document.querySelector("#lines");
  const statusElement = document.querySelector("#status-message");
  const cells = [], nextCells = [];

  for (let i = 0; i < COLS * ROWS; i++) { const cell = document.createElement("div"); cell.className = "cell"; cell.setAttribute("role", "gridcell"); boardElement.appendChild(cell); cells.push(cell); }
  for (let i = 0; i < 16; i++) { const cell = document.createElement("div"); cell.className = "cell"; nextElement.appendChild(cell); nextCells.push(cell); }

  let board, current, nextType, score = 0;
  let highScore = Number(localStorage.getItem("brick-high-score") || 0);
  let lines = 0, level = 1, paused = false, powered = true, soundEnabled = true, gameOver = false;
  let lastTime = 0, dropTimer = 0;

  const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  const randomType = () => { const types = Object.keys(PIECES); return types[Math.floor(Math.random() * types.length)]; };
  const createPiece = type => ({ type, matrix: PIECES[type].map(row => [...row]), row: 0, col: Math.floor((COLS - PIECES[type][0].length) / 2) });

  function resetGame() { board = emptyBoard(); score = 0; lines = 0; level = 1; paused = false; gameOver = false; statusElement.hidden = true; nextType = randomType(); spawnPiece(); render(); }
  function spawnPiece() { current = createPiece(nextType); nextType = randomType(); if (collides(current, 0, 0, current.matrix)) { gameOver = true; statusElement.textContent = "GAME OVER"; statusElement.hidden = false; } }
  function collides(piece, rowOffset, colOffset, matrix) {
    for (let row = 0; row < matrix.length; row++) for (let col = 0; col < matrix[row].length; col++) {
      if (!matrix[row][col]) continue;
      const boardRow = piece.row + row + rowOffset, boardCol = piece.col + col + colOffset;
      if (boardCol < 0 || boardCol >= COLS || boardRow >= ROWS || (boardRow >= 0 && board[boardRow][boardCol])) return true;
    }
    return false;
  }
  function mergePiece() { current.matrix.forEach((row, ri) => row.forEach((value, ci) => { if (value && current.row + ri >= 0) board[current.row + ri][current.col + ci] = 1; })); }
  const rotateMatrix = matrix => matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]).reverse());
  function moveLeft() { if (canPlay() && !collides(current, 0, -1, current.matrix)) { current.col--; render(); } }
  function moveRight() { if (canPlay() && !collides(current, 0, 1, current.matrix)) { current.col++; render(); } }
  function softDrop() { if (!canPlay()) return; if (!collides(current, 1, 0, current.matrix)) { current.row++; score++; } else lockPiece(); render(); }
  function hardDrop() { if (!canPlay()) return; let distance = 0; while (!collides(current, 1, 0, current.matrix)) { current.row++; distance++; } score += distance * 2; lockPiece(); render(); }
  function rotate() { if (!canPlay()) return; const rotated = rotateMatrix(current.matrix); for (const offset of [0, -1, 1, -2, 2]) if (!collides(current, 0, offset, rotated)) { current.matrix = rotated; current.col += offset; render(); return; } }
  function lockPiece() { mergePiece(); clearLines(); spawnPiece(); dropTimer = 0; }
  function clearLines() { let cleared = 0; board = board.filter(row => { if (row.every(Boolean)) { cleared++; return false; } return true; }); while (board.length < ROWS) board.unshift(Array(COLS).fill(0)); if (cleared) { score += [0,100,300,500,800][cleared] * level; lines += cleared; level = Math.floor(lines / 10) + 1; } }
  const canPlay = () => powered && !paused && !gameOver;
  const dropInterval = () => Math.max(80, 850 - (level - 1) * 70);
  function update(time = 0) { const delta = time - lastTime; lastTime = time; if (canPlay()) { dropTimer += delta; if (dropTimer >= dropInterval()) { softDrop(); dropTimer = 0; } } requestAnimationFrame(update); }
  function drawCell(cell, filled, active = false) { cell.classList.toggle("filled", filled); cell.classList.toggle("active", active); }
  function render() {
    const visibleBoard = board.map(row => [...row]);
    if (current && !gameOver) current.matrix.forEach((row, ri) => row.forEach((value, ci) => { const br = current.row + ri, bc = current.col + ci; if (value && br >= 0 && br < ROWS && bc >= 0 && bc < COLS) visibleBoard[br][bc] = 2; }));
    visibleBoard.forEach((row, ri) => row.forEach((value, ci) => drawCell(cells[ri * COLS + ci], value > 0, value === 2)));
    nextCells.forEach(cell => drawCell(cell, false));
    const preview = PIECES[nextType], offsetRow = Math.floor((4 - preview.length) / 2), offsetCol = Math.floor((4 - preview[0].length) / 2);
    preview.forEach((row, ri) => row.forEach((value, ci) => { if (value) drawCell(nextCells[(offsetRow + ri) * 4 + offsetCol + ci], true); }));
    updateStats();
  }
  function updateStats() { scoreElement.textContent = String(score).padStart(6, "0"); highScoreElement.textContent = String(highScore).padStart(6, "0"); levelElement.textContent = String(level).padStart(2, "0"); linesElement.textContent = String(lines).padStart(3, "0"); if (score > highScore) { highScore = score; localStorage.setItem("brick-high-score", String(highScore)); } }
  function togglePause() { if (!powered || gameOver) return; paused = !paused; statusElement.textContent = paused ? "PAUSED" : ""; statusElement.hidden = !paused; }
  function togglePower() { powered = !powered; if (!powered) { paused = true; statusElement.textContent = "POWER OFF"; statusElement.hidden = false; } else resetGame(); }
  function toggleSound() { soundEnabled = !soundEnabled; document.querySelector('[data-action="sound"]').textContent = soundEnabled ? "SOUND" : "MUTE"; }

  window.BrickGame = { reset: resetGame, power: togglePower, sound: toggleSound, pause: togglePause, left: moveLeft, right: moveRight, softDrop, hardDrop, rotate };
  resetGame();
  requestAnimationFrame(update);
})();
