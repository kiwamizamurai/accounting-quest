import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Store Scene ===
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
    expression: 'normal',
    next: 'dialog_intro_1',
  },
  {
    id: 'dialog_intro_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_intro_1',
    expression: 'normal',
    next: 'dialog_intro_2',
  },
  {
    id: 'dialog_intro_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_intro_2',
    expression: 'thinking',
    next: 'dialog_intro_3',
  },
  {
    id: 'dialog_intro_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_intro_3',
    expression: 'normal',
    next: 'customer_enter',
  },

  // === Credit Card Sale ===
  {
    id: 'customer_enter',
    type: 'character_enter',
    character: 'customer',
    position: 'left',
    expression: 'happy',
    next: 'dialog_customer_1',
  },
  {
    id: 'dialog_customer_1',
    type: 'dialog',
    speaker: 'customer',
    textKey: 'ch107.dialog_customer_1',
    expression: 'happy',
    next: 'dialog_mentor_cc_1',
  },
  {
    id: 'dialog_mentor_cc_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_mentor_cc_1',
    expression: 'normal',
    next: 'credit_card_sale',
  },
  {
    id: 'credit_card_sale',
    type: 'transaction',
    descriptionKey: 'ch107.credit_card_sale.desc',
    entries: [
      { account: 'CREDIT_CARD_RECEIVABLE', debit: 950 },
      { account: 'COMMISSION_EXPENSE', debit: 50 },
      { account: 'SALES_REVENUE', credit: 1000 },
    ],
    showAnimation: true,
    next: 'credit_card_cogs',
  },
  {
    id: 'credit_card_cogs',
    type: 'transaction',
    descriptionKey: 'ch107.credit_card_cogs.desc',
    entries: [
      { account: 'COST_OF_GOODS_SOLD', debit: 500 },
      { account: 'INVENTORY', credit: 500 },
    ],
    showAnimation: true,
    next: 'dialog_cc_explain_1',
  },
  {
    id: 'dialog_cc_explain_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_cc_explain_1',
    expression: 'thinking',
    next: 'dialog_cc_explain_2',
  },
  {
    id: 'dialog_cc_explain_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_cc_explain_2',
    expression: 'normal',
    next: 'customer_exit',
  },
  {
    id: 'customer_exit',
    type: 'character_exit',
    character: 'customer',
    next: 'dialog_gift_cert_intro',
  },

  // === Gift Certificate Sale ===
  {
    id: 'dialog_gift_cert_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_gift_cert_intro',
    expression: 'normal',
    next: 'dialog_gift_cert_explain',
  },
  {
    id: 'dialog_gift_cert_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_gift_cert_explain',
    expression: 'thinking',
    next: 'gift_cert_sale',
  },
  {
    id: 'gift_cert_sale',
    type: 'transaction',
    descriptionKey: 'ch107.gift_cert_sale.desc',
    entries: [
      { account: 'GIFT_CERTIFICATES_RECEIVED', debit: 300 },
      { account: 'SALES_REVENUE', credit: 300 },
    ],
    showAnimation: true,
    next: 'dialog_gift_cert_redeem',
  },
  {
    id: 'dialog_gift_cert_redeem',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_gift_cert_redeem',
    expression: 'normal',
    next: 'dialog_commission_intro',
  },

  // === Commission Income ===
  {
    id: 'dialog_commission_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_commission_intro',
    expression: 'normal',
    next: 'dialog_commission_explain',
  },
  {
    id: 'dialog_commission_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_commission_explain',
    expression: 'thinking',
    next: 'commission_income',
  },
  {
    id: 'commission_income',
    type: 'transaction',
    descriptionKey: 'ch107.commission_income.desc',
    entries: [
      { account: 'CHECKING_ACCOUNT', debit: 200 },
      { account: 'COMMISSION_INCOME', credit: 200 },
    ],
    showAnimation: true,
    next: 'dialog_commission_after',
  },
  {
    id: 'dialog_commission_after',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_commission_after',
    expression: 'happy',
    next: 'show_pl',
  },

  // === Reports and Quiz ===
  {
    id: 'show_pl',
    type: 'report',
    reportType: 'income_statement',
    messageKey: 'ch107.show_pl.msg',
    next: 'dialog_pl_review',
  },
  {
    id: 'dialog_pl_review',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_pl_review',
    expression: 'normal',
    next: 'quiz_cc_receivable',
  },
  {
    id: 'quiz_cc_receivable',
    type: 'quiz',
    questionKey: 'ch107.quiz_cc_receivable.question',
    options: [
      { labelKey: 'ch107.quiz_cc_receivable.option_0' },
      { labelKey: 'ch107.quiz_cc_receivable.option_1' },
      { labelKey: 'ch107.quiz_cc_receivable.option_2' },
    ],
    correctIndex: 1,
    correctFeedbackKey: 'ch107.quiz_cc_receivable.correct',
    incorrectFeedbackKey: 'ch107.quiz_cc_receivable.incorrect',
    expReward: 20,
    next: 'dialog_summary_1',
  },

  // === Summary ===
  {
    id: 'dialog_summary_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_summary_1',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_summary_3',
  },
  {
    id: 'dialog_summary_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch107.dialog_summary_3',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 108,
    summaryKey: 'ch107.chapter_end.summary',
  },
];

export const chapter107: ChapterScript = {
  id: 107,
  titleKey: 'ch107.title',
  subtitleKey: 'ch107.subtitle',
  nodes,
};
