import Phaser from 'phaser';

export type GameEventType =
  | 'transaction:recorded'
  | 'balance:updated'
  | 'quest:started'
  | 'quest:completed'
  | 'quest:objective:progress'
  | 'chapter:started'
  | 'chapter:completed'
  | 'player:levelup'
  | 'dialog:started'
  | 'dialog:ended'
  | 'npc:interact'
  | 'item:obtained'
  | 'concept:learned'
  | 'quiz:started'
  | 'quiz:answered'
  | 'quiz:completed';

export interface GameEvent {
  type: GameEventType;
  data: unknown;
  timestamp: number;
}

export interface TransactionRecordedEvent {
  entryId: string;
  eventType: string;
  amount: number;
}

export interface BalanceUpdatedEvent {
  accountCategory: string;
  oldBalance: number;
  newBalance: number;
}

export interface QuestEvent {
  questId: string;
  questTitle: string;
}

export interface DialogEvent {
  npcId: string;
  dialogKey: string;
}

export interface QuizEvent {
  questionId: string;
  correct?: boolean;
  score?: number;
}

/**
 * Central event management for game-wide communication
 * Uses Phaser's event system under the hood
 */
export class EventManager {
  private emitter: Phaser.Events.EventEmitter;
  private eventLog: GameEvent[] = [];
  private maxLogSize = 100;

  constructor() {
    this.emitter = new Phaser.Events.EventEmitter();
  }

  /**
   * Emit a game event
   */
  emit<T>(type: GameEventType, data: T): void {
    const event: GameEvent = {
      type,
      data,
      timestamp: Date.now(),
    };

    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }

    this.emitter.emit(type, data);
  }

  /**
   * Subscribe to a game event
   */
  on<T>(type: GameEventType, callback: (data: T) => void, context?: object): void {
    this.emitter.on(type, callback, context);
  }

  /**
   * Subscribe to a game event once
   */
  once<T>(type: GameEventType, callback: (data: T) => void, context?: object): void {
    this.emitter.once(type, callback, context);
  }

  /**
   * Unsubscribe from a game event
   */
  off(type: GameEventType, callback?: (...args: unknown[]) => void, context?: object): void {
    this.emitter.off(type, callback, context);
  }

  /**
   * Get recent events
   */
  getRecentEvents(count: number = 10): GameEvent[] {
    return this.eventLog.slice(-count);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: GameEventType): GameEvent[] {
    return this.eventLog.filter((e) => e.type === type);
  }

  /**
   * Clear all listeners
   */
  destroy(): void {
    this.emitter.removeAllListeners();
    this.eventLog = [];
  }

  // Convenience methods for common events

  emitTransactionRecorded(entryId: string, eventType: string, amount: number): void {
    this.emit<TransactionRecordedEvent>('transaction:recorded', {
      entryId,
      eventType,
      amount,
    });
  }

  emitBalanceUpdated(accountCategory: string, oldBalance: number, newBalance: number): void {
    this.emit<BalanceUpdatedEvent>('balance:updated', {
      accountCategory,
      oldBalance,
      newBalance,
    });
  }

  emitQuestStarted(questId: string, questTitle: string): void {
    this.emit<QuestEvent>('quest:started', { questId, questTitle });
  }

  emitQuestCompleted(questId: string, questTitle: string): void {
    this.emit<QuestEvent>('quest:completed', { questId, questTitle });
  }

  emitDialogStarted(npcId: string, dialogKey: string): void {
    this.emit<DialogEvent>('dialog:started', { npcId, dialogKey });
  }

  emitDialogEnded(npcId: string, dialogKey: string): void {
    this.emit<DialogEvent>('dialog:ended', { npcId, dialogKey });
  }

  emitConceptLearned(concept: string): void {
    this.emit('concept:learned', { concept });
  }

  emitPlayerLevelUp(newLevel: number, expGained: number): void {
    this.emit('player:levelup', { newLevel, expGained });
  }
}

// Singleton instance for global access
let eventManagerInstance: EventManager | null = null;

export function getEventManager(): EventManager {
  if (!eventManagerInstance) {
    eventManagerInstance = new EventManager();
  }
  return eventManagerInstance;
}

export function resetEventManager(): void {
  if (eventManagerInstance) {
    eventManagerInstance.destroy();
  }
  eventManagerInstance = new EventManager();
}
