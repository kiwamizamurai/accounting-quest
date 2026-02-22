import Phaser from 'phaser';
import { SCENES, COLORS } from '../config/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontFamily: '"Courier New", monospace',
      fontSize: '24px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5);

    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x2d2d44, 1);
    progressBarBg.fillRect(width / 2 - 150, height / 2, 300, 30);

    const progressBar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(COLORS.ASSETS, 1);
      progressBar.fillRect(width / 2 - 145, height / 2 + 5, 290 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBarBg.destroy();
      loadingText.destroy();
    });

    // No external assets to load - all generated dynamically via Canvas
    // Trigger at least one load event for progress bar
    this.load.image('__placeholder__', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  }

  create(): void {
    this.scene.start(SCENES.MENU);
  }
}
