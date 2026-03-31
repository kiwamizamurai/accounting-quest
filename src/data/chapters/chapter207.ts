import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Group Management ===
  {
    id: 'start',
    type: 'background',
    background: 'office',
    next: 'mentor_enter',
  },
  {
    id: 'mentor_enter',
    type: 'character_enter',
    character: 'mentor',
    position: 'right',
    expression: 'thinking',
    next: 'dialog_1',
  },
  {
    id: 'dialog_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_1',
    expression: 'thinking',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_3',
    expression: 'normal',
    next: 'dialog_consolidated_intro',
  },

  // === Consolidated Statements ===
  {
    id: 'dialog_consolidated_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_consolidated_intro',
    expression: 'thinking',
    next: 'dialog_consolidated_purpose',
  },
  {
    id: 'dialog_consolidated_purpose',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_consolidated_purpose',
    expression: 'normal',
    next: 'dialog_consolidated_steps',
  },
  {
    id: 'dialog_consolidated_steps',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_consolidated_steps',
    expression: 'thinking',
    next: 'intercompany_intro',
  },

  // === Intercompany Transactions ===
  {
    id: 'intercompany_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.intercompany_intro',
    expression: 'thinking',
    next: 'dialog_intercompany_example',
  },
  {
    id: 'dialog_intercompany_example',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_intercompany_example',
    expression: 'normal',
    next: 'intercompany_sale_narration',
  },
  {
    id: 'intercompany_sale_narration',
    type: 'narration',
    textKey: 'ch207.intercompany_sale_narration',
    next: 'parent_sale_tx',
  },

  // === Parent Company Sale to Subsidiary ===
  {
    id: 'parent_sale_tx',
    type: 'transaction',
    descriptionKey: 'ch207.parent_sale_tx.desc',
    entries: [
      { account: 'ACCOUNTS_RECEIVABLE', debit: 3000 },
      { account: 'SALES_REVENUE', credit: 3000 },
    ],
    showAnimation: true,
    next: 'parent_cogs_tx',
  },
  {
    id: 'parent_cogs_tx',
    type: 'transaction',
    descriptionKey: 'ch207.parent_cogs_tx.desc',
    entries: [
      { account: 'COST_OF_GOODS_SOLD', debit: 2000 },
      { account: 'FINISHED_GOODS', credit: 2000 },
    ],
    showAnimation: true,
    next: 'sub_purchase_tx',
  },
  {
    id: 'sub_purchase_tx',
    type: 'transaction',
    descriptionKey: 'ch207.sub_purchase_tx.desc',
    entries: [
      { account: 'INVENTORY', debit: 3000 },
      { account: 'CHECKING_ACCOUNT', credit: 3000 },
    ],
    showAnimation: true,
    next: 'dialog_intercompany_problem',
  },
  {
    id: 'dialog_intercompany_problem',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_intercompany_problem',
    expression: 'thinking',
    next: 'dialog_elimination_explain',
  },

  // === Elimination Entry ===
  {
    id: 'dialog_elimination_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_elimination_explain',
    expression: 'thinking',
    next: 'dialog_elimination_reason',
  },
  {
    id: 'dialog_elimination_reason',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_elimination_reason',
    expression: 'normal',
    next: 'elimination_tx',
  },
  {
    id: 'elimination_tx',
    type: 'transaction',
    descriptionKey: 'ch207.elimination_tx.desc',
    entries: [
      { account: 'SALES_REVENUE', debit: 3000 },
      { account: 'COST_OF_GOODS_SOLD', credit: 2000 },
      { account: 'INVENTORY', credit: 1000 },
    ],
    showAnimation: true,
    next: 'dialog_after_elimination',
  },
  {
    id: 'dialog_after_elimination',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_after_elimination',
    expression: 'happy',
    next: 'nci_intro',
  },

  // === Non-Controlling Interests ===
  {
    id: 'nci_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.nci_intro',
    expression: 'thinking',
    next: 'dialog_nci_explain',
  },
  {
    id: 'dialog_nci_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_nci_explain',
    expression: 'normal',
    next: 'dialog_nci_example',
  },
  {
    id: 'dialog_nci_example',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_nci_example',
    expression: 'normal',
    next: 'show_consolidated_bs',
  },

  // === Consolidated Balance Sheet ===
  {
    id: 'show_consolidated_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch207.show_consolidated_bs.msg',
    next: 'quiz_intro',
  },

  // === Quiz: Why Eliminate Intercompany Transactions? ===
  {
    id: 'quiz_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.quiz_intro',
    expression: 'happy',
    next: 'quiz_elimination',
  },
  {
    id: 'quiz_elimination',
    type: 'quiz',
    questionKey: 'ch207.quiz_elimination.question',
    options: [
      { labelKey: 'ch207.quiz_elimination.0' },
      { labelKey: 'ch207.quiz_elimination.1' },
      { labelKey: 'ch207.quiz_elimination.2' },
    ],
    correctIndex: 2,
    correctFeedbackKey: 'ch207.quiz_elimination.correct',
    incorrectFeedbackKey: 'ch207.quiz_elimination.incorrect',
    expReward: 30,
    next: 'dialog_summary_1',
  },

  // === Summary ===
  {
    id: 'dialog_summary_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_summary_1',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_final',
  },
  {
    id: 'dialog_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch207.dialog_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 208,
    summaryKey: 'ch207.chapter_end.summary',
  },
];

export const chapter207: ChapterScript = {
  id: 207,
  titleKey: 'ch207.title',
  subtitleKey: 'ch207.subtitle',
  nodes,
};
