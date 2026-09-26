import {
  ScriptNode,
  ChapterScript,
  ChapterResult,
  ChoiceView,
  ConditionDef,
  EntryDef,
  ResolvedEntry,
  TransactionDef,
  VNState,
  CharacterPosition,
} from './types';
import { ConditionEvaluator, ENTRY_STATS } from './ConditionEvaluator';
import { evaluateCalc, resolveEntries, CalcContext } from './Calc';
import { GameStateManager } from '../state/GameStateManager';
import { AccountCategory, isValidAccountCategory } from '../models/Account';
import { BusinessEventType, createJournalEntry, TransactionLine } from '../models/Transaction';
import { t } from '../i18n';

/** The player is asked to enter the journal entry of a transaction. */
export interface PlayerEntryRequest {
  description: string;
  /** The journal entries to pick from, the right one among them. */
  options: ResolvedEntry[][];
  correctIndex: number;
  hint?: string;
  attempts: number;
}

export interface PlayerEntryResult {
  correct: boolean;
  /** No more tries are needed: the entry was right, or the tries ran out. The correct entry is recorded. */
  done: boolean;
}

export type ScriptEngineCallback = {
  onDialog: (speaker: string, text: string, expression?: string) => void;
  onChoice: (prompt: string, choices: ChoiceView[]) => void;
  onTransaction: (description: string, entries: ResolvedEntry[], showAnimation: boolean) => void;
  /** Without it a player entry is recorded automatically, like any other transaction. */
  onPlayerTransaction?: (request: PlayerEntryRequest) => void;
  onReport: (reportType: string, message?: string) => void;
  onNarration: (text: string) => void;
  onCharacterEnter: (character: string, position: CharacterPosition, expression?: string) => void;
  onCharacterExit: (character: string) => void;
  onBackgroundChange: (background: string) => void;
  onWait: (duration: number) => void;
  onChapterEnd: (nextChapter?: number, summary?: string, result?: ChapterResult) => void;
  onQuiz: (question: string, options: string[], correctIndex: number, correctFeedback: string, incorrectFeedback: string) => void;
  onJournalEntryInput: (prompt: string, expectedEntries: ResolvedEntry[], correctFeedback: string, incorrectFeedback: string, hint?: string) => void;
};

interface PendingPlayerEntry {
  expected: ResolvedEntry[];
  eventType?: string;
  attempts: number;
  maxAttempts: number;
}

let journalEntryCounter = 0;

export class ScriptEngine {
  private chapters: Map<number, ChapterScript> = new Map();
  private nodeMap: Map<string, ScriptNode> = new Map();
  private vnState: VNState;
  private gameState: GameStateManager;
  private conditionEvaluator: ConditionEvaluator;
  private callbacks: ScriptEngineCallback | null = null;
  private pendingPlayerEntry: PendingPlayerEntry | null = null;

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

    if (chapter.opening) {
      this.gameState.resetBooks(chapter.opening);
    }

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
      if (!this.nodeMap.has(nextNodeId)) {
        console.error(`ScriptEngine: node ID "${nextNodeId}" not found in chapter ${this.vnState.currentChapter}`);
        return;
      }
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

    // Only set the next node ID; do not execute yet.
    // The caller (VNScene) will call advance() after showing feedback.
    this.vnState.currentNodeId = node.next;
    return isCorrect;
  }

  submitJournalEntry(entries: ResolvedEntry[]): boolean {
    const node = this.getCurrentNode();
    if (!node || node.type !== 'journal_entry_input') return false;

    const expected = resolveEntries(node.expectedEntries, this.vnState.flags);
    const isCorrect = this.entriesMatch(entries, expected);

    this.bumpStat(ENTRY_STATS.total);
    this.bumpStat(isCorrect ? ENTRY_STATS.firstTry : ENTRY_STATS.mistakes);

    if (isCorrect) {
      // Don't record the transaction here — the preceding transaction node already recorded it.
      // journal_entry_input is a practice/verification exercise only.
      if (node.expReward) {
        this.gameState.addPlayerExp(node.expReward);
      }
    }

    // Only set the next node ID; do not execute yet.
    // The caller (VNScene) will call advance() after showing feedback.
    this.vnState.currentNodeId = node.next;
    return isCorrect;
  }

  /**
   * The player's try at the journal entry of the current player transaction. Once it is right, or the
   * tries run out, the correct entry is recorded and the engine points at the next node; the caller
   * then calls advance().
   */
  submitPlayerEntry(entries: ResolvedEntry[]): PlayerEntryResult {
    const node = this.getCurrentNode();
    const pending = this.pendingPlayerEntry;
    if (!node || node.type !== 'transaction' || !pending) return { correct: false, done: true };

    pending.attempts++;
    const correct = this.entriesMatch(entries, pending.expected);

    if (pending.attempts === 1) {
      this.bumpStat(ENTRY_STATS.total);
      if (correct) this.bumpStat(ENTRY_STATS.firstTry);
    }
    if (!correct) this.bumpStat(ENTRY_STATS.mistakes);

    const done = correct || pending.attempts >= pending.maxAttempts;
    if (done) {
      this.processTransactionEntries(pending.expected, pending.eventType);
      this.pendingPlayerEntry = null;
      this.vnState.currentNodeId = node.next;
    }
    return { correct, done };
  }

  /** The right entry among the wrong ones; where it stands depends on the node, so it is not always first. */
  private playerEntryOptions(
    nodeId: string,
    correct: ResolvedEntry[],
    distractors: EntryDef[][]
  ): { options: ResolvedEntry[][]; correctIndex: number } {
    const wrong = distractors.map(entries => resolveEntries(entries, this.vnState.flags));
    const seed = [...nodeId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const correctIndex = seed % (wrong.length + 1);
    return { options: [...wrong.slice(0, correctIndex), correct, ...wrong.slice(correctIndex)], correctIndex };
  }

  private entriesMatch(submitted: ResolvedEntry[], expected: ResolvedEntry[]): boolean {
    if (submitted.length !== expected.length) return false;

    const normalize = (entries: ResolvedEntry[]) =>
      entries
        .map(e => `${e.account}:${e.debit ?? 0}:${e.credit ?? 0}`)
        .sort();

    const normalizedSubmitted = normalize(submitted);
    const normalizedExpected = normalize(expected);

    return normalizedSubmitted.every((entry, i) => entry === normalizedExpected[i]);
  }

  private bumpStat(key: string): void {
    this.vnState.flags[key] = Number(this.vnState.flags[key] ?? 0) + 1;
  }

  private calcContext(flags: Record<string, unknown> = this.vnState.flags): CalcContext {
    return {
      flags,
      balance: account => this.gameState.getAccountBalance(account as AccountCategory),
      netIncome: () => this.gameState.getIncomeStatement().netIncome,
    };
  }

  private textParams(): Record<string, string | number> {
    return this.vnState.flags as Record<string, string | number>;
  }

  /** Point at `nextId` if the chapter has it; used by nodes that continue without waiting for the UI. */
  private moveTo(nextId: string, from: string): boolean {
    if (!this.nodeMap.has(nextId)) {
      console.error(`ScriptEngine: ${from} next node "${nextId}" not found in chapter ${this.vnState.currentChapter}`);
      return false;
    }
    this.vnState.currentNodeId = nextId;
    return true;
  }

  selectChoice(choiceIndex: number): void {
    const node = this.getCurrentNode();
    if (!node || node.type !== 'choice') return;

    const choice = node.choices[choiceIndex];
    if (!choice) return;
    if (choice.requires && !this.conditionEvaluator.evaluate(choice.requires, this.vnState)) return;

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
    // Use a loop instead of recursion for conditional/set_flag chains
    // to prevent stack overflow on long chains
    const MAX_ITERATIONS = 100;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const node = this.getCurrentNode();
      if (!node || !this.callbacks) return;

      switch (node.type) {
        case 'dialog': {
          this.callbacks.onDialog(node.speaker, t(node.textKey, this.textParams()), node.expression);
          return;
        }
        case 'choice': {
          const prompt = t(node.promptKey, this.textParams());
          const choices: ChoiceView[] = node.choices.map(c => {
            const locked = !!c.requires && !this.conditionEvaluator.evaluate(c.requires, this.vnState);
            return {
              ...c,
              label: t(c.labelKey, this.textParams()),
              locked,
              lockedText: locked && c.lockedKey ? t(c.lockedKey, this.textParams()) : undefined,
            };
          });
          this.callbacks.onChoice(prompt, choices);
          return;
        }
        case 'transaction': {
          const entries = resolveEntries(node.entries, this.vnState.flags);
          const description = t(node.descriptionKey, this.textParams());
          if (node.entry === 'player' && this.callbacks.onPlayerTransaction) {
            const maxAttempts = node.attempts ?? 2;
            this.pendingPlayerEntry = { expected: entries, eventType: node.eventType, attempts: 0, maxAttempts };
            this.callbacks.onPlayerTransaction({
              description,
              ...this.playerEntryOptions(node.id, entries, node.distractors ?? []),
              hint: node.hintKey ? t(node.hintKey, this.textParams()) : undefined,
              attempts: maxAttempts,
            });
            return;
          }
          this.processTransactionEntries(entries, node.eventType);
          this.callbacks.onTransaction(description, entries, node.showAnimation);
          return;
        }
        case 'calc': {
          this.vnState.flags[node.set] = evaluateCalc(node.expr, this.calcContext());
          if (!this.moveTo(node.next, 'calc')) return;
          continue; // loop instead of recurse
        }
        case 'report': {
          const msg = node.messageKey ? t(node.messageKey, this.textParams()) : undefined;
          this.callbacks.onReport(node.reportType, msg);
          return;
        }
        case 'narration': {
          this.callbacks.onNarration(t(node.textKey, this.textParams()));
          return;
        }
        case 'character_enter': {
          this.vnState.charactersOnScreen.set(node.character, node.position);
          this.callbacks.onCharacterEnter(node.character, node.position, node.expression);
          return;
        }
        case 'character_exit': {
          this.vnState.charactersOnScreen.delete(node.character);
          this.callbacks.onCharacterExit(node.character);
          return;
        }
        case 'background': {
          this.vnState.currentBackground = node.background;
          this.callbacks.onBackgroundChange(node.background);
          return;
        }
        case 'wait': {
          this.callbacks.onWait(node.duration);
          return;
        }
        case 'conditional': {
          const result = this.conditionEvaluator.evaluate(node.condition, this.vnState);
          if (!this.moveTo(result ? node.trueNext : node.falseNext, 'conditional branch target')) return;
          continue; // loop instead of recurse
        }
        case 'set_flag': {
          Object.assign(this.vnState.flags, node.flags);
          if (!this.moveTo(node.next, 'set_flag')) return;
          continue; // loop instead of recurse
        }
        case 'chapter_end': {
          const summary = node.summaryKey ? t(node.summaryKey, this.textParams()) : undefined;
          this.gameState.completeChapter(this.vnState.currentChapter);
          this.callbacks.onChapterEnd(node.nextChapter, summary, this.rateChapter(node.rating));
          return;
        }
        case 'quiz': {
          const question = t(node.questionKey);
          const options = node.options.map(o => t(o.labelKey));
          const correctFeedback = t(node.correctFeedbackKey);
          const incorrectFeedback = t(node.incorrectFeedbackKey);
          this.callbacks.onQuiz(question, options, node.correctIndex, correctFeedback, incorrectFeedback);
          return;
        }
        case 'journal_entry_input': {
          const jePrompt = t(node.promptKey, this.textParams());
          const correctFeedback = t(node.correctFeedbackKey);
          const incorrectFeedback = t(node.incorrectFeedbackKey);
          const hint = node.hintKey ? t(node.hintKey) : undefined;
          this.callbacks.onJournalEntryInput(jePrompt, resolveEntries(node.expectedEntries, this.vnState.flags), correctFeedback, incorrectFeedback, hint);
          return;
        }
      }
    }

    console.error(`ScriptEngine: exceeded ${MAX_ITERATIONS} iterations in conditional/set_flag chain at node ${this.vnState.currentNodeId}`);
  }

  private processTransactionDef(txDef: TransactionDef): void {
    this.processTransactionEntries(resolveEntries(txDef.entries, this.vnState.flags), txDef.eventType);
  }

  private processTransactionEntries(entries: ResolvedEntry[], eventType?: string): void {
    const lines = this.buildTransactionLines(entries);
    if (!lines) return;

    const resolvedEventType = this.resolveEventType(eventType);

    const entry = createJournalEntry(
      `VN-${++journalEntryCounter}-${Date.now()}`,
      this.gameState.getCurrentDate(),
      'VN Transaction',
      'VN取引',
      lines,
      resolvedEventType,
      this.vnState.currentChapter
    );

    const result = this.gameState.processTransaction(entry);
    if (!result.success) {
      console.error(`ScriptEngine: Transaction failed in chapter ${this.vnState.currentChapter} at node ${this.vnState.currentNodeId}: ${result.error}`);
    }
  }

  private buildTransactionLines(entries: ResolvedEntry[]): TransactionLine[] | null {
    for (const e of entries) {
      if (!isValidAccountCategory(e.account)) {
        console.error(`ScriptEngine: Invalid AccountCategory "${e.account}" in chapter ${this.vnState.currentChapter} at node ${this.vnState.currentNodeId}`);
        return null;
      }
    }

    return entries.map(e => ({
      accountCategory: e.account as AccountCategory,
      debit: e.debit ?? 0,
      credit: e.credit ?? 0,
    }));
  }

  private resolveEventType(eventType?: string): BusinessEventType {
    if (eventType && Object.values(BusinessEventType).includes(eventType as BusinessEventType)) {
      return eventType as BusinessEventType;
    }
    return BusinessEventType.VN_SCRIPT_TRANSACTION;
  }

  /** Evaluate the chapter's goals; the stars are the number met. The best result is kept in the save. */
  private rateChapter(goals: { labelKey: string; when: ConditionDef }[] | undefined): ChapterResult | undefined {
    if (!goals || goals.length === 0) return undefined;

    const results = goals.slice(0, 3).map(goal => ({
      label: t(goal.labelKey, this.textParams()),
      met: this.conditionEvaluator.evaluate(goal.when, this.vnState),
    }));
    const stars = results.filter(goal => goal.met).length;
    this.gameState.setChapterResult(this.vnState.currentChapter, stars, results.length);
    return { goals: results, stars };
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
