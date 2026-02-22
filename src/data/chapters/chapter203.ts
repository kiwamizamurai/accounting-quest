import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Standard Costing ===
  {
    id: 'start',
    type: 'background',
    background: 'factory',
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
    textKey: 'ch203.dialog_1',
    expression: 'thinking',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.dialog_3',
    expression: 'normal',
    next: 'dialog_standard_explain',
  },

  // === Explain Standard Costing ===
  {
    id: 'dialog_standard_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.dialog_standard_explain',
    expression: 'thinking',
    next: 'dialog_standard_purpose',
  },
  {
    id: 'dialog_standard_purpose',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.dialog_standard_purpose',
    expression: 'normal',
    next: 'standard_cost_intro',
  },

  // === Record Standard Cost ===
  {
    id: 'standard_cost_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.standard_cost_intro',
    expression: 'normal',
    next: 'standard_cost_tx',
  },
  {
    id: 'standard_cost_tx',
    type: 'transaction',
    descriptionKey: 'ch203.standard_cost_tx.desc',
    entries: [
      { account: 'WORK_IN_PROCESS', debit: 5000 },
      { account: 'CHECKING_ACCOUNT', credit: 5000 },
    ],
    showAnimation: true,
    next: 'dialog_after_standard',
  },
  {
    id: 'dialog_after_standard',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.dialog_after_standard',
    expression: 'normal',
    next: 'show_bs_after_standard',
  },
  {
    id: 'show_bs_after_standard',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch203.show_bs_after_standard.msg',
    next: 'variance_intro',
  },

  // === Variance Analysis ===
  {
    id: 'variance_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.variance_intro',
    expression: 'thinking',
    next: 'dialog_actual_cost',
  },
  {
    id: 'dialog_actual_cost',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.dialog_actual_cost',
    expression: 'surprised',
    next: 'dialog_price_variance',
  },
  {
    id: 'dialog_price_variance',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.dialog_price_variance',
    expression: 'thinking',
    next: 'dialog_efficiency_variance',
  },
  {
    id: 'dialog_efficiency_variance',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.dialog_efficiency_variance',
    expression: 'thinking',
    next: 'variance_tx_intro',
  },

  // === Record Variance ===
  {
    id: 'variance_tx_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.variance_tx_intro',
    expression: 'normal',
    next: 'variance_tx',
  },
  {
    id: 'variance_tx',
    type: 'transaction',
    descriptionKey: 'ch203.variance_tx.desc',
    entries: [
      { account: 'MATERIAL_PRICE_VARIANCE', debit: 200 },
      { account: 'LABOR_EFFICIENCY_VARIANCE', debit: 100 },
      { account: 'CHECKING_ACCOUNT', credit: 300 },
    ],
    showAnimation: true,
    next: 'dialog_after_variance',
  },
  {
    id: 'dialog_after_variance',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.dialog_after_variance',
    expression: 'normal',
    next: 'dialog_favorable_unfavorable',
  },
  {
    id: 'dialog_favorable_unfavorable',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.dialog_favorable_unfavorable',
    expression: 'thinking',
    next: 'quiz_intro',
  },

  // === Quiz: Favorable vs Unfavorable Variance ===
  {
    id: 'quiz_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.quiz_intro',
    expression: 'happy',
    next: 'quiz_variance',
  },
  {
    id: 'quiz_variance',
    type: 'quiz',
    questionKey: 'ch203.quiz_variance.question',
    options: [
      { labelKey: 'ch203.quiz_variance.0' },
      { labelKey: 'ch203.quiz_variance.1' },
      { labelKey: 'ch203.quiz_variance.2' },
    ],
    correctIndex: 0,
    correctFeedbackKey: 'ch203.quiz_variance.correct',
    incorrectFeedbackKey: 'ch203.quiz_variance.incorrect',
    expReward: 30,
    next: 'dialog_summary_1',
  },

  // === Summary ===
  {
    id: 'dialog_summary_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.dialog_summary_1',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_final',
  },
  {
    id: 'dialog_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch203.dialog_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 204,
    summaryKey: 'ch203.chapter_end.summary',
  },
];

export const chapter203: ChapterScript = {
  id: 203,
  titleKey: 'ch203.title',
  subtitleKey: 'ch203.subtitle',
  nodes,
};
