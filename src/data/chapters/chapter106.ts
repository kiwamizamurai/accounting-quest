import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Store scene ===
  {
    id: 'start',
    type: 'background',
    background: 'store',
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
    textKey: 'ch106.dialog_1',
    expression: 'happy',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },

  // === Petty Cash Setup ===
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_3',
    expression: 'thinking',
    next: 'dialog_petty_cash',
  },
  {
    id: 'dialog_petty_cash',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_petty_cash',
    expression: 'normal',
    next: 'setup_petty',
  },
  {
    id: 'setup_petty',
    type: 'transaction',
    descriptionKey: 'ch106.setup_petty.desc',
    entries: [
      { account: 'PETTY_CASH', debit: 500 },
      { account: 'CHECKING_ACCOUNT', credit: 500 },
    ],
    showAnimation: true,
    next: 'dialog_imprest',
  },
  {
    id: 'dialog_imprest',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_imprest',
    expression: 'thinking',
    next: 'dialog_imprest_2',
  },
  {
    id: 'dialog_imprest_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_imprest_2',
    expression: 'normal',
    next: 'narration_small_expenses',
  },

  // === Petty Cash Replenishment ===
  {
    id: 'narration_small_expenses',
    type: 'narration',
    textKey: 'ch106.narration_small_expenses',
    next: 'replenish_expenses',
  },
  {
    id: 'replenish_expenses',
    type: 'transaction',
    descriptionKey: 'ch106.replenish_expenses.desc',
    entries: [
      { account: 'CONSUMABLES_EXPENSE', debit: 120 },
      { account: 'TRAVEL_EXPENSE', debit: 80 },
      { account: 'COMMUNICATION_EXPENSE', debit: 50 },
      { account: 'PETTY_CASH', credit: 250 },
    ],
    showAnimation: true,
    next: 'replenish_refill',
  },
  {
    id: 'replenish_refill',
    type: 'transaction',
    descriptionKey: 'ch106.replenish_refill.desc',
    entries: [
      { account: 'PETTY_CASH', debit: 250 },
      { account: 'CHECKING_ACCOUNT', credit: 250 },
    ],
    showAnimation: true,
    next: 'dialog_replenish_done',
  },
  {
    id: 'dialog_replenish_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_replenish_done',
    expression: 'happy',
    next: 'dialog_temp_payment',
  },

  // === Temporary Payments ===
  {
    id: 'dialog_temp_payment',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_temp_payment',
    expression: 'thinking',
    next: 'dialog_temp_payment_2',
  },
  {
    id: 'dialog_temp_payment_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_temp_payment_2',
    expression: 'normal',
    next: 'temp_payment',
  },
  {
    id: 'temp_payment',
    type: 'transaction',
    descriptionKey: 'ch106.temp_payment.desc',
    entries: [
      { account: 'TEMPORARY_PAYMENTS', debit: 200 },
      { account: 'CHECKING_ACCOUNT', credit: 200 },
    ],
    showAnimation: true,
    next: 'dialog_resolve_intro',
  },

  // === Resolve Temporary Payment ===
  {
    id: 'dialog_resolve_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_resolve_intro',
    expression: 'thinking',
    next: 'dialog_resolve_explain',
  },
  {
    id: 'dialog_resolve_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_resolve_explain',
    expression: 'normal',
    next: 'resolve',
  },
  {
    id: 'resolve',
    type: 'transaction',
    descriptionKey: 'ch106.resolve.desc',
    entries: [
      { account: 'TRAVEL_EXPENSE', debit: 180 },
      { account: 'CHECKING_ACCOUNT', debit: 20 },
      { account: 'TEMPORARY_PAYMENTS', credit: 200 },
    ],
    showAnimation: true,
    next: 'dialog_resolve_done',
  },
  {
    id: 'dialog_resolve_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_resolve_done',
    expression: 'happy',
    next: 'dialog_cash_shortage',
  },

  // === Cash Shortage ===
  {
    id: 'dialog_cash_shortage',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_cash_shortage',
    expression: 'thinking',
    next: 'dialog_cash_shortage_2',
  },
  {
    id: 'dialog_cash_shortage_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_cash_shortage_2',
    expression: 'normal',
    next: 'cash_shortage',
  },
  {
    id: 'cash_shortage',
    type: 'transaction',
    descriptionKey: 'ch106.cash_shortage.desc',
    entries: [
      { account: 'MISCELLANEOUS_EXPENSE', debit: 30 },
      { account: 'PETTY_CASH', credit: 30 },
    ],
    showAnimation: true,
    next: 'dialog_shortage_done',
  },
  {
    id: 'dialog_shortage_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_shortage_done',
    expression: 'normal',
    next: 'dialog_overdraft',
  },

  // === Overdraft ===
  {
    id: 'dialog_overdraft',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_overdraft',
    expression: 'thinking',
    next: 'dialog_overdraft_2',
  },
  {
    id: 'dialog_overdraft_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_overdraft_2',
    expression: 'normal',
    next: 'overdraft',
  },
  {
    id: 'overdraft',
    type: 'transaction',
    descriptionKey: 'ch106.overdraft.desc',
    entries: [
      { account: 'CHECKING_ACCOUNT', debit: 1000 },
      { account: 'OVERDRAFT', credit: 1000 },
    ],
    showAnimation: true,
    next: 'dialog_overdraft_done',
  },
  {
    id: 'dialog_overdraft_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_overdraft_done',
    expression: 'normal',
    next: 'show_bs',
  },

  // === Balance Sheet ===
  {
    id: 'show_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch106.show_bs.msg',
    next: 'quiz_1',
  },

  // === Quiz ===
  {
    id: 'quiz_1',
    type: 'quiz',
    questionKey: 'ch106.quiz_1.question',
    options: [
      { labelKey: 'ch106.quiz_1.option_0' },
      { labelKey: 'ch106.quiz_1.option_1' },
      { labelKey: 'ch106.quiz_1.option_2' },
    ],
    correctIndex: 0,
    correctFeedbackKey: 'ch106.quiz_1.correct',
    incorrectFeedbackKey: 'ch106.quiz_1.incorrect',
    expReward: 10,
    next: 'dialog_summary',
  },

  // === Summary ===
  {
    id: 'dialog_summary',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_summary',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_end_final',
  },
  {
    id: 'dialog_end_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch106.dialog_end_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 107,
    summaryKey: 'ch106.chapter_end.summary',
  },
];

export const chapter106: ChapterScript = {
  id: 106,
  titleKey: 'ch106.title',
  subtitleKey: 'ch106.subtitle',
  nodes,
};
