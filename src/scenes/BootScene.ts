import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY, TITLE_ICON_KEY } from '../config/constants';
import { applyRenderScale } from '../utils/renderScale';
import { getAudioManager } from '../managers/AudioManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  init(): void {
    applyRenderScale(this);
  }

  preload(): void {
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      color: '#ffffff',
      padding: { top: 4, bottom: 4 },
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

    // Game icon for the title screen (vector, so it stays sharp at the canvas's high resolution)
    this.load.svg(TITLE_ICON_KEY, `${import.meta.env.BASE_URL}favicon.svg`, { width: 256, height: 256 });

    // Preload audio assets
    getAudioManager().preload(this);

    // Placeholder asset for progress bar
    this.load.image('__placeholder__', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  }

  create(): void {
    this.scene.start(SCENES.MENU);
  }
}
