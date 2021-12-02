// https://github.com/masonicGIT/pacman

var isHomeState = function () {
  return HOME;
};
var isPlayState = function () {
  return !HOME && !PAUSE && !PACMAN_DEAD && !LOCK;
};
var canPause = function () {
  return !HOME && !PACMAN_DEAD && !LOCK;
};

(function () {
  // A Key Listener class (each key maps to an array of callbacks)
  var KeyEventListener = function () {
    this.listeners = {};
  };
  KeyEventListener.prototype = {
    add: function (key, callback, isActive) {
      this.listeners[key] = this.listeners[key] || [];
      this.listeners[key].push({
        isActive: isActive,
        callback: callback,
      });
    },
    exec: function (key, e) {
      var keyListeners = this.listeners[key];
      if (!keyListeners) {
        return;
      }
      var i, l;
      var numListeners = keyListeners.length;
      for (i = 0; i < numListeners; i++) {
        l = keyListeners[i];
        if (!l.isActive || l.isActive()) {
          e.preventDefault();
          if (l.callback()) {
            // Do not propagate keys if returns true
            break;
          }
        }
      }
    },
  };

  // Declare key event listeners
  var keyDownListeners = new KeyEventListener();
  var keyUpListeners = new KeyEventListener();

  // Helper functions for adding custom key listeners
  var addKeyDown = function (key, callback, isActive) {
    keyDownListeners.add(key, callback, isActive);
  };
  var addKeyUp = function (key, callback, isActive) {
    keyUpListeners.add(key, callback, isActive);
  };

  // Boolean states of each key
  var keyStates = {};

  // Hook my key listeners to the window's listeners
  window.addEventListener("keydown", function (e) {
    var key = (e || window.event).keyCode;
    // Only execute at first press event
    if (!keyStates[key]) {
      keyStates[key] = true;
      keyDownListeners.exec(key, e);
    }
  });
  window.addEventListener("keyup", function (e) {
    var key = (e || window.event).keyCode;
    keyStates[key] = false;
    keyUpListeners.exec(key, e);
  });

  // Key enumerations

  var KEY_ENTER = 13;
  var KEY_ESC = 27;

  var KEY_LEFT = 37;
  var KEY_RIGHT = 39;
  var KEY_UP = 38;
  var KEY_DOWN = 40;

  var KEY_P = 80;

  addKeyDown(
    KEY_ESC,
    function () {
      initGame(true);
    },
    isHomeState
  );
  addKeyDown(
    KEY_ENTER,
    function () {
      initGame(true);
    },
    isHomeState
  );

  addKeyDown(
    KEY_RIGHT,
    function () {
      movePacman(1);
    },
    isPlayState
  );
  addKeyDown(
    KEY_DOWN,
    function () {
      movePacman(2);
    },
    isPlayState
  );
  addKeyDown(
    KEY_LEFT,
    function () {
      movePacman(3);
    },
    isPlayState
  );
  addKeyDown(
    KEY_UP,
    function () {
      movePacman(4);
    },
    isPlayState
  );

  addKeyDown(
    KEY_P,
    function () {
      PAUSE ? resumeGame() : pauseGame();
    },
    canPause
  );
})();

var initSwipe = function () {
  // Position of anchor
  var x = 0;
  var y = 0;

  // Current distance from anchor
  var dx = 0;
  var dy = 0;

  // Minimum distance from anchor before direction is registered
  var r = 4;

  var touchStart = function (event) {
    event.preventDefault();
    var fingerCount = event.touches.length;
    if (fingerCount == 1) {
      // Commit new anchor
      x = event.touches[0].pageX;
      y = event.touches[0].pageY;
    } else {
      touchCancel(event);
    }
  };

  var touchMove = function (event) {
    event.preventDefault();
    var fingerCount = event.touches.length;
    if (fingerCount == 1 && isPlayState()) {
      // Get current distance from anchor
      dx = event.touches[0].pageX - x;
      dy = event.touches[0].pageY - y;

      // If minimum move distance is reached
      if (dx * dx + dy * dy >= r * r) {
        // Commit new anchor
        x += dx;
        y += dy;

        // Register direction
        if (Math.abs(dx) >= Math.abs(dy)) {
          // Left | Right
          dx > 0 ? movePacman(1) : movePacman(3);
        } else {
          // Down | Top
          dy > 0 ? movePacman(2) : movePacman(4);
        }
      }
    } else {
      touchCancel(event);
    }
  };

  var touchEnd = function (event) {
    event.preventDefault();
  };

  var touchCancel = function (event) {
    event.preventDefault();
    x = y = dx = dy = 0;
    tryMovePacmanCancel();
  };

  // Register touch events
  document.ontouchstart = touchStart;
  document.ontouchend = touchEnd;
  document.ontouchmove = touchMove;
  document.ontouchcancel = touchCancel;
};
