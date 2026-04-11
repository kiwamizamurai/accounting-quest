import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening: Shareholder Reporting ===
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
    textKey: 'ch208.dialog_1',
    expression: 'happy',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.dialog_3',
    expression: 'thinking',
    next: 'dialog_equity_intro',
  },

  // === Statement of Changes in Equity ===
  {
    id: 'dialog_equity_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.dialog_equity_intro',
    expression: 'thinking',
    next: 'dialog_equity_components',
  },
  {
    id: 'dialog_equity_components',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.dialog_equity_components',
    expression: 'normal',
    next: 'dialog_retained_earnings',
  },
  {
    id: 'dialog_retained_earnings',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.dialog_retained_earnings',
    expression: 'normal',
    next: 'dividend_intro',
  },

  // === Declare Dividends ===
  {
    id: 'dividend_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.dividend_intro',
    expression: 'thinking',
    next: 'dialog_dividend_explain',
  },
  {
    id: 'dialog_dividend_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.dialog_dividend_explain',
    expression: 'normal',
    next: 'choice_dividend',
  },

  // === Dividend Amount Choice ===
  {
    id: 'choice_dividend',
    type: 'choice',
    promptKey: 'ch208.choice_dividend.prompt',
    choices: [
      {
        labelKey: 'ch208.choice_dividend.0',
        next: 'declare_2000',
        effects: { setFlags: { dividendAmount: 2000 } },
      },
      {
        labelKey: 'ch208.choice_dividend.1',
        next: 'declare_3000',
        effects: { setFlags: { dividendAmount: 3000 } },
      },
    ],
  },
  {
    id: 'declare_2000',
    type: 'transaction',
    descriptionKey: 'ch208.declare_2000.desc',
    entries: [
      { account: 'RETAINED_EARNINGS', debit: 2000 },
      { account: 'DIVIDENDS_PAYABLE', credit: 2000 },
    ],
    showAnimation: true,
    next: 'after_declare',
  },
  {
    id: 'declare_3000',
    type: 'transaction',
    descriptionKey: 'ch208.declare_3000.desc',
    entries: [
      { account: 'RETAINED_EARNINGS', debit: 3000 },
      { account: 'DIVIDENDS_PAYABLE', credit: 3000 },
    ],
    showAnimation: true,
    next: 'after_declare',
  },
  {
    id: 'after_declare',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.after_declare',
    expression: 'happy',
    next: 'check_dividend_amount',
  },

  // === Conditional: Route based on dividend amount ===
  {
    id: 'check_dividend_amount',
    type: 'conditional',
    condition: { type: 'flag', flag: 'dividendAmount', value: 2000 },
    trueNext: 'journal_entry_dividend_2000',
    falseNext: 'journal_entry_dividend_3000',
  },

  // === Journal Entry Input: Dividend Declaration (2000) ===
  {
    id: 'journal_entry_dividend_2000',
    type: 'journal_entry_input',
    promptKey: 'ch208.journal_entry_dividend_2000.prompt',
    expectedEntries: [
      { account: 'RETAINED_EARNINGS', debit: 2000 },
      { account: 'DIVIDENDS_PAYABLE', credit: 2000 },
    ],
    correctFeedbackKey: 'ch208.journal_entry_dividend_2000.correct',
    incorrectFeedbackKey: 'ch208.journal_entry_dividend_2000.incorrect',
    hintKey: 'ch208.journal_entry_dividend_2000.hint',
    expReward: 30,
    next: 'show_bs_after_declare',
  },

  // === Journal Entry Input: Dividend Declaration (3000) ===
  {
    id: 'journal_entry_dividend_3000',
    type: 'journal_entry_input',
    promptKey: 'ch208.journal_entry_dividend_3000.prompt',
    expectedEntries: [
      { account: 'RETAINED_EARNINGS', debit: 3000 },
      { account: 'DIVIDENDS_PAYABLE', credit: 3000 },
    ],
    correctFeedbackKey: 'ch208.journal_entry_dividend_3000.correct',
    incorrectFeedbackKey: 'ch208.journal_entry_dividend_3000.incorrect',
    hintKey: 'ch208.journal_entry_dividend_3000.hint',
    expReward: 30,
    next: 'show_bs_after_declare',
  },
  {
    id: 'show_bs_after_declare',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch208.show_bs_after_declare.msg',
    next: 'pay_dividend_intro',
  },

  // === Pay Dividends ===
  {
    id: 'pay_dividend_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.pay_dividend_intro',
    expression: 'normal',
    next: 'check_dividend_for_pay',
  },

  // === Conditional: Route payment based on dividend amount ===
  {
    id: 'check_dividend_for_pay',
    type: 'conditional',
    condition: { type: 'flag', flag: 'dividendAmount', value: 2000 },
    trueNext: 'pay_dividend_tx_2000',
    falseNext: 'pay_dividend_tx_3000',
  },
  {
    id: 'pay_dividend_tx_2000',
    type: 'transaction',
    descriptionKey: 'ch208.pay_dividend_tx_2000.desc',
    entries: [
      { account: 'DIVIDENDS_PAYABLE', debit: 2000 },
      { account: 'CHECKING_ACCOUNT', credit: 2000 },
    ],
    showAnimation: true,
    next: 'dialog_after_pay',
  },
  {
    id: 'pay_dividend_tx_3000',
    type: 'transaction',
    descriptionKey: 'ch208.pay_dividend_tx_3000.desc',
    entries: [
      { account: 'DIVIDENDS_PAYABLE', debit: 3000 },
      { account: 'CHECKING_ACCOUNT', credit: 3000 },
    ],
    showAnimation: true,
    next: 'dialog_after_pay',
  },
  {
    id: 'dialog_after_pay',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.dialog_after_pay',
    expression: 'happy',
    next: 'legal_reserve_intro',
  },

  // === Legal Reserve ===
  {
    id: 'legal_reserve_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.legal_reserve_intro',
    expression: 'thinking',
    next: 'dialog_legal_reserve_explain',
  },
  {
    id: 'dialog_legal_reserve_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.dialog_legal_reserve_explain',
    expression: 'normal',
    next: 'legal_reserve_tx',
  },
  {
    id: 'legal_reserve_tx',
    type: 'transaction',
    descriptionKey: 'ch208.legal_reserve_tx.desc',
    entries: [
      { account: 'RETAINED_EARNINGS', debit: 200 },
      { account: 'LEGAL_RESERVE', credit: 200 },
    ],
    showAnimation: true,
    next: 'dialog_after_reserve',
  },
  {
    id: 'dialog_after_reserve',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.dialog_after_reserve',
    expression: 'normal',
    next: 'show_final_bs',
  },
  {
    id: 'show_final_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch208.show_final_bs.msg',
    next: 'dialog_summary_1',
  },

  // === Summary ===
  {
    id: 'dialog_summary_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.dialog_summary_1',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_final',
  },
  {
    id: 'dialog_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch208.dialog_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 209,
    summaryKey: 'ch208.chapter_end.summary',
  },
];

export const chapter208: ChapterScript = {
  id: 208,
  titleKey: 'ch208.title',
  subtitleKey: 'ch208.subtitle',
  nodes,
};
