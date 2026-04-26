import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, DEPTH } from '../config/constants';
import { ScriptEngine, ScriptEngineCallback } from '../vn/ScriptEngine';
import { CharacterPosition } from '../vn/types';
import { getGameStateManager } from '../state/GameStateManager';
import { SaveLoadManager } from '../state/SaveLoadManager';
import { getLanguage, setLanguage } from '../i18n';
import { getAudioManager } from '../managers/AudioManager';
import { Button } from '../ui/components/Button';
import { COLORS } from '../config/constants';
import { VNDialogBox } from '../ui/vn/VNDialogBox';
import { ChoicePanel } from '../ui/vn/ChoicePanel';
import { CharacterPortrait } from '../ui/vn/CharacterPortrait';
import { BackgroundRenderer } from '../ui/vn/BackgroundRenderer';
import { TransactionAnimation } from '../ui/vn/TransactionAnimation';
import { Scorecard } from '../ui/components/Scorecard';
import { chapter1 } from '../data/chapters/chapter1';
import { chapter2 } from '../data/chapters/chapter2';
import { chapter3 } from '../data/chapters/chapter3';
import { chapter4 } from '../data/chapters/chapter4';
import { chapter5 } from '../data/chapters/chapter5';
import { chapter6 } from '../data/chapters/chapter6';
import { chapter7 } from '../data/chapters/chapter7';
import { chapter8 } from '../data/chapters/chapter8';
import { chapter9 } from '../data/chapters/chapter9';
import { chapter10 } from '../data/chapters/chapter10';
// Lv2: Lemonade Corporation
import { chapter101 } from '../data/chapters/chapter101';
import { chapter102 } from '../data/chapters/chapter102';
import { chapter103 } from '../data/chapters/chapter103';
import { chapter104 } from '../data/chapters/chapter104';
import { chapter105 } from '../data/chapters/chapter105';
import { chapter106 } from '../data/chapters/chapter106';
import { chapter107 } from '../data/chapters/chapter107';
import { chapter108 } from '../data/chapters/chapter108';
import { chapter109 } from '../data/chapters/chapter109';
import { chapter110 } from '../data/chapters/chapter110';
import { chapter111 } from '../data/chapters/chapter111';
import { chapter112 } from '../data/chapters/chapter112';
// Lv3: Lemonade Group
import { chapter201 } from '../data/chapters/chapter201';
import { chapter202 } from '../data/chapters/chapter202';
import { chapter203 } from '../data/chapters/chapter203';
import { chapter204 } from '../data/chapters/chapter204';
import { chapter205 } from '../data/chapters/chapter205';
import { chapter206 } from '../data/chapters/chapter206';
import { chapter207 } from '../data/chapters/chapter207';
import { chapter208 } from '../data/chapters/chapter208';
import { chapter209 } from '../data/chapters/chapter209';
import { chapter210 } from '../data/chapters/chapter210';
import { ChapterScript } from '../vn/types';

interface VNSceneData {
  chapterId: number;
}

export class VNScene extends Phaser.Scene {
  private scriptEngine!: ScriptEngine;
  private dialogBox!: VNDialogBox;
  private choicePanel!: ChoicePanel;
  private backgroundRenderer!: BackgroundRenderer;
  private transactionAnim!: TransactionAnimation;
  private scorecard!: Scorecard;
  private portraits: Map<string, CharacterPortrait> = new Map();
  private chapterLabel!: Phaser.GameObjects.Text;
  private settingsButton!: Phaser.GameObjects.Text;
  private langButton!: Phaser.GameObjects.Text;
  private autoSaveTimer?: Phaser.Time.TimerEvent;
  private settingsPanelElements: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super('VNScene');
  }

  create(data: VNSceneData): void {
    const chapterId = data.chapterId ?? 1;
    const gameState = getGameStateManager();
    const lang = getLanguage();

    // Initialize audio manager
    const audioManager = getAudioManager();
    audioManager.init(this);
    audioManager.playBGM(gameState.getState().gameLevel as 1 | 2 | 3);

    // Script engine
    this.scriptEngine = new ScriptEngine(gameState);
    const allChapters: ChapterScript[] = [
      // Lv1: Lemonade Stand
      chapter1, chapter2, chapter3, chapter4, chapter5,
      chapter6, chapter7, chapter8, chapter9, chapter10,
      // Lv2: Lemonade Corporation
      chapter101, chapter102, chapter103, chapter104, chapter105, chapter106,
      chapter107, chapter108, chapter109, chapter110, chapter111, chapter112,
      // Lv3: Lemonade Group
      chapter201, chapter202, chapter203, chapter204, chapter205,
      chapter206, chapter207, chapter208, chapter209, chapter210,
    ];
    for (const ch of allChapters) {
      this.scriptEngine.registerChapter(ch);
    }

    // Background
    this.backgroundRenderer = new BackgroundRenderer(this);

    // UI components
    this.dialogBox = new VNDialogBox(this);
    this.choicePanel = new ChoicePanel(this);
    this.transactionAnim = new TransactionAnimation(this);

    // Scorecard (reused from RPG)
    this.scorecard = new Scorecard(this);
    this.scorecard.setScrollFactor(0);

    // Chapter label (top-left)
    this.chapterLabel = this.add.text(20, 20, `Ch.${chapterId}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#ffd700',
      backgroundColor: '#1a1a2e',
      padding: { x: 8, y: 4 },
    });
    this.chapterLabel.setDepth(DEPTH.UI_TEXT);

    // Settings button (top-right, above language toggle)
    this.settingsButton = this.add.text(GAME_WIDTH - 80, 56, '⚙', {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#4a4a6a',
      padding: { x: 6, y: 3 },
    });
    this.settingsButton.setOrigin(1, 0);
    this.settingsButton.setDepth(DEPTH.UI_TEXT);
    this.settingsButton.setInteractive({ useHandCursor: true });
    this.settingsButton.on('pointerdown', () => {
      this.showSettingsPanel();
    });

    // Language toggle (top-right, below scorecard toggle)
    this.langButton = this.add.text(GAME_WIDTH - 30, 56, lang === 'ja' ? 'EN' : 'JA', {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#4a4a6a',
      padding: { x: 6, y: 3 },
    });
    this.langButton.setOrigin(1, 0);
    this.langButton.setDepth(DEPTH.UI_TEXT);
    this.langButton.setInteractive({ useHandCursor: true });
    this.langButton.on('pointerdown', () => {
      const newLang = getLanguage() === 'ja' ? 'en' : 'ja';
      setLanguage(newLang);
      this.langButton.setText(newLang === 'ja' ? 'EN' : 'JA');
      // Update scorecard to reflect new language
      this.updateScorecard();
      // Re-execute current node to update display language
      const currentNode = this.scriptEngine.getCurrentNode();
      if (currentNode && (currentNode.type === 'dialog' || currentNode.type === 'narration')) {
        this.scriptEngine.advance(currentNode.id);
      }
    });

    // Register shutdown handler for cleanup
    this.events.on('shutdown', this.shutdown, this);

    // Set up script engine callbacks
    this.setupCallbacks();

    // Start the chapter
    this.scriptEngine.startChapter(chapterId);

    // Auto-save timer
    this.autoSaveTimer = this.time.addEvent({
      delay: 60000,
      callback: () => {
        SaveLoadManager.autoSave(gameState);
      },
      loop: true,
    });

    // Update scorecard with initial state
    this.updateScorecard();

    // Keyboard: S to save
    this.input.keyboard?.on('keydown-S', () => {
      SaveLoadManager.autoSave(gameState);
      this.showNotification(getLanguage() === 'ja' ? 'セーブしました' : 'Game Saved');
    });
  }

  private setupCallbacks(): void {
    const callbacks: ScriptEngineCallback = {
      onDialog: (speaker, text, _expression) => {
        this.choicePanel.hide();
        // Play dialog sound
        const audioManager = getAudioManager();
        audioManager.playSFX('dialog');
        // Highlight active speaker
        this.highlightSpeaker(speaker);
        this.dialogBox.showDialog(speaker, text, () => {
          const node = this.scriptEngine.getCurrentNode();
          if (node && 'next' in node) {
            this.scriptEngine.advance(node.next as string);
          }
        });
      },

      onChoice: (prompt, choices) => {
        this.dialogBox.hide();
        this.choicePanel.show(prompt, choices, (index) => {
          this.scriptEngine.selectChoice(index);
        });
      },

      onTransaction: (description, entries, showAnimation) => {
        this.dialogBox.hide();
        // Play transaction SFX
        const audioManager = getAudioManager();
        audioManager.playSFX('transaction');

        if (showAnimation) {
          this.transactionAnim.play(description, entries, () => {
            this.updateScorecard();
            const node = this.scriptEngine.getCurrentNode();
            if (node && 'next' in node) {
              this.scriptEngine.advance(node.next as string);
            }
          });
        } else {
          this.updateScorecard();
          const node = this.scriptEngine.getCurrentNode();
          if (node && 'next' in node) {
            this.scriptEngine.advance(node.next as string);
          }
        }
      },

      onReport: (reportType, message) => {
        this.updateScorecard();

        if (reportType === 'income_statement') {
          // Show PL panel
          if (!this.scorecard.plExpanded) {
            this.scorecard.togglePl();
          }
        } else if (reportType === 'cash_flow') {
          // Show both BS and PL
          if (!this.scorecard.bsExpanded) {
            this.scorecard.toggle();
          }
          if (!this.scorecard.plExpanded) {
            this.scorecard.togglePl();
          }
        } else {
          // balance_sheet (default)
          if (!this.scorecard.bsExpanded) {
            this.scorecard.toggle();
          }
        }

        if (message) {
          this.dialogBox.showNarration(message, () => {
            const node = this.scriptEngine.getCurrentNode();
            if (node && 'next' in node) {
              this.scriptEngine.advance(node.next as string);
            }
          });
        } else {
          // Auto-advance after a delay
          this.time.delayedCall(2000, () => {
            const node = this.scriptEngine.getCurrentNode();
            if (node && 'next' in node) {
              this.scriptEngine.advance(node.next as string);
            }
          });
        }
      },

      onNarration: (text) => {
        this.choicePanel.hide();
        this.dialogBox.showNarration(text, () => {
          const node = this.scriptEngine.getCurrentNode();
          if (node && 'next' in node) {
            this.scriptEngine.advance(node.next as string);
          }
        });
      },

      onCharacterEnter: (character, position, expression) => {
        this.addCharacter(character, position, expression);
        // Auto-advance for character_enter nodes
        const node = this.scriptEngine.getCurrentNode();
        if (node && 'next' in node) {
          this.time.delayedCall(300, () => {
            this.scriptEngine.advance(node.next as string);
          });
        }
      },

      onCharacterExit: (character) => {
        this.removeCharacter(character);
        const node = this.scriptEngine.getCurrentNode();
        if (node && 'next' in node) {
          this.time.delayedCall(300, () => {
            this.scriptEngine.advance(node.next as string);
          });
        }
      },

      onBackgroundChange: (background) => {
        this.backgroundRenderer.setBackground(background);
        const node = this.scriptEngine.getCurrentNode();
        if (node && 'next' in node) {
          this.time.delayedCall(500, () => {
            this.scriptEngine.advance(node.next as string);
          });
        }
      },

      onWait: (duration) => {
        this.time.delayedCall(duration, () => {
          const node = this.scriptEngine.getCurrentNode();
          if (node && 'next' in node) {
            this.scriptEngine.advance(node.next as string);
          }
        });
      },

      onChapterEnd: (nextChapter, summary) => {
        this.dialogBox.hide();
        this.choicePanel.hide();

        if (summary) {
          this.showChapterSummary(summary, nextChapter);
        } else if (nextChapter) {
          this.scene.start('ChapterTitleScene', { chapterId: nextChapter });
        } else {
          this.scene.start('MenuScene');
        }
      },

      onQuiz: (question, options, _correctIndex, correctFeedback, incorrectFeedback) => {
        this.dialogBox.hide();
        this.choicePanel.show(
          question,
          options.map((label) => ({
            labelKey: label,
            next: '',
          })),
          (selectedIndex) => {
            const isCorrect = this.scriptEngine.answerQuiz(selectedIndex);
            const feedback = isCorrect ? correctFeedback : incorrectFeedback;
            this.dialogBox.showNarration(feedback, () => {
              this.updateScorecard();
              this.scriptEngine.advance();
            });
          }
        );
      },

      onJournalEntryInput: (prompt, expectedEntries, correctFeedback, incorrectFeedback, hint) => {
        this.dialogBox.hide();
        // Show the prompt as narration, then present entry options as choices
        const hintText = hint ? `\n${hint}` : '';
        const displayPrompt = `${prompt}${hintText}`;
        // For now, present as a simplified choice between correct and incorrect entries
        const wrongEntries = expectedEntries.map(e => ({
          ...e,
          debit: e.credit,
          credit: e.debit,
        }));
        const choices = [
          { labelKey: expectedEntries.map(e => `${e.account}: Dr ${e.debit ?? 0} / Cr ${e.credit ?? 0}`).join(', '), next: '' },
          { labelKey: wrongEntries.map(e => `${e.account}: Dr ${e.debit ?? 0} / Cr ${e.credit ?? 0}`).join(', '), next: '' },
        ];
        // Randomize order
        const correctFirst = Math.random() < 0.5;
        const orderedChoices = correctFirst ? choices : [choices[1], choices[0]];
        const correctIdx = correctFirst ? 0 : 1;

        this.choicePanel.show(displayPrompt, orderedChoices, (selectedIndex) => {
          const isCorrect = selectedIndex === correctIdx;
          if (isCorrect) {
            this.scriptEngine.submitJournalEntry(expectedEntries);
          } else {
            this.scriptEngine.submitJournalEntry(wrongEntries);
          }
          const feedback = isCorrect ? correctFeedback : incorrectFeedback;
          this.dialogBox.showNarration(feedback, () => {
            this.updateScorecard();
            this.scriptEngine.advance();
          });
        });
      },
    };

    this.scriptEngine.setCallbacks(callbacks);
  }

  private addCharacter(characterId: string, position: CharacterPosition, expression?: string): void {
    // Remove existing portrait for this character
    this.removeCharacter(characterId);

    let x: number;
    switch (position) {
      case 'left':
        x = 150;
        break;
      case 'right':
        x = GAME_WIDTH - 150;
        break;
      case 'center':
        x = GAME_WIDTH / 2;
        break;
    }

    const portrait = new CharacterPortrait(this, characterId, x);
    portrait.setDepth(DEPTH.NPC);
    portrait.show(expression as any);
    this.portraits.set(characterId, portrait);
  }

  private removeCharacter(characterId: string): void {
    const existing = this.portraits.get(characterId);
    if (existing) {
      this.portraits.delete(characterId);
      if (existing.scene) {
        existing.hide();
      }
    }
  }

  private highlightSpeaker(speakerId: string): void {
    for (const [id, portrait] of this.portraits) {
      portrait.highlight(id === speakerId);
    }
  }

  private updateScorecard(): void {
    const gameState = getGameStateManager();
    const bs = gameState.getBalanceSheet();
    this.scorecard.update(bs);
    const is = gameState.getIncomeStatement();
    this.scorecard.updateIncomeStatement(is);
  }

  private showChapterSummary(summary: string, nextChapter?: number): void {
    const lang = getLanguage();

    // Overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setDepth(DEPTH.TRANSITION);

    // Summary text
    const summaryTitle = this.add.text(
      GAME_WIDTH / 2, 100,
      lang === 'ja' ? '章のまとめ' : 'Chapter Summary',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '24px',
        color: '#ffd700',
        fontStyle: 'bold',
        padding: { top: 4, bottom: 4 },
      }
    );
    summaryTitle.setOrigin(0.5);
    summaryTitle.setDepth(DEPTH.TRANSITION + 1);

    const summaryText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      summary,
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#ffffff',
        wordWrap: { width: GAME_WIDTH - 100, useAdvancedWrap: true },
        align: 'center',
        lineSpacing: 8,
        padding: { top: 4, bottom: 4 },
      }
    );
    summaryText.setOrigin(0.5);
    summaryText.setDepth(DEPTH.TRANSITION + 1);

    const continueText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT - 80,
      lang === 'ja' ? 'クリックで続ける...' : 'Click to continue...',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: '#aaaacc',
        padding: { top: 4, bottom: 4 },
      }
    );
    continueText.setOrigin(0.5);
    continueText.setDepth(DEPTH.TRANSITION + 1);

    // Blink
    this.tweens.add({
      targets: continueText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    let advanced = false;
    const advance = () => {
      if (advanced) return;
      advanced = true;
      this.input.keyboard?.off('keydown-SPACE', advance);
      this.input.keyboard?.off('keydown-ENTER', advance);
      this.input.off('pointerdown', advance);
      overlay.destroy();
      summaryTitle.destroy();
      summaryText.destroy();
      continueText.destroy();

      if (nextChapter) {
        this.scene.start('ChapterTitleScene', { chapterId: nextChapter });
      } else {
        this.scene.start('MenuScene');
      }
    };

    this.input.keyboard?.on('keydown-SPACE', advance);
    this.input.keyboard?.on('keydown-ENTER', advance);
    this.input.once('pointerdown', advance);
  }

  private showNotification(text: string): void {
    const notif = this.add.text(GAME_WIDTH / 2, 80, text, {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      color: '#4ad94a',
      backgroundColor: '#1a1a2e',
      padding: { x: 12, y: 6 },
    });
    notif.setOrigin(0.5);
    notif.setDepth(DEPTH.TRANSITION);

    this.tweens.add({
      targets: notif,
      alpha: 0,
      y: 60,
      duration: 1500,
      delay: 1000,
      onComplete: () => notif.destroy(),
    });
  }

  private showSettingsPanel(): void {
    this.dialogBox.blockInput();
    const lang = getLanguage();
    const gameState = getGameStateManager();
    const settings = gameState.getState().settings;

    // Overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT),
      Phaser.Geom.Rectangle.Contains
    );
    overlay.setDepth(DEPTH.TRANSITION);

    const panelW = 400;
    const panelH = 320;
    const panelX = (GAME_WIDTH - panelW) / 2;
    const panelY = (GAME_HEIGHT - panelH) / 2;

    // Panel background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRoundedRect(panelX, panelY, panelW, panelH, 8);
    bg.lineStyle(2, COLORS.ASSETS, 0.8);
    bg.strokeRoundedRect(panelX, panelY, panelW, panelH, 8);
    bg.setInteractive(
      new Phaser.Geom.Rectangle(panelX, panelY, panelW, panelH),
      Phaser.Geom.Rectangle.Contains
    );
    bg.setDepth(DEPTH.TRANSITION);

    // Title
    const titleText = this.add.text(
      panelX + panelW / 2,
      panelY + 20,
      lang === 'ja' ? '設定' : 'Settings',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        color: '#ffd700',
        fontStyle: 'bold',
      }
    );
    titleText.setOrigin(0.5, 0);
    titleText.setDepth(DEPTH.TRANSITION);

    // BGM Toggle Label
    const bgmLabelY = panelY + 80;
    const bgmLabel = this.add.text(
      panelX + 30,
      bgmLabelY,
      lang === 'ja' ? 'BGM: ' : 'BGM: ',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: '#ffffff',
      }
    );
    bgmLabel.setDepth(DEPTH.TRANSITION);

    // BGM Toggle Button
    const bgmToggleBtn = new Button(this, {
      x: panelX + 320,
      y: bgmLabelY + 8,
      width: 60,
      height: 28,
      text: settings.bgmEnabled ? 'ON' : 'OFF',
      fontSize: 13,
      onClick: () => {
        const currentSettings = gameState.getState().settings;
        const newValue = !currentSettings.bgmEnabled;
        gameState.updateSettings({ bgmEnabled: newValue });

        const audioManager = getAudioManager();
        if (newValue) {
          audioManager.playBGM();
        } else {
          audioManager.stopBGM();
        }

        // Update button text
        bgmToggleBtn.setText(newValue ? 'ON' : 'OFF');
      },
    });
    bgmToggleBtn.setDepth(DEPTH.TRANSITION);

    // Music Volume Label
    const musicVolumeLabelY = panelY + 140;
    const musicLabel = this.add.text(
      panelX + 30,
      musicVolumeLabelY,
      lang === 'ja' ? '音楽音量: ' : 'Music: ',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        color: '#ffffff',
      }
    );
    musicLabel.setDepth(DEPTH.TRANSITION);

    // Music Volume Slider
    const musicSliderY = musicVolumeLabelY + 25;
    const musicSliderBg = this.add.graphics();
    musicSliderBg.fillStyle(0x4a4a6a, 1);
    musicSliderBg.fillRect(panelX + 30, musicSliderY, 300, 8);
    musicSliderBg.setDepth(DEPTH.TRANSITION);

    const musicSliderFill = this.add.graphics();
    musicSliderFill.fillStyle(COLORS.ASSETS, 1);
    musicSliderFill.fillRect(panelX + 30, musicSliderY, 300 * settings.musicVolume, 8);
    musicSliderFill.setDepth(DEPTH.TRANSITION);

    // Music Volume Slider Interactive Area
    const musicSliderArea = this.add.zone(panelX + 180, musicSliderY + 4, 300, 16);
    musicSliderArea.setInteractive({ useHandCursor: true });
    musicSliderArea.setDepth(DEPTH.TRANSITION);
    musicSliderArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const localX = pointer.x - (panelX + 30);
      const newVolume = Math.max(0, Math.min(1, localX / 300));
      gameState.updateSettings({ musicVolume: newVolume });
      getAudioManager().setMusicVolume(newVolume);
      musicSliderFill.clear();
      musicSliderFill.fillStyle(COLORS.ASSETS, 1);
      musicSliderFill.fillRect(panelX + 30, musicSliderY, 300 * newVolume, 8);
    });

    // SFX Volume Label
    const sfxVolumeLabelY = panelY + 210;
    const sfxLabel = this.add.text(
      panelX + 30,
      sfxVolumeLabelY,
      lang === 'ja' ? 'SFX音量: ' : 'SFX: ',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        color: '#ffffff',
      }
    );
    sfxLabel.setDepth(DEPTH.TRANSITION);

    // SFX Volume Slider
    const sfxSliderY = sfxVolumeLabelY + 25;
    const sfxSliderBg = this.add.graphics();
    sfxSliderBg.fillStyle(0x4a4a6a, 1);
    sfxSliderBg.fillRect(panelX + 30, sfxSliderY, 300, 8);
    sfxSliderBg.setDepth(DEPTH.TRANSITION);

    const sfxSliderFill = this.add.graphics();
    sfxSliderFill.fillStyle(COLORS.ASSETS, 1);
    sfxSliderFill.fillRect(panelX + 30, sfxSliderY, 300 * settings.sfxVolume, 8);
    sfxSliderFill.setDepth(DEPTH.TRANSITION);

    // SFX Volume Slider Interactive Area
    const sfxSliderArea = this.add.zone(panelX + 180, sfxSliderY + 4, 300, 16);
    sfxSliderArea.setInteractive({ useHandCursor: true });
    sfxSliderArea.setDepth(DEPTH.TRANSITION);
    sfxSliderArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const localX = pointer.x - (panelX + 30);
      const newVolume = Math.max(0, Math.min(1, localX / 300));
      gameState.updateSettings({ sfxVolume: newVolume });
      sfxSliderFill.clear();
      sfxSliderFill.fillStyle(COLORS.ASSETS, 1);
      sfxSliderFill.fillRect(panelX + 30, sfxSliderY, 300 * newVolume, 8);
    });

    // Close button
    const closeBtn = new Button(this, {
      x: panelX + panelW / 2,
      y: panelY + panelH - 30,
      width: 100,
      height: 36,
      text: lang === 'ja' ? '閉じる' : 'Close',
      onClick: () => {
        this.destroySettingsPanel();
      },
    });
    closeBtn.setDepth(DEPTH.TRANSITION);

    this.settingsPanelElements = [
      overlay, bg, bgmToggleBtn, bgmLabel, musicLabel,
      musicSliderBg, musicSliderFill, musicSliderArea,
      sfxLabel, sfxSliderBg, sfxSliderFill, sfxSliderArea,
      titleText, closeBtn,
    ];
  }

  private destroySettingsPanel(): void {
    this.dialogBox.unblockInput();
    for (const el of this.settingsPanelElements) {
      if (el && el.active) {
        el.destroy();
      }
    }
    this.settingsPanelElements = [];
  }

  shutdown(): void {
    // Stop BGM when scene shuts down
    const audioManager = getAudioManager();
    audioManager.stopBGM();

    // Clean up settings panel if open
    this.destroySettingsPanel();

    if (this.autoSaveTimer) {
      this.autoSaveTimer.destroy();
    }
    for (const portrait of this.portraits.values()) {
      if (portrait.scene) {
        portrait.destroy();
      }
    }
    this.portraits.clear();
    this.scorecard.destroy();
    this.dialogBox.destroy();
    this.choicePanel.destroy();
    this.input.keyboard?.off('keydown-S');
  }
}
