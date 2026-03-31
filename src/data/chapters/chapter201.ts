import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Enter the Factory ===
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
    expression: 'happy',
    next: 'dialog_1',
  },
  {
    id: 'dialog_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_1',
    expression: 'happy',
    next: 'initial_fund_narration',
  },

  // === Initial Operating Fund ===
  {
    id: 'initial_fund_narration',
    type: 'narration',
    textKey: 'ch201.initial_fund_narration',
    next: 'initial_fund_tx',
  },
  {
    id: 'initial_fund_tx',
    type: 'transaction',
    descriptionKey: 'ch201.initial_fund_tx.desc',
    entries: [
      { account: 'CHECKING_ACCOUNT', debit: 50000 },
      { account: 'OWNERS_CAPITAL', credit: 50000 },
    ],
    showAnimation: true,
    next: 'initial_fund_done',
  },
  {
    id: 'initial_fund_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.initial_fund_done',
    expression: 'happy',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_3',
    expression: 'thinking',
    next: 'dialog_4',
  },
  {
    id: 'dialog_4',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_4',
    expression: 'normal',
    next: 'dialog_cost_elements',
  },

  // === Explain Three Cost Elements ===
  {
    id: 'dialog_cost_elements',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_cost_elements',
    expression: 'thinking',
    next: 'dialog_materials',
  },
  {
    id: 'dialog_materials',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_materials',
    expression: 'normal',
    next: 'dialog_labor',
  },
  {
    id: 'dialog_labor',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_labor',
    expression: 'normal',
    next: 'dialog_overhead',
  },
  {
    id: 'dialog_overhead',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_overhead',
    expression: 'normal',
    next: 'purchase_materials_intro',
  },

  // === Purchase Raw Materials ===
  {
    id: 'purchase_materials_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.purchase_materials_intro',
    expression: 'happy',
    next: 'purchase_materials_tx',
  },
  {
    id: 'purchase_materials_tx',
    type: 'transaction',
    descriptionKey: 'ch201.purchase_materials_tx.desc',
    entries: [
      { account: 'RAW_MATERIALS', debit: 3000 },
      { account: 'CHECKING_ACCOUNT', credit: 3000 },
    ],
    showAnimation: true,
    next: 'dialog_after_purchase',
  },
  {
    id: 'dialog_after_purchase',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_after_purchase',
    expression: 'happy',
    next: 'show_bs_after_purchase',
  },
  {
    id: 'show_bs_after_purchase',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch201.show_bs_after_purchase.msg',
    next: 'issue_materials_intro',
  },

  // === Issue Materials to Production ===
  {
    id: 'issue_materials_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.issue_materials_intro',
    expression: 'thinking',
    next: 'issue_materials_tx',
  },
  {
    id: 'issue_materials_tx',
    type: 'transaction',
    descriptionKey: 'ch201.issue_materials_tx.desc',
    entries: [
      { account: 'WORK_IN_PROCESS', debit: 2000 },
      { account: 'RAW_MATERIALS', credit: 2000 },
    ],
    showAnimation: true,
    next: 'dialog_after_issue',
  },
  {
    id: 'dialog_after_issue',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_after_issue',
    expression: 'normal',
    next: 'labor_intro',
  },

  // === Record Direct Labor ===
  {
    id: 'labor_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.labor_intro',
    expression: 'thinking',
    next: 'labor_tx',
  },
  {
    id: 'labor_tx',
    type: 'transaction',
    descriptionKey: 'ch201.labor_tx.desc',
    entries: [
      { account: 'WORK_IN_PROCESS', debit: 1500 },
      { account: 'CHECKING_ACCOUNT', credit: 1500 },
    ],
    showAnimation: true,
    next: 'dialog_after_labor',
  },
  {
    id: 'dialog_after_labor',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_after_labor',
    expression: 'normal',
    next: 'overhead_intro',
  },

  // === Record Manufacturing Overhead ===
  {
    id: 'overhead_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.overhead_intro',
    expression: 'thinking',
    next: 'overhead_tx',
  },
  {
    id: 'overhead_tx',
    type: 'transaction',
    descriptionKey: 'ch201.overhead_tx.desc',
    entries: [
      { account: 'MANUFACTURING_OVERHEAD', debit: 800 },
      { account: 'CHECKING_ACCOUNT', credit: 800 },
    ],
    showAnimation: true,
    next: 'dialog_after_overhead',
  },
  {
    id: 'dialog_after_overhead',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_after_overhead',
    expression: 'normal',
    next: 'complete_production_intro',
  },

  // === Complete Production ===
  {
    id: 'complete_production_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.complete_production_intro',
    expression: 'happy',
    next: 'complete_production_tx',
  },
  {
    id: 'complete_production_tx',
    type: 'transaction',
    descriptionKey: 'ch201.complete_production_tx.desc',
    entries: [
      { account: 'FINISHED_GOODS', debit: 4300 },
      { account: 'WORK_IN_PROCESS', credit: 3500 },
      { account: 'MANUFACTURING_OVERHEAD', credit: 800 },
    ],
    showAnimation: true,
    next: 'dialog_after_complete',
  },
  {
    id: 'dialog_after_complete',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_after_complete',
    expression: 'happy',
    next: 'show_bs_after_production',
  },
  {
    id: 'show_bs_after_production',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch201.show_bs_after_production.msg',
    next: 'quiz_intro',
  },

  // === Quiz: Three Cost Elements ===
  {
    id: 'quiz_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.quiz_intro',
    expression: 'happy',
    next: 'quiz_cost_elements',
  },
  {
    id: 'quiz_cost_elements',
    type: 'quiz',
    questionKey: 'ch201.quiz_cost_elements.question',
    options: [
      { labelKey: 'ch201.quiz_cost_elements.0' },
      { labelKey: 'ch201.quiz_cost_elements.1' },
      { labelKey: 'ch201.quiz_cost_elements.2' },
    ],
    correctIndex: 1,
    correctFeedbackKey: 'ch201.quiz_cost_elements.correct',
    incorrectFeedbackKey: 'ch201.quiz_cost_elements.incorrect',
    expReward: 30,
    next: 'dialog_summary_1',
  },

  // === Summary ===
  {
    id: 'dialog_summary_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_summary_1',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_final',
  },
  {
    id: 'dialog_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch201.dialog_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 202,
    summaryKey: 'ch201.chapter_end.summary',
  },
];

export const chapter201: ChapterScript = {
  id: 201,
  titleKey: 'ch201.title',
  subtitleKey: 'ch201.subtitle',
  nodes,
};
