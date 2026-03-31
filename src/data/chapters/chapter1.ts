import { ChapterScript, ScriptNode } from '../../vn/types';

const nodes: ScriptNode[] = [
  // === Opening ===
  {
    id: 'start',
    type: 'background',
    background: 'home',
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
    textKey: 'ch1.dialog_1',
    expression: 'happy',
    next: 'dialog_2',
  },
  {
    id: 'dialog_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_2',
    expression: 'normal',
    next: 'dialog_3',
  },
  {
    id: 'dialog_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_3',
    expression: 'thinking',
    next: 'dialog_4',
  },
  {
    id: 'dialog_4',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_4',
    expression: 'normal',
    next: 'dialog_5',
  },
  {
    id: 'dialog_5',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_5',
    expression: 'happy',
    next: 'choice_investment',
  },

  // === Initial Investment Choice ===
  {
    id: 'choice_investment',
    type: 'choice',
    speaker: 'mentor',
    promptKey: 'ch1.choice_investment.prompt',
    choices: [
      {
        labelKey: 'ch1.choice_investment.0',
        next: 'invest_500',
        effects: {
          transaction: {
            entries: [
              { account: 'CASH', debit: 500 },
              { account: 'OWNERS_CAPITAL', credit: 500 },
            ],
          },
          setFlags: { investmentAmount: 500 },
        },
      },
      {
        labelKey: 'ch1.choice_investment.1',
        next: 'invest_1000',
        effects: {
          transaction: {
            entries: [
              { account: 'CASH', debit: 1000 },
              { account: 'OWNERS_CAPITAL', credit: 1000 },
            ],
          },
          setFlags: { investmentAmount: 1000 },
        },
      },
    ],
  },

  // === Investment Result (500) ===
  {
    id: 'invest_500',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.invest_500',
    expression: 'happy',
    next: 'show_first_bs',
  },

  // === Investment Result (1000) ===
  {
    id: 'invest_1000',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.invest_1000',
    expression: 'surprised',
    next: 'show_first_bs',
  },

  // === First Balance Sheet ===
  {
    id: 'show_first_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch1.show_first_bs.msg',
    next: 'dialog_bs_explain',
  },
  {
    id: 'dialog_bs_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_bs_explain',
    expression: 'happy',
    next: 'transition_to_shop',
  },

  // === Go to Supply Shop ===
  {
    id: 'transition_to_shop',
    type: 'background',
    background: 'supply_shop',
    next: 'supplier_enter',
  },
  {
    id: 'supplier_enter',
    type: 'character_enter',
    character: 'supplier',
    position: 'left',
    expression: 'normal',
    next: 'dialog_shop_1',
  },
  {
    id: 'dialog_shop_1',
    type: 'dialog',
    speaker: 'supplier',
    textKey: 'ch1.dialog_shop_1',
    expression: 'happy',
    next: 'dialog_shop_2',
  },
  {
    id: 'dialog_shop_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_shop_2',
    expression: 'thinking',
    next: 'choice_supplies',
  },

  // === Buy Supplies Choice ===
  {
    id: 'choice_supplies',
    type: 'choice',
    promptKey: 'ch1.choice_supplies.prompt',
    choices: [
      {
        labelKey: 'ch1.choice_supplies.0',
        next: 'buy_200',
        effects: {
          setFlags: { supplyCost: 200 },
        },
      },
      {
        labelKey: 'ch1.choice_supplies.1',
        next: 'buy_350',
        effects: {
          setFlags: { supplyCost: 350 },
        },
      },
    ],
  },
  {
    id: 'buy_200',
    type: 'transaction',
    descriptionKey: 'ch1.buy_200.desc',
    entries: [
      { account: 'INVENTORY', debit: 200 },
      { account: 'CASH', credit: 200 },
    ],
    showAnimation: true,
    next: 'after_buy',
  },
  {
    id: 'buy_350',
    type: 'transaction',
    descriptionKey: 'ch1.buy_350.desc',
    entries: [
      { account: 'INVENTORY', debit: 350 },
      { account: 'CASH', credit: 350 },
    ],
    showAnimation: true,
    next: 'after_buy',
  },
  {
    id: 'after_buy',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.after_buy',
    expression: 'happy',
    next: 'show_bs_after_buy',
  },
  {
    id: 'show_bs_after_buy',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch1.show_bs_after_buy.msg',
    next: 'supplier_exit',
  },
  {
    id: 'supplier_exit',
    type: 'character_exit',
    character: 'supplier',
    next: 'transition_to_stand',
  },

  // === First Sales ===
  {
    id: 'transition_to_stand',
    type: 'background',
    background: 'lemonade_stand',
    next: 'customer_enter',
  },
  {
    id: 'customer_enter',
    type: 'character_enter',
    character: 'customer',
    position: 'left',
    expression: 'happy',
    next: 'dialog_sale_1',
  },
  {
    id: 'dialog_sale_1',
    type: 'dialog',
    speaker: 'customer',
    textKey: 'ch1.dialog_sale_1',
    expression: 'happy',
    next: 'dialog_sale_2',
  },
  {
    id: 'dialog_sale_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_sale_2',
    expression: 'normal',
    next: 'choice_sale_price',
  },

  // === Sale Price Choice ===
  {
    id: 'choice_sale_price',
    type: 'choice',
    promptKey: 'ch1.choice_sale_price.prompt',
    choices: [
      {
        labelKey: 'ch1.choice_sale_price.0',
        next: 'sale_100',
        effects: {
          setFlags: { salePrice: 100, profit: 50 },
        },
      },
      {
        labelKey: 'ch1.choice_sale_price.1',
        next: 'sale_150',
        effects: {
          setFlags: { salePrice: 150, profit: 100 },
        },
      },
    ],
  },

  // === Record Sale (100) ===
  {
    id: 'sale_100',
    type: 'transaction',
    descriptionKey: 'ch1.sale_100.desc',
    entries: [
      { account: 'CASH', debit: 100 },
      { account: 'SALES_REVENUE', credit: 100 },
    ],
    showAnimation: true,
    next: 'sale_cogs_100',
  },
  {
    id: 'sale_cogs_100',
    type: 'transaction',
    descriptionKey: 'ch1.sale_cogs_100.desc',
    entries: [
      { account: 'COST_OF_GOODS_SOLD', debit: 50 },
      { account: 'INVENTORY', credit: 50 },
    ],
    showAnimation: true,
    next: 'after_sale',
  },

  // === Record Sale (150) ===
  {
    id: 'sale_150',
    type: 'transaction',
    descriptionKey: 'ch1.sale_150.desc',
    entries: [
      { account: 'CASH', debit: 150 },
      { account: 'SALES_REVENUE', credit: 150 },
    ],
    showAnimation: true,
    next: 'sale_cogs_150',
  },
  {
    id: 'sale_cogs_150',
    type: 'transaction',
    descriptionKey: 'ch1.sale_cogs_150.desc',
    entries: [
      { account: 'COST_OF_GOODS_SOLD', debit: 50 },
      { account: 'INVENTORY', credit: 50 },
    ],
    showAnimation: true,
    next: 'after_sale',
  },

  // === After First Sale ===
  {
    id: 'after_sale',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.after_sale',
    expression: 'happy',
    next: 'dialog_sale_explain_1',
  },
  {
    id: 'dialog_sale_explain_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_sale_explain_1',
    expression: 'thinking',
    next: 'dialog_sale_explain_2',
  },
  {
    id: 'dialog_sale_explain_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_sale_explain_2',
    expression: 'normal',
    next: 'customer_exit',
  },
  {
    id: 'customer_exit',
    type: 'character_exit',
    character: 'customer',
    next: 'more_sales',
  },

  // === More Sales ===
  {
    id: 'more_sales',
    type: 'narration',
    textKey: 'ch1.more_sales',
    next: 'batch_sale',
  },
  {
    id: 'batch_sale',
    type: 'transaction',
    descriptionKey: 'ch1.batch_sale.desc',
    entries: [
      { account: 'CASH', debit: 300 },
      { account: 'SALES_REVENUE', credit: 300 },
    ],
    showAnimation: false,
    next: 'batch_cogs',
  },
  {
    id: 'batch_cogs',
    type: 'transaction',
    descriptionKey: 'ch1.batch_cogs.desc',
    entries: [
      { account: 'COST_OF_GOODS_SOLD', debit: 150 },
      { account: 'INVENTORY', credit: 150 },
    ],
    showAnimation: false,
    next: 'show_first_pl',
  },
  {
    id: 'show_first_pl',
    type: 'report',
    reportType: 'income_statement',
    messageKey: 'ch1.show_first_pl.msg',
    next: 'dialog_pl_explain',
  },
  {
    id: 'dialog_pl_explain',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_pl_explain',
    expression: 'thinking',
    next: 'end_of_day',
  },

  // === End of Day ===
  {
    id: 'end_of_day',
    type: 'background',
    background: 'home',
    next: 'mentor_reenter',
  },
  {
    id: 'mentor_reenter',
    type: 'character_enter',
    character: 'mentor',
    position: 'right',
    expression: 'happy',
    next: 'dialog_end_1',
  },
  {
    id: 'dialog_end_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_end_1',
    expression: 'happy',
    next: 'show_final_bs',
  },
  {
    id: 'show_final_bs',
    type: 'report',
    reportType: 'balance_sheet',
    messageKey: 'ch1.show_final_bs.msg',
    next: 'dialog_bs_pl_link_1',
  },
  {
    id: 'dialog_bs_pl_link_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_bs_pl_link_1',
    expression: 'thinking',
    next: 'dialog_bs_pl_link_2',
  },
  {
    id: 'dialog_bs_pl_link_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_bs_pl_link_2',
    expression: 'normal',
    next: 'dialog_end_2',
  },
  {
    id: 'dialog_end_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_end_2',
    expression: 'normal',
    next: 'dialog_summary_1',
  },
  {
    id: 'dialog_summary_1',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_summary_1',
    expression: 'normal',
    next: 'dialog_summary_2',
  },
  {
    id: 'dialog_summary_2',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_summary_2',
    expression: 'normal',
    next: 'dialog_summary_3',
  },
  {
    id: 'dialog_summary_3',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_summary_3',
    expression: 'normal',
    next: 'dialog_summary_4',
  },
  {
    id: 'dialog_summary_4',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_summary_4',
    expression: 'normal',
    next: 'dialog_end_final',
  },
  {
    id: 'dialog_end_final',
    type: 'dialog',
    speaker: 'mentor',
    textKey: 'ch1.dialog_end_final',
    expression: 'happy',
    next: 'chapter_end',
  },

  // === Chapter End ===
  {
    id: 'chapter_end',
    type: 'chapter_end',
    nextChapter: 2,
    summaryKey: 'ch1.chapter_end.summary',
  },
];

export const chapter1: ChapterScript = {
  id: 1,
  titleKey: 'ch1.title',
  subtitleKey: 'ch1.subtitle',
  nodes,
};
