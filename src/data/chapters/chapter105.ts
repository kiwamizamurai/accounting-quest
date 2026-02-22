import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Office scene ===
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
    expression: 'happy',
    next: 'dialog_1',
  },
  {
    id: 'dialog_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_1',
    expression: 'happy',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_3',
    expression: 'thinking',
    next: 'employee_enter',
  },

  // === Employee Introduction ===
  {
    id: 'employee_enter',
    type: 'character_enter',
    character: 'employee',
    position: 'left',
    expression: 'happy',
    next: 'dialog_employee_1',
  },
  {
    id: 'dialog_employee_1',
    type: 'dialog',
    speaker: 'employee',
    textKey: 'ch105.dialog_employee_1',
    expression: 'happy',
    next: 'dialog_wages_intro',
  },

  // === Wages and Withholding ===
  {
    id: 'dialog_wages_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_wages_intro',
    expression: 'normal',
    next: 'dialog_withholding',
  },
  {
    id: 'dialog_withholding',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_withholding',
    expression: 'thinking',
    next: 'dialog_withholding_2',
  },
  {
    id: 'dialog_withholding_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_withholding_2',
    expression: 'normal',
    next: 'pay_wages',
  },
  {
    id: 'pay_wages',
    type: 'transaction',
    descriptionKey: 'ch105.pay_wages.desc',
    entries: [
      { account: 'WAGES_EXPENSE', debit: 3000 },
      { account: 'INCOME_TAX_WITHHOLDING', credit: 300 },
      { account: 'SOCIAL_INSURANCE_WITHHOLDING', credit: 450 },
      { account: 'CHECKING_ACCOUNT', credit: 2250 },
    ],
    showAnimation: true,
    next: 'dialog_net_pay',
  },

  // === Net Pay Explanation ===
  {
    id: 'dialog_net_pay',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_net_pay',
    expression: 'normal',
    next: 'dialog_net_pay_2',
  },
  {
    id: 'dialog_net_pay_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_net_pay_2',
    expression: 'thinking',
    next: 'dialog_welfare',
  },

  // === Employer Social Insurance ===
  {
    id: 'dialog_welfare',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_welfare',
    expression: 'normal',
    next: 'pay_welfare',
  },
  {
    id: 'pay_welfare',
    type: 'transaction',
    descriptionKey: 'ch105.pay_welfare.desc',
    entries: [
      { account: 'STATUTORY_WELFARE_EXPENSE', debit: 450 },
      { account: 'CHECKING_ACCOUNT', credit: 450 },
    ],
    showAnimation: true,
    next: 'dialog_welfare_done',
  },
  {
    id: 'dialog_welfare_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_welfare_done',
    expression: 'happy',
    next: 'dialog_advance',
  },

  // === Advance to Employee ===
  {
    id: 'dialog_advance',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_advance',
    expression: 'thinking',
    next: 'dialog_advance_2',
  },
  {
    id: 'dialog_advance_2',
    type: 'dialog',
    speaker: 'employee',
    textKey: 'ch105.dialog_advance_2',
    expression: 'normal',
    next: 'advance',
  },
  {
    id: 'advance',
    type: 'transaction',
    descriptionKey: 'ch105.advance.desc',
    entries: [
      { account: 'ADVANCES_PAID', debit: 100 },
      { account: 'CHECKING_ACCOUNT', credit: 100 },
    ],
    showAnimation: true,
    next: 'dialog_advance_done',
  },
  {
    id: 'dialog_advance_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_advance_done',
    expression: 'normal',
    next: 'journal_entry_input',
  },

  // === Journal Entry Input ===
  {
    id: 'journal_entry_input',
    type: 'journal_entry_input',
    promptKey: 'ch105.journal_entry_input.prompt',
    expectedEntries: [
      { account: 'WAGES_EXPENSE', debit: 3000 },
      { account: 'INCOME_TAX_WITHHOLDING', credit: 300 },
      { account: 'SOCIAL_INSURANCE_WITHHOLDING', credit: 450 },
      { account: 'CHECKING_ACCOUNT', credit: 2250 },
    ],
    correctFeedbackKey: 'ch105.journal_entry_input.correct',
    incorrectFeedbackKey: 'ch105.journal_entry_input.incorrect',
    hintKey: 'ch105.journal_entry_input.hint',
    expReward: 20,
    next: 'employee_exit',
  },
  {
    id: 'employee_exit',
    type: 'character_exit',
    character: 'employee',
    next: 'show_bs',
  },

  // === Balance Sheet ===
  {
    id: 'show_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch105.show_bs.msg',
    next: 'quiz_1',
  },

  // === Quiz ===
  {
    id: 'quiz_1',
    type: 'quiz',
    questionKey: 'ch105.quiz_1.question',
    options: [
      { labelKey: 'ch105.quiz_1.option_0' },
      { labelKey: 'ch105.quiz_1.option_1' },
      { labelKey: 'ch105.quiz_1.option_2' },
      { labelKey: 'ch105.quiz_1.option_3' },
    ],
    correctIndex: 1,
    correctFeedbackKey: 'ch105.quiz_1.correct',
    incorrectFeedbackKey: 'ch105.quiz_1.incorrect',
    expReward: 10,
    next: 'dialog_summary',
  },

  // === Summary ===
  {
    id: 'dialog_summary',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_summary',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_end_final',
  },
  {
    id: 'dialog_end_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch105.dialog_end_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 106,
    summaryKey: 'ch105.chapter_end.summary',
  },
];

export const chapter105: ChapterScript = {
  id: 105,
  titleKey: 'ch105.title',
  subtitleKey: 'ch105.subtitle',
  nodes,
};
