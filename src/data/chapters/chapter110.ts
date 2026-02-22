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
    textKey: 'ch110.dialog_intro_1',
    expression: 'normal',
    next: 'dialog_intro_2',
  },

  // === Equipment Disposal ===
  {
    id: 'dialog_intro_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_intro_2',
    expression: 'thinking',
    next: 'dialog_book_value',
  },
  {
    id: 'dialog_book_value',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_book_value',
    expression: 'normal',
    next: 'choice_sell_price',
  },
  {
    id: 'choice_sell_price',
    type: 'choice',
    speaker: 'mentor',
    promptKey: 'ch110.choice_sell_price.prompt',
    choices: [
      {
        labelKey: 'ch110.choice_sell_price.gain',
        next: 'sell_gain',
        effects: {
          setFlags: { sellPrice: 1200, sellResult: 'gain' },
        },
      },
      {
        labelKey: 'ch110.choice_sell_price.loss',
        next: 'sell_loss',
        effects: {
          setFlags: { sellPrice: 800, sellResult: 'loss' },
        },
      },
    ],
  },

  // === Sell at Gain ===
  {
    id: 'sell_gain',
    type: 'transaction',
    descriptionKey: 'ch110.sell_gain.desc',
    entries: [
      { account: 'CHECKING_ACCOUNT', debit: 1200 },
      { account: 'ACCUMULATED_DEPRECIATION', debit: 2000 },
      { account: 'EQUIPMENT', credit: 3000 },
      { account: 'GAIN_ON_SALE_OF_FIXED_ASSETS', credit: 200 },
    ],
    showAnimation: true,
    next: 'dialog_gain_explain',
  },
  {
    id: 'dialog_gain_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_gain_explain',
    expression: 'happy',
    next: 'dialog_gain_detail',
  },
  {
    id: 'dialog_gain_detail',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_gain_detail',
    expression: 'normal',
    next: 'dialog_insurance_intro',
  },

  // === Sell at Loss ===
  {
    id: 'sell_loss',
    type: 'transaction',
    descriptionKey: 'ch110.sell_loss.desc',
    entries: [
      { account: 'CHECKING_ACCOUNT', debit: 800 },
      { account: 'ACCUMULATED_DEPRECIATION', debit: 2000 },
      { account: 'LOSS_ON_SALE_OF_FIXED_ASSETS', debit: 200 },
      { account: 'EQUIPMENT', credit: 3000 },
    ],
    showAnimation: true,
    next: 'dialog_loss_explain',
  },
  {
    id: 'dialog_loss_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_loss_explain',
    expression: 'sad',
    next: 'dialog_loss_detail',
  },
  {
    id: 'dialog_loss_detail',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_loss_detail',
    expression: 'normal',
    next: 'dialog_insurance_intro',
  },

  // === Insurance ===
  {
    id: 'dialog_insurance_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_insurance_intro',
    expression: 'normal',
    next: 'dialog_insurance_explain',
  },
  {
    id: 'dialog_insurance_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_insurance_explain',
    expression: 'thinking',
    next: 'pay_insurance',
  },
  {
    id: 'pay_insurance',
    type: 'transaction',
    descriptionKey: 'ch110.pay_insurance.desc',
    entries: [
      { account: 'INSURANCE_EXPENSE', debit: 600 },
      { account: 'CHECKING_ACCOUNT', credit: 600 },
    ],
    showAnimation: true,
    next: 'dialog_insurance_after',
  },
  {
    id: 'dialog_insurance_after',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_insurance_after',
    expression: 'normal',
    next: 'dialog_supplies_intro',
  },

  // === Supplies Inventory ===
  {
    id: 'dialog_supplies_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_supplies_intro',
    expression: 'normal',
    next: 'dialog_supplies_explain',
  },
  {
    id: 'dialog_supplies_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_supplies_explain',
    expression: 'thinking',
    next: 'supplies_inventory',
  },
  {
    id: 'supplies_inventory',
    type: 'transaction',
    descriptionKey: 'ch110.supplies_inventory.desc',
    entries: [
      { account: 'SUPPLIES_INVENTORY', debit: 50 },
      { account: 'COMMUNICATION_EXPENSE', credit: 50 },
    ],
    showAnimation: true,
    next: 'dialog_supplies_after',
  },
  {
    id: 'dialog_supplies_after',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_supplies_after',
    expression: 'normal',
    next: 'dialog_repair_intro',
  },

  // === Repair Expense ===
  {
    id: 'dialog_repair_intro',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_repair_intro',
    expression: 'normal',
    next: 'repair_expense',
  },
  {
    id: 'repair_expense',
    type: 'transaction',
    descriptionKey: 'ch110.repair_expense.desc',
    entries: [
      { account: 'REPAIR_EXPENSE', debit: 200 },
      { account: 'CHECKING_ACCOUNT', credit: 200 },
    ],
    showAnimation: true,
    next: 'dialog_repair_after',
  },
  {
    id: 'dialog_repair_after',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_repair_after',
    expression: 'normal',
    next: 'quiz_disposal',
  },

  // === Quiz ===
  {
    id: 'quiz_disposal',
    type: 'quiz',
    questionKey: 'ch110.quiz_disposal.question',
    options: [
      { labelKey: 'ch110.quiz_disposal.option_0' },
      { labelKey: 'ch110.quiz_disposal.option_1' },
      { labelKey: 'ch110.quiz_disposal.option_2' },
    ],
    correctIndex: 1,
    correctFeedbackKey: 'ch110.quiz_disposal.correct',
    incorrectFeedbackKey: 'ch110.quiz_disposal.incorrect',
    expReward: 20,
    next: 'dialog_summary_1',
  },

  // === Summary ===
  {
    id: 'dialog_summary_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_summary_1',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_summary_3',
  },
  {
    id: 'dialog_summary_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch110.dialog_summary_3',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 111,
    summaryKey: 'ch110.chapter_end.summary',
  },
];

export const chapter110: ChapterScript = {
  id: 110,
  titleKey: 'ch110.title',
  subtitleKey: 'ch110.subtitle',
  nodes,
};
