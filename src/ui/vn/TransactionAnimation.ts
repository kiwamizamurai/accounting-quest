import Phaser from 'phaser';
import { DEPTH, FONT_FAMILY } from '../../config/constants';
import { VIEW_WIDTH, HUD_HEIGHT, getViewHeight } from '../../config/layout';
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
  private isClosing = false;
  private isReady = false;
  private indicatorTween?: Phaser.Tweens.Tween;

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
    this.removeSkipListeners();
    this.clearAnimation();
    this.onComplete = onComplete;
    this.isClosing = false;
    this.setVisible(true);

    const height = getViewHeight();
    const cx = VIEW_WIDTH / 2;

    // Background overlay
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.55);
    overlay.fillRect(0, 0, VIEW_WIDTH, height);
    this.animContainer.add(overlay);

    // Journal entry box, centred between the HUD and the bottom of the screen
    const boxWidth = VIEW_WIDTH - 20;
    const inner = boxWidth - 32;
    const titleText = this.scene.add.text(0, 0, description, {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: inner, useAdvancedWrap: true },
      lineSpacing: 4,
      padding: { top: 4, bottom: 4 },
    });
    const rowHeight = 38;
    const headerY = 20 + titleText.height + 8;
    const boxHeight = headerY + 30 + entries.length * rowHeight + 46;
    const boxX = cx - boxWidth / 2;
    const boxY = Math.max(HUD_HEIGHT + 8, Math.round((height - boxHeight) / 2) - 30);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a3e, 0.97);
    bg.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 14);
    bg.lineStyle(2, 0xffd700, 0.8);
    bg.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 14);
    this.animContainer.add(bg);

    // Title
    titleText.setPosition(cx, boxY + 16);
    titleText.setOrigin(0.5, 0);
    this.animContainer.add(titleText);

    // Header line
    const lineY = boxY + headerY;
    const headerLine = this.scene.add.graphics();
    headerLine.lineStyle(1, 0xffd700, 0.3);
    headerLine.lineBetween(boxX + 16, lineY, boxX + boxWidth - 16, lineY);
    this.animContainer.add(headerLine);

    // Debit / Credit headers (right-aligned over their amount columns)
    const creditRight = boxX + boxWidth - 16;
    const debitRight = creditRight - 96;
    const headerStyle = { fontFamily: FONT_FAMILY, fontSize: '13px', padding: { top: 4, bottom: 4 } };
    const debitHeader = this.scene.add.text(debitRight, lineY + 4, t('ui.debit'), { ...headerStyle, color: '#6aaeef' });
    debitHeader.setOrigin(1, 0);
    this.animContainer.add(debitHeader);

    const creditHeader = this.scene.add.text(creditRight, lineY + 4, t('ui.credit'), { ...headerStyle, color: '#ef7a7a' });
    creditHeader.setOrigin(1, 0);
    this.animContainer.add(creditHeader);

    // Entries - animate one by one
    const rowsTop = lineY + 30;
    entries.forEach((entry, index) => {
      const entryY = rowsTop + index * rowHeight;
      const delay = 300 + index * 400;

      this.scene.time.delayedCall(delay, () => {
        this.addEntryRow(entry, boxX + 16, entryY, debitRight, creditRight);
      });
    });

    // Show continue indicator after all entries have animated in
    this.isReady = false;
    const animDuration = 300 + entries.length * 400 + 300;
    this.scene.time.delayedCall(animDuration, () => {
      this.isReady = true;
      this.showContinueIndicator(cx, boxY + boxHeight - 34);
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
    debitRight: number,
    creditRight: number,
  ): void {
    // Rows appear only after the animation started, so the scene may be gone by then
    if (!this.scene || !this.animContainer.active) return;
    const name = t(`account.${entry.account}`);

    const isCredit = (entry.credit ?? 0) > 0 && (entry.debit ?? 0) === 0;
    const indent = isCredit ? '   ' : '';

    const nameText = this.scene.add.text(x, y, `${indent}${name}`, {
      fontFamily: FONT_FAMILY,
      fontSize: '15px',
      color: '#ffffff',
      padding: { top: 4, bottom: 4 },
    });
    nameText.setAlpha(0);
    // Keep a long account name clear of the amount columns
    const nameRoom = debitRight - x - 84;
    if (nameText.width > nameRoom) {
      nameText.setScale(nameRoom / nameText.width);
    }
    this.animContainer.add(nameText);

    const addAmount = (amount: number, right: number, color: string): void => {
      const amountText = this.scene.add.text(right, y, formatMoney(amount), {
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
        fontStyle: 'bold',
        color,
        padding: { top: 4, bottom: 4 },
      });
      amountText.setOrigin(1, 0);
      amountText.setAlpha(0);
      this.animContainer.add(amountText);
      this.scene.tweens.add({
        targets: amountText,
        alpha: 1,
        duration: 300,
        ease: 'Power2',
      });
    };

    if ((entry.debit ?? 0) > 0) {
      addAmount(entry.debit!, debitRight, '#6aaeef');
    }
    if ((entry.credit ?? 0) > 0) {
      addAmount(entry.credit!, creditRight, '#ef7a7a');
    }

    this.scene.tweens.add({
      targets: nameText,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });
  }

  private showContinueIndicator(cx: number, y: number): void {
    const indicator = this.scene.add.text(
      cx,
      y,
      `\u25BC ${t('ui.clickToContinue')}`,
      {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: '#ffffff',
        padding: { top: 4, bottom: 4 },
      }
    );
    indicator.setOrigin(0.5, 0);
    this.animContainer.add(indicator);

    this.indicatorTween = this.scene.tweens.add({
      targets: indicator,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  private skipHandler = (): void => {
    if (!this.isReady) return;
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
    if (this.indicatorTween) {
      this.indicatorTween.stop();
      this.indicatorTween = undefined;
    }
    this.animContainer.removeAll(true);
  }

  destroy(): void {
    if (this.scene) {
      this.removeSkipListeners();
    }
    this.clearAnimation();
    super.destroy();
  }
}
