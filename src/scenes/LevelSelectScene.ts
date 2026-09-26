import Phaser from 'phaser';
import { COLORS, SCENES, FONT_FAMILY } from '../config/constants';
import { VIEW_WIDTH, fitViewToWindow, getViewHeight } from '../config/layout';
import { Button } from '../ui/components/Button';
import { getLanguage } from '../i18n';
import { LEVEL_CONFIGS, GameLevel } from '../config/chapters.config';
import { applyRenderScale } from '../utils/renderScale';
import { initGameStateManager } from '../state/GameStateManager';

interface LevelSelectData {
  playerName: string;
}

export class LevelSelectScene extends Phaser.Scene {
  private uiElements: Phaser.GameObjects.GameObject[] = [];
  private playerName: string = '';

  constructor() {
    super(SCENES.LEVEL_SELECT);
  }

  create(data: LevelSelectData): void {
    fitViewToWindow(this.game);
    applyRenderScale(this);
    this.playerName = data.playerName ?? (getLanguage() === 'ja' ? '勇者' : 'Hero');
    this.uiElements = [];

    this.cameras.main.setBackgroundColor('#0a0a1e');
    this.createUI();
  }

  private createUI(): void {
    for (const el of this.uiElements) {
      el.destroy();
    }
    this.uiElements = [];

    const lang = getLanguage();
    const height = getViewHeight();

    // Title
    const title = this.add.text(
      VIEW_WIDTH / 2,
      44,
      lang === 'ja' ? 'レベルを選択' : 'Select Level',
      {
        fontFamily: FONT_FAMILY,
        fontSize: '24px',
        color: '#ffd700',
        fontStyle: 'bold',
        padding: { top: 4, bottom: 4 },
      }
    );
    title.setOrigin(0.5);
    this.uiElements.push(title);

    // Level cards, stacked: each is one big tap target
    const cardGap = 12;
    const top = 84;
    const bottomRoom = 84; // back button
    const cardWidth = VIEW_WIDTH - 30;
    const cardHeight = Math.max(140, Math.min(176, Math.floor((height - top - bottomRoom - cardGap * 2) / 3)));

    LEVEL_CONFIGS.forEach((config, index) => {
      const y = top + index * (cardHeight + cardGap);
      this.createLevelCard(15, y, cardWidth, cardHeight, config.id as GameLevel, config);
    });

    // Back button
    const backBtn = new Button(this, {
      x: VIEW_WIDTH / 2,
      y: height - 42,
      width: 150,
      height: 46,
      text: lang === 'ja' ? '戻る' : 'Back',
      onClick: () => this.scene.start(SCENES.MENU),
    });
    this.uiElements.push(backBtn);
  }

  /** One level as a card; tapping anywhere on it starts the level. `x`, `y` is its top-left corner. */
  private createLevelCard(
    x: number,
    y: number,
    width: number,
    height: number,
    level: GameLevel,
    config: typeof LEVEL_CONFIGS[number]
  ): void {
    const lang = getLanguage();
    const padding = 14;

    // Colors per level
    const levelColors = [COLORS.ASSETS, COLORS.REVENUE, COLORS.EXPENSES];
    const borderColor = levelColors[level - 1];
    const cssColor = `#${borderColor.toString(16).padStart(6, '0')}`;

    const bg = this.add.graphics();
    const draw = (pressed: boolean): void => {
      bg.clear();
      bg.fillStyle(pressed ? 0x2a2a3e : 0x1a1a2e, 0.97);
      bg.fillRoundedRect(x, y, width, height, 12);
      bg.lineStyle(2, borderColor, pressed ? 1 : 0.8);
      bg.strokeRoundedRect(x, y, width, height, 12);
    };
    draw(false);
    this.uiElements.push(bg);

    // Level badge and chapter count on the top row
    const badge = this.add.text(x + padding, y + padding, `Lv.${level}`, {
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: cssColor,
      padding: { x: 10, y: 4 },
    });
    this.uiElements.push(badge);

    const chapterCount = config.chapters.length;
    const chapterObj = this.add.text(
      x + width - padding,
      y + padding + 11,
      lang === 'ja' ? `${chapterCount}章` : `${chapterCount} Chapters`,
      {
        fontFamily: FONT_FAMILY,
        fontSize: '13px',
        color: '#aab0c8',
        padding: { top: 4, bottom: 4 },
      }
    );
    chapterObj.setOrigin(1, 0.5);
    this.uiElements.push(chapterObj);

    // Title and subtitle
    const titleObj = this.add.text(x + padding, y + 46, lang === 'ja' ? config.titleJa : config.title, {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: '#ffd700',
      fontStyle: 'bold',
      wordWrap: { width: width - padding * 2 },
      padding: { top: 4, bottom: 4 },
    });
    this.uiElements.push(titleObj);

    const subtitleObj = this.add.text(x + padding, y + 74, lang === 'ja' ? config.subtitleJa : config.subtitle, {
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      color: '#c0c4dc',
      wordWrap: { width: width - padding * 2, useAdvancedWrap: true },
      padding: { top: 4, bottom: 4 },
    });
    this.uiElements.push(subtitleObj);

    // Description, as many lines as fit above the start prompt
    const descObj = this.add.text(x + padding, y + 98, lang === 'ja' ? config.descriptionJa : config.description, {
      fontFamily: FONT_FAMILY,
      fontSize: '12px',
      color: '#9a9ab8',
      wordWrap: { width: width - padding * 2, useAdvancedWrap: true },
      lineSpacing: 3,
      padding: { top: 2, bottom: 2 },
    });
    const descRoom = y + height - 28 - descObj.y;
    if (descObj.height > descRoom) {
      descObj.setFontSize(11);
    }
    this.uiElements.push(descObj);

    // Start prompt
    const startObj = this.add.text(x + width - padding, y + height - 16, lang === 'ja' ? 'はじめる ▶' : 'Start ▶', {
      fontFamily: FONT_FAMILY,
      fontSize: '15px',
      color: cssColor,
      fontStyle: 'bold',
      padding: { top: 4, bottom: 4 },
    });
    startObj.setOrigin(1, 0.5);
    this.uiElements.push(startObj);

    // The whole card is the tap target
    const firstChapterId = config.chapters[0]?.id ?? 1;
    const hitArea = this.add.zone(x + width / 2, y + height / 2, width, height);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerdown', () => draw(true));
    hitArea.on('pointerout', () => draw(false));
    hitArea.on('pointerup', () => this.startLevel(level, firstChapterId));
    this.uiElements.push(hitArea);
  }

  private startLevel(level: GameLevel, firstChapterId: number): void {
    const manager = initGameStateManager(this.playerName, level);
    manager.setCurrentChapter(firstChapterId);
    this.scene.start(SCENES.CHAPTER_TITLE, { chapterId: firstChapterId });
  }
}
