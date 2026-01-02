// src/main.js
import { GameConfig } from "./config/GameConfig.js";
import GameScene from "./scenes/GameScene.js";

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: GameConfig.DESIGN_WIDTH,
  height: GameConfig.DESIGN_HEIGHT,
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 2,
  },
};

const game = new Phaser.Game(config);
game.events.on("ready", () => {
  window.game = game.scene.getScene("GameScene");
});
