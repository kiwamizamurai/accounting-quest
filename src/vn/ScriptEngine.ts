import {
  ScriptNode,
  ChapterScript,
  VNState,
  ChoiceOption,
  TransactionDef,
  CharacterPosition,
} from './types';
import { ConditionEvaluator } from './ConditionEvaluator';
import { GameStateManager } from '../state/GameStateManager';
import { AccountCategory } from '../models/Account';
import { BusinessEventType, createJournalEntry, TransactionLine } from '../models/Transaction';
import { t } from '../i18n';

export type ScriptEngineCallback = {
  onDialog: (speaker: string, text: string, expression?: string) => void;
  onChoice: (prompt: string, choices: ChoiceOption[]) => void;
  onTransaction: (description: string, entries: { account: string; debit?: number; credit?: number }[], showAnimation: boolean) => void;
  onReport: (reportType: string, message?: string) => void;
  onNarration: (text: string) => void;
  onCharacterEnter: (character: string, position: CharacterPosition, expression?: string) => void;
  onCharacterExit: (character: string) => void;
  onBackgroundChange: (background: string) => void;
  onWait: (duration: number) => void;
  onChapterEnd: (nextChapter?: number, summary?: string) => void;
  onQuiz: (question: string, options: string[], correctIndex: number, correctFeedback: string, incorrectFeedback: string) => void;
  onJournalEntryInput: (prompt: string, expectedEntries: { account: string; debit?: number; credit?: number }[], correctFeedback: string, incorrectFeedback: string, hint?: string) => void;
};

let journalEntryCounter = 0;

export class ScriptEngine {
  private chapters: Map<number, ChapterScript> = new Map();
  private nodeMap: Map<string, ScriptNode> = new Map();
  private vnState: VNState;
  private gameState: GameStateManager;
  private conditionEvaluator: ConditionEvaluator;
  private callbacks: ScriptEngineCallback | null = null;

  constructor(gameState: GameStateManager) {
    this.gameState = gameState;
    this.conditionEvaluator = new ConditionEvaluator(gameState);
    this.vnState = {
      currentNodeId: '',
      currentChapter: 1,
      flags: {},
      charactersOnScreen: new Map(),
      currentBackground: '',
      choiceHistory: [],
    };
  }

  setCallbacks(callbacks: ScriptEngineCallback): void {
    this.callbacks = callbacks;
  }

  registerChapter(chapter: ChapterScript): void {
    this.chapters.set(chapter.id, chapter);
  }

  startChapter(chapterId: number): boolean {
    const chapter = this.chapters.get(chapterId);
    if (!chapter) return false;

    this.vnState.currentChapter = chapterId;

    this.nodeMap.clear();
    for (const node of chapter.nodes) {
      this.nodeMap.set(node.id, node);
    }

    if (chapter.nodes.length > 0) {
      this.vnState.currentNodeId = chapter.nodes[0].id;
      this.executeCurrentNode();
    }

    return true;
  }

  getCurrentNode(): ScriptNode | null {
    return this.nodeMap.get(this.vnState.currentNodeId) ?? null;
  }

  getVNState(): Readonly<VNState> {
    return this.vnState;
  }

  setVNState(state: VNState): void {
    this.vnState = state;
  }

  advance(nextNodeId?: string): void {
    if (nextNodeId) {
      this.vnState.currentNodeId = nextNodeId;
    }
    this.executeCurrentNode();
  }

  answerQuiz(selectedIndex: number): boolean {
    const node = this.getCurrentNode();
    if (!node || node.type !== 'quiz') return false;

    const isCorrect = selectedIndex === node.correctIndex;

    if (isCorrect && node.expReward) {
      this.gameState.addPlayerExp(node.expReward);
    }

    // Track quiz stats
    const player = this.gameState.getPlayer();
    player.totalQuizQuestions++;
    if (isCorrect) {
      player.quizScore++;
    }

    this.vnState.currentNodeId = node.next;
    return isCorrect;
  }

  submitJournalEntry(entries: { account: string; debit?: number; credit?: number }[]): boolean {
    const node = this.getCurrentNode();
    if (!node || node.type !== 'journal_entry_input') return false;

    const isCorrect = this.validateJournalEntryInput(entries, node.expectedEntries);

    if (isCorrect) {
      // Don't record the transaction here — the preceding transaction node already recorded it.
      // journal_entry_input is a practice/verification exercise only.
      if (node.expReward) {
        this.gameState.addPlayerExp(node.expReward);
      }
    }

    this.vnState.currentNodeId = node.next;
    return isCorrect;
  }

  private validateJournalEntryInput(
    submitted: { account: string; debit?: number; credit?: number }[],
    expected: { account: string; debit?: number; credit?: number }[]
  ): boolean {
    if (submitted.length !== expected.length) return false;

    const normalize = (entries: { account: string; debit?: number; credit?: number }[]) =>
      entries
        .map(e => `${e.account}:${e.debit ?? 0}:${e.credit ?? 0}`)
        .sort();

    const normalizedSubmitted = normalize(submitted);
    const normalizedExpected = normalize(expected);

    return normalizedSubmitted.every((entry, i) => entry === normalizedExpected[i]);
  }

  selectChoice(choiceIndex: number): void {
    const node = this.getCurrentNode();
    if (!node || node.type !== 'choice') return;

    const choice = node.choices[choiceIndex];
    if (!choice) return;

    this.vnState.choiceHistory.push(`${node.id}:${choiceIndex}`);

    if (choice.effects) {
      if (choice.effects.setFlags) {
        Object.assign(this.vnState.flags, choice.effects.setFlags);
      }
      if (choice.effects.transaction) {
        this.processTransactionDef(choice.effects.transaction);
      }
    }

    this.vnState.currentNodeId = choice.next;
    this.executeCurrentNode();
  }

  private executeCurrentNode(): void {
    const node = this.getCurrentNode();
    if (!node || !this.callbacks) return;

    switch (node.type) {
      case 'dialog': {
        this.callbacks.onDialog(node.speaker, t(node.textKey, this.vnState.flags as Record<string, string | number>), node.expression);
        break;
      }
      case 'choice': {
        const prompt = t(node.promptKey);
        const localizedChoices = node.choices.map(c => ({
          ...c,
          labelKey: c.labelKey,
        }));
        this.callbacks.onChoice(prompt, localizedChoices);
        break;
      }
      case 'transaction': {
        this.processTransactionEntries(node.entries);
        this.callbacks.onTransaction(t(node.descriptionKey, this.vnState.flags as Record<string, string | number>), node.entries, node.showAnimation);
        break;
      }
      case 'report': {
        const msg = node.messageKey ? t(node.messageKey) : undefined;
        this.callbacks.onReport(node.reportType, msg);
        break;
      }
      case 'narration': {
        this.callbacks.onNarration(t(node.textKey, this.vnState.flags as Record<string, string | number>));
        break;
      }
      case 'character_enter': {
        this.vnState.charactersOnScreen.set(node.character, node.position);
        this.callbacks.onCharacterEnter(node.character, node.position, node.expression);
        break;
      }
      case 'character_exit': {
        this.vnState.charactersOnScreen.delete(node.character);
        this.callbacks.onCharacterExit(node.character);
        break;
      }
      case 'background': {
        this.vnState.currentBackground = node.background;
        this.callbacks.onBackgroundChange(node.background);
        break;
      }
      case 'wait': {
        this.callbacks.onWait(node.duration);
        break;
      }
      case 'conditional': {
        const result = this.conditionEvaluator.evaluate(node.condition, this.vnState);
        this.vnState.currentNodeId = result ? node.trueNext : node.falseNext;
        this.executeCurrentNode();
        return;
      }
      case 'set_flag': {
        Object.assign(this.vnState.flags, node.flags);
        this.vnState.currentNodeId = node.next;
        this.executeCurrentNode();
        return;
      }
      case 'chapter_end': {
        const summary = node.summaryKey ? t(node.summaryKey) : undefined;
        this.gameState.completeChapter(this.vnState.currentChapter);
        this.callbacks.onChapterEnd(node.nextChapter, summary);
        break;
      }
      case 'quiz': {
        const question = t(node.questionKey);
        const options = node.options.map(o => t(o.labelKey));
        const correctFeedback = t(node.correctFeedbackKey);
        const incorrectFeedback = t(node.incorrectFeedbackKey);
        this.callbacks.onQuiz(question, options, node.correctIndex, correctFeedback, incorrectFeedback);
        break;
      }
      case 'journal_entry_input': {
        const jePrompt = t(node.promptKey);
        const correctFeedback = t(node.correctFeedbackKey);
        const incorrectFeedback = t(node.incorrectFeedbackKey);
        const hint = node.hintKey ? t(node.hintKey) : undefined;
        this.callbacks.onJournalEntryInput(jePrompt, node.expectedEntries, correctFeedback, incorrectFeedback, hint);
        break;
      }
    }
  }

  private processTransactionDef(txDef: TransactionDef): void {
    const lines: TransactionLine[] = txDef.entries.map(e => ({
      accountCategory: e.account as AccountCategory,
      debit: e.debit ?? 0,
      credit: e.credit ?? 0,
    }));

    const entry = createJournalEntry(
      `VN-${++journalEntryCounter}-${Date.now()}`,
      this.gameState.getCurrentDate(),
      'VN Transaction',
      'VN取引',
      lines,
      BusinessEventType.OWNER_INVESTMENT,
      this.vnState.currentChapter
    );

    this.gameState.processTransaction(entry);
  }

  private processTransactionEntries(entries: { account: string; debit?: number; credit?: number }[]): void {
    const lines: TransactionLine[] = entries.map(e => ({
      accountCategory: e.account as AccountCategory,
      debit: e.debit ?? 0,
      credit: e.credit ?? 0,
    }));

    const entry = createJournalEntry(
      `VN-${++journalEntryCounter}-${Date.now()}`,
      this.gameState.getCurrentDate(),
      'VN Transaction',
      'VN取引',
      lines,
      BusinessEventType.OWNER_INVESTMENT,
      this.vnState.currentChapter
    );

    this.gameState.processTransaction(entry);
  }

  getNodeById(id: string): ScriptNode | undefined {
    return this.nodeMap.get(id);
  }

  getNextNodeId(node: ScriptNode): string | null {
    if ('next' in node && typeof node.next === 'string') {
      return node.next;
    }
    return null;
  }

  serializeState(): string {
    return JSON.stringify({
      ...this.vnState,
      charactersOnScreen: Array.from(this.vnState.charactersOnScreen.entries()),
    });
  }

  deserializeState(json: string): void {
    const data = JSON.parse(json);
    this.vnState = {
      ...data,
      charactersOnScreen: new Map(data.charactersOnScreen),
    };
  }
}
