import Phaser from 'phaser';
import { DEPTH, FONT_FAMILY } from '../../config/constants';
import { VIEW_WIDTH, HUD_HEIGHT, DIALOG_MARGIN, getViewHeight } from '../../config/layout';
import { ChoiceOption } from '../../vn/types';
import { t } from '../../i18n';

const PANEL_MARGIN = 10;
const PANEL_PADDING = 12;
const CHOICE_MIN_HEIGHT = 48;
const CHOICE_GAP = 8;
const BADGE_SIZE = 28;

/**
 * Choice / quiz prompt: a sheet rising from the bottom of the screen with the question on top and
 * one full-width button per answer, so every answer is a large tap target under the thumb.
 */
export class ChoicePanel extends Phaser.GameObjects.Container {
  private panelBg: Phaser.GameObjects.Graphics;
  private promptText: Phaser.GameObjects.Text;
  private choiceContainers: Phaser.GameObjects.Container[] = [];
  private onSelect?: (index: number) => void;
  private selectedIndex = -1;
  private correctIndex?: number;
  private suspended = false;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.panelBg = scene.add.graphics();
    this.add(this.panelBg);

    this.promptText = scene.add.text(0, 0, '', {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold',
      lineSpacing: 5,
      padding: { top: 4, bottom: 4 },
    });
    this.add(this.promptText);

    this.setDepth(DEPTH.DIALOG + 10);
    this.setVisible(false);

    scene.add.existing(this);
  }

  /**
   * Show the question and one button per answer. For a quiz, pass `correctIndex`: after the player
   * answers, the right answer turns green and a wrong pick turns red before the panel closes.
   */
  show(prompt: string, choices: ChoiceOption[], onSelect: (index: number) => void, correctIndex?: number): void {
    this.clearChoices();
    // Remove previous keyboard listeners before adding new ones
    this.removeKeyboard();

    this.onSelect = onSelect;
    this.correctIndex = correctIndex;
    this.selectedIndex = 0;
    this.build(prompt, choices.map(choice => t(choice.labelKey)));

    // Keyboard navigation
    this.scene.input.keyboard?.on('keydown-UP', this.navigateUp, this);
    this.scene.input.keyboard?.on('keydown-DOWN', this.navigateDown, this);
    this.scene.input.keyboard?.on('keydown-ENTER', this.confirmSelection, this);
    this.scene.input.keyboard?.on('keydown-SPACE', this.confirmSelection, this);
    this.scene.input.keyboard?.on('keydown', this.pressNumber, this);

    this.updateHighlight();
    this.setVisible(!this.suspended);
  }

  hide(): void {
    this.setVisible(false);
    this.clearChoices();
    this.removeKeyboard();
  }

  /** Hide the panel without forgetting its choices (a report sheet is shown over it), or bring it back. */
  setSuspended(suspended: boolean): void {
    this.suspended = suspended;
    if (this.choiceContainers.length > 0) {
      this.setVisible(!suspended);
    }
  }

  private build(prompt: string, labels: string[]): void {
    const width = VIEW_WIDTH - PANEL_MARGIN * 2;
    const inner = width - PANEL_PADDING * 2;
    const bottom = getViewHeight() - DIALOG_MARGIN;

    this.promptText.setWordWrapWidth(inner, true);
    this.promptText.setText(prompt);

    // Measure every answer, then size the sheet to fit them
    const labelWidth = inner - BADGE_SIZE - 20;
    const measured = labels.map(label => {
      const text = this.scene.add.text(0, 0, label, {
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
        color: '#ffffff',
        wordWrap: { width: labelWidth, useAdvancedWrap: true },
        lineSpacing: 3,
        padding: { top: 3, bottom: 3 },
      });
      text.setOrigin(0, 0.5);
      return { text, height: Math.max(CHOICE_MIN_HEIGHT, Math.ceil(text.height) + 16) };
    });

    const buttonsHeight = measured.reduce((sum, m) => sum + m.height, 0) + CHOICE_GAP * (measured.length - 1);
    const total = PANEL_PADDING + this.promptText.height + 8 + buttonsHeight + PANEL_PADDING;
    // Never grow into the HUD: an unusually long prompt is cut from the top instead
    const top = Math.max(HUD_HEIGHT + 8, bottom - total);
    const x = PANEL_MARGIN;

    this.panelBg.clear();
    this.panelBg.fillStyle(0x0a0a1e, 0.97);
    this.panelBg.fillRoundedRect(x, top, width, bottom - top, 14);
    this.panelBg.lineStyle(2, 0x4a90d9, 0.8);
    this.panelBg.strokeRoundedRect(x, top, width, bottom - top, 14);

    this.promptText.setPosition(x + PANEL_PADDING, top + PANEL_PADDING - 2);

    let y = top + PANEL_PADDING + this.promptText.height + 8;
    measured.forEach((m, index) => {
      const container = this.createChoiceButton(x + PANEL_PADDING, y, inner, m.height, m.text, index);
      this.choiceContainers.push(container);
      y += m.height + CHOICE_GAP;
    });
  }

  private createChoiceButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: Phaser.GameObjects.Text,
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    container.add(bg);

    const badge = this.scene.add.graphics();
    badge.fillStyle(0x2a3a6e, 1);
    badge.fillCircle(PANEL_PADDING + BADGE_SIZE / 2 - 4, height / 2, BADGE_SIZE / 2);
    container.add(badge);
    const badgeText = this.scene.add.text(PANEL_PADDING + BADGE_SIZE / 2 - 4, height / 2, String.fromCharCode(65 + index), {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      padding: { top: 3, bottom: 3 },
    });
    badgeText.setOrigin(0.5);
    container.add(badgeText);

    label.setPosition(PANEL_PADDING + BADGE_SIZE + 6, height / 2);
    container.add(label);

    // Hit zone covers the whole button
    const hitZone = this.scene.add.zone(width / 2, height / 2, width, height);
    hitZone.setInteractive({ useHandCursor: true });
    container.add(hitZone);

    hitZone.on('pointerover', () => {
      this.selectedIndex = index;
      this.updateHighlight();
    });

    hitZone.on('pointerdown', () => {
      this.selectedIndex = index;
      this.updateHighlight();
      this.selectChoice(index);
    });

    container.setData('bg', bg);
    container.setData('label', label);
    container.setData('width', width);
    container.setData('height', height);

    this.add(container);
    return container;
  }

  private updateHighlight(): void {
    this.choiceContainers.forEach((container, index) => {
      const bg = container.getData('bg') as Phaser.GameObjects.Graphics;
      const label = container.getData('label') as Phaser.GameObjects.Text;
      const width = container.getData('width') as number;
      const height = container.getData('height') as number;

      bg.clear();
      if (index === this.selectedIndex) {
        bg.fillStyle(0x2a3a6e, 0.95);
        bg.fillRoundedRect(0, 0, width, height, 10);
        bg.lineStyle(2, 0xffd700, 1);
        bg.strokeRoundedRect(0, 0, width, height, 10);
        label.setColor('#ffd700');
      } else {
        bg.fillStyle(0x1a1a3e, 0.95);
        bg.fillRoundedRect(0, 0, width, height, 10);
        bg.lineStyle(2, 0x4a90d9, 0.8);
        bg.strokeRoundedRect(0, 0, width, height, 10);
        label.setColor('#ffffff');
      }
    });
  }

  private navigateUp = (): void => {
    if (!this.visible || this.choiceContainers.length === 0) return;
    this.selectedIndex = this.selectedIndex <= 0
      ? this.choiceContainers.length - 1
      : this.selectedIndex - 1;
    this.updateHighlight();
  };

  private navigateDown = (): void => {
    if (!this.visible || this.choiceContainers.length === 0) return;
    this.selectedIndex = this.selectedIndex >= this.choiceContainers.length - 1
      ? 0
      : this.selectedIndex + 1;
    this.updateHighlight();
  };

  private confirmSelection = (): void => {
    if (!this.visible || this.selectedIndex < 0) return;
    this.selectChoice(this.selectedIndex);
  };

  /** 1-9 pick the answer with that number. */
  private pressNumber = (event: KeyboardEvent): void => {
    if (!this.visible || !/^[1-9]$/.test(event.key)) return;
    const index = Number(event.key) - 1;
    if (index < this.choiceContainers.length) {
      this.selectedIndex = index;
      this.updateHighlight();
      this.selectChoice(index);
    }
  };

  private selectChoice(index: number): void {
    const container = this.choiceContainers[index];
    if (!container) return;

    // Only the first tap counts while the answer is shown
    this.removeKeyboard();
    for (const other of this.choiceContainers) {
      other.each((child: Phaser.GameObjects.GameObject) => {
        if (child.input) child.disableInteractive();
      });
    }

    const finish = (): void => {
      if (this.onSelect) {
        this.onSelect(index);
      }
      this.hide();
    };

    if (this.correctIndex === undefined) {
      // Flash animation
      this.scene.tweens.add({
        targets: container,
        alpha: 0.6,
        duration: 100,
        yoyo: true,
        onComplete: finish,
      });
      return;
    }

    // Quiz: show which answer was right before moving on
    this.choiceContainers.forEach((other, i) => {
      if (i === this.correctIndex) {
        this.markResult(other, 'correct');
      } else if (i === index) {
        this.markResult(other, 'wrong');
      } else {
        other.setAlpha(0.45);
      }
    });
    this.scene.time.delayedCall(1100, finish);
  }

  private markResult(container: Phaser.GameObjects.Container, result: 'correct' | 'wrong'): void {
    const bg = container.getData('bg') as Phaser.GameObjects.Graphics;
    const label = container.getData('label') as Phaser.GameObjects.Text;
    const width = container.getData('width') as number;
    const height = container.getData('height') as number;
    const color = result === 'correct' ? 0x22c55e : 0xef4444;

    bg.clear();
    bg.fillStyle(result === 'correct' ? 0x173d27 : 0x4a1f26, 1);
    bg.fillRoundedRect(0, 0, width, height, 10);
    bg.lineStyle(2, color, 1);
    bg.strokeRoundedRect(0, 0, width, height, 10);
    label.setColor('#ffffff');

    const mark = this.scene.add.text(width - 16, height / 2, result === 'correct' ? '\u25CB' : '\u2715', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: result === 'correct' ? '#22c55e' : '#ef4444',
      fontStyle: 'bold',
      padding: { top: 4, bottom: 4 },
    });
    mark.setOrigin(1, 0.5);
    container.add(mark);
  }

  private removeKeyboard(): void {
    this.scene.input.keyboard?.off('keydown-UP', this.navigateUp, this);
    this.scene.input.keyboard?.off('keydown-DOWN', this.navigateDown, this);
    this.scene.input.keyboard?.off('keydown-ENTER', this.confirmSelection, this);
    this.scene.input.keyboard?.off('keydown-SPACE', this.confirmSelection, this);
    this.scene.input.keyboard?.off('keydown', this.pressNumber, this);
  }

  private clearChoices(): void {
    for (const container of this.choiceContainers) {
      container.destroy();
    }
    this.choiceContainers = [];
    this.panelBg.clear();
    this.promptText.setText('');
  }

  destroy(): void {
    if (this.scene) {
      this.removeKeyboard();
    }
    this.clearChoices();
    super.destroy();
  }
}
