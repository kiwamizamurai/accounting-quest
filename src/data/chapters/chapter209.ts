import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Cash Flow Statement ===
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
    textKey: 'ch209.dialog_1',
    expression: 'thinking',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_3',
    expression: 'normal',
    next: 'dialog_cf_intro',
  },

  // === Cash Flow Statement Overview ===
  {
    id: 'dialog_cf_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_cf_intro',
    expression: 'thinking',
    next: 'dialog_three_sections',
  },
  {
    id: 'dialog_three_sections',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_three_sections',
    expression: 'normal',
    next: 'dialog_operating_cf',
  },

  // === Operating Cash Flow (Indirect Method) ===
  {
    id: 'dialog_operating_cf',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_operating_cf',
    expression: 'thinking',
    next: 'dialog_indirect_method',
  },
  {
    id: 'dialog_indirect_method',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_indirect_method',
    expression: 'normal',
    next: 'dialog_add_back_depreciation',
  },
  {
    id: 'dialog_add_back_depreciation',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_add_back_depreciation',
    expression: 'thinking',
    next: 'dialog_working_capital',
  },
  {
    id: 'dialog_working_capital',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_working_capital',
    expression: 'normal',
    next: 'operating_example_narration',
  },
  {
    id: 'operating_example_narration',
    type: 'narration',
    textKey: 'ch209.operating_example_narration',
    next: 'operating_sales_tx',
  },

  // === Operating CF Example Transactions ===
  {
    id: 'operating_sales_tx',
    type: 'transaction',
    descriptionKey: 'ch209.operating_sales_tx.desc',
    entries: [
      { account: 'CHECKING_ACCOUNT', debit: 10000 },
      { account: 'SALES_REVENUE', credit: 10000 },
    ],
    showAnimation: true,
    next: 'operating_expense_tx',
  },
  {
    id: 'operating_expense_tx',
    type: 'transaction',
    descriptionKey: 'ch209.operating_expense_tx.desc',
    entries: [
      { account: 'COST_OF_GOODS_SOLD', debit: 6000 },
      { account: 'CHECKING_ACCOUNT', credit: 6000 },
    ],
    showAnimation: false,
    next: 'depreciation_tx',
  },
  {
    id: 'depreciation_tx',
    type: 'transaction',
    descriptionKey: 'ch209.depreciation_tx.desc',
    entries: [
      { account: 'DEPRECIATION_EXPENSE', debit: 1000 },
      { account: 'ACCUMULATED_DEPRECIATION', credit: 1000 },
    ],
    showAnimation: true,
    next: 'dialog_operating_summary',
  },
  {
    id: 'dialog_operating_summary',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_operating_summary',
    expression: 'happy',
    next: 'investing_cf_intro',
  },

  // === Investing Cash Flow ===
  {
    id: 'investing_cf_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.investing_cf_intro',
    expression: 'thinking',
    next: 'dialog_investing_explain',
  },
  {
    id: 'dialog_investing_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_investing_explain',
    expression: 'normal',
    next: 'equipment_purchase_tx',
  },
  {
    id: 'equipment_purchase_tx',
    type: 'transaction',
    descriptionKey: 'ch209.equipment_purchase_tx.desc',
    entries: [
      { account: 'EQUIPMENT', debit: 5000 },
      { account: 'CHECKING_ACCOUNT', credit: 5000 },
    ],
    showAnimation: true,
    next: 'dialog_after_investing',
  },
  {
    id: 'dialog_after_investing',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_after_investing',
    expression: 'normal',
    next: 'financing_cf_intro',
  },

  // === Financing Cash Flow ===
  {
    id: 'financing_cf_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.financing_cf_intro',
    expression: 'thinking',
    next: 'dialog_financing_explain',
  },
  {
    id: 'dialog_financing_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_financing_explain',
    expression: 'normal',
    next: 'loan_repayment_tx',
  },
  {
    id: 'loan_repayment_tx',
    type: 'transaction',
    descriptionKey: 'ch209.loan_repayment_tx.desc',
    entries: [
      { account: 'LOANS_PAYABLE', debit: 3000 },
      { account: 'CHECKING_ACCOUNT', credit: 3000 },
    ],
    showAnimation: true,
    next: 'dividend_payment_tx',
  },
  {
    id: 'dividend_payment_tx',
    type: 'transaction',
    descriptionKey: 'ch209.dividend_payment_tx.desc',
    entries: [
      { account: 'DIVIDENDS_PAYABLE', debit: 1000 },
      { account: 'CHECKING_ACCOUNT', credit: 1000 },
    ],
    showAnimation: true,
    next: 'dialog_after_financing',
  },
  {
    id: 'dialog_after_financing',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_after_financing',
    expression: 'normal',
    next: 'show_cf_report',
  },

  // === Show Cash Flow Report ===
  {
    id: 'show_cf_report',
    type: 'report',
    reportType: 'cash_flow',
    messageKey: 'ch209.show_cf_report.msg',
    next: 'dialog_cf_analysis',
  },
  {
    id: 'dialog_cf_analysis',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_cf_analysis',
    expression: 'thinking',
    next: 'quiz_intro',
  },

  // === Quiz: CF Categories ===
  {
    id: 'quiz_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.quiz_intro',
    expression: 'happy',
    next: 'quiz_cf_category',
  },
  {
    id: 'quiz_cf_category',
    type: 'quiz',
    questionKey: 'ch209.quiz_cf_category.question',
    options: [
      { labelKey: 'ch209.quiz_cf_category.0' },
      { labelKey: 'ch209.quiz_cf_category.1' },
      { labelKey: 'ch209.quiz_cf_category.2' },
    ],
    correctIndex: 1,
    correctFeedbackKey: 'ch209.quiz_cf_category.correct',
    incorrectFeedbackKey: 'ch209.quiz_cf_category.incorrect',
    expReward: 30,
    next: 'dialog_summary',
  },

  // === Summary ===
  {
    id: 'dialog_summary',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_summary',
    expression: 'normal',
    next: 'dialog_final',
  },
  {
    id: 'dialog_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch209.dialog_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 210,
    summaryKey: 'ch209.chapter_end.summary',
  },
];

export const chapter209: ChapterScript = {
  id: 209,
  titleKey: 'ch209.title',
  subtitleKey: 'ch209.subtitle',
  nodes,
};
