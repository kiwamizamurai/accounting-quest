import { GameState, createInitialGameState } from '../models/GameState';
import { AccountCategory } from '../models/Account';
import { JournalEntry, GameDate } from '../models/Transaction';
import { AccountingEngine } from '../engine/accounting/AccountingEngine';
import { TransactionProcessor } from '../engine/accounting/TransactionProcessor';
import { getEventManager } from '../engine/events/EventManager';
import { addExp } from '../models/Player';
import { Quest, ChapterProgress } from '../models/Chapter';

/**
 * Central game state management
 * Handles all state mutations and provides access to game data
 */
export class GameStateManager {
  private state: GameState;
  private accountingEngine: AccountingEngine;
  private transactionProcessor: TransactionProcessor;
  private sessionStartTime: number;

  constructor(playerName: string = 'Hero', level: 1 | 2 | 3 = 1) {
    this.state = createInitialGameState(playerName, level);
    this.accountingEngine = new AccountingEngine(
      this.state.accounts,
      this.state.journalEntries
    );
    this.transactionProcessor = new TransactionProcessor(this.state.player.currentChapter);
    this.sessionStartTime = Date.now();
  }

  // ===== State Access =====

  getState(): Readonly<GameState> {
    return this.state;
  }

  getPlayer() {
    return this.state.player;
  }

  getAccounts() {
    return this.state.accounts;
  }

  getAccountBalance(category: AccountCategory): number {
    return this.accountingEngine.getAccountBalance(category);
  }

  getCash(): number {
    return this.accountingEngine.getCash();
  }

  getBalanceSheet() {
    return this.accountingEngine.getBalanceSheet();
  }

  getIncomeStatement() {
    return this.accountingEngine.getIncomeStatement();
  }

  getJournalEntries(): JournalEntry[] {
    return this.accountingEngine.getJournalEntries();
  }

  getCurrentDate(): GameDate {
    return { ...this.state.currentDate };
  }

  getActiveQuests(): Quest[] {
    return this.state.activeQuests;
  }

  // ===== Player Actions =====

  setPlayerPosition(x: number, y: number): void {
    this.state.player.x = x;
    this.state.player.y = y;
    this.markUpdated();
  }

  setPlayerMap(mapId: string): void {
    this.state.player.currentMap = mapId;
    this.markUpdated();
  }

  addPlayerExp(amount: number): { leveledUp: boolean; newLevel: number } {
    const result = addExp(this.state.player, amount);
    if (result.leveledUp) {
      getEventManager().emitPlayerLevelUp(result.newLevel, amount);
    }
    this.markUpdated();
    return result;
  }

  addPlayerGold(amount: number): void {
    this.state.player.gold += amount;
    this.markUpdated();
  }

  // ===== Accounting Actions =====

  processTransaction(entry: JournalEntry): { success: boolean; error?: string } {
    const oldBalances = new Map<AccountCategory, number>();
    for (const line of entry.lines) {
      oldBalances.set(line.accountCategory, this.getAccountBalance(line.accountCategory));
    }

    const result = this.accountingEngine.processJournalEntry(entry);

    if (result.success) {
      // Emit balance update events
      for (const line of entry.lines) {
        const oldBalance = oldBalances.get(line.accountCategory) || 0;
        const newBalance = this.getAccountBalance(line.accountCategory);
        getEventManager().emitBalanceUpdated(
          line.accountCategory,
          oldBalance,
          newBalance
        );
      }

      // Emit transaction recorded event
      const totalAmount = entry.lines.reduce((sum, line) => sum + line.debit, 0);
      getEventManager().emitTransactionRecorded(entry.id, entry.eventType, totalAmount);

      this.markUpdated();
    }

    return {
      success: result.success,
      error: result.error,
    };
  }

  getTransactionProcessor(): TransactionProcessor {
    return this.transactionProcessor;
  }

  // ===== Date Management =====

  advanceDay(days: number = 1): void {
    for (let i = 0; i < days; i++) {
      this.state.currentDate.day++;
      if (this.state.currentDate.day > 30) {
        this.state.currentDate.day = 1;
        this.state.currentDate.month++;
        if (this.state.currentDate.month > 12) {
          this.state.currentDate.month = 1;
          this.state.currentDate.year++;
        }
      }
    }
    this.markUpdated();
  }

  // ===== Quest Management =====

  startQuest(quest: Quest): void {
    if (!this.state.activeQuests.find((q) => q.id === quest.id)) {
      this.state.activeQuests.push(quest);
      getEventManager().emitQuestStarted(quest.id, quest.title);
      this.markUpdated();
    }
  }

  completeQuest(questId: string): Quest | null {
    const index = this.state.activeQuests.findIndex((q) => q.id === questId);
    if (index === -1) return null;

    const quest = this.state.activeQuests[index];
    quest.completed = true;
    this.state.activeQuests.splice(index, 1);
    this.state.completedQuests.push(questId);

    // Apply rewards
    if (quest.rewards.gold) {
      this.addPlayerGold(quest.rewards.gold);
    }
    if (quest.rewards.exp) {
      this.addPlayerExp(quest.rewards.exp);
    }
    if (quest.rewards.conceptsUnlocked) {
      this.state.player.masteredConcepts.push(...quest.rewards.conceptsUnlocked);
    }

    getEventManager().emitQuestCompleted(questId, quest.title);
    this.markUpdated();

    return quest;
  }

  updateQuestProgress(questId: string, objectiveId: string, progress: number): void {
    const quest = this.state.activeQuests.find((q) => q.id === questId);
    if (!quest) return;

    const objective = quest.objectives.find((o) => o.id === objectiveId);
    if (!objective) return;

    objective.current = Math.min(progress, objective.target);
    objective.completed = objective.current >= objective.target;

    getEventManager().emit('quest:objective:progress', {
      questId,
      objectiveId,
      current: objective.current,
      target: objective.target,
    });

    // Check if all objectives are completed
    if (quest.objectives.every((o) => o.completed)) {
      this.completeQuest(questId);
    }

    this.markUpdated();
  }

  // ===== Chapter Management =====

  getCurrentChapter(): number {
    return this.state.player.currentChapter;
  }

  setCurrentChapter(chapter: number): void {
    this.state.player.currentChapter = chapter;
    this.transactionProcessor.setChapter(chapter);
    getEventManager().emit('chapter:started', { chapter });
    this.markUpdated();
  }

  completeChapter(chapter: number): void {
    if (!this.state.player.completedChapters.includes(chapter)) {
      this.state.player.completedChapters.push(chapter);
      getEventManager().emit('chapter:completed', { chapter });
      this.markUpdated();
    }
  }

  getChapterProgress(chapterId: number): ChapterProgress | undefined {
    return this.state.chapterProgress.get(chapterId);
  }

  // ===== Concept Learning =====

  learnConcept(concept: string): void {
    if (!this.state.player.masteredConcepts.includes(concept)) {
      this.state.player.masteredConcepts.push(concept);
      getEventManager().emitConceptLearned(concept);
      this.markUpdated();
    }
  }

  hasLearnedConcept(concept: string): boolean {
    return this.state.player.masteredConcepts.includes(concept);
  }

  // ===== Settings =====

  updateSettings(settings: Partial<GameState['settings']>): void {
    this.state.settings = { ...this.state.settings, ...settings };
    this.markUpdated();
  }

  // ===== Private Methods =====

  private markUpdated(): void {
    this.state.updatedAt = Date.now();
  }

  updatePlayTime(): void {
    const sessionTime = Date.now() - this.sessionStartTime;
    this.state.totalPlayTime += sessionTime;
    this.sessionStartTime = Date.now();
  }

  // ===== Serialization =====

  toJSON(): string {
    this.updatePlayTime();

    const serializable = {
      ...this.state,
      accounts: Array.from(this.state.accounts.entries()),
      chapterProgress: Array.from(this.state.chapterProgress.entries()),
    };

    return JSON.stringify(serializable);
  }

  static fromJSON(json: string): GameStateManager {
    const data = JSON.parse(json);

    if (!data || !data.player || typeof data.player.name !== 'string') {
      throw new Error('Invalid save data: missing or malformed player data');
    }
    if (!Array.isArray(data.accounts)) {
      throw new Error('Invalid save data: accounts must be an array');
    }
    if (!Array.isArray(data.journalEntries)) {
      throw new Error('Invalid save data: journalEntries must be an array');
    }

    const manager = new GameStateManager(data.player.name);
    manager.state = {
      ...data,
      accounts: new Map(data.accounts),
      chapterProgress: new Map(data.chapterProgress ?? []),
    };

    manager.accountingEngine = new AccountingEngine(
      manager.state.accounts,
      manager.state.journalEntries
    );
    manager.transactionProcessor = new TransactionProcessor(manager.state.player.currentChapter);

    return manager;
  }
}

// Singleton instance
let gameStateManagerInstance: GameStateManager | null = null;

export function getGameStateManager(): GameStateManager {
  if (!gameStateManagerInstance) {
    gameStateManagerInstance = new GameStateManager();
  }
  return gameStateManagerInstance;
}

export function initGameStateManager(playerName: string, level: 1 | 2 | 3 = 1): GameStateManager {
  gameStateManagerInstance = new GameStateManager(playerName, level);
  return gameStateManagerInstance;
}

export function setGameStateManager(manager: GameStateManager): void {
  gameStateManagerInstance = manager;
}
