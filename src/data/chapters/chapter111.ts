import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Office Scene ===
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
    expression: 'normal',
    next: 'dialog_intro_1',
  },
  {
    id: 'dialog_intro_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_intro_1',
    expression: 'normal',
    next: 'dialog_intro_2',
  },
  {
    id: 'dialog_intro_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_intro_2',
    expression: 'thinking',
    next: 'dialog_worksheet',
  },

  // === Worksheet Explanation ===
  {
    id: 'dialog_worksheet',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_worksheet',
    expression: 'normal',
    next: 'dialog_worksheet_detail',
  },
  {
    id: 'dialog_worksheet_detail',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_worksheet_detail',
    expression: 'thinking',
    next: 'dialog_adj1_intro',
  },

  // === Adjustment 1: COGS (Shikuri-Kurishii) ===
  {
    id: 'dialog_adj1_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_adj1_intro',
    expression: 'normal',
    next: 'dialog_shikuri_explain',
  },
  {
    id: 'dialog_shikuri_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_shikuri_explain',
    expression: 'thinking',
    next: 'shikuri_entry',
  },
  {
    id: 'shikuri_entry',
    type: 'transaction',
    descriptionKey: 'ch111.shikuri_entry.desc',
    entries: [
      { account: 'COST_OF_GOODS_SOLD', debit: 500 },
      { account: 'INVENTORY', credit: 500 },
    ],
    showAnimation: true,
    next: 'kurishii_entry',
  },
  {
    id: 'kurishii_entry',
    type: 'transaction',
    descriptionKey: 'ch111.kurishii_entry.desc',
    entries: [
      { account: 'INVENTORY', debit: 300 },
      { account: 'COST_OF_GOODS_SOLD', credit: 300 },
    ],
    showAnimation: true,
    next: 'dialog_cogs_explain',
  },
  {
    id: 'dialog_cogs_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_cogs_explain',
    expression: 'normal',
    next: 'dialog_cogs_detail',
  },
  {
    id: 'dialog_cogs_detail',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_cogs_detail',
    expression: 'thinking',
    next: 'dialog_adj2_intro',
  },

  // === Adjustment 2: Depreciation ===
  {
    id: 'dialog_adj2_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_adj2_intro',
    expression: 'normal',
    next: 'monthly_depreciation',
  },
  {
    id: 'monthly_depreciation',
    type: 'transaction',
    descriptionKey: 'ch111.monthly_depreciation.desc',
    entries: [
      { account: 'DEPRECIATION_EXPENSE', debit: 250 },
      { account: 'ACCUMULATED_DEPRECIATION', credit: 250 },
    ],
    showAnimation: true,
    next: 'dialog_dep_explain',
  },
  {
    id: 'dialog_dep_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_dep_explain',
    expression: 'normal',
    next: 'dialog_adj3_intro',
  },

  // === Adjustment 3: Allowance for Doubtful Accounts ===
  {
    id: 'dialog_adj3_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_adj3_intro',
    expression: 'normal',
    next: 'allowance_adjustment',
  },
  {
    id: 'allowance_adjustment',
    type: 'transaction',
    descriptionKey: 'ch111.allowance_adjustment.desc',
    entries: [
      { account: 'ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS_EXPENSE', debit: 100 },
      { account: 'ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS', credit: 100 },
    ],
    showAnimation: true,
    next: 'dialog_allowance_explain',
  },
  {
    id: 'dialog_allowance_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_allowance_explain',
    expression: 'normal',
    next: 'dialog_adj4_intro',
  },

  // === Adjustment 4: Corporate Tax ===
  {
    id: 'dialog_adj4_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_adj4_intro',
    expression: 'normal',
    next: 'dialog_tax_explain',
  },
  {
    id: 'dialog_tax_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_tax_explain',
    expression: 'thinking',
    next: 'corporate_tax',
  },
  {
    id: 'corporate_tax',
    type: 'transaction',
    descriptionKey: 'ch111.corporate_tax.desc',
    entries: [
      { account: 'TAX_EXPENSE', debit: 500 },
      { account: 'ACCRUED_CORPORATE_TAX', credit: 500 },
    ],
    showAnimation: true,
    next: 'dialog_tax_after',
  },
  {
    id: 'dialog_tax_after',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_tax_after',
    expression: 'normal',
    next: 'show_pl',
  },

  // === Reports ===
  {
    id: 'show_pl',
    type: 'report',
    reportType: 'income_statement',
    messageKey: 'ch111.show_pl.msg',
    next: 'show_bs',
  },
  {
    id: 'show_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch111.show_bs.msg',
    next: 'dialog_reports_review',
  },
  {
    id: 'dialog_reports_review',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_reports_review',
    expression: 'normal',
    next: 'journal_entry_depreciation',
  },

  // === Practice ===
  {
    id: 'journal_entry_depreciation',
    type: 'journal_entry_input',
    promptKey: 'ch111.journal_entry_depreciation.prompt',
    expectedEntries: [
      { account: 'DEPRECIATION_EXPENSE', debit: 250 },
      { account: 'ACCUMULATED_DEPRECIATION', credit: 250 },
    ],
    correctFeedbackKey: 'ch111.journal_entry_depreciation.correct',
    incorrectFeedbackKey: 'ch111.journal_entry_depreciation.incorrect',
    hintKey: 'ch111.journal_entry_depreciation.hint',
    expReward: 25,
    next: 'quiz_closing',
  },

  // === Quiz ===
  {
    id: 'quiz_closing',
    type: 'quiz',
    questionKey: 'ch111.quiz_closing.question',
    options: [
      { labelKey: 'ch111.quiz_closing.option_0' },
      { labelKey: 'ch111.quiz_closing.option_1' },
      { labelKey: 'ch111.quiz_closing.option_2' },
    ],
    correctIndex: 0,
    correctFeedbackKey: 'ch111.quiz_closing.correct',
    incorrectFeedbackKey: 'ch111.quiz_closing.incorrect',
    expReward: 20,
    next: 'dialog_summary_1',
  },

  // === Summary ===
  {
    id: 'dialog_summary_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_summary_1',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_summary_3',
  },
  {
    id: 'dialog_summary_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch111.dialog_summary_3',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 112,
    summaryKey: 'ch111.chapter_end.summary',
  },
];

export const chapter111: ChapterScript = {
  id: 111,
  titleKey: 'ch111.title',
  subtitleKey: 'ch111.subtitle',
  nodes,
};
