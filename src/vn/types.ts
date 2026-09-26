export type ScriptNode =
  | DialogNode
  | ChoiceNode
  | TransactionNode
  | ReportNode
  | NarrationNode
  | CharacterEnterNode
  | CharacterExitNode
  | BackgroundNode
  | WaitNode
  | ConditionalNode
  | SetFlagNode
  | ChapterEndNode
  | QuizNode
  | JournalEntryInputNode
  | CalcNode
  | NumberInputNode;

/** An amount in a script: a fixed number, or the value of a flag computed earlier in the chapter. */
export type Amount = number | { flag: string };

/** One line of an entry as written in a chapter script; the engine turns it into plain numbers. */
export interface EntryDef {
  account: string;
  debit?: Amount;
  credit?: Amount;
}

/** One line of an entry with every amount resolved to a number. */
export interface ResolvedEntry {
  account: string;
  debit?: number;
  credit?: number;
}

/**
 * A small arithmetic expression over flags and account balances.
 * `div` rounds down. `table` looks up the value for the greatest key not above `of`
 * (or the first entry when `of` is below every key).
 */
export type CalcExpr =
  | number
  | { flag: string }
  | { balance: string }
  | { netIncome: true }
  | { op: 'add' | 'sub' | 'mul' | 'div' | 'min' | 'max'; args: CalcExpr[] }
  | { op: 'table'; of: CalcExpr; table: Record<number, number> };

export interface DialogNode {
  id: string;
  type: 'dialog';
  speaker: string;
  textKey: string;
  expression?: CharacterExpression;
  next: string;
}

export interface ChoiceNode {
  id: string;
  type: 'choice';
  speaker?: string;
  promptKey: string;
  choices: ChoiceOption[];
}

export interface ChoiceOption {
  labelKey: string;
  next: string;
  effects?: ChoiceEffects;
  /** The option can only be picked while this holds; otherwise it is shown locked with `lockedKey`. */
  requires?: ConditionDef;
  lockedKey?: string;
}

/** A choice as handed to the UI: label already localized, lock state already decided. */
export interface ChoiceView extends ChoiceOption {
  label?: string;
  locked?: boolean;
  lockedText?: string;
}

export interface ChoiceEffects {
  transaction?: TransactionDef;
  setFlags?: Record<string, unknown>;
}

export interface TransactionDef {
  entries: EntryDef[];
  eventType?: string;
}

export interface TransactionNode {
  id: string;
  type: 'transaction';
  descriptionKey: string;
  entries: EntryDef[];
  showAnimation: boolean;
  next: string;
  eventType?: string;
  /** 'player': the player enters the journal entry; the correct one is recorded once they get it or run out of tries. */
  entry?: 'auto' | 'player';
  hintKey?: string;
  /** Tries the player gets for a player entry (default 3). */
  attempts?: number;
}

export interface ReportNode {
  id: string;
  type: 'report';
  reportType: 'balance_sheet' | 'income_statement' | 'cash_flow';
  messageKey?: string;
  next: string;
}

export interface NarrationNode {
  id: string;
  type: 'narration';
  textKey: string;
  next: string;
}

export interface CharacterEnterNode {
  id: string;
  type: 'character_enter';
  character: string;
  position: 'left' | 'right' | 'center';
  expression?: CharacterExpression;
  next: string;
}

export interface CharacterExitNode {
  id: string;
  type: 'character_exit';
  character: string;
  next: string;
}

export interface BackgroundNode {
  id: string;
  type: 'background';
  background: string;
  next: string;
}

export interface WaitNode {
  id: string;
  type: 'wait';
  duration: number;
  next: string;
}

export interface ConditionalNode {
  id: string;
  type: 'conditional';
  condition: ConditionDef;
  trueNext: string;
  falseNext: string;
}

/**
 * `flag_gte` / `flag_lte` compare a numeric flag with `amount`; `net_income_gte` / `net_income_lte`
 * compare the income statement's net income; `accuracy_gte` compares the share of player entries
 * that were right on the first try (1 when there were none); `all` holds when every condition in `all` does.
 */
export interface ConditionDef {
  type:
    | 'flag'
    | 'account_gte'
    | 'account_lte'
    | 'chapter_completed'
    | 'flag_gte'
    | 'flag_lte'
    | 'net_income_gte'
    | 'net_income_lte'
    | 'accuracy_gte'
    | 'all';
  flag?: string;
  value?: unknown;
  account?: string;
  amount?: number;
  chapter?: number;
  all?: ConditionDef[];
}

export interface SetFlagNode {
  id: string;
  type: 'set_flag';
  flags: Record<string, unknown>;
  next: string;
}

export interface ChapterEndNode {
  id: string;
  type: 'chapter_end';
  nextChapter?: number;
  summaryKey?: string;
  /** Goals for the chapter (at most three); the stars earned are the number of goals met. */
  rating?: RatingGoal[];
}

export interface RatingGoal {
  labelKey: string;
  when: ConditionDef;
}

export interface ChapterResult {
  goals: { label: string; met: boolean }[];
  stars: number;
}

/** Computes `expr` and stores it in the flag `set`. */
export interface CalcNode {
  id: string;
  type: 'calc';
  set: string;
  expr: CalcExpr;
  next: string;
}

/**
 * The player picks a number between `min` and `max` in steps of `step`; it is stored in `flag`.
 * `preview` shows the outcome of the candidate value: its text is filled with the flags plus
 * `flag` = the candidate plus each entry of `values`, evaluated with that candidate.
 */
export interface NumberInputNode {
  id: string;
  type: 'number_input';
  promptKey: string;
  flag: string;
  min: CalcExpr;
  max: CalcExpr;
  step: number;
  initial?: CalcExpr;
  preview?: { textKey: string; values?: Record<string, CalcExpr> };
  next: string;
}

// Quiz node: presents a multiple-choice question with correct/incorrect feedback
export interface QuizNode {
  id: string;
  type: 'quiz';
  questionKey: string;
  options: QuizOption[];
  correctIndex: number;
  correctFeedbackKey: string;
  incorrectFeedbackKey: string;
  expReward?: number;
  next: string;
}

export interface QuizOption {
  labelKey: string;
}

// Journal entry input node: player selects debit/credit accounts to form a journal entry
export interface JournalEntryInputNode {
  id: string;
  type: 'journal_entry_input';
  promptKey: string;
  expectedEntries: EntryDef[];
  correctFeedbackKey: string;
  incorrectFeedbackKey: string;
  hintKey?: string;
  expReward?: number;
  next: string;
}

export type CharacterExpression = 'normal' | 'happy' | 'thinking' | 'surprised' | 'sad' | 'angry';

export type CharacterPosition = 'left' | 'right' | 'center';

export interface CharacterDef {
  id: string;
  nameKey: string;
  roleKey: string;
  color: string;
  expressions: CharacterExpression[];
}

export interface ChapterScript {
  id: number;
  titleKey: string;
  subtitleKey: string;
  nodes: ScriptNode[];
  /**
   * Opening balances of the chapter, by account. The books are reset to these when the chapter starts
   * (income statement accounts start at zero) and retained earnings absorbs any difference.
   * Without it the balances of the previous chapter carry over.
   */
  opening?: Partial<Record<string, number>>;
}

export interface VNState {
  currentNodeId: string;
  currentChapter: number;
  flags: Record<string, unknown>;
  charactersOnScreen: Map<string, CharacterPosition>;
  currentBackground: string;
  choiceHistory: string[];
}
