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
    textKey: 'ch112.dialog_intro_1',
    expression: 'normal',
    next: 'dialog_intro_2',
  },
  {
    id: 'dialog_intro_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_intro_2',
    expression: 'thinking',
    next: 'dialog_trial_balance',
  },

  // === Trial Balance ===
  {
    id: 'dialog_trial_balance',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_trial_balance',
    expression: 'normal',
    next: 'dialog_trial_balance_detail',
  },
  {
    id: 'dialog_trial_balance_detail',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_trial_balance_detail',
    expression: 'thinking',
    next: 'dialog_account_list',
  },
  {
    id: 'dialog_account_list',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_account_list',
    expression: 'normal',
    next: 'show_bs',
  },

  // === Financial Statements ===
  {
    id: 'show_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch112.show_bs.msg',
    next: 'dialog_bs_review',
  },
  {
    id: 'dialog_bs_review',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_bs_review',
    expression: 'normal',
    next: 'show_pl',
  },
  {
    id: 'show_pl',
    type: 'report',
    reportType: 'income_statement',
    messageKey: 'ch112.show_pl.msg',
    next: 'dialog_pl_review',
  },
  {
    id: 'dialog_pl_review',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_pl_review',
    expression: 'normal',
    next: 'dialog_profit_dist_intro',
  },

  // === Profit Distribution ===
  {
    id: 'dialog_profit_dist_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_profit_dist_intro',
    expression: 'normal',
    next: 'dialog_profit_dist_explain',
  },
  {
    id: 'dialog_profit_dist_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_profit_dist_explain',
    expression: 'thinking',
    next: 'dialog_legal_reserve',
  },

  // === Legal Reserve ===
  {
    id: 'dialog_legal_reserve',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_legal_reserve',
    expression: 'normal',
    next: 'dialog_legal_reserve_detail',
  },
  {
    id: 'dialog_legal_reserve_detail',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_legal_reserve_detail',
    expression: 'thinking',
    next: 'dialog_monthly_closing',
  },

  // === Monthly Closing Cycle ===
  {
    id: 'dialog_monthly_closing',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_monthly_closing',
    expression: 'normal',
    next: 'dialog_monthly_closing_detail',
  },
  {
    id: 'dialog_monthly_closing_detail',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_monthly_closing_detail',
    expression: 'thinking',
    next: 'dialog_compare_prev',
  },
  {
    id: 'dialog_compare_prev',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_compare_prev',
    expression: 'normal',
    next: 'dialog_compare_explain',
  },
  {
    id: 'dialog_compare_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_compare_explain',
    expression: 'thinking',
    next: 'quiz_tax',
  },

  // === Final Quizzes ===
  {
    id: 'quiz_tax',
    type: 'quiz',
    questionKey: 'ch112.quiz_tax.question',
    options: [
      { labelKey: 'ch112.quiz_tax.option_0' },
      { labelKey: 'ch112.quiz_tax.option_1' },
      { labelKey: 'ch112.quiz_tax.option_2' },
    ],
    correctIndex: 2,
    correctFeedbackKey: 'ch112.quiz_tax.correct',
    incorrectFeedbackKey: 'ch112.quiz_tax.incorrect',
    expReward: 20,
    next: 'quiz_payroll',
  },
  {
    id: 'quiz_payroll',
    type: 'quiz',
    questionKey: 'ch112.quiz_payroll.question',
    options: [
      { labelKey: 'ch112.quiz_payroll.option_0' },
      { labelKey: 'ch112.quiz_payroll.option_1' },
      { labelKey: 'ch112.quiz_payroll.option_2' },
    ],
    correctIndex: 1,
    correctFeedbackKey: 'ch112.quiz_payroll.correct',
    incorrectFeedbackKey: 'ch112.quiz_payroll.incorrect',
    expReward: 20,
    next: 'quiz_accruals',
  },
  {
    id: 'quiz_accruals',
    type: 'quiz',
    questionKey: 'ch112.quiz_accruals.question',
    options: [
      { labelKey: 'ch112.quiz_accruals.option_0' },
      { labelKey: 'ch112.quiz_accruals.option_1' },
      { labelKey: 'ch112.quiz_accruals.option_2' },
    ],
    correctIndex: 0,
    correctFeedbackKey: 'ch112.quiz_accruals.correct',
    incorrectFeedbackKey: 'ch112.quiz_accruals.incorrect',
    expReward: 20,
    next: 'dialog_grand_summary_1',
  },

  // === Grand Summary of Lv2 ===
  {
    id: 'dialog_grand_summary_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_grand_summary_1',
    expression: 'happy',
    next: 'dialog_grand_summary_2',
  },
  {
    id: 'dialog_grand_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_grand_summary_2',
    expression: 'normal',
    next: 'dialog_grand_summary_3',
  },
  {
    id: 'dialog_grand_summary_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_grand_summary_3',
    expression: 'normal',
    next: 'dialog_grand_summary_4',
  },
  {
    id: 'dialog_grand_summary_4',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_grand_summary_4',
    expression: 'normal',
    next: 'dialog_lv3_preview',
  },
  {
    id: 'dialog_lv3_preview',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch112.dialog_lv3_preview',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 201,
    summaryKey: 'ch112.chapter_end.summary',
  },
];

export const chapter112: ChapterScript = {
  id: 112,
  titleKey: 'ch112.title',
  subtitleKey: 'ch112.subtitle',
  nodes,
};
