import Phaser from 'phaser';
import { COLORS, DEPTH, FONT_FAMILY } from '../../config/constants';
import { HUD_HEIGHT, VIEW_WIDTH } from '../../config/layout';

const BUTTON_HEIGHT = 32;
const BUTTON_GAP = 6;
const EDGE_MARGIN = 10;

export interface HudButton {
  setLabel(text: string): void;
  /** Draw the button as "on" (its sheet is open). */
  setActive(active: boolean): void;
}

/**
 * Top bar of the visual novel screen: chapter label on the left, small buttons (settings,
 * language, PL, BS) on the right. The buttons are drawn compact but their tap area fills the bar.
 */
export class Hud extends Phaser.GameObjects.Container {
  private nextRight = VIEW_WIDTH - EDGE_MARGIN;

  constructor(scene: Phaser.Scene, chapterLabel: string) {
    super(scene, 0, 0);

    const bar = scene.add.graphics();
    bar.fillStyle(0x0a0a1e, 0.9);
    bar.fillRect(0, 0, VIEW_WIDTH, HUD_HEIGHT);
    bar.lineStyle(1, 0x2a2a4a, 1);
    bar.lineBetween(0, HUD_HEIGHT - 0.5, VIEW_WIDTH, HUD_HEIGHT - 0.5);
    this.add(bar);

    const label = scene.add.text(EDGE_MARGIN + 2, HUD_HEIGHT / 2, chapterLabel, {
      fontFamily: FONT_FAMILY,
      fontSize: '15px',
      color: '#ffd700',
      fontStyle: 'bold',
      padding: { top: 4, bottom: 4 },
    });
    label.setOrigin(0, 0.5);
    this.add(label);

    this.setDepth(DEPTH.UI_PANEL);
    scene.add.existing(this);
  }

  /** Add a button to the right group; buttons are added right to left. */
  addButton(text: string, width: number, borderColor: number, onTap: () => void): HudButton {
    const { scene } = this;
    const x = this.nextRight - width;
    this.nextRight = x - BUTTON_GAP;
    const y = (HUD_HEIGHT - BUTTON_HEIGHT) / 2;

    const container = scene.add.container(x, y);
    const bg = scene.add.graphics();
    const label = scene.add.text(width / 2, BUTTON_HEIGHT / 2, text, {
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
      padding: { top: 4, bottom: 4 },
    });
    label.setOrigin(0.5);
    container.add([bg, label]);

    let active = false;
    let pressed = false;
    const draw = (): void => {
      bg.clear();
      bg.fillStyle(active ? borderColor : pressed ? 0x3a3a5a : 0x1a1a2e, active ? 0.35 : 1);
      bg.fillRoundedRect(0, 0, width, BUTTON_HEIGHT, 8);
      bg.lineStyle(2, borderColor, active ? 1 : 0.8);
      bg.strokeRoundedRect(0, 0, width, BUTTON_HEIGHT, 8);
    };
    draw();

    // The tap area is taller and wider than the drawn button
    const zone = scene.add.zone(width / 2, BUTTON_HEIGHT / 2, width + BUTTON_GAP, HUD_HEIGHT);
    zone.setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      pressed = true;
      draw();
    });
    zone.on('pointerout', () => {
      pressed = false;
      draw();
    });
    zone.on('pointerup', () => {
      if (pressed) {
        pressed = false;
        draw();
        onTap();
      }
    });
    container.add(zone);
    this.add(container);

    return {
      setLabel: (next: string) => label.setText(next),
      setActive: (next: boolean) => {
        active = next;
        draw();
      },
    };
  }
}

/** Accent colours the HUD buttons use for the report sheets. */
export const HUD_COLORS = {
  balanceSheet: COLORS.ASSETS,
  incomeStatement: COLORS.REVENUE,
  neutral: 0x5a5a7a,
};
