import Phaser from 'phaser';
import { COLORS, DEPTH, GAME_WIDTH, GAME_HEIGHT, ANIMATION } from '../../config/constants';
import { getCharacterName } from '../../data/characters';

export class VNDialogBox extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private speakerText: Phaser.GameObjects.Text;
  private speakerBg: Phaser.GameObjects.Graphics;
  private dialogText: Phaser.GameObjects.Text;
  private continueIndicator: Phaser.GameObjects.Text;

  private currentText = '';
  private displayedText = '';
  private currentCharIndex = 0;
  private isTyping = false;
  private typingSpeed: number;
  private typingTimer: Phaser.Time.TimerEvent | null = null;
  private onAdvance?: () => void;
  private inputLocked = false;

  private boxWidth: number;
  private boxHeight = 160;
  private boxX: number;
  private boxY: number;
  private padding = 20;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.typingSpeed = ANIMATION.DIALOG_SPEED;
    this.boxWidth = GAME_WIDTH - 40;
    this.boxX = 20;
    this.boxY = GAME_HEIGHT - this.boxHeight - 20;

    // Background
    this.background = scene.add.graphics();
    this.drawBackground();
    this.add(this.background);

    // Speaker name background
    this.speakerBg = scene.add.graphics();
    this.add(this.speakerBg);

    // Speaker name
    this.speakerText = scene.add.text(this.boxX + this.padding + 8, this.boxY - 16, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.add(this.speakerText);

    // Dialog text
    this.dialogText = scene.add.text(
      this.boxX + this.padding,
      this.boxY + this.padding + 14,
      '',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '17px',
        color: '#ffffff',
        wordWrap: { width: this.boxWidth - this.padding * 2, useAdvancedWrap: true },
        lineSpacing: 8,
        padding: { top: 4, bottom: 4 },
      }
    );
    this.add(this.dialogText);

    // Continue indicator
    this.continueIndicator = scene.add.text(
      this.boxX + this.boxWidth - 36,
      this.boxY + this.boxHeight - 30,
      '>>',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: '#ffffff',
      }
    );
    this.continueIndicator.setVisible(false);
    this.add(this.continueIndicator);

    scene.tweens.add({
      targets: this.continueIndicator,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this.setDepth(DEPTH.DIALOG);
    this.setVisible(false);

    scene.add.existing(this);
  }

  private drawBackground(): void {
    this.background.clear();

    // Semi-transparent background
    this.background.fillStyle(0x0a0a1e, 0.92);
    this.background.fillRoundedRect(
      this.boxX,
      this.boxY,
      this.boxWidth,
      this.boxHeight,
      8
    );

    // Border
    this.background.lineStyle(2, 0x4a90d9, 0.8);
    this.background.strokeRoundedRect(
      this.boxX,
      this.boxY,
      this.boxWidth,
      this.boxHeight,
      8
    );
  }

  private drawSpeakerTag(speakerColor: number): void {
    this.speakerBg.clear();
    const text = this.speakerText.text;
    if (!text) return;

    const tagWidth = text.length * 10 + 24;
    this.speakerBg.fillStyle(speakerColor, 0.9);
    this.speakerBg.fillRoundedRect(
      this.boxX + this.padding,
      this.boxY - 22,
      tagWidth,
      28,
      4
    );
  }

  showDialog(speaker: string, text: string, onAdvance?: () => void): void {
    const speakerName = getCharacterName(speaker);
    const speakerColor = this.getSpeakerColor(speaker);

    this.speakerText.setText(speakerName);
    this.drawSpeakerTag(speakerColor);

    this.currentText = text;
    this.displayedText = '';
    this.currentCharIndex = 0;
    this.onAdvance = onAdvance;
    this.inputLocked = false;

    this.dialogText.setText('');
    this.continueIndicator.setVisible(false);
    this.setVisible(true);

    this.isTyping = true;
    this.typingTimer = this.scene.time.addEvent({
      delay: this.typingSpeed,
      callback: this.typeNextChar,
      callbackScope: this,
      repeat: text.length - 1,
    });

    this.enableInput();
  }

  showNarration(text: string, onAdvance?: () => void): void {
    this.speakerText.setText('');
    this.speakerBg.clear();

    this.currentText = text;
    this.displayedText = '';
    this.currentCharIndex = 0;
    this.onAdvance = onAdvance;
    this.inputLocked = false;

    this.dialogText.setText('');
    this.dialogText.setColor('#aaaaff');
    this.continueIndicator.setVisible(false);
    this.setVisible(true);

    this.isTyping = true;
    this.typingTimer = this.scene.time.addEvent({
      delay: this.typingSpeed,
      callback: this.typeNextChar,
      callbackScope: this,
      repeat: text.length - 1,
    });

    this.enableInput();
  }

  hide(): void {
    this.disableInput();
    this.setVisible(false);
    this.stopTyping();
    this.dialogText.setColor('#ffffff');
  }

  lockInput(): void {
    this.inputLocked = true;
  }

  unlockInput(): void {
    this.inputLocked = false;
  }

  private typeNextChar = (): void => {
    this.currentCharIndex++;
    this.displayedText = this.currentText.substring(0, this.currentCharIndex);
    this.dialogText.setText(this.displayedText);

    if (this.currentCharIndex >= this.currentText.length) {
      this.finishTyping();
    }
  };

  private finishTyping(): void {
    this.isTyping = false;
    this.dialogText.setText(this.currentText);
    this.continueIndicator.setVisible(true);
    this.stopTyping();
    this.inputLocked = true;
    this.scene.time.delayedCall(200, () => { this.inputLocked = false; });
  }

  private stopTyping(): void {
    if (this.typingTimer) {
      this.typingTimer.destroy();
      this.typingTimer = null;
    }
  }

  private handleInput = (): void => {
    if (!this.visible || this.inputLocked) return;

    if (this.isTyping) {
      this.stopTyping();
      this.dialogText.setText(this.currentText);
      this.finishTyping();
    } else {
      this.continueIndicator.setVisible(false);
      if (this.onAdvance) {
        this.onAdvance();
      }
    }
  };

  private enableInput(): void {
    this.disableInput();
    this.scene.input.keyboard?.on('keydown-SPACE', this.handleInput, this);
    this.scene.input.keyboard?.on('keydown-ENTER', this.handleInput, this);
    this.scene.input.on('pointerdown', this.handleInput, this);
  }

  private disableInput(): void {
    this.scene.input.keyboard?.off('keydown-SPACE', this.handleInput, this);
    this.scene.input.keyboard?.off('keydown-ENTER', this.handleInput, this);
    this.scene.input.off('pointerdown', this.handleInput, this);
  }

  private getSpeakerColor(speaker: string): number {
    const colorMap: Record<string, number> = {
      player: 0x4a90d9,
      mentor: 0xd9b44a,
      supplier: 0xe94560,
      customer: 0x81c784,
      banker: 0x9b4ad9,
      employee: 0x4dd0e1,
      taxman: 0x808080,
    };
    return colorMap[speaker] ?? COLORS.ASSETS;
  }

  isShowing(): boolean {
    return this.visible;
  }

  destroy(): void {
    if (this.scene) {
      this.disableInput();
    }
    this.stopTyping();
    super.destroy();
  }
}
