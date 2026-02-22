import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Securities & Investment ===
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
    textKey: 'ch205.dialog_1',
    expression: 'happy',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.dialog_3',
    expression: 'thinking',
    next: 'dialog_types_intro',
  },

  // === Types of Securities ===
  {
    id: 'dialog_types_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.dialog_types_intro',
    expression: 'thinking',
    next: 'dialog_trading_securities',
  },
  {
    id: 'dialog_trading_securities',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.dialog_trading_securities',
    expression: 'normal',
    next: 'dialog_htm_securities',
  },
  {
    id: 'dialog_htm_securities',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.dialog_htm_securities',
    expression: 'normal',
    next: 'go_to_bank',
  },

  // === Go to Bank for Investment ===
  {
    id: 'go_to_bank',
    type: 'background',
    background: 'bank',
    next: 'banker_enter',
  },
  {
    id: 'banker_enter',
    type: 'character_enter',
    character: 'banker',
    position: 'left',
    expression: 'normal',
    next: 'dialog_banker_1',
  },
  {
    id: 'dialog_banker_1',
    type: 'dialog',
    speaker: 'banker',
    textKey: 'ch205.dialog_banker_1',
    expression: 'normal',
    next: 'dialog_banker_2',
  },

  // === Purchase Trading Securities ===
  {
    id: 'dialog_banker_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.dialog_banker_2',
    expression: 'normal',
    next: 'purchase_trading_tx',
  },
  {
    id: 'purchase_trading_tx',
    type: 'transaction',
    descriptionKey: 'ch205.purchase_trading_tx.desc',
    entries: [
      { account: 'TRADING_SECURITIES', debit: 5000 },
      { account: 'CHECKING_ACCOUNT', credit: 5000 },
    ],
    showAnimation: true,
    next: 'dialog_after_purchase_trading',
  },
  {
    id: 'dialog_after_purchase_trading',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.dialog_after_purchase_trading',
    expression: 'happy',
    next: 'show_bs_after_purchase',
  },
  {
    id: 'show_bs_after_purchase',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch205.show_bs_after_purchase.msg',
    next: 'sale_intro',
  },

  // === Sell Trading Securities at a Gain ===
  {
    id: 'sale_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.sale_intro',
    expression: 'happy',
    next: 'sale_securities_tx',
  },
  {
    id: 'sale_securities_tx',
    type: 'transaction',
    descriptionKey: 'ch205.sale_securities_tx.desc',
    entries: [
      { account: 'CHECKING_ACCOUNT', debit: 5500 },
      { account: 'TRADING_SECURITIES', credit: 5000 },
      { account: 'GAIN_ON_SALE_OF_SECURITIES', credit: 500 },
    ],
    showAnimation: true,
    next: 'dialog_after_sale',
  },
  {
    id: 'dialog_after_sale',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.dialog_after_sale',
    expression: 'happy',
    next: 'journal_entry_sale',
  },

  // === Journal Entry Input: Sale of Securities ===
  {
    id: 'journal_entry_sale',
    type: 'journal_entry_input',
    promptKey: 'ch205.journal_entry_sale.prompt',
    expectedEntries: [
      { account: 'CHECKING_ACCOUNT', debit: 5500 },
      { account: 'TRADING_SECURITIES', credit: 5000 },
      { account: 'GAIN_ON_SALE_OF_SECURITIES', credit: 500 },
    ],
    correctFeedbackKey: 'ch205.journal_entry_sale.correct',
    incorrectFeedbackKey: 'ch205.journal_entry_sale.incorrect',
    hintKey: 'ch205.journal_entry_sale.hint',
    expReward: 30,
    next: 'revalue_intro',
  },

  // === Revalue at Period End ===
  {
    id: 'revalue_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.revalue_intro',
    expression: 'thinking',
    next: 'dialog_revalue_explain',
  },
  {
    id: 'dialog_revalue_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.dialog_revalue_explain',
    expression: 'normal',
    next: 'purchase_trading_2_tx',
  },
  {
    id: 'purchase_trading_2_tx',
    type: 'transaction',
    descriptionKey: 'ch205.purchase_trading_2_tx.desc',
    entries: [
      { account: 'TRADING_SECURITIES', debit: 3000 },
      { account: 'CHECKING_ACCOUNT', credit: 3000 },
    ],
    showAnimation: true,
    next: 'revalue_tx',
  },
  {
    id: 'revalue_tx',
    type: 'transaction',
    descriptionKey: 'ch205.revalue_tx.desc',
    entries: [
      { account: 'TRADING_SECURITIES', debit: 200 },
      { account: 'VALUATION_GAIN_ON_SECURITIES', credit: 200 },
    ],
    showAnimation: true,
    next: 'dialog_after_revalue',
  },
  {
    id: 'dialog_after_revalue',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.dialog_after_revalue',
    expression: 'happy',
    next: 'htm_intro',
  },

  // === Held-to-Maturity Securities ===
  {
    id: 'htm_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.htm_intro',
    expression: 'thinking',
    next: 'purchase_htm_tx',
  },
  {
    id: 'purchase_htm_tx',
    type: 'transaction',
    descriptionKey: 'ch205.purchase_htm_tx.desc',
    entries: [
      { account: 'HELD_TO_MATURITY_SECURITIES', debit: 10000 },
      { account: 'CHECKING_ACCOUNT', credit: 10000 },
    ],
    showAnimation: true,
    next: 'dialog_after_htm',
  },
  {
    id: 'dialog_after_htm',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.dialog_after_htm',
    expression: 'normal',
    next: 'banker_exit',
  },
  {
    id: 'banker_exit',
    type: 'character_exit',
    character: 'banker',
    next: 'show_final_bs',
  },
  {
    id: 'show_final_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch205.show_final_bs.msg',
    next: 'dialog_summary',
  },

  // === Summary ===
  {
    id: 'dialog_summary',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.dialog_summary',
    expression: 'normal',
    next: 'dialog_final',
  },
  {
    id: 'dialog_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch205.dialog_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 206,
    summaryKey: 'ch205.chapter_end.summary',
  },
];

export const chapter205: ChapterScript = {
  id: 205,
  titleKey: 'ch205.title',
  subtitleKey: 'ch205.subtitle',
  nodes,
};
