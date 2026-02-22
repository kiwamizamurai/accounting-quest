import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, SCENES } from '../config/constants';
import { Button } from '../ui/components/Button';
import { getLanguage, setLanguage } from '../i18n';
import { SaveLoadManager } from '../state/SaveLoadManager';

export class TitleScene extends Phaser.Scene {
  private stars: { x: number; y: number; speed: number; size: number }[] = [];
  private starGraphics!: Phaser.GameObjects.Graphics;
  private langButton!: Phaser.GameObjects.Text;
  private uiElements: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super(SCENES.MENU);
  }

  create(): void {
    this.uiElements = [];

    // Create starfield
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        speed: 0.1 + Math.random() * 0.5,
        size: Math.random() < 0.3 ? 2 : 1,
      });
    }
    this.starGraphics = this.add.graphics();

    this.createUI();
  }

  private createUI(): void {
    // Destroy previous UI elements
    for (const el of this.uiElements) {
      el.destroy();
    }
    this.uiElements = [];

    const lang = getLanguage();

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 120, 'The Accounting Game', {
      fontFamily: '"Courier New", monospace',
      fontSize: '36px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);
    this.uiElements.push(title);

    // Subtitle
    const subtitle = this.add.text(
      GAME_WIDTH / 2,
      170,
      lang === 'ja' ? 'レモネードスタンドで学ぶ会計入門' : 'Learn Accounting Through a Lemonade Stand',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#aaaacc',
      }
    );
    subtitle.setOrigin(0.5);
    this.uiElements.push(subtitle);

    // Bobbing animation for title
    this.tweens.add({
      targets: title,
      y: 125,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Visual novel style tagline
    const tagline = this.add.text(
      GAME_WIDTH / 2,
      210,
      lang === 'ja' ? '~ ビジュアルノベル ~' : '~ A Visual Novel ~',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: '#6a6a8a',
      }
    );
    tagline.setOrigin(0.5);
    this.uiElements.push(tagline);

    // New Game button
    const newGameBtn = new Button(this, {
      x: GAME_WIDTH / 2,
      y: 310,
      width: 200,
      height: 44,
      text: lang === 'ja' ? 'はじめから' : 'New Game',
      onClick: () => this.startNewGame(),
    });
    this.uiElements.push(newGameBtn);

    // Continue button
    const hasSaves = SaveLoadManager.getAllSaveSlots().some(s => s !== null);
    const continueBtn = new Button(this, {
      x: GAME_WIDTH / 2,
      y: 370,
      width: 200,
      height: 44,
      text: lang === 'ja' ? 'つづきから' : 'Continue',
      disabled: !hasSaves,
      onClick: () => this.showLoadMenu(),
    });
    this.uiElements.push(continueBtn);

    // Language toggle
    this.langButton = this.add.text(
      GAME_WIDTH - 30,
      20,
      lang === 'ja' ? 'EN' : 'JA',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#4a4a6a',
        padding: { x: 8, y: 4 },
      }
    );
    this.langButton.setOrigin(1, 0);
    this.langButton.setInteractive({ useHandCursor: true });
    this.langButton.on('pointerdown', () => {
      setLanguage(lang === 'ja' ? 'en' : 'ja');
      this.createUI();
    });
    this.uiElements.push(this.langButton);

    // Controls hint
    const controls = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 40,
      lang === 'ja' ? 'Space/Enter: 決定 | 矢印キー: 選択' : 'Space/Enter: Select | Arrow Keys: Navigate',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        color: '#6a6a8a',
      }
    );
    controls.setOrigin(0.5);
    this.uiElements.push(controls);
  }

  private startNewGame(): void {
    const lang = getLanguage();
    const playerName = lang === 'ja' ? '勇者' : 'Hero';
    this.scene.start('LevelSelectScene', { playerName });
  }

  private showLoadMenu(): void {
    const lang = getLanguage();
    const slots = SaveLoadManager.getAllSaveSlots();

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT),
      Phaser.Geom.Rectangle.Contains
    );
    this.uiElements.push(overlay);

    const boxWidth = 400;
    const boxHeight = 300;
    const boxX = (GAME_WIDTH - boxWidth) / 2;
    const boxY = (GAME_HEIGHT - boxHeight) / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 8);
    bg.lineStyle(2, COLORS.ASSETS, 0.8);
    bg.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 8);
    this.uiElements.push(bg);

    const titleText = this.add.text(
      GAME_WIDTH / 2,
      boxY + 25,
      lang === 'ja' ? 'ロード' : 'Load Game',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        color: '#ffd700',
        fontStyle: 'bold',
      }
    );
    titleText.setOrigin(0.5);
    this.uiElements.push(titleText);

    slots.forEach((slot, index) => {
      const slotY = boxY + 70 + index * 60;
      if (slot) {
        const info = `${slot.playerName} - Ch.${slot.chapter} - ${SaveLoadManager.formatPlayTime(slot.playTime)}`;
        const btn = new Button(this, {
          x: GAME_WIDTH / 2,
          y: slotY,
          width: 340,
          height: 44,
          text: `Slot ${index + 1}: ${info}`,
          fontSize: 13,
          onClick: () => {
            const manager = SaveLoadManager.loadGame(index + 1);
            if (manager) {
              const chapter = manager.getPlayer().currentChapter;
              this.scene.start('VNScene', { chapterId: chapter });
            }
          },
        });
        this.uiElements.push(btn);
      } else {
        const empty = this.add.text(GAME_WIDTH / 2, slotY, `Slot ${index + 1}: ${lang === 'ja' ? '空き' : 'Empty'}`, {
          fontFamily: '"Courier New", monospace',
          fontSize: '14px',
          color: '#6a6a8a',
        });
        empty.setOrigin(0.5);
        this.uiElements.push(empty);
      }
    });

    const backBtn = new Button(this, {
      x: GAME_WIDTH / 2,
      y: boxY + boxHeight - 35,
      width: 120,
      height: 36,
      text: lang === 'ja' ? '戻る' : 'Back',
      onClick: () => this.createUI(),
    });
    this.uiElements.push(backBtn);
  }

  update(): void {
    // Animate stars
    this.starGraphics.clear();
    for (const star of this.stars) {
      star.y += star.speed;
      if (star.y > GAME_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * GAME_WIDTH;
      }
      const alpha = 0.3 + Math.sin(Date.now() * 0.001 + star.x) * 0.3;
      this.starGraphics.fillStyle(0xffffff, alpha);
      this.starGraphics.fillRect(star.x, star.y, star.size, star.size);
    }
  }
}
