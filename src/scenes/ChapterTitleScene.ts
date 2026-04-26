import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { t } from '../i18n';

interface ChapterTitleData {
  chapterId: number;
}

export class ChapterTitleScene extends Phaser.Scene {
  constructor() {
    super('ChapterTitleScene');
  }

  create(data: ChapterTitleData): void {
    const chapterId = data.chapterId ?? 1;

    // Dark background
    this.cameras.main.setBackgroundColor('#0a0a1e');

    // Chapter number
    const chapterNum = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 60,
      t('ui.chapterNumber', { n: chapterId }),
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        color: '#6a6a8a',
        padding: { top: 4, bottom: 4 },
      }
    );
    chapterNum.setOrigin(0.5);
    chapterNum.setAlpha(0);

    // Title
    const title = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      t(`ch${chapterId}.title`),
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '28px',
        color: '#ffd700',
        fontStyle: 'bold',
        padding: { top: 4, bottom: 4 },
      }
    );
    title.setOrigin(0.5);
    title.setAlpha(0);

    // Subtitle
    const subtitle = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 50,
      t(`ch${chapterId}.subtitle`),
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: '#aaaacc',
        padding: { top: 4, bottom: 4 },
      }
    );
    subtitle.setOrigin(0.5);
    subtitle.setAlpha(0);

    // Decorative line
    const line = this.add.graphics();
    line.lineStyle(2, 0xffd700, 0.5);
    line.lineBetween(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 30, GAME_WIDTH / 2 + 100, GAME_HEIGHT / 2 + 30);
    line.setAlpha(0);

    // Fade in sequence
    this.tweens.add({
      targets: chapterNum,
      alpha: 1,
      duration: 800,
      ease: 'Power2',
    });

    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 800,
      delay: 400,
      ease: 'Power2',
    });

    this.tweens.add({
      targets: line,
      alpha: 1,
      duration: 600,
      delay: 800,
      ease: 'Power2',
    });

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 800,
      delay: 1000,
      ease: 'Power2',
    });

    // Transition to VN scene after delay
    let transitioned = false;
    const goToVNScene = () => {
      if (transitioned) return;
      transitioned = true;
      this.input.keyboard?.off('keydown-SPACE', skip);
      this.input.keyboard?.off('keydown-ENTER', skip);
      this.input.off('pointerdown', skip);
      if (autoTransition) autoTransition.destroy();
      this.scene.start('VNScene', { chapterId });
    };

    const autoTransition = this.time.delayedCall(3500, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', goToVNScene);
    });

    // Allow skip with click/space
    const skip = () => goToVNScene();
    this.input.keyboard?.once('keydown-SPACE', skip);
    this.input.keyboard?.once('keydown-ENTER', skip);
    this.input.once('pointerdown', skip);
  }
}
