import { GameConfig } from "../config/GameConfig.js";
import Block from "../entities/Block.js";
import ScoreManager from "../managers/ScoreManager.js";
export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }
  preload() {
    this.load.audio("place", "assets/Place Sound.mp3");
  }
  create() {
    this.cameras.main.setBackgroundColor(GameConfig.COLORS.BACKGROUND);

    this.blocks = [];
    this.isDropping = false;
    this.gameOver = false;
    this.gameStarted = false;
    // ✅ camera state
    this.cameraTargetY = 0;
    this.cameraStep = GameConfig.STACK.STEP_Y;

    this.scoreManager = new ScoreManager();
    window.UI.updateScore(0);
    window.UI.updateHighScore(this.scoreManager.highScore);
    this.input.on("pointerdown", this.handleDrop, this);
    this.createParticleTexture();

    this.sfx = {
      place: this.sound.add("place", { volume: 0.6 }),
    };
    // Base block
    const base = new Block(
      this,
      GameConfig.DESIGN_WIDTH / 2,
      GameConfig.STACK.START_Y,
      GameConfig.BLOCK.START_WIDTH,
      GameConfig.BLOCK.HEIGHT,
      0x4aa3ff
    );

    this.blocks.push(base);
    this.setInitialBackground(base.rect.fillColor);
    this.spawnMovingBlock();
  }
  startGame() {
    this.gameStarted = true;

    if (this.sound.locked) {
      this.sound.unlock();
    }
  }

  spawnMovingBlock() {
    if (this.gameOver) return;

    const prev = this.blocks[this.blocks.length - 1];
    const hue = Phaser.Math.FloatBetween(0, 1);
    const pastel = Phaser.Display.Color.HSVToRGB(hue, 0.35, 1);

    const block = new Block(
      this,
      GameConfig.DESIGN_WIDTH / 2,
      prev.rect.y - GameConfig.STACK.STEP_Y,
      prev.width,
      GameConfig.BLOCK.HEIGHT,
      pastel.color
    );

    const leftX = block.width / 2 + GameConfig.BLOCK.MARGIN;
    const rightX =
      GameConfig.DESIGN_WIDTH - block.width / 2 - GameConfig.BLOCK.MARGIN;

    block.moveHorizontally(leftX, rightX, GameConfig.BLOCK.MOVE_DURATION);

    this.currentBlock = block;
    this.isDropping = false;
  }
  setInitialBackground(blockColor) {
    const pastel = this.getPastelColor(blockColor);
    const rgb = Phaser.Display.Color.GetColor(pastel.r, pastel.g, pastel.b);

    // Canvas
    this.cameras.main.setBackgroundColor(rgb);

    // HTML sides
    document.body.style.backgroundColor = `rgb(${pastel.r}, ${pastel.g}, ${pastel.b})`;
  }
  createParticleTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture("perfect-particle", 8, 8);
    g.destroy();
  }

  handleDrop() {
    if (!this.gameStarted) return;
    if (this.isDropping || this.gameOver) return;
    if (!this.currentBlock) return;

    this.isDropping = true;

    // ✅ This now kills the x tween for sure
    this.currentBlock.stopMovement();

    this.currentBlock.drop(() => this.onBlockLanded());
  }

  onBlockLanded() {
    const prev = this.blocks[this.blocks.length - 1];
    const success = this.currentBlock.trimToOverlap(prev);

    if (!success) {
      this.currentBlock.fallAndDestroy();
      this.focusOnBaseBlock();
      this.gameOver = true;
      window.UI.showGameOver(
        this.scoreManager.score,
        this.scoreManager.highScore
      );

      return;
    }
    this.sfx.place.play();
    this.blocks.push(this.currentBlock);
    this.updateBackgroundColor(this.currentBlock.rect.fillColor);
    this.moveCameraUp();
    this.spawnMovingBlock();
    this.scoreManager.increment();
    window.UI.updateScore(this.scoreManager.score);
    window.UI.updateHighScore(this.scoreManager.highScore);
    const isPerfect = this.isPerfectPlacement(this.currentBlock, prev);

    if (isPerfect) {
      this.playPerfectParticles(this.currentBlock);
    }
  }
  isPerfectPlacement(current, previous) {
    return (
      Math.abs(current.rect.x - previous.rect.x) <= GameConfig.PERFECT.THRESHOLD
    );
  }
  playPerfectParticles(block) {
    const particles = this.add.particles(
      block.rect.x,
      block.rect.y - block.height / 2,
      "perfect-particle",
      {
        speed: { min: 30, max: 90 },
        angle: { min: 200, max: 340 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 400,
        quantity: 10,
        blendMode: "ADD",
      }
    );

    // auto-destroy emitter
    this.time.delayedCall(450, () => {
      particles.destroy();
    });
  }

  focusOnBaseBlock() {
    const cam = this.cameras.main;

    cam._moveTween?.stop();

    cam._moveTween = this.tweens.add({
      targets: cam,
      scrollY: 0,
      duration: 700,
      ease: "Sine.inOut",
    });
  }

  moveCameraUp() {
    const cam = this.cameras.main;
    this.cameraTargetY += this.cameraStep / 2;

    cam._moveTween?.stop();

    cam._moveTween = this.tweens.add({
      targets: cam,
      scrollY: -this.cameraTargetY,
      duration: 500,
      ease: "Sine.out",
    });
  }

  restartGame() {
    this.tweens.killAll();

    this.blocks.forEach((b) => b.rect.destroy());
    this.blocks.length = 0;

    this.cameras.main.scrollY = 0;
    this.cameraTargetY = 0;

    this.gameOver = false;
    this.isDropping = false;
    this.gameStarted = true;

    this.scoreManager.reset();

    window.UI.updateScore(0);
    window.UI.updateHighScore(this.scoreManager.highScore);

    const base = new Block(
      this,
      GameConfig.DESIGN_WIDTH / 2,
      GameConfig.STACK.START_Y,
      GameConfig.BLOCK.START_WIDTH,
      GameConfig.BLOCK.HEIGHT,
      0x4aa3ff
    );

    this.blocks.push(base);
    this.spawnMovingBlock();
  }

  getPastelColor(colorInt) {
    const c = Phaser.Display.Color.IntegerToColor(colorInt);

    // move color towards white for softness
    const pastel = Phaser.Display.Color.Interpolate.ColorWithColor(
      c,
      { r: 255, g: 255, b: 255 },
      100,
      75
    );

    return new Phaser.Display.Color(pastel.r, pastel.g, pastel.b);
  }
  updateBackgroundColor(blockColor) {
    const cam = this.cameras.main;
    const pastel = this.getPastelColor(blockColor);

    const from = Phaser.Display.Color.ValueToColor(cam.backgroundColor.color);
    const to = pastel;

    cam._bgTween?.stop();

    cam._bgTween = this.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 500,
      ease: "Sine.inOut",
      onUpdate: (tween) => {
        const v = tween.getValue();
        const col = Phaser.Display.Color.Interpolate.ColorWithColor(
          from,
          to,
          100,
          v
        );

        const rgb = Phaser.Display.Color.GetColor(col.r, col.g, col.b);
        cam.setBackgroundColor(rgb);

        // 🔥 also update HTML sides
        document.body.style.backgroundColor = `rgb(${col.r}, ${col.g}, ${col.b})`;
      },
    });
  }
}
