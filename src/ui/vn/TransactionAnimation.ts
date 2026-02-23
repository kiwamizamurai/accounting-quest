import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, DEPTH } from '../../config/constants';
import { formatMoney } from '../../utils/MoneyFormatter';
import { t } from '../../i18n';

interface AnimationEntry {
  account: string;
  debit?: number;
  credit?: number;
}

export class TransactionAnimation extends Phaser.GameObjects.Container {
  private animContainer: Phaser.GameObjects.Container;
  private onComplete?: () => void;
  private autoCloseTimer?: Phaser.Time.TimerEvent;
  private isClosing = false;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.animContainer = scene.add.container(0, 0);
    this.add(this.animContainer);
    this.setDepth(DEPTH.DIALOG + 5);
    this.setVisible(false);
    scene.add.existing(this);
  }

  play(
    description: string,
    entries: AnimationEntry[],
    onComplete?: () => void
  ): void {
    this.clearAnimation();
    this.onComplete = onComplete;
    this.isClosing = false;
    this.setVisible(true);

    const cx = GAME_WIDTH / 2;
    const baseY = GAME_HEIGHT / 2 - 80;

    // Background overlay
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.animContainer.add(overlay);

    // Journal entry box
    const boxWidth = 500;
    const boxHeight = 50 + entries.length * 36 + 20;
    const boxX = cx - boxWidth / 2;
    const boxY = baseY;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a3e, 0.95);
    bg.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 8);
    bg.lineStyle(2, 0xffd700, 0.8);
    bg.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 8);
    this.animContainer.add(bg);

    // Title
    const titleText = this.scene.add.text(cx, boxY + 16, description, {
      fontFamily: '"Courier New", monospace',
      fontSize: '15px',
      color: '#ffd700',
      fontStyle: 'bold',
      padding: { top: 4, bottom: 4 },
    });
    titleText.setOrigin(0.5, 0);
    this.animContainer.add(titleText);

    // Header line
    const headerY = boxY + 44;
    const headerLine = this.scene.add.graphics();
    headerLine.lineStyle(1, 0xffd700, 0.3);
    headerLine.lineBetween(boxX + 20, headerY, boxX + boxWidth - 20, headerY);
    this.animContainer.add(headerLine);

    // Debit / Credit headers
    const debitHeader = this.scene.add.text(
      boxX + boxWidth - 160, headerY + 4,
      t('ui.debit'),
      { fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#4a90d9', padding: { top: 4, bottom: 4 } }
    );
    this.animContainer.add(debitHeader);

    const creditHeader = this.scene.add.text(
      boxX + boxWidth - 80, headerY + 4,
      t('ui.credit'),
      { fontFamily: '"Courier New", monospace', fontSize: '12px', color: '#d94a4a', padding: { top: 4, bottom: 4 } }
    );
    this.animContainer.add(creditHeader);

    // Entries - animate one by one
    entries.forEach((entry, index) => {
      const entryY = headerY + 24 + index * 36;
      const delay = 300 + index * 400;

      this.scene.time.delayedCall(delay, () => {
        this.addEntryRow(entry, boxX + 30, entryY, boxWidth);
      });
    });

    // Auto-close after animation
    const totalDuration = 300 + entries.length * 400 + 1500;
    this.autoCloseTimer = this.scene.time.delayedCall(totalDuration, () => {
      this.close();
    });

    // Skip listeners
    this.scene.input.keyboard?.on('keydown-SPACE', this.skipHandler, this);
    this.scene.input.keyboard?.on('keydown-ENTER', this.skipHandler, this);
    this.scene.input.on('pointerdown', this.skipHandler, this);
  }

  private addEntryRow(
    entry: AnimationEntry,
    x: number,
    y: number,
    boxWidth: number,
  ): void {
    const name = t(`account.${entry.account}`);

    const isCredit = (entry.credit ?? 0) > 0 && (entry.debit ?? 0) === 0;
    const indent = isCredit ? '  ' : '';

    const nameText = this.scene.add.text(x, y, `${indent}${name}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#ffffff',
      padding: { top: 4, bottom: 4 },
    });
    nameText.setAlpha(0);
    this.animContainer.add(nameText);

    if ((entry.debit ?? 0) > 0) {
      const debitText = this.scene.add.text(
        x + boxWidth - 200,
        y,
        formatMoney(entry.debit!),
        {
          fontFamily: '"Courier New", monospace',
          fontSize: '14px',
          color: '#4a90d9',
          padding: { top: 4, bottom: 4 },
        }
      );
      debitText.setAlpha(0);
      this.animContainer.add(debitText);
      this.scene.tweens.add({
        targets: debitText,
        alpha: 1,
        y: y,
        duration: 300,
        ease: 'Power2',
      });
    }

    if ((entry.credit ?? 0) > 0) {
      const creditText = this.scene.add.text(
        x + boxWidth - 120,
        y,
        formatMoney(entry.credit!),
        {
          fontFamily: '"Courier New", monospace',
          fontSize: '14px',
          color: '#d94a4a',
          padding: { top: 4, bottom: 4 },
        }
      );
      creditText.setAlpha(0);
      this.animContainer.add(creditText);
      this.scene.tweens.add({
        targets: creditText,
        alpha: 1,
        y: y,
        duration: 300,
        ease: 'Power2',
      });
    }

    this.scene.tweens.add({
      targets: nameText,
      alpha: 1,
      y: y,
      duration: 300,
      ease: 'Power2',
    });
  }

  private skipHandler = (): void => {
    this.close();
  };

  private removeSkipListeners(): void {
    this.scene.input.keyboard?.off('keydown-SPACE', this.skipHandler, this);
    this.scene.input.keyboard?.off('keydown-ENTER', this.skipHandler, this);
    this.scene.input.off('pointerdown', this.skipHandler, this);
  }

  private close(): void {
    if (this.isClosing) return;
    this.isClosing = true;

    if (this.autoCloseTimer) {
      this.autoCloseTimer.destroy();
      this.autoCloseTimer = undefined;
    }
    this.removeSkipListeners();

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.clearAnimation();
        this.setAlpha(1);
        this.setVisible(false);
        if (this.onComplete) {
          this.onComplete();
        }
      },
    });
  }

  private clearAnimation(): void {
    this.animContainer.removeAll(true);
  }

  destroy(): void {
    if (this.autoCloseTimer) {
      this.autoCloseTimer.destroy();
      this.autoCloseTimer = undefined;
    }
    if (this.scene) {
      this.removeSkipListeners();
    }
    this.clearAnimation();
    super.destroy();
  }
}
