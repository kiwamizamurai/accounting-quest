import Phaser from 'phaser';
import { gameConfig } from './config/game.config';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { ChapterTitleScene } from './scenes/ChapterTitleScene';
import { VNScene } from './scenes/VNScene';

class AccountingGame extends Phaser.Game {
  constructor() {
    const config: Phaser.Types.Core.GameConfig = {
      ...gameConfig,
      scene: [BootScene, TitleScene, LevelSelectScene, ChapterTitleScene, VNScene],
      callbacks: {
        postBoot: (game) => {
          const loading = document.getElementById('loading');
          if (loading) {
            loading.classList.add('hidden');
          }

          const canvas = game.canvas;
          canvas.setAttribute('tabindex', '0');
          canvas.style.outline = 'none';

          setTimeout(() => {
            canvas.focus();
          }, 100);

          document.addEventListener('click', () => {
            canvas.focus();
          });
        },
      },
    };

    super(config);
  }
}

window.addEventListener('load', () => {
  new AccountingGame();
});
