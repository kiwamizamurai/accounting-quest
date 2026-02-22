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
    textKey: 'ch109.dialog_intro_1',
    expression: 'normal',
    next: 'dialog_intro_2',
  },
  {
    id: 'dialog_intro_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_intro_2',
    expression: 'thinking',
    next: 'dialog_four_patterns',
  },
  {
    id: 'dialog_four_patterns',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_four_patterns',
    expression: 'normal',
    next: 'dialog_kumanomimi',
  },
  {
    id: 'dialog_kumanomimi',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_kumanomimi',
    expression: 'happy',
    next: 'dialog_pattern1_intro',
  },

  // === Pattern 1: Prepaid Expenses ===
  {
    id: 'dialog_pattern1_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_pattern1_intro',
    expression: 'normal',
    next: 'prepaid_insurance_pay',
  },
  {
    id: 'prepaid_insurance_pay',
    type: 'transaction',
    descriptionKey: 'ch109.prepaid_insurance_pay.desc',
    entries: [
      { account: 'INSURANCE_EXPENSE', debit: 1200 },
      { account: 'CHECKING_ACCOUNT', credit: 1200 },
    ],
    showAnimation: true,
    next: 'dialog_pattern1_adjust',
  },
  {
    id: 'dialog_pattern1_adjust',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_pattern1_adjust',
    expression: 'thinking',
    next: 'prepaid_adjustment',
  },
  {
    id: 'prepaid_adjustment',
    type: 'transaction',
    descriptionKey: 'ch109.prepaid_adjustment.desc',
    entries: [
      { account: 'PREPAID_EXPENSES', debit: 400 },
      { account: 'INSURANCE_EXPENSE', credit: 400 },
    ],
    showAnimation: true,
    next: 'dialog_pattern1_explain',
  },
  {
    id: 'dialog_pattern1_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_pattern1_explain',
    expression: 'normal',
    next: 'dialog_pattern2_intro',
  },

  // === Pattern 2: Accrued Expenses ===
  {
    id: 'dialog_pattern2_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_pattern2_intro',
    expression: 'normal',
    next: 'dialog_pattern2_explain',
  },
  {
    id: 'dialog_pattern2_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_pattern2_explain',
    expression: 'thinking',
    next: 'accrued_interest_expense',
  },
  {
    id: 'accrued_interest_expense',
    type: 'transaction',
    descriptionKey: 'ch109.accrued_interest_expense.desc',
    entries: [
      { account: 'INTEREST_EXPENSE', debit: 50 },
      { account: 'ACCRUED_EXPENSES', credit: 50 },
    ],
    showAnimation: true,
    next: 'dialog_pattern2_after',
  },
  {
    id: 'dialog_pattern2_after',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_pattern2_after',
    expression: 'normal',
    next: 'dialog_pattern3_intro',
  },

  // === Pattern 3: Unearned Revenue (brief review) ===
  {
    id: 'dialog_pattern3_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_pattern3_intro',
    expression: 'normal',
    next: 'dialog_pattern3_review',
  },
  {
    id: 'dialog_pattern3_review',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_pattern3_review',
    expression: 'thinking',
    next: 'dialog_pattern4_intro',
  },

  // === Pattern 4: Accrued Revenue ===
  {
    id: 'dialog_pattern4_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_pattern4_intro',
    expression: 'normal',
    next: 'dialog_pattern4_explain',
  },
  {
    id: 'dialog_pattern4_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_pattern4_explain',
    expression: 'thinking',
    next: 'accrued_revenue_entry',
  },
  {
    id: 'accrued_revenue_entry',
    type: 'transaction',
    descriptionKey: 'ch109.accrued_revenue_entry.desc',
    entries: [
      { account: 'ACCRUED_REVENUE', debit: 30 },
      { account: 'INTEREST_INCOME', credit: 30 },
    ],
    showAnimation: true,
    next: 'dialog_pattern4_after',
  },
  {
    id: 'dialog_pattern4_after',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_pattern4_after',
    expression: 'normal',
    next: 'dialog_reversal_intro',
  },

  // === Reversal Entries ===
  {
    id: 'dialog_reversal_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_reversal_intro',
    expression: 'normal',
    next: 'dialog_reversal_explain',
  },
  {
    id: 'dialog_reversal_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_reversal_explain',
    expression: 'thinking',
    next: 'reverse_accrued_expense',
  },
  {
    id: 'reverse_accrued_expense',
    type: 'transaction',
    descriptionKey: 'ch109.reverse_accrued_expense.desc',
    entries: [
      { account: 'ACCRUED_EXPENSES', debit: 50 },
      { account: 'INTEREST_EXPENSE', credit: 50 },
    ],
    showAnimation: true,
    next: 'dialog_reversal_after',
  },
  {
    id: 'dialog_reversal_after',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_reversal_after',
    expression: 'normal',
    next: 'journal_entry_accrued',
  },

  // === Practice ===
  {
    id: 'journal_entry_accrued',
    type: 'journal_entry_input',
    promptKey: 'ch109.journal_entry_accrued.prompt',
    expectedEntries: [
      { account: 'INTEREST_EXPENSE', debit: 50 },
      { account: 'ACCRUED_EXPENSES', credit: 50 },
    ],
    correctFeedbackKey: 'ch109.journal_entry_accrued.correct',
    incorrectFeedbackKey: 'ch109.journal_entry_accrued.incorrect',
    hintKey: 'ch109.journal_entry_accrued.hint',
    expReward: 25,
    next: 'show_bs',
  },

  // === Reports and Quiz ===
  {
    id: 'show_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch109.show_bs.msg',
    next: 'quiz_accrued',
  },
  {
    id: 'quiz_accrued',
    type: 'quiz',
    questionKey: 'ch109.quiz_accrued.question',
    options: [
      { labelKey: 'ch109.quiz_accrued.option_0' },
      { labelKey: 'ch109.quiz_accrued.option_1' },
      { labelKey: 'ch109.quiz_accrued.option_2' },
    ],
    correctIndex: 0,
    correctFeedbackKey: 'ch109.quiz_accrued.correct',
    incorrectFeedbackKey: 'ch109.quiz_accrued.incorrect',
    expReward: 20,
    next: 'dialog_summary_1',
  },

  // === Summary ===
  {
    id: 'dialog_summary_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_summary_1',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_summary_3',
  },
  {
    id: 'dialog_summary_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch109.dialog_summary_3',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 110,
    summaryKey: 'ch109.chapter_end.summary',
  },
];

export const chapter109: ChapterScript = {
  id: 109,
  titleKey: 'ch109.title',
  subtitleKey: 'ch109.subtitle',
  nodes,
};
