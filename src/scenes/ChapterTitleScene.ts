import Phaser from 'phaser';
import { FONT_FAMILY } from '../config/constants';
import { VIEW_WIDTH, fitViewToWindow, getViewHeight } from '../config/layout';
import { applyRenderScale } from '../utils/renderScale';
import { t } from '../i18n';

interface ChapterTitleData {
  chapterId: number;
}

export class ChapterTitleScene extends Phaser.Scene {
  constructor() {
    super('ChapterTitleScene');
  }

  create(data: ChapterTitleData): void {
    fitViewToWindow(this.game);
    applyRenderScale(this);
    const chapterId = data.chapterId ?? 1;
    const centerX = VIEW_WIDTH / 2;
    const centerY = getViewHeight() / 2 - 40;

    // Dark background
    this.cameras.main.setBackgroundColor('#0a0a1e');

    // Chapter number
    const chapterNum = this.add.text(
      centerX,
      centerY - 64,
      t('ui.chapterNumber', { n: chapterId }),
      {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        color: '#6a6a8a',
        padding: { top: 4, bottom: 4 },
      }
    );
    chapterNum.setOrigin(0.5);
    chapterNum.setAlpha(0);

    // Title
    const title = this.add.text(
      centerX,
      centerY,
      t(`ch${chapterId}.title`),
      {
        fontFamily: FONT_FAMILY,
        fontSize: '26px',
        color: '#ffd700',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: VIEW_WIDTH - 48, useAdvancedWrap: true },
        padding: { top: 4, bottom: 4 },
      }
    );
    title.setOrigin(0.5);
    title.setAlpha(0);

    // Subtitle
    const subtitle = this.add.text(
      centerX,
      centerY + 62,
      t(`ch${chapterId}.subtitle`),
      {
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
        color: '#aaaacc',
        align: 'center',
        wordWrap: { width: VIEW_WIDTH - 48, useAdvancedWrap: true },
        padding: { top: 4, bottom: 4 },
      }
    );
    subtitle.setOrigin(0.5);
    subtitle.setAlpha(0);

    // Decorative line
    const line = this.add.graphics();
    line.lineStyle(2, 0xffd700, 0.5);
    line.lineBetween(centerX - 100, centerY + 34, centerX + 100, centerY + 34);
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
