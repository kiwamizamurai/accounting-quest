import Phaser from 'phaser';
import { COLORS, SCENES, FONT_FAMILY, TITLE_ICON_KEY } from '../config/constants';
import { VIEW_WIDTH, fitViewToWindow, getViewHeight } from '../config/layout';
import { Button } from '../ui/components/Button';
import { getLanguage, setLanguage, t } from '../i18n';
import { SaveLoadManager } from '../state/SaveLoadManager';
import { GameStateManager } from '../state/GameStateManager';
import { applyRenderScale } from '../utils/renderScale';
import { SettingsPanel } from '../ui/components/SettingsPanel';

export class TitleScene extends Phaser.Scene {
  private stars: { x: number; y: number; speed: number; size: number }[] = [];
  private starGraphics!: Phaser.GameObjects.Graphics;
  private langButton!: Phaser.GameObjects.Text;
  private uiElements: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super(SCENES.MENU);
  }

  create(): void {
    fitViewToWindow(this.game);
    applyRenderScale(this);
    this.uiElements = [];

    // Create starfield
    this.stars = [];
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Math.random() * VIEW_WIDTH,
        y: Math.random() * getViewHeight(),
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
    const height = getViewHeight();
    const cx = VIEW_WIDTH / 2;
    const iconY = Math.round(height * 0.2);

    // Icon: the pixel-art lemon slice split by a T-account
    if (this.textures.exists(TITLE_ICON_KEY)) {
      const icon = this.add.image(cx, iconY, TITLE_ICON_KEY);
      icon.setDisplaySize(112, 112);
      this.uiElements.push(icon);
      this.tweens.add({
        targets: icon,
        y: iconY + 6,
        duration: 2400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Title
    const title = this.add.text(cx, iconY + 92, t('menu.title'), {
      fontFamily: FONT_FAMILY,
      fontSize: '30px',
      color: '#ffd700',
      fontStyle: 'bold',
      padding: { top: 4, bottom: 4 },
    });
    title.setOrigin(0.5);
    if (title.width > VIEW_WIDTH - 32) {
      title.setScale((VIEW_WIDTH - 32) / title.width);
    }
    this.uiElements.push(title);

    // Bobbing animation for title
    this.tweens.add({
      targets: title,
      y: iconY + 96,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    const subtitle = this.add.text(
      cx,
      iconY + 138,
      lang === 'ja' ? 'レモネードスタンドで学ぶ会計入門' : 'Learn Accounting Through a Lemonade Stand',
      {
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
        color: '#aaaacc',
        align: 'center',
        wordWrap: { width: VIEW_WIDTH - 48, useAdvancedWrap: true },
        padding: { top: 4, bottom: 4 },
      }
    );
    subtitle.setOrigin(0.5);
    this.uiElements.push(subtitle);

    // Visual novel style tagline
    const tagline = this.add.text(
      cx,
      iconY + 172,
      lang === 'ja' ? '~ ビジュアルノベル ~' : '~ A Visual Novel ~',
      {
        fontFamily: FONT_FAMILY,
        fontSize: '13px',
        color: '#6a6a8a',
        padding: { top: 4, bottom: 4 },
      }
    );
    tagline.setOrigin(0.5);
    this.uiElements.push(tagline);

    // Menu buttons, stacked and wide so they are easy to tap
    const buttonY = Math.max(iconY + 250, Math.round(height * 0.56));
    const buttonWidth = 260;
    const buttonHeight = 52;
    const buttonStep = 66;

    const newGameBtn = new Button(this, {
      x: cx,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      text: lang === 'ja' ? 'はじめから' : 'New Game',
      onClick: () => this.startNewGame(),
    });
    this.uiElements.push(newGameBtn);

    const hasSaves = SaveLoadManager.getAllSaveSlots().some(s => s !== null) || SaveLoadManager.hasAutoSave();
    const continueBtn = new Button(this, {
      x: cx,
      y: buttonY + buttonStep,
      width: buttonWidth,
      height: buttonHeight,
      text: lang === 'ja' ? 'つづきから' : 'Continue',
      disabled: !hasSaves,
      onClick: () => this.showLoadMenu(),
    });
    this.uiElements.push(continueBtn);

    const settingsBtn = new Button(this, {
      x: cx,
      y: buttonY + buttonStep * 2,
      width: buttonWidth,
      height: buttonHeight,
      text: lang === 'ja' ? '設定' : 'Settings',
      onClick: () => this.showSettingsPanel(),
    });
    this.uiElements.push(settingsBtn);

    // Language toggle (small, top right, with a larger tap area)
    this.langButton = this.add.text(
      VIEW_WIDTH - 16,
      16,
      lang === 'ja' ? 'EN' : 'JA',
      {
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
        color: '#ffffff',
        backgroundColor: '#4a4a6a',
        padding: { x: 12, y: 8 },
      }
    );
    this.langButton.setOrigin(1, 0);
    this.langButton.setInteractive({ useHandCursor: true });
    this.langButton.on('pointerup', () => {
      setLanguage(lang === 'ja' ? 'en' : 'ja');
      this.createUI();
    });
    this.uiElements.push(this.langButton);

    // Controls hint (keyboard players)
    const controls = this.add.text(
      cx,
      height - 28,
      lang === 'ja' ? 'タップ / Space / Enter で進む' : 'Tap / Space / Enter to advance',
      {
        fontFamily: FONT_FAMILY,
        fontSize: '12px',
        color: '#6a6a8a',
        padding: { top: 4, bottom: 4 },
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
    // The auto-save (written by VNScene at the start of each chapter) is listed first
    const autoInfo = SaveLoadManager.getAutoSaveInfo();
    const entries: { label: string; info: ReturnType<typeof SaveLoadManager.getAutoSaveInfo>; load: () => GameStateManager | null }[] = [
      ...(autoInfo
        ? [{
            label: lang === 'ja' ? 'オートセーブ' : 'Auto-save',
            info: autoInfo,
            load: () => SaveLoadManager.loadAutoSave(),
          }]
        : []),
      ...SaveLoadManager.getAllSaveSlots().map((info, index) => ({
        label: `Slot ${index + 1}`,
        info,
        load: () => SaveLoadManager.loadGame(index + 1),
      })),
    ];

    const height = getViewHeight();
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.65);
    overlay.fillRect(0, 0, VIEW_WIDTH, height);
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, VIEW_WIDTH, height),
      Phaser.Geom.Rectangle.Contains
    );
    this.uiElements.push(overlay);

    const boxWidth = 330;
    const boxHeight = 66 * entries.length + 130;
    const boxX = (VIEW_WIDTH - boxWidth) / 2;
    const boxY = Math.max(16, (height - boxHeight) / 2);

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.98);
    bg.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 14);
    bg.lineStyle(2, COLORS.ASSETS, 0.8);
    bg.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 14);
    bg.setInteractive(
      new Phaser.Geom.Rectangle(boxX, boxY, boxWidth, boxHeight),
      Phaser.Geom.Rectangle.Contains
    );
    this.uiElements.push(bg);

    const titleText = this.add.text(
      VIEW_WIDTH / 2,
      boxY + 32,
      lang === 'ja' ? 'ロード' : 'Load Game',
      {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        color: '#ffd700',
        fontStyle: 'bold',
        padding: { top: 4, bottom: 4 },
      }
    );
    titleText.setOrigin(0.5);
    this.uiElements.push(titleText);

    entries.forEach((entry, index) => {
      const slotY = boxY + 88 + index * 66;
      if (entry.info) {
        const info = `${entry.info.playerName} - Ch.${entry.info.chapter} - ${SaveLoadManager.formatPlayTime(entry.info.playTime)}`;
        const btn = new Button(this, {
          x: VIEW_WIDTH / 2,
          y: slotY,
          width: 298,
          height: 52,
          text: `${entry.label}: ${info}`,
          fontSize: 13,
          onClick: () => {
            const manager = entry.load();
            if (manager) {
              const chapter = manager.getPlayer().currentChapter;
              this.scene.start('VNScene', { chapterId: chapter });
            }
          },
        });
        this.uiElements.push(btn);
      } else {
        const empty = this.add.text(VIEW_WIDTH / 2, slotY, `${entry.label}: ${lang === 'ja' ? '空き' : 'Empty'}`, {
          fontFamily: FONT_FAMILY,
          fontSize: '15px',
          color: '#6a6a8a',
          padding: { top: 4, bottom: 4 },
        });
        empty.setOrigin(0.5);
        this.uiElements.push(empty);
      }
    });

    const backBtn = new Button(this, {
      x: VIEW_WIDTH / 2,
      y: boxY + boxHeight - 40,
      width: 140,
      height: 44,
      text: lang === 'ja' ? '戻る' : 'Back',
      onClick: () => this.createUI(),
    });
    this.uiElements.push(backBtn);
  }

  private showSettingsPanel(): void {
    const panel = new SettingsPanel(this, () => this.createUI());
    this.uiElements.push(panel);
  }

  update(): void {
    // Animate stars
    this.starGraphics.clear();
    for (const star of this.stars) {
      star.y += star.speed;
      if (star.y > getViewHeight()) {
        star.y = 0;
        star.x = Math.random() * VIEW_WIDTH;
      }
      const alpha = 0.3 + Math.sin(Date.now() * 0.001 + star.x) * 0.3;
      this.starGraphics.fillStyle(0xffffff, alpha);
      this.starGraphics.fillRect(star.x, star.y, star.size, star.size);
    }
  }
}
