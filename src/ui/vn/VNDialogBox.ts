import Phaser from 'phaser';
import { COLORS, DEPTH, ANIMATION, FONT_FAMILY } from '../../config/constants';
import { getVNLayout, DIALOG_TAG_HEIGHT, Rect } from '../../config/layout';
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
  private inputBlocked = false;
  private blinkTween?: Phaser.Tweens.Tween;

  private box: Rect;
  private tagColor: number = COLORS.ASSETS;
  private compact = false;
  private padding = 16;
  // Text sizes tried from the largest; the first one that fits the box is used
  private static readonly FONT_SIZES = [17, 16, 15, 14, 13];
  private static readonly COMPACT_FONT_SIZES = [14, 13, 12];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.typingSpeed = ANIMATION.DIALOG_SPEED;
    this.box = getVNLayout().dialog;

    // Background
    this.background = scene.add.graphics();
    this.add(this.background);

    // Speaker name background
    this.speakerBg = scene.add.graphics();
    this.add(this.speakerBg);

    // Speaker name
    this.speakerText = scene.add.text(0, 0, '', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      padding: { top: 4, bottom: 4 },
    });
    this.add(this.speakerText);

    // Dialog text
    this.dialogText = scene.add.text(0, 0, '', {
      fontFamily: FONT_FAMILY,
      fontSize: '17px',
      color: '#ffffff',
      lineSpacing: 6,
      padding: { top: 4, bottom: 4 },
    });
    this.add(this.dialogText);

    // Continue indicator
    this.continueIndicator = scene.add.text(0, 0, '\u25BC', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#ffd700',
      padding: { top: 4, bottom: 4 },
    });
    this.continueIndicator.setOrigin(1, 1);
    this.continueIndicator.setVisible(false);
    this.add(this.continueIndicator);

    this.blinkTween = scene.tweens.add({
      targets: this.continueIndicator,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this.applyLayout();
    this.setDepth(DEPTH.DIALOG);
    this.setVisible(false);

    scene.add.existing(this);
  }

  /** Shrink the box to a couple of lines (a report sheet is open above it) or restore the full size. */
  setCompact(compact: boolean): void {
    if (this.compact === compact) return;
    this.compact = compact;
    this.applyLayout();
  }

  /** The box's current area (the speaker tag sits above it). */
  getBox(): Rect {
    return this.box;
  }

  private applyLayout(): void {
    this.box = getVNLayout(this.compact).dialog;
    const { x, y, w, h } = this.box;

    this.drawBackground();
    this.speakerText.setPosition(x + this.padding + 8, y - DIALOG_TAG_HEIGHT + 3);
    this.dialogText.setPosition(x + this.padding, y + 12);
    this.dialogText.setWordWrapWidth(w - this.padding * 2, true);
    this.continueIndicator.setPosition(x + w - 12, y + h - 8);
    this.drawSpeakerTag(this.tagColor);
    this.fitText();
  }

  /** Use the largest text size at which the whole current text fits inside the box. */
  private fitText(): void {
    const sizes = this.compact ? VNDialogBox.COMPACT_FONT_SIZES : VNDialogBox.FONT_SIZES;
    const room = this.box.h - 12 - 14;
    const shown = this.dialogText.text;
    this.dialogText.setText(this.currentText || shown);
    let chosen = sizes[sizes.length - 1];
    for (const size of sizes) {
      this.dialogText.setFontSize(size);
      this.dialogText.setLineSpacing(Math.round(size * 0.35));
      if (this.dialogText.height <= room) {
        chosen = size;
        break;
      }
    }
    this.dialogText.setFontSize(chosen);
    this.dialogText.setLineSpacing(Math.round(chosen * 0.35));
    this.dialogText.setText(shown);
  }

  private drawBackground(): void {
    const { x, y, w, h } = this.box;
    this.background.clear();

    // Semi-transparent background
    this.background.fillStyle(0x0a0a1e, 0.94);
    this.background.fillRoundedRect(x, y, w, h, 12);

    // Border
    this.background.lineStyle(2, 0x4a90d9, 0.8);
    this.background.strokeRoundedRect(x, y, w, h, 12);
  }

  private drawSpeakerTag(speakerColor: number): void {
    this.speakerBg.clear();
    const text = this.speakerText.text;
    if (!text) return;

    const tagWidth = this.speakerText.width + 24;
    this.speakerBg.fillStyle(speakerColor, 0.95);
    this.speakerBg.fillRoundedRect(
      this.box.x + this.padding,
      this.box.y - DIALOG_TAG_HEIGHT,
      tagWidth,
      DIALOG_TAG_HEIGHT + 6,
      6
    );
  }

  showDialog(speaker: string, text: string, onAdvance?: () => void): void {
    this.stopTyping();
    const speakerName = getCharacterName(speaker);
    this.tagColor = this.getSpeakerColor(speaker);

    this.speakerText.setText(speakerName);
    this.drawSpeakerTag(this.tagColor);

    this.currentText = text;
    this.displayedText = '';
    this.currentCharIndex = 0;
    this.onAdvance = onAdvance;
    this.inputLocked = false;

    this.dialogText.setText('');
    this.dialogText.setColor('#ffffff');
    this.fitText();
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
    this.stopTyping();
    this.speakerText.setText('');
    this.speakerBg.clear();

    this.currentText = text;
    this.displayedText = '';
    this.currentCharIndex = 0;
    this.onAdvance = onAdvance;
    this.inputLocked = false;

    this.dialogText.setText('');
    this.dialogText.setColor('#aaaaff');
    this.fitText();
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

  blockInput(): void {
    this.inputBlocked = true;
  }

  unblockInput(): void {
    this.inputBlocked = false;
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
    if (!this.visible || this.inputLocked || this.inputBlocked) return;

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

  private handlePointerInput = (
    _pointer: Phaser.Input.Pointer,
    currentlyOver: Phaser.GameObjects.GameObject[]
  ): void => {
    if (currentlyOver && currentlyOver.length > 0) return;
    this.handleInput();
  };

  private enableInput(): void {
    this.disableInput();
    this.scene.input.keyboard?.on('keydown-SPACE', this.handleInput, this);
    this.scene.input.keyboard?.on('keydown-ENTER', this.handleInput, this);
    this.scene.input.on('pointerdown', this.handlePointerInput, this);
  }

  private disableInput(): void {
    this.scene.input.keyboard?.off('keydown-SPACE', this.handleInput, this);
    this.scene.input.keyboard?.off('keydown-ENTER', this.handleInput, this);
    this.scene.input.off('pointerdown', this.handlePointerInput, this);
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
    if (this.blinkTween) {
      this.blinkTween.stop();
      this.blinkTween = undefined;
    }
    super.destroy();
  }
}
