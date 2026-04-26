import Phaser from 'phaser';
import { COLORS, DEPTH, GAME_WIDTH, GAME_HEIGHT, ANIMATION } from '../../config/constants';

export interface DialogLine {
  speaker?: string;
  text: string;
  portrait?: string;
}

export interface DialogConfig {
  lines: DialogLine[];
  onComplete?: () => void;
  typingSpeed?: number;
}

/**
 * RPG-style dialog box with typewriter effect
 */
export class DialogBox extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private speakerText: Phaser.GameObjects.Text;
  private dialogText: Phaser.GameObjects.Text;
  private continueIndicator: Phaser.GameObjects.Text;
  private portrait: Phaser.GameObjects.Sprite | null = null;

  private lines: DialogLine[] = [];
  private currentLineIndex = 0;
  private currentCharIndex = 0;
  private isTyping = false;
  private typingSpeed: number;
  private typingTimer: Phaser.Time.TimerEvent | null = null;
  private onComplete?: () => void;
  private blinkTween?: Phaser.Tweens.Tween;

  private boxWidth = GAME_WIDTH - 40;
  private boxHeight = 140;
  private boxX = 20;
  private boxY = GAME_HEIGHT - 160;
  private padding = 16;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.typingSpeed = ANIMATION.DIALOG_SPEED;

    // Create background
    this.background = scene.add.graphics();
    this.drawBackground();
    this.add(this.background);

    // Create speaker name text
    this.speakerText = scene.add.text(this.boxX + this.padding, this.boxY + 8, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold',
      padding: { top: 4, bottom: 4 },
    });
    this.add(this.speakerText);

    // Create dialog text
    this.dialogText = scene.add.text(
      this.boxX + this.padding,
      this.boxY + 36,
      '',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color: '#ffffff',
        wordWrap: { width: this.boxWidth - this.padding * 2 - 80, useAdvancedWrap: true },
        lineSpacing: 6,
        padding: { top: 4, bottom: 4 },
      }
    );
    this.add(this.dialogText);

    // Create continue indicator
    this.continueIndicator = scene.add.text(
      this.boxX + this.boxWidth - 30,
      this.boxY + this.boxHeight - 25,
      '▼',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#ffffff',
        padding: { top: 4, bottom: 4 },
      }
    );
    this.continueIndicator.setVisible(false);
    this.add(this.continueIndicator);

    // Blinking animation for continue indicator
    this.blinkTween = scene.tweens.add({
      targets: this.continueIndicator,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this.setDepth(DEPTH.DIALOG);
    this.setVisible(false);

    // Add input handling
    scene.input.keyboard?.on('keydown-SPACE', this.handleInput, this);
    scene.input.keyboard?.on('keydown-ENTER', this.handleInput, this);
    scene.input.on('pointerdown', this.handleInput, this);

    scene.add.existing(this);
  }

  private drawBackground(): void {
    this.background.clear();

    // Main box background
    this.background.fillStyle(0x1a1a2e, 0.95);
    this.background.fillRoundedRect(
      this.boxX,
      this.boxY,
      this.boxWidth,
      this.boxHeight,
      8
    );

    // Border
    this.background.lineStyle(3, COLORS.ASSETS);
    this.background.strokeRoundedRect(
      this.boxX,
      this.boxY,
      this.boxWidth,
      this.boxHeight,
      8
    );

    // Inner glow
    this.background.lineStyle(1, 0x4a90d9, 0.3);
    this.background.strokeRoundedRect(
      this.boxX + 4,
      this.boxY + 4,
      this.boxWidth - 8,
      this.boxHeight - 8,
      6
    );
  }

  /**
   * Show dialog with multiple lines
   */
  show(config: DialogConfig): void {
    this.lines = config.lines;
    this.onComplete = config.onComplete;
    this.typingSpeed = config.typingSpeed ?? ANIMATION.DIALOG_SPEED;
    this.currentLineIndex = 0;

    this.setVisible(true);
    this.showCurrentLine();
  }

  /**
   * Hide the dialog box
   */
  hide(): void {
    this.setVisible(false);
    this.stopTyping();
    this.lines = [];
    this.currentLineIndex = 0;
  }

  private showCurrentLine(): void {
    const line = this.lines[this.currentLineIndex];
    if (!line) {
      this.complete();
      return;
    }

    // Update speaker
    this.speakerText.setText(line.speaker ?? '');

    // Update portrait if provided
    if (this.portrait) {
      this.portrait.destroy();
      this.portrait = null;
    }
    if (line.portrait) {
      this.portrait = this.scene.add.sprite(
        this.boxX + this.boxWidth - 50,
        this.boxY + this.boxHeight / 2,
        line.portrait
      );
      this.portrait.setScale(2);
      this.add(this.portrait);
    }

    // Start typing effect
    this.dialogText.setText('');
    this.currentCharIndex = 0;
    this.isTyping = true;
    this.continueIndicator.setVisible(false);

    this.typingTimer = this.scene.time.addEvent({
      delay: this.typingSpeed,
      callback: this.typeNextChar,
      callbackScope: this,
      repeat: line.text.length - 1,
    });
  }

  private typeNextChar(): void {
    const line = this.lines[this.currentLineIndex];
    if (!line) return;

    this.currentCharIndex++;
    this.dialogText.setText(line.text.substring(0, this.currentCharIndex));

    if (this.currentCharIndex >= line.text.length) {
      this.finishTyping();
    }
  }

  private finishTyping(): void {
    this.isTyping = false;
    this.continueIndicator.setVisible(true);
    this.stopTyping();
  }

  private stopTyping(): void {
    if (this.typingTimer) {
      this.typingTimer.destroy();
      this.typingTimer = null;
    }
  }

  private handleInput = (): void => {
    if (!this.visible) return;

    if (this.isTyping) {
      // Skip to end of current line
      const line = this.lines[this.currentLineIndex];
      if (line) {
        this.stopTyping();
        this.dialogText.setText(line.text);
        this.finishTyping();
      }
    } else {
      // Advance to next line
      this.currentLineIndex++;
      if (this.currentLineIndex < this.lines.length) {
        this.showCurrentLine();
      } else {
        this.complete();
      }
    }
  };

  private complete(): void {
    this.hide();
    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Check if dialog is currently showing
   */
  isShowing(): boolean {
    return this.visible;
  }

  destroy(): void {
    this.scene.input.keyboard?.off('keydown-SPACE', this.handleInput, this);
    this.scene.input.keyboard?.off('keydown-ENTER', this.handleInput, this);
    this.scene.input.off('pointerdown', this.handleInput, this);
    this.stopTyping();
    if (this.blinkTween) {
      this.blinkTween.stop();
      this.blinkTween = undefined;
    }
    super.destroy();
  }
}
