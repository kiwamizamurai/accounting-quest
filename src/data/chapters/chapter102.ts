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
    textKey: 'ch102.dialog_1',
    expression: 'happy',
    next: 'bank_loan_narration',
  },

  // === Bank Loan for Opening Funds ===
  {
    id: 'bank_loan_narration',
    type: 'narration',
    textKey: 'ch102.bank_loan_narration',
    next: 'bank_loan_tx',
  },
  {
    id: 'bank_loan_tx',
    type: 'transaction',
    descriptionKey: 'ch102.bank_loan_tx.desc',
    entries: [
      { account: 'CHECKING_ACCOUNT', debit: 8000 },
      { account: 'LOANS_PAYABLE', credit: 8000 },
    ],
    showAnimation: true,
    next: 'bank_loan_done',
  },
  {
    id: 'bank_loan_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.bank_loan_done',
    expression: 'normal',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.dialog_3',
    expression: 'thinking',
    next: 'dialog_building',
  },

  // === Building Purchase ===
  {
    id: 'dialog_building',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.dialog_building',
    expression: 'normal',
    next: 'purchase_building',
  },
  {
    id: 'purchase_building',
    type: 'transaction',
    descriptionKey: 'ch102.purchase_building.desc',
    entries: [
      { account: 'BUILDINGS', debit: 3000 },
      { account: 'CHECKING_ACCOUNT', credit: 3000 },
    ],
    showAnimation: true,
    next: 'dialog_building_done',
  },
  {
    id: 'dialog_building_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.dialog_building_done',
    expression: 'happy',
    next: 'dialog_vehicle',
  },

  // === Vehicle Choice ===
  {
    id: 'dialog_vehicle',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.dialog_vehicle',
    expression: 'thinking',
    next: 'choice_vehicle',
  },
  {
    id: 'choice_vehicle',
    type: 'choice',
    speaker: 'mentor',
    promptKey: 'ch102.choice_vehicle.prompt',
    choices: [
      {
        labelKey: 'ch102.choice_vehicle.0',
        next: 'buy_vehicle',
        effects: {
          transaction: {
            entries: [
              { account: 'VEHICLES', debit: 2000 },
              { account: 'CHECKING_ACCOUNT', credit: 2000 },
            ],
          },
          setFlags: { vehicleOwned: true, leased: false },
        },
      },
      {
        labelKey: 'ch102.choice_vehicle.1',
        next: 'lease_vehicle',
        effects: {
          transaction: {
            entries: [
              { account: 'RENT_EXPENSE', debit: 200 },
              { account: 'CHECKING_ACCOUNT', credit: 200 },
            ],
          },
          setFlags: { vehicleOwned: false, leased: true },
        },
      },
    ],
  },
  {
    id: 'buy_vehicle',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.buy_vehicle',
    expression: 'happy',
    next: 'dialog_prepaid',
  },
  {
    id: 'lease_vehicle',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.lease_vehicle',
    expression: 'normal',
    next: 'dialog_prepaid',
  },

  // === Prepaid Payment for Supplies ===
  {
    id: 'dialog_prepaid',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.dialog_prepaid',
    expression: 'thinking',
    next: 'supplier_enter',
  },
  {
    id: 'supplier_enter',
    type: 'character_enter',
    character: 'supplier',
    position: 'left',
    expression: 'normal',
    next: 'dialog_supplier_1',
  },
  {
    id: 'dialog_supplier_1',
    type: 'dialog',
    speaker: 'supplier',
    textKey: 'ch102.dialog_supplier_1',
    expression: 'happy',
    next: 'prepaid',
  },
  {
    id: 'prepaid',
    type: 'transaction',
    descriptionKey: 'ch102.prepaid.desc',
    entries: [
      { account: 'PREPAID_PAYMENTS', debit: 500 },
      { account: 'CHECKING_ACCOUNT', credit: 500 },
    ],
    showAnimation: true,
    next: 'dialog_prepaid_done',
  },
  {
    id: 'dialog_prepaid_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.dialog_prepaid_done',
    expression: 'normal',
    next: 'dialog_advertising',
  },

  // === Advertising Expense ===
  {
    id: 'dialog_advertising',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.dialog_advertising',
    expression: 'thinking',
    next: 'advertising',
  },
  {
    id: 'advertising',
    type: 'transaction',
    descriptionKey: 'ch102.advertising.desc',
    entries: [
      { account: 'ADVERTISING_EXPENSE', debit: 300 },
      { account: 'CHECKING_ACCOUNT', credit: 300 },
    ],
    showAnimation: true,
    next: 'dialog_advertising_done',
  },
  {
    id: 'dialog_advertising_done',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.dialog_advertising_done',
    expression: 'happy',
    next: 'dialog_unpaid_bill',
  },

  // === Unpaid Renovation Bill ===
  {
    id: 'dialog_unpaid_bill',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.dialog_unpaid_bill',
    expression: 'thinking',
    next: 'dialog_unpaid_bill_2',
  },
  {
    id: 'dialog_unpaid_bill_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.dialog_unpaid_bill_2',
    expression: 'normal',
    next: 'unpaid_bill',
  },
  {
    id: 'unpaid_bill',
    type: 'transaction',
    descriptionKey: 'ch102.unpaid_bill.desc',
    entries: [
      { account: 'BUILDINGS', debit: 500 },
      { account: 'ACCOUNTS_PAYABLE_OTHER', credit: 500 },
    ],
    showAnimation: true,
    next: 'supplier_exit',
  },
  {
    id: 'supplier_exit',
    type: 'character_exit',
    character: 'supplier',
    next: 'show_bs',
  },

  // === Balance Sheet ===
  {
    id: 'show_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch102.show_bs.msg',
    next: 'quiz_1',
  },

  // === Quiz ===
  {
    id: 'quiz_1',
    type: 'quiz',
    questionKey: 'ch102.quiz_1.question',
    options: [
      { labelKey: 'ch102.quiz_1.option_0' },
      { labelKey: 'ch102.quiz_1.option_1' },
      { labelKey: 'ch102.quiz_1.option_2' },
    ],
    correctIndex: 1,
    correctFeedbackKey: 'ch102.quiz_1.correct',
    incorrectFeedbackKey: 'ch102.quiz_1.incorrect',
    expReward: 10,
    next: 'dialog_summary',
  },

  // === Summary ===
  {
    id: 'dialog_summary',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.dialog_summary',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_end_final',
  },
  {
    id: 'dialog_end_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch102.dialog_end_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 103,
    summaryKey: 'ch102.chapter_end.summary',
  },
];

export const chapter102: ChapterScript = {
  id: 102,
  titleKey: 'ch102.title',
  subtitleKey: 'ch102.subtitle',
  nodes,
};
