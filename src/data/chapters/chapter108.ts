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
    textKey: 'ch108.dialog_intro_1',
    expression: 'normal',
    next: 'dialog_intro_2',
  },
  {
    id: 'dialog_intro_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_intro_2',
    expression: 'thinking',
    next: 'dialog_intro_3',
  },

  // === Setting up Allowance ===
  {
    id: 'dialog_intro_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_intro_3',
    expression: 'normal',
    next: 'dialog_estimate',
  },
  {
    id: 'dialog_estimate',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_estimate',
    expression: 'thinking',
    next: 'record_allowance',
  },
  {
    id: 'record_allowance',
    type: 'transaction',
    descriptionKey: 'ch108.record_allowance.desc',
    entries: [
      { account: 'ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS_EXPENSE', debit: 200 },
      { account: 'ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS', credit: 200 },
    ],
    showAnimation: true,
    next: 'dialog_contra_asset',
  },
  {
    id: 'dialog_contra_asset',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_contra_asset',
    expression: 'thinking',
    next: 'dialog_contra_asset_2',
  },
  {
    id: 'dialog_contra_asset_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_contra_asset_2',
    expression: 'normal',
    next: 'show_bs_allowance',
  },
  {
    id: 'show_bs_allowance',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch108.show_bs_allowance.msg',
    next: 'dialog_bs_explain',
  },
  {
    id: 'dialog_bs_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_bs_explain',
    expression: 'normal',
    next: 'narration_next_year',
  },

  // === Actual Write-Off ===
  {
    id: 'narration_next_year',
    type: 'narration',
    textKey: 'ch108.narration_next_year',
    next: 'dialog_default',
  },
  {
    id: 'dialog_default',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_default',
    expression: 'sad',
    next: 'actual_bad_debt',
  },
  {
    id: 'actual_bad_debt',
    type: 'transaction',
    descriptionKey: 'ch108.actual_bad_debt.desc',
    entries: [
      { account: 'ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS', debit: 150 },
      { account: 'ACCOUNTS_RECEIVABLE', credit: 150 },
    ],
    showAnimation: true,
    next: 'dialog_writeoff_explain',
  },
  {
    id: 'dialog_writeoff_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_writeoff_explain',
    expression: 'thinking',
    next: 'dialog_writeoff_explain_2',
  },
  {
    id: 'dialog_writeoff_explain_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_writeoff_explain_2',
    expression: 'normal',
    next: 'dialog_supplement_intro',
  },

  // === Supplement Method ===
  {
    id: 'dialog_supplement_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_supplement_intro',
    expression: 'normal',
    next: 'dialog_supplement_calc',
  },
  {
    id: 'dialog_supplement_calc',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_supplement_calc',
    expression: 'thinking',
    next: 'dialog_supplement_detail',
  },
  {
    id: 'dialog_supplement_detail',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_supplement_detail',
    expression: 'normal',
    next: 'supplement_entry',
  },
  {
    id: 'supplement_entry',
    type: 'transaction',
    descriptionKey: 'ch108.supplement_entry.desc',
    entries: [
      { account: 'ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS_EXPENSE', debit: 190 },
      { account: 'ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS', credit: 190 },
    ],
    showAnimation: true,
    next: 'dialog_supplement_after',
  },
  {
    id: 'dialog_supplement_after',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_supplement_after',
    expression: 'happy',
    next: 'journal_entry_allowance',
  },

  // === Practice ===
  {
    id: 'journal_entry_allowance',
    type: 'journal_entry_input',
    promptKey: 'ch108.journal_entry_allowance.prompt',
    expectedEntries: [
      { account: 'ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS_EXPENSE', debit: 200 },
      { account: 'ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS', credit: 200 },
    ],
    correctFeedbackKey: 'ch108.journal_entry_allowance.correct',
    incorrectFeedbackKey: 'ch108.journal_entry_allowance.incorrect',
    hintKey: 'ch108.journal_entry_allowance.hint',
    expReward: 25,
    next: 'show_bs_final',
  },

  // === Reports and Quiz ===
  {
    id: 'show_bs_final',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch108.show_bs_final.msg',
    next: 'quiz_allowance',
  },
  {
    id: 'quiz_allowance',
    type: 'quiz',
    questionKey: 'ch108.quiz_allowance.question',
    options: [
      { labelKey: 'ch108.quiz_allowance.option_0' },
      { labelKey: 'ch108.quiz_allowance.option_1' },
      { labelKey: 'ch108.quiz_allowance.option_2' },
    ],
    correctIndex: 2,
    correctFeedbackKey: 'ch108.quiz_allowance.correct',
    incorrectFeedbackKey: 'ch108.quiz_allowance.incorrect',
    expReward: 20,
    next: 'dialog_summary_1',
  },

  // === Summary ===
  {
    id: 'dialog_summary_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_summary_1',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_summary_3',
  },
  {
    id: 'dialog_summary_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch108.dialog_summary_3',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 109,
    summaryKey: 'ch108.chapter_end.summary',
  },
];

export const chapter108: ChapterScript = {
  id: 108,
  titleKey: 'ch108.title',
  subtitleKey: 'ch108.subtitle',
  nodes,
};
