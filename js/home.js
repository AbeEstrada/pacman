var HOME = false;

function initHome() {
  HOME = true;

  GAMEOVER = false;
  LOCK = false;
  PACMAN_DEAD = false;

  document.querySelector("#panel").hidden = true;
  document.querySelector("#home").hidden = false;

  document.getElementById("start").addEventListener("click", function () {
    initGame(true);
  });
}

window.addEventListener("load", function () {
  initHome();
});
