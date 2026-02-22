import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Warehouse scene ===
  {
    id: 'start',
    type: 'background',
    background: 'warehouse',
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
    textKey: 'ch103.dialog_1',
    expression: 'happy',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch103.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },

  // === Electronic Purchase ===
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch103.dialog_3',
    expression: 'thinking',
    next: 'supplier_enter',
  },
  {
    id: 'supplier_enter',
    type: 'character_enter',
    character: 'supplier',
    position: 'left',
    expression: 'normal',
    next: 'dialog_electronic',
  },
  {
    id: 'dialog_electronic',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch103.dialog_electronic',
    expression: 'normal',
    next: 'electronic_purchase',
  },
  {
    id: 'electronic_purchase',
    type: 'transaction',
    descriptionKey: 'ch103.electronic_purchase.desc',
    entries: [
      { account: 'INVENTORY', debit: 2000 },
      { account: 'ELECTRONICALLY_RECORDED_PAYABLE', credit: 2000 },
    ],
    showAnimation: true,
    next: 'dialog_electronic_done',
  },
  {
    id: 'dialog_electronic_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch103.dialog_electronic_done',
    expression: 'happy',
    next: 'dialog_shipping',
  },

  // === Shipping Costs ===
  {
    id: 'dialog_shipping',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch103.dialog_shipping',
    expression: 'thinking',
    next: 'shipping',
  },
  {
    id: 'shipping',
    type: 'transaction',
    descriptionKey: 'ch103.shipping.desc',
    entries: [
      { account: 'SHIPPING_EXPENSE', debit: 150 },
      { account: 'CHECKING_ACCOUNT', credit: 150 },
    ],
    showAnimation: true,
    next: 'dialog_shipping_done',
  },
  {
    id: 'dialog_shipping_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch103.dialog_shipping_done',
    expression: 'normal',
    next: 'dialog_operating',
  },

  // === Operating Expenses ===
  {
    id: 'dialog_operating',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch103.dialog_operating',
    expression: 'thinking',
    next: 'utilities',
  },
  {
    id: 'utilities',
    type: 'transaction',
    descriptionKey: 'ch103.utilities.desc',
    entries: [
      { account: 'UTILITIES_EXPENSE', debit: 200 },
      { account: 'CHECKING_ACCOUNT', credit: 200 },
    ],
    showAnimation: true,
    next: 'communication',
  },
  {
    id: 'communication',
    type: 'transaction',
    descriptionKey: 'ch103.communication.desc',
    entries: [
      { account: 'COMMUNICATION_EXPENSE', debit: 100 },
      { account: 'CHECKING_ACCOUNT', credit: 100 },
    ],
    showAnimation: true,
    next: 'consumables',
  },
  {
    id: 'consumables',
    type: 'transaction',
    descriptionKey: 'ch103.consumables.desc',
    entries: [
      { account: 'CONSUMABLES_EXPENSE', debit: 80 },
      { account: 'CHECKING_ACCOUNT', credit: 80 },
    ],
    showAnimation: true,
    next: 'dialog_expenses_done',
  },
  {
    id: 'dialog_expenses_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch103.dialog_expenses_done',
    expression: 'normal',
    next: 'supplier_exit',
  },
  {
    id: 'supplier_exit',
    type: 'character_exit',
    character: 'supplier',
    next: 'narration_sales',
  },

  // === Daily Sales ===
  {
    id: 'narration_sales',
    type: 'narration',
    textKey: 'ch103.narration_sales',
    next: 'sales',
  },
  {
    id: 'sales',
    type: 'transaction',
    descriptionKey: 'ch103.sales.desc',
    entries: [
      { account: 'CHECKING_ACCOUNT', debit: 3500 },
      { account: 'SALES_REVENUE', credit: 3500 },
    ],
    showAnimation: true,
    next: 'cogs',
  },
  {
    id: 'cogs',
    type: 'transaction',
    descriptionKey: 'ch103.cogs.desc',
    entries: [
      { account: 'COST_OF_GOODS_SOLD', debit: 1500 },
      { account: 'INVENTORY', credit: 1500 },
    ],
    showAnimation: true,
    next: 'dialog_sales_done',
  },
  {
    id: 'dialog_sales_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch103.dialog_sales_done',
    expression: 'happy',
    next: 'show_pl',
  },

  // === Reports ===
  {
    id: 'show_pl',
    type: 'report',
    reportType: 'income_statement',
    messageKey: 'ch103.show_pl.msg',
    next: 'show_bs',
  },
  {
    id: 'show_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch103.show_bs.msg',
    next: 'quiz_1',
  },

  // === Quiz ===
  {
    id: 'quiz_1',
    type: 'quiz',
    questionKey: 'ch103.quiz_1.question',
    options: [
      { labelKey: 'ch103.quiz_1.option_0' },
      { labelKey: 'ch103.quiz_1.option_1' },
      { labelKey: 'ch103.quiz_1.option_2' },
    ],
    correctIndex: 2,
    correctFeedbackKey: 'ch103.quiz_1.correct',
    incorrectFeedbackKey: 'ch103.quiz_1.incorrect',
    expReward: 10,
    next: 'dialog_summary',
  },

  // === Summary ===
  {
    id: 'dialog_summary',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch103.dialog_summary',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch103.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_end_final',
  },
  {
    id: 'dialog_end_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch103.dialog_end_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 104,
    summaryKey: 'ch103.chapter_end.summary',
  },
];

export const chapter103: ChapterScript = {
  id: 103,
  titleKey: 'ch103.title',
  subtitleKey: 'ch103.subtitle',
  nodes,
};
