import Phaser from 'phaser';
import { RENDER_SCALE } from '../config/layout';

/**
 * Zoom the scene's camera so the layout (VIEW_WIDTH wide) fills the (RENDER_SCALE times larger) canvas.
 * Call it first thing in every scene (init or create).
 */
export function applyRenderScale(scene: Phaser.Scene): void {
  const camera = scene.cameras.main;
  camera.setOrigin(0, 0);
  camera.setZoom(RENDER_SCALE);
}

/**
 * Render every Text object at RENDER_SCALE resolution so it stays sharp under the camera zoom.
 * Must run once before the game is created.
 */
export function enableCrispText(): void {
  const factory = Phaser.GameObjects.GameObjectFactory.prototype as unknown as {
    text: (...args: unknown[]) => Phaser.GameObjects.Text;
  };
  const createText = factory.text;
  factory.text = function (this: unknown, ...args: unknown[]): Phaser.GameObjects.Text {
    return createText.apply(this, args).setResolution(RENDER_SCALE);
  };
}
