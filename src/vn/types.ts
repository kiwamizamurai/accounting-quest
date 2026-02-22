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
  | JournalEntryInputNode;

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
}

export interface ChoiceEffects {
  transaction?: TransactionDef;
  setFlags?: Record<string, unknown>;
}

export interface TransactionDef {
  entries: { account: string; debit?: number; credit?: number }[];
}

export interface TransactionNode {
  id: string;
  type: 'transaction';
  descriptionKey: string;
  entries: { account: string; debit?: number; credit?: number }[];
  showAnimation: boolean;
  next: string;
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

export interface ConditionDef {
  type: 'flag' | 'account_gte' | 'account_lte' | 'chapter_completed';
  flag?: string;
  value?: unknown;
  account?: string;
  amount?: number;
  chapter?: number;
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
  expectedEntries: { account: string; debit?: number; credit?: number }[];
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
}

export interface VNState {
  currentNodeId: string;
  currentChapter: number;
  flags: Record<string, unknown>;
  charactersOnScreen: Map<string, CharacterPosition>;
  currentBackground: string;
  choiceHistory: string[];
}
