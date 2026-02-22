import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Tax Office scene ===
  {
    id: 'start',
    type: 'background',
    background: 'tax_office',
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
    textKey: 'ch104.dialog_1',
    expression: 'normal',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch104.dialog_2',
    expression: 'thinking',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch104.dialog_3',
    expression: 'normal',
    next: 'taxman_enter',
  },

  // === Taxman Introduction ===
  {
    id: 'taxman_enter',
    type: 'character_enter',
    character: 'taxman',
    position: 'left',
    expression: 'normal',
    next: 'dialog_taxman_1',
  },
  {
    id: 'dialog_taxman_1',
    type: 'dialog',
    speaker: 'taxman',
    textKey: 'ch104.dialog_taxman_1',
    expression: 'normal',
    next: 'dialog_taxman_2',
  },
  {
    id: 'dialog_taxman_2',
    type: 'dialog',
    speaker: 'taxman',
    textKey: 'ch104.dialog_taxman_2',
    expression: 'happy',
    next: 'dialog_purchase_tax',
  },

  // === Purchase with Consumption Tax ===
  {
    id: 'dialog_purchase_tax',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch104.dialog_purchase_tax',
    expression: 'thinking',
    next: 'purchase_with_tax',
  },
  {
    id: 'purchase_with_tax',
    type: 'transaction',
    descriptionKey: 'ch104.purchase_with_tax.desc',
    entries: [
      { account: 'INVENTORY', debit: 1000 },
      { account: 'CONSUMPTION_TAX_RECEIVABLE', debit: 100 },
      { account: 'CHECKING_ACCOUNT', credit: 1100 },
    ],
    showAnimation: true,
    next: 'dialog_purchase_explain',
  },
  {
    id: 'dialog_purchase_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch104.dialog_purchase_explain',
    expression: 'normal',
    next: 'dialog_sale_tax',
  },

  // === Sale with Consumption Tax ===
  {
    id: 'dialog_sale_tax',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch104.dialog_sale_tax',
    expression: 'thinking',
    next: 'sale_with_tax',
  },
  {
    id: 'sale_with_tax',
    type: 'transaction',
    descriptionKey: 'ch104.sale_with_tax.desc',
    entries: [
      { account: 'CHECKING_ACCOUNT', debit: 2200 },
      { account: 'SALES_REVENUE', credit: 2000 },
      { account: 'CONSUMPTION_TAX_PAYABLE', credit: 200 },
    ],
    showAnimation: true,
    next: 'dialog_sale_explain',
  },
  {
    id: 'dialog_sale_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch104.dialog_sale_explain',
    expression: 'normal',
    next: 'dialog_temporary_tax',
  },

  // === Temporary Tax Accounts ===
  {
    id: 'dialog_temporary_tax',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch104.dialog_temporary_tax',
    expression: 'thinking',
    next: 'dialog_temporary_tax_2',
  },
  {
    id: 'dialog_temporary_tax_2',
    type: 'dialog',
    speaker: 'taxman',
    textKey: 'ch104.dialog_temporary_tax_2',
    expression: 'normal',
    next: 'dialog_settlement',
  },

  // === Tax Settlement ===
  {
    id: 'dialog_settlement',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch104.dialog_settlement',
    expression: 'normal',
    next: 'settle',
  },
  {
    id: 'settle',
    type: 'transaction',
    descriptionKey: 'ch104.settle.desc',
    entries: [
      { account: 'CONSUMPTION_TAX_PAYABLE', debit: 200 },
      { account: 'CONSUMPTION_TAX_RECEIVABLE', credit: 100 },
      { account: 'ACCRUED_CONSUMPTION_TAX', credit: 100 },
    ],
    showAnimation: true,
    next: 'dialog_settle_explain',
  },
  {
    id: 'dialog_settle_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch104.dialog_settle_explain',
    expression: 'happy',
    next: 'dialog_stamp_tax',
  },

  // === Taxes and Dues (Stamp Tax) ===
  {
    id: 'dialog_stamp_tax',
    type: 'dialog',
    speaker: 'taxman',
    textKey: 'ch104.dialog_stamp_tax',
    expression: 'normal',
    next: 'pay_stamp',
  },
  {
    id: 'pay_stamp',
    type: 'transaction',
    descriptionKey: 'ch104.pay_stamp.desc',
    entries: [
      { account: 'TAXES_AND_DUES', debit: 50 },
      { account: 'CHECKING_ACCOUNT', credit: 50 },
    ],
    showAnimation: true,
    next: 'dialog_stamp_done',
  },
  {
    id: 'dialog_stamp_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch104.dialog_stamp_done',
    expression: 'normal',
    next: 'taxman_exit',
  },
  {
    id: 'taxman_exit',
    type: 'character_exit',
    character: 'taxman',
    next: 'show_bs',
  },

  // === Balance Sheet ===
  {
    id: 'show_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch104.show_bs.msg',
    next: 'quiz_1',
  },

  // === Quiz ===
  {
    id: 'quiz_1',
    type: 'quiz',
    questionKey: 'ch104.quiz_1.question',
    options: [
      { labelKey: 'ch104.quiz_1.option_0' },
      { labelKey: 'ch104.quiz_1.option_1' },
      { labelKey: 'ch104.quiz_1.option_2' },
      { labelKey: 'ch104.quiz_1.option_3' },
    ],
    correctIndex: 0,
    correctFeedbackKey: 'ch104.quiz_1.correct',
    incorrectFeedbackKey: 'ch104.quiz_1.incorrect',
    expReward: 10,
    next: 'dialog_summary',
  },

  // === Summary ===
  {
    id: 'dialog_summary',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch104.dialog_summary',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch104.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_end_final',
  },
  {
    id: 'dialog_end_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch104.dialog_end_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 105,
    summaryKey: 'ch104.chapter_end.summary',
  },
];

export const chapter104: ChapterScript = {
  id: 104,
  titleKey: 'ch104.title',
  subtitleKey: 'ch104.subtitle',
  nodes,
};
