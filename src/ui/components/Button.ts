import Phaser from 'phaser';
import { COLORS } from '../../config/constants';

export interface ButtonConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  text: string;
  fontSize?: number;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Pixel-art style button component
 */
export class Button extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private isDisabled: boolean;
  private onClick?: () => void;
  private buttonWidth: number;
  private buttonHeight: number;

  constructor(scene: Phaser.Scene, config: ButtonConfig) {
    super(scene, config.x, config.y);

    this.buttonWidth = config.width ?? 160;
    this.buttonHeight = config.height ?? 40;
    this.isDisabled = config.disabled ?? false;
    this.onClick = config.onClick;

    // Create background
    this.background = scene.add.graphics();
    this.drawButton('normal');
    this.add(this.background);

    // Create label
    this.label = scene.add.text(0, 0, config.text, {
      fontFamily: '"Courier New", monospace',
      fontSize: `${config.fontSize ?? 16}px`,
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.label.setOrigin(0.5);
    this.add(this.label);

    // Set up interactivity
    this.setSize(this.buttonWidth, this.buttonHeight);
    this.setInteractive({ useHandCursor: !this.isDisabled });

    if (!this.isDisabled) {
      this.on('pointerover', this.onHover, this);
      this.on('pointerout', this.onOut, this);
      this.on('pointerdown', this.onDown, this);
      this.on('pointerup', this.onUp, this);
    }

    scene.add.existing(this);
  }

  private drawButton(state: 'normal' | 'hover' | 'pressed'): void {
    this.background.clear();

    const w = this.buttonWidth;
    const h = this.buttonHeight;
    const x = -w / 2;
    const y = -h / 2;

    let fillColor: number;
    let borderColor: number;
    let shadowOffset = 4;

    if (this.isDisabled) {
      fillColor = 0x4a4a4a;
      borderColor = 0x3a3a3a;
      shadowOffset = 2;
    } else {
      switch (state) {
        case 'hover':
          fillColor = COLORS.BUTTON_HOVER;
          borderColor = COLORS.ASSETS;
          break;
        case 'pressed':
          fillColor = 0x3a3a5a;
          borderColor = COLORS.ASSETS;
          shadowOffset = 1;
          break;
        default:
          fillColor = COLORS.BUTTON;
          borderColor = 0x5a5a7a;
      }
    }

    // Shadow
    this.background.fillStyle(0x000000, 0.3);
    this.background.fillRoundedRect(x + 2, y + shadowOffset, w, h, 4);

    // Main button
    this.background.fillStyle(fillColor);
    this.background.fillRoundedRect(x, y, w, h, 4);

    // Border
    this.background.lineStyle(2, borderColor);
    this.background.strokeRoundedRect(x, y, w, h, 4);

    // Highlight
    if (!this.isDisabled && state !== 'pressed') {
      this.background.lineStyle(1, 0xffffff, 0.2);
      this.background.lineBetween(x + 4, y + 4, x + w - 4, y + 4);
    }
  }

  private onHover(): void {
    if (!this.isDisabled) {
      this.drawButton('hover');
    }
  }

  private onOut(): void {
    if (!this.isDisabled) {
      this.drawButton('normal');
    }
  }

  private onDown(): void {
    if (!this.isDisabled) {
      this.drawButton('pressed');
      this.label.y = 2;
    }
  }

  private onUp(): void {
    if (!this.isDisabled) {
      this.drawButton('hover');
      this.label.y = 0;
      if (this.onClick) {
        this.onClick();
      }
    }
  }

  /**
   * Enable the button
   */
  enable(): void {
    this.isDisabled = false;
    this.setInteractive({ useHandCursor: true });
    this.drawButton('normal');
    this.label.setAlpha(1);
  }

  /**
   * Disable the button
   */
  disable(): void {
    this.isDisabled = true;
    this.removeInteractive();
    this.drawButton('normal');
    this.label.setAlpha(0.5);
  }

  /**
   * Update button text
   */
  setText(text: string): void {
    this.label.setText(text);
  }

  /**
   * Set click callback
   */
  setOnClick(callback: () => void): void {
    this.onClick = callback;
  }
}
