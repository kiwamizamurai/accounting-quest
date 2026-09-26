import { ConditionDef, VNState } from './types';
import { GameStateManager } from '../state/GameStateManager';
import { AccountCategory } from '../models/Account';

/** Flags the engine keeps while the player enters journal entries; a chapter can test them as `flag_lte` etc. */
export const ENTRY_STATS = {
  total: '_entriesTotal',
  firstTry: '_entriesFirstTry',
  mistakes: '_entryMistakes',
} as const;

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
      case 'flag_gte':
        return this.compareFlag(condition, vnState, (value, amount) => value >= amount);
      case 'flag_lte':
        return this.compareFlag(condition, vnState, (value, amount) => value <= amount);
      case 'net_income_gte':
        return condition.amount !== undefined && this.gameState.getIncomeStatement().netIncome >= condition.amount;
      case 'net_income_lte':
        return condition.amount !== undefined && this.gameState.getIncomeStatement().netIncome <= condition.amount;
      case 'accuracy_gte':
        return condition.amount !== undefined && this.accuracy(vnState) >= condition.amount;
      case 'all':
        return (condition.all ?? []).every(inner => this.evaluate(inner, vnState));
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

  private compareFlag(
    condition: ConditionDef,
    vnState: VNState,
    compare: (value: number, amount: number) => boolean
  ): boolean {
    if (!condition.flag || condition.amount === undefined) return false;
    const value = vnState.flags[condition.flag];
    return typeof value === 'number' && compare(value, condition.amount);
  }

  /** Share of player entries that were right on the first try; 1 when the player has entered none. */
  private accuracy(vnState: VNState): number {
    const total = Number(vnState.flags[ENTRY_STATS.total] ?? 0);
    if (total === 0) return 1;
    return Number(vnState.flags[ENTRY_STATS.firstTry] ?? 0) / total;
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
