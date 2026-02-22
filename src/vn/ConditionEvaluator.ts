import { ConditionDef, VNState } from './types';
import { GameStateManager } from '../state/GameStateManager';
import { AccountCategory } from '../models/Account';

export class ConditionEvaluator {
  private gameState: GameStateManager;

  constructor(gameState: GameStateManager) {
    this.gameState = gameState;
  }

  evaluate(condition: ConditionDef, vnState: VNState): boolean {
    switch (condition.type) {
      case 'flag':
        return this.evaluateFlag(condition, vnState);
      case 'account_gte':
        return this.evaluateAccountGte(condition);
      case 'account_lte':
        return this.evaluateAccountLte(condition);
      case 'chapter_completed':
        return this.evaluateChapterCompleted(condition);
      default:
        return false;
    }
  }

  private evaluateFlag(condition: ConditionDef, vnState: VNState): boolean {
    if (!condition.flag) return false;
    const flagValue = vnState.flags[condition.flag];
    if (condition.value !== undefined) {
      return flagValue === condition.value;
    }
    return !!flagValue;
  }

  private evaluateAccountGte(condition: ConditionDef): boolean {
    if (!condition.account || condition.amount === undefined) return false;
    const category = condition.account as AccountCategory;
    const balance = this.gameState.getAccountBalance(category);
    return balance >= condition.amount;
  }

  private evaluateAccountLte(condition: ConditionDef): boolean {
    if (!condition.account || condition.amount === undefined) return false;
    const category = condition.account as AccountCategory;
    const balance = this.gameState.getAccountBalance(category);
    return balance <= condition.amount;
  }

  private evaluateChapterCompleted(condition: ConditionDef): boolean {
    if (condition.chapter === undefined) return false;
    const player = this.gameState.getPlayer();
    return player.completedChapters.includes(condition.chapter);
  }
}
