var PAUSE = false;
var LOCK = false;

var HIGHSCORE = 1000;
var SCORE = 0;
var SCORE_BUBBLE = 10;
var SCORE_SUPER_BUBBLE = 50;
var SCORE_GHOST_COMBO = 200;

var LIFES = 2;
var GAMEOVER = false;

var LEVEL = 1;
var LEVEL_NEXT_TIMER = -1;
var LEVEL_NEXT_STATE = 0;

var TIME_GENERAL_TIMER = -1;
var TIME_GAME = 0;
var TIME_LEVEL = 0;
var TIME_LIFE = 0;
var TIME_FRUITS = 0;

function initGame(newgame) {
  if (newgame) {
    HOME = false;
    GAMEOVER = false;

    score(0);
    clearMessage();

    document.querySelector("#panel").hidden = false;
    document.querySelector("#home").hidden = true;

    initSwipe();
  }

  initBoard();
  drawBoard();
  drawBoardDoor();

  initPaths();
  drawPaths();

  initBubbles();
  drawBubbles();

  initFruits();

  initPacman();
  drawPacman();

  initGhosts();
  drawGhosts();

  lifes();

  ready();
}

function win() {
  LOCK = true;
  stopPacman();
  stopGhosts();
  stopBlinkSuperBubbles();
  stopTimes();

  eraseGhosts();

  setTimeout("prepareNextLevel()", 1000);
}
function prepareNextLevel(i) {
  if (LEVEL_NEXT_TIMER === -1) {
    eraseBoardDoor();
    LEVEL_NEXT_TIMER = setInterval("prepareNextLevel()", 250);
  } else {
    LEVEL_NEXT_STATE++;
    drawBoard(LEVEL_NEXT_STATE % 2 === 0);

    if (LEVEL_NEXT_STATE > 6) {
      LEVEL_NEXT_STATE = 0;
      clearInterval(LEVEL_NEXT_TIMER);
      LEVEL_NEXT_TIMER = -1;
      nextLevel();
    }
  }
}
function nextLevel() {
  LOCK = false;

  LEVEL++;
  document.querySelector("#score h2").innerHTML = LEVEL + " Score";

  erasePacman();
  eraseGhosts();

  resetPacman();
  resetGhosts();

  initGame();

  TIME_LEVEL = 0;
  TIME_LIFE = 0;
  TIME_FRUITS = 0;
}

function retry() {
  stopTimes();

  erasePacman();
  eraseGhosts();

  resetPacman();
  resetGhosts();

  drawPacman();
  drawGhosts();

  TIME_LIFE = 0;
  TIME_FRUITS = 0;

  ready();
}

function ready() {
  LOCK = true;
  message("ready!");
  setTimeout("go()", "4100");
}
function go() {
  LOCK = false;

  startTimes();

  clearMessage();
  blinkSuperBubbles();

  movePacman();

  moveGhosts();
}
function startTimes() {
  if (TIME_GENERAL_TIMER === -1) {
    TIME_GENERAL_TIMER = setInterval("times()", 1000);
  }
}
function times() {
  TIME_GAME++;
  TIME_LEVEL++;
  TIME_LIFE++;
  TIME_FRUITS++;

  fruit();
}
function pauseTimes() {
  if (TIME_GENERAL_TIMER != -1) {
    clearInterval(TIME_GENERAL_TIMER);
    TIME_GENERAL_TIMER = -1;
  }
  if (FRUIT_CANCEL_TIMER != null) FRUIT_CANCEL_TIMER.pause();
}
function resumeTimes() {
  startTimes();
  if (FRUIT_CANCEL_TIMER != null) FRUIT_CANCEL_TIMER.resume();
}
function stopTimes() {
  if (TIME_GENERAL_TIMER != -1) {
    clearInterval(TIME_GENERAL_TIMER);
    TIME_GENERAL_TIMER = -1;
  }
  if (FRUIT_CANCEL_TIMER != null) {
    FRUIT_CANCEL_TIMER.cancel();
    FRUIT_CANCEL_TIMER = null;
    eraseFruit();
  }
}

function pauseGame() {
  if (!PAUSE) {
    PAUSE = true;

    message("pause");

    pauseTimes();
    pausePacman();
    pauseGhosts();
    stopBlinkSuperBubbles();
  }
}
function resumeGame() {
  if (PAUSE) {
    PAUSE = false;

    clearMessage();

    resumeTimes();
    resumePacman();
    resumeGhosts();
    blinkSuperBubbles();
  }
}

function lifes(l) {
  if (l) {
    LIFES += l;
  }

  var canvas = document.getElementById("canvas-lifes");
  canvas.setAttribute("width", "120");
  canvas.setAttribute("height", "30");
  if (canvas.getContext) {
    var ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, 120, 30);
    ctx.fillStyle = "#fff200";
    for (var i = 0, imax = LIFES; i < imax && i < 4; i++) {
      ctx.beginPath();

      var lineToX = 13;
      var lineToY = 15;

      ctx.arc(lineToX + i * 30, lineToY, 13, (1.35 - 3 * 0.05) * Math.PI, (0.65 + 3 * 0.05) * Math.PI, false);
      ctx.lineTo(lineToX + i * 30 + 4, lineToY);
      ctx.fill();
      ctx.closePath();
    }
  }
}

function gameover() {
  GAMEOVER = true;
  message("game over");
  stopTimes();

  erasePacman();
  eraseGhosts();

  resetPacman();
  resetGhosts();

  TIME_GAME = 0;
  TIME_LEVEL = 0;
  TIME_LIFE = 0;
  TIME_FRUITS = 0;

  LIFES = 2;
  LEVEL = 1;
  SCORE = 0;
}

function message(m) {
  var messageEl = document.querySelector("#message");
  messageEl.innerHTML = m;
  if (m === "game over") messageEl.classList.add("red");
}
function clearMessage() {
  var messageEl = document.querySelector("#message");
  messageEl.innerHTML = "";
  messageEl.classList.remove("red");
}

function score(s, type) {
  var scoreBefore = (SCORE / 10000) | 0;

  SCORE += s;
  document.querySelector("#score span").innerHTML = SCORE === 0 ? "00" : SCORE;

  var scoreAfter = (SCORE / 10000) | 0;
  if (scoreAfter > scoreBefore) {
    lifes(+1);
  }

  if (SCORE > HIGHSCORE) {
    HIGHSCORE = SCORE;
    document.querySelector("#highscore span").innerHTML = HIGHSCORE === 0 ? "00" : HIGHSCORE;
  }

  if (type && (type === "clyde" || type === "pinky" || type === "inky" || type === "blinky")) {
    erasePacman();
    eraseGhost(type);
    document
      .querySelector("#board")
      .insertAdjacentHTML("beforeend", '<span class="combo">' + SCORE_GHOST_COMBO + "</span>");
    document.querySelectorAll("#board span.combo").forEach(function (combo) {
      combo.style.top = eval("GHOST_" + type.toUpperCase() + "_POSITION_Y - 10") + "px";
      combo.style.left = eval("GHOST_" + type.toUpperCase() + "_POSITION_X - 10") + "px";
    });
    SCORE_GHOST_COMBO = SCORE_GHOST_COMBO * 2;
  } else if (type && type === "fruit") {
    document.querySelector("#board").insertAdjacentHTML("beforeend", '<span class="fruits">' + s + "</span>");
    document.querySelectorAll("#board span.fruits").forEach(function (fruit) {
      fruit.style.top = FRUITS_POSITION_Y - 14 + "px";
      fruit.style.left = FRUITS_POSITION_X - 14 + "px";
    });
  }
}
