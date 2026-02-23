import Phaser from 'phaser';
import { DEPTH, GAME_WIDTH, GAME_HEIGHT } from '../../config/constants';
import { ChoiceOption } from '../../vn/types';
import { t } from '../../i18n';

export class ChoicePanel extends Phaser.GameObjects.Container {
  private promptText: Phaser.GameObjects.Text;
  private choiceContainers: Phaser.GameObjects.Container[] = [];
  private onSelect?: (index: number) => void;
  private selectedIndex = -1;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.promptText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 120, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '18px',
      color: '#ffd700',
      fontStyle: 'bold',
      align: 'center',
      padding: { top: 4, bottom: 4 },
    });
    this.promptText.setOrigin(0.5);
    this.add(this.promptText);

    this.setDepth(DEPTH.DIALOG + 10);
    this.setVisible(false);

    scene.add.existing(this);
  }

  show(prompt: string, choices: ChoiceOption[], onSelect: (index: number) => void): void {
    this.clearChoices();
    this.promptText.setText(prompt);
    this.onSelect = onSelect;
    this.selectedIndex = 0;

    const startY = GAME_HEIGHT / 2 - 60;
    const choiceHeight = 48;
    const choiceWidth = 400;

    choices.forEach((choice, index) => {
      const y = startY + index * (choiceHeight + 12);
      const container = this.createChoiceButton(
        GAME_WIDTH / 2,
        y,
        choiceWidth,
        choiceHeight,
        t(choice.labelKey),
        index
      );
      this.choiceContainers.push(container);
    });

    // Keyboard navigation
    this.scene.input.keyboard?.on('keydown-UP', this.navigateUp, this);
    this.scene.input.keyboard?.on('keydown-DOWN', this.navigateDown, this);
    this.scene.input.keyboard?.on('keydown-ENTER', this.confirmSelection, this);
    this.scene.input.keyboard?.on('keydown-SPACE', this.confirmSelection, this);

    this.updateHighlight();
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
    this.clearChoices();
    this.scene.input.keyboard?.off('keydown-UP', this.navigateUp, this);
    this.scene.input.keyboard?.off('keydown-DOWN', this.navigateDown, this);
    this.scene.input.keyboard?.off('keydown-ENTER', this.confirmSelection, this);
    this.scene.input.keyboard?.off('keydown-SPACE', this.confirmSelection, this);
  }

  private createChoiceButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a3e, 0.9);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
    bg.lineStyle(2, 0x4a90d9, 0.8);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
    container.add(bg);

    const label = this.scene.add.text(0, 0, text, {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: '#ffffff',
      padding: { top: 4, bottom: 4 },
    });
    label.setOrigin(0.5);
    container.add(label);

    // Hit zone
    const hitZone = this.scene.add.zone(0, 0, width, height);
    hitZone.setInteractive({ useHandCursor: true });
    container.add(hitZone);

    hitZone.on('pointerover', () => {
      this.selectedIndex = index;
      this.updateHighlight();
    });

    hitZone.on('pointerdown', () => {
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
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
        bg.lineStyle(2, 0xffd700, 1);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
        label.setColor('#ffd700');
      } else {
        bg.fillStyle(0x1a1a3e, 0.9);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
        bg.lineStyle(2, 0x4a90d9, 0.8);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);
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

  private selectChoice(index: number): void {
    // Flash animation
    const container = this.choiceContainers[index];
    if (container) {
      this.scene.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          if (this.onSelect) {
            this.onSelect(index);
          }
          this.hide();
        },
      });
    }
  }

  private clearChoices(): void {
    for (const container of this.choiceContainers) {
      container.destroy();
    }
    this.choiceContainers = [];
  }

  destroy(): void {
    if (this.scene) {
      this.scene.input.keyboard?.off('keydown-UP', this.navigateUp, this);
      this.scene.input.keyboard?.off('keydown-DOWN', this.navigateDown, this);
      this.scene.input.keyboard?.off('keydown-ENTER', this.confirmSelection, this);
      this.scene.input.keyboard?.off('keydown-SPACE', this.confirmSelection, this);
    }
    this.clearChoices();
    super.destroy();
  }
}
