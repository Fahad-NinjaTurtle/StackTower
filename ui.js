const scoreEl = document.getElementById("score");
const startScreen = document.getElementById("start-screen");
const gameoverScreen = document.getElementById("gameover-screen");
const finalScoreEl = document.getElementById("final-score");
const highScoreEl = document.getElementById("high-score");
const gameOverHighScoreEl = document.getElementById("gameover-high-score");
const hud = document.getElementById("hud");

document.getElementById("start-btn").onclick = () => {
  hideStart();
  hud.style.display = "flex"; // show HUD
  window.game.startGame();
};

document.getElementById("restart-btn").onclick = () => {
  hideGameOver();
  hud.style.display = "flex"; // restore HUD
  window.game.restartGame();
};

function hideStart() {
  startScreen.classList.remove("active");
}

function showGameOver(score, highScore) {
  // hide in-game HUD
  hud.style.display = "none";

  // show game-over panel
  finalScoreEl.textContent = score;
  gameOverHighScoreEl.textContent = `BEST ${highScore}`;
  gameoverScreen.classList.add("active");
}


function hideGameOver() {
  gameoverScreen.classList.remove("active");
}

function updateScore(score) {
  scoreEl.textContent = score;
}
function updateHighScore(score) {
  highScoreEl.textContent = `BEST ${score}`;
}

/* Expose for Phaser */
window.UI = {
  updateScore,
  updateHighScore,
  showGameOver,
};
