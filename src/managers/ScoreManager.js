export default class ScoreManager {
  constructor() {
    this.score = 0;
    this.highScore = Number(localStorage.getItem("stack_highscore")) || 0;
  }

  increment() {
    this.score++;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("stack_highscore", this.highScore);
    }
  }

  reset() {
    this.score = 0;
  }
}
