import Phaser from 'phaser';
import { DEPTH, FONT_FAMILY } from '../config/constants';
import { ART_WIDTH, ART_HEIGHT, VIEW_WIDTH, HUD_HEIGHT, fitViewToWindow, getVNLayout, getViewHeight } from '../config/layout';
import { ScriptEngine, ScriptEngineCallback } from '../vn/ScriptEngine';
import { CharacterPosition } from '../vn/types';
import { getGameStateManager } from '../state/GameStateManager';
import { SaveLoadManager } from '../state/SaveLoadManager';
import { getLanguage, setLanguage, t } from '../i18n';
import { getAudioManager } from '../managers/AudioManager';
import { SettingsPanel } from '../ui/components/SettingsPanel';
import { Hud, HUD_COLORS, HudButton } from '../ui/vn/Hud';
import { VNDialogBox } from '../ui/vn/VNDialogBox';
import { ChoicePanel } from '../ui/vn/ChoicePanel';
import { JournalEntryPanel } from '../ui/vn/JournalEntryPanel';
import { CharacterPortrait } from '../ui/vn/CharacterPortrait';
import { BackgroundRenderer } from '../ui/vn/BackgroundRenderer';
import { TransactionAnimation } from '../ui/vn/TransactionAnimation';
import { Scorecard } from '../ui/components/Scorecard';
import { formatMoney } from '../utils/MoneyFormatter';
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
import { applyRenderScale } from '../utils/renderScale';
import { ChapterScript } from '../vn/types';

interface VNSceneData {
  chapterId: number;
}

export class VNScene extends Phaser.Scene {
  private scriptEngine!: ScriptEngine;
  private dialogBox!: VNDialogBox;
  private choicePanel!: ChoicePanel;
  private journalEntryPanel!: JournalEntryPanel;
  private backgroundRenderer!: BackgroundRenderer;
  private transactionAnim!: TransactionAnimation;
  private scorecard!: Scorecard;
  private portraits: Map<string, CharacterPortrait> = new Map();
  private stage!: Phaser.GameObjects.Container;
  private hud!: Hud;
  private langButton!: HudButton;
  private bsButton!: HudButton;
  private plButton!: HudButton;
  private equationText!: Phaser.GameObjects.Text;
  private lastEquation = '';
  private autoSaveTimer?: Phaser.Time.TimerEvent;
  private settingsPanel?: SettingsPanel;

  constructor() {
    super('VNScene');
  }

  create(data: VNSceneData): void {
    fitViewToWindow(this.game);
    applyRenderScale(this);
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

    // Stage: the 800x600 scene art (background + characters), scaled to fill the area above the dialog
    this.stage = this.add.container(0, 0);
    this.layoutStage();
    this.backgroundRenderer = new BackgroundRenderer(this);
    this.stage.add(this.backgroundRenderer);

    // UI components
    this.dialogBox = new VNDialogBox(this);
    this.choicePanel = new ChoicePanel(this);
    this.journalEntryPanel = new JournalEntryPanel(this);
    this.transactionAnim = new TransactionAnimation(this);

    // Balance sheet / income statement sheet
    this.scorecard = new Scorecard(this);
    this.scorecard.setScrollFactor(0);
    this.scorecard.onChange = () => this.onReportSheetChanged();

    this.createHud(chapterId, lang);
    this.createEquationStrip();

    // Register shutdown handler for cleanup
    this.events.on('shutdown', this.shutdown, this);

    // Set up script engine callbacks
    this.setupCallbacks();

    // Remember which chapter is being played, and checkpoint the state before any of its entries
    // are posted. Saves always store this chapter-start snapshot, so "Continue" replays the chapter
    // from the top without double-posting the entries it had already recorded.
    gameState.setCurrentChapter(chapterId);
    const chapterStartState = gameState.toJSON();
    SaveLoadManager.autoSave(gameState, chapterStartState);

    // Start the chapter
    this.scriptEngine.startChapter(chapterId);

    // Auto-save timer
    this.autoSaveTimer = this.time.addEvent({
      delay: 60000,
      callback: () => {
        SaveLoadManager.autoSave(gameState, chapterStartState);
      },
      loop: true,
    });

    // Update scorecard with initial state
    this.updateScorecard();

    // Keyboard: S to save
    this.input.keyboard?.on('keydown-S', () => {
      SaveLoadManager.autoSave(gameState, chapterStartState);
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
        this.scorecard.close();
        this.dialogBox.hide();
        this.choicePanel.show(prompt, choices, (index) => {
          this.scriptEngine.selectChoice(index);
        });
      },

      onTransaction: (description, entries, showAnimation) => {
        this.scorecard.close();
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
        this.scorecard.close();
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

      onQuiz: (question, options, correctIndex, correctFeedback, incorrectFeedback) => {
        this.scorecard.close();
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
          },
          correctIndex
        );
      },

      onJournalEntryInput: (prompt, expectedEntries, correctFeedback, incorrectFeedback, hint) => {
        this.scorecard.close();
        this.dialogBox.hide();
        this.choicePanel.hide();
        const lang = getLanguage();

        // Accounts the player can choose from: the ones that exist at this game level
        const accounts = [...getGameStateManager().getAccounts().values()].map(account => ({
          category: account.category as string,
          label: lang === 'ja' ? account.nameJa : account.name,
          type: account.type,
        }));
        const labelOf = (category: string): string => accounts.find(a => a.category === category)?.label ?? category;
        const sideText = (side: 'debit' | 'credit'): string =>
          expectedEntries
            .filter(entry => (entry[side] ?? 0) > 0)
            .map(entry => `${labelOf(entry.account)} ${formatMoney(entry[side] as number)}`)
            .join(lang === 'ja' ? '、' : ', ');

        this.journalEntryPanel.show({
          prompt,
          hint,
          debitCount: expectedEntries.filter(entry => (entry.debit ?? 0) > 0).length,
          creditCount: expectedEntries.filter(entry => (entry.credit ?? 0) > 0).length,
          accounts,
          expected: expectedEntries,
          correctAnswer: `${t('je.debit')} ${sideText('debit')} / ${t('je.credit')} ${sideText('credit')}`,
          onSubmit: entries => this.scriptEngine.submitJournalEntry(entries),
          onClose: isCorrect => {
            this.dialogBox.showNarration(isCorrect ? correctFeedback : incorrectFeedback, () => {
              this.updateScorecard();
              this.scriptEngine.advance();
            });
          },
        });
      },
    };

    this.scriptEngine.setCallbacks(callbacks);
  }

  private addCharacter(characterId: string, position: CharacterPosition, expression?: string): void {
    // Remove existing portrait for this character
    this.removeCharacter(characterId);

    // Positions in the 800x600 scene art. The stage crops the sides on a narrow screen, so the
    // left / right characters stand closer to the middle than they did on a wide canvas.
    let x: number;
    switch (position) {
      case 'left':
        x = ART_WIDTH / 2 - 165;
        break;
      case 'right':
        x = ART_WIDTH / 2 + 165;
        break;
      case 'center':
        x = ART_WIDTH / 2;
        break;
    }

    const portrait = new CharacterPortrait(this, characterId, x);
    portrait.setDepth(DEPTH.NPC);
    this.stage.add(portrait);
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
    this.updateEquation(bs.totalAssets, bs.totalLiabilities, bs.totalEquity, bs.isBalanced);
  }

  /** Scale and place the stage so the scene art fills the area between the top bar and the dialog. */
  private layoutStage(): void {
    const { stage } = getVNLayout();
    const scale = Math.max(stage.h / ART_HEIGHT, stage.w / ART_WIDTH);
    this.stage.setScale(scale);
    this.stage.setPosition(
      stage.x + (stage.w - ART_WIDTH * scale) / 2,
      stage.y + (stage.h - ART_HEIGHT * scale) / 2
    );
  }

  /** Top bar: chapter label, then (right to left) BS, PL, language and settings buttons. */
  private createHud(chapterId: number, lang: string): void {
    this.hud = new Hud(this, `Ch.${chapterId}`);
    this.bsButton = this.hud.addButton('BS', 44, HUD_COLORS.balanceSheet, () => this.scorecard.toggle());
    this.plButton = this.hud.addButton('PL', 44, HUD_COLORS.incomeStatement, () => this.scorecard.togglePl());
    this.langButton = this.hud.addButton(lang === 'ja' ? 'EN' : 'JA', 40, HUD_COLORS.neutral, () => {
      const newLang = getLanguage() === 'ja' ? 'en' : 'ja';
      setLanguage(newLang);
      this.langButton.setLabel(newLang === 'ja' ? 'EN' : 'JA');
      // Update scorecard to reflect new language
      this.updateScorecard();
      // Re-execute current node to update display language
      const currentNode = this.scriptEngine.getCurrentNode();
      if (currentNode && (currentNode.type === 'dialog' || currentNode.type === 'narration')) {
        this.scriptEngine.advance(currentNode.id);
      }
    });
    this.hud.addButton('\u2699', 36, HUD_COLORS.neutral, () => this.showSettingsPanel());
  }

  /** Bottom strip: assets = liabilities + equity, always in view; tap it to open the balance sheet. */
  private createEquationStrip(): void {
    const { strip } = getVNLayout();
    const bar = this.add.graphics();
    bar.fillStyle(0x0a0a1e, 0.94);
    bar.fillRect(strip.x, strip.y, strip.w, strip.h);
    bar.lineStyle(1, 0x2a2a4a, 1);
    bar.lineBetween(strip.x, strip.y + 0.5, strip.x + strip.w, strip.y + 0.5);
    bar.setDepth(DEPTH.UI_PANEL);

    this.equationText = this.add.text(strip.x + strip.w / 2, strip.y + strip.h / 2, '', {
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      color: '#aab0c8',
      padding: { top: 4, bottom: 4 },
    });
    this.equationText.setOrigin(0.5);
    this.equationText.setDepth(DEPTH.UI_PANEL);

    const zone = this.add.zone(strip.x + strip.w / 2, strip.y + strip.h / 2, strip.w, strip.h);
    zone.setInteractive({ useHandCursor: true });
    zone.on('pointerup', () => this.scorecard.toggle());
    zone.setDepth(DEPTH.UI_PANEL);
  }

  private updateEquation(assets: number, liabilities: number, equity: number, balanced: boolean): void {
    const ja = getLanguage() === 'ja';
    const text = ja
      ? `資産 ${formatMoney(assets)} ＝ 負債 ${formatMoney(liabilities)} ＋ 純資産 ${formatMoney(equity)}`
      : `Assets ${formatMoney(assets)} = Liabilities ${formatMoney(liabilities)} + Equity ${formatMoney(equity)}`;
    this.equationText.setText(text);
    this.equationText.setColor(balanced ? '#aab0c8' : '#ef4444');
    // A long line shrinks to stay inside the strip
    const room = VIEW_WIDTH - 20;
    this.equationText.setScale(this.equationText.width > room ? room / this.equationText.width : 1);

    // Flash when the numbers change so a posted entry is noticed
    if (this.lastEquation && this.lastEquation !== text) {
      this.equationText.setColor('#ffd700');
      this.time.delayedCall(700, () => {
        if (this.equationText.active) this.equationText.setColor(balanced ? '#aab0c8' : '#ef4444');
      });
    }
    this.lastEquation = text;
  }

  /** The report sheet opened or closed: keep the dialog readable below it and the choices out of its way. */
  private onReportSheetChanged(): void {
    const open = this.scorecard.bsExpanded || this.scorecard.plExpanded;
    this.bsButton.setActive(this.scorecard.bsExpanded);
    this.plButton.setActive(this.scorecard.plExpanded);
    this.dialogBox.setCompact(open);
    this.choicePanel.setSuspended(open);
  }

  private showChapterSummary(summary: string, nextChapter?: number): void {
    const lang = getLanguage();
    const height = getViewHeight();

    // Fold the report sheet away so it does not show through the overlay behind the summary text
    this.scorecard.close();

    // Overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, VIEW_WIDTH, height);
    overlay.setDepth(DEPTH.TRANSITION);

    // Summary text
    const summaryTitle = this.add.text(
      VIEW_WIDTH / 2, HUD_HEIGHT + 50,
      lang === 'ja' ? '章のまとめ' : 'Chapter Summary',
      {
        fontFamily: FONT_FAMILY,
        fontSize: '24px',
        color: '#ffd700',
        fontStyle: 'bold',
        padding: { top: 4, bottom: 4 },
      }
    );
    summaryTitle.setOrigin(0.5);
    summaryTitle.setDepth(DEPTH.TRANSITION + 1);

    const summaryText = this.add.text(
      VIEW_WIDTH / 2, height / 2,
      summary,
      {
        fontFamily: FONT_FAMILY,
        fontSize: '17px',
        color: '#ffffff',
        wordWrap: { width: VIEW_WIDTH - 56, useAdvancedWrap: true },
        align: 'center',
        lineSpacing: 8,
        padding: { top: 4, bottom: 4 },
      }
    );
    summaryText.setOrigin(0.5);
    summaryText.setDepth(DEPTH.TRANSITION + 1);
    // A long summary uses a smaller size so it stays between the title and the prompt
    const room = height - (HUD_HEIGHT + 100) - 100;
    for (const size of [16, 15, 14, 13]) {
      if (summaryText.height <= room) break;
      summaryText.setFontSize(size);
    }

    const continueText = this.add.text(
      VIEW_WIDTH / 2, height - 60,
      lang === 'ja' ? 'タップして続ける' : 'Tap to continue',
      {
        fontFamily: FONT_FAMILY,
        fontSize: '15px',
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
    const notif = this.add.text(VIEW_WIDTH / 2, HUD_HEIGHT + 30, text, {
      fontFamily: FONT_FAMILY,
      fontSize: '15px',
      color: '#4ad94a',
      backgroundColor: '#1a1a2e',
      padding: { x: 14, y: 8 },
    });
    notif.setOrigin(0.5);
    notif.setDepth(DEPTH.TRANSITION);

    this.tweens.add({
      targets: notif,
      alpha: 0,
      y: HUD_HEIGHT + 10,
      duration: 1500,
      delay: 1000,
      onComplete: () => notif.destroy(),
    });
  }

  private showSettingsPanel(): void {
    if (this.settingsPanel) return;
    this.dialogBox.blockInput();
    this.settingsPanel = new SettingsPanel(this, () => {
      this.settingsPanel = undefined;
      this.dialogBox.unblockInput();
    });
  }

  shutdown(): void {
    // Stop BGM when scene shuts down
    const audioManager = getAudioManager();
    audioManager.stopBGM();

    // Clean up settings panel if open
    this.settingsPanel?.destroy();
    this.settingsPanel = undefined;

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
