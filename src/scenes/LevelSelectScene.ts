import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, SCENES } from '../config/constants';
import { Button } from '../ui/components/Button';
import { getLanguage } from '../i18n';
import { LEVEL_CONFIGS, GameLevel } from '../config/chapters.config';
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

    // Title
    const title = this.add.text(
      GAME_WIDTH / 2,
      50,
      lang === 'ja' ? 'レベルを選択' : 'Select Level',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '28px',
        color: '#ffd700',
        fontStyle: 'bold',
      }
    );
    title.setOrigin(0.5);
    this.uiElements.push(title);

    // Level cards
    const cardWidth = 220;
    const cardHeight = 340;
    const cardSpacing = 30;
    const totalWidth = cardWidth * 3 + cardSpacing * 2;
    const startX = (GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;

    LEVEL_CONFIGS.forEach((config, index) => {
      const x = startX + index * (cardWidth + cardSpacing);
      const y = GAME_HEIGHT / 2 + 10;
      this.createLevelCard(x, y, cardWidth, cardHeight, config.id as GameLevel, config);
    });

    // Back button
    const backBtn = new Button(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - 40,
      width: 120,
      height: 36,
      text: lang === 'ja' ? '戻る' : 'Back',
      onClick: () => this.scene.start(SCENES.MENU),
    });
    this.uiElements.push(backBtn);
  }

  private createLevelCard(
    x: number,
    y: number,
    width: number,
    height: number,
    level: GameLevel,
    config: typeof LEVEL_CONFIGS[number]
  ): void {
    const lang = getLanguage();

    // Card background
    const bg = this.add.graphics();
    const bgX = x - width / 2;
    const bgY = y - height / 2;

    // Colors per level
    const levelColors = [COLORS.ASSETS, COLORS.REVENUE, COLORS.EXPENSES];
    const borderColor = levelColors[level - 1];

    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRoundedRect(bgX, bgY, width, height, 8);
    bg.lineStyle(2, borderColor, 0.8);
    bg.strokeRoundedRect(bgX, bgY, width, height, 8);
    this.uiElements.push(bg);

    // Level badge
    const badge = this.add.text(x, bgY + 25, `Lv.${level}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: `#${borderColor.toString(16).padStart(6, '0')}`,
      padding: { x: 10, y: 4 },
    });
    badge.setOrigin(0.5);
    this.uiElements.push(badge);

    // Title
    const titleText = lang === 'ja' ? config.titleJa : config.title;
    const titleObj = this.add.text(x, bgY + 65, titleText, {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 20 },
    });
    titleObj.setOrigin(0.5);
    this.uiElements.push(titleObj);

    // Subtitle
    const subtitleText = lang === 'ja' ? config.subtitleJa : config.subtitle;
    const subtitleObj = this.add.text(x, bgY + 95, subtitleText, {
      fontFamily: '"Courier New", monospace',
      fontSize: '11px',
      color: '#aaaacc',
      align: 'center',
      wordWrap: { width: width - 20 },
    });
    subtitleObj.setOrigin(0.5);
    this.uiElements.push(subtitleObj);

    // Separator line
    const line = this.add.graphics();
    line.lineStyle(1, borderColor, 0.4);
    line.lineBetween(bgX + 15, bgY + 115, bgX + width - 15, bgY + 115);
    this.uiElements.push(line);

    // Description
    const descText = lang === 'ja' ? config.descriptionJa : config.description;
    const descObj = this.add.text(x, bgY + 130, descText, {
      fontFamily: '"Courier New", monospace',
      fontSize: '10px',
      color: '#8888aa',
      align: 'center',
      wordWrap: { width: width - 30, useAdvancedWrap: true },
      lineSpacing: 4,
    });
    descObj.setOrigin(0.5, 0);
    this.uiElements.push(descObj);

    // Chapter count
    const chapterCount = config.chapters.length;
    const chapterText = lang === 'ja'
      ? `${chapterCount}章`
      : `${chapterCount} Chapters`;
    const chapterObj = this.add.text(x, bgY + height - 65, chapterText, {
      fontFamily: '"Courier New", monospace',
      fontSize: '11px',
      color: '#6a6a8a',
    });
    chapterObj.setOrigin(0.5);
    this.uiElements.push(chapterObj);

    // Hover effect on card (must be added before button so button stays on top)
    const hitArea = this.add.rectangle(x, y, width, height);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.setAlpha(0.001);
    hitArea.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x2a2a3e, 0.95);
      bg.fillRoundedRect(bgX, bgY, width, height, 8);
      bg.lineStyle(2, borderColor, 1);
      bg.strokeRoundedRect(bgX, bgY, width, height, 8);
    });
    hitArea.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x1a1a2e, 0.95);
      bg.fillRoundedRect(bgX, bgY, width, height, 8);
      bg.lineStyle(2, borderColor, 0.8);
      bg.strokeRoundedRect(bgX, bgY, width, height, 8);
    });
    this.uiElements.push(hitArea);

    // Start button (added after hitArea so it's on top in the display list)
    const firstChapterId = config.chapters[0]?.id ?? 1;
    const btn = new Button(this, {
      x,
      y: bgY + height - 30,
      width: width - 40,
      height: 36,
      text: lang === 'ja' ? 'はじめる' : 'Start',
      onClick: () => this.startLevel(level, firstChapterId),
    });
    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x2a2a3e, 0.95);
      bg.fillRoundedRect(bgX, bgY, width, height, 8);
      bg.lineStyle(2, borderColor, 1);
      bg.strokeRoundedRect(bgX, bgY, width, height, 8);
    });
    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x1a1a2e, 0.95);
      bg.fillRoundedRect(bgX, bgY, width, height, 8);
      bg.lineStyle(2, borderColor, 0.8);
      bg.strokeRoundedRect(bgX, bgY, width, height, 8);
    });
    this.uiElements.push(btn);
  }

  private startLevel(level: GameLevel, firstChapterId: number): void {
    const manager = initGameStateManager(this.playerName, level);
    manager.setCurrentChapter(firstChapterId);
    this.scene.start(SCENES.CHAPTER_TITLE, { chapterId: firstChapterId });
  }
}
