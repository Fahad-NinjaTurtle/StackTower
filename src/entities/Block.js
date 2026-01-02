// src/objects/Block.js
export default class Block {
  constructor(scene, x, y, width, height, color) {
    this.scene = scene;
    this.width = width;
    this.height = height;

    this.rect = scene.add.rectangle(x, y, width, height, color).setOrigin(0.5);

    this.tween = null;
  }

  moveHorizontally(leftX, rightX, duration) {
    // Safety: ensure no leftover tweens on this rect
    this.scene.tweens.killTweensOf(this.rect);

    this.rect.x = leftX;

    this.tween = this.scene.tweens.add({
      targets: this.rect,
      x: rightX,
      duration,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  stopMovement() {
    // ✅ Hard stop: kill ANY tween affecting this rect (x or y)
    this.scene.tweens.killTweensOf(this.rect);

    // also clear stored ref
    this.tween = null;
  }

  drop(onComplete) {
    // No vertical movement at all
    onComplete?.();
  }

  trimToOverlap(prevBlock) {
    const scene = this.scene;

    const aX = this.rect.x;
    const bX = prevBlock.rect.x;

    const aHalf = this.width / 2;
    const bHalf = prevBlock.width / 2;

    const left = Math.max(aX - aHalf, bX - bHalf);
    const right = Math.min(aX + aHalf, bX + bHalf);
    const overlap = right - left;

    if (overlap <= 0) return false;

    // ===============================
    // 1. Calculate trimmed part
    // ===============================
    const trimmedWidth = this.width - overlap;

    if (trimmedWidth > 1) {
      const trimX =
        aX < bX
          ? left - trimmedWidth / 2 // trimmed from left
          : right + trimmedWidth / 2; // trimmed from right

      const trimmed = scene.add
        .rectangle(
          trimX,
          this.rect.y,
          trimmedWidth,
          this.height,
          this.rect.fillColor
        )
        .setOrigin(0.5);

      // ===============================
      // 2. Animate trimmed piece falling
      // ===============================
      scene.tweens.add({
        targets: trimmed,
        y: trimmed.y + 600,
        angle: Phaser.Math.Between(-30, 30),
        alpha: 0,
        duration: 700,
        ease: "Quad.in",
        onComplete: () => trimmed.destroy(),
      });
    }

    // ===============================
    // 3. Apply trim to main block
    // ===============================
    this.width = overlap;
    this.rect.displayWidth = overlap;
    this.rect.x = left + overlap / 2;

    return true;
  }

  fallAndDestroy() {
    this.scene.tweens.killTweensOf(this.rect);

    this.scene.tweens.add({
      targets: this.rect,
      y: this.rect.y + 600,
      duration: 600,
      ease: "Quad.in",
      onComplete: () => this.rect.destroy(),
    });
  }
}
